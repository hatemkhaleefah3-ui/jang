const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));

const clean = (value) => String(value ?? "").replace(/\r\n?/g, "\n").trim();
const IMAGE_SIZES = new Set(["small", "medium", "large", "wide", "portrait", "square", "full"]);
const IMAGE_FITS = new Set(["contain", "cover"]);
const BLOCK_TYPES = new Set(["subtitle", "paragraph", "bullets", "numbered", "callout", "table", "diagram", "image"]);

const slugify = (value) => clean(value || "lecture")
  .normalize("NFKD")
  .replace(/[^\p{L}\p{N}]+/gu, "-")
  .replace(/^-+|-+$/g, "")
  .toLowerCase()
  .slice(0, 70) || "lecture";

function splitLongText(value, limit = 520) {
  const source = clean(value);
  if (!source) return [];
  if (source.length <= limit) return [source];
  const sentences = source.match(/[^.!?؟。]+[.!?؟。]+|[^.!?؟。]+$/gu)?.map((part) => part.trim()).filter(Boolean) || [source];
  const chunks = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= limit) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    if (sentence.length <= limit) {
      current = sentence;
      continue;
    }
    current = "";
    let words = "";
    for (const word of sentence.split(/\s+/)) {
      const next = words ? `${words} ${word}` : word;
      if (next.length > limit && words) {
        chunks.push(words);
        words = word;
      } else words = next;
    }
    if (words) current = words;
  }
  if (current) chunks.push(current);
  return chunks;
}

function stringArray(value) {
  return Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
}

function rowsArray(value) {
  return Array.isArray(value) ? value.map((row) => stringArray(row)).filter((row) => row.length) : [];
}

function textKey(value) {
  return clean(value).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function normalizeBlock(block, index, context) {
  const type = BLOCK_TYPES.has(block?.type) ? block.type : "paragraph";
  const normalized = {
    type,
    text: clean(block?.text),
    label: clean(block?.label),
    description: clean(block?.description),
    tone: ["note", "warning", "info"].includes(block?.tone) ? block.tone : "note",
    items: stringArray(block?.items),
    headers: stringArray(block?.headers),
    rows: rowsArray(block?.rows),
    diagramRows: rowsArray(block?.diagramRows),
    slotId: clean(block?.slotId) || `image-${index + 1}`,
    size: IMAGE_SIZES.has(block?.size) ? block.size : "full",
    fit: IMAGE_FITS.has(block?.fit) ? block.fit : "contain",
    sourceReference: clean(block?.sourceReference),
  };
  if ((type === "paragraph" || type === "subtitle" || type === "callout") && !normalized.text) normalized.text = normalized.label;
  if (type === "table" && !normalized.label) normalized.label = `${context} comparison table`;
  if (type === "diagram" && !normalized.label) normalized.label = `${context} process diagram`;
  if (type === "image" && !normalized.label) normalized.label = `${context} illustration`;
  return normalized;
}

function legacySections(input) {
  if (Array.isArray(input.sections)) return input.sections;
  const sections = [];
  let current = null;
  for (const slide of Array.isArray(input.slides) ? input.slides : []) {
    const sectionTitle = clean(slide?.sectionTitle) || "Overview";
    if (!current || current.sectionTitle !== sectionTitle) {
      current = { sectionTitle, slides: [] };
      sections.push(current);
    }
    if (slide?.kind !== "section") {
      current.slides.push({
        slideTitle: clean(slide?.slideTitle),
        slideSubtitle: clean(slide?.slideSubtitle),
        blocks: slide?.blocks || [],
      });
    }
  }
  return sections;
}

export function normalizeLectureData(input) {
  if (!input || typeof input !== "object") throw new Error("The extracted lecture data is missing.");
  const documentTitle = clean(input.documentTitle) || "Lecture";
  const direction = input.direction === "rtl" ? "rtl" : "ltr";
  const endNote = clean(input.endNote) || "Lecture complete";
  const overviewInput = input.overview && typeof input.overview === "object" ? input.overview : {};
  const overview = {
    title: clean(overviewInput.title) || "Overview",
    introduction: clean(overviewInput.introduction),
    keyPoints: stringArray(overviewInput.keyPoints).slice(0, 8),
  };
  const sections = [];
  const usedSlots = new Set();
  const usedTitles = new Set();
  let imageCounter = 0;

  for (const rawSection of legacySections(input)) {
    const sectionTitle = clean(rawSection?.sectionTitle);
    if (!sectionTitle) continue;
    const slides = [];
    for (const rawSlide of Array.isArray(rawSection?.slides) ? rawSection.slides : []) {
      const rawTitle = clean(rawSlide?.slideTitle);
      const slideSubtitle = clean(rawSlide?.slideSubtitle);
      const rawKey = textKey(rawTitle);
      const slideTitle = rawTitle
        && rawKey !== textKey(sectionTitle)
        && rawKey !== textKey(slideSubtitle)
        && !usedTitles.has(rawKey)
        ? rawTitle
        : "";
      if (slideTitle) usedTitles.add(rawKey);
      const context = slideTitle || slideSubtitle || sectionTitle;
      const blocks = [];
      for (const rawBlock of Array.isArray(rawSlide?.blocks) ? rawSlide.blocks : []) {
        const block = normalizeBlock(rawBlock, imageCounter, context);
        if (block.type === "image") {
          imageCounter += 1;
          let slotId = block.slotId;
          let suffix = 2;
          while (usedSlots.has(slotId)) slotId = `${block.slotId}-${suffix++}`;
          block.slotId = slotId;
          usedSlots.add(slotId);
        }
        const hasContent = block.type === "image"
          || block.text
          || block.items.length
          || block.rows.length
          || block.diagramRows.length;
        if (hasContent) blocks.push(block);
      }
      if (blocks.length) slides.push({ slideTitle, slideSubtitle, blocks });
    }
    if (slides.length) sections.push({ sectionTitle, slides });
  }

  if (!sections.length) {
    sections.push({ sectionTitle: "Overview", slides: [{
      slideTitle: "",
      slideSubtitle: "",
      blocks: [{
        type: "paragraph", text: "Lecture content", label: "", description: "", tone: "note", items: [], headers: [], rows: [], diagramRows: [], slotId: "image-1", size: "full", fit: "contain", sourceReference: "",
      }],
    }] });
  }

  return { documentTitle, direction, overview, sections, endNote };
}

function expandBlock(block) {
  if (block.type === "paragraph") return splitLongText(block.text).map((text) => ({ ...block, text }));
  if (block.type === "bullets" || block.type === "numbered") {
    const chunks = [];
    for (let index = 0; index < block.items.length; index += 6) chunks.push({ ...block, items: block.items.slice(index, index + 6) });
    return chunks.length ? chunks : [block];
  }
  return [block];
}

function isTextBlock(block) {
  return ["subtitle", "paragraph", "bullets", "numbered", "callout"].includes(block.type);
}

function tableColumnCount(block) {
  return Math.max(block.headers.length, ...block.rows.map((row) => row.length), 0);
}

function diagramNodeCount(block) {
  return block.diagramRows.reduce((sum, row) => sum + row.length, 0);
}

function isCompactVisual(block) {
  return (block.type === "table" && tableColumnCount(block) <= 3)
    || (block.type === "diagram" && diagramNodeCount(block) <= 4);
}

function isDedicatedVisual(block) {
  return block.type === "image"
    || (block.type === "table" && tableColumnCount(block) > 3)
    || (block.type === "diagram" && diagramNodeCount(block) > 4);
}

function blockWeight(block) {
  if (block.type === "subtitle") return 120 + block.text.length;
  if (block.type === "paragraph") return 80 + block.text.length;
  if (block.type === "bullets" || block.type === "numbered") return 110 + block.items.join("").length * 1.1;
  if (block.type === "callout") return 170 + block.text.length;
  return 100;
}

function packTextBlocks(blocks, maxWeight = 1040) {
  const chunks = [];
  let current = [];
  let weight = 0;
  for (const block of blocks) {
    const nextWeight = blockWeight(block);
    if (current.length && weight + nextWeight > maxWeight) {
      chunks.push(current);
      current = [];
      weight = 0;
    }
    current.push(block);
    weight += nextWeight;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

function composeSourceSlide(sectionTitle, sourceSlide) {
  const blocks = sourceSlide.blocks.flatMap(expandBlock);
  const output = [];
  let pendingText = [];
  let titleAvailable = Boolean(sourceSlide.slideTitle);
  let subtitleAvailable = Boolean(sourceSlide.slideSubtitle);

  const makeSlide = (slideBlocks, layout = "text") => {
    const slide = {
      kind: "content",
      sectionTitle,
      slideTitle: titleAvailable ? sourceSlide.slideTitle : "",
      slideSubtitle: subtitleAvailable ? sourceSlide.slideSubtitle : "",
      blocks: slideBlocks,
      layout,
    };
    titleAvailable = false;
    subtitleAvailable = false;
    output.push(slide);
  };

  const flushText = () => {
    for (const chunk of packTextBlocks(pendingText)) makeSlide(chunk, "text");
    pendingText = [];
  };

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (isTextBlock(block)) {
      pendingText.push(block);
      continue;
    }

    if (isDedicatedVisual(block)) {
      flushText();
      makeSlide([block], block.type === "image" ? "image-only" : `${block.type}-only`);
      continue;
    }

    if (isCompactVisual(block)) {
      if (pendingText.length) {
        const chunks = packTextBlocks(pendingText, 650);
        for (const chunk of chunks.slice(0, -1)) makeSlide(chunk, "text");
        const nearestText = chunks.at(-1) || [];
        makeSlide([...nearestText, block], `${block.type}-after`);
        pendingText = [];
        continue;
      }

      const following = [];
      let cursor = index + 1;
      while (cursor < blocks.length && isTextBlock(blocks[cursor])) {
        following.push(blocks[cursor]);
        cursor += 1;
      }
      if (following.length) {
        const chunks = packTextBlocks(following, 650);
        makeSlide([block, ...chunks[0]], `${block.type}-before`);
        for (const chunk of chunks.slice(1)) makeSlide(chunk, "text");
        index = cursor - 1;
      } else {
        makeSlide([block], `${block.type}-only`);
      }
      continue;
    }

    flushText();
    makeSlide([block], `${block.type}-only`);
  }

  flushText();
  return output;
}

function composeSlides(lecture) {
  const slides = [{ kind: "overview", title: lecture.overview.title, overview: lecture.overview, sections: lecture.sections.map((section) => section.sectionTitle) }];
  for (const section of lecture.sections) {
    slides.push({ kind: "section", sectionTitle: section.sectionTitle });
    for (const sourceSlide of section.slides) slides.push(...composeSourceSlide(section.sectionTitle, sourceSlide));
  }
  return slides;
}

function renderSequenceRow(row) {
  return `<div class="sequence-row">${row.map((node, index) => `${index ? '<span class="sequence-arrow" aria-hidden="true">→</span>' : ""}<span class="sequence-node">${escapeHtml(node)}</span>`).join("")}</div>`;
}

function imageSource(images, slotId) {
  const item = images instanceof Map ? images.get(slotId) : images?.[slotId];
  if (typeof item === "string") return item;
  return clean(item?.dataUrl || item?.src);
}

function renderBlock(block, images) {
  if (block.type === "subtitle") return `<h3 class="content-subtitle">${escapeHtml(block.text)}</h3>`;
  if (block.type === "paragraph") return `<p class="body-copy">${escapeHtml(block.text)}</p>`;
  if (block.type === "bullets") return `<ul class="bullet-list">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  if (block.type === "numbered") return `<ol class="numbered-list">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
  if (block.type === "callout") return `<aside class="callout callout-${escapeHtml(block.tone)}"><strong>${escapeHtml(block.label || block.tone)}</strong><p>${escapeHtml(block.text)}</p></aside>`;
  if (block.type === "table") {
    const columns = tableColumnCount(block) || 1;
    const rows = block.rows.length + (block.headers.length ? 1 : 0) || 1;
    const head = block.headers.length ? `<thead><tr>${block.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>` : "";
    const body = `<tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<figure class="table-figure" style="--table-cols:${columns};--table-rows:${rows}"><figcaption>${escapeHtml(block.label)}</figcaption><div class="table-wrap"><table>${head}${body}</table></div></figure>`;
  }
  if (block.type === "diagram") return `<figure class="sequence"><figcaption>${escapeHtml(block.label)}</figcaption><div class="sequence-rows">${block.diagramRows.map(renderSequenceRow).join("")}</div></figure>`;
  if (block.type === "image") {
    const source = imageSource(images, block.slotId);
    const media = source
      ? `<img src="${escapeHtml(source)}" alt="${escapeHtml(block.label)}">`
      : `<div class="static-image-empty"><span>Image position</span><strong>${escapeHtml(block.label)}</strong><p>${escapeHtml(block.description)}</p></div>`;
    const sourceReference = block.sourceReference ? `<small>${escapeHtml(block.sourceReference)}</small>` : "";
    return `<figure class="lecture-image" data-fit="${escapeHtml(block.fit)}"><div class="lecture-image-frame">${media}</div><figcaption><strong>${escapeHtml(block.label)}</strong>${sourceReference}</figcaption></figure>`;
  }
  return "";
}

function renderSlideHeading(slide) {
  const title = slide.slideTitle ? `<h2 class="slide-title">${escapeHtml(slide.slideTitle)}</h2>` : "";
  const subtitle = slide.slideSubtitle ? `<h3 class="slide-subtitle">${escapeHtml(slide.slideSubtitle)}</h3>` : "";
  return title || subtitle ? `<div class="slide-heading">${title}${subtitle}</div>` : "";
}

function renderOverview(slide, index, total) {
  const intro = slide.overview.introduction ? `<p>${escapeHtml(slide.overview.introduction)}</p>` : "";
  const points = slide.overview.keyPoints.length ? `<ul>${slide.overview.keyPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>` : "";
  const toc = slide.sections.map((section, itemIndex) => `<li><span>${String(itemIndex + 1).padStart(2, "0")}</span><strong>${escapeHtml(section)}</strong></li>`).join("");
  return `<article class="slide overview-slide" aria-label="Slide ${index + 1} of ${total}"><header class="section-header"><h2>${escapeHtml(slide.title)}</h2></header><main class="overview-body"><div class="overview-info"><h1>${escapeHtml(slide.title)}</h1>${intro}${points}</div><nav class="toc" aria-label="Lecture contents"><span>Contents</span><ol>${toc}</ol></nav></main><footer class="slide-footer"><span>${escapeHtml(slide.title)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer></article>`;
}

function renderContentSlide(slide, index, total, images) {
  const heading = renderSlideHeading(slide);
  const visual = slide.blocks.find((block) => ["table", "diagram", "image"].includes(block.type));
  const textBlocks = slide.blocks.filter((block) => block !== visual);
  let content;

  if (slide.layout === "text") {
    content = `<div class="text-zone">${heading}${slide.blocks.map((block) => renderBlock(block, images)).join("")}</div>`;
  } else if (slide.layout === "table-after" || slide.layout === "table-before") {
    content = `${heading}<div class="mixed-table-grid"><div class="text-zone">${textBlocks.map((block) => renderBlock(block, images)).join("")}</div><div class="visual-zone">${renderBlock(visual, images)}</div></div>`;
  } else if (slide.layout === "diagram-after" || slide.layout === "diagram-before") {
    content = `${heading}<div class="mixed-diagram-grid"><div class="text-zone">${textBlocks.map((block) => renderBlock(block, images)).join("")}</div><div class="visual-zone">${renderBlock(visual, images)}</div></div>`;
  } else {
    content = `${heading}<div class="visual-zone visual-zone-full">${slide.blocks.map((block) => renderBlock(block, images)).join("")}</div>`;
  }

  return `<article class="slide content-slide layout-${escapeHtml(slide.layout)}" aria-label="Slide ${index + 1} of ${total}"><header class="section-header"><h2>${escapeHtml(slide.sectionTitle)}</h2></header><main class="slide-body">${content}</main><footer class="slide-footer"><span>${escapeHtml(slide.sectionTitle)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer></article>`;
}

function renderSlide(slide, index, total, images) {
  if (slide.kind === "overview") return renderOverview(slide, index, total);
  if (slide.kind === "section") {
    return `<article class="slide section-slide" aria-label="Slide ${index + 1} of ${total}"><div><span>Section</span><h2>${escapeHtml(slide.sectionTitle)}</h2></div><footer class="slide-footer"><span>${escapeHtml(slide.sectionTitle)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer></article>`;
  }
  return renderContentSlide(slide, index, total, images);
}

function lectureCss() {
  return `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#171914;background:#11130f}*{box-sizing:border-box}html,body{margin:0;width:100%;min-width:280px;background:#11130f}.deck{display:block;width:100%;margin:0}.slide{display:block;width:100%;aspect-ratio:16/9;margin:0;position:relative;overflow:hidden;container-type:inline-size;background:#f6f7f1}.cover-slide{display:grid;grid-template-rows:1fr auto;padding:5cqw 6cqw;color:#fff;background:radial-gradient(circle at 80% 20%,#f5e240 0 12%,transparent 12.4%),linear-gradient(135deg,#11130f,#292d23)}.cover-main{align-self:center;max-width:82cqw;text-align:start}.cover-main h1{margin:0;font-size:6.2cqw;line-height:.94;letter-spacing:-.06em}.cover-main p{max-width:62cqw;margin:2.2cqw 0 0;color:#d4d8cc;font-size:1.6cqw;line-height:1.5}.cover-footer,.slide-footer{display:flex;justify-content:space-between;align-items:center;gap:2cqw;font-size:1cqw;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.content-slide,.overview-slide{display:grid;grid-template-rows:10% 1fr 7%;padding:0 4.7cqw;color:#1a1c17;background:linear-gradient(180deg,#f8f9f4,#eef0e8)}.section-header{display:flex;align-items:end;justify-content:flex-start;padding-bottom:.9cqw;border-bottom:.1cqw solid #d4d8ce}.section-header h2{margin:0;font-size:1.25cqw;line-height:1;font-weight:850;letter-spacing:.02em;color:#596055}.slide-body{min-height:0;padding:1.5cqw 0 1cqw;display:grid;align-content:stretch}.slide-heading{display:grid;gap:.75cqw;text-align:right;align-self:start}.slide-title{margin:0;padding-bottom:.8cqw;border-bottom:.16cqw solid #aeb4a7;font-size:2.65cqw;line-height:1.05;font-weight:900;letter-spacing:-.045em}.slide-subtitle,.content-subtitle{margin:0;font-size:1.65cqw;line-height:1.18;font-weight:850;letter-spacing:-.025em}.text-zone{min-height:0;display:grid;align-content:start;gap:1cqw;text-align:right}.body-copy{margin:0;font-size:1.45cqw;line-height:1.48;white-space:pre-wrap}.bullet-list,.numbered-list{margin:0;padding-inline-start:2.2cqw;display:grid;gap:.62cqw;font-size:1.38cqw;line-height:1.4;text-align:right}.bullet-list li,.numbered-list li{padding-inline-end:.35cqw}.bullet-list li::marker,.numbered-list li::marker{color:#8e8300;font-weight:850}.callout{padding:1.15cqw 1.35cqw;display:grid;grid-template-columns:7cqw 1fr;gap:1.2cqw;text-align:right;background:#fff;border-inline-start:.5cqw solid #f5e240;border-radius:.7cqw;box-shadow:0 .8cqw 2.5cqw #1719140f}.callout strong{font-size:.95cqw;text-transform:uppercase;letter-spacing:.08em}.callout p{margin:0;font-size:1.25cqw;line-height:1.42;white-space:pre-wrap}.callout-warning{border-inline-start-color:#d96645}.callout-info{border-inline-start-color:#4a80bd}.visual-zone{min-width:0;min-height:0;display:grid;place-items:center;align-content:center}.visual-zone-full{width:100%;height:100%}.mixed-table-grid{min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:2cqw;align-items:start}.layout-table-after .mixed-table-grid .visual-zone{grid-column:2;grid-row:1}.layout-table-after .mixed-table-grid .text-zone{grid-column:1;grid-row:1}.layout-table-before .mixed-table-grid .visual-zone{grid-column:1;grid-row:1}.layout-table-before .mixed-table-grid .text-zone{grid-column:2;grid-row:1}.mixed-diagram-grid{min-height:0;height:100%;display:grid;grid-template-rows:auto 1fr;gap:1.2cqw}.layout-diagram-before .mixed-diagram-grid .visual-zone{grid-row:1}.layout-diagram-before .mixed-diagram-grid .text-zone{grid-row:2}.layout-diagram-after .mixed-diagram-grid .text-zone{grid-row:1}.layout-diagram-after .mixed-diagram-grid .visual-zone{grid-row:2;align-self:end}.table-figure,.sequence{width:100%;height:100%;min-height:0;margin:0;display:grid;grid-template-rows:auto 1fr;gap:.65cqw}.table-figure figcaption,.sequence figcaption{font-size:1.05cqw;font-weight:850;text-align:center;letter-spacing:.02em}.table-wrap{min-height:0;overflow:hidden;border:.1cqw solid #cbd0c3;border-radius:.7cqw;background:#fff;display:grid;align-content:center}table{width:100%;height:auto;border-collapse:collapse;font-size:max(.55cqw,min(1.02cqw,calc(4.8cqw / var(--table-cols)),calc(7cqw / var(--table-rows))));line-height:1.25}th,td{padding:max(.25cqw,min(.75cqw,calc(4cqw / var(--table-rows)))) .7cqw;text-align:start;border-bottom:.07cqw solid #dfe2d9;overflow-wrap:anywhere}th{background:#20231c;color:#fff;font-weight:800}.sequence-rows{min-height:0;display:grid;align-content:center;gap:1cqw}.sequence-row{display:flex;align-items:stretch;justify-content:center;gap:.55cqw;min-width:0;flex-wrap:wrap}.sequence-node{min-width:10cqw;flex:1 1 13cqw;max-width:24cqw;padding:1cqw;display:grid;place-items:center;text-align:center;background:#fff;border:.1cqw solid #cbd0c3;border-radius:.7cqw;font-size:1.08cqw;line-height:1.3}.sequence-arrow{display:grid;place-items:center;color:#807600;font-size:1.7cqw;font-weight:850}.lecture-image{width:100%;height:100%;margin:0;display:grid;grid-template-rows:1fr auto;gap:.55cqw}.lecture-image-frame{width:100%;height:100%;min-height:0;overflow:hidden;display:grid;place-items:center;background:#fff;border:.1cqw solid #cbd0c3;border-radius:.9cqw;box-shadow:0 1cqw 3cqw #17191412}.lecture-image img{display:block;width:100%;height:100%;object-fit:contain;background:#f0f2eb}.lecture-image[data-fit="cover"] img{object-fit:cover}.lecture-image figcaption{display:flex;justify-content:center;align-items:center;gap:.8cqw;text-align:center;color:#4f554b}.lecture-image figcaption strong{font-size:1.05cqw}.lecture-image figcaption small{font-size:.82cqw}.static-image-empty{width:100%;height:100%;padding:2cqw;display:grid;place-items:center;align-content:center;gap:.6cqw;text-align:center;color:#656b60;background:repeating-linear-gradient(135deg,#f7f8f3,#f7f8f3 1.2cqw,#eef0e8 1.2cqw,#eef0e8 2.4cqw)}.static-image-empty span{font-size:.9cqw;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.static-image-empty strong{max-width:65cqw;font-size:1.55cqw;color:#343831}.static-image-empty p{max-width:58cqw;margin:0;font-size:1cqw;line-height:1.4}.slide-footer{border-top:.1cqw solid #d5d9cf;color:#74796d}.section-slide{display:grid;grid-template-rows:1fr auto;padding:6cqw;color:#fff;background:linear-gradient(145deg,#171914,#30352a)}.section-slide>div{align-self:center;text-align:start}.section-slide>div span{font-size:1.05cqw;font-weight:850;letter-spacing:.16em;text-transform:uppercase;color:#f5e240}.section-slide h2{max-width:82cqw;margin:1cqw 0 0;font-size:5.4cqw;line-height:.98;letter-spacing:-.058em}.section-slide .slide-footer{border-color:#ffffff30;color:#cfd3c8}.overview-body{min-height:0;padding:1.5cqw 0 1cqw;display:grid;grid-template-columns:1.05fr .95fr;gap:2.6cqw;align-items:start}.overview-info{text-align:right}.overview-info h1{margin:0 0 1cqw;font-size:3.1cqw;line-height:1;letter-spacing:-.05em}.overview-info p{margin:0 0 1cqw;font-size:1.25cqw;line-height:1.45}.overview-info ul{margin:0;padding-inline-start:2cqw;display:grid;gap:.55cqw;font-size:1.12cqw;line-height:1.35}.toc{min-height:0;padding:1.25cqw;background:#fff;border:.1cqw solid #d1d6ca;border-radius:.85cqw;box-shadow:0 .8cqw 2.5cqw #1719140d}.toc>span{display:block;margin-bottom:.75cqw;font-size:.85cqw;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#777d70}.toc ol{margin:0;padding:0;display:grid;gap:.55cqw;list-style:none}.toc li{display:grid;grid-template-columns:2.2cqw 1fr;gap:.7cqw;align-items:center;padding-bottom:.5cqw;border-bottom:.08cqw solid #e2e5dc}.toc li span{color:#8b8100;font-size:.9cqw;font-weight:900}.toc li strong{font-size:1.05cqw;line-height:1.2}.end-slide{display:grid;place-items:center;padding:6cqw;text-align:center;color:#fff;background:linear-gradient(145deg,#171914,#30352a)}.end-mark{width:7cqw;height:7cqw;display:grid;place-items:center;margin:0 auto 2cqw;color:#171914;background:#f5e240;border-radius:50%;font-size:3cqw;font-weight:900}.end-slide h2{margin:0;font-size:5.5cqw;letter-spacing:-.06em}.end-slide p{max-width:58cqw;margin:1.6cqw auto 0;color:#d2d7ca;font-size:1.45cqw;line-height:1.5;white-space:pre-wrap}@media(max-width:700px){.content-slide,.overview-slide{padding-inline:4cqw}.body-copy,.bullet-list,.numbered-list{font-size:1.65cqw}.mixed-table-grid{gap:1.2cqw}.overview-body{gap:1.5cqw}.callout{grid-template-columns:6cqw 1fr}.callout p{font-size:1.5cqw}}@media print{@page{size:16in 9in;margin:0}html,body{background:#fff}.slide{break-after:page;page-break-after:always;width:16in;height:9in;aspect-ratio:auto}.slide:last-child{break-after:auto;page-break-after:auto}}
`;
}

export function buildLectureHtml(input, images = new Map()) {
  const lecture = normalizeLectureData(input);
  const slides = composeSlides(lecture);
  const total = slides.length + 2;
  const filename = `${slugify(lecture.documentTitle)}.html`;
  const html = `<!doctype html>
<html lang="${lecture.direction === "rtl" ? "ar" : "en"}" dir="${lecture.direction}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${escapeHtml(lecture.documentTitle)} lecture">
<title>${escapeHtml(lecture.documentTitle)}</title>
<style>${lectureCss()}</style>
</head>
<body>
<main class="deck">
  <article class="slide cover-slide" aria-label="Cover slide"><div class="cover-main"><h1>${escapeHtml(lecture.documentTitle)}</h1><p>Responsive lecture slides prepared from the imported source file.</p></div><div class="cover-footer"><span>Lecture</span><span>16:9 responsive HTML</span></div></article>
  ${slides.map((slide, index) => renderSlide(slide, index + 1, total, images)).join("\n")}
  <article class="slide end-slide" aria-label="End slide"><div><div class="end-mark">✓</div><h2>End of lecture</h2><p>${escapeHtml(lecture.endNote)}</p></div></article>
</main>
</body>
</html>`;
  return { html, filename, title: lecture.documentTitle, slideCount: total, contentSlideCount: slides.length };
}
