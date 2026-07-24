import { extractLecture as extractHtmlLecture, getUploadPolicy } from "./extractor-v2.js";
import { createFallbackPlan } from "./fallback-plan.js";

const BATCH_CHARS = 110_000;
const PDF_RENDER_MAX_WIDTH = 1200;
const PDF_OCR_THRESHOLD = 24;
const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
const xml = (value) => new DOMParser().parseFromString(value, "application/xml");
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true });
const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
let pdfJsPromise;

function splitBatches(content) {
  const batches = [];
  let remaining = String(content || "");
  while (remaining.length) {
    if (remaining.length <= BATCH_CHARS) {
      if (remaining.trim()) batches.push(remaining.trim());
      break;
    }
    let cut = remaining.lastIndexOf("\n\n", BATCH_CHARS);
    if (cut < BATCH_CHARS * 0.55) cut = remaining.lastIndexOf("\n", BATCH_CHARS);
    if (cut < BATCH_CHARS * 0.55) cut = remaining.lastIndexOf(" ", BATCH_CHARS);
    if (cut < 1) cut = BATCH_CHARS;
    const chunk = remaining.slice(0, cut).trim();
    if (chunk) batches.push(chunk);
    remaining = remaining.slice(cut).trimStart();
  }
  return batches;
}

function finalizeContent(content) {
  const value = String(content || "");
  return { content: value, batches: splitBatches(value), originalExtractedChars: value.length, truncated: false };
}

function buildRawContent(sections) {
  return sections.map((section, index) => {
    const imageMarkers = (section.assets || []).map((id) => `[ASSET:${id}]`).join("\n\n");
    const body = Array.isArray(section.body) ? section.body.join("\n\n") : "";
    return `# ${section.title || `Page ${index + 1}`}\n\n${body}${imageMarkers ? `\n\n${imageMarkers}` : ""}`;
  }).join("\n\n");
}

function webMimeFromPath(path) {
  const ext = path.split(".").pop()?.toLowerCase();
  return ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp" })[ext] || null;
}

async function asDataUrl(zipEntry, path) {
  const mime = webMimeFromPath(path);
  if (!mime) return null;
  return `data:${mime};base64,${await zipEntry.async("base64")}`;
}

function pptTargetPath(target) {
  const value = String(target || "").replace(/\\/g, "/");
  if (!value) return "";
  if (value.startsWith("/")) return value.slice(1);
  if (value.startsWith("../")) return `ppt/${value.replace(/^\.\.\//, "")}`;
  return `ppt/slides/${value}`.replace(/\/\.\//g, "/");
}

function runColor(runNode) {
  const solid = runNode?.getElementsByTagNameNS("*", "solidFill")?.[0];
  const srgb = solid?.getElementsByTagNameNS("*", "srgbClr")?.[0]?.getAttribute("val");
  return srgb ? srgb.toUpperCase() : null;
}

function runHighlight(runNode) {
  const node = runNode?.getElementsByTagNameNS("*", "highlight")?.[0];
  const srgb = node?.getElementsByTagNameNS("*", "srgbClr")?.[0]?.getAttribute("val");
  return srgb ? srgb.toUpperCase() : null;
}

function paragraphRuns(node) {
  const result = [];
  for (const run of [...node.children].filter((child) => ["r", "fld"].includes(child.localName))) {
    const value = [...run.getElementsByTagNameNS("*", "t")].map((item) => item.textContent || "").join("");
    if (!value) continue;
    const props = run.getElementsByTagNameNS("*", "rPr")[0];
    result.push({
      text: value,
      bold: props?.getAttribute("b") === "1",
      italic: props?.getAttribute("i") === "1",
      underline: Boolean(props?.getAttribute("u") && props.getAttribute("u") !== "none"),
      color: runColor(props),
      highlight: runHighlight(props),
    });
  }
  const value = clean(result.map((item) => item.text).join(""));
  return { text: value, runs: result };
}

function extractSlideText(slideDoc, slideNumber) {
  const shapes = [...slideDoc.getElementsByTagNameNS("*", "sp")];
  let title = "";
  const body = [];
  const units = [];
  let order = 0;
  for (const shapeNode of shapes) {
    const paragraphs = [...shapeNode.getElementsByTagNameNS("*", "p")].map(paragraphRuns).filter((item) => item.text);
    if (!paragraphs.length) continue;
    const placeholder = shapeNode.getElementsByTagNameNS("*", "ph")[0]?.getAttribute("type") || "";
    for (const paragraph of paragraphs) {
      order += 1;
      units.push({ page: slideNumber, order, kind: "paragraph", text: paragraph.text, runs: paragraph.runs, extractionMethod: "native", confidence: 1 });
    }
    if (!title && ["title", "ctrTitle", "subTitle"].includes(placeholder)) title = clean(paragraphs.map((item) => item.text).join(" "));
    else body.push(...paragraphs.map((item) => item.text));
  }
  if (!title) {
    title = units[0]?.text || `Slide ${slideNumber}`;
    if (!body.length) body.push(...units.slice(1).map((item) => item.text));
  }
  return { title, body: body.filter((value) => value !== title), units, nextOrder: order };
}

function extractSlideTables(slideDoc, slideNumber, startOrder) {
  const units = [];
  const body = [];
  let order = startOrder;
  for (const table of [...slideDoc.getElementsByTagNameNS("*", "tbl")]) {
    const rows = [...table.getElementsByTagNameNS("*", "tr")].map((row) => [...row.getElementsByTagNameNS("*", "tc")].map((cell) => clean([...cell.getElementsByTagNameNS("*", "t")].map((node) => node.textContent || "").join(" "))));
    for (const row of rows) {
      const value = row.filter(Boolean).join(" | ");
      if (!value) continue;
      order += 1;
      units.push({ page: slideNumber, order, kind: "table", text: value, runs: [{ text: value }], extractionMethod: "native", confidence: 1 });
      body.push(value);
    }
  }
  return { units, body, nextOrder: order };
}

async function extractSlideDiagrams(zip, slideDoc, relMap, slideNumber, startOrder) {
  const units = [];
  const body = [];
  let order = startOrder;
  const relationIds = [...slideDoc.getElementsByTagNameNS("*", "relIds")];
  for (const relationNode of relationIds) {
    const relationId = relationNode.getAttribute("r:dm") || relationNode.getAttributeNS(REL_NS, "dm");
    const target = relMap.get(relationId);
    if (!target || !target.includes("diagrams/")) continue;
    const entry = zip.file(pptTargetPath(target));
    if (!entry) continue;
    const diagramDoc = xml(await entry.async("text"));
    const values = [...diagramDoc.getElementsByTagNameNS("*", "t")].map((node) => clean(node.textContent)).filter(Boolean);
    for (const value of values) {
      order += 1;
      units.push({ page: slideNumber, order, kind: "diagram", text: value, runs: [{ text: value }], extractionMethod: "native", confidence: 1 });
      body.push(value);
    }
  }
  return { units, body, nextOrder: order };
}

async function extractPptx(file, onProgress) {
  if (!globalThis.JSZip) throw new Error("PPTX support could not load. Refresh the page and try again.");
  const policy = getUploadPolicy();
  if (file.size > policy.maxBytes) throw new Error(`This device can safely process files up to ${policy.mobile ? "20" : "50"} MB.`);
  onProgress("Opening the PowerPoint package…");
  const zip = await globalThis.JSZip.loadAsync(await file.arrayBuffer());
  const slidePaths = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path)).sort(natural);
  if (!slidePaths.length) throw new Error("The selected PPTX does not contain readable slides.");

  const assets = [];
  const mediaSources = new Map();
  const sections = [];
  const sourceUnits = [];
  const unsupportedAssets = [];
  let diagramCount = 0;

  for (let index = 0; index < slidePaths.length; index += 1) {
    onProgress(`Reading slide ${index + 1} of ${slidePaths.length}…`);
    const slidePath = slidePaths[index];
    const slideEntry = zip.file(slidePath);
    if (!slideEntry) continue;
    const slideDoc = xml(await slideEntry.async("text"));
    const extracted = extractSlideText(slideDoc, index + 1);
    const relPath = slidePath.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
    const relEntry = zip.file(relPath);
    const rels = relEntry ? xml(await relEntry.async("text")) : null;
    const relMap = new Map(rels ? [...rels.getElementsByTagNameNS("*", "Relationship")].map((node) => [node.getAttribute("Id"), node.getAttribute("Target")]) : []);
    const tables = extractSlideTables(slideDoc, index + 1, extracted.nextOrder);
    const diagrams = await extractSlideDiagrams(zip, slideDoc, relMap, index + 1, tables.nextOrder);
    diagramCount += diagrams.units.length ? 1 : 0;
    sourceUnits.push(...extracted.units, ...tables.units, ...diagrams.units);
    const slideAssets = [];

    for (const blip of [...slideDoc.getElementsByTagNameNS("*", "blip")]) {
      const rid = blip.getAttribute("r:embed") || blip.getAttributeNS(REL_NS, "embed");
      const target = relMap.get(rid);
      if (!target || !target.includes("media/")) continue;
      const mediaPath = pptTargetPath(target);
      const entry = zip.file(mediaPath);
      if (!entry) continue;
      const id = `image-${String(assets.length + unsupportedAssets.length + 1).padStart(3, "0")}`;
      let source = mediaSources.get(mediaPath);
      if (source === undefined) {
        source = await asDataUrl(entry, mediaPath);
        mediaSources.set(mediaPath, source);
      }
      if (!source) {
        unsupportedAssets.push({ id, mediaPath, sourcePage: index + 1, reason: "unsupported-image-format" });
        continue;
      }
      assets.push({ id, type: "image", source, sourceKind: "embedded", alt: `${extracted.title} image`, caption: "", sourcePage: index + 1 });
      slideAssets.push(id);
    }

    const body = [...extracted.body];
    if (tables.body.length) body.push(`Source table:\n${tables.body.join("\n")}`);
    if (diagrams.body.length) body.push(`Source diagram:\n${diagrams.body.join("\n")}`);
    sections.push({ title: extracted.title, body, assets: slideAssets });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const warnings = [];
  if (unsupportedAssets.length) warnings.push(`${unsupportedAssets.length} PowerPoint visual${unsupportedAssets.length === 1 ? "" : "s"} use unsupported EMF/WMF or another non-browser format and require conversion before verified export.`);
  const finalized = finalizeContent(buildRawContent(sections));
  return {
    title: sections[0]?.title || file.name.replace(/\.pptx$/i, ""),
    content: finalized.content,
    batches: finalized.batches,
    assets,
    sourceUnits,
    sourcePages: sections.map((section, index) => ({ page: index + 1, title: section.title, assets: section.assets })),
    ocrPages: [],
    warnings,
    extractionStatus: unsupportedAssets.length ? "incomplete" : "verified-native",
    verificationIssues: unsupportedAssets,
    stats: { originalBytes: file.size, nodeCount: sections.length, originalExtractedChars: finalized.originalExtractedChars, extractedChars: finalized.content.length, batchCount: finalized.batches.length, assetCount: assets.length, imageCount: assets.length, diagramCount, truncated: false, ocrRequiredPages: 0 },
  };
}

async function loadPdfJs() {
  if (!pdfJsPromise) {
    pdfJsPromise = import("/vendor/pdf.min.mjs").then((pdfjs) => {
      if (pdfjs?.GlobalWorkerOptions) pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
      return pdfjs;
    }).catch((error) => { pdfJsPromise = null; throw error; });
  }
  return pdfJsPromise;
}

function pdfTextLines(items) {
  const rows = [];
  for (const item of Array.isArray(items) ? items : []) {
    const value = clean(item?.str);
    if (!value) continue;
    const transform = Array.isArray(item?.transform) ? item.transform : [];
    const x = Number(transform[4] || 0);
    const y = Number(transform[5] || 0);
    let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 3);
    if (!row) { row = { y, items: [] }; rows.push(row); }
    row.items.push({ x, value });
  }
  return rows.sort((a, b) => b.y - a.y).map((row) => clean(row.items.sort((a, b) => a.x - b.x).map((item) => item.value).join(" "))).filter(Boolean);
}

function pageHasVisualContent(pdfjs, operatorList) {
  const visualOps = new Set([pdfjs?.OPS?.paintImageXObject, pdfjs?.OPS?.paintImageXObjectRepeat, pdfjs?.OPS?.paintInlineImageXObject, pdfjs?.OPS?.paintInlineImageXObjectGroup, pdfjs?.OPS?.paintImageMaskXObject, pdfjs?.OPS?.paintImageMaskXObjectGroup].filter(Number.isFinite));
  return [...(operatorList?.fnArray || [])].some((operation) => visualOps.has(operation));
}

async function renderPdfPage(page, pageNumber, title) {
  if (typeof page?.getViewport !== "function" || typeof page?.render !== "function") return null;
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(1.6, PDF_RENDER_MAX_WIDTH / Math.max(Number(baseViewport?.width) || 1, 1));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(Number(viewport?.width) || 1));
  canvas.height = Math.max(1, Math.ceil(Number(viewport?.height) || 1));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return null;
  const renderTask = page.render({ canvasContext: context, viewport });
  if (renderTask?.promise) await renderTask.promise;
  const source = canvas.toDataURL("image/jpeg", 0.72);
  canvas.width = 1;
  canvas.height = 1;
  return { id: `pdf-page-${String(pageNumber).padStart(3, "0")}`, type: "image", source, sourceKind: "page-snapshot", alt: `${title} — page ${pageNumber}`, caption: `Source PDF page ${pageNumber}`, sourcePage: pageNumber };
}

async function destroyPdf(pdf, loadingTask) {
  try {
    if (typeof loadingTask?.destroy === "function") await loadingTask.destroy();
    if (typeof pdf?.cleanup === "function") pdf.cleanup();
    if (typeof pdf?.destroy === "function") await pdf.destroy();
  } catch (error) { console.warn("PDF cleanup failed", error); }
}

async function extractPdf(file, onProgress) {
  const policy = getUploadPolicy();
  if (file.size > policy.maxBytes) throw new Error(`This device can safely process files up to ${policy.mobile ? "20" : "50"} MB.`);
  const pdfjs = await loadPdfJs().catch(() => { throw new Error("PDF support could not load in this browser. Redeploy the latest build or refresh the page."); });
  onProgress("Opening the PDF document…");
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), cMapUrl: "/vendor/cmaps/", cMapPacked: true, standardFontDataUrl: "/vendor/standard_fonts/", wasmUrl: "/vendor/wasm/", disableFontFace: policy.mobile, useWorkerFetch: false, isEvalSupported: false });
  const pdf = await loadingTask.promise;
  const totalPages = Number(pdf?.numPages) || 0;
  if (!totalPages) throw new Error("The selected PDF does not contain readable pages.");
  const assets = [];
  const sections = [];
  const sourceUnits = [];
  const warnings = [];
  const ocrRequiredPages = [];
  const ocrPages = [];
  let snapshotFailures = 0;
  let documentTitle = file.name.replace(/\.pdf$/i, "");
  try {
    try { const metadata = await pdf.getMetadata?.(); documentTitle = clean(metadata?.info?.Title) || documentTitle; } catch {}
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      onProgress(`Reading PDF page ${pageNumber} of ${totalPages}…`);
      let page;
      try {
        page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const lines = pdfTextLines(textContent?.items);
        const pageText = lines.join(" ");
        const title = lines.find((line) => line.length >= 3) || `Page ${pageNumber}`;
        const body = lines.filter((line) => line !== title);
        lines.forEach((line, index) => sourceUnits.push({ page: pageNumber, order: index + 1, kind: "paragraph", text: line, runs: [{ text: line }], extractionMethod: "native", confidence: 1 }));
        const pageAssets = [];
        let visual = false;
        try { visual = typeof page.getOperatorList === "function" && pageHasVisualContent(pdfjs, await page.getOperatorList()); } catch {}
        const needsOcr = !pageText || pageText.length < PDF_OCR_THRESHOLD;
        if (needsOcr) ocrRequiredPages.push(pageNumber);
        if (visual || pageText.length < 120 || needsOcr) {
          try {
            const asset = await renderPdfPage(page, pageNumber, title);
            if (asset) {
              assets.push(asset);
              pageAssets.push(asset.id);
              if (needsOcr) ocrPages.push({ page: pageNumber, assetId: asset.id, imageData: asset.source });
            } else if (needsOcr) snapshotFailures += 1;
          } catch { snapshotFailures += 1; }
        }
        sections.push({ title, body, assets: pageAssets });
      } finally { try { page?.cleanup?.(); } catch {} }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally { await destroyPdf(pdf, loadingTask); }
  if (ocrRequiredPages.length) warnings.push(`OCR will be applied to PDF page${ocrRequiredPages.length === 1 ? "" : "s"} ${ocrRequiredPages.join(", ")} before the PowerPoint is built.`);
  if (snapshotFailures) warnings.push(`${snapshotFailures} required PDF page snapshot${snapshotFailures === 1 ? "" : "s"} could not be rendered.`);
  const finalized = finalizeContent(buildRawContent(sections));
  const issues = [
    ...ocrRequiredPages.map((page) => ({ type: "ocr-required", page })),
    ...(snapshotFailures ? [{ type: "snapshot-failure", count: snapshotFailures }] : []),
  ];
  return {
    title: documentTitle,
    content: finalized.content,
    batches: finalized.batches,
    assets,
    sourceUnits,
    sourcePages: sections.map((section, index) => ({ page: index + 1, title: section.title, assets: section.assets })),
    ocrPages,
    warnings,
    extractionStatus: issues.length ? "ocr-required" : "verified-native",
    verificationIssues: issues,
    stats: { originalBytes: file.size, nodeCount: sections.length, originalExtractedChars: finalized.originalExtractedChars, extractedChars: finalized.content.length, batchCount: finalized.batches.length, assetCount: assets.length, imageCount: assets.length, diagramCount: 0, truncated: false, ocrRequiredPages: ocrRequiredPages.length },
  };
}

export function applyOcrResults(extraction, results) {
  const expectedPages = (extraction?.verificationIssues || []).filter((issue) => issue?.type === "ocr-required").map((issue) => Number(issue.page)).filter(Number.isFinite);
  if (!expectedPages.length) return extraction;
  const resultMap = new Map((Array.isArray(results) ? results : []).map((item) => [Number(item?.page), item]));
  const missing = expectedPages.filter((page) => !clean(resultMap.get(page)?.text) && !(Array.isArray(resultMap.get(page)?.lines) && resultMap.get(page).lines.some((line) => clean(line))));
  if (missing.length) throw new Error(`OCR did not return readable text for PDF page${missing.length === 1 ? "" : "s"} ${missing.join(", ")}.`);
  const replaced = new Set(expectedPages);
  const sourceUnits = (extraction.sourceUnits || []).filter((unit) => !replaced.has(Number(unit.page)));
  for (const page of expectedPages) {
    const result = resultMap.get(page);
    const lines = (Array.isArray(result?.lines) && result.lines.length ? result.lines : String(result?.text || "").split(/\r?\n/)).map(clean).filter(Boolean);
    lines.forEach((line, index) => sourceUnits.push({ page, order: index + 1, kind: "paragraph", text: line, runs: [{ text: line }], extractionMethod: "ocr", confidence: Number.isFinite(result?.confidence) ? result.confidence : 0.9 }));
  }
  sourceUnits.sort((a, b) => Number(a.page) - Number(b.page) || Number(a.order) - Number(b.order));
  const sections = (extraction.sourcePages || []).map((record) => {
    const units = sourceUnits.filter((unit) => Number(unit.page) === Number(record.page));
    const title = units[0]?.text || record.title || `Page ${record.page}`;
    return { title, body: units.map((unit) => unit.text), assets: record.assets || [] };
  });
  const finalized = finalizeContent(buildRawContent(sections));
  const remainingIssues = (extraction.verificationIssues || []).filter((issue) => issue?.type !== "ocr-required");
  return {
    ...extraction,
    content: finalized.content,
    batches: finalized.batches,
    sourceUnits,
    ocrPages: [],
    warnings: [...(extraction.warnings || []).filter((warning) => !/^OCR (is required|will be applied)/i.test(warning)), `OCR applied to PDF page${expectedPages.length === 1 ? "" : "s"} ${expectedPages.join(", ")}.`],
    extractionStatus: remainingIssues.length ? "incomplete" : "verified-native",
    verificationIssues: remainingIssues,
    stats: { ...extraction.stats, originalExtractedChars: finalized.originalExtractedChars, extractedChars: finalized.content.length, batchCount: finalized.batches.length, nodeCount: sections.length, ocrRequiredPages: 0 },
  };
}

export async function extractLecture(file, onProgress = () => {}) {
  if (!(file instanceof File)) throw new Error("Please choose a lecture file.");
  if (/\.pptx$/i.test(file.name) || /presentationml/i.test(file.type)) return extractPptx(file, onProgress);
  if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") return extractPdf(file, onProgress);
  if (/\.html?$/i.test(file.name) || /html/i.test(file.type)) {
    const result = await extractHtmlLecture(file, onProgress);
    return { ...result, sourceUnits: result.sourceUnits || [], sourcePages: result.sourcePages || [], ocrPages: [], extractionStatus: result.extractionStatus || "verified-native", verificationIssues: result.verificationIssues || [], stats: { ...result.stats, truncated: false, ocrRequiredPages: 0 } };
  }
  throw new Error("Supported lecture formats are PPTX, PDF, HTML, and HTM. DOCX, audio, video, and other formats require dedicated conversion or transcription services.");
}

export { createFallbackPlan, getUploadPolicy };
