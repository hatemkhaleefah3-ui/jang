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

function fallbackMarkedTitle(document, source) {
  const block = document.blocks.find((item) => !["source-file", "footer", "end"].includes(item.type) && clean(item.content));
  return block ? lines(block.content)[0] || "Lecture" : firstMeaningfulLine(source);
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

function sequenceLabel(block) {
  const values = [block.title, block.diagramType, block.pathwayType, block.type].map(clean).filter(Boolean);
  return [...new Set(values)].slice(0, 2).join(" · ");
}

function sequenceItems(block) {
  const source = clean(block.structure || block.pathwayContent || block.content);
  const sourceLines = lines(source).filter((line) => {
    if (/^structure\s*:\s*$/i.test(line)) return false;
    if (/^(?:type|title)\s*:/i.test(line)) return false;
    return true;
  });

  const items = sourceLines.flatMap((line) => {
    const normalized = line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "");
    const parts = /(?:→|⇒|⟶|->)/.test(normalized)
      ? normalized.split(/\s*(?:→|⇒|⟶|->)\s*/).filter(Boolean)
      : [normalized];
    return parts.flatMap((part) => splitLongText(part, 180));
  });

  return items.length ? items : [sequenceLabel(block) || "Sequence"];
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
        const items = sequenceItems(block);
        const label = sequenceLabel(block);
        for (let index = 0; index < items.length; index += 5) {
          units.push({ type: "sequence", label, items: items.slice(index, index + 5), forceBreak: index > 0 });
        }
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
        for (const text of splitLongText(content, 560)) units.push({ type: "text", text });
    }
  }

  return { units, ending, sourceFile: sourceFiles.join("\n") };
}

function weight(unit) {
  if (unit.type === "subheading") return 105;
  if (unit.type === "list") return 90 + unit.items.reduce((sum, item) => sum + item.length * 1.15, 0);
  if (unit.type === "table") return 260 + unit.rows.length * 90 + unit.headers.join("").length;
  if (unit.type === "sequence") return 220 + unit.items.join("").length * 1.05;
  if (unit.type === "callout") return 130 + unit.text.length * 1.05;
  if (unit.type === "image") return 1100;
  return 80 + unit.text.length;
}

function paginate(units, fallbackTitle) {
  const slides = [];
  const maxWeight = 1180;
  let activeTitle = fallbackTitle;
  let current = { title: fallbackTitle, units: [], weight: 0 };

  const flush = () => {
    if (!current.units.length) return;
    slides.push(current);
    current = { title: activeTitle, units: [], weight: 0 };
  };

  for (const unit of units) {
    if (unit.type === "heading") {
      flush();
      activeTitle = unit.text;
      current = { title: activeTitle, units: [], weight: 0 };
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

  return slides;
}

function renderImage(unit) {
  const instructions = unit.instructions
    ? `<small>${escapeHtml(unit.instructions)}</small>`
    : "";
  return `<figure class="image-placeholder image-size-${escapeHtml(unit.size)}" data-image-placeholder data-placeholder-id="${escapeHtml(unit.id)}" data-label="${escapeHtml(unit.label)}" data-image-fit="${escapeHtml(unit.fit)}">
    <button type="button" class="image-surface" data-image-surface aria-label="Add image for ${escapeHtml(unit.label)}">
      <span class="image-empty" data-image-empty><span class="image-plus" aria-hidden="true">+</span><strong>Add image</strong><small>${escapeHtml(unit.size)} placeholder</small></span>
      <img data-placeholder-image alt="${escapeHtml(unit.label)}" hidden>
    </button>
    <input type="file" accept="image/*" data-image-input hidden>
    <figcaption><strong>${escapeHtml(unit.label)}</strong>${instructions}</figcaption>
  </figure>`;
}

function renderUnit(unit) {
  if (unit.type === "subheading") return `<h3 class="content-subtitle">${escapeHtml(unit.text)}</h3>`;
  if (unit.type === "list") return `<ul class="bullet-list">${unit.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  if (unit.type === "callout") return `<aside class="callout"><span>${escapeHtml(unit.label)}</span><p>${escapeHtml(unit.text)}</p></aside>`;
  if (unit.type === "table") {
    const head = unit.headers.length ? `<thead><tr>${unit.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>` : "";
    const body = `<tbody>${unit.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<div class="table-wrap"><table>${head}${body}</table></div>`;
  }
  if (unit.type === "sequence") return `<section class="sequence"><strong>${escapeHtml(unit.label)}</strong><div>${unit.items.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>`;
  if (unit.type === "image") return renderImage(unit);
  return `<p class="body-copy">${escapeHtml(unit.text)}</p>`;
}

function renderSlide(slide, index, total) {
  return `<article class="slide content-slide" aria-label="Slide ${index + 1} of ${total}">
    <header class="slide-header"><h2>${escapeHtml(slide.title)}</h2></header>
    <main class="slide-body">${slide.units.map(renderUnit).join("")}</main>
    <footer class="slide-footer"><span>${escapeHtml(slide.title)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer>
  </article>`;
}

function lectureCss() {
  return `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#171914;background:#11130f}*{box-sizing:border-box}html,body{margin:0;width:100%;min-width:280px;background:#11130f}body{overflow-x:hidden}button{font:inherit}[hidden]{display:none!important}.deck{display:block;width:100%;margin:0;padding:0}.slide{display:block;width:100%;aspect-ratio:16/9;margin:0;position:relative;overflow:hidden;container-type:inline-size;background:#f6f7f1}.cover-slide{display:grid;grid-template-rows:1fr auto;padding:5cqw 6cqw;color:#fff;background:radial-gradient(circle at 80% 20%,#f5e240 0 12%,transparent 12.4%),linear-gradient(135deg,#11130f,#292d23)}.cover-main{align-self:center;max-width:82cqw}.cover-main h1{margin:0;font-size:6.2cqw;line-height:.94;letter-spacing:-.06em}.cover-main>p{max-width:62cqw;margin:2.2cqw 0 0;color:#d4d8cc;font-size:1.6cqw;line-height:1.5}.cover-source{max-width:70cqw;margin:1.4cqw 0 0!important;padding-top:1.2cqw;border-top:.1cqw solid #ffffff35;color:#f5e240!important;font-size:1.05cqw!important;line-height:1.35!important;white-space:pre-wrap}.cover-footer,.slide-footer{display:flex;justify-content:space-between;align-items:center;gap:2cqw;font-size:1cqw;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.cover-footer span:first-child{max-width:66cqw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.content-slide{display:grid;grid-template-rows:16% 1fr 8%;padding:0 5.2cqw;color:#1a1c17;background:linear-gradient(180deg,#f8f9f4,#eef0e8)}.slide-header{display:flex;align-items:end;padding-bottom:1.5cqw;border-bottom:.12cqw solid #cfd4c7}.slide-header h2{margin:0;font-size:3.2cqw;line-height:1;letter-spacing:-.045em}.slide-body{min-height:0;padding:2.5cqw 0 1.8cqw;display:grid;align-content:center;gap:1.35cqw}.content-subtitle{margin:0;font-size:2.05cqw;line-height:1.08;letter-spacing:-.035em;color:#555b50}.body-copy{margin:0;font-size:1.55cqw;line-height:1.48;white-space:pre-wrap}.bullet-list{margin:0;padding-inline-start:2.2cqw;display:grid;gap:.75cqw;font-size:1.48cqw;line-height:1.4}.bullet-list li::marker{color:#9b8f00}.callout{padding:1.4cqw 1.6cqw;display:grid;grid-template-columns:8cqw 1fr;gap:1.5cqw;align-items:start;background:#fff;border-inline-start:.55cqw solid #f5e240;border-radius:.7cqw;box-shadow:0 .8cqw 2.5cqw #1719140f}.callout>span{font-size:1cqw;font-weight:850;text-transform:uppercase;letter-spacing:.12em}.callout p{margin:0;font-size:1.45cqw;line-height:1.45;white-space:pre-wrap}.table-wrap{max-height:38cqw;overflow:hidden;border:.1cqw solid #cbd0c3;border-radius:.7cqw;background:#fff}table{width:100%;border-collapse:collapse;font-size:1.12cqw;line-height:1.35}th,td{padding:.8cqw 1cqw;text-align:start;border-bottom:.08cqw solid #dfe2d9}th{background:#20231c;color:#fff;font-weight:800}.sequence{display:grid;gap:1.2cqw}.sequence>strong{font-size:1.2cqw;text-transform:uppercase;letter-spacing:.11em}.sequence>div{display:grid;grid-template-columns:repeat(auto-fit,minmax(10cqw,1fr));align-items:stretch;gap:1cqw}.sequence span{min-width:0;padding:1.2cqw;display:grid;place-items:center;text-align:center;background:#fff;border:.1cqw solid #cbd0c3;border-radius:.7cqw;font-size:1.15cqw;line-height:1.35}.image-placeholder{--image-width:78cqw;--image-height:31cqw;width:min(var(--image-width),100%);justify-self:center;display:grid;gap:.75cqw;margin:0}.image-size-small{--image-width:40cqw;--image-height:18cqw}.image-size-medium{--image-width:58cqw;--image-height:25cqw}.image-size-large{--image-width:78cqw;--image-height:31cqw}.image-size-wide{--image-width:88cqw;--image-height:29cqw}.image-size-portrait{--image-width:34cqw;--image-height:34cqw}.image-size-square{--image-width:36cqw;--image-height:36cqw}.image-size-full{--image-width:89cqw;--image-height:36cqw}.image-surface{width:100%;height:var(--image-height);display:grid;place-items:center;padding:0;overflow:hidden;color:#4d5249;background:#fff;border:.16cqw dashed #aeb5a5;border-radius:1cqw;cursor:pointer;box-shadow:0 1cqw 3cqw #17191412;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.image-surface:hover,.image-surface:focus-visible{transform:translateY(-.2cqw);border-color:#7d8375;box-shadow:0 1.2cqw 3.5cqw #1719141c;outline:none}.image-empty{display:grid;justify-items:center;gap:.4cqw}.image-plus{width:4.4cqw;height:4.4cqw;display:grid;place-items:center;border-radius:50%;color:#171914;background:#f5e240;font-size:2.5cqw;font-weight:500}.image-empty strong{font-size:1.35cqw}.image-empty small{font-size:.9cqw;color:#7b8174;text-transform:capitalize}.image-placeholder img{display:block;width:100%;height:100%;object-fit:contain;background:#f0f2eb}.image-placeholder[data-image-fit="cover"] img{object-fit:cover}.image-placeholder figcaption{display:grid;gap:.25cqw;text-align:center;color:#5d6258}.image-placeholder figcaption strong{font-size:1.05cqw}.image-placeholder figcaption small{font-size:.85cqw;line-height:1.35}.slide-footer{border-top:.1cqw solid #d5d9cf;color:#74796d}.end-slide{display:grid;place-items:center;padding:6cqw;text-align:center;color:#fff;background:linear-gradient(145deg,#171914,#30352a)}.end-mark{width:7cqw;height:7cqw;display:grid;place-items:center;margin:0 auto 2cqw;color:#171914;background:#f5e240;border-radius:50%;font-size:3cqw;font-weight:900}.end-slide h2{margin:0;font-size:5.5cqw;letter-spacing:-.06em}.end-slide p{max-width:58cqw;margin:1.6cqw auto 0;color:#d2d7ca;font-size:1.45cqw;line-height:1.5;white-space:pre-wrap}.image-sheet-backdrop{position:fixed;inset:0;z-index:1000;display:grid;align-items:end;padding:1.2rem;background:#090a08a8;backdrop-filter:blur(4px)}.image-sheet{width:min(620px,100%);margin:0 auto;padding:1rem;border-radius:1.2rem 1.2rem .8rem .8rem;background:#f8f9f4;box-shadow:0 -20px 70px #0006}.image-sheet-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.3rem .2rem .9rem}.image-sheet-header strong{font-size:1rem}.image-sheet-close{width:2.5rem;height:2.5rem;border:0;border-radius:50%;background:#e7e9e1;cursor:pointer}.image-sheet-actions{display:grid;gap:.6rem}.image-sheet-actions button{min-height:3.25rem;padding:.8rem 1rem;text-align:start;border:1px solid #d2d7ca;border-radius:.8rem;background:#fff;cursor:pointer;font-weight:750}.image-sheet-actions button:hover{background:#eff1ea}.image-sheet-actions .danger{color:#9a352a}.image-save-bar{position:fixed;z-index:900;left:50%;bottom:max(1rem,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(520px,calc(100% - 2rem));display:grid;grid-template-columns:1fr 1fr;gap:.7rem;padding:.7rem;border:1px solid #ffffff24;border-radius:1rem;background:#171914f2;box-shadow:0 18px 55px #0008;backdrop-filter:blur(12px)}.image-save-bar button{min-height:3rem;border-radius:.7rem;border:1px solid #ffffff35;font-weight:800;cursor:pointer}.image-cancel{color:#fff;background:#292d25}.image-save{color:#171914;background:#f5e240;border-color:#f5e240!important}.image-save-status{grid-column:1/-1;margin:0;color:#cbd0c3;text-align:center;font-size:.78rem}.image-error{position:fixed;z-index:1100;left:50%;top:1rem;transform:translateX(-50%);max-width:calc(100% - 2rem);padding:.8rem 1rem;border-radius:.7rem;color:#fff;background:#9a352a;box-shadow:0 .7rem 2rem #0004;font-size:.9rem}@media(max-width:700px){.content-slide{padding-inline:4.2cqw}.slide-body{gap:1cqw}.callout{grid-template-columns:7cqw 1fr}.sequence>div{gap:.7cqw}.body-copy,.bullet-list{font-size:1.75cqw}.callout p{font-size:1.6cqw}.image-placeholder figcaption strong{font-size:1.25cqw}.image-placeholder figcaption small{font-size:1.05cqw}}@media print{@page{size:16in 9in;margin:0}html,body{background:#fff}.slide{break-after:page;page-break-after:always;width:16in;height:9in;aspect-ratio:auto}.slide:last-child{break-after:auto;page-break-after:auto}.image-sheet-backdrop,.image-save-bar,.image-error{display:none!important}}
`;
}

function imageEditorScript(filename) {
  return `(() => {
  const deck = document.querySelector(".deck");
  const sheet = document.querySelector("[data-image-sheet]");
  const sheetTitle = document.querySelector("[data-image-sheet-title]");
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
    sheetTitle.textContent = placeholder.dataset.label || "Image";
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
    return "<!doctype html>\\n" + clone.outerHTML;
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
      } else {
        downloadBlob(blob);
      }
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
      const placeholder = surface.closest("[data-image-placeholder]");
      if (placeholder.classList.contains("has-image")) openSheet(placeholder);
      else placeholder.querySelector("[data-image-input]").click();
      return;
    }

    const action = event.target.closest("[data-image-action]")?.dataset.imageAction;
    if (action === "close" || event.target === sheet) {
      closeSheet();
      return;
    }
    if (!action || !activePlaceholder) return;

    if (action === "change") {
      const input = activePlaceholder.querySelector("[data-image-input]");
      closeSheet();
      input.click();
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
  const slides = paginate(markedResult.units, title);
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
    <div class="image-sheet-actions">
      <button type="button" data-image-action="change">Change image</button>
      <button type="button" data-image-action="remove-image">Remove image</button>
      <button type="button" class="danger" data-image-action="remove-placeholder">Remove placeholder</button>
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
