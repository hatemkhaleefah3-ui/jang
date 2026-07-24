const text = (value) => typeof value === "string" ? value.trim() : "";
const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : [];
const blocks = (value) => Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
const COLORS = { ink: "111110", ink2: "3A3A38", muted: "787874", line: "C8C8C2", surface: "F5F5F3", surface2: "E0E0DB", yellow: "F5E642", red: "922B21" };
const MAX_HIGHLIGHTS = 10;
const MAX_RED_TERMS = 5;

function imageData(asset) { return asset?.type === "image" && /^data:image\//i.test(asset.source || "") ? asset.source : null; }
function uniq(values) { return [...new Set(values.filter(Boolean))]; }
function allTerms(section, key) { return uniq(list(section?.[key])); }
function shape(deck, name) { return deck?.ShapeType?.[name] || globalThis.PptxGenJS?.ShapeType?.[name] || name; }
function normalizeText(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function decodeXmlText(value) { return String(value || "").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"); }

function splitLongText(value, max = 1700) {
  const source = text(value);
  if (!source || source.length <= max) return source ? [source] : [];
  const chunks = [];
  let remaining = source;
  while (remaining.length > max) {
    let cut = remaining.lastIndexOf("\n\n", max);
    if (cut < max * 0.55) cut = remaining.lastIndexOf(". ", max);
    if (cut < max * 0.55) cut = remaining.lastIndexOf(" ", max);
    if (cut < 1) cut = max;
    const includePeriod = remaining.slice(cut, cut + 2) === ". " ? 1 : 0;
    const part = remaining.slice(0, cut + includePeriod).trim();
    if (part) chunks.push(part);
    remaining = remaining.slice(cut + includePeriod).trimStart();
  }
  if (remaining.trim()) chunks.push(remaining.trim());
  return chunks;
}

function styledRuns(value, critical = [], important = [], budget = { highlights: 0, red: 0 }, allowStyles = true) {
  const source = text(value);
  if (!source) return [];
  if (!allowStyles) return [{ text: source, options: { color: COLORS.ink } }];
  const terms = [
    ...critical.map((term) => ({ term, kind: "critical" })),
    ...important.map((term) => ({ term, kind: "important" })),
  ].filter((item) => item.term.length > 1).sort((a, b) => b.term.length - a.term.length);
  if (!terms.length) return [{ text: source, options: { color: COLORS.ink } }];
  const escaped = terms.map((item) => item.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "giu");
  return source.split(regex).filter(Boolean).map((part) => {
    const match = terms.find((item) => item.term.localeCompare(part, undefined, { sensitivity: "accent" }) === 0);
    if (!match) return { text: part, options: { color: COLORS.ink } };
    if (match.kind === "critical" && budget.highlights < MAX_HIGHLIGHTS) {
      budget.highlights += 1;
      return { text: part, options: { color: COLORS.ink, highlight: COLORS.yellow, bold: true } };
    }
    if (match.kind === "important" && budget.red < MAX_RED_TERMS) {
      budget.red += 1;
      return { text: part, options: { color: COLORS.red, italic: true, fontFace: "Georgia" } };
    }
    return { text: part, options: { color: COLORS.ink } };
  });
}

function addFooter(deck, slide, index, total, metadata) {
  slide.addShape(shape(deck, "rect"), { x: 0, y: 6.95, w: 13.333, h: 0.55, line: { color: COLORS.line, width: 1 }, fill: { color: COLORS.surface2 } });
  slide.addText(`${metadata.courseCode || "Course"} · ${metadata.lectureLabel || "Lecture"}`, { x: 0.45, y: 7.08, w: 8.5, h: 0.2, fontFace: "Aptos", fontSize: 8, color: COLORS.muted, margin: 0 });
  slide.addText(`${index} / ${total}`, { x: 11.7, y: 7.08, w: 0.8, h: 0.2, align: "right", fontFace: "Aptos", fontSize: 8, color: COLORS.ink2, bold: true, margin: 0 });
}

function addTitle(deck, slide, title, kicker = "") {
  slide.addShape(shape(deck, "rect"), { x: 0, y: 0, w: 13.333, h: 0.52, line: { color: COLORS.line, width: 1 }, fill: { color: COLORS.surface2 } });
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.65, y: 0.15, w: 3.2, h: 0.18, fontFace: "Aptos", fontSize: 8, bold: true, color: COLORS.muted, charSpacing: 1.2, margin: 0 });
  slide.addText(title || "Untitled section", { x: 3.15, y: 0.12, w: 7, h: 0.25, fontFace: "Georgia", fontSize: 14, bold: true, color: COLORS.ink, align: "center", margin: 0, fit: "shrink" });
}

function blockText(block) {
  if (["bullets", "takeaways"].includes(block.type)) return list(block.items).map((item) => `• ${item}`).join("\n");
  if (block.type === "steps") return list(block.items).map((item, index) => `${index + 1}. ${item}`).join("\n");
  if (block.type === "definitions") return (Array.isArray(block.pairs) ? block.pairs : []).map((pair) => `${text(pair.term || pair.label || "Term")}: ${text(pair.description || pair.definition || pair.text)}`).filter(Boolean).join("\n");
  if (block.type === "qa") return [`Question: ${text(block.question || block.heading)}`, `Answer: ${text(block.answer || block.text)}`].filter((line) => !/: $/.test(line)).join("\n");
  if (block.type === "table") return "";
  return text(block.text || block.caption || block.heading);
}

function expandBlocks(sectionBlocks) {
  const expanded = [];
  for (const block of blocks(sectionBlocks)) {
    if (block.type === "table" && Array.isArray(block.rows) && block.rows.length > 12) {
      for (let index = 0; index < block.rows.length; index += 12) expanded.push({ ...block, rows: block.rows.slice(index, index + 12), heading: index ? `${text(block.heading) || "Table"} · Continued` : block.heading });
      continue;
    }
    if (["diagram", "flow", "mindmap"].includes(block.type) && list(block.items).length > 6) {
      const items = list(block.items);
      for (let index = 0; index < items.length; index += 6) expanded.push({ ...block, items: items.slice(index, index + 6), heading: index ? `${text(block.heading) || "Diagram"} · Continued` : block.heading });
      continue;
    }
    const value = blockText(block);
    if (!block.assetId && block.type !== "table" && !["diagram", "flow", "mindmap"].includes(block.type) && value.length > 1700) {
      splitLongText(value).forEach((part, index) => expanded.push({ ...block, type: "paragraph", text: part, items: [], pairs: [], heading: index ? `${text(block.heading) || "Content"} · Continued` : block.heading }));
      continue;
    }
    expanded.push(block);
  }
  return expanded;
}

function blockWeight(block) {
  if (block.type === "table" || ["diagram", "flow", "mindmap"].includes(block.type)) return 7;
  if (block.assetId) return 4;
  return Math.max(1, Math.ceil(blockText(block).length / 420));
}

function chunkBlocks(sectionBlocks) {
  const chunks = [];
  let current = [];
  let weight = 0;
  const flush = () => { if (current.length) chunks.push(current); current = []; weight = 0; };
  for (const block of expandBlocks(sectionBlocks)) {
    const nextWeight = blockWeight(block);
    if (block.type === "table" || ["diagram", "flow", "mindmap"].includes(block.type)) { flush(); chunks.push([block]); continue; }
    if (current.length && (weight + nextWeight > 7 || current.length >= 6 || (block.assetId && current.filter((item) => item.assetId).length >= 4))) flush();
    current.push(block);
    weight += nextWeight;
  }
  flush();
  return chunks.length ? chunks : [[{ type: "paragraph", text: "No readable content was available for this section." }]];
}

function addStyledParagraph(slide, value, box, critical, important, budget, options = {}) {
  const runs = styledRuns(value, critical, important, budget, options.allowStyles !== false);
  if (!runs.length) return;
  slide.addText(runs, { ...box, fontFace: "Aptos", fontSize: options.fontSize || 15, color: COLORS.ink, margin: options.margin ?? 0.08, valign: options.valign || "top", fit: "shrink", breakLine: false, paraSpaceAfterPt: options.paraSpaceAfterPt || 7 });
}

function addTableSlide(slide, block) {
  const headers = list(block.headers);
  const rows = Array.isArray(block.rows) ? block.rows.map((row) => Array.isArray(row) ? row.map((cell) => text(cell)) : []) : [];
  const width = Math.max(headers.length, ...rows.map((row) => row.length), 1);
  const head = headers.length ? headers : Array.from({ length: width }, (_, index) => `Column ${index + 1}`);
  const type = text(block.tableStyle || block.variant || "standard").toLowerCase();
  const tableRows = [
    head.map((cell) => ({ text: cell, options: { bold: true, color: COLORS.ink2, fill: COLORS.surface2 } })),
    ...rows.map((row, rowIndex) => Array.from({ length: width }, (_, index) => ({ text: row[index] || "", options: { fill: type === "stat" && rowIndex === rows.length - 1 ? COLORS.surface2 : rowIndex % 2 ? "EEEEEA" : "FBFBF9", bold: type === "stat" && rowIndex === rows.length - 1 } }))),
  ];
  slide.addTable(tableRows, { x: 0.72, y: 1.05, w: 11.85, h: 5.65, border: { type: "solid", color: COLORS.line, pt: 1 }, color: COLORS.ink, fontFace: "Aptos", fontSize: 10.5, margin: 0.06, rowH: 0.38, autoFit: false, bold: false });
}

function addImageFrame(deck, slide, asset, x, y, w, h, caption = "") {
  slide.addShape(shape(deck, "roundRect"), { x, y, w, h, rectRadius: 0.08, line: { color: COLORS.line, width: 1 }, fill: { color: "FAFAF7" } });
  slide.addImage({ data: asset.source, x: x + 0.1, y: y + 0.1, w: w - 0.2, h: h - (caption ? 0.48 : 0.2), transparency: 0 });
  if (caption) slide.addText(caption, { x: x + 0.1, y: y + h - 0.34, w: w - 0.2, h: 0.22, fontFace: "Aptos", fontSize: 8, italic: true, color: COLORS.muted, align: "center", margin: 0, fit: "shrink" });
}

function addImages(deck, slide, imageBlocks, assets, contentPresent) {
  const resolved = imageBlocks.map((block) => ({ block, asset: assets.find((asset) => asset.id === block.assetId) })).filter((item) => imageData(item.asset));
  if (!resolved.length) return 0;
  const startX = contentPresent ? 7.35 : 0.78;
  const areaW = contentPresent ? 5.15 : 11.75;
  if (resolved.length === 1) {
    const item = resolved[0];
    addImageFrame(deck, slide, item.asset, startX, 1.1, areaW, 5.45, text(item.block.caption || item.asset.caption));
    return 1;
  }
  const cols = 2;
  const rows = Math.ceil(Math.min(resolved.length, 4) / cols);
  const gap = 0.18;
  const cellW = (areaW - gap) / cols;
  const cellH = (5.45 - gap * (rows - 1)) / rows;
  resolved.slice(0, 4).forEach((item, index) => addImageFrame(deck, slide, item.asset, startX + (index % cols) * (cellW + gap), 1.1 + Math.floor(index / cols) * (cellH + gap), cellW, cellH, text(item.block.caption || item.asset.caption)));
  return Math.min(resolved.length, 4);
}

function addDiagram(deck, slide, block, critical, important, budget) {
  const items = list(block.items);
  if (!items.length) return false;
  slide.addShape(shape(deck, "roundRect"), { x: 0.85, y: 1.15, w: 11.6, h: 5.25, rectRadius: 0.08, line: { color: COLORS.line, width: 1 }, fill: { color: COLORS.surface } });
  const visible = Math.min(items.length, 6);
  const gap = 0.22;
  const boxW = (10.5 - gap * (visible - 1)) / visible;
  items.slice(0, visible).forEach((item, index) => {
    const x = 1.4 + index * (boxW + gap);
    slide.addShape(shape(deck, "roundRect"), { x, y: 2.75, w: boxW, h: 1.1, rectRadius: 0.05, line: { color: "B0B0A8", width: 1 }, fill: { color: "F8F8F6" } });
    addStyledParagraph(slide, item, { x: x + 0.08, y: 2.95, w: boxW - 0.16, h: 0.7 }, critical, important, budget, { fontSize: 10.5, valign: "mid", margin: 0.02 });
    if (index < visible - 1) slide.addShape(shape(deck, "chevron"), { x: x + boxW + 0.03, y: 3.05, w: 0.15, h: 0.35, line: { color: "555550", width: 1 }, fill: { color: "555550" } });
  });
  return true;
}

function bodyRuns(textBlocks, critical, important, budget) {
  const runs = [];
  textBlocks.forEach((block, index) => {
    const value = blockText(block);
    const heading = text(block.heading || block.label);
    if (index && (heading || value)) runs.push({ text: "\n\n", options: { color: COLORS.ink } });
    if (heading && heading !== value) runs.push({ text: `${heading.toUpperCase()}\n`, options: { color: COLORS.muted, bold: true, fontFace: "Aptos" } });
    if (value) runs.push(...styledRuns(value, critical, important, budget, true));
    else if (heading) runs.push({ text: heading, options: { color: COLORS.muted, bold: true, fontFace: "Aptos" } });
  });
  return runs;
}

function addContentSlide(deck, slide, chunk, assets, critical, important, report, budget) {
  const table = chunk.find((block) => block.type === "table");
  if (table) { addTableSlide(slide, table); report.renderedText.push(...list(table.headers), ...(table.rows || []).flat().map(text)); return; }
  const diagram = chunk.find((block) => ["diagram", "flow", "mindmap"].includes(block.type) && list(block.items).length);
  if (diagram && addDiagram(deck, slide, diagram, critical, important, budget)) { report.renderedText.push(...list(diagram.items)); return; }
  const imageBlocks = chunk.filter((block) => block.assetId);
  const textBlocks = chunk.filter((block) => block.type !== "table" && !block.assetId);
  const hasText = textBlocks.some((block) => blockText(block) || text(block.heading || block.label));
  const imageCount = addImages(deck, slide, imageBlocks, assets, hasText);
  const runs = bodyRuns(textBlocks, critical, important, budget);
  if (runs.length) {
    slide.addText(runs, { x: 0.72, y: 1.08, w: imageCount ? 6.25 : 11.85, h: 5.55, fontFace: "Aptos", fontSize: 14.5, color: COLORS.ink, margin: 0.08, valign: "top", fit: "shrink", breakLine: false, paraSpaceAfterPt: 7 });
    report.renderedText.push(...textBlocks.map(blockText).filter(Boolean));
  }
  imageBlocks.forEach((block) => {
    const asset = assets.find((item) => item.id === block.assetId);
    if (imageData(asset)) report.renderedAssets.push(block.assetId); else report.missingAssets.push(block.assetId);
  });
}

function makeSlideSpecs(plan) {
  const specs = [];
  const overviewItems = list(plan?.learningObjectives);
  if (text(plan?.overview) || overviewItems.length) specs.push({ kind: "overview", title: "Lecture overview", category: "Orientation", overview: text(plan.overview), objectives: overviewItems });
  for (const section of Array.isArray(plan?.sections) ? plan.sections : []) {
    const chunks = chunkBlocks(section.blocks);
    chunks.forEach((chunk, index) => specs.push({ kind: "section", title: chunks.length > 1 ? `${text(section.title) || "Concept"} · Part ${index + 1}` : text(section.title) || "Concept", category: text(section.category) || "Concept", chunk, critical: allTerms(section, "keyTermsCritical"), important: allTerms(section, "keyTermsImportant") }));
  }
  const takeaways = list(plan?.finalTakeaways);
  if (takeaways.length) specs.push({ kind: "summary", title: "Key takeaways", category: "Review", takeaways });
  return specs;
}

export function createFidelityManifest(plan, assets = []) {
  const sourceText = [];
  for (const section of Array.isArray(plan?.sections) ? plan.sections : []) {
    for (const block of expandBlocks(section.blocks)) {
      if (block.type === "table") sourceText.push(...list(block.headers), ...(block.rows || []).flat().map(text));
      else if (["diagram", "flow", "mindmap"].includes(block.type)) sourceText.push(...list(block.items));
      else sourceText.push(blockText(block));
    }
  }
  const expectedAssets = (plan?.sections || []).flatMap((section) => blocks(section.blocks).map((block) => block.assetId)).filter(Boolean);
  return { sourceText: sourceText.filter(Boolean), expectedAssets, availableAssets: assets.filter((asset) => imageData(asset)).map((asset) => asset.id) };
}

export async function buildPptx(plan, assets = []) {
  if (!globalThis.PptxGenJS) throw new Error("PowerPoint export could not load. Refresh the page and try again.");
  const deck = new globalThis.PptxGenJS();
  deck.layout = "LAYOUT_WIDE";
  deck.author = "Jang Lecture Rebuilder";
  deck.subject = "Redesigned educational lecture";
  deck.title = plan?.metadata?.title || "Redesigned lecture";
  deck.company = "Jang";
  deck.lang = plan?.metadata?.language || "en-US";
  deck.theme = { headFontFace: "Georgia", bodyFontFace: "Aptos", lang: deck.lang };
  const metadata = plan?.metadata || {};
  const specs = makeSlideSpecs(plan);
  const total = Math.max(1, specs.length + 1);
  const report = { renderedText: [], renderedAssets: [], missingAssets: [] };
  const budget = { highlights: 0, red: 0 };
  const cover = deck.addSlide();
  cover.background = { color: "1E1E1C" };
  cover.addText(metadata.courseCode || "COURSE", { x: 0.75, y: 0.65, w: 3.4, h: 0.3, fontFace: "Aptos", fontSize: 10, bold: true, color: "FFFFFF", transparency: 55, charSpacing: 1.4, margin: 0 });
  cover.addText(metadata.title || "Redesigned lecture", { x: 0.75, y: 1.55, w: 10.8, h: 1.6, fontFace: "Georgia", fontSize: 34, bold: true, color: "F0F0EC", margin: 0.02, fit: "shrink" });
  cover.addShape(shape(deck, "line"), { x: 0.78, y: 3.35, w: 0.7, h: 0, line: { color: "F0D21E", transparency: 35, width: 3 } });
  cover.addText(metadata.subtitle || plan?.overview || "Clear, structured educational notes", { x: 0.78, y: 3.65, w: 8.8, h: 0.8, fontFace: "Aptos", fontSize: 17, color: "FFFFFF", transparency: 40, margin: 0, fit: "shrink" });
  cover.addText([metadata.lectureLabel, metadata.instructor].filter(Boolean).join(" · "), { x: 0.78, y: 6.45, w: 8.5, h: 0.3, fontFace: "Aptos", fontSize: 11, color: "FFFFFF", transparency: 35, margin: 0 });
  addFooter(deck, cover, 1, total, metadata);
  specs.forEach((spec, specIndex) => {
    const slide = deck.addSlide();
    slide.background = { color: "FFFFFF" };
    addTitle(deck, slide, spec.title, spec.category);
    if (spec.kind === "overview") {
      const body = [spec.overview, spec.objectives.length ? `LEARNING OBJECTIVES\n${spec.objectives.map((item) => `• ${item}`).join("\n")}` : ""].filter(Boolean).join("\n\n");
      addStyledParagraph(slide, body, { x: 0.75, y: 1.08, w: 11.7, h: 5.55 }, [], [], budget, { fontSize: 16, allowStyles: false });
      report.renderedText.push(body);
    } else if (spec.kind === "summary") {
      const body = spec.takeaways.map((item) => `• ${item}`).join("\n\n");
      addStyledParagraph(slide, body, { x: 0.9, y: 1.2, w: 11.4, h: 5.35 }, [], [], budget, { fontSize: 17, valign: "mid", allowStyles: false });
      report.renderedText.push(body);
    } else addContentSlide(deck, slide, spec.chunk, assets, spec.critical, spec.important, report, budget);
    addFooter(deck, slide, specIndex + 2, total, metadata);
  });
  const manifest = createFidelityManifest(plan, assets);
  report.expectedTextCount = manifest.sourceText.length;
  report.expectedAssetCount = manifest.expectedAssets.length;
  report.renderedAssets = report.renderedAssets.filter(Boolean);
  report.missingAssets = uniq(report.missingAssets);
  report.highlightCount = budget.highlights;
  report.redTextCount = budget.red;
  report.complete = report.missingAssets.length === 0 && manifest.expectedAssets.every((id) => report.renderedAssets.includes(id));
  deck._jangFidelity = { manifest, report };
  return deck;
}

export async function verifyPptxPackage(arrayBuffer, manifest) {
  if (!globalThis.JSZip) throw new Error("PowerPoint verification could not load JSZip.");
  const zip = await globalThis.JSZip.loadAsync(arrayBuffer);
  const slidePaths = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path) && !zip.files[path]?.dir).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const slideXml = (await Promise.all(slidePaths.map((path) => zip.file(path)?.async("text")))).filter(Boolean).join("\n");
  const paragraphText = [...slideXml.matchAll(/<a:p(?:\s[^>]*)?>([\s\S]*?)<\/a:p>/g)].map((paragraph) => [...paragraph[1].matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXmlText(match[1])).join(""));
  const fallbackRuns = [...slideXml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXmlText(match[1]));
  const normalizedXml = normalizeText((paragraphText.length ? paragraphText : fallbackRuns).join(" "));
  const missingText = (manifest?.sourceText || []).filter((value) => { const normalized = normalizeText(value); return normalized && !normalizedXml.includes(normalized); });
  const mediaPaths = Object.keys(zip.files).filter((path) => /^ppt\/media\/[^/]+$/i.test(path) && !zip.files[path]?.dir);
  const imageShapeCount = (slideXml.match(/<a:blip\b[^>]*\br:embed=/g) || []).length;
  const expectedMediaCount = (manifest?.expectedAssets || []).length;
  const embeddedMediaCount = Math.max(mediaPaths.length, imageShapeCount);
  return { valid: missingText.length === 0 && embeddedMediaCount >= expectedMediaCount, missingText, expectedMediaCount, embeddedMediaCount, slideCount: slidePaths.length };
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function createPptxFile(plan, assets = []) {
  const deck = await buildPptx(plan, assets);
  const fidelity = deck._jangFidelity;
  if (fidelity?.report?.missingAssets?.length) throw new Error(`PowerPoint export stopped because ${fidelity.report.missingAssets.length} expected image(s) could not be embedded: ${fidelity.report.missingAssets.join(", ")}.`);
  const output = await deck.write({ outputType: "arraybuffer" });
  const verification = await verifyPptxPackage(output, fidelity.manifest);
  if (!verification.valid) throw new Error(`PowerPoint verification failed: ${verification.missingText.length} text block(s) or ${Math.max(0, verification.expectedMediaCount - verification.embeddedMediaCount)} image occurrence(s) are missing.`);
  return { blob: new Blob([output], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }), ...fidelity, packageVerification: verification };
}

export function downloadPreparedPptx(blob, filename = "redesigned-lecture.pptx") {
  if (!(blob instanceof Blob)) throw new Error("The PowerPoint file has not been prepared yet.");
  saveBlob(blob, filename);
}

export async function downloadPptx(plan, assets, filename = "redesigned-lecture.pptx") {
  const result = await createPptxFile(plan, assets);
  downloadPreparedPptx(result.blob, filename);
  return result;
}
