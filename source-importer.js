import { extractLecture as extractHtmlLecture, getUploadPolicy } from "./extractor-v2.js";
import { createFallbackPlan } from "./fallback-plan.js";

const BATCH_CHARS = 110_000;
const PDF_RENDER_MAX_WIDTH = 1400;
const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
const xml = (value) => new DOMParser().parseFromString(value, "application/xml");
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true });
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

function webMimeFromPath(path) {
  const ext = path.split(".").pop()?.toLowerCase();
  return ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp" })[ext] || null;
}

async function asDataUrl(zipEntry, path) {
  const mime = webMimeFromPath(path);
  if (!mime) return null;
  return `data:${mime};base64,${await zipEntry.async("base64")}`;
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
  const text = clean(result.map((item) => item.text).join(""));
  return { text, runs: result };
}

function extractSlideText(slideDoc, slideNumber) {
  const shapes = [...slideDoc.getElementsByTagNameNS("*", "sp")];
  let title = "";
  const body = [];
  const units = [];
  let order = 0;

  for (const shape of shapes) {
    const paragraphs = [...shape.getElementsByTagNameNS("*", "p")].map(paragraphRuns).filter((item) => item.text);
    if (!paragraphs.length) continue;
    const placeholder = shape.getElementsByTagNameNS("*", "ph")[0]?.getAttribute("type") || "";
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
  return { title, body: body.filter((value) => value !== title), units };
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
  const mediaIds = new Map();
  const sections = [];
  const sourceUnits = [];
  const unsupportedAssets = [];

  for (let index = 0; index < slidePaths.length; index += 1) {
    onProgress(`Reading slide ${index + 1} of ${slidePaths.length}…`);
    const slidePath = slidePaths[index];
    const slideEntry = zip.file(slidePath);
    if (!slideEntry) continue;
    const slideDoc = xml(await slideEntry.async("text"));
    const { title, body, units } = extractSlideText(slideDoc, index + 1);
    sourceUnits.push(...units);
    const relPath = slidePath.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
    const relEntry = zip.file(relPath);
    const rels = relEntry ? xml(await relEntry.async("text")) : null;
    const relMap = new Map(rels ? [...rels.getElementsByTagNameNS("*", "Relationship")].map((node) => [node.getAttribute("Id"), node.getAttribute("Target")]) : []);
    const slideAssets = [];

    for (const blip of [...slideDoc.getElementsByTagNameNS("*", "blip")]) {
      const rid = blip.getAttribute("r:embed") || blip.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "embed");
      const target = relMap.get(rid);
      if (!target || !target.includes("media/")) continue;
      const mediaPath = `ppt/${target.replace(/^\.\.\//, "")}`;
      if (mediaIds.has(mediaPath)) {
        slideAssets.push(mediaIds.get(mediaPath));
        continue;
      }
      const entry = zip.file(mediaPath);
      if (!entry) continue;
      const id = `image-${String(assets.length + unsupportedAssets.length + 1).padStart(3, "0")}`;
      const source = await asDataUrl(entry, mediaPath);
      if (!source) {
        unsupportedAssets.push({ id, mediaPath, reason: "unsupported-image-format" });
        continue;
      }
      mediaIds.set(mediaPath, id);
      assets.push({ id, type: "image", source, sourceKind: "embedded", alt: `${title} image`, caption: "", sourcePage: index + 1 });
      slideAssets.push(id);
    }
    sections.push({ title, body, assets: [...new Set(slideAssets)] });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const warnings = [];
  if (unsupportedAssets.length) warnings.push(`${unsupportedAssets.length} PowerPoint visual${unsupportedAssets.length === 1 ? "" : "s"} use unsupported EMF/WMF or other non-browser formats and require conversion before verified export.`);
  const rawContent = sections.map((section) => {
    const imageMarkers = section.assets.map((id) => `[ASSET:${id}]`).join("\n\n");
    return `# ${section.title}\n\n${section.body.join("\n\n")}${imageMarkers ? `\n\n${imageMarkers}` : ""}`;
  }).join("\n\n");
  const finalized = finalizeContent(rawContent);
  return {
    title: sections[0]?.title || file.name.replace(/\.pptx$/i, ""),
    content: finalized.content,
    batches: finalized.batches,
    assets,
    sourceUnits,
    warnings,
    extractionStatus: unsupportedAssets.length ? "incomplete" : "verified-native",
    verificationIssues: unsupportedAssets,
    stats: { originalBytes: file.size, nodeCount: sections.length, originalExtractedChars: finalized.originalExtractedChars, extractedChars: finalized.content.length, batchCount: finalized.batches.length, assetCount: assets.length, imageCount: assets.length, diagramCount: 0, truncated: false, ocrRequiredPages: 0 },
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
    const x = Number(transform[4] || 0); const y = Number(transform[5] || 0);
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
  const scale = Math.min(1.75, PDF_RENDER_MAX_WIDTH / Math.max(Number(baseViewport?.width) || 1, 1));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(Number(viewport?.width) || 1)); canvas.height = Math.max(1, Math.ceil(Number(viewport?.height) || 1));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return null;
  const renderTask = page.render({ canvasContext: context, viewport });
  if (renderTask?.promise) await renderTask.promise;
  const source = canvas.toDataURL("image/jpeg", 0.82); canvas.width = 1; canvas.height = 1;
  return { id: `pdf-page-${String(pageNumber).padStart(3, "0")}`, type: "image", source, sourceKind: "page-snapshot", alt: `${title} — page ${pageNumber}`, caption: `Source PDF page ${pageNumber}`, sourcePage: pageNumber };
}

async function destroyPdf(pdf, loadingTask) {
  try { if (typeof loadingTask?.destroy === "function") await loadingTask.destroy(); if (typeof pdf?.cleanup === "function") pdf.cleanup(); if (typeof pdf?.destroy === "function") await pdf.destroy(); } catch (error) { console.warn("PDF cleanup failed", error); }
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
  const assets = []; const sections = []; const sourceUnits = []; const warnings = []; const ocrRequiredPages = []; let snapshotFailures = 0; let documentTitle = file.name.replace(/\.pdf$/i, "");
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
        if (!pageText || pageText.length < 24) ocrRequiredPages.push(pageNumber);
        if (visual || pageText.length < 120) {
          try { const asset = await renderPdfPage(page, pageNumber, title); if (asset) { assets.push(asset); pageAssets.push(asset.id); } } catch { snapshotFailures += 1; }
        }
        sections.push({ title, body, assets: pageAssets });
      } finally { try { page?.cleanup?.(); } catch {} }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally { await destroyPdf(pdf, loadingTask); }
  if (ocrRequiredPages.length) warnings.push(`OCR is required for PDF page${ocrRequiredPages.length === 1 ? "" : "s"} ${ocrRequiredPages.join(", ")}; native text extraction was empty or too sparse.`);
  if (snapshotFailures) warnings.push(`${snapshotFailures} PDF page snapshot${snapshotFailures === 1 ? "" : "s"} could not be rendered.`);
  const rawContent = sections.map((section, index) => { const imageMarkers = section.assets.map((id) => `[ASSET:${id}]`).join("\n\n"); return `# ${section.title || `Page ${index + 1}`}\n\n${section.body.join("\n\n")}${imageMarkers ? `\n\n${imageMarkers}` : ""}`; }).join("\n\n");
  const finalized = finalizeContent(rawContent);
  return {
    title: documentTitle, content: finalized.content, batches: finalized.batches, assets, sourceUnits, warnings,
    extractionStatus: ocrRequiredPages.length ? "ocr-required" : "verified-native",
    verificationIssues: ocrRequiredPages.map((page) => ({ type: "ocr-required", page })),
    stats: { originalBytes: file.size, nodeCount: sections.length, originalExtractedChars: finalized.originalExtractedChars, extractedChars: finalized.content.length, batchCount: finalized.batches.length, assetCount: assets.length, imageCount: assets.length, diagramCount: 0, truncated: false, ocrRequiredPages: ocrRequiredPages.length },
  };
}

export async function extractLecture(file, onProgress = () => {}) {
  if (!(file instanceof File)) throw new Error("Please choose a lecture file.");
  if (/\.pptx$/i.test(file.name) || /presentationml/i.test(file.type)) return extractPptx(file, onProgress);
  if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") return extractPdf(file, onProgress);
  if (/\.html?$/i.test(file.name) || /html/i.test(file.type)) {
    const result = await extractHtmlLecture(file, onProgress);
    return { ...result, sourceUnits: result.sourceUnits || [], extractionStatus: result.extractionStatus || "verified-native", verificationIssues: result.verificationIssues || [], stats: { ...result.stats, truncated: false, ocrRequiredPages: 0 } };
  }
  throw new Error("Supported lecture formats are PPTX, PDF, HTML, and HTM. DOCX, audio, video, and other formats require dedicated conversion or transcription services.");
}

export { createFallbackPlan, getUploadPolicy };
