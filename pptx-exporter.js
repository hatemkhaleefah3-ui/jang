const text = (value) => typeof value === "string" ? value.trim() : "";
const list = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];

function imageData(asset) {
  return asset?.type === "image" && /^data:image\//i.test(asset.source || "") ? asset.source : null;
}

function addFooter(slide, index, total, metadata) {
  slide.addText(`${metadata.courseCode || "Course"} · ${metadata.lectureLabel || "Lecture"}`, { x: 0.45, y: 7.1, w: 8.5, h: 0.2, fontFace: "Aptos", fontSize: 8, color: "666666" });
  slide.addText(`${index} / ${total}`, { x: 11.7, y: 7.1, w: 0.8, h: 0.2, align: "right", fontFace: "Aptos", fontSize: 8, color: "666666" });
}

function addTitle(slide, title, kicker = "") {
  if (kicker) slide.addText(kicker.toUpperCase(), { x: 0.65, y: 0.42, w: 5.5, h: 0.25, fontFace: "Aptos", fontSize: 9, bold: true, color: "7A6810", charSpacing: 1.5 });
  slide.addText(title || "Untitled section", { x: 0.65, y: 0.75, w: 11.8, h: 0.65, fontFace: "Aptos Display", fontSize: 26, bold: true, color: "161616", breakLine: false, margin: 0 });
  slide.addShape(globalThis.pptx.ShapeType.line, { x: 0.65, y: 1.5, w: 1.45, h: 0, line: { color: "D8C328", width: 4 } });
}

function blockText(block) {
  if (block.type === "bullets" || block.type === "steps" || block.type === "takeaways") return list(block.items).map((item, index) => `${block.type === "steps" ? `${index + 1}.` : "•"} ${item}`).join("\n");
  if (block.type === "definitions") return (Array.isArray(block.pairs) ? block.pairs : []).map((pair) => `${pair.term || pair.label || "Term"}: ${pair.definition || pair.text || ""}`).join("\n");
  if (block.type === "qa") return `${text(block.question)}\n${text(block.answer)}`.trim();
  return text(block.text || block.caption || block.heading);
}

export async function buildPptx(plan, assets = []) {
  if (!globalThis.PptxGenJS) throw new Error("PowerPoint export could not load. Refresh the page and try again.");
  const deck = new globalThis.PptxGenJS();
  globalThis.pptx = deck;
  deck.layout = "LAYOUT_WIDE";
  deck.author = "Jang Lecture Rebuilder";
  deck.subject = "Redesigned educational lecture";
  deck.title = plan?.metadata?.title || "Redesigned lecture";
  deck.company = "Jang";
  deck.lang = plan?.metadata?.language || "en-US";
  deck.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: deck.lang };

  const metadata = plan?.metadata || {};
  const sections = Array.isArray(plan?.sections) ? plan.sections : [];
  const total = Math.max(1, sections.length + 1);
  const cover = deck.addSlide();
  cover.background = { color: "F7F6EF" };
  cover.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.18, line: { transparency: 100 }, fill: { color: "E4D431" } });
  cover.addText(metadata.courseCode || "COURSE", { x: 0.75, y: 0.65, w: 3.4, h: 0.3, fontFace: "Aptos", fontSize: 10, bold: true, color: "756817", charSpacing: 1.4 });
  cover.addText(metadata.title || "Redesigned lecture", { x: 0.75, y: 1.55, w: 10.8, h: 1.6, fontFace: "Aptos Display", fontSize: 34, bold: true, color: "151515", margin: 0.02, breakLine: false });
  cover.addText(metadata.subtitle || plan?.overview || "Clear, structured educational notes", { x: 0.78, y: 3.5, w: 8.8, h: 0.8, fontFace: "Aptos", fontSize: 17, color: "4F4F4F", margin: 0 });
  cover.addText([metadata.lectureLabel, metadata.instructor].filter(Boolean).join(" · "), { x: 0.78, y: 6.45, w: 8.5, h: 0.3, fontFace: "Aptos", fontSize: 11, color: "555555" });

  sections.forEach((section, sectionIndex) => {
    const slide = deck.addSlide();
    slide.background = { color: "FFFFFF" };
    addTitle(slide, section.title, section.category || "Concept");
    const blocks = Array.isArray(section.blocks) ? section.blocks : [];
    const assetBlock = blocks.find((block) => block.assetId && imageData(assets.find((asset) => asset.id === block.assetId)));
    const bodyBlocks = blocks.filter((block) => block !== assetBlock).slice(0, 6);
    const body = bodyBlocks.map((block) => {
      const value = blockText(block);
      return block.heading && value !== block.heading ? `${block.heading}\n${value}` : value;
    }).filter(Boolean).join("\n\n");
    const hasImage = Boolean(assetBlock);
    slide.addText(body || "This section contains visual or structured lecture content.", { x: 0.7, y: 1.82, w: hasImage ? 6.5 : 11.8, h: 4.85, fontFace: "Aptos", fontSize: 16, color: "252525", breakLine: false, valign: "top", margin: 0.08, bullet: false, fit: "shrink" });
    if (hasImage) {
      const asset = assets.find((item) => item.id === assetBlock.assetId);
      slide.addImage({ data: asset.source, x: 7.55, y: 1.88, w: 5.05, h: 4.35, sizing: "contain" });
      if (assetBlock.caption || asset.caption) slide.addText(assetBlock.caption || asset.caption, { x: 7.55, y: 6.3, w: 5.05, h: 0.35, fontFace: "Aptos", fontSize: 9, italic: true, color: "666666", align: "center" });
    }
    addFooter(slide, sectionIndex + 2, total, metadata);
  });

  return deck;
}

export async function downloadPptx(plan, assets, filename = "redesigned-lecture.pptx") {
  const deck = await buildPptx(plan, assets);
  await deck.writeFile({ fileName: filename });
}
