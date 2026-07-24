const BLOCKED = "script,style,noscript,iframe,frame,frameset,object,embed,form,input,button,select,textarea,template,portal,link,meta";
const BOILERPLATE = "nav,[role='navigation'],[role='banner'],[role='contentinfo'],.cookie,.cookies,.cookie-banner,.consent,.advertisement,.advert,.ads,.sidebar,.site-header,.site-footer,.social-share,.share-buttons,.pagination,.breadcrumb";

const MOBILE_LIMIT = 20 * 1024 * 1024;
const DESKTOP_LIMIT = 50 * 1024 * 1024;
const WARNING_BYTES = 15 * 1024 * 1024;
const MAX_NODES = 150000;
const MAX_ASSETS = 2000;
const MAX_SVG_CHARS = 10_000_000;
const BATCH_CHARS = 110_000;

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

function dataUrlFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("The image could not be read."));
    reader.readAsDataURL(blob);
  });
}

function marker(node, id, type = "asset") {
  const replacement = node.ownerDocument.createElement("p");
  if (type === "diagram") replacement.dataset.jangDiagram = id;
  else replacement.dataset.jangAsset = id;
  replacement.textContent = type === "diagram" ? `[DIAGRAM:${id}]` : `[ASSET:${id}]`;
  node.replaceWith(replacement);
}

async function extractAssets(doc, warnings, verificationIssues) {
  const assets = [];
  const diagramSources = [];
  let counter = 0;
  const nextId = (prefix) => {
    counter += 1;
    if (counter > MAX_ASSETS) throw new Error(`The lecture contains more than ${MAX_ASSETS.toLocaleString()} visual items. No output was created because preserving every visual would exceed the safe browser limit.`);
    return `${prefix}-${String(counter).padStart(3, "0")}`;
  };

  for (const node of [...doc.querySelectorAll(".mermaid,[data-mermaid]")]) {
    const source = clean(node.textContent);
    if (!source) { node.remove(); continue; }
    const id = nextId("diagram");
    diagramSources.push({ id, text: source, sourceKind: "mermaid" });
    marker(node, id, "diagram");
  }

  for (const node of [...doc.querySelectorAll("svg")]) {
    const id = nextId("image");
    const source = sanitizeSvg(node);
    const caption = clean(node.closest("figure")?.querySelector("figcaption")?.textContent || "");
    const alt = clean(node.getAttribute("aria-label") || node.querySelector("title")?.textContent || caption || "Diagram");
    if (source.length > MAX_SVG_CHARS) {
      verificationIssues.push({ type: "oversized-svg", id, size: source.length });
      warnings.push(`SVG diagram ${id} is too large to preserve safely. The PowerPoint is blocked rather than omitting it.`);
      assets.push({ id, type: "image", source: "", sourceKind: "oversized-svg", alt, caption });
      marker(node, id);
      continue;
    }
    const dataUrl = await dataUrlFromBlob(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
    assets.push({ id, type: "image", source: dataUrl, sourceKind: "embedded", alt, caption });
    marker(node, id);
  }

  for (const node of [...doc.querySelectorAll("img")]) {
    const id = nextId("image");
    const originalSource = (node.getAttribute("src") || "").trim();
    const caption = clean(node.closest("figure")?.querySelector("figcaption")?.textContent || node.getAttribute("title") || "");
    const alt = clean(node.getAttribute("alt") || caption || "Lecture image");
    let source = originalSource;
    let sourceKind = /^data:image\//i.test(source) ? "embedded" : /^https?:\/\//i.test(source) ? "remote" : source ? "relative" : "missing";
    if (sourceKind === "remote") {
      try {
        const response = await fetch(source, { mode: "cors", credentials: "omit", referrerPolicy: "no-referrer" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        if (!/^image\//i.test(blob.type)) throw new Error("The response was not an image.");
        source = await dataUrlFromBlob(blob);
        sourceKind = "embedded";
      } catch (error) {
        verificationIssues.push({ type: "remote-image-unavailable", id, source: originalSource });
        warnings.push(`Remote image ${id} could not be embedded (${error instanceof Error ? error.message : "request failed"}). The PowerPoint is blocked rather than omitting it.`);
        source = "";
        sourceKind = "remote-unavailable";
      }
    } else if (sourceKind !== "embedded") {
      verificationIssues.push({ type: "image-source-unavailable", id, sourceKind, source: originalSource });
      warnings.push(`Image ${id} uses a ${sourceKind} source that cannot be recovered from a standalone HTML file. The PowerPoint is blocked rather than omitting it.`);
      source = "";
    }
    assets.push({ id, type: "image", source, sourceKind, alt, caption, width: node.getAttribute("width") || "", height: node.getAttribute("height") || "" });
    marker(node, id);
  }

  for (const node of [...doc.querySelectorAll("canvas")]) {
    const id = nextId("diagram");
    const alt = clean(node.getAttribute("aria-label") || "Canvas diagram");
    verificationIssues.push({ type: "canvas-unavailable", id });
    warnings.push(`Canvas diagram ${id} requires the original rendering script. The PowerPoint is blocked rather than replacing or omitting it.`);
    assets.push({ id, type: "image", source: "", sourceKind: "unavailable-canvas", alt, caption: "" });
    marker(node, id);
  }

  return { assets, diagramSources };
}

function tableMarkdown(table) {
  const rows = [...table.rows].map((row) => [...row.cells].map((cell) => clean(cell.textContent)));
  if (!rows.length) return "";
  const width = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) => [...row, ...Array(Math.max(0, width - row.length)).fill("")]);
  return [normalized[0], Array(width).fill("---"), ...normalized.slice(1)].map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`).join("\n");
}

function serialize(root) {
  const output = [];
  const walk = (element) => {
    if (!element) return;
    if (element.dataset?.jangAsset) { output.push(`[ASSET:${element.dataset.jangAsset}]`); return; }
    if (element.dataset?.jangDiagram) { output.push(`[DIAGRAM:${element.dataset.jangDiagram}]`); return; }
    const tag = element.tagName?.toLowerCase();
    if (!tag) return;
    if (/^h[1-6]$/.test(tag)) { const value = clean(element.textContent); if (value) output.push(`${"#".repeat(Number(tag[1]))} ${value}`); return; }
    if (tag === "p") { const value = clean(element.textContent); if (value) output.push(value); return; }
    if (tag === "table") { const value = tableMarkdown(element); if (value) output.push(value); return; }
    if (tag === "pre") { const value = clean(element.textContent); if (value) output.push(`\`\`\`\n${value}\n\`\`\``); return; }
    if (tag === "blockquote") { const value = clean(element.textContent); if (value) output.push(value.split("\n").map((line) => `> ${line}`).join("\n")); return; }
    if (tag === "ul" || tag === "ol") {
      [...element.children].filter((child) => child.matches("li")).forEach((item, index) => {
        const copy = item.cloneNode(true);
        copy.querySelectorAll("ul,ol").forEach((nested) => nested.remove());
        const value = clean(copy.textContent);
        if (value) output.push(`${tag === "ol" ? `${index + 1}.` : "-"} ${value}`);
      });
      return;
    }
    if (tag === "hr") { output.push("---"); return; }
    if (element.children.length) [...element.children].forEach(walk);
    else { const value = clean(element.textContent); if (value) output.push(value); }
  };
  walk(root);
  return clean(output.join("\n\n"));
}

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

function sourceUnitsFromContent(content, diagramSources) {
  const diagrams = new Map(diagramSources.map((item) => [item.id, item]));
  const units = [];
  let page = 1;
  let order = 0;
  for (const token of String(content || "").split(/\n{2,}/).map((value) => value.trim()).filter(Boolean)) {
    const heading = token.match(/^(#{1,6})\s+(.+)$/s);
    if (heading && units.length) { page += 1; order = 0; }
    const asset = token.match(/^\[ASSET:([^\]]+)\]$/);
    if (asset) continue;
    const diagram = token.match(/^\[DIAGRAM:([^\]]+)\]$/);
    order += 1;
    if (diagram) {
      const source = diagrams.get(diagram[1]);
      if (source?.text) units.push({ page, order, kind: "diagram", text: source.text, runs: [{ text: source.text }], extractionMethod: "native", confidence: 1 });
      continue;
    }
    const isTable = /^\|.+\|\n\|\s*:?-{3,}/m.test(token);
    const value = heading ? clean(heading[2]) : token;
    if (value) units.push({ page, order, kind: isTable ? "table" : "paragraph", text: value, runs: [{ text: value }], extractionMethod: "native", confidence: 1 });
  }
  return units;
}

export async function extractLecture(file, onProgress = () => {}) {
  if (!(file instanceof File)) throw new Error("Please choose an HTML file.");
  if (!/\.html?$/i.test(file.name) && !/html/i.test(file.type)) throw new Error("Only .html and .htm files are supported.");
  const policy = getUploadPolicy();
  if (file.size > policy.maxBytes) throw new Error(`This device can safely process HTML files up to ${policy.mobile ? "20" : "50"} MB. This file is ${(file.size / 1048576).toFixed(1)} MB.`);

  const warnings = [];
  const verificationIssues = [];
  if (file.size > policy.warningBytes) warnings.push("This is a large lecture file. Processing and PowerPoint generation may take longer on this device.");
  onProgress("Reading the source file…");
  const buffer = await file.arrayBuffer();
  await yieldToBrowser();
  const html = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  if (!/<html[\s>]|<!doctype html|<body[\s>]/i.test(html)) throw new Error("The selected file does not appear to be an HTML document.");

  onProgress("Parsing the lecture structure…");
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodeCount = doc.getElementsByTagName("*").length;
  if (nodeCount > MAX_NODES) throw new Error(`The lecture contains ${nodeCount.toLocaleString()} HTML elements, exceeding the safe complexity limit of ${MAX_NODES.toLocaleString()}. No partial output was created.`);
  await yieldToBrowser();

  doc.querySelectorAll(BLOCKED).forEach((node) => node.remove());
  try { doc.querySelectorAll(BOILERPLATE).forEach((node) => node.remove()); } catch {}
  doc.querySelectorAll("*").forEach((node) => [...node.attributes].forEach((attr) => { if (attr.name.toLowerCase().startsWith("on")) node.removeAttribute(attr.name); }));

  onProgress("Preserving every supported image and diagram…");
  const { assets, diagramSources } = await extractAssets(doc, warnings, verificationIssues);
  await yieldToBrowser();
  onProgress("Extracting all readable academic content…");
  const content = serialize(doc.body);
  if (!content) throw new Error("No readable lecture content was found in the file.");
  const batches = splitBatches(content);
  const sourceUnits = sourceUnitsFromContent(content, diagramSources);
  const title = clean(doc.querySelector("h1")?.textContent || doc.querySelector("title")?.textContent || file.name.replace(/\.html?$/i, "") || "Untitled lecture").slice(0, 300);
  return {
    title,
    content,
    batches,
    assets,
    diagramSources,
    sourceUnits,
    warnings,
    extractionStatus: verificationIssues.length ? "incomplete" : "verified-native",
    verificationIssues,
    stats: {
      originalBytes: file.size,
      nodeCount,
      originalExtractedChars: content.length,
      extractedChars: content.length,
      batchCount: batches.length,
      assetCount: assets.length,
      imageCount: assets.filter((asset) => asset.type === "image").length,
      diagramCount: diagramSources.length + assets.filter((asset) => /diagram/i.test(asset.alt || "")).length,
      truncated: false,
    },
  };
}

const emptyBlock = (type, values = {}) => ({ type, heading: "", text: "", label: "", items: [], pairs: [], headers: [], rows: [], assetId: "", caption: "", alt: "", question: "", answer: "", ...values });
export function createFallbackPlan(extraction, options = {}) {
  const diagramMap = new Map((extraction?.diagramSources || []).map((item) => [item.id, item.text]));
  const sections = [];
  let current = { title: extraction.title, category: "Lecture", keyTermsCritical: [], keyTermsImportant: [], blocks: [] };
  const flush = () => { if (current.blocks.length) sections.push(current); current = { title: "Continued", category: "Concept", keyTermsCritical: [], keyTermsImportant: [], blocks: [] }; };
  for (const line of extraction.content.split("\n").map((value) => value.trim()).filter(Boolean)) {
    const heading = line.match(/^(#{1,6})\s+(.+)/);
    if (heading) { if (current.blocks.length) flush(); current.title = heading[2].slice(0, 140); continue; }
    const asset = line.match(/^\[ASSET:([^\]]+)\]$/);
    const diagram = line.match(/^\[DIAGRAM:([^\]]+)\]$/);
    if (asset) current.blocks.push(emptyBlock("image", { assetId: asset[1] }));
    else if (diagram) current.blocks.push(emptyBlock("diagram", { heading: "Source diagram", items: clean(diagramMap.get(diagram[1])).split(/\n+/).filter(Boolean) }));
    else if (/^[-*]\s+/.test(line)) {
      let block = current.blocks.at(-1);
      if (!block || block.type !== "bullets") { block = emptyBlock("bullets"); current.blocks.push(block); }
      block.items.push(line.replace(/^[-*]\s+/, ""));
    } else if (/^\d+\.\s+/.test(line)) {
      let block = current.blocks.at(-1);
      if (!block || block.type !== "steps") { block = emptyBlock("steps"); current.blocks.push(block); }
      block.items.push(line.replace(/^\d+\.\s+/, ""));
    } else current.blocks.push(emptyBlock("paragraph", { text: line }));
    if (current.blocks.length >= 8) flush();
  }
  flush();
  return { metadata: { title: extraction.title, subtitle: "Reformatted lecture notes", courseCode: options.courseCode || "Course", lectureLabel: options.lectureLabel || "Lecture", instructor: options.instructor || "", language: options.language === "auto" ? "" : options.language, direction: options.language === "Arabic" ? "rtl" : "ltr" }, overview: "This local fallback preserves all extracted lecture content without AI reorganization.", learningObjectives: [], sections, finalTakeaways: [] };
}
