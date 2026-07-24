const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));

const clean = (value) => String(value ?? "").replace(/\r\n?/g, "\n").trim();
const IMAGE_SIZES = new Set(["small", "medium", "large", "wide", "portrait", "square", "full"]);
const IMAGE_FITS = new Set(["contain", "cover"]);
const BLOCK_TYPES = new Set(["paragraph", "bullets", "numbered", "dividerTitle", "callout", "table", "diagram", "image"]);

const slugify = (value) => clean(value || "lecture")
  .normalize("NFKD")
  .replace(/[^\p{L}\p{N}]+/gu, "-")
  .replace(/^-+|-+$/g, "")
  .toLowerCase()
  .slice(0, 70) || "lecture";

function splitLongText(value, limit = 560) {
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
  if (!Array.isArray(value)) return [];
  return value.map((row) => stringArray(row)).filter((row) => row.length);
}

function normalizeBlock(block, index) {
  const type = BLOCK_TYPES.has(block?.type) ? block.type : "paragraph";
  const normalized = {
    type,
    text: clean(block?.text),
    label: clean(block?.label),
    tone: ["note", "warning", "info"].includes(block?.tone) ? block.tone : "note",
    items: stringArray(block?.items),
    headers: stringArray(block?.headers),
    rows: rowsArray(block?.rows),
    diagramRows: rowsArray(block?.diagramRows),
    slotId: clean(block?.slotId) || `image-${index + 1}`,
    size: IMAGE_SIZES.has(block?.size) ? block.size : "large",
    fit: IMAGE_FITS.has(block?.fit) ? block.fit : "contain",
    sourceReference: clean(block?.sourceReference),
  };
  if (type === "paragraph" && !normalized.text) normalized.text = normalized.label;
  if (type === "dividerTitle" && !normalized.text) normalized.text = normalized.label;
  if (type === "callout" && !normalized.text) normalized.text = normalized.label;
  if (type === "image" && !normalized.label) normalized.label = "Lecture image";
  return normalized;
}

export function normalizeLectureData(input) {
  if (!input || typeof input !== "object") throw new Error("The extracted lecture data is missing.");
  const documentTitle = clean(input.documentTitle) || "Lecture";
  const direction = input.direction === "rtl" ? "rtl" : "ltr";
  const endNote = clean(input.endNote) || "Lecture complete";
  const slides = [];
  const usedSlots = new Set();
  let imageCounter = 0;

  for (const rawSlide of Array.isArray(input.slides) ? input.slides : []) {
    const kind = rawSlide?.kind === "section" ? "section" : "content";
    const sectionTitle = clean(rawSlide?.sectionTitle) || "Overview";
    if (kind === "section") {
      slides.push({ kind, sectionTitle, blocks: [] });
      continue;
    }
    const blocks = [];
    for (const rawBlock of Array.isArray(rawSlide?.blocks) ? rawSlide.blocks : []) {
      const block = normalizeBlock(rawBlock, imageCounter);
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
    if (blocks.length) slides.push({ kind, sectionTitle, blocks });
  }

  if (!slides.length) {
    slides.push({ kind: "content", sectionTitle: "Overview", blocks: [{
      type: "paragraph", text: "Lecture content", label: "", tone: "note", items: [], headers: [], rows: [], diagramRows: [], slotId: "image-1", size: "large", fit: "contain", sourceReference: "",
    }] });
  }

  return { documentTitle, direction, endNote, slides };
}

function expandBlock(block) {
  if (block.type === "paragraph") return splitLongText(block.text, 560).map((text) => ({ ...block, text }));
  if (block.type === "bullets" || block.type === "numbered") {
    const chunks = [];
    for (let index = 0; index < block.items.length; index += 7) chunks.push({ ...block, items: block.items.slice(index, index + 7) });
    return chunks;
  }
  if (block.type === "table") {
    if (!block.rows.length) return [block];
    const chunks = [];
    for (let index = 0; index < block.rows.length; index += 6) chunks.push({ ...block, rows: block.rows.slice(index, index + 6) });
    return chunks;
  }
  if (block.type === "diagram") {
    const chunks = [];
    let rows = [];
    let nodes = 0;
    const flush = () => {
      if (rows.length) chunks.push({ ...block, diagramRows: rows });
      rows = [];
      nodes = 0;
    };
    for (const row of block.diagramRows) {
      for (let index = 0; index < row.length; index += 5) {
        const part = row.slice(index, index + 5);
        if (rows.length && nodes + part.length > 5) flush();
        rows.push(part);
        nodes += part.length;
        if (nodes >= 5) flush();
      }
    }
    flush();
    return chunks.length ? chunks : [block];
  }
  return [block];
}

function blockWeight(block) {
  if (block.type === "dividerTitle") return 130;
  if (block.type === "paragraph") return 90 + block.text.length;
  if (block.type === "bullets" || block.type === "numbered") return 110 + block.items.join("").length * 1.15;
  if (block.type === "callout") return 160 + block.text.length;
  if (block.type === "table") return 280 + block.rows.length * 95 + block.headers.join("").length;
  if (block.type === "diagram") return 250 + block.diagramRows.flat().join("").length;
  if (block.type === "image") return 1120;
  return 100;
}

function paginateSlides(lecture) {
  const output = [];
  const maxWeight = 1180;
  for (const slide of lecture.slides) {
    if (slide.kind === "section") {
      output.push(slide);
      continue;
    }
    const expanded = slide.blocks.flatMap(expandBlock);
    let current = { kind: "content", sectionTitle: slide.sectionTitle, blocks: [], weight: 0 };
    const flush = () => {
      if (current.blocks.length) output.push({ kind: current.kind, sectionTitle: current.sectionTitle, blocks: current.blocks });
      current = { kind: "content", sectionTitle: slide.sectionTitle, blocks: [], weight: 0 };
    };
    for (const block of expanded) {
      if (block.type === "image") {
        flush();
        output.push({ kind: "content", sectionTitle: slide.sectionTitle, blocks: [block] });
        continue;
      }
      const weight = blockWeight(block);
      if (current.blocks.length && current.weight + weight > maxWeight) flush();
      current.blocks.push(block);
      current.weight += weight;
    }
    flush();
  }
  return output;
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
  if (block.type === "paragraph") return `<p class="body-copy">${escapeHtml(block.text)}</p>`;
  if (block.type === "dividerTitle") return `<h3 class="divider-title">${escapeHtml(block.text)}</h3>`;
  if (block.type === "bullets") return `<ul class="bullet-list">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  if (block.type === "numbered") return `<ol class="numbered-list">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
  if (block.type === "callout") return `<aside class="callout callout-${escapeHtml(block.tone)}"><strong>${escapeHtml(block.label || block.tone)}</strong><p>${escapeHtml(block.text)}</p></aside>`;
  if (block.type === "table") {
    const head = block.headers.length ? `<thead><tr>${block.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>` : "";
    const body = `<tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<div class="table-wrap"><table>${head}${body}</table></div>`;
  }
  if (block.type === "diagram") return `<section class="sequence"><strong>${escapeHtml(block.label || "Diagram")}</strong><div class="sequence-rows">${block.diagramRows.map(renderSequenceRow).join("")}</div></section>`;
  if (block.type === "image") {
    const source = imageSource(images, block.slotId);
    const media = source
      ? `<img src="${escapeHtml(source)}" alt="${escapeHtml(block.label)}">`
      : `<div class="static-image-empty"><span>Image position</span><strong>${escapeHtml(block.label)}</strong></div>`;
    const sourceReference = block.sourceReference ? `<small>${escapeHtml(block.sourceReference)}</small>` : "";
    return `<figure class="lecture-image image-size-${escapeHtml(block.size)}" data-fit="${escapeHtml(block.fit)}"><div class="lecture-image-frame">${media}</div><figcaption><strong>${escapeHtml(block.label)}</strong>${sourceReference}</figcaption></figure>`;
  }
  return "";
}

function renderSlide(slide, index, total, images) {
  if (slide.kind === "section") {
    return `<article class="slide section-slide" aria-label="Slide ${index + 1} of ${total}"><div><span>Section</span><h2>${escapeHtml(slide.sectionTitle)}</h2></div><footer class="slide-footer"><span>${escapeHtml(slide.sectionTitle)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer></article>`;
  }
  return `<article class="slide content-slide" aria-label="Slide ${index + 1} of ${total}"><header class="slide-header"><h2>${escapeHtml(slide.sectionTitle)}</h2></header><main class="slide-body">${slide.blocks.map((block) => renderBlock(block, images)).join("")}</main><footer class="slide-footer"><span>${escapeHtml(slide.sectionTitle)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer></article>`;
}

function lectureCss() {
  return `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#171914;background:#11130f}*{box-sizing:border-box}html,body{margin:0;width:100%;min-width:280px;background:#11130f}.deck{display:block;width:100%;margin:0}.slide{display:block;width:100%;aspect-ratio:16/9;margin:0;position:relative;overflow:hidden;container-type:inline-size;background:#f6f7f1}.cover-slide{display:grid;grid-template-rows:1fr auto;padding:5cqw 6cqw;color:#fff;background:radial-gradient(circle at 80% 20%,#f5e240 0 12%,transparent 12.4%),linear-gradient(135deg,#11130f,#292d23)}.cover-main{align-self:center;max-width:82cqw}.cover-main h1{margin:0;font-size:6.2cqw;line-height:.94;letter-spacing:-.06em}.cover-main p{max-width:62cqw;margin:2.2cqw 0 0;color:#d4d8cc;font-size:1.6cqw;line-height:1.5}.cover-footer,.slide-footer{display:flex;justify-content:space-between;align-items:center;gap:2cqw;font-size:1cqw;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.content-slide{display:grid;grid-template-rows:16% 1fr 8%;padding:0 5.2cqw;color:#1a1c17;background:linear-gradient(180deg,#f8f9f4,#eef0e8)}.slide-header{display:flex;align-items:end;padding-bottom:1.5cqw;border-bottom:.12cqw solid #cfd4c7}.slide-header h2{margin:0;font-size:3.2cqw;line-height:1;letter-spacing:-.045em}.slide-body{min-height:0;padding:2.4cqw 0 1.7cqw;display:grid;align-content:center;gap:1.3cqw}.body-copy{margin:0;font-size:1.55cqw;line-height:1.48;white-space:pre-wrap}.divider-title{margin:0;padding:1.05cqw 0;border-block:.12cqw solid #aeb4a7;font-size:2.05cqw;line-height:1.1;letter-spacing:-.035em}.bullet-list,.numbered-list{margin:0;padding-inline-start:2.2cqw;display:grid;gap:.72cqw;font-size:1.48cqw;line-height:1.4}.bullet-list li::marker,.numbered-list li::marker{color:#8e8300;font-weight:850}.callout{padding:1.4cqw 1.6cqw;display:grid;grid-template-columns:8cqw 1fr;gap:1.4cqw;background:#fff;border-inline-start:.55cqw solid #f5e240;border-radius:.7cqw;box-shadow:0 .8cqw 2.5cqw #1719140f}.callout strong{font-size:1cqw;text-transform:uppercase;letter-spacing:.11em}.callout p{margin:0;font-size:1.43cqw;line-height:1.45;white-space:pre-wrap}.callout-warning{border-inline-start-color:#d96645}.callout-info{border-inline-start-color:#4a80bd}.table-wrap{max-height:38cqw;overflow:hidden;border:.1cqw solid #cbd0c3;border-radius:.7cqw;background:#fff}table{width:100%;border-collapse:collapse;font-size:1.12cqw;line-height:1.35}th,td{padding:.8cqw 1cqw;text-align:start;border-bottom:.08cqw solid #dfe2d9}th{background:#20231c;color:#fff;font-weight:800}.sequence{display:grid;gap:1cqw}.sequence>strong{font-size:1.15cqw;text-transform:uppercase;letter-spacing:.11em}.sequence-rows{display:grid;gap:1cqw}.sequence-row{display:flex;align-items:stretch;justify-content:center;gap:.65cqw;min-width:0}.sequence-node{min-width:0;flex:1;padding:1.15cqw;display:grid;place-items:center;text-align:center;background:#fff;border:.1cqw solid #cbd0c3;border-radius:.7cqw;font-size:1.12cqw;line-height:1.35}.sequence-arrow{display:grid;place-items:center;color:#807600;font-size:1.8cqw;font-weight:850}.lecture-image{--image-width:78cqw;--image-height:31cqw;width:min(var(--image-width),100%);justify-self:center;display:grid;gap:.65cqw;margin:0}.image-size-small{--image-width:40cqw;--image-height:18cqw}.image-size-medium{--image-width:58cqw;--image-height:25cqw}.image-size-large{--image-width:78cqw;--image-height:31cqw}.image-size-wide{--image-width:88cqw;--image-height:29cqw}.image-size-portrait{--image-width:34cqw;--image-height:34cqw}.image-size-square{--image-width:36cqw;--image-height:36cqw}.image-size-full{--image-width:89cqw;--image-height:36cqw}.lecture-image-frame{width:100%;height:var(--image-height);overflow:hidden;display:grid;place-items:center;background:#fff;border:.1cqw solid #cbd0c3;border-radius:1cqw;box-shadow:0 1cqw 3cqw #17191412}.lecture-image img{display:block;width:100%;height:100%;object-fit:contain;background:#f0f2eb}.lecture-image[data-fit="cover"] img{object-fit:cover}.static-image-empty{width:100%;height:100%;padding:2cqw;display:grid;place-items:center;align-content:center;gap:.6cqw;text-align:center;color:#656b60;background:repeating-linear-gradient(135deg,#f7f8f3,#f7f8f3 1.2cqw,#eef0e8 1.2cqw,#eef0e8 2.4cqw)}.static-image-empty span{font-size:.9cqw;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.static-image-empty strong{max-width:65cqw;font-size:1.45cqw;color:#343831}.lecture-image figcaption{display:grid;gap:.2cqw;text-align:center;color:#5d6258}.lecture-image figcaption strong{font-size:1.04cqw}.lecture-image figcaption small{font-size:.82cqw}.slide-footer{border-top:.1cqw solid #d5d9cf;color:#74796d}.section-slide{display:grid;grid-template-rows:1fr auto;padding:6cqw;color:#fff;background:linear-gradient(145deg,#171914,#30352a)}.section-slide>div{align-self:center}.section-slide>div span{font-size:1.05cqw;font-weight:850;letter-spacing:.16em;text-transform:uppercase;color:#f5e240}.section-slide h2{max-width:82cqw;margin:1cqw 0 0;font-size:5.4cqw;line-height:.98;letter-spacing:-.058em}.section-slide .slide-footer{border-color:#ffffff30;color:#cfd3c8}.end-slide{display:grid;place-items:center;padding:6cqw;text-align:center;color:#fff;background:linear-gradient(145deg,#171914,#30352a)}.end-mark{width:7cqw;height:7cqw;display:grid;place-items:center;margin:0 auto 2cqw;color:#171914;background:#f5e240;border-radius:50%;font-size:3cqw;font-weight:900}.end-slide h2{margin:0;font-size:5.5cqw;letter-spacing:-.06em}.end-slide p{max-width:58cqw;margin:1.6cqw auto 0;color:#d2d7ca;font-size:1.45cqw;line-height:1.5;white-space:pre-wrap}@media(max-width:700px){.content-slide{padding-inline:4.2cqw}.body-copy,.bullet-list,.numbered-list{font-size:1.72cqw}.callout{grid-template-columns:7cqw 1fr}.callout p{font-size:1.58cqw}}@media print{@page{size:16in 9in;margin:0}html,body{background:#fff}.slide{break-after:page;page-break-after:always;width:16in;height:9in;aspect-ratio:auto}.slide:last-child{break-after:auto;page-break-after:auto}}
`;
}

export function buildLectureHtml(input, images = new Map()) {
  const lecture = normalizeLectureData(input);
  const slides = paginateSlides(lecture);
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
