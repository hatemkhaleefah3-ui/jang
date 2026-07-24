import { parseLectureSource } from "./lecture-source-parser.js";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[character]));

const slugify = (value) => String(value || "lecture")
  .normalize("NFKD")
  .replace(/[^\p{L}\p{N}]+/gu, "-")
  .replace(/^-+|-+$/g, "")
  .toLowerCase()
  .slice(0, 70) || "lecture";

const clean = (value) => String(value ?? "").replace(/\r\n?/g, "\n").trim();
const lines = (value) => clean(value).split("\n").map((line) => line.trim()).filter(Boolean);
const hasRtl = (value) => /[\u0590-\u08ff]/.test(value);

function splitLongText(value, limit = 560) {
  const source = clean(value);
  if (!source) return [];
  if (source.length <= limit) return [source];

  const sentences = source.match(/[^.!?؟。]+[.!?؟。]+|[^.!?؟。]+$/gu)?.map((part) => part.trim()).filter(Boolean) || [source];
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > limit) {
      if (current) chunks.push(current);
      current = "";
      const words = sentence.split(/\s+/);
      let wordChunk = "";
      for (const word of words) {
        const candidate = wordChunk ? `${wordChunk} ${word}` : word;
        if (candidate.length > limit && wordChunk) {
          chunks.push(wordChunk);
          wordChunk = word;
        } else wordChunk = candidate;
      }
      if (wordChunk) chunks.push(wordChunk);
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > limit && current) {
      chunks.push(current);
      current = sentence;
    } else current = candidate;
  }

  if (current) chunks.push(current);
  return chunks;
}

function looksLikeHeading(value) {
  const text = clean(value);
  return text.length > 0
    && text.length <= 90
    && text.split(/\s+/).length <= 12
    && !/[.!?؟。:]$/.test(text);
}

function firstMeaningfulLine(source) {
  return String(source).split(/\r?\n/).map((line) => line.trim()).find((line) => line && !/^\[[^\]]+\]$/.test(line)) || "Lecture";
}

function plainTextUnits(source, title) {
  const sourceLines = String(source).replace(/\r\n?/g, "\n").split("\n");
  const titleIndex = sourceLines.findIndex((line) => line.trim() === title.trim());
  if (titleIndex >= 0 && looksLikeHeading(title)) sourceLines.splice(titleIndex, 1);

  const groups = sourceLines.join("\n").split(/\n\s*\n+/).map(clean).filter(Boolean);
  const units = [];

  for (const group of groups) {
    const groupLines = group.split("\n").map((line) => line.trim()).filter(Boolean);
    const bulletLines = groupLines.filter((line) => /^\s*(?:[-*•]|\d+[.)])\s+/.test(line));
    if (bulletLines.length === groupLines.length && groupLines.length > 1) {
      const items = groupLines.map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, ""));
      for (let index = 0; index < items.length; index += 7) units.push({ type: "list", items: items.slice(index, index + 7) });
      continue;
    }
    if (groupLines.length === 1 && looksLikeHeading(groupLines[0])) {
      units.push({ type: "heading", text: groupLines[0] });
      continue;
    }
    for (const paragraph of splitLongText(group, 560)) units.push({ type: "text", text: paragraph });
  }

  return units;
}

function tableUnits(block) {
  const headers = Array.isArray(block.headers) ? block.headers : [];
  const rows = Array.isArray(block.rows) ? block.rows : [];
  if (!headers.length && !rows.length) return splitLongText(block.content).map((text) => ({ type: "text", text }));
  const chunks = [];
  const rowsPerSlide = 6;
  for (let index = 0; index < Math.max(rows.length, 1); index += rowsPerSlide) {
    chunks.push({ type: "table", headers, rows: rows.slice(index, index + rowsPerSlide) });
  }
  return chunks;
}

function markedUnits(document) {
  const units = [];
  const ending = [];

  for (const block of document.blocks) {
    const content = clean(block.content);
    switch (block.type) {
      case "title":
      case "source-file":
        break;
      case "section":
      case "page":
      case "subtitle":
        if (content) units.push({ type: "heading", text: content });
        break;
      case "bullets":
      case "numbered":
      case "quick-review": {
        const items = (block.items || lines(content)).flatMap((item) => splitLongText(item, 230));
        for (let index = 0; index < items.length; index += 7) units.push({ type: "list", items: items.slice(index, index + 7) });
        break;
      }
      case "table":
        units.push(...tableUnits(block));
        break;
      case "warning":
      case "note":
      case "info":
      case "topic-map":
        for (const text of splitLongText(content, 480)) units.push({ type: "callout", label: block.type, text });
        break;
      case "diagram":
      case "pathway": {
        const sequenceItems = lines(block.structure || block.pathwayContent || content);
        const label = block.title || block.diagramType || block.pathwayType || block.type;
        for (let index = 0; index < Math.max(sequenceItems.length, 1); index += 5) units.push({ type: "sequence", label, items: sequenceItems.slice(index, index + 5) });
        break;
      }
      case "image":
        units.push({ type: "callout", label: block.label || "Image", text: clean(block.instructions || content) || block.label || "Image" });
        break;
      case "footer":
      case "end":
        if (content) ending.push(content);
        break;
      default:
        for (const text of splitLongText(content, 560)) units.push({ type: "text", text });
    }
  }

  return { units, ending };
}

function weight(unit) {
  if (unit.type === "heading") return 120;
  if (unit.type === "list") return 90 + unit.items.reduce((sum, item) => sum + item.length * 1.15, 0);
  if (unit.type === "table") return 260 + unit.rows.length * 90 + unit.headers.join("").length;
  if (unit.type === "sequence") return 220 + unit.items.join("").length * 1.05;
  if (unit.type === "callout") return 130 + unit.text.length * 1.05;
  return 80 + unit.text.length;
}

function paginate(units, fallbackTitle) {
  const slides = [];
  const maxWeight = 1180;
  let current = { title: fallbackTitle, units: [], weight: 0 };
  let activeTitle = fallbackTitle;
  let pendingHeading = false;

  const flush = (allowEmpty = false) => {
    if (!current.units.length && !(allowEmpty && pendingHeading)) return;
    slides.push(current);
    current = { title: activeTitle, units: [], weight: 0 };
    pendingHeading = false;
  };

  for (const unit of units) {
    if (unit.type === "heading") {
      flush(pendingHeading);
      activeTitle = unit.text;
      current = { title: activeTitle, units: [], weight: 0 };
      pendingHeading = true;
      continue;
    }

    const unitWeight = weight(unit);
    if (current.units.length && current.weight + unitWeight > maxWeight) flush();
    current.units.push(unit);
    current.weight += unitWeight;
    pendingHeading = false;
  }
  flush(pendingHeading);

  return slides.length ? slides : [{ title: fallbackTitle, units: [], weight: 0 }];
}

function renderUnit(unit) {
  if (unit.type === "list") return `<ul class="bullet-list">${unit.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  if (unit.type === "callout") return `<aside class="callout"><span>${escapeHtml(unit.label)}</span><p>${escapeHtml(unit.text)}</p></aside>`;
  if (unit.type === "table") {
    const head = unit.headers.length ? `<thead><tr>${unit.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>` : "";
    const body = `<tbody>${unit.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<div class="table-wrap"><table>${head}${body}</table></div>`;
  }
  if (unit.type === "sequence") return `<section class="sequence"><strong>${escapeHtml(unit.label)}</strong><div>${(unit.items.length ? unit.items : [unit.label]).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>`;
  return `<p class="body-copy">${escapeHtml(unit.text)}</p>`;
}

function renderSlide(slide, index, total) {
  return `<article class="slide content-slide" aria-label="Slide ${index + 1} of ${total}">
    <header class="slide-header"><span>JANG LECTURE</span><h2>${escapeHtml(slide.title)}</h2></header>
    <main class="slide-body">${slide.units.map(renderUnit).join("")}</main>
    <footer class="slide-footer"><span>${escapeHtml(slide.title)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer>
  </article>`;
}

function lectureCss() {
  return `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#171914;background:#11130f}*{box-sizing:border-box}html,body{margin:0;width:100%;min-width:280px;background:#11130f}body{overflow-x:hidden}.deck{width:100%;margin:0;padding:0}.slide{width:100%;aspect-ratio:16/9;margin:0;position:relative;overflow:hidden;container-type:inline-size;background:#f6f7f1}.cover-slide{display:grid;grid-template-rows:auto 1fr auto;padding:5cqw 6cqw;color:#fff;background:radial-gradient(circle at 80% 20%,#f5e240 0 12%,transparent 12.4%),linear-gradient(135deg,#11130f,#292d23)}.cover-kicker{font-size:1.1cqw;font-weight:800;letter-spacing:.17em;text-transform:uppercase;color:#f5e240}.cover-main{align-self:center;max-width:82cqw}.cover-main h1{margin:0;font-size:6.2cqw;line-height:.94;letter-spacing:-.06em}.cover-main p{max-width:62cqw;margin:2.2cqw 0 0;color:#d4d8cc;font-size:1.6cqw;line-height:1.5}.cover-footer,.slide-footer{display:flex;justify-content:space-between;align-items:center;font-size:1cqw;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.content-slide{display:grid;grid-template-rows:16% 1fr 8%;padding:0 5.2cqw;color:#1a1c17;background:linear-gradient(180deg,#f8f9f4,#eef0e8)}.slide-header{display:grid;grid-template-columns:18cqw 1fr;align-items:end;gap:2.4cqw;padding-bottom:1.5cqw;border-bottom:.12cqw solid #cfd4c7}.slide-header span{font-size:.95cqw;font-weight:850;letter-spacing:.16em;color:#74796d}.slide-header h2{margin:0;font-size:3.2cqw;line-height:1;letter-spacing:-.045em}.slide-body{min-height:0;padding:2.5cqw 0 1.8cqw;display:grid;align-content:center;gap:1.35cqw}.body-copy{margin:0;font-size:1.55cqw;line-height:1.48;white-space:pre-wrap}.bullet-list{margin:0;padding-left:2.2cqw;display:grid;gap:.75cqw;font-size:1.48cqw;line-height:1.4}.bullet-list li::marker{color:#9b8f00}.callout{padding:1.4cqw 1.6cqw;display:grid;grid-template-columns:8cqw 1fr;gap:1.5cqw;align-items:start;background:#fff;border-left:.55cqw solid #f5e240;border-radius:.7cqw;box-shadow:0 .8cqw 2.5cqw #1a1c170f}.callout>span{font-size:1cqw;font-weight:850;text-transform:uppercase;letter-spacing:.12em}.callout p{margin:0;font-size:1.45cqw;line-height:1.45;white-space:pre-wrap}.table-wrap{max-height:38cqw;overflow:hidden;border:.1cqw solid #cbd0c3;border-radius:.7cqw;background:#fff}table{width:100%;border-collapse:collapse;font-size:1.12cqw;line-height:1.35}th,td{padding:.8cqw 1cqw;text-align:start;border-bottom:.08cqw solid #dfe2d9}th{background:#20231c;color:#fff;font-weight:800}.sequence{display:grid;gap:1.2cqw}.sequence>strong{font-size:1.2cqw;text-transform:uppercase;letter-spacing:.11em}.sequence>div{display:flex;align-items:stretch;gap:1cqw}.sequence span{flex:1;padding:1.2cqw;display:grid;place-items:center;text-align:center;background:#fff;border:.1cqw solid #cbd0c3;border-radius:.7cqw;font-size:1.15cqw;line-height:1.35}.slide-footer{border-top:.1cqw solid #d5d9cf;color:#74796d}.end-slide{display:grid;place-items:center;padding:6cqw;text-align:center;color:#fff;background:linear-gradient(145deg,#171914,#30352a)}.end-mark{width:7cqw;height:7cqw;display:grid;place-items:center;margin:0 auto 2cqw;color:#171914;background:#f5e240;border-radius:50%;font-size:3cqw;font-weight:900}.end-slide h2{margin:0;font-size:5.5cqw;letter-spacing:-.06em}.end-slide p{max-width:58cqw;margin:1.6cqw auto 0;color:#d2d7ca;font-size:1.45cqw;line-height:1.5;white-space:pre-wrap}@media(max-width:700px){.content-slide{padding-inline:4.2cqw}.slide-header{grid-template-columns:15cqw 1fr}.slide-body{gap:1cqw}.callout{grid-template-columns:7cqw 1fr}.sequence>div{gap:.7cqw}.body-copy,.bullet-list{font-size:1.75cqw}.callout p{font-size:1.6cqw}}@media print{@page{size:16in 9in;margin:0}html,body{background:#fff}.slide{break-after:page;page-break-after:always;width:16in;height:9in;aspect-ratio:auto}.slide:last-child{break-after:auto;page-break-after:auto}}
`;
}

export function buildLectureHtml(input) {
  const source = clean(input);
  if (!source) throw new Error("Paste lecture content or import a text file first.");

  const document = parseLectureSource(source);
  const marked = document.blocks.some((block) => block.marker !== "UNMARKED");
  const markedTitle = document.blocks.find((block) => block.type === "title")?.content;
  const sourceLabel = clean(document.blocks.find((block) => block.type === "source-file")?.content) || "Lecture";
  const title = clean(markedTitle) || firstMeaningfulLine(source);
  const { units, ending } = marked ? markedUnits(document) : { units: plainTextUnits(source, title), ending: [] };
  const slides = paginate(units, title);
  const direction = hasRtl(source) ? "rtl" : "ltr";
  const filename = `${slugify(title)}.html`;
  const total = slides.length + 2;
  const endNote = ending.join("\n\n") || "Lecture complete";

  const html = `<!doctype html>
<html lang="${direction === "rtl" ? "ar" : "en"}" dir="${direction}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${escapeHtml(title)} lecture">
<title>${escapeHtml(title)}</title>
<style>${lectureCss()}</style>
</head>
<body>
<main class="deck">
  <article class="slide cover-slide" aria-label="Cover slide">
    <div class="cover-kicker">Jang lecture</div>
    <div class="cover-main"><h1>${escapeHtml(title)}</h1><p>Responsive lecture slides generated from the complete supplied content.</p></div>
    <div class="cover-footer"><span>${escapeHtml(sourceLabel)}</span><span>16:9 responsive HTML</span></div>
  </article>
  ${slides.map((slide, index) => renderSlide(slide, index + 1, total)).join("\n")}
  <article class="slide end-slide" aria-label="End slide"><div><div class="end-mark">✓</div><h2>End of lecture</h2><p>${escapeHtml(endNote)}</p></div></article>
</main>
</body>
</html>`;

  return { html, filename, title, slideCount: total, contentSlideCount: slides.length };
}
