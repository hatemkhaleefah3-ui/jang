const text = (value) => typeof value === "string" ? value.trim() : "";
const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim()) : [];
const blocks = (value) => Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];

function imageData(asset) {
  return asset?.type === "image" && /^data:image\//i.test(asset.source || "") ? asset.source : null;
}

function addFooter(slide, index, total, metadata) {
  slide.addText(`${metadata.courseCode || "Course"} · ${metadata.lectureLabel || "Lecture"}`, { x: 0.45, y: 7.08, w: 8.5, h: 0.2, fontFace: "Aptos", fontSize: 8, color: "666666", margin: 0 });
  slide.addText(`${index} / ${total}`, { x: 11.7, y: 7.08, w: 0.8, h: 0.2, align: "right", fontFace: "Aptos", fontSize: 8, color: "666666", margin: 0 });
}

function addTitle(deck, slide, title, kicker = "") {
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.65, y: 0.38, w: 5.5, h: 0.25, fontFace: "Aptos", fontSize: 9, bold: true, color: "7A6810", charSpacing: 1.5, margin: 0 });
  slide.addText(title || "Untitled section", { x: 0.65, y: 0.72, w: 11.8, h: 0.7, fontFace: "Aptos Display", fontSize: 25, bold: true, color: "161616", margin: 0.01, breakLine: false, fit: "shrink" });
  slide.addShape(deck.ShapeType.line, { x: 0.65, y: 1.5, w: 1.45, h: 0, line: { color: "D8C328", width: 4 } });
}

function blockText(block) {
  if (["bullets", "takeaways"].includes(block.type)) return list(block.items).map((item) => `• ${item}`).join("\n");
  if (block.type === "steps") return list(block.items).map((item, index) => `${index + 1}. ${item}`).join("\n");
  if (block.type === "definitions") return (Array.isArray(block.pairs) ? block.pairs : []).map((pair) => `${text(pair.term || pair.label || "Term")}: ${text(pair.description || pair.definition || pair.text)}`).filter(Boolean).join("\n");
  if (block.type === "qa") return [`Question: ${text(block.question || block.heading)}`, `Answer: ${text(block.answer || block.text)}`].filter((line) => !/: $/.test(line)).join("\n");
  if (block.type === "table") return "";
  return text(block.text || block.caption || block.heading);
}

function blockWeight(block) {
  if (block.type === "table") return 7;
  if (block.assetId) return 5;
  const content = blockText(block);
  return Math.max(1, Math.ceil(content.length / 420));
}

function chunkBlocks(sectionBlocks) {
  const chunks = [];
  let current = [];
  let weight = 0;
  const flush = () => {
    if (current.length) chunks.push(current);
    current = [];
    weight = 0;
  };

  for (const block of blocks(sectionBlocks)) {
    const nextWeight = blockWeight(block);
    const dedicated = block.type === "table";
    if (dedicated) {
      flush();
      chunks.push([block]);
      continue;
    }
    if (current.length && (weight + nextWeight > 7 || current.length >= 5 || (block.assetId && current.some((item) => item.assetId)))) flush();
    current.push(block);
    weight += nextWeight;
  }
  flush();
  return chunks.length ? chunks : [[{ type: "paragraph", text: "No readable content was available for this section." }]];
}

function textGroup(chunk) {
  return chunk.filter((block) => block.type !== "table" && !block.assetId).map((block) => {
    const value = blockText(block);
    const heading = text(block.heading || block.label);
    if (heading && value && heading !== value) return `${heading.toUpperCase()}\n${value}`;
    return value || heading;
  }).filter(Boolean).join("\n\n");
}

function addTableSlide(slide, block) {
  const headers = list(block.headers);
  const rows = Array.isArray(block.rows) ? block.rows.map((row) => Array.isArray(row) ? row.map((cell) => text(cell)) : []) : [];
  const width = Math.max(headers.length, ...rows.map((row) => row.length), 1);
  const head = headers.length ? headers : Array.from({ length: width }, (_, index) => `Column ${index + 1}`);
  const tableRows = [head, ...rows].map((row) => Array.from({ length: width }, (_, index) => row[index] || ""));
  slide.addTable(tableRows, {
    x: 0.72, y: 1.82, w: 11.85, h: 4.95,
    border: { type: "solid", color: "C8C8C2", pt: 1 },
    fill: "FFFFFF", color: "252525", fontFace: "Aptos", fontSize: 11,
    margin: 0.06, rowH: 0.42, autoFit: false,
    bold: false,
  });
}

function addContentSlide(deck, slide, chunk, assets) {
  const table = chunk.find((block) => block.type === "table");
  if (table) {
    addTableSlide(slide, table);
    return;
  }

  const assetBlock = chunk.find((block) => block.assetId && imageData(assets.find((asset) => asset.id === block.assetId)));
  const content = textGroup(chunk);
  const hasImage = Boolean(assetBlock);
  const x = 0.72;
  const y = 1.82;
  const w = hasImage ? 6.35 : 11.85;
  const h = 4.92;

  if (content) {
    slide.addText(content, {
      x, y, w, h, fontFace: "Aptos", fontSize: 15.5, color: "252525",
      breakLine: false, valign: "top", margin: 0.08, fit: "shrink",
      paraSpaceAfterPt: 8, breakLineOnOverflow: false,
    });
  }

  if (hasImage) {
    const asset = assets.find((item) => item.id === assetBlock.assetId);
    slide.addShape(deck.ShapeType.roundRect, { x: 7.4, y: 1.78, w: 5.2, h: 4.72, rectRadius: 0.08, line: { color: "D8D8D2", width: 1 }, fill: { color: "FAFAF7" } });
    slide.addImage({ data: asset.source, x: 7.55, y: 1.95, w: 4.9, h: 4.1, transparency: 0 });
    const caption = text(assetBlock.caption || asset.caption);
    if (caption) slide.addText(caption, { x: 7.55, y: 6.18, w: 4.9, h: 0.34, fontFace: "Aptos", fontSize: 9, italic: true, color: "666666", align: "center", margin: 0, fit: "shrink" });
  }
}

function makeSlideSpecs(plan) {
  const specs = [];
  const overviewItems = list(plan?.learningObjectives);
  if (text(plan?.overview) || overviewItems.length) {
    specs.push({ kind: "overview", title: "Lecture overview", category: "Orientation", overview: text(plan.overview), objectives: overviewItems });
  }

  for (const section of Array.isArray(plan?.sections) ? plan.sections : []) {
    const chunks = chunkBlocks(section.blocks);
    chunks.forEach((chunk, index) => specs.push({
      kind: "section",
      title: chunks.length > 1 ? `${text(section.title) || "Concept"} · Part ${index + 1}` : text(section.title) || "Concept",
      category: text(section.category) || "Concept",
      chunk,
    }));
  }

  const takeaways = list(plan?.finalTakeaways);
  if (takeaways.length) specs.push({ kind: "summary", title: "Key takeaways", category: "Review", takeaways });
  return specs;
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
  deck.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: deck.lang };

  const metadata = plan?.metadata || {};
  const specs = makeSlideSpecs(plan);
  const total = Math.max(1, specs.length + 1);
  const cover = deck.addSlide();
  cover.background = { color: "F7F6EF" };
  cover.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.18, line: { transparency: 100 }, fill: { color: "E4D431" } });
  cover.addText(metadata.courseCode || "COURSE", { x: 0.75, y: 0.65, w: 3.4, h: 0.3, fontFace: "Aptos", fontSize: 10, bold: true, color: "756817", charSpacing: 1.4, margin: 0 });
  cover.addText(metadata.title || "Redesigned lecture", { x: 0.75, y: 1.55, w: 10.8, h: 1.6, fontFace: "Aptos Display", fontSize: 34, bold: true, color: "151515", margin: 0.02, breakLine: false, fit: "shrink" });
  cover.addText(metadata.subtitle || plan?.overview || "Clear, structured educational notes", { x: 0.78, y: 3.5, w: 8.8, h: 0.8, fontFace: "Aptos", fontSize: 17, color: "4F4F4F", margin: 0, fit: "shrink" });
  cover.addText([metadata.lectureLabel, metadata.instructor].filter(Boolean).join(" · "), { x: 0.78, y: 6.45, w: 8.5, h: 0.3, fontFace: "Aptos", fontSize: 11, color: "555555", margin: 0 });
  addFooter(cover, 1, total, metadata);

  specs.forEach((spec, specIndex) => {
    const slide = deck.addSlide();
    slide.background = { color: "FFFFFF" };
    addTitle(deck, slide, spec.title, spec.category);

    if (spec.kind === "overview") {
      const objectiveText = spec.objectives.map((item) => `• ${item}`).join("\n");
      const body = [spec.overview, objectiveText ? `LEARNING OBJECTIVES\n${objectiveText}` : ""].filter(Boolean).join("\n\n");
      slide.addText(body, { x: 0.75, y: 1.9, w: 11.7, h: 4.75, fontFace: "Aptos", fontSize: 17, color: "252525", valign: "top", margin: 0.1, fit: "shrink", paraSpaceAfterPt: 10 });
    } else if (spec.kind === "summary") {
      slide.addText(spec.takeaways.map((item) => `• ${item}`).join("\n\n"), { x: 0.9, y: 1.95, w: 11.4, h: 4.7, fontFace: "Aptos", fontSize: 18, color: "252525", valign: "mid", margin: 0.12, fit: "shrink" });
    } else {
      addContentSlide(deck, slide, spec.chunk, assets);
    }
    addFooter(slide, specIndex + 2, total, metadata);
  });

  return deck;
}

export async function downloadPptx(plan, assets, filename = "redesigned-lecture.pptx") {
  const deck = await buildPptx(plan, assets);
  await deck.writeFile({ fileName: filename });
}
