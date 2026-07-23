import { extractLecture as extractHtmlLecture, createFallbackPlan, getUploadPolicy } from "./extractor-v2.js";

const MAX_PPTX_SLIDES = 300;
const MAX_ASSETS = 300;
const BATCH_CHARS = 110_000;
const MAX_BATCHES = 12;
const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();
const xml = (value) => new DOMParser().parseFromString(value, "application/xml");
const natural = (a, b) => a.localeCompare(b, undefined, { numeric: true });

function splitBatches(content) {
  const chunks = [];
  for (let offset = 0; offset < content.length && chunks.length < MAX_BATCHES; offset += BATCH_CHARS) {
    chunks.push(content.slice(offset, offset + BATCH_CHARS));
  }
  return chunks;
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
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort(natural)
    .slice(0, MAX_PPTX_SLIDES);
  if (!slidePaths.length) throw new Error("The selected PPTX does not contain readable slides.");

  const assets = [];
  const sections = [];
  for (let index = 0; index < slidePaths.length; index += 1) {
    onProgress(`Reading slide ${index + 1} of ${slidePaths.length}…`);
    const slidePath = slidePaths[index];
    const slideDoc = xml(await zip.file(slidePath).async("text"));
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
      const asset = { id, type: "image", source: await asDataUrl(entry, mediaPath), sourceKind: "embedded", alt: `${title} image`, caption: "" };
      assets.push(asset);
      slideAssets.push(id);
    }
    sections.push({ title, body, assets: slideAssets });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  const content = sections.map((section, index) => {
    const imageMarkers = section.assets.map((id) => `[ASSET:${id}]`).join("\n\n");
    return `# ${section.title}\n\n${section.body.join("\n\n")}${imageMarkers ? `\n\n${imageMarkers}` : ""}`;
  }).join("\n\n");
  const batches = splitBatches(content);
  return {
    title: sections[0]?.title || file.name.replace(/\.pptx$/i, ""), content, batches, assets,
    warnings: slidePaths.length >= MAX_PPTX_SLIDES ? [`Only the first ${MAX_PPTX_SLIDES} slides were imported.`] : [],
    stats: { originalBytes: file.size, nodeCount: sections.length, originalExtractedChars: content.length, extractedChars: content.length, batchCount: batches.length, assetCount: assets.length, imageCount: assets.length, diagramCount: 0, truncated: false },
  };
}

export async function extractLecture(file, onProgress = () => {}) {
  if (!(file instanceof File)) throw new Error("Please choose a lecture file.");
  if (/\.pptx$/i.test(file.name) || /presentationml/i.test(file.type)) return extractPptx(file, onProgress);
  return extractHtmlLecture(file, onProgress);
}

export { createFallbackPlan, getUploadPolicy };
