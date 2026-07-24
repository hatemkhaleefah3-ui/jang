const asText = (value) => typeof value === "string" ? value.trim() : "";
const asList = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : [];
const asBlocks = (value) => Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
const unique = (values) => [...new Set(values.filter(Boolean))];

const COLORS = {
  ink: "171717",
  inkSoft: "3E4146",
  muted: "6E737B",
  line: "D6D9DE",
  paper: "FFFFFF",
  soft: "F5F6F8",
  softBlue: "EEF3F8",
  blue: "1E4D6B",
  yellow: "F5E642",
  red: "922B21",
};

const BODY_FONT = 17.5;
const BODY_LINE_SPACING = 1.18;
const MAX_HIGHLIGHTS = 10;
const MAX_RED_TERMS = 5;
const VERIFY_SEGMENT_CHARS = 420;
const CONTENT_TOP = 1.18;
const CONTENT_HEIGHT = 5.65;

function shape(deck, name) {
  return deck?.ShapeType?.[name] || globalThis.PptxGenJS?.ShapeType?.[name] || name;
}

function imageData(asset) {
  return asset?.type === "image" && /^data:image\//i.test(asset.source || "") ? asset.source : null;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFC")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXmlText(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function splitPreservingText(value, maxChars = 620) {
  const source = asText(value);
  if (!source) return [];
  if (source.length <= maxChars) return [source];
  const chunks = [];
  let remaining = source;
  while (remaining.length > maxChars) {
    let cut = remaining.lastIndexOf("\n", maxChars);
    if (cut < maxChars * 0.55) cut = remaining.lastIndexOf(". ", maxChars);
    if (cut < maxChars * 0.55) cut = remaining.lastIndexOf("; ", maxChars);
    if (cut < maxChars * 0.55) cut = remaining.lastIndexOf(" ", maxChars);
    if (cut < 1) cut = maxChars;
    if ([".", ";"].includes(remaining[cut])) cut += 1;
    const piece = remaining.slice(0, cut).trim();
    if (piece) chunks.push(piece);
    remaining = remaining.slice(cut).trimStart();
  }
  if (remaining.trim()) chunks.push(remaining.trim());
  return chunks;
}

function verificationSegments(value) {
  return splitPreservingText(value, VERIFY_SEGMENT_CHARS).filter((segment) => normalizeText(segment).length >= 2);
}

function styledRuns(value, critical, important, budget, allowStyles = true) {
  const source = asText(value);
  if (!source) return [];
  if (!allowStyles) return [{ text: source, options: { color: COLORS.ink } }];
  const terms = [
    ...asList(critical).map((term) => ({ term, kind: "critical" })),
    ...asList(important).map((term) => ({ term, kind: "important" })),
  ].filter((item) => item.term.length > 1).sort((a, b) => b.term.length - a.term.length);
  if (!terms.length) return [{ text: source, options: { color: COLORS.ink } }];
  const escaped = terms.map((item) => item.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const matcher = new RegExp(`(${escaped.join("|")})`, "giu");
  return source.split(matcher).filter(Boolean).map((part) => {
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

function blockText(block) {
  if (["bullets", "takeaways"].includes(block?.type)) return asList(block.items).map((item) => `• ${item}`).join("\n");
  if (block?.type === "steps") return asList(block.items).map((item, index) => `${index + 1}. ${item}`).join("\n");
  if (block?.type === "definitions") return (Array.isArray(block.pairs) ? block.pairs : []).map((pair) => `${asText(pair?.term || pair?.label || "Term")}: ${asText(pair?.description || pair?.definition || pair?.text)}`).filter(Boolean).join("\n");
  if (block?.type === "qa") return [`Question: ${asText(block.question || block.heading)}`, `Answer: ${asText(block.answer || block.text)}`].filter((line) => !/: $/.test(line)).join("\n");
  if (block?.type === "table") return "";
  return asText(block?.text || block?.caption || block?.heading);
}

function expandBlock(block) {
  if (!block) return [];
  if (block.type === "table") {
    const rows = Array.isArray(block.rows) ? block.rows : [];
    if (rows.length <= 8) return [block];
    const pieces = [];
    for (let index = 0; index < rows.length; index += 8) pieces.push({ ...block, rows: rows.slice(index, index + 8), heading: index ? `${asText(block.heading) || "Table"} — continued` : block.heading });
    return pieces;
  }
  if (["diagram", "flow", "mindmap"].includes(block.type)) {
    const items = asList(block.items);
    if (items.length <= 6) return [block];
    const pieces = [];
    for (let index = 0; index < items.length; index += 6) pieces.push({ ...block, items: items.slice(index, index + 6), heading: index ? `${asText(block.heading) || "Diagram"} — continued` : block.heading });
    return pieces;
  }
  if (block.assetId) return [block];
  const value = blockText(block);
  if (value.length <= 620) return [block];
  return splitPreservingText(value, 620).map((part, index) => ({ ...block, type: "paragraph", text: part, items: [], pairs: [], heading: index ? "" : block.heading, continuation: index > 0 }));
}

function estimatedLines(block) {
  if (block?.assetId) return 9;
  const value = blockText(block);
  return Math.max(1, Math.ceil(value.length / 72)) + (block?.heading ? 1 : 0);
}

function chunkSection(blocks) {
  const expanded = asBlocks(blocks).flatMap(expandBlock);
  const chunks = [];
  let current = [];
  let lines = 0;
  const flush = () => { if (current.length) chunks.push(current); current = []; lines = 0; };
  for (const block of expanded) {
    if (block.type === "table" || ["diagram", "flow", "mindmap"].includes(block.type)) {
      flush();
      chunks.push([block]);
      continue;
    }
    const nextLines = estimatedLines(block);
    const currentImages = current.filter((item) => item.assetId).length;
    if (current.length && (lines + nextLines > 17 || current.length >= 4 || (block.assetId && currentImages >= 1))) flush();
    current.push(block);
    lines += nextLines;
  }
  flush();
  return chunks;
}

function addChrome(deck, slide, spec, index, total, metadata) {
  slide.background = { color: COLORS.paper };
  slide.addShape(shape(deck, "rect"), { x: 0, y: 0, w: 13.333, h: 0.78, line: { color: COLORS.blue, transparency: 100 }, fill: { color: COLORS.blue } });
  slide.addText(asText(spec.category || `Slide ${index}`), { x: 0.58, y: 0.18, w: 2.35, h: 0.22, fontFace: "Aptos", fontSize: 8.5, bold: true, color: "FFFFFF", charSpacing: 1.1, margin: 0 });
  slide.addText(asText(spec.title || "Untitled section"), { x: 3.02, y: 0.12, w: 9.65, h: 0.42, fontFace: "Georgia", fontSize: 20, bold: true, color: "FFFFFF", margin: 0, breakLine: false });
  slide.addShape(shape(deck, "line"), { x: 0.62, y: 6.97, w: 12.05, h: 0, line: { color: COLORS.line, width: 1 } });
  slide.addText(`${metadata.courseCode || "Course"} · ${metadata.lectureLabel || "Lecture"}`, { x: 0.62, y: 7.08, w: 8, h: 0.18, fontFace: "Aptos", fontSize: 8, color: COLORS.muted, margin: 0 });
  slide.addText(`${index} / ${total}`, { x: 11.55, y: 7.08, w: 1.1, h: 0.18, align: "right", fontFace: "Aptos", fontSize: 8, bold: true, color: COLORS.inkSoft, margin: 0 });
}

function cleanCaption(value) {
  const caption = asText(value);
  return /^(?:converted from|source (?:pdf )?page|embedded (?:image|visual)|office visual)/i.test(caption) ? "" : caption;
}

function addImage(deck, slide, item, box, report) {
  const data = imageData(item.asset);
  if (!data) { report.missingAssets.push(item.block.assetId); return false; }
  slide.addShape(shape(deck, "roundRect"), { x: box.x, y: box.y, w: box.w, h: box.h, rectRadius: 0.06, line: { color: COLORS.line, width: 1 }, fill: { color: "FAFBFC" } });
  const caption = cleanCaption(item.block.caption || item.asset.caption);
  const captionHeight = caption ? 0.35 : 0;
  slide.addImage({ data, x: box.x + 0.1, y: box.y + 0.1, w: box.w - 0.2, h: box.h - 0.2 - captionHeight, transparency: 0, altText: `jang-asset:${item.block.assetId}` });
  if (caption) slide.addText(caption, { x: box.x + 0.14, y: box.y + box.h - 0.31, w: box.w - 0.28, h: 0.2, fontFace: "Aptos", fontSize: 9, italic: true, align: "center", color: COLORS.muted, margin: 0 });
  report.renderedAssets.push(item.block.assetId);
  return true;
}

function textRuns(blocks, critical, important, budget) {
  const runs = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const heading = asText(block.heading || block.label);
    const value = blockText(block);
    if (index) runs.push({ text: "\n\n", options: { color: COLORS.ink } });
    if (heading && heading !== value) runs.push({ text: `${heading.toUpperCase()}\n`, options: { color: COLORS.blue, bold: true, fontFace: "Aptos", fontSize: 10.5, charSpacing: 0.8 } });
    if (value) runs.push(...styledRuns(value, critical, important, budget, true));
  }
  return runs;
}

function addTextContent(slide, blocks, box, critical, important, budget, report) {
  const runs = textRuns(blocks, critical, important, budget);
  if (!runs.length) return;
  slide.addText(runs, { ...box, fontFace: "Aptos", fontSize: BODY_FONT, color: COLORS.ink, margin: 0.12, valign: "top", breakLine: false, paraSpaceAfterPt: 9, lineSpacingMultiple: BODY_LINE_SPACING });
  report.renderedText.push(...blocks.map(blockText).filter(Boolean));
}

function addTable(slide, block, report) {
  const headers = asList(block.headers);
  const rows = Array.isArray(block.rows) ? block.rows.map((row) => Array.isArray(row) ? row.map(asText) : []) : [];
  const width = Math.max(headers.length, ...rows.map((row) => row.length), 1);
  const head = headers.length ? headers : Array.from({ length: width }, (_, index) => `Column ${index + 1}`);
  const tableRows = [
    head.map((cell) => ({ text: cell, options: { bold: true, color: "FFFFFF", fill: COLORS.blue } })),
    ...rows.map((row, rowIndex) => Array.from({ length: width }, (_, index) => ({ text: row[index] || "", options: { fill: rowIndex % 2 ? COLORS.soft : "FFFFFF", color: COLORS.ink } }))),
  ];
  slide.addTable(tableRows, { x: 0.65, y: CONTENT_TOP, w: 12.05, h: CONTENT_HEIGHT, border: { type: "solid", color: COLORS.line, pt: 1 }, fontFace: "Aptos", fontSize: 12.5, color: COLORS.ink, margin: 0.07, rowH: 0.46, autoFit: false, bold: false, valign: "mid" });
  report.renderedText.push(...head, ...rows.flat());
}

function addDiagram(deck, slide, block, report) {
  const items = asList(block.items);
  if (!items.length) return;
  slide.addShape(shape(deck, "roundRect"), { x: 0.72, y: 1.22, w: 11.9, h: 5.4, rectRadius: 0.08, line: { color: COLORS.line, width: 1 }, fill: { color: COLORS.softBlue } });
  const visible = Math.min(items.length, 6);
  const boxW = visible <= 3 ? 2.8 : 1.65;
  const totalW = visible * boxW + (visible - 1) * 0.35;
  const startX = (13.333 - totalW) / 2;
  items.slice(0, visible).forEach((item, index) => {
    const x = startX + index * (boxW + 0.35);
    slide.addShape(shape(deck, "roundRect"), { x, y: 2.68, w: boxW, h: 1.35, rectRadius: 0.05, line: { color: COLORS.blue, width: 1.5 }, fill: { color: "FFFFFF" } });
    slide.addText(item, { x: x + 0.1, y: 2.83, w: boxW - 0.2, h: 1.0, fontFace: "Aptos", fontSize: 14.5, bold: true, color: COLORS.ink, align: "center", valign: "mid", margin: 0.04 });
    if (index < visible - 1) slide.addShape(shape(deck, "chevron"), { x: x + boxW + 0.08, y: 3.12, w: 0.18, h: 0.42, line: { color: COLORS.blue, width: 1 }, fill: { color: COLORS.blue } });
  });
  report.renderedText.push(...items);
}

function addContentSlide(deck, slide, spec, assets, report, budget) {
  const table = spec.chunk.find((block) => block.type === "table");
  if (table) { addTable(slide, table, report); return; }
  const diagram = spec.chunk.find((block) => ["diagram", "flow", "mindmap"].includes(block.type));
  if (diagram) { addDiagram(deck, slide, diagram, report); return; }

  const imageItems = spec.chunk.filter((block) => block.assetId).map((block) => ({ block, asset: assets.find((asset) => asset.id === block.assetId) }));
  const textBlocks = spec.chunk.filter((block) => !block.assetId);
  if (imageItems.length && textBlocks.length) {
    addTextContent(slide, textBlocks, { x: 0.68, y: CONTENT_TOP, w: 6.0, h: CONTENT_HEIGHT }, spec.critical, spec.important, budget, report);
    addImage(deck, slide, imageItems[0], { x: 6.98, y: CONTENT_TOP, w: 5.68, h: CONTENT_HEIGHT }, report);
    return;
  }
  if (imageItems.length) {
    if (imageItems.length === 1) addImage(deck, slide, imageItems[0], { x: 0.82, y: CONTENT_TOP, w: 11.7, h: CONTENT_HEIGHT }, report);
    else {
      const shown = imageItems.slice(0, 4);
      const cellW = 5.72;
      const cellH = shown.length <= 2 ? 5.55 : 2.66;
      shown.forEach((item, index) => addImage(deck, slide, item, { x: 0.78 + (index % 2) * 5.93, y: CONTENT_TOP + Math.floor(index / 2) * 2.88, w: cellW, h: cellH }, report));
    }
    return;
  }

  if (textBlocks.length >= 3 && textBlocks.every((block) => blockText(block).length < 360)) {
    const splitAt = Math.ceil(textBlocks.length / 2);
    addTextContent(slide, textBlocks.slice(0, splitAt), { x: 0.68, y: CONTENT_TOP, w: 5.9, h: CONTENT_HEIGHT }, spec.critical, spec.important, budget, report);
    slide.addShape(shape(deck, "line"), { x: 6.665, y: 1.35, w: 0, h: 5.1, line: { color: COLORS.line, width: 1 } });
    addTextContent(slide, textBlocks.slice(splitAt), { x: 6.9, y: CONTENT_TOP, w: 5.75, h: CONTENT_HEIGHT }, spec.critical, spec.important, budget, report);
  } else {
    slide.addShape(shape(deck, "roundRect"), { x: 0.64, y: CONTENT_TOP, w: 12.05, h: CONTENT_HEIGHT, rectRadius: 0.05, line: { color: COLORS.line, width: 1 }, fill: { color: COLORS.soft } });
    addTextContent(slide, textBlocks, { x: 0.83, y: 1.38, w: 11.67, h: 5.2 }, spec.critical, spec.important, budget, report);
  }
}

function makeSpecs(plan) {
  const specs = [];
  if (asText(plan?.overview) || asList(plan?.learningObjectives).length) specs.push({ kind: "overview", title: "Lecture overview", category: "Orientation", overview: asText(plan.overview), objectives: asList(plan.learningObjectives) });
  for (const section of Array.isArray(plan?.sections) ? plan.sections : []) {
    const chunks = chunkSection(section.blocks);
    chunks.forEach((chunk, index) => specs.push({
      kind: "section",
      title: chunks.length > 1 && index ? `${asText(section.title) || "Concept"} — continued` : asText(section.title) || "Concept",
      category: asText(section.category) || (section.sourcePage ? `Source slide ${section.sourcePage}` : "Concept"),
      chunk,
      critical: asList(section.keyTermsCritical),
      important: asList(section.keyTermsImportant),
    }));
  }
  const takeaways = asList(plan?.finalTakeaways);
  if (takeaways.length) specs.push({ kind: "summary", title: "Key takeaways", category: "Review", takeaways });
  return specs;
}

function fallbackManifestText(plan) {
  const values = [];
  for (const section of Array.isArray(plan?.sections) ? plan.sections : []) {
    for (const block of asBlocks(section.blocks)) {
      if (block.type === "table") values.push(...asList(block.headers), ...(Array.isArray(block.rows) ? block.rows.flat().map(asText) : []));
      else if (["diagram", "flow", "mindmap"].includes(block.type)) values.push(...asList(block.items));
      else if (!block.assetId) values.push(blockText(block));
    }
  }
  return values.filter(Boolean);
}

export function createFidelityManifest(plan, assets = []) {
  const sourceUnits = Array.isArray(plan?.sourceManifest?.units) ? plan.sourceManifest.units : [];
  const sourceText = sourceUnits.length
    ? sourceUnits.flatMap((unit) => verificationSegments(unit?.verbatimText ?? unit?.text))
    : fallbackManifestText(plan).flatMap(verificationSegments);
  const expectedAssets = Array.isArray(plan?.sourceManifest?.assets)
    ? plan.sourceManifest.assets.map((asset) => asset?.id).filter(Boolean)
    : (plan?.sections || []).flatMap((section) => asBlocks(section.blocks).map((block) => block.assetId)).filter(Boolean);
  return {
    sourceText,
    expectedAssets,
    availableAssets: assets.filter((asset) => imageData(asset)).map((asset) => asset.id),
  };
}

export async function buildPptx(plan, assets = []) {
  if (!globalThis.PptxGenJS) throw new Error("PowerPoint export could not load. Refresh the page and try again.");
  const deck = new globalThis.PptxGenJS();
  deck.layout = "LAYOUT_WIDE";
  deck.author = "Jang Lecture Rebuilder";
  deck.subject = "Source-faithful redesigned educational lecture";
  deck.title = plan?.metadata?.title || "Redesigned lecture";
  deck.company = "Jang";
  deck.lang = plan?.metadata?.language || "en-US";
  deck.theme = { headFontFace: "Georgia", bodyFontFace: "Aptos", lang: deck.lang };

  const metadata = plan?.metadata || {};
  const specs = makeSpecs(plan);
  if (!specs.length) throw new Error("PowerPoint export stopped because the verified plan contains no content slides.");
  const total = specs.length + 1;
  const report = { renderedText: [], renderedAssets: [], missingAssets: [], highlightCount: 0, redTextCount: 0, minimumBodyFontPt: BODY_FONT };
  const budget = { highlights: 0, red: 0 };

  const cover = deck.addSlide();
  cover.background = { color: "16384E" };
  cover.addShape(shape(deck, "rect"), { x: 0, y: 0, w: 0.32, h: 7.5, line: { color: COLORS.yellow, transparency: 100 }, fill: { color: COLORS.yellow } });
  cover.addText(metadata.courseCode || "COURSE", { x: 0.82, y: 0.7, w: 3.5, h: 0.3, fontFace: "Aptos", fontSize: 10, bold: true, color: "FFFFFF", transparency: 38, charSpacing: 1.5, margin: 0 });
  cover.addText(metadata.title || "Redesigned lecture", { x: 0.82, y: 1.65, w: 10.9, h: 1.65, fontFace: "Georgia", fontSize: 36, bold: true, color: "FFFFFF", margin: 0.01, breakLine: false });
  cover.addShape(shape(deck, "line"), { x: 0.84, y: 3.58, w: 1.0, h: 0, line: { color: COLORS.yellow, width: 4 } });
  cover.addText(metadata.subtitle || "Source-faithful lecture redesign", { x: 0.84, y: 3.88, w: 8.8, h: 0.6, fontFace: "Aptos", fontSize: 18, color: "FFFFFF", transparency: 25, margin: 0 });
  cover.addText([metadata.lectureLabel, metadata.instructor].filter(Boolean).join(" · "), { x: 0.84, y: 6.55, w: 8.8, h: 0.3, fontFace: "Aptos", fontSize: 11, color: "FFFFFF", transparency: 35, margin: 0 });
  cover.addText(`1 / ${total}`, { x: 11.6, y: 6.55, w: 0.9, h: 0.3, align: "right", fontFace: "Aptos", fontSize: 9, color: "FFFFFF", transparency: 30, margin: 0 });

  specs.forEach((spec, specIndex) => {
    const slide = deck.addSlide();
    addChrome(deck, slide, spec, specIndex + 2, total, metadata);
    if (spec.kind === "overview") {
      const body = [spec.overview, spec.objectives.length ? `LEARNING OBJECTIVES\n${spec.objectives.map((item) => `• ${item}`).join("\n")}` : ""].filter(Boolean).join("\n\n");
      addTextContent(slide, [{ type: "paragraph", text: body }], { x: 0.8, y: 1.3, w: 11.75, h: 5.25 }, [], [], budget, report);
    } else if (spec.kind === "summary") {
      addTextContent(slide, [{ type: "paragraph", text: spec.takeaways.map((item) => `• ${item}`).join("\n\n") }], { x: 0.8, y: 1.3, w: 11.75, h: 5.25 }, [], [], budget, report);
    } else addContentSlide(deck, slide, spec, assets, report, budget);
  });

  const manifest = createFidelityManifest(plan, assets);
  report.renderedAssets = report.renderedAssets.filter(Boolean);
  report.missingAssets = unique(report.missingAssets);
  report.highlightCount = budget.highlights;
  report.redTextCount = budget.red;
  report.expectedTextCount = manifest.sourceText.length;
  report.expectedAssetCount = manifest.expectedAssets.length;
  report.complete = report.missingAssets.length === 0 && manifest.expectedAssets.every((id) => report.renderedAssets.includes(id));
  deck._jangFidelity = { manifest, report };
  return deck;
}

export async function verifyPptxPackage(arrayBuffer, manifest) {
  if (!globalThis.JSZip) throw new Error("PowerPoint verification could not load JSZip.");
  const zip = await globalThis.JSZip.loadAsync(arrayBuffer);
  const slidePaths = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path) && !zip.files[path]?.dir).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const slideXml = (await Promise.all(slidePaths.map((path) => zip.file(path)?.async("text")))).filter(Boolean).join("\n");
  const paragraphs = [...slideXml.matchAll(/<a:p(?:\s[^>]*)?>([\s\S]*?)<\/a:p>/g)].map((paragraph) => [...paragraph[1].matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXmlText(match[1])).join(""));
  const fallbackRuns = [...slideXml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXmlText(match[1]));
  const normalizedXml = normalizeText((paragraphs.length ? paragraphs : fallbackRuns).join(" "));
  const missingText = (manifest?.sourceText || []).filter((value) => {
    const expected = normalizeText(value);
    return expected && !normalizedXml.includes(expected);
  });

  const mediaPaths = Object.keys(zip.files).filter((path) => /^ppt\/media\/[^/]+$/i.test(path) && !zip.files[path]?.dir);
  const imageShapeCount = (slideXml.match(/<a:blip\b[^>]*\br:embed=/g) || []).length;
  const occurrenceMarkers = [...slideXml.matchAll(/jang-asset:([^"<&]+)/g)].map((match) => decodeXmlText(match[1]));
  const expectedAssets = manifest?.expectedAssets || [];
  const missingAssetIds = occurrenceMarkers.length ? expectedAssets.filter((id) => !occurrenceMarkers.includes(id)) : [];
  const embeddedMediaCount = Math.max(mediaPaths.length, imageShapeCount);
  const validAssets = occurrenceMarkers.length ? missingAssetIds.length === 0 : embeddedMediaCount >= expectedAssets.length;
  return { valid: missingText.length === 0 && validAssets, missingText, missingAssetIds, expectedMediaCount: expectedAssets.length, embeddedMediaCount, slideCount: slidePaths.length };
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
  if (fidelity?.report?.missingAssets?.length) throw new Error(`PowerPoint export stopped because ${fidelity.report.missingAssets.length} expected image occurrence(s) could not be embedded: ${fidelity.report.missingAssets.join(", ")}.`);
  const output = await deck.write({ outputType: "arraybuffer" });
  const verification = await verifyPptxPackage(output, fidelity.manifest);
  if (!verification.valid) throw new Error(`PowerPoint verification failed: ${verification.missingText.length} original text segment(s) and ${verification.missingAssetIds?.length || Math.max(0, verification.expectedMediaCount - verification.embeddedMediaCount)} image occurrence(s) are missing.`);
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
