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
const IMAGE_SIZES = new Set(["small", "medium", "large", "wide", "portrait", "square", "full"]);
const IMAGE_FITS = new Set(["contain", "cover"]);

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
      let wordChunk = "";
      for (const word of sentence.split(/\s+/)) {
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

function dividerKind(value) {
  const text = String(value ?? "").trim();
  if (/^={6,}$/.test(text)) return "section";
  if (/^-{6,}$/.test(text)) return "divider";
  return "";
}

function firstMeaningfulLine(source) {
  return String(source)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !/^\[[^\]]+\]$/.test(line) && !dividerKind(line)) || "Lecture";
}

function fallbackMarkedTitle(document, source) {
  const block = document.blocks.find((item) => !["source-file", "footer", "end"].includes(item.type) && clean(item.content));
  return block ? lines(block.content).find((line) => !dividerKind(line)) || "Lecture" : firstMeaningfulLine(source);
}

function textUnitsFromLines(source, { removeTitle = "" } = {}) {
  const sourceLines = String(source).replace(/\r\n?/g, "\n").split("\n");
  if (removeTitle) {
    const titleIndex = sourceLines.findIndex((line) => line.trim() === removeTitle.trim());
    const surrounded = titleIndex > 0
      && titleIndex + 1 < sourceLines.length
      && dividerKind(sourceLines[titleIndex - 1])
      && dividerKind(sourceLines[titleIndex - 1]) === dividerKind(sourceLines[titleIndex + 1]);
    if (titleIndex >= 0 && !surrounded && looksLikeHeading(removeTitle)) sourceLines.splice(titleIndex, 1);
  }

  const units = [];
  let buffer = [];

  const flushBuffer = () => {
    const groupLines = buffer.map((line) => line.trim()).filter(Boolean);
    buffer = [];
    if (!groupLines.length) return;

    const bulletLines = groupLines.filter((line) => /^\s*(?:[-*•]|\d+[.)])\s+/.test(line));
    if (bulletLines.length === groupLines.length && groupLines.length > 1) {
      const items = groupLines.map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, ""));
      for (let index = 0; index < items.length; index += 7) units.push({ type: "list", items: items.slice(index, index + 7) });
      return;
    }

    if (groupLines.length === 1 && looksLikeHeading(groupLines[0])) {
      units.push({ type: "heading", text: groupLines[0] });
      return;
    }

    for (const paragraph of splitLongText(groupLines.join("\n"), 560)) units.push({ type: "text", text: paragraph });
  };

  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index];
    const kind = dividerKind(line);
    const middle = sourceLines[index + 1]?.trim();
    const closingKind = dividerKind(sourceLines[index + 2]);

    if (kind && middle && closingKind === kind) {
      flushBuffer();
      units.push(kind === "section"
        ? { type: "section-break", text: middle }
        : { type: "divider-title", text: middle });
      index += 2;
      continue;
    }

    if (!line.trim()) flushBuffer();
    else buffer.push(line);
  }
  flushBuffer();
  return units;
}

function plainTextUnits(source, title) {
  return textUnitsFromLines(source, { removeTitle: title });
}

function tableUnits(block) {
  const headers = Array.isArray(block.headers) ? block.headers : [];
  const rows = Array.isArray(block.rows) ? block.rows : [];
  if (!headers.length && !rows.length) return textUnitsFromLines(block.content);
  const chunks = [];
  const rowsPerSlide = 6;
  for (let index = 0; index < Math.max(rows.length, 1); index += rowsPerSlide) {
    chunks.push({ type: "table", headers, rows: rows.slice(index, index + rowsPerSlide) });
  }
  return chunks;
}

function sequenceLabel(block) {
  const values = [block.title, block.diagramType, block.pathwayType, block.type].map(clean).filter(Boolean);
  return [...new Set(values)].slice(0, 2).join(" · ");
}

function sequenceRows(block) {
  const source = clean(block.type === "diagram" ? block.content : (block.pathwayContent || block.content));
  const sourceLines = source.split("\n").map((line) => line.trim()).filter((line) => {
    if (!line || dividerKind(line)) return false;
    if (/^structure\s*:\s*$/i.test(line)) return false;
    if (/^(?:type|title)\s*:/i.test(line)) return false;
    return true;
  });

  const rows = sourceLines.map((line) => {
    const normalized = line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "");
    const arrowParts = normalized.split(/\s*(?:→|⇒|⟶|⟹|->|=>)\s*/).filter(Boolean);
    if (arrowParts.length > 1) return arrowParts.flatMap((part) => splitLongText(part, 180));
    const pipeParts = normalized.split(/\s*\|\s*/).filter(Boolean);
    if (pipeParts.length > 1) return pipeParts.flatMap((part) => splitLongText(part, 180));
    return splitLongText(normalized, 180);
  }).filter((row) => row.length);

  return rows.length ? rows : [[sequenceLabel(block) || "Sequence"]];
}

function chunkSequenceRows(rows, maxNodes = 5) {
  const chunks = [];
  let currentRows = [];
  let currentCount = 0;

  const flush = () => {
    if (currentRows.length) chunks.push(currentRows);
    currentRows = [];
    currentCount = 0;
  };

  for (const row of rows) {
    const rowParts = [];
    for (let index = 0; index < row.length; index += maxNodes) rowParts.push(row.slice(index, index + maxNodes));
    for (const rowPart of rowParts) {
      if (currentRows.length && currentCount + rowPart.length > maxNodes) flush();
      currentRows.push(rowPart);
      currentCount += rowPart.length;
      if (currentCount >= maxNodes) flush();
    }
  }
  flush();
  return chunks;
}

function imageSize(block) {
  const size = clean(block.attributes?.size).toLowerCase();
  return IMAGE_SIZES.has(size) ? size : "large";
}

function imageFit(block) {
  const fit = clean(block.attributes?.fit).toLowerCase();
  return IMAGE_FITS.has(fit) ? fit : "contain";
}

function markedUnits(document) {
  const units = [];
  const ending = [];
  const sourceFiles = [];

  for (const block of document.blocks) {
    const content = clean(block.content);
    switch (block.type) {
      case "title":
        break;
      case "source-file":
        if (content) sourceFiles.push(content);
        break;
      case "section":
      case "page":
        if (content) units.push({ type: "heading", text: content });
        break;
      case "subtitle":
        if (content) units.push({ type: "subheading", text: content });
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
        const label = sequenceLabel(block);
        const chunks = chunkSequenceRows(sequenceRows(block));
        chunks.forEach((rows, index) => units.push({ type: "sequence", label, rows, forceBreak: index > 0 }));
        break;
      }
      case "image":
        units.push({
          type: "image",
          id: block.id,
          label: clean(block.label) || "Image",
          instructions: clean(block.instructions),
          size: imageSize(block),
          fit: imageFit(block),
          solo: true,
        });
        break;
      case "footer":
      case "end":
        if (content) ending.push(content);
        break;
      default:
        units.push(...textUnitsFromLines(content));
    }
  }

  return { units, ending, sourceFile: sourceFiles.join("\n") };
}

function weight(unit) {
  if (unit.type === "subheading" || unit.type === "divider-title") return 120;
  if (unit.type === "list") return 90 + unit.items.reduce((sum, item) => sum + item.length * 1.15, 0);
  if (unit.type === "table") return 260 + unit.rows.length * 90 + unit.headers.join("").length;
  if (unit.type === "sequence") return 220 + unit.rows.flat().join("").length * 1.05;
  if (unit.type === "callout") return 130 + unit.text.length * 1.05;
  if (unit.type === "image") return 1100;
  return 80 + unit.text.length;
}

function paginate(units, fallbackSection = "Overview") {
  const slides = [];
  const maxWeight = 1180;
  let activeSection = fallbackSection;
  let current = { kind: "content", title: activeSection, units: [], weight: 0 };

  const flush = () => {
    if (!current.units.length) return;
    slides.push(current);
    current = { kind: "content", title: activeSection, units: [], weight: 0 };
  };

  for (const unit of units) {
    if (unit.type === "section-break") {
      flush();
      activeSection = unit.text;
      slides.push({ kind: "section", title: activeSection, units: [], weight: 0 });
      current = { kind: "content", title: activeSection, units: [], weight: 0 };
      continue;
    }

    if (unit.type === "heading") {
      flush();
      activeSection = unit.text;
      current = { kind: "content", title: activeSection, units: [], weight: 0 };
      continue;
    }

    if (unit.solo) {
      flush();
      current.units.push(unit);
      current.weight = weight(unit);
      flush();
      continue;
    }

    if (unit.forceBreak && current.units.length) flush();
    const unitWeight = weight(unit);
    if (current.units.length && current.weight + unitWeight > maxWeight) flush();
    current.units.push(unit);
    current.weight += unitWeight;
  }
  flush();

  return slides.length ? slides : [{ kind: "content", title: fallbackSection, units: [{ type: "text", text: "Lecture content" }], weight: 100 }];
}

function renderImage(unit) {
  const instructions = unit.instructions ? `<small>${escapeHtml(unit.instructions)}</small>` : "";
  return `<figure class="image-placeholder image-size-${escapeHtml(unit.size)}" data-image-placeholder data-placeholder-id="${escapeHtml(unit.id)}" data-label="${escapeHtml(unit.label)}" data-image-fit="${escapeHtml(unit.fit)}">
    <button type="button" class="image-surface" data-image-surface aria-label="Open image options for ${escapeHtml(unit.label)}">
      <span class="image-empty" data-image-empty><span class="image-plus" aria-hidden="true">+</span><strong>Add image</strong><small>${escapeHtml(unit.size)} placeholder</small></span>
      <img data-placeholder-image alt="${escapeHtml(unit.label)}" hidden>
    </button>
    <input type="file" accept="image/*" class="image-file-input" data-image-input tabindex="-1" aria-hidden="true">
    <figcaption><strong>${escapeHtml(unit.label)}</strong>${instructions}</figcaption>
  </figure>`;
}

function renderSequence(unit) {
  const renderedRows = unit.rows.map((row) => `<div class="sequence-row">${row.map((item, index) => `${index ? '<span class="sequence-arrow" aria-hidden="true">→</span>' : ""}<span class="sequence-node">${escapeHtml(item)}</span>`).join("")}</div>`).join("");
  return `<section class="sequence"><strong>${escapeHtml(unit.label)}</strong><div class="sequence-rows">${renderedRows}</div></section>`;
}

function renderUnit(unit) {
  if (unit.type === "subheading") return `<h3 class="content-subtitle">${escapeHtml(unit.text)}</h3>`;
  if (unit.type === "divider-title") return `<h3 class="divider-title">${escapeHtml(unit.text)}</h3>`;
  if (unit.type === "list") return `<ul class="bullet-list">${unit.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  if (unit.type === "callout") return `<aside class="callout"><span>${escapeHtml(unit.label)}</span><p>${escapeHtml(unit.text)}</p></aside>`;
  if (unit.type === "table") {
    const head = unit.headers.length ? `<thead><tr>${unit.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>` : "";
    const body = `<tbody>${unit.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<div class="table-wrap"><table>${head}${body}</table></div>`;
  }
  if (unit.type === "sequence") return renderSequence(unit);
  if (unit.type === "image") return renderImage(unit);
  return `<p class="body-copy">${escapeHtml(unit.text)}</p>`;
}

function renderSlide(slide, index, total) {
  if (slide.kind === "section") {
    return `<article class="slide section-slide" aria-label="Slide ${index + 1} of ${total}">
      <main class="section-slide-main"><span>Section</span><h2>${escapeHtml(slide.title)}</h2></main>
      <footer class="slide-footer"><span>${escapeHtml(slide.title)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer>
    </article>`;
  }

  return `<article class="slide content-slide" aria-label="Slide ${index + 1} of ${total}">
    <header class="slide-header"><h2>${escapeHtml(slide.title)}</h2></header>
    <main class="slide-body">${slide.units.map(renderUnit).join("")}</main>
    <footer class="slide-footer"><span>${escapeHtml(slide.title)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer>
  </article>`;
}

function lectureCss() {
  return `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#171914;background:#11130f}*{box-sizing:border-box}html,body{margin:0;width:100%;min-width:280px;background:#11130f}body{overflow-x:hidden}button{font:inherit}[hidden]{display:none!important}.deck{display:block;width:100%;margin:0;padding:0}.slide{display:block;width:100%;aspect-ratio:16/9;margin:0;position:relative;overflow:hidden;container-type:inline-size;background:#f6f7f1}.cover-slide{display:grid;grid-template-rows:1fr auto;padding:5cqw 6cqw;color:#fff;background:radial-gradient(circle at 80% 20%,#f5e240 0 12%,transparent 12.4%),linear-gradient(135deg,#11130f,#292d23)}.cover-main{align-self:center;max-width:82cqw}.cover-main h1{margin:0;font-size:6.2cqw;line-height:.94;letter-spacing:-.06em}.cover-main>p{max-width:62cqw;margin:2.2cqw 0 0;color:#d4d8cc;font-size:1.6cqw;line-height:1.5}.cover-source{max-width:70cqw;margin:1.4cqw 0 0!important;padding-top:1.2cqw;border-top:.1cqw solid #ffffff35;color:#f5e240!important;font-size:1.05cqw!important;line-height:1.35!important;white-space:pre-wrap}.cover-footer,.slide-footer{display:flex;justify-content:space-between;align-items:center;gap:2cqw;font-size:1cqw;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.cover-footer span:first-child{max-width:66cqw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.content-slide{display:grid;grid-template-rows:16% 1fr 8%;padding:0 5.2cqw;color:#1a1c17;background:linear-gradient(180deg,#f8f9f4,#eef0e8)}.slide-header{display:flex;align-items:end;padding-bottom:1.5cqw;border-bottom:.12cqw solid #cfd4c7}.slide-header h2{margin:0;font-size:3.2cqw;line-height:1;letter-spacing:-.045em}.slide-body{min-height:0;padding:2.5cqw 0 1.8cqw;display:grid;align-content:center;gap:1.35cqw}.section-slide{display:grid;grid-template-rows:1fr 8%;padding:0 5.2cqw;color:#fff;background:radial-gradient(circle at 18% 22%,#f5e240 0 10%,transparent 10.4%),linear-gradient(135deg,#181b15,#32382b)}.section-slide-main{align-self:center;display:grid;gap:1.3cqw}.section-slide-main span{font-size:1.05cqw;font-weight:850;letter-spacing:.18em;text-transform:uppercase;color:#f5e240}.section-slide-main h2{max-width:82cqw;margin:0;font-size:5.6cqw;line-height:.98;letter-spacing:-.055em}.section-slide .slide-footer{border-top:.1cqw solid #ffffff28;color:#d4d8cc}.content-subtitle{margin:0;font-size:2.05cqw;line-height:1.08;letter-spacing:-.035em;color:#555b50}.divider-title{margin:0;padding:1.1cqw .3cqw;border-block:.14cqw solid #aeb5a5;font-size:2.15cqw;line-height:1.12;letter-spacing:-.035em;text-align:center;color:#33382f}.body-copy{margin:0;font-size:1.55cqw;line-height:1.48;white-space:pre-wrap}.bullet-list{margin:0;padding-inline-start:2.2cqw;display:grid;gap:.75cqw;font-size:1.48cqw;line-height:1.4}.bullet-list li::marker{color:#9b8f00}.callout{padding:1.4cqw 1.6cqw;display:grid;grid-template-columns:8cqw 1fr;gap:1.5cqw;align-items:start;background:#fff;border-inline-start:.55cqw solid #f5e240;border-radius:.7cqw;box-shadow:0 .8cqw 2.5cqw #1719140f}.callout>span{font-size:1cqw;font-weight:850;text-transform:uppercase;letter-spacing:.12em}.callout p{margin:0;font-size:1.45cqw;line-height:1.45;white-space:pre-wrap}.table-wrap{max-height:38cqw;overflow:hidden;border:.1cqw solid #cbd0c3;border-radius:.7cqw;background:#fff}table{width:100%;border-collapse:collapse;font-size:1.12cqw;line-height:1.35}th,td{padding:.8cqw 1cqw;text-align:start;border-bottom:.08cqw solid #dfe2d9}th{background:#20231c;color:#fff;font-weight:800}.sequence{display:grid;gap:1cqw}.sequence>strong{font-size:1.2cqw;text-transform:uppercase;letter-spacing:.11em}.sequence-rows{display:grid;gap:1cqw}.sequence-row{display:flex;align-items:center;justify-content:center;gap:.7cqw;min-width:0}.sequence-node{flex:1 1 0;min-width:0;max-width:18cqw;padding:1.2cqw;display:grid;place-items:center;text-align:center;background:#fff;border:.1cqw solid #cbd0c3;border-radius:.7cqw;font-size:1.15cqw;line-height:1.35;box-shadow:0 .5cqw 1.6cqw #1719140b}.sequence-arrow{flex:0 0 auto;display:grid;place-items:center;color:#8d8200;font-size:2.1cqw;font-weight:900;line-height:1}.image-placeholder{--image-width:78cqw;--image-height:31cqw;width:min(var(--image-width),100%);justify-self:center;display:grid;gap:.75cqw;margin:0}.image-size-small{--image-width:40cqw;--image-height:18cqw}.image-size-medium{--image-width:58cqw;--image-height:25cqw}.image-size-large{--image-width:78cqw;--image-height:31cqw}.image-size-wide{--image-width:88cqw;--image-height:29cqw}.image-size-portrait{--image-width:34cqw;--image-height:34cqw}.image-size-square{--image-width:36cqw;--image-height:36cqw}.image-size-full{--image-width:89cqw;--image-height:36cqw}.image-surface{width:100%;height:var(--image-height);display:grid;place-items:center;padding:0;overflow:hidden;color:#4d5249;background:#fff;border:.16cqw dashed #aeb5a5;border-radius:1cqw;cursor:pointer;box-shadow:0 1cqw 3cqw #17191412;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.image-surface:hover,.image-surface:focus-visible{transform:translateY(-.2cqw);border-color:#7d8375;box-shadow:0 1.2cqw 3.5cqw #1719141c;outline:none}.image-empty{display:grid;justify-items:center;gap:.4cqw}.image-plus{width:4.4cqw;height:4.4cqw;display:grid;place-items:center;border-radius:50%;color:#171914;background:#f5e240;font-size:2.5cqw;font-weight:500}.image-empty strong{font-size:1.35cqw}.image-empty small{font-size:.9cqw;color:#7b8174;text-transform:capitalize}.image-placeholder img{display:block;width:100%;height:100%;object-fit:contain;background:#f0f2eb}.image-placeholder[data-image-fit="cover"] img{object-fit:cover}.image-placeholder figcaption{display:grid;gap:.25cqw;text-align:center;color:#5d6258}.image-placeholder figcaption strong{font-size:1.05cqw}.image-placeholder figcaption small{font-size:.85cqw;line-height:1.35}.image-file-input{position:fixed!important;inset:auto auto 0 0!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}.slide-footer{border-top:.1cqw solid #d5d9cf;color:#74796d}.end-slide{display:grid;place-items:center;padding:6cqw;text-align:center;color:#fff;background:linear-gradient(145deg,#171914,#30352a)}.end-mark{width:7cqw;height:7cqw;display:grid;place-items:center;margin:0 auto 2cqw;color:#171914;background:#f5e240;border-radius:50%;font-size:3cqw;font-weight:900}.end-slide h2{margin:0;font-size:5.5cqw;letter-spacing:-.06em}.end-slide p{max-width:58cqw;margin:1.6cqw auto 0;color:#d2d7ca;font-size:1.45cqw;line-height:1.5;white-space:pre-wrap}.image-sheet-backdrop{position:fixed;inset:0;z-index:1000;display:grid;align-items:end;padding:1.2rem;background:#090a08a8;backdrop-filter:blur(4px)}.image-sheet{width:min(620px,100%);margin:0 auto;padding:1rem;border-radius:1.2rem 1.2rem .8rem .8rem;background:#f8f9f4;box-shadow:0 -20px 70px #0006}.image-sheet-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.3rem .2rem .9rem}.image-sheet-header strong{font-size:1rem}.image-sheet-close{width:2.5rem;height:2.5rem;border:0;border-radius:50%;background:#e7e9e1;cursor:pointer}.image-sheet-actions{display:grid;gap:.6rem}.image-sheet-actions button{min-height:3.25rem;padding:.8rem 1rem;text-align:start;border:1px solid #d2d7ca;border-radius:.8rem;background:#fff;cursor:pointer;font-weight:750}.image-sheet-actions button:hover{background:#eff1ea}.image-sheet-actions .primary{background:#f5e240;border-color:#d7c900;color:#171914}.image-sheet-actions .danger{color:#9a352a}.image-save-bar{position:fixed;z-index:900;left:50%;bottom:max(1rem,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(520px,calc(100% - 2rem));display:grid;grid-template-columns:1fr 1fr;gap:.7rem;padding:.7rem;border:1px solid #ffffff24;border-radius:1rem;background:#171914f2;box-shadow:0 18px 55px #0008;backdrop-filter:blur(12px)}.image-save-bar button{min-height:3rem;border-radius:.7rem;border:1px solid #ffffff35;font-weight:800;cursor:pointer}.image-cancel{color:#fff;background:#292d25}.image-save{color:#171914;background:#f5e240;border-color:#f5e240!important}.image-save-status{grid-column:1/-1;margin:0;color:#cbd0c3;text-align:center;font-size:.78rem}.image-error{position:fixed;z-index:1100;left:50%;top:1rem;transform:translateX(-50%);max-width:calc(100% - 2rem);padding:.8rem 1rem;border-radius:.7rem;color:#fff;background:#9a352a;box-shadow:0 .7rem 2rem #0004;font-size:.9rem}@media(max-width:700px){.content-slide,.section-slide{padding-inline:4.2cqw}.slide-body{gap:1cqw}.callout{grid-template-columns:7cqw 1fr}.body-copy,.bullet-list{font-size:1.75cqw}.callout p{font-size:1.6cqw}.sequence-row{gap:.45cqw}.sequence-node{font-size:1.3cqw;padding:1cqw}.sequence-arrow{font-size:2.4cqw}.image-placeholder figcaption strong{font-size:1.25cqw}.image-placeholder figcaption small{font-size:1.05cqw}}@media print{@page{size:16in 9in;margin:0}html,body{background:#fff}.slide{break-after:page;page-break-after:always;width:16in;height:9in;aspect-ratio:auto}.slide:last-child{break-after:auto;page-break-after:auto}.image-sheet-backdrop,.image-save-bar,.image-error{display:none!important}}
`;
}

function imageEditorScript(filename) {
  return `(() => {
  const deck = document.querySelector(".deck");
  const sheet = document.querySelector("[data-image-sheet]");
  const sheetTitle = document.querySelector("[data-image-sheet-title]");
  const emptyActions = document.querySelector("[data-image-actions-empty]");
  const filledActions = document.querySelector("[data-image-actions-filled]");
  const saveBar = document.querySelector("[data-image-save-bar]");
  const saveStatus = document.querySelector("[data-image-save-status]");
  const outputFilename = ${JSON.stringify(filename)};
  const history = [];
  let activePlaceholder = null;

  const setSaveBar = () => {
    saveBar.hidden = history.length === 0;
    saveStatus.textContent = history.length ? "Unsaved image changes" : "";
  };

  const showError = (message) => {
    const notice = document.createElement("div");
    notice.className = "image-error";
    notice.textContent = message;
    document.body.append(notice);
    setTimeout(() => notice.remove(), 3200);
  };

  const closeSheet = () => {
    sheet.hidden = true;
    activePlaceholder = null;
  };

  const openSheet = (placeholder) => {
    activePlaceholder = placeholder;
    const hasImage = placeholder.classList.contains("has-image");
    sheetTitle.textContent = placeholder.dataset.label || "Image";
    emptyActions.hidden = hasImage;
    filledActions.hidden = !hasImage;
    sheet.hidden = false;
  };

  const remember = () => {
    history.push(deck.innerHTML);
    if (history.length > 30) history.shift();
  };

  const markChanged = (message) => {
    setSaveBar();
    saveStatus.textContent = message;
  };

  const applyImage = (placeholder, source) => {
    const image = placeholder.querySelector("[data-placeholder-image]");
    const empty = placeholder.querySelector("[data-image-empty]");
    image.src = source || "";
    image.hidden = !source;
    empty.hidden = Boolean(source);
    placeholder.classList.toggle("has-image", Boolean(source));
  };

  const renumberSlides = () => {
    const slides = [...deck.querySelectorAll(".slide")];
    const total = slides.length;
    slides.forEach((slide, index) => {
      if (slide.classList.contains("cover-slide")) slide.setAttribute("aria-label", "Cover slide");
      else if (slide.classList.contains("end-slide")) slide.setAttribute("aria-label", "End slide");
      else {
        slide.setAttribute("aria-label", "Slide " + (index + 1) + " of " + total);
        const number = slide.querySelector(".slide-footer span:last-child");
        if (number) number.textContent = String(index + 1).padStart(2, "0");
      }
    });
  };

  const cleanupEmptySlides = () => {
    deck.querySelectorAll(".content-slide").forEach((slide) => {
      const body = slide.querySelector(".slide-body");
      if (body && !body.children.length) slide.remove();
    });
    renumberSlides();
  };

  const serialize = () => {
    const clone = document.documentElement.cloneNode(true);
    const clonedSheet = clone.querySelector("[data-image-sheet]");
    const clonedBar = clone.querySelector("[data-image-save-bar]");
    if (clonedSheet) clonedSheet.hidden = true;
    if (clonedBar) clonedBar.hidden = true;
    clone.querySelectorAll("[data-image-input]").forEach((input) => input.removeAttribute("value"));
    clone.querySelectorAll(".image-error").forEach((notice) => notice.remove());
    return "<!doctype html>" + String.fromCharCode(10) + clone.outerHTML;
  };

  const downloadBlob = (blob) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = outputFilename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const saveHtml = async () => {
    closeSheet();
    const blob = new Blob([serialize()], { type: "text/html;charset=utf-8" });
    try {
      if ("showSaveFilePicker" in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: outputFilename,
          types: [{ description: "HTML file", accept: { "text/html": [".html"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else downloadBlob(blob);
      history.length = 0;
      setSaveBar();
    } catch (error) {
      if (error && error.name === "AbortError") return;
      downloadBlob(blob);
      history.length = 0;
      setSaveBar();
    }
  };

  document.addEventListener("click", (event) => {
    const surface = event.target.closest("[data-image-surface]");
    if (surface) {
      openSheet(surface.closest("[data-image-placeholder]"));
      return;
    }

    const action = event.target.closest("[data-image-action]")?.dataset.imageAction;
    if (action === "close" || event.target === sheet) {
      closeSheet();
      return;
    }
    if (!action || !activePlaceholder) return;

    if (action === "import" || action === "change") {
      const input = activePlaceholder.querySelector("[data-image-input]");
      input.click();
      closeSheet();
      return;
    }
    if (action === "remove-image") {
      remember();
      applyImage(activePlaceholder, "");
      closeSheet();
      markChanged("Image removed. Save or cancel the last action.");
      return;
    }
    if (action === "remove-placeholder") {
      remember();
      activePlaceholder.remove();
      cleanupEmptySlides();
      closeSheet();
      markChanged("Placeholder removed. Save or cancel the last action.");
    }
  });

  document.addEventListener("change", (event) => {
    const input = event.target.closest("[data-image-input]");
    if (!input) return;
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("Choose an image file.");
      return;
    }
    if (file.size > 15000000) {
      showError("Choose an image smaller than 15 MB.");
      return;
    }

    const placeholder = input.closest("[data-image-placeholder]");
    const reader = new FileReader();
    reader.onload = () => {
      remember();
      applyImage(placeholder, reader.result);
      markChanged("Image added. Save the HTML file or cancel the last action.");
    };
    reader.onerror = () => showError("The image could not be read.");
    reader.readAsDataURL(file);
  });

  document.querySelector("[data-image-cancel]").addEventListener("click", () => {
    if (!history.length) return;
    deck.innerHTML = history.pop();
    renumberSlides();
    closeSheet();
    setSaveBar();
    if (history.length) saveStatus.textContent = "Last action cancelled. Earlier unsaved changes remain.";
  });

  document.querySelector("[data-image-save]").addEventListener("click", saveHtml);
  setSaveBar();
})();`;
}

export function buildLectureHtml(input) {
  const source = clean(input);
  if (!source) throw new Error("Paste lecture content or import a text file first.");

  const document = parseLectureSource(source);
  const marked = document.blocks.some((block) => block.marker !== "UNMARKED");
  const markedTitle = document.blocks.find((block) => block.type === "title")?.content;
  const title = clean(markedTitle) || (marked ? fallbackMarkedTitle(document, source) : firstMeaningfulLine(source));
  const markedResult = marked ? markedUnits(document) : { units: plainTextUnits(source, title), ending: [], sourceFile: "" };
  const slides = paginate(markedResult.units, "Overview");
  const direction = hasRtl(source) ? "rtl" : "ltr";
  const filename = `${slugify(title)}.html`;
  const total = slides.length + 2;
  const endNote = markedResult.ending.join("\n\n") || "Lecture complete";
  const sourceFile = clean(markedResult.sourceFile);

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
    <div class="cover-main"><h1>${escapeHtml(title)}</h1><p>Responsive lecture slides generated from the complete supplied content.</p>${sourceFile ? `<p class="cover-source">Source file\n${escapeHtml(sourceFile)}</p>` : ""}</div>
    <div class="cover-footer"><span>${sourceFile ? escapeHtml(lines(sourceFile)[0]) : "Lecture"}</span><span>16:9 responsive HTML</span></div>
  </article>
  ${slides.map((slide, index) => renderSlide(slide, index + 1, total)).join("\n")}
  <article class="slide end-slide" aria-label="End slide"><div><div class="end-mark">✓</div><h2>End of lecture</h2><p>${escapeHtml(endNote)}</p></div></article>
</main>
<div class="image-sheet-backdrop" data-image-sheet hidden>
  <section class="image-sheet" role="dialog" aria-modal="true" aria-labelledby="imageSheetTitle">
    <div class="image-sheet-header"><strong id="imageSheetTitle" data-image-sheet-title>Image</strong><button type="button" class="image-sheet-close" data-image-action="close" aria-label="Close">×</button></div>
    <div class="image-sheet-actions" data-image-actions-empty hidden>
      <button type="button" class="primary" data-image-action="import">Import image</button>
      <button type="button" data-image-action="close">Close</button>
    </div>
    <div class="image-sheet-actions" data-image-actions-filled hidden>
      <button type="button" class="primary" data-image-action="change">Change image</button>
      <button type="button" data-image-action="remove-image">Remove image</button>
      <button type="button" class="danger" data-image-action="remove-placeholder">Remove placeholder</button>
      <button type="button" data-image-action="close">Close</button>
    </div>
  </section>
</div>
<div class="image-save-bar" data-image-save-bar hidden>
  <button type="button" class="image-cancel" data-image-cancel>Cancel</button>
  <button type="button" class="image-save" data-image-save>Save</button>
  <p class="image-save-status" data-image-save-status aria-live="polite"></p>
</div>
<script>${imageEditorScript(filename)}</script>
</body>
</html>`;

  return { html, filename, title, slideCount: total, contentSlideCount: slides.length, sourceFile };
}
