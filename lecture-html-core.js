import { parseLectureSource } from "./lecture-source-parser.js";
import { lectureCss } from "./lecture-html-style.js";
import { imageEditorScript } from "./lecture-html-editor.js";

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
const DEFAULT_SECTION_TITLE = "Overview";

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

function isDividerLine(value, character) {
  const text = String(value ?? "").trim();
  const escaped = character === "-" ? "\\-" : character;
  return new RegExp(`^${escaped}{5,}$`).test(text);
}

function firstMeaningfulLine(source) {
  const sourceLines = String(source).split(/\r?\n/).map((line) => line.trim());
  return sourceLines.find((line) => line
    && !/^\[[^\]]+\]$/.test(line)
    && !isDividerLine(line, "=")
    && !isDividerLine(line, "-")) || "Lecture";
}

function fallbackMarkedTitle(document, source) {
  const block = document.blocks.find((item) => !["source-file", "footer", "end"].includes(item.type) && clean(item.content));
  return block ? lines(block.content)[0] || "Lecture" : firstMeaningfulLine(source);
}

function normalTextUnits(value) {
  const groups = String(value).split(/\n\s*\n+/).map(clean).filter(Boolean);
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

function plainTextUnits(source, title) {
  const sourceLines = String(source).replace(/\r\n?/g, "\n").split("\n");
  const firstTitleIndex = sourceLines.findIndex((line) => line.trim() === title.trim());
  const titleIsDividerWrapped = firstTitleIndex > 0
    && firstTitleIndex + 1 < sourceLines.length
    && ((isDividerLine(sourceLines[firstTitleIndex - 1], "=") && isDividerLine(sourceLines[firstTitleIndex + 1], "="))
      || (isDividerLine(sourceLines[firstTitleIndex - 1], "-") && isDividerLine(sourceLines[firstTitleIndex + 1], "-")));
  if (firstTitleIndex >= 0 && looksLikeHeading(title) && !titleIsDividerWrapped) sourceLines.splice(firstTitleIndex, 1);

  const units = [];
  let buffer = [];
  const flushBuffer = () => {
    if (!buffer.length) return;
    units.push(...normalTextUnits(buffer.join("\n")));
    buffer = [];
  };

  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index];
    const next = sourceLines[index + 1];
    const after = sourceLines[index + 2];
    if (isDividerLine(line, "=") && clean(next) && isDividerLine(after, "=")) {
      flushBuffer();
      units.push({ type: "major-heading", text: clean(next) });
      index += 2;
      continue;
    }
    if (isDividerLine(line, "-") && clean(next) && isDividerLine(after, "-")) {
      flushBuffer();
      units.push({ type: "divider-heading", text: clean(next) });
      index += 2;
      continue;
    }
    buffer.push(line);
  }
  flushBuffer();

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

function sequenceRows(block) {
  const source = clean(block.structure || block.pathwayContent || block.content);
  const sourceLines = lines(source).filter((line) => {
    if (/^structure\s*:\s*$/i.test(line)) return false;
    if (/^(?:type|title)\s*:/i.test(line)) return false;
    return true;
  });

  const rows = [];
  for (const line of sourceLines) {
    const normalized = line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "");
    const nodes = /(?:→|⇒|⟶|->)/.test(normalized)
      ? normalized.split(/\s*(?:→|⇒|⟶|->)\s*/).map(clean).filter(Boolean)
      : [normalized];
    const expanded = nodes.flatMap((node) => splitLongText(node, 180));
    for (let index = 0; index < expanded.length; index += 5) rows.push(expanded.slice(index, index + 5));
  }

  return rows.length ? rows : [[sequenceLabel(block) || "Sequence"]];
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
        const rows = sequenceRows(block);
        const label = sequenceLabel(block);
        for (let index = 0; index < rows.length; index += 1) {
          units.push({ type: "sequence", label, rows: rows.slice(index, index + 1), forceBreak: index > 0 });
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
  if (unit.type === "subheading" || unit.type === "divider-heading") return 105;
  if (unit.type === "list") return 90 + unit.items.reduce((sum, item) => sum + item.length * 1.15, 0);
  if (unit.type === "table") return 260 + unit.rows.length * 90 + unit.headers.join("").length;
  if (unit.type === "sequence") return 210 + unit.rows.flat().join("").length * 1.05;
  if (unit.type === "callout") return 130 + unit.text.length * 1.05;
  if (unit.type === "image") return 1100;
  return 80 + unit.text.length;
}

function paginate(units) {
  const slides = [];
  const maxWeight = 1180;
  let activeTitle = DEFAULT_SECTION_TITLE;
  let current = { title: activeTitle, units: [], weight: 0 };

  const flush = () => {
    if (!current.units.length) return;
    slides.push(current);
    current = { title: activeTitle, units: [], weight: 0 };
  };

  for (const unit of units) {
    if (unit.type === "major-heading") {
      flush();
      activeTitle = unit.text;
      slides.push({ title: activeTitle, units: [{ type: "major-section", text: activeTitle }], weight: 0, major: true });
      current = { title: activeTitle, units: [], weight: 0 };
      continue;
    }

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
  if (unit.type === "major-section") return `<div class="major-section-title"><span>Section</span><strong>${escapeHtml(unit.text)}</strong></div>`;
  if (unit.type === "divider-heading") return `<h3 class="divider-heading"><span>${escapeHtml(unit.text)}</span></h3>`;
  if (unit.type === "subheading") return `<h3 class="content-subtitle">${escapeHtml(unit.text)}</h3>`;
  if (unit.type === "list") return `<ul class="bullet-list">${unit.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  if (unit.type === "callout") return `<aside class="callout"><span>${escapeHtml(unit.label)}</span><p>${escapeHtml(unit.text)}</p></aside>`;
  if (unit.type === "table") {
    const head = unit.headers.length ? `<thead><tr>${unit.headers.map((cell) => `<th scope="col">${escapeHtml(cell)}</th>`).join("")}</tr></thead>` : "";
    const body = `<tbody>${unit.rows.map((row) => `<tr>${row.map((cell, index) => `<td${index === 0 ? ' class="table-key"' : ""}>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
    return `<div class="table-wrap"><div class="table-accent" aria-hidden="true"></div><table class="lecture-table">${head}${body}</table></div>`;
  }
  if (unit.type === "sequence") {
    const rows = unit.rows.map((row) => `<div class="sequence-row">${row.map((item, index) => `${index ? '<span class="sequence-connector" aria-hidden="true">→</span>' : ""}<span class="sequence-node">${escapeHtml(item)}</span>`).join("")}</div>`).join("");
    return `<section class="sequence"><strong>${escapeHtml(unit.label)}</strong><div class="sequence-flow">${rows}</div></section>`;
  }
  if (unit.type === "image") return renderImage(unit);
  return `<p class="body-copy">${escapeHtml(unit.text)}</p>`;
}

function renderSlide(slide, index, total) {
  const slideClass = slide.major ? "slide content-slide major-section-slide" : "slide content-slide";
  return `<article class="${slideClass}" aria-label="Slide ${index + 1} of ${total}">
    <header class="slide-header"><h2>${escapeHtml(slide.title)}</h2></header>
    <main class="slide-body">${slide.units.map(renderUnit).join("")}</main>
    <footer class="slide-footer"><span>${escapeHtml(slide.title)}</span><span>${String(index + 1).padStart(2, "0")}</span></footer>
  </article>`;
}

export function buildLectureHtml(input) {
  const source = clean(input);
  if (!source) throw new Error("Paste lecture content or import a text file first.");

  const document = parseLectureSource(source);
  const marked = document.blocks.some((block) => block.marker !== "UNMARKED");
  const markedTitle = document.blocks.find((block) => block.type === "title")?.content;
  const title = clean(markedTitle) || (marked ? fallbackMarkedTitle(document, source) : firstMeaningfulLine(source));
  const markedResult = marked ? markedUnits(document) : { units: plainTextUnits(source, title), ending: [], sourceFile: "" };
  const slides = paginate(markedResult.units);
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
    <div class="image-sheet-header"><strong id="imageSheetTitle" data-image-sheet-title>Image</strong></div>
    <div class="image-sheet-actions" data-image-empty-actions>
      <button type="button" data-image-action="close">Close</button>
      <button type="button" class="primary" data-image-action="import">Import image</button>
    </div>
    <div class="image-sheet-actions" data-image-filled-actions hidden>
      <button type="button" data-image-action="close">Close</button>
      <button type="button" class="primary" data-image-action="change">Change image</button>
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
