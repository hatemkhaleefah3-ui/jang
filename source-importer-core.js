import { extractLecture as extractHtmlLecture, getUploadPolicy } from "./extractor-v2.js";
import { createFallbackPlan } from "./fallback-plan.js";

const BATCH_CHARS = 110_000;
const PDF_RENDER_MAX_WIDTH = 1800;
const PDF_OCR_THRESHOLD = 24;
const VISUAL_MAX_WIDTH = 2400;
const VISUAL_MAX_HEIGHT = 1800;
const TESSERACT_MODULE_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.esm.min.js";
const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
const xml = (value) => new DOMParser().parseFromString(value, "application/xml");
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true });
const REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
let pdfJsPromise;
let emfConverterPromise;
let tesseractPromise;

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

function extensionFromPath(path) {
  return String(path || "").split(/[?#]/)[0].split(".").pop()?.toLowerCase() || "";
}

function webMimeFromPath(path) {
  const ext = extensionFromPath(path);
  return ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp" })[ext] || null;
}

function rasterMimeFromPath(path) {
  const ext = extensionFromPath(path);
  return ({ bmp: "image/bmp", dib: "image/bmp", tif: "image/tiff", tiff: "image/tiff", ico: "image/x-icon", heic: "image/heic", heif: "image/heif" })[ext] || "application/octet-stream";
}

async function asDataUrl(zipEntry, path) {
  const mime = webMimeFromPath(path);
  if (!mime) return null;
  return `data:${mime};base64,${await zipEntry.async("base64")}`;
}

function dataUrlToBlob(source) {
  const match = String(source || "").match(/^data:([^;,]+)(?:;charset=[^;,]+)?;base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) return null;
  const binary = atob(match[2].replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: match[1].toLowerCase() });
}

function fitDimensions(width, height, maxWidth = VISUAL_MAX_WIDTH, maxHeight = VISUAL_MAX_HEIGHT) {
  const safeWidth = Math.max(1, Number(width) || 1);
  const safeHeight = Math.max(1, Number(height) || 1);
  const scale = Math.min(1, maxWidth / safeWidth, maxHeight / safeHeight);
  return { width: Math.max(1, Math.round(safeWidth * scale)), height: Math.max(1, Math.round(safeHeight * scale)) };
}

async function blobToPngDataUrl(blob, maxWidth = VISUAL_MAX_WIDTH, maxHeight = VISUAL_MAX_HEIGHT) {
  if (!(blob instanceof Blob)) return null;
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      const size = fitDimensions(bitmap.width, bitmap.height, maxWidth, maxHeight);
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) { bitmap.close?.(); return null; }
      context.drawImage(bitmap, 0, 0, size.width, size.height);
      bitmap.close?.();
      const result = canvas.toDataURL("image/png");
      canvas.width = 1;
      canvas.height = 1;
      return result;
    } catch { /* fall through to HTMLImageElement */ }
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      try {
        const size = fitDimensions(image.naturalWidth, image.naturalHeight, maxWidth, maxHeight);
        const canvas = document.createElement("canvas");
        canvas.width = size.width;
        canvas.height = size.height;
        const context = canvas.getContext("2d", { alpha: true });
        if (!context) return resolve(null);
        context.drawImage(image, 0, 0, size.width, size.height);
        const result = canvas.toDataURL("image/png");
        canvas.width = 1;
        canvas.height = 1;
        resolve(result);
      } catch { resolve(null); }
      finally { URL.revokeObjectURL(url); }
    };
    image.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    image.src = url;
  });
}

async function loadEmfConverter() {
  if (globalThis.__jangEmfConverter) return globalThis.__jangEmfConverter;
  if (!emfConverterPromise) emfConverterPromise = import("/vendor/emf-converter.mjs").catch((error) => { emfConverterPromise = null; throw error; });
  return emfConverterPromise;
}

export async function convertOfficeVisual(buffer, path, options = {}) {
  const ext = extensionFromPath(path);
  const maxWidth = Number(options.maxWidth) || VISUAL_MAX_WIDTH;
  const maxHeight = Number(options.maxHeight) || VISUAL_MAX_HEIGHT;
  if (["emf", "wmf"].includes(ext)) {
    const converter = options.converter || await loadEmfConverter();
    const convert = ext === "emf" ? converter?.convertEmfToDataUrl : converter?.convertWmfToDataUrl;
    if (typeof convert !== "function") return null;
    const result = await convert(buffer, {
      maxWidth,
      maxHeight,
      dpiScale: Number(options.dpiScale) || 2,
      maxCanvasDimension: 4096,
      maxRecords: 500000,
      fontFamilyMap: { calibri: "Aptos", cambria: "Georgia", arial: "Arial", tahoma: "Tahoma" },
    });
    return /^data:image\/png;base64,/i.test(result || "") ? result : null;
  }
  return blobToPngDataUrl(new Blob([buffer], { type: rasterMimeFromPath(path) }), maxWidth, maxHeight);
}

async function normalizeDataImage(source) {
  const match = String(source || "").match(/^data:(image\/[^;,]+)[;,]/i);
  if (!match) return null;
  if (/^image\/(?:png|jpe?g|gif|webp|svg\+xml)$/i.test(match[1])) return source;
  const blob = dataUrlToBlob(source);
  return blob ? blobToPngDataUrl(blob) : null;
}

async function normalizeHtmlVisuals(result, onProgress) {
  const assets = Array.isArray(result?.assets) ? result.assets : [];
  const convertedIds = new Set();
  for (let index = 0; index < assets.length; index += 1) {
    const asset = assets[index];
    if (asset?.type !== "image" || !/^data:image\//i.test(asset?.source || "")) continue;
    const normalized = await normalizeDataImage(asset.source);
    if (normalized && normalized !== asset.source) {
      onProgress(`Converting HTML visual ${index + 1} of ${assets.length}…`);
      asset.source = normalized;
      asset.sourceKind = "converted";
      asset.originalFormat = String(asset.source || "").match(/^data:([^;,]+)/i)?.[1] || "image";
      convertedIds.add(asset.id);
    }
  }
  const verificationIssues = (result.verificationIssues || []).filter((issue) => !convertedIds.has(issue?.id));
  return {
    ...result,
    assets,
    verificationIssues,
    extractionStatus: verificationIssues.length ? "incomplete" : "verified-native",
    warnings: convertedIds.size ? [...(result.warnings || []), `${convertedIds.size} HTML visual${convertedIds.size === 1 ? " was" : "s were"} converted to PowerPoint-safe PNG.`] : result.warnings || [],
    stats: { ...result.stats, convertedVisualCount: Number(result.stats?.convertedVisualCount || 0) + convertedIds.size },
  };
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
  let convertedVisualCount = 0;

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
      let cached = mediaSources.get(mediaPath);
      if (cached === undefined) {
        let source = await asDataUrl(entry, mediaPath);
        let converted = false;
        if (!source) {
          onProgress(`Converting ${extensionFromPath(mediaPath).toUpperCase() || "Office"} visual on slide ${index + 1}…`);
          try {
            source = await convertOfficeVisual(await entry.async("arraybuffer"), mediaPath, { dpiScale: policy.mobile ? 1.5 : 2.25 });
            converted = Boolean(source);
          } catch (error) {
            console.warn("Visual conversion failed", mediaPath, error);
          }
        }
        cached = { source, converted };
        mediaSources.set(mediaPath, cached);
      }
      if (!cached?.source) {
        unsupportedAssets.push({ id, mediaPath, sourcePage: index + 1, reason: "visual-conversion-failed" });
        continue;
      }
      if (cached.converted) convertedVisualCount += 1;
      assets.push({ id, type: "image", source: cached.source, sourceKind: cached.converted ? "converted" : "embedded", originalFormat: extensionFromPath(mediaPath), alt: `${extracted.title} image`, caption: cached.converted ? `Converted from ${extensionFromPath(mediaPath).toUpperCase()}` : "", sourcePage: index + 1 });
      slideAssets.push(id);
    }

    const body = [...extracted.body];
    if (tables.body.length) body.push(`Source table:\n${tables.body.join("\n")}`);
    if (diagrams.body.length) body.push(`Source diagram:\n${diagrams.body.join("\n")}`);
    sections.push({ title: extracted.title, body, assets: slideAssets });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const warnings = [];
  if (convertedVisualCount) warnings.push(`${convertedVisualCount} PowerPoint visual occurrence${convertedVisualCount === 1 ? " was" : "s were"} converted to high-resolution PNG.`);
  if (unsupportedAssets.length) warnings.push(`${unsupportedAssets.length} PowerPoint visual${unsupportedAssets.length === 1 ? " could" : "s could"} not be converted. Export is blocked rather than omitting them.`);
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
    stats: { originalBytes: file.size, nodeCount: sections.length, originalExtractedChars: finalized.originalExtractedChars, extractedChars: finalized.content.length, batchCount: finalized.batches.length, assetCount: assets.length, imageCount: assets.length, diagramCount, convertedVisualCount, truncated: false, ocrRequiredPages: 0 },
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
  const scale = Math.min(2.5, PDF_RENDER_MAX_WIDTH / Math.max(Number(baseViewport?.width) || 1, 1));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(Number(viewport?.width) || 1));
  canvas.height = Math.max(1, Math.ceil(Number(viewport?.height) || 1));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return null;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const renderTask = page.render({ canvasContext: context, viewport });
  if (renderTask?.promise) await renderTask.promise;
  const source = canvas.toDataURL("image/jpeg", 0.88);
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
  if (ocrRequiredPages.length) warnings.push(`OCR will be applied automatically to PDF page${ocrRequiredPages.length === 1 ? "" : "s"} ${ocrRequiredPages.join(", ")} before redesign.`);
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
    stats: { originalBytes: file.size, nodeCount: sections.length, originalExtractedChars: finalized.originalExtractedChars, extractedChars: finalized.content.length, batchCount: finalized.batches.length, assetCount: assets.length, imageCount: assets.length, diagramCount: 0, convertedVisualCount: 0, truncated: false, ocrRequiredPages: ocrRequiredPages.length },
  };
}

export function applyOcrResults(extraction, results, provider = "OCR") {
  const expectedPages = (extraction?.verificationIssues || []).filter((issue) => issue?.type === "ocr-required").map((issue) => Number(issue.page)).filter(Number.isFinite);
  if (!expectedPages.length) return extraction;
  const resultMap = new Map((Array.isArray(results) ? results : []).map((item) => [Number(item?.page), item]));
  const missing = expectedPages.filter((page) => !clean(resultMap.get(page)?.text) && !(Array.isArray(resultMap.get(page)?.lines) && resultMap.get(page).lines.some((line) => clean(line))));
  if (missing.length) throw new Error(`${provider} did not return readable text for PDF page${missing.length === 1 ? "" : "s"} ${missing.join(", ")}.`);
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
    warnings: [...(extraction.warnings || []).filter((warning) => !/^OCR (is required|will be applied)/i.test(warning)), `${provider} applied to PDF page${expectedPages.length === 1 ? "" : "s"} ${expectedPages.join(", ")}.`],
    extractionStatus: remainingIssues.length ? "incomplete" : "verified-native",
    verificationIssues: remainingIssues,
    stats: { ...extraction.stats, originalExtractedChars: finalized.originalExtractedChars, extractedChars: finalized.content.length, batchCount: finalized.batches.length, nodeCount: sections.length, ocrRequiredPages: 0 },
  };
}

function tesseractLanguage(language) {
  const value = String(language || "").toLowerCase();
  if (value.includes("arab")) return "ara+eng";
  if (value.includes("kurd")) return "eng+ara";
  if (!value || value === "auto") return "eng+ara";
  return "eng";
}

async function loadTesseract() {
  if (globalThis.__jangTesseract) return globalThis.__jangTesseract;
  if (!tesseractPromise) tesseractPromise = import(TESSERACT_MODULE_URL).catch((error) => { tesseractPromise = null; throw error; });
  return tesseractPromise;
}

export async function applyBrowserOcr(extraction, language = "auto", onProgress = () => {}) {
  const pages = Array.isArray(extraction?.ocrPages) ? extraction.ocrPages : [];
  if (!pages.length) return extraction;
  const tesseract = await loadTesseract();
  if (typeof tesseract?.createWorker !== "function") throw new Error("The browser OCR engine could not load.");
  const progress = { page: 0, total: pages.length };
  const worker = await tesseract.createWorker(tesseractLanguage(language), 1, {
    logger: (event) => {
      if (!event?.status) return;
      const percent = Number.isFinite(event.progress) ? ` ${Math.round(event.progress * 100)}%` : "";
      onProgress(`OCR page ${progress.page || 1} of ${progress.total}: ${event.status}${percent}`);
    },
  });
  const results = [];
  try {
    if (typeof worker.setParameters === "function") await worker.setParameters({ preserve_interword_spaces: "1", user_defined_dpi: "300" });
    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      progress.page = index + 1;
      onProgress(`OCR page ${index + 1} of ${pages.length}…`);
      const output = await worker.recognize(page.imageData, { rotateAuto: true });
      const rawText = String(output?.data?.text || "").trim();
      const lines = rawText.split(/\r?\n/).map(clean).filter(Boolean);
      if (!lines.length) throw new Error(`Browser OCR could not read PDF page ${page.page}.`);
      results.push({ page: page.page, text: rawText, lines, confidence: Number.isFinite(output?.data?.confidence) ? Math.max(0, Math.min(1, output.data.confidence / 100)) : 0.8 });
    }
  } finally {
    await worker.terminate?.();
  }
  return applyOcrResults(extraction, results, "Browser OCR");
}

export async function extractLecture(file, onProgress = () => {}) {
  if (!(file instanceof File)) throw new Error("Please choose a lecture file.");
  if (/\.pptx$/i.test(file.name) || /presentationml/i.test(file.type)) return extractPptx(file, onProgress);
  if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") return extractPdf(file, onProgress);
  if (/\.html?$/i.test(file.name) || /html/i.test(file.type)) {
    const result = await normalizeHtmlVisuals(await extractHtmlLecture(file, onProgress), onProgress);
    return { ...result, sourceUnits: result.sourceUnits || [], sourcePages: result.sourcePages || [], ocrPages: [], extractionStatus: result.extractionStatus || "verified-native", verificationIssues: result.verificationIssues || [], stats: { ...result.stats, truncated: false, ocrRequiredPages: 0 } };
  }
  throw new Error("Supported lecture formats are PPTX, PDF, HTML, and HTM. DOCX, audio, video, and other formats require dedicated conversion or transcription services.");
}

export { createFallbackPlan, getUploadPolicy };
