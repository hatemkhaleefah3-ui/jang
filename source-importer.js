import { extractLecture as extractHtmlLecture, createFallbackPlan, getUploadPolicy } from "./extractor-v2.js";

const MAX_PPTX_SLIDES = 300;
const MAX_PDF_PAGES = 250;
const MAX_PDF_PAGE_IMAGES = 80;
const MAX_ASSETS = 300;
const MAX_EXTRACTED_CHARS = 1_200_000;
const BATCH_CHARS = 110_000;
const MAX_BATCHES = 12;
const PDF_RENDER_MAX_WIDTH = 1400;
const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
const xml = (value) => new DOMParser().parseFromString(value, "application/xml");
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true });
let pdfJsPromise;

function splitBatches(content) {
  const chunks = [];
  for (let offset = 0; offset < content.length && chunks.length < MAX_BATCHES; offset += BATCH_CHARS) {
    chunks.push(content.slice(offset, offset + BATCH_CHARS));
  }
  return chunks;
}

function finalizeContent(content, warnings) {
  const originalExtractedChars = content.length;
  const limited = content.slice(0, MAX_EXTRACTED_CHARS);
  if (limited.length < originalExtractedChars) warnings.push(`Extracted text was limited to ${MAX_EXTRACTED_CHARS.toLocaleString()} characters; later material was not included.`);
  const batches = splitBatches(limited);
  if (batches.join("").length < limited.length) warnings.push(`Only the first ${MAX_BATCHES} AI batches were included.`);
  return { content: limited, batches, originalExtractedChars, truncated: limited.length < originalExtractedChars };
}

function mimeFromPath(path) {
  const ext = path.split(".").pop()?.toLowerCase();
  return ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp" })[ext] || "application/octet-stream";
}

async function asDataUrl(zipEntry, path) {
  const base64 = await zipEntry.async("base64");
  return `data:${mimeFromPath(path)};base64,${base64}`;
}

async function extractPptx(file, onProgress) {
  if (!globalThis.JSZip) throw new Error("PPTX support could not load. Refresh the page and try again.");
  const policy = getUploadPolicy();
  if (file.size > policy.maxBytes) throw new Error(`This device can safely process files up to ${policy.mobile ? "20" : "50"} MB.`);

  onProgress("Opening the PowerPoint package…");
  const zip = await globalThis.JSZip.loadAsync(await file.arrayBuffer());
  const allSlidePaths = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path)).sort(natural);
  const slidePaths = allSlidePaths.slice(0, MAX_PPTX_SLIDES);
  if (!slidePaths.length) throw new Error("The selected PPTX does not contain readable slides.");

  const assets = [];
  const sections = [];
  for (let index = 0; index < slidePaths.length; index += 1) {
    onProgress(`Reading slide ${index + 1} of ${slidePaths.length}…`);
    const slidePath = slidePaths[index];
    const slideEntry = zip.file(slidePath);
    if (!slideEntry) continue;
    const slideDoc = xml(await slideEntry.async("text"));
    const texts = [...slideDoc.getElementsByTagNameNS("*", "t")].map((node) => clean(node.textContent)).filter(Boolean);
    const title = texts[0] || `Slide ${index + 1}`;
    const body = texts.slice(1);

    const relPath = slidePath.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
    const relEntry = zip.file(relPath);
    const rels = relEntry ? xml(await relEntry.async("text")) : null;
    const relMap = new Map(rels ? [...rels.getElementsByTagNameNS("*", "Relationship")].map((node) => [node.getAttribute("Id"), node.getAttribute("Target")]) : []);
    const blips = [...slideDoc.getElementsByTagNameNS("*", "blip")];
    const slideAssets = [];
    for (const blip of blips) {
      if (assets.length >= MAX_ASSETS) break;
      const rid = blip.getAttribute("r:embed") || blip.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "embed");
      const target = relMap.get(rid);
      if (!target || !target.includes("media/")) continue;
      const mediaPath = `ppt/${target.replace(/^\.\.\//, "")}`;
      const entry = zip.file(mediaPath);
      if (!entry) continue;
      const id = `image-${String(assets.length + 1).padStart(3, "0")}`;
      assets.push({ id, type: "image", source: await asDataUrl(entry, mediaPath), sourceKind: "embedded", alt: `${title} image`, caption: "" });
      slideAssets.push(id);
    }
    sections.push({ title, body, assets: slideAssets });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const warnings = [];
  if (allSlidePaths.length > slidePaths.length) warnings.push(`Only the first ${MAX_PPTX_SLIDES} slides were imported.`);
  if (assets.length >= MAX_ASSETS) warnings.push(`Only the first ${MAX_ASSETS} visual assets were preserved.`);
  const rawContent = sections.map((section) => {
    const imageMarkers = section.assets.map((id) => `[ASSET:${id}]`).join("\n\n");
    return `# ${section.title}\n\n${section.body.join("\n\n")}${imageMarkers ? `\n\n${imageMarkers}` : ""}`;
  }).join("\n\n");
  const finalized = finalizeContent(rawContent, warnings);
  return {
    title: sections[0]?.title || file.name.replace(/\.pptx$/i, ""),
    content: finalized.content,
    batches: finalized.batches,
    assets,
    warnings,
    stats: {
      originalBytes: file.size,
      nodeCount: sections.length,
      originalExtractedChars: finalized.originalExtractedChars,
      extractedChars: finalized.content.length,
      batchCount: finalized.batches.length,
      assetCount: assets.length,
      imageCount: assets.length,
      diagramCount: 0,
      truncated: finalized.truncated,
    },
  };
}

async function loadPdfJs() {
  if (!pdfJsPromise) {
    pdfJsPromise = import("/vendor/pdf.min.mjs").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
      return pdfjs;
    });
  }
  return pdfJsPromise;
}

function pdfTextLines(items) {
  const lines = [];
  let current = [];
  let lastY = null;
  for (const item of items) {
    const value = clean(item?.str);
    if (!value) continue;
    const y = Number(item?.transform?.[5] || 0);
    if (lastY !== null && Math.abs(y - lastY) > 4 && current.length) {
      lines.push(clean(current.join(" ")));
      current = [];
    }
    current.push(value);
    lastY = y;
    if (item?.hasEOL && current.length) {
      lines.push(clean(current.join(" ")));
      current = [];
      lastY = null;
    }
  }
  if (current.length) lines.push(clean(current.join(" ")));
  return lines.filter(Boolean);
}

function pageHasVisualContent(pdfjs, operatorList, text) {
  const visualOps = new Set([
    pdfjs.OPS.paintImageXObject,
    pdfjs.OPS.paintImageXObjectRepeat,
    pdfjs.OPS.paintInlineImageXObject,
    pdfjs.OPS.paintInlineImageXObjectGroup,
    pdfjs.OPS.paintImageMaskXObject,
    pdfjs.OPS.paintImageMaskXObjectGroup,
  ].filter(Number.isFinite));
  return text.length < 120 || operatorList.fnArray.some((operation) => visualOps.has(operation));
}

async function renderPdfPage(page, pageNumber, title) {
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(1.75, PDF_RENDER_MAX_WIDTH / Math.max(baseViewport.width, 1));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return null;
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  const source = canvas.toDataURL("image/jpeg", 0.82);
  canvas.width = 1;
  canvas.height = 1;
  return {
    id: `pdf-page-${String(pageNumber).padStart(3, "0")}`,
    type: "image",
    source,
    sourceKind: "pdf-page-render",
    alt: `${title} — page ${pageNumber}`,
    caption: `Source PDF page ${pageNumber}`,
  };
}

async function extractPdf(file, onProgress) {
  const policy = getUploadPolicy();
  if (file.size > policy.maxBytes) throw new Error(`This device can safely process files up to ${policy.mobile ? "20" : "50"} MB.`);
  const pdfjs = await loadPdfJs().catch(() => { throw new Error("PDF support could not load. Redeploy the latest build or refresh the page."); });
  onProgress("Opening the PDF document…");
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: "/vendor/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/vendor/standard_fonts/",
    wasmUrl: "/vendor/wasm/",
  });
  const pdf = await loadingTask.promise;
  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const assets = [];
  const sections = [];
  const warnings = [];
  let imageOnlyPages = 0;
  let documentTitle = file.name.replace(/\.pdf$/i, "");
  try {
    const metadata = await pdf.getMetadata();
    documentTitle = clean(metadata?.info?.Title) || documentTitle;
  } catch { /* metadata is optional */ }

  try {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      onProgress(`Reading PDF page ${pageNumber} of ${pageCount}…`);
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const lines = pdfTextLines(textContent.items);
      const title = lines[0] || `Page ${pageNumber}`;
      const body = lines.length > 1 ? lines.slice(1) : [];
      const pageAssets = [];
      const pageText = lines.join(" ");
      if (!pageText) imageOnlyPages += 1;

      if (assets.length < MAX_PDF_PAGE_IMAGES) {
        const operatorList = await page.getOperatorList();
        if (pageHasVisualContent(pdfjs, operatorList, pageText)) {
          const asset = await renderPdfPage(page, pageNumber, title);
          if (asset) {
            assets.push(asset);
            pageAssets.push(asset.id);
          }
        }
      }
      sections.push({ title, body, assets: pageAssets });
      page.cleanup();
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    await pdf.destroy();
  }

  if (pdf.numPages > pageCount) warnings.push(`Only the first ${MAX_PDF_PAGES} PDF pages were imported.`);
  if (assets.length >= MAX_PDF_PAGE_IMAGES) warnings.push(`PDF visual snapshots were limited to the first ${MAX_PDF_PAGE_IMAGES} relevant pages to protect browser memory.`);
  if (imageOnlyPages) warnings.push(`${imageOnlyPages} PDF page${imageOnlyPages === 1 ? "" : "s"} contained no extractable text. Page snapshots were preserved where possible, but OCR is not performed.`);

  const rawContent = sections.map((section, index) => {
    const imageMarkers = section.assets.map((id) => `[ASSET:${id}]`).join("\n\n");
    const text = section.body.join("\n\n");
    return `# ${section.title || `Page ${index + 1}`}\n\n${text}${imageMarkers ? `\n\n${imageMarkers}` : ""}`;
  }).join("\n\n");
  const finalized = finalizeContent(rawContent, warnings);
  return {
    title: documentTitle,
    content: finalized.content,
    batches: finalized.batches,
    assets,
    warnings,
    stats: {
      originalBytes: file.size,
      nodeCount: sections.length,
      originalExtractedChars: finalized.originalExtractedChars,
      extractedChars: finalized.content.length,
      batchCount: finalized.batches.length,
      assetCount: assets.length,
      imageCount: assets.length,
      diagramCount: 0,
      truncated: finalized.truncated,
    },
  };
}

export async function extractLecture(file, onProgress = () => {}) {
  if (!(file instanceof File)) throw new Error("Please choose a lecture file.");
  if (/\.pptx$/i.test(file.name) || /presentationml/i.test(file.type)) return extractPptx(file, onProgress);
  if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") return extractPdf(file, onProgress);
  if (/\.html?$/i.test(file.name) || /html/i.test(file.type)) return extractHtmlLecture(file, onProgress);
  throw new Error("Supported lecture formats are PPTX, PDF, HTML, and HTM.");
}

export { createFallbackPlan, getUploadPolicy };
