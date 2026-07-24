const text = (value) => typeof value === "string" ? value.replace(/\u0000/g, "").trim() : "";
const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : [];
const blocks = (value) => Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
const uniq = (values) => [...new Set(values.filter(Boolean))];

const COLORS = {
  ink: "171716",
  ink2: "3A3A37",
  muted: "73736D",
  line: "D1D1CA",
  paper: "FBFBF7",
  surface: "F1F1EB",
  surface2: "E6E6DE",
  yellow: "F5E642",
  red: "922B21",
  accent: "D7C729",
  dark: "20201E",
};
const MAX_HIGHLIGHTS = 10;
const MAX_RED_TERMS = 5;
const MIN_BODY_FONT_SIZE = 16.5;
const DEFAULT_BODY_FONT_SIZE = 18;
const FULL_TEXT_BUDGET = 1050;
const SPLIT_TEXT_BUDGET = 520;

function imageData(asset) {
  return asset?.type === "image" && /^data:image\//i.test(asset.source || "") ? asset.source : null;
}

function shape(deck, name) {
  return deck?.ShapeType?.[name] || globalThis.PptxGenJS?.ShapeType?.[name] || name;
}

function normalizeText(value) {
  return String(value || "").normalize("NFC").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function contentTokens(value) {
  return normalizeText(value).toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

function containsTokenSubsequence(haystack, needle) {
  const expected = contentTokens(needle);
  if (expected.length < 4) return false;
  const actual = contentTokens(haystack);
  let index = 0;
  for (const token of actual) {
    if (token === expected[index]) index += 1;
    if (index === expected.length) return true;
  }
  return false;
}

function decodeXmlText(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function safeCaption(value) {
  const caption = text(value);
  return /^(?:converted from|source (?:pdf )?page|embedded (?:image|visual)|office visual)/i.test(caption) ? "" : caption;
}

function blockText(block) {
  if (block.type === "table") return "";
  if (["diagram", "flow", "mindmap"].includes(block.type)) return list(block.items).join("\n");
  if (block.type === "definitions") return (Array.isArray(block.pairs) ? block.pairs : [])
    .map((pair) => `${text(pair.term || pair.label || "Term")}: ${text(pair.description || pair.definition || pair.text)}`)
    .filter(Boolean)
    .join("\n\n");
  if (block.type === "qa") return [`Question: ${text(block.question || block.heading)}`, `Answer: ${text(block.answer || block.text)}`]
    .filter((line) => !/: $/.test(line))
    .join("\n\n");
  if (["bullets", "steps", "takeaways"].includes(block.type)) return list(block.items).join("\n\n");
  return text(block.text || block.caption || block.heading);
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

function imageDimensions(source) {
  const match = String(source || "").match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) return null;
  const mime = match[1].toLowerCase();
  const binary = atob(match[2].replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  if (mime === "image/png" && bytes.length >= 24) {
    const view = new DataView(bytes.buffer);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (mime === "image/gif" && bytes.length >= 10) {
    return { width: bytes[6] | (bytes[7] << 8), height: bytes[8] | (bytes[9] << 8) };
  }
  if (/image\/jpe?g/.test(mime)) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: (bytes[offset + 5] << 8) + bytes[offset + 6], width: (bytes[offset + 7] << 8) + bytes[offset + 8] };
      }
      if (!length) break;
      offset += 2 + length;
    }
  }
  return null;
}

function containRect(source, x, y, w, h) {
  const dimensions = imageDimensions(source);
  if (!dimensions?.width || !dimensions?.height) return { x, y, w, h };
  const scale = Math.min(w / dimensions.width, h / dimensions.height);
  const fitW = dimensions.width * scale;
  const fitH = dimensions.height * scale;
  return { x: x + (w - fitW) / 2, y: y + (h - fitH) / 2, w: fitW, h: fitH };
}

function addFooter(deck, slide, index, total, metadata) {
  slide.addShape(shape(deck, "line"), { x: 0.55, y: 7.03, w: 12.23, h: 0, line: { color: COLORS.line, width: 1 } });
  slide.addText(`${metadata.courseCode || "Course"} · ${metadata.lectureLabel || "Lecture"}`, {
    x: 0.58, y: 7.12, w: 8.7, h: 0.18, fontFace: "Aptos", fontSize: 8.5, color: COLORS.muted, margin: 0,
  });
  slide.addText(`${index} / ${total}`, {
    x: 11.65, y: 7.12, w: 1.05, h: 0.18, align: "right", fontFace: "Aptos", fontSize: 8.5, color: COLORS.ink2, bold: true, margin: 0,
  });
}

function addTitle(deck, slide, title, category = "", sourcePage = 0) {
  slide.addShape(shape(deck, "rect"), { x: 0, y: 0, w: 13.333, h: 0.16, line: { color: COLORS.yellow, transparency: 100 }, fill: { color: COLORS.yellow } });
  const label = category && !/^concept|lecture content$/i.test(category) ? category : sourcePage ? `Source ${sourcePage}` : "Lecture";
  slide.addText(label.toUpperCase(), {
    x: 0.72, y: 0.48, w: 3.2, h: 0.22, fontFace: "Aptos", fontSize: 9.5, bold: true, color: COLORS.muted, charSpacing: 1.1, margin: 0,
  });
  slide.addText(title || "Untitled section", {
    x: 0.72, y: 0.76, w: 11.7, h: 0.58, fontFace: "Georgia", fontSize: 23, bold: true, color: COLORS.ink, margin: 0, breakLine: false,
  });
  slide.addShape(shape(deck, "line"), { x: 0.72, y: 1.43, w: 11.9, h: 0, line: { color: COLORS.line, width: 1 } });
}

function paragraphParts(block) {
  const value = blockText(block);
  if (!value) return [];
  const paragraphs = value.split(/\n{2,}/).map(text).filter(Boolean);
  const parts = [];
  let current = [];
  let length = 0;
  for (const paragraph of paragraphs) {
    const addition = paragraph.length + (current.length ? 2 : 0);
    if (current.length && length + addition > FULL_TEXT_BUDGET) {
      parts.push({ ...block, text: current.join("\n\n") });
      current = [];
      length = 0;
    }
    current.push(paragraph);
    length += addition;
  }
  if (current.length) parts.push({ ...block, text: current.join("\n\n") });
  return parts;
}

function expandedBlocks(sectionBlocks) {
  const result = [];
  for (const block of blocks(sectionBlocks)) {
    if (block.type === "table" && Array.isArray(block.rows) && block.rows.length > 7) {
      for (let index = 0; index < block.rows.length; index += 7) {
        result.push({ ...block, rows: block.rows.slice(index, index + 7), heading: index ? `${text(block.heading) || "Table"} — continued` : block.heading });
      }
      continue;
    }
    if (["diagram", "flow", "mindmap"].includes(block.type) && list(block.items).length > 6) {
      const items = list(block.items);
      for (let index = 0; index < items.length; index += 6) result.push({ ...block, items: items.slice(index, index + 6), heading: index ? `${text(block.heading) || "Diagram"} — continued` : block.heading });
      continue;
    }
    if (!block.assetId && block.type !== "table" && !["diagram", "flow", "mindmap"].includes(block.type)) {
      result.push(...paragraphParts(block));
      continue;
    }
    result.push(block);
  }
  return result;
}

function allTerms(section, key) {
  return uniq(list(section?.[key]));
}

function makeSlideSpecs(plan) {
  const specs = [];
  for (const section of Array.isArray(plan?.sections) ? plan.sections : []) {
    const sectionBlocks = expandedBlocks(section.blocks);
    let current = [];
    let characters = 0;
    let imageCount = 0;
    const flush = () => {
      if (!current.length) return;
      specs.push({
        kind: "section",
        title: text(section.title) || "Lecture content",
        category: text(section.category),
        sourcePage: Number(section.sourcePage || 0),
        chunk: current,
        critical: allTerms(section, "keyTermsCritical"),
        important: allTerms(section, "keyTermsImportant"),
      });
      current = [];
      characters = 0;
      imageCount = 0;
    };

    for (const block of sectionBlocks) {
      if (block.type === "table" || ["diagram", "flow", "mindmap"].includes(block.type)) {
        flush();
        current = [block];
        flush();
        continue;
      }
      if (block.assetId) {
        if (imageCount >= 1 || characters > SPLIT_TEXT_BUDGET) flush();
        current.push(block);
        imageCount += 1;
        if (imageCount >= 2) flush();
        continue;
      }
      const valueLength = blockText(block).length + text(block.heading).length;
      const budget = imageCount ? SPLIT_TEXT_BUDGET : FULL_TEXT_BUDGET;
      if (current.length && characters + valueLength > budget) flush();
      current.push(block);
      characters += valueLength;
    }
    flush();
  }
  return specs.map((spec, index, all) => {
    const sameBefore = all.slice(0, index).filter((item) => item.sourcePage === spec.sourcePage && item.title === spec.title).length;
    const sameTotal = all.filter((item) => item.sourcePage === spec.sourcePage && item.title === spec.title).length;
    return { ...spec, displayTitle: sameTotal > 1 && sameBefore > 0 ? `${spec.title} — continued` : spec.title };
  });
}

function bodyRuns(textBlocks, critical, important, budget) {
  const runs = [];
  textBlocks.forEach((block, index) => {
    const value = blockText(block);
    const heading = text(block.heading || block.label);
    if (index && (heading || value)) runs.push({ text: "\n\n", options: { color: COLORS.ink } });
    if (heading && heading !== value) runs.push({ text: `${heading.toUpperCase()}\n`, options: { color: COLORS.muted, bold: true, fontFace: "Aptos", fontSize: 10.5, charSpacing: 0.4 } });
    if (value) runs.push(...styledRuns(value, critical, important, budget, true));
    else if (heading) runs.push({ text: heading, options: { color: COLORS.muted, bold: true } });
  });
  return runs;
}

function addTextCard(deck, slide, textBlocks, x, y, w, h, critical, important, budget) {
  const runs = bodyRuns(textBlocks, critical, important, budget);
  if (!runs.length) return;
  const chars = textBlocks.reduce((sum, block) => sum + blockText(block).length, 0);
  const fontSize = Math.max(MIN_BODY_FONT_SIZE, chars > 900 ? 16.5 : chars > 650 ? 17 : DEFAULT_BODY_FONT_SIZE);
  slide.addShape(shape(deck, "roundRect"), { x, y, w, h, rectRadius: 0.08, line: { color: COLORS.line, width: 1 }, fill: { color: COLORS.paper } });
  slide.addText(runs, {
    x: x + 0.28, y: y + 0.24, w: w - 0.56, h: h - 0.48,
    fontFace: "Aptos", fontSize, color: COLORS.ink, margin: 0, valign: "top", breakLine: false, paraSpaceAfterPt: 9,
  });
}

function addImageFrame(deck, slide, asset, x, y, w, h, caption = "") {
  slide.addShape(shape(deck, "roundRect"), { x, y, w, h, rectRadius: 0.08, line: { color: COLORS.line, width: 1 }, fill: { color: "FFFFFF" } });
  const safe = safeCaption(caption);
  const imageBox = containRect(asset.source, x + 0.12, y + 0.12, w - 0.24, h - (safe ? 0.58 : 0.24));
  slide.addImage({
    data: asset.source,
    ...imageBox,
    transparency: 0,
    altText: `JANG_ASSET:${asset.id}`,
    name: `JANG_ASSET:${asset.id}`,
  });
  if (safe) slide.addText(safe, { x: x + 0.18, y: y + h - 0.38, w: w - 0.36, h: 0.22, fontFace: "Aptos", fontSize: 9, italic: true, color: COLORS.muted, align: "center", margin: 0 });
}

function addTableSlide(slide, block) {
  const headers = list(block.headers);
  const rows = Array.isArray(block.rows) ? block.rows.map((row) => Array.isArray(row) ? row.map((cell) => text(cell)) : []) : [];
  const width = Math.max(headers.length, ...rows.map((row) => row.length), 1);
  const head = headers.length ? headers : Array.from({ length: width }, (_, index) => `Column ${index + 1}`);
  const tableRows = [
    head.map((cell) => ({ text: cell, options: { bold: true, color: COLORS.ink, fill: COLORS.surface2 } })),
    ...rows.map((row, rowIndex) => Array.from({ length: width }, (_, index) => ({
      text: row[index] || "",
      options: { fill: rowIndex % 2 ? "F2F2EC" : "FFFFFF", color: COLORS.ink },
    }))),
  ];
  slide.addTable(tableRows, {
    x: 0.72, y: 1.68, w: 11.9, h: 4.95,
    border: { type: "solid", color: COLORS.line, pt: 1 },
    color: COLORS.ink, fontFace: "Aptos", fontSize: 12.5, margin: 0.08, rowH: 0.52, autoFit: false, bold: false,
  });
}

function addDiagram(deck, slide, block) {
  const items = list(block.items);
  if (!items.length) return false;
  const visible = Math.min(items.length, 6);
  const columns = visible <= 3 ? visible : 3;
  const rows = Math.ceil(visible / columns);
  const gapX = 0.42;
  const gapY = 0.48;
  const boxW = (11.15 - gapX * (columns - 1)) / columns;
  const boxH = rows === 1 ? 1.45 : 1.22;
  const startY = rows === 1 ? 3.0 : 2.2;
  items.slice(0, visible).forEach((item, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = 1.08 + column * (boxW + gapX);
    const y = startY + row * (boxH + gapY);
    slide.addShape(shape(deck, "roundRect"), { x, y, w: boxW, h: boxH, rectRadius: 0.08, line: { color: COLORS.line, width: 1.2 }, fill: { color: row % 2 ? COLORS.surface2 : COLORS.paper } });
    slide.addText(item, { x: x + 0.18, y: y + 0.18, w: boxW - 0.36, h: boxH - 0.36, fontFace: "Aptos", fontSize: 14, color: COLORS.ink, align: "center", valign: "mid", margin: 0 });
    if (index < visible - 1 && column < columns - 1) slide.addShape(shape(deck, "chevron"), { x: x + boxW + 0.1, y: y + boxH / 2 - 0.12, w: 0.2, h: 0.24, line: { color: COLORS.accent, width: 1 }, fill: { color: COLORS.accent } });
  });
  return true;
}

function addContentSlide(deck, slide, chunk, assets, critical, important, report, budget) {
  const table = chunk.find((block) => block.type === "table");
  if (table) {
    addTableSlide(slide, table);
    report.renderedText.push(...list(table.headers), ...(table.rows || []).flat().map(text));
    return;
  }
  const diagram = chunk.find((block) => ["diagram", "flow", "mindmap"].includes(block.type) && list(block.items).length);
  if (diagram && addDiagram(deck, slide, diagram)) {
    report.renderedText.push(...list(diagram.items));
    return;
  }

  const imageBlocks = chunk.filter((block) => block.assetId);
  const textBlocks = chunk.filter((block) => block.type !== "table" && !block.assetId);
  const resolvedImages = imageBlocks.map((block) => ({ block, asset: assets.find((asset) => asset.id === block.assetId) })).filter((item) => imageData(item.asset));
  const hasText = textBlocks.some((block) => blockText(block) || text(block.heading));

  if (hasText && resolvedImages.length) {
    addTextCard(deck, slide, textBlocks, 0.72, 1.68, 6.25, 4.92, critical, important, budget);
    addImageFrame(deck, slide, resolvedImages[0].asset, 7.25, 1.68, 5.35, 4.92, resolvedImages[0].block.caption || resolvedImages[0].asset.caption);
  } else if (hasText) {
    addTextCard(deck, slide, textBlocks, 0.72, 1.68, 11.9, 4.92, critical, important, budget);
  } else if (resolvedImages.length === 1) {
    addImageFrame(deck, slide, resolvedImages[0].asset, 0.82, 1.66, 11.7, 4.98, resolvedImages[0].block.caption || resolvedImages[0].asset.caption);
  } else if (resolvedImages.length > 1) {
    const gap = 0.28;
    const cellW = (11.7 - gap) / 2;
    resolvedImages.slice(0, 2).forEach((item, index) => addImageFrame(deck, slide, item.asset, 0.82 + index * (cellW + gap), 1.66, cellW, 4.98, item.block.caption || item.asset.caption));
  }

  report.renderedText.push(...textBlocks.map(blockText).filter(Boolean));
  imageBlocks.forEach((block) => {
    const asset = assets.find((item) => item.id === block.assetId);
    if (imageData(asset)) report.renderedAssets.push(block.assetId); else report.missingAssets.push(block.assetId);
  });
}

export function createFidelityManifest(plan, assets = []) {
  const manifestUnits = Array.isArray(plan?.sourceManifest?.units) ? plan.sourceManifest.units : [];
  const sourceUnits = manifestUnits.length
    ? manifestUnits.map((unit) => ({ id: text(unit.id), page: Number(unit.sourcePage || unit.page || 0), text: text(unit.verbatimText || unit.text) })).filter((unit) => unit.text)
    : (plan?.sections || []).flatMap((section) => blocks(section.blocks).flatMap((block) => {
      if (block.assetId) return [];
      if (block.type === "table") return [...list(block.headers), ...(block.rows || []).flat().map(text)].filter(Boolean).map((value) => ({ id: "", page: Number(section.sourcePage || 0), text: value }));
      if (["diagram", "flow", "mindmap"].includes(block.type)) return list(block.items).map((value) => ({ id: "", page: Number(section.sourcePage || 0), text: value }));
      const value = blockText(block);
      return value ? [{ id: "", page: Number(section.sourcePage || 0), text: value }] : [];
    }));

  const expectedAssets = Array.isArray(plan?.sourceManifest?.assets) && plan.sourceManifest.assets.length
    ? plan.sourceManifest.assets.map((asset) => text(asset.id || asset.occurrenceId)).filter(Boolean)
    : (plan?.sections || []).flatMap((section) => blocks(section.blocks).map((block) => text(block.assetId)).filter(Boolean));

  return {
    sourceUnits,
    sourceText: sourceUnits.map((unit) => unit.text),
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
  const specs = makeSlideSpecs(plan);
  const total = Math.max(1, specs.length + 1);
  const report = { renderedText: [], renderedAssets: [], missingAssets: [], minimumBodyFontSize: MIN_BODY_FONT_SIZE };
  const budget = { highlights: 0, red: 0 };

  const cover = deck.addSlide();
  cover.background = { color: COLORS.dark };
  cover.addShape(shape(deck, "rect"), { x: 0, y: 0, w: 13.333, h: 0.18, line: { color: COLORS.yellow, transparency: 100 }, fill: { color: COLORS.yellow } });
  cover.addText(metadata.courseCode || "COURSE", { x: 0.78, y: 0.72, w: 3.6, h: 0.28, fontFace: "Aptos", fontSize: 11, bold: true, color: "FFFFFF", transparency: 38, charSpacing: 1.4, margin: 0 });
  cover.addText(metadata.title || "Redesigned lecture", { x: 0.78, y: 1.55, w: 10.9, h: 1.45, fontFace: "Georgia", fontSize: 36, bold: true, color: "F7F7F1", margin: 0.01 });
  cover.addShape(shape(deck, "line"), { x: 0.8, y: 3.35, w: 0.85, h: 0, line: { color: COLORS.yellow, width: 4 } });
  cover.addText(metadata.subtitle || "Source-faithful redesigned lecture", { x: 0.8, y: 3.68, w: 8.7, h: 0.7, fontFace: "Aptos", fontSize: 18, color: "FFFFFF", transparency: 32, margin: 0 });
  cover.addText([metadata.lectureLabel, metadata.instructor].filter(Boolean).join(" · "), { x: 0.8, y: 6.35, w: 9.4, h: 0.3, fontFace: "Aptos", fontSize: 11.5, color: "FFFFFF", transparency: 30, margin: 0 });
  addFooter(deck, cover, 1, total, metadata);

  specs.forEach((spec, specIndex) => {
    const slide = deck.addSlide();
    slide.background = { color: "FFFFFF" };
    addTitle(deck, slide, spec.displayTitle, spec.category, spec.sourcePage);
    addContentSlide(deck, slide, spec.chunk, assets, spec.critical, spec.important, report, budget);
    addFooter(deck, slide, specIndex + 2, total, metadata);
  });

  const manifest = createFidelityManifest(plan, assets);
  report.expectedTextCount = manifest.sourceUnits.length;
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
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path) && !zip.files[path]?.dir)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const slideXmlParts = (await Promise.all(slidePaths.map((path) => zip.file(path)?.async("text")))).filter(Boolean);
  const slideXml = slideXmlParts.join("\n");
  const paragraphText = [...slideXml.matchAll(/<a:p(?:\s[^>]*)?>([\s\S]*?)<\/a:p>/g)]
    .map((paragraph) => [...paragraph[1].matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXmlText(match[1])).join(""));
  const fallbackRuns = [...slideXml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXmlText(match[1]));
  const normalizedXml = normalizeText((paragraphText.length ? paragraphText : fallbackRuns).join(" "));

  const sourceUnits = Array.isArray(manifest?.sourceUnits) && manifest.sourceUnits.length
    ? manifest.sourceUnits
    : (manifest?.sourceText || []).map((value) => ({ id: "", page: 0, text: value }));
  const missingSourceUnits = sourceUnits.filter((unit) => {
    const normalized = normalizeText(unit.text);
    if (!normalized) return false;
    if (normalizedXml.includes(normalized)) return false;
    return !containsTokenSubsequence(normalizedXml, normalized);
  });
  const mediaPaths = Object.keys(zip.files).filter((path) => /^ppt\/media\/[^/]+$/i.test(path) && !zip.files[path]?.dir);
  const imageShapeCount = (slideXml.match(/<a:blip\b[^>]*\br:embed=/g) || []).length;
  const expectedAssets = manifest?.expectedAssets || [];
  const embeddedMediaCount = Math.max(mediaPaths.length, imageShapeCount);
  const hasOccurrenceMarkers = slideXml.includes("JANG_ASSET:");
  const missingAssets = hasOccurrenceMarkers
    ? expectedAssets.filter((id) => !slideXml.includes(`JANG_ASSET:${id}`))
    : embeddedMediaCount >= expectedAssets.length ? [] : expectedAssets.slice(embeddedMediaCount);
  const valid = missingSourceUnits.length === 0 && missingAssets.length === 0 && embeddedMediaCount >= expectedAssets.length;
  return {
    valid,
    missingText: missingSourceUnits.map((unit) => unit.text),
    missingSourceUnits,
    missingAssets,
    expectedMediaCount: expectedAssets.length,
    embeddedMediaCount,
    slideCount: slidePaths.length,
  };
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
  if (!verification.valid) {
    const pages = uniq(verification.missingSourceUnits.map((unit) => unit.page).filter(Boolean));
    const pageDetail = pages.length ? ` Source pages: ${pages.join(", ")}.` : "";
    throw new Error(`PowerPoint verification failed: ${verification.missingSourceUnits.length} original source unit(s) and ${verification.missingAssets.length} image occurrence(s) are missing.${pageDetail}`);
  }
  return {
    blob: new Blob([output], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }),
    ...fidelity,
    packageVerification: verification,
  };
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
