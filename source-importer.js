import { extractLecture as extractHtmlLecture, getUploadPolicy } from "./extractor-v2.js";
import { createFallbackPlan } from "./fallback-plan.js";

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
  const parts = content.split(/\n(?=#{1,3}\s)/g).filter(Boolean);
  const batches = [];
  let current = "";
  const flush = () => {
    if (current.trim()) batches.push(current.trim());
    current = "";
  };

  for (const part of parts) {
    if (batches.length >= MAX_BATCHES) break;
    if (part.length > BATCH_CHARS) {
      flush();
      const paragraphs = part.split(/\n{2,}/).filter(Boolean);
      let chunk = "";
      for (const paragraph of paragraphs) {
        if (chunk && chunk.length + paragraph.length + 2 > BATCH_CHARS) {
          batches.push(chunk.trim());
          chunk = "";
          if (batches.length >= MAX_BATCHES) break;
        }
        chunk += `${chunk ? "\n\n" : ""}${paragraph}`;
      }
      if (chunk && batches.length < MAX_BATCHES) batches.push(chunk.trim());
      continue;
    }
    if (current && current.length + part.length + 1 > BATCH_CHARS) flush();
    current += `${current ? "\n" : ""}${part}`;
  }
  if (batches.length < MAX_BATCHES) flush();
  return batches.slice(0, MAX_BATCHES);
}

function finalizeContent(content, warnings) {
  const originalExtractedChars = content.length;
  const limited = content.slice(0, MAX_EXTRACTED_CHARS);
  if (limited.length < originalExtractedChars) warnings.push(`Extracted text was limited to ${MAX_EXTRACTED_CHARS.toLocaleString()} characters; later material was not included.`);
  const batches = splitBatches(limited);
  if (batches.join("").length < limited.replace(/\s/g, "").length * 0.9) warnings.push(`Only the first ${MAX_BATCHES} AI batches were included.`);
  return { content: limited, batches, originalExtractedChars, truncated: limited.length < originalExtractedChars };
}

function webMimeFromPath(path) {
  const ext = path.split(".").pop()?.toLowerCase();
  return ({ png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", svg: "image/svg+xml", webp: "image/webp" })[ext] || null;
}

async function asDataUrl(zipEntry, path) {
  const mime = webMimeFromPath(path);
  if (!mime) return null;
  const base64 = await zipEntry.async("base64");
  return `data:${mime};base64,${base64}`;
}

function paragraphText(node) {
  return clean([...node.getElementsByTagNameNS("*", "t")].map((item) => item.textContent || "").join(""));
}

function extractSlideText(slideDoc, slideNumber) {
  const shapes = [...slideDoc.getElementsByTagNameNS("*", "sp")];
  let title = "";
  const body = [];

  for (const shape of shapes) {
    const paragraphs = [...shape.getElementsByTagNameNS("*", "p")].map(paragraphText).filter(Boolean);
    if (!paragraphs.length) continue;
    const placeholder = shape.getElementsByTagNameNS("*", "ph")[0]?.getAttribute("type") || "";
    if (!title && ["title", "ctrTitle", "subTitle"].includes(placeholder)) title = clean(paragraphs.join(" "));
    else body.push(...paragraphs);
  }

  if (!title) {
    const allParagraphs = [...slideDoc.getElementsByTagNameNS("*", "p")].map(paragraphText).filter(Boolean);
    title = allParagraphs.shift() || `Slide ${slideNumber}`;
    if (!body.length) body.push(...allParagraphs);
  }
  return { title, body: body.filter((value) => value !== title) };
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
  const mediaIds = new Map();
  const sections = [];
  let unsupportedImages = 0;

  for (let index = 0; index < slidePaths.length; index += 1) {
    onProgress(`Reading slide ${index + 1} of ${slidePaths.length}…`);
    const slidePath = slidePaths[index];
    const slideEntry = zip.file(slidePath);
    if (!slideEntry) continue;
    const slideDoc = xml(await slideEntry.async("text"));
    const { title, body } = extractSlideText(slideDoc, index + 1);

    const relPath = slidePath.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
    const relEntry = zip.file(relPath);
    const rels = relEntry ? xml(await relEntry.async("text")) : null;
    const relMap = new Map(rels ? [...rels.getElementsByTagNameNS("*", "Relationship")].map((node) => [node.getAttribute("Id"), node.getAttribute("Target")]) : []);
    const slideAssets = [];

    for (const blip of [...slideDoc.getElementsByTagNameNS("*", "blip")]) {
      if (assets.length >= MAX_ASSETS) break;
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
      const source = await asDataUrl(entry, mediaPath);
      if (!source) {
        unsupportedImages += 1;
        continue;
      }
      const id = `image-${String(assets.length + 1).padStart(3, "0")}`;
      mediaIds.set(mediaPath, id);
      assets.push({ id, type: "image", source, sourceKind: "embedded", alt: `${title} image`, caption: "" });
      slideAssets.push(id);
    }
    sections.push({ title, body, assets: [...new Set(slideAssets)] });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const warnings = [];
  if (allSlidePaths.length > slidePaths.length) warnings.push(`Only the first ${MAX_PPTX_SLIDES} slides were imported.`);
  if (assets.length >= MAX_ASSETS) warnings.push(`Only the first ${MAX_ASSETS} visual assets were preserved.`);
  if (unsupportedImages) warnings.push(`${unsupportedImages} PowerPoint image${unsupportedImages === 1 ? " was" : "s were"} skipped because EMF/WMF cannot be rendered safely in the browser. Re-save those images as PNG or JPEG in PowerPoint for full preservation.`);

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
      if (pdfjs?.GlobalWorkerOptions) pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdf.worker.min.mjs";
      return pdfjs;
    }).catch((error) => {
      pdfJsPromise = null;
      throw error;
    });
  }
  return pdfJsPromise;
}

function pdfTextLines(items) {
  const rows = [];
  const safeItems = Array.isArray(items) ? items : [];
  for (const item of safeItems) {
    const value = clean(item?.str);
    if (!value) continue;
    const transform = Array.isArray(item?.transform) ? item.transform : [];
    const x = Number(transform[4] || 0);
    const y = Number(transform[5] || 0);
    let row = rows.find((candidate) => Math.abs(candidate.y - y) <= 3);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    row.items.push({ x, value });
  }
  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) => clean(row.items.sort((a, b) => a.x - b.x).map((item) => item.value).join(" ")))
    .filter(Boolean);
}

function pageHasVisualContent(pdfjs, operatorList) {
  const visualOps = new Set([
    pdfjs?.OPS?.paintImageXObject,
    pdfjs?.OPS?.paintImageXObjectRepeat,
    pdfjs?.OPS?.paintInlineImageXObject,
    pdfjs?.OPS?.paintInlineImageXObjectGroup,
    pdfjs?.OPS?.paintImageMaskXObject,
    pdfjs?.OPS?.paintImageMaskXObjectGroup,
  ].filter((value) => Number.isFinite(value)));
  const operations = operatorList?.fnArray && typeof operatorList.fnArray[Symbol.iterator] === "function" ? [...operatorList.fnArray] : [];
  return operations.some((operation) => visualOps.has(operation));
}

async function renderPdfPage(page, pageNumber, title) {
  if (typeof page?.getViewport !== "function" || typeof page?.render !== "function") return null;
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(1.75, PDF_RENDER_MAX_WIDTH / Math.max(Number(baseViewport?.width) || 1, 1));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(Number(viewport?.width) || 1));
  canvas.height = Math.max(1, Math.ceil(Number(viewport?.height) || 1));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return null;
  const renderTask = page.render({ canvasContext: context, viewport });
  if (renderTask?.promise && typeof renderTask.promise.then === "function") await renderTask.promise;
  const source = canvas.toDataURL("image/jpeg", 0.82);
  canvas.width = 1;
  canvas.height = 1;
  return {
    id: `pdf-page-${String(pageNumber).padStart(3, "0")}`,
    type: "image",
    source,
    sourceKind: "embedded",
    alt: `${title} — page ${pageNumber}`,
    caption: `Source PDF page ${pageNumber}`,
  };
}

async function destroyPdf(pdf, loadingTask) {
  try {
    if (typeof loadingTask?.destroy === "function") await loadingTask.destroy();
    if (typeof pdf?.cleanup === "function") pdf.cleanup();
    if (typeof pdf?.destroy === "function") await pdf.destroy();
  } catch (error) {
    console.warn("PDF cleanup failed", error);
  }
}

async function extractPdf(file, onProgress) {
  const policy = getUploadPolicy();
  if (file.size > policy.maxBytes) throw new Error(`This device can safely process files up to ${policy.mobile ? "20" : "50"} MB.`);
  const pdfjs = await loadPdfJs().catch(() => { throw new Error("PDF support could not load in this browser. Redeploy the latest build or refresh the page."); });
  if (typeof pdfjs?.getDocument !== "function") throw new Error("PDF support loaded incorrectly. Redeploy the latest build.");
  onProgress("Opening the PDF document…");
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    cMapUrl: "/vendor/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "/vendor/standard_fonts/",
    wasmUrl: "/vendor/wasm/",
    disableFontFace: policy.mobile,
    useWorkerFetch: false,
    isEvalSupported: false,
  });
  if (!loadingTask?.promise || typeof loadingTask.promise.then !== "function") throw new Error("This browser could not start the PDF reader.");
  const pdf = await loadingTask.promise;
  const totalPages = Number(pdf?.numPages) || 0;
  if (!totalPages || typeof pdf?.getPage !== "function") throw new Error("The selected PDF does not contain readable pages.");
  const pageCount = Math.min(totalPages, MAX_PDF_PAGES);
  const assets = [];
  const sections = [];
  const warnings = [];
  let imageOnlyPages = 0;
  let snapshotFailures = 0;
  let documentTitle = file.name.replace(/\.pdf$/i, "");

  try {
    try {
      if (typeof pdf.getMetadata === "function") {
        const metadata = await pdf.getMetadata();
        documentTitle = clean(metadata?.info?.Title) || documentTitle;
      }
    } catch { /* metadata is optional */ }

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      onProgress(`Reading PDF page ${pageNumber} of ${pageCount}…`);
      let page;
      try {
        page = await pdf.getPage(pageNumber);
        if (!page || typeof page.getTextContent !== "function") throw new Error("Text extraction is not supported for this page.");
        const textContent = await page.getTextContent();
        const lines = pdfTextLines(textContent?.items);
        const title = lines.find((line) => line.length >= 3) || `Page ${pageNumber}`;
        const titleIndex = lines.indexOf(title);
        const body = titleIndex >= 0 ? lines.filter((_, index) => index !== titleIndex) : lines;
        const pageAssets = [];
        const pageText = lines.join(" ");
        if (!pageText) imageOnlyPages += 1;

        if (assets.length < MAX_PDF_PAGE_IMAGES) {
          try {
            let shouldSnapshot = pageText.length < 120;
            if (!policy.mobile && !shouldSnapshot && typeof page.getOperatorList === "function") {
              const operatorList = await page.getOperatorList();
              shouldSnapshot = pageHasVisualContent(pdfjs, operatorList);
            }
            if (shouldSnapshot) {
              const asset = await renderPdfPage(page, pageNumber, title);
              if (asset) {
                assets.push(asset);
                pageAssets.push(asset.id);
              }
            }
          } catch {
            snapshotFailures += 1;
          }
        }
        sections.push({ title, body, assets: pageAssets });
      } catch (error) {
        throw new Error(`PDF page ${pageNumber} could not be read: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        try { if (typeof page?.cleanup === "function") page.cleanup(); } catch { /* cleanup is optional */ }
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  } finally {
    await destroyPdf(pdf, loadingTask);
  }

  if (totalPages > pageCount) warnings.push(`Only the first ${MAX_PDF_PAGES} PDF pages were imported.`);
  if (assets.length >= MAX_PDF_PAGE_IMAGES) warnings.push(`PDF visual snapshots were limited to the first ${MAX_PDF_PAGE_IMAGES} relevant pages to protect browser memory.`);
  if (imageOnlyPages) warnings.push(`${imageOnlyPages} PDF page${imageOnlyPages === 1 ? "" : "s"} contained no extractable text. Page snapshots were preserved where possible, but OCR is not performed.`);
  if (snapshotFailures) warnings.push(`${snapshotFailures} PDF page snapshot${snapshotFailures === 1 ? "" : "s"} could not be rendered, but their extractable text was preserved.`);

  const rawContent = sections.map((section, index) => {
    const imageMarkers = section.assets.map((id) => `[ASSET:${id}]`).join("\n\n");
    return `# ${section.title || `Page ${index + 1}`}\n\n${section.body.join("\n\n")}${imageMarkers ? `\n\n${imageMarkers}` : ""}`;
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