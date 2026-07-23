const BLOCKED = "script,style,noscript,iframe,frame,frameset,object,embed,form,input,button,select,textarea,template,portal,link,meta";
const BOILERPLATE = "nav,[role='navigation'],[role='banner'],[role='contentinfo'],.cookie,.cookies,.cookie-banner,.consent,.advertisement,.advert,.ads,.sidebar,.site-header,.site-footer,.social-share,.share-buttons,.pagination,.breadcrumb";

const MOBILE_LIMIT = 20 * 1024 * 1024;
const DESKTOP_LIMIT = 50 * 1024 * 1024;
const WARNING_BYTES = 15 * 1024 * 1024;
const MAX_NODES = 150000;
const MAX_ASSETS = 300;
const MAX_SVG_CHARS = 2_000_000;
const MAX_EXTRACTED_CHARS = 1_200_000;
const BATCH_CHARS = 110_000;
const MAX_BATCHES = 12;

const clean = (value) => String(value || "").replace(/\u00a0/g, " ").replace(/[\t\f\v]+/g, " ").replace(/ +\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/ {2,}/g, " ").trim();
const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0));

export function getUploadPolicy() {
  const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  return { mobile, maxBytes: mobile ? MOBILE_LIMIT : DESKTOP_LIMIT, warningBytes: WARNING_BYTES };
}

function sanitizeSvg(svg) {
  const clone = svg.cloneNode(true);
  clone.querySelectorAll("script,foreignObject,iframe,object,embed").forEach((node) => node.remove());
  [clone, ...clone.querySelectorAll("*")].forEach((node) => [...node.attributes].forEach((attr) => {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on") || ((name === "href" || name === "xlink:href") && /^javascript:/i.test(attr.value.trim()))) clone.removeAttribute(attr.name);
  }));
  return new XMLSerializer().serializeToString(clone);
}

function marker(node, id) {
  const replacement = node.ownerDocument.createElement("p");
  replacement.dataset.jangAsset = id;
  replacement.textContent = `[ASSET:${id}]`;
  node.replaceWith(replacement);
}

function extractAssets(doc, warnings) {
  const assets = [];
  let counter = 0;
  const add = (asset) => {
    if (assets.length >= MAX_ASSETS) return false;
    assets.push(asset);
    return true;
  };
  const id = (prefix) => `${prefix}-${String(++counter).padStart(3, "0")}`;

  doc.querySelectorAll(".mermaid,[data-mermaid]").forEach((node) => {
    const source = clean(node.textContent);
    if (!source) return node.remove();
    const assetId = id("diagram");
    if (add({ id: assetId, type: "mermaid", source: source.slice(0, MAX_SVG_CHARS), sourceKind: "embedded", alt: "Mermaid diagram", caption: "" })) marker(node, assetId);
    else node.remove();
  });

  doc.querySelectorAll("svg").forEach((node) => {
    const assetId = id("diagram");
    const source = sanitizeSvg(node);
    if (source.length > MAX_SVG_CHARS) {
      warnings.push(`An SVG diagram larger than 2 MB was replaced with a placeholder (${assetId}).`);
      if (add({ id: assetId, type: "canvas-placeholder", source: "", sourceKind: "oversized-svg", alt: "Oversized SVG diagram", caption: "This diagram was too complex to preserve safely." })) marker(node, assetId);
      else node.remove();
      return;
    }
    const caption = clean(node.closest("figure")?.querySelector("figcaption")?.textContent || "");
    const alt = clean(node.getAttribute("aria-label") || node.querySelector("title")?.textContent || caption || "Diagram");
    if (add({ id: assetId, type: "svg", source, sourceKind: "embedded", alt, caption })) marker(node, assetId);
    else node.remove();
  });

  doc.querySelectorAll("img").forEach((node) => {
    const assetId = id("image");
    const source = (node.getAttribute("src") || "").trim();
    const sourceKind = /^data:image\//i.test(source) ? "embedded" : /^https?:\/\//i.test(source) ? "remote" : source ? "relative" : "missing";
    const caption = clean(node.closest("figure")?.querySelector("figcaption")?.textContent || node.getAttribute("title") || "");
    const alt = clean(node.getAttribute("alt") || caption || "Lecture image");
    if (add({ id: assetId, type: "image", source, sourceKind, alt, caption, width: node.getAttribute("width") || "", height: node.getAttribute("height") || "" })) marker(node, assetId);
    else node.remove();
  });

  doc.querySelectorAll("canvas").forEach((node) => {
    const assetId = id("diagram");
    if (add({ id: assetId, type: "canvas-placeholder", source: "", sourceKind: "unavailable-canvas", alt: clean(node.getAttribute("aria-label") || "Canvas diagram"), caption: "The source used a script-rendered canvas that cannot be reconstructed from static HTML." })) marker(node, assetId);
    else node.remove();
  });

  if (counter > MAX_ASSETS) warnings.push(`Only the first ${MAX_ASSETS} visual assets were preserved.`);
  return assets;
}

function tableMarkdown(table) {
  const rows = [...table.rows].slice(0, 80).map((row) => [...row.cells].slice(0, 12).map((cell) => clean(cell.textContent)));
  if (!rows.length) return "";
  const width = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) => [...row, ...Array(Math.max(0, width - row.length)).fill("")]);
  return [normalized[0], Array(width).fill("---"), ...normalized.slice(1)].map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`).join("\n");
}

function serialize(root) {
  const output = [];
  const walk = (element, depth = 0) => {
    if (!element || depth > 45) return;
    if (element.dataset?.jangAsset) return output.push(`[ASSET:${element.dataset.jangAsset}]`);
    const tag = element.tagName?.toLowerCase();
    if (!tag) return;
    if (/^h[1-6]$/.test(tag)) { const value = clean(element.textContent); if (value) output.push(`${"#".repeat(Number(tag[1]))} ${value}`); return; }
    if (tag === "p") { const value = clean(element.textContent); if (value) output.push(value); return; }
    if (tag === "table") { const value = tableMarkdown(element); if (value) output.push(value); return; }
    if (tag === "pre") { const value = clean(element.textContent); if (value) output.push(`\`\`\`\n${value}\n\`\`\``); return; }
    if (tag === "blockquote") { const value = clean(element.textContent); if (value) output.push(value.split("\n").map((line) => `> ${line}`).join("\n")); return; }
    if (tag === "ul" || tag === "ol") {
      [...element.children].filter((child) => child.matches("li")).forEach((item, index) => {
        const copy = item.cloneNode(true); copy.querySelectorAll("ul,ol").forEach((nested) => nested.remove());
        const value = clean(copy.textContent); if (value) output.push(`${tag === "ol" ? `${index + 1}.` : "-"} ${value}`);
      });
      return;
    }
    if (tag === "hr") { output.push("---"); return; }
    if (element.children.length) [...element.children].forEach((child) => walk(child, depth + 1));
    else { const value = clean(element.textContent); if (value) output.push(value); }
  };
  walk(root);
  return clean(output.join("\n\n"));
}

function splitBatches(content) {
  const parts = content.split(/\n(?=#{1,3}\s)/g).filter(Boolean);
  const batches = [];
  let current = "";
  const flush = () => { if (current.trim()) batches.push(current.trim()); current = ""; };
  for (const part of parts) {
    if (part.length > BATCH_CHARS) {
      flush();
      for (let i = 0; i < part.length && batches.length < MAX_BATCHES; i += BATCH_CHARS) batches.push(part.slice(i, i + BATCH_CHARS));
      continue;
    }
    if (current && current.length + part.length + 2 > BATCH_CHARS) flush();
    current += `${current ? "\n\n" : ""}${part}`;
    if (batches.length >= MAX_BATCHES) break;
  }
  flush();
  return batches.slice(0, MAX_BATCHES);
}

export async function extractLecture(file, onProgress = () => {}) {
  if (!(file instanceof File)) throw new Error("Please choose an HTML file.");
  if (!/\.html?$/i.test(file.name) && !/html/i.test(file.type)) throw new Error("Only .html and .htm files are supported.");
  const policy = getUploadPolicy();
  if (file.size > policy.maxBytes) throw new Error(`This device can safely process HTML files up to ${policy.mobile ? "20" : "50"} MB. This file is ${(file.size / 1048576).toFixed(1)} MB.`);

  const warnings = [];
  if (file.size > policy.warningBytes) warnings.push("This is a large lecture file. Processing and preview generation may take longer on this device.");
  onProgress("Reading the source file…");
  const buffer = await file.arrayBuffer();
  await yieldToBrowser();
  const html = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  if (!/<html[\s>]|<!doctype html|<body[\s>]/i.test(html)) throw new Error("The selected file does not appear to be an HTML document.");

  onProgress("Parsing the lecture structure…");
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodeCount = doc.getElementsByTagName("*").length;
  if (nodeCount > MAX_NODES) throw new Error(`The lecture contains ${nodeCount.toLocaleString()} HTML elements, exceeding the safe complexity limit of ${MAX_NODES.toLocaleString()}.`);
  await yieldToBrowser();

  doc.querySelectorAll(BLOCKED).forEach((node) => node.remove());
  try { doc.querySelectorAll(BOILERPLATE).forEach((node) => node.remove()); } catch { /* selector support */ }
  doc.querySelectorAll("*").forEach((node) => [...node.attributes].forEach((attr) => { if (attr.name.toLowerCase().startsWith("on")) node.removeAttribute(attr.name); }));

  onProgress("Preserving images and diagrams…");
  const assets = extractAssets(doc, warnings);
  await yieldToBrowser();
  onProgress("Extracting readable academic content…");
  let content = serialize(doc.body);
  if (!content) throw new Error("No readable lecture content was found in the file.");
  const originalExtractedChars = content.length;
  if (content.length > MAX_EXTRACTED_CHARS) {
    content = content.slice(0, MAX_EXTRACTED_CHARS);
    warnings.push(`Extracted text was limited to ${MAX_EXTRACTED_CHARS.toLocaleString()} characters; later material was not included.`);
  }
  const batches = splitBatches(content);
  if (batches.join("").length < content.replace(/\s/g, "").length * 0.9) warnings.push(`Only the first ${MAX_BATCHES} AI batches were included.`);

  const title = clean(doc.querySelector("h1")?.textContent || doc.querySelector("title")?.textContent || file.name.replace(/\.html?$/i, "") || "Untitled lecture").slice(0, 300);
  return {
    title, content, batches, assets, warnings,
    stats: {
      originalBytes: file.size, nodeCount, originalExtractedChars, extractedChars: content.length,
      batchCount: batches.length, assetCount: assets.length,
      imageCount: assets.filter((asset) => asset.type === "image").length,
      diagramCount: assets.filter((asset) => asset.type !== "image").length,
      truncated: originalExtractedChars > content.length,
    },
  };
}

const emptyBlock = (type, values = {}) => ({ type, heading: "", text: "", label: "", items: [], pairs: [], headers: [], rows: [], assetId: "", caption: "", alt: "", question: "", answer: "", ...values });
export function createFallbackPlan(extraction, options = {}) {
  const sections = [];
  let current = { title: extraction.title, category: "Lecture", keyTermsCritical: [], keyTermsImportant: [], blocks: [] };
  const flush = () => { if (current.blocks.length) sections.push(current); current = { title: "Continued", category: "Concept", keyTermsCritical: [], keyTermsImportant: [], blocks: [] }; };
  for (const line of extraction.content.split("\n").map((value) => value.trim()).filter(Boolean)) {
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) { if (current.blocks.length) flush(); current.title = heading[2].slice(0, 140); continue; }
    const asset = line.match(/^\[ASSET:([^\]]+)\]$/);
    if (asset) current.blocks.push(emptyBlock("image", { assetId: asset[1] }));
    else if (/^[-*]\s+/.test(line)) {
      let block = current.blocks.at(-1); if (!block || block.type !== "bullets") { block = emptyBlock("bullets"); current.blocks.push(block); } block.items.push(line.replace(/^[-*]\s+/, ""));
    } else if (/^\d+\.\s+/.test(line)) {
      let block = current.blocks.at(-1); if (!block || block.type !== "steps") { block = emptyBlock("steps"); current.blocks.push(block); } block.items.push(line.replace(/^\d+\.\s+/, ""));
    } else current.blocks.push(emptyBlock("paragraph", { text: line }));
    if (current.blocks.length >= 8) flush();
  }
  flush();
  return { metadata: { title: extraction.title, subtitle: "Reformatted lecture notes", courseCode: options.courseCode || "Course", lectureLabel: options.lectureLabel || "Lecture", instructor: options.instructor || "", language: options.language === "auto" ? "" : options.language, direction: options.language === "Arabic" ? "rtl" : "ltr" }, overview: "This local fallback preserves extracted lecture content without AI reorganization.", learningObjectives: [], sections: sections.slice(0, 40), finalTakeaways: [] };
}
