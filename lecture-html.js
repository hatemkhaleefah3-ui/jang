import { parseLectureSource } from "./lecture-source-parser.js";

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const slug = (value) => String(value || "lecture").trim().replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "").toLowerCase() || "lecture";
const sourceAttr = (block) => block.sourcePrimary === false ? ` data-fragment-of="${esc(block.id)}"` : ` data-source-id="${esc(block.id)}"`;

function chunkText(value, limit = 720) {
  const text = String(value || "");
  if (text.length <= limit) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + limit, text.length);
    if (end < text.length) {
      const boundary = Math.max(text.lastIndexOf("\n", end), text.lastIndexOf(". ", end), text.lastIndexOf("; ", end), text.lastIndexOf(", ", end), text.lastIndexOf(" ", end));
      if (boundary > start + Math.floor(limit * .55)) end = boundary + 1;
    }
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

function expandBlock(block) {
  if (["paragraph", "note", "info", "warning", "topic-map", "subtitle"].includes(block.type)) {
    return chunkText(block.content).map((content, index) => ({ ...block, content, sourcePrimary: index === 0, fragmentIndex: index }));
  }
  if (["bullets", "numbered", "quick-review"].includes(block.type) && Array.isArray(block.items) && block.items.length > 6) {
    const pieces = [];
    for (let index = 0; index < block.items.length; index += 6) pieces.push({ ...block, items: block.items.slice(index, index + 6), content: block.items.slice(index, index + 6).join("\n"), sourcePrimary: index === 0, fragmentIndex: index / 6 });
    return pieces;
  }
  if (block.type === "table" && Array.isArray(block.rows) && block.rows.length > 4) {
    const pieces = [];
    for (let index = 0; index < block.rows.length; index += 4) pieces.push({ ...block, rows: block.rows.slice(index, index + 4), sourcePrimary: index === 0, fragmentIndex: index / 4 });
    return pieces;
  }
  return [{ ...block, sourcePrimary: true }];
}

function weight(block) {
  if (["image", "diagram", "pathway", "table"].includes(block.type)) return 52;
  if (["bullets", "numbered", "quick-review"].includes(block.type)) return 14 + (block.items?.length || 1) * 9;
  return 12 + Math.ceil(String(block.content || "").length / 34);
}

function paginate(blocks) {
  const slides = [];
  let current = { heading: "", blocks: [], weight: 0 };
  const flush = () => { if (current.heading || current.blocks.length) slides.push(current); current = { heading: "", blocks: [], weight: 0 }; };
  for (const original of blocks) {
    if (original.type === "page" || original.type === "section") {
      flush();
      current.heading = original.content || "Lecture";
      current.headingBlock = original;
      continue;
    }
    for (const block of expandBlock(original)) {
      const nextWeight = weight(block);
      if (current.blocks.length && current.weight + nextWeight > 100) flush();
      current.blocks.push(block);
      current.weight += nextWeight;
    }
  }
  flush();
  return slides;
}

function listItems(block) {
  const ordered = block.type === "numbered";
  const tag = ordered ? "ol" : "ul";
  return `<${tag} class="slide-list"${sourceAttr(block)}>${(block.items || []).map((item) => `<li>${esc(item)}</li>`).join("")}</${tag}>`;
}

function renderTable(block) {
  const headers = block.headers || [];
  const rows = block.rows || [];
  return `<div class="table-wrap"${sourceAttr(block)}><table><thead><tr>${headers.map((cell) => `<th>${esc(cell)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function renderDiagram(block) {
  const nodes = String(block.structure || block.diagramContent || block.content || "Diagram").split(/\r?\n/).filter(Boolean);
  return `<figure class="diagram"${sourceAttr(block)}><figcaption>${esc(block.title || block.label || block.diagramType || "Diagram")}</figcaption><div class="diagram-nodes">${nodes.map((node) => `<span>${esc(node.replace(/^\s*(?:[-*•]|[│├└─]+)\s*/, ""))}</span>`).join("")}</div></figure>`;
}

function renderPathway(block) {
  const nodes = String(block.pathwayContent || block.content || "").split(/\s*(?:→|->|\n)\s*/).filter(Boolean);
  return `<figure class="pathway"${sourceAttr(block)}><figcaption>${esc(block.pathwayType || "Pathway")}</figcaption><div>${nodes.map((node, index) => `<span>${esc(node)}</span>${index < nodes.length - 1 ? "<b>→</b>" : ""}`).join("")}</div></figure>`;
}

function renderBlock(block) {
  switch (block.type) {
    case "subtitle": return `<h3${sourceAttr(block)}>${esc(block.content)}</h3>`;
    case "bullets": case "numbered": return listItems(block);
    case "quick-review": return `<aside class="review"${sourceAttr(block)}><strong>Quick review</strong>${listItems({ ...block, sourcePrimary: false })}</aside>`;
    case "note": case "info": case "warning": case "topic-map": return `<aside class="callout ${esc(block.type)}"${sourceAttr(block)}><strong>${esc(block.type.replace("-", " "))}</strong><p>${esc(block.content)}</p></aside>`;
    case "table": return renderTable(block);
    case "diagram": return renderDiagram(block);
    case "pathway": return renderPathway(block);
    case "image": return `<figure class="image-note"${sourceAttr(block)}><div>IMAGE</div><figcaption><strong>${esc(block.label || "Image")}</strong>${block.instructions ? `<span>${esc(block.instructions)}</span>` : ""}</figcaption></figure>`;
    case "source-file": return `<p class="source-file"${sourceAttr(block)}>${esc(block.content)}</p>`;
    case "footer": case "end": return `<p class="end-copy"${sourceAttr(block)}>${esc(block.content)}</p>`;
    default: return `<p${sourceAttr(block)}>${esc(block.content)}</p>`;
  }
}

function deckCss() {
  return String.raw`
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#171813;background:#0e0f0d;font-synthesis:none}*{box-sizing:border-box}html,body{margin:0;min-width:320px;background:#0e0f0d}.slide-deck{width:100%;margin:0}.slide{position:relative;width:100vw;aspect-ratio:16/9;margin:0;overflow:hidden;padding:4.5cqw 5.5cqw;display:flex;flex-direction:column;background:#f7f7f1;container-type:inline-size}.slide:nth-child(4n+2){background:#efff5c}.slide:nth-child(4n+3){color:#f7f7f1;background:#171813}.slide:nth-child(4n+4){background:#e8ebff}.slide-header{display:flex;align-items:center;gap:2cqw;margin-bottom:2.5cqw}.slide-kicker{font-size:1.05cqw;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.slide-title{max-width:72%;margin:0;font-size:3.1cqw;line-height:1;letter-spacing:-.05em}.slide-number{margin-left:auto;font:700 1.1cqw ui-monospace,monospace}.slide-body{min-height:0;display:grid;align-content:center;gap:1.35cqw;flex:1}.slide-body>p{max-width:84ch;margin:0;font-size:1.55cqw;line-height:1.48;white-space:pre-wrap}.slide-body h3{margin:0;font-size:2.2cqw;line-height:1.08}.slide-list{margin:0;padding-left:2.2cqw;display:grid;gap:.72cqw;font-size:1.48cqw;line-height:1.35}.callout{padding:1.4cqw 1.6cqw;border:1px solid currentColor;border-radius:1.3cqw}.callout strong{display:block;margin-bottom:.55cqw;font-size:1cqw;letter-spacing:.1em;text-transform:uppercase}.callout p{margin:0;font-size:1.4cqw;line-height:1.4;white-space:pre-wrap}.review{padding:1.5cqw;border-radius:1.2cqw;background:#fff8}.review>strong{display:block;margin-bottom:.75cqw;font-size:1.15cqw}.table-wrap{overflow:hidden}.table-wrap table{width:100%;border-collapse:collapse;font-size:1.15cqw}.table-wrap th,.table-wrap td{padding:.65cqw .75cqw;border:1px solid currentColor;text-align:left}.diagram,.pathway,.image-note{margin:0;padding:1.3cqw;border:1px solid currentColor;border-radius:1.2cqw}.diagram figcaption,.pathway figcaption{margin-bottom:1cqw;font-size:1.1cqw;font-weight:850;text-transform:uppercase}.diagram-nodes,.pathway>div{display:flex;align-items:center;justify-content:center;gap:1cqw;flex-wrap:wrap}.diagram-nodes span,.pathway span{min-width:14cqw;padding:1cqw 1.2cqw;border:1px solid currentColor;border-radius:999px;text-align:center;font-size:1.2cqw}.pathway b{font-size:1.8cqw}.image-note{display:grid;grid-template-columns:13cqw 1fr;align-items:center;gap:1.4cqw}.image-note>div{height:8cqw;display:grid;place-items:center;border:1px dashed currentColor;border-radius:1cqw;font-size:1cqw;font-weight:900}.image-note figcaption{display:grid;gap:.5cqw}.image-note strong{font-size:1.6cqw}.image-note span{font-size:1.2cqw;white-space:pre-wrap}.cover{justify-content:space-between;color:#f7f7f1;background:#171813!important}.cover-mark{width:5cqw;aspect-ratio:1;display:grid;place-items:center;color:#171813;background:#efff5c;border-radius:1.3cqw;font-size:2.4cqw;font-weight:900}.cover-copy{display:grid;gap:1.4cqw}.cover h1{max-width:13ch;margin:0;font-size:7.2cqw;line-height:.88;letter-spacing:-.075em}.cover p{max-width:60ch;margin:0;color:#c5c7bc;font-size:1.45cqw;line-height:1.5;white-space:pre-wrap}.cover-meta{display:flex;justify-content:space-between;font-size:1cqw;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.end-slide{align-items:center;justify-content:center;text-align:center;background:#566cff!important;color:#fff}.end-slide span{font-size:1.1cqw;letter-spacing:.14em;text-transform:uppercase}.end-slide h2{margin:1cqw 0;font-size:6cqw;letter-spacing:-.06em}.end-copy{max-width:55ch;margin:0;font-size:1.5cqw;white-space:pre-wrap}@media(max-width:700px){.slide{padding:4cqw}.slide-title{max-width:78%;font-size:3.4cqw}.slide-body{gap:1cqw}.slide-body>p,.slide-list{font-size:1.75cqw}.callout p{font-size:1.6cqw}.cover h1{font-size:7.6cqw}}@media print{html,body{background:#fff}.slide{break-after:page;page-break-after:always;width:100vw;box-shadow:none}}
`;
}

export function verifyLectureHtml(html, document) {
  const expected = document.blocks.map((block) => block.id);
  const rendered = [...String(html).matchAll(/data-source-id="([^"]+)"/g)].map((match) => match[1]);
  return { valid: expected.length === rendered.length && expected.every((id, index) => id === rendered[index]), expected: expected.length, rendered: rendered.length };
}

export function buildLectureHtml(input) {
  const document = typeof input === "string" ? parseLectureSource(input) : input;
  if (!document?.blocks?.length) throw new Error("Lecture content is required.");
  const titleBlock = document.blocks.find((block) => block.type === "title");
  const title = titleBlock?.content?.trim() || document.source.split(/\r?\n/).find((line) => line.trim() && !/^\s*\[/.test(line))?.trim() || "Lecture";
  const coverTypes = new Set(["source-file", "title", "topic-map", "info"]);
  const endTypes = new Set(["footer", "end"]);
  const coverBlocks = [];
  const bodyBlocks = [];
  const endBlocks = [];
  let bodyStarted = false;
  for (const block of document.blocks) {
    if (!bodyStarted && coverTypes.has(block.type)) coverBlocks.push(block);
    else { bodyStarted = true; bodyBlocks.push(block); }
  }
  while (bodyBlocks.length && endTypes.has(bodyBlocks.at(-1).type)) endBlocks.unshift(bodyBlocks.pop());
  const titleInCover = coverBlocks.find((block) => block.type === "title");
  const coverContent = coverBlocks.map((block) => block.type === "title" ? `<h1${sourceAttr(block)}>${esc(block.content)}</h1>` : renderBlock(block)).join("");
  const pages = paginate(bodyBlocks);
  const cover = `<section class="slide cover"><div class="cover-mark">J</div><div class="cover-copy">${titleInCover ? coverContent : `<h1>${esc(title)}</h1>${coverContent}`}</div><div class="cover-meta"><span>Lecture</span><span>Responsive HTML · 16:9</span></div></section>`;
  const content = pages.map((page, index) => `<section class="slide"><header class="slide-header"><span class="slide-kicker">Lecture</span><h2 class="slide-title"${page.headingBlock ? sourceAttr(page.headingBlock) : ""}>${esc(page.heading || title)}</h2><span class="slide-number">${String(index + 1).padStart(2, "0")}</span></header><div class="slide-body">${page.blocks.map(renderBlock).join("")}</div></section>`).join("");
  const ending = `<section class="slide end-slide"><span>Lecture complete</span><h2>End</h2>${endBlocks.map(renderBlock).join("")}</section>`;
  const projectId = slug(title);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${deckCss()}</style></head><body><main class="slide-deck">${cover}${content}${ending}</main></body></html>`;
  const verification = verifyLectureHtml(html, document);
  if (!verification.valid) throw new Error(`Lecture verification failed: ${JSON.stringify(verification)}`);
  return { html, document, verification, filename: `${projectId}.html`, slideCount: pages.length + 2 };
}
