import { parseLectureSource } from "./lecture-source-parser.js";
import { assertReferenceDesign } from "./reference-design-system.js";

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const nl2br = (value) => esc(value).replace(/\r?\n/g, "<br>");
const slug = (value) => String(value || "lecture").trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "lecture";

function blockWeight(block) {
  if (["table", "diagram", "pathway", "image"].includes(block.type)) return 5;
  if (["bullets", "numbered", "quick-review"].includes(block.type)) return Math.max(2, Math.ceil((block.items?.length || 1) / 3));
  if (["note", "info", "warning", "topic-map"].includes(block.type)) return 2;
  if (block.type === "paragraph") return Math.max(1, Math.ceil(block.content.length / 420));
  return 1;
}

function paginate(blocks, limit = 10) {
  const pages = [];
  let current = [];
  let weight = 0;
  const flush = () => { if (current.length) pages.push(current); current = []; weight = 0; };
  for (const block of blocks) {
    if (block.type === "page") { flush(); continue; }
    if (block.type === "section" && current.length) flush();
    const next = blockWeight(block);
    if (current.length && weight + next > limit) flush();
    current.push(block);
    weight += next;
  }
  flush();
  return pages;
}

function editable(text, tag = "p", className = "") {
  return `<${tag}${className ? ` class="${className}"` : ""} contenteditable="true" spellcheck="false">${nl2br(text)}</${tag}>`;
}

function renderCallout(block) {
  const label = block.type === "warning" ? "Warning" : block.type === "info" ? "Information" : block.type === "topic-map" ? "Topic map" : "Note";
  const icon = block.type === "warning" ? "!" : "i";
  return `<aside class="callout-note jang-flow" data-source-id="${block.id}" data-block-type="${block.type}"><span class="note-icon">${icon}</span><div class="note-content"><div class="note-label" contenteditable="true">${label}</div>${editable(block.content)}</div></aside>`;
}

function renderList(block, ordered = false) {
  const tag = ordered ? "ol" : "ul";
  const cls = ordered ? "text-steps" : "text-bulleted";
  return `<${tag} class="${cls} jang-flow" data-source-id="${block.id}" data-block-type="${block.type}" contenteditable="true" spellcheck="false">${(block.items || []).map((item) => `<li>${esc(item)}</li>`).join("")}</${tag}>`;
}

function renderTable(block) {
  const header = `<thead><tr>${block.headers.map((cell) => `<th contenteditable="true">${esc(cell)}</th>`).join("")}</tr></thead>`;
  const body = `<tbody>${block.rows.map((row) => `<tr>${row.map((cell) => `<td contenteditable="true">${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  return `<div class="table-wrap jang-flow jang-resizable" data-source-id="${block.id}" data-block-type="table"><div class="jang-block-tools"><button type="button" data-action="add-row">+ row</button><button type="button" data-action="add-col">+ column</button></div><table class="comparison-table">${header}${body}</table></div>`;
}

function pathwayNodes(block) {
  const source = block.pathwayContent || block.content;
  return source.split(/\s*(?:→|->)\s*/i).map((item) => item.trim()).filter(Boolean);
}

function renderPathway(block) {
  const nodes = pathwayNodes(block);
  const className = block.pathwayType === "closed-circle" ? "diagram-closed-circle" : block.pathwayType === "open-circle" ? "mindmap-open-arc" : block.pathwayType === "branched" ? "diagram-tree-hierarchy" : "diagram-linear-horizontal";
  return `<figure class="diagram-host ${className} jang-flow jang-resizable" data-source-id="${block.id}" data-block-type="pathway" data-pathway-type="${esc(block.pathwayType)}"><div class="diagram-label" contenteditable="true">Pathway</div><div class="jang-pathway">${nodes.map((node, index) => `<div class="jang-path-node" contenteditable="true" data-node-index="${index}">${esc(node)}</div>${index < nodes.length - 1 ? '<span class="jang-arrow" aria-hidden="true">→</span>' : ""}`).join("")}</div></figure>`;
}

function renderDiagram(block) {
  const title = block.title || "Diagram";
  const details = block.structure || block.content;
  return `<figure class="diagram-host diagram-tree-hierarchy jang-flow jang-resizable" data-source-id="${block.id}" data-block-type="diagram"><div class="diagram-label" contenteditable="true">${esc(block.diagramType || "Diagram")}</div><h3 contenteditable="true">${esc(title)}</h3><div class="jang-diagram-canvas" contenteditable="true" spellcheck="false">${nl2br(details)}</div>${block.sourceReference ? `<figcaption class="diagram-best-for" contenteditable="true">Source page or slide: ${esc(block.sourceReference)}</figcaption>` : ""}</figure>`;
}

function renderImage(block) {
  return `<figure class="img-side-text jang-flow jang-resizable" data-source-id="${block.id}" data-block-type="image"><div class="jang-image-placeholder"><img alt="${esc(block.label)}" hidden><span>Image placeholder</span><input type="file" accept="image/*" data-image-input></div><figcaption class="img-text-content"><h3 contenteditable="true">${esc(block.label)}</h3>${block.instructions ? editable(block.instructions) : ""}</figcaption></figure>`;
}

function renderBlock(block) {
  switch (block.type) {
    case "section": return `<div class="section-divider" data-source-id="${block.id}" data-block-type="section"><span class="divider-line"></span><span class="divider-label" contenteditable="true">${esc(block.content)}</span><span class="divider-line"></span></div>`;
    case "subtitle": return editable(block.content, "h3", "jang-subtitle").replace("<h3", `<h3 data-source-id="${block.id}" data-block-type="subtitle"`);
    case "paragraph": return editable(block.content, "p", "jang-paragraph").replace("<p", `<p data-source-id="${block.id}" data-block-type="paragraph"`);
    case "note": case "info": case "warning": case "topic-map": return renderCallout(block);
    case "bullets": return renderList(block, false);
    case "numbered": return renderList(block, true);
    case "quick-review": return `<div class="text-key-takeaways jang-flow" data-source-id="${block.id}" data-block-type="quick-review"><div class="takeaway-header" contenteditable="true">Quick review</div><ul class="takeaway-list" contenteditable="true">${(block.items || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>`;
    case "table": return renderTable(block);
    case "image": return renderImage(block);
    case "diagram": return renderDiagram(block);
    case "pathway": return renderPathway(block);
    case "source-file": return `<small class="jang-source-file" data-source-id="${block.id}" data-block-type="source-file" contenteditable="true">${esc(block.content)}</small>`;
    case "footer": case "end": return "";
    default: return editable(block.content, "p", "jang-paragraph").replace("<p", `<p data-source-id="${block.id}" data-block-type="${esc(block.type)}"`);
  }
}

function titleBlock(document) { return document.blocks.find((block) => block.type === "title"); }
function endBlock(document) { return [...document.blocks].reverse().find((block) => block.type === "footer" || block.type === "end"); }

function pageTitle(page, index) {
  return page.find((block) => block.type === "section")?.content || page.find((block) => block.type === "subtitle")?.content || `Lecture page ${index + 1}`;
}

function responsiveEditorCss() {
  return `
:root{--jang-width:100%;--jang-gap:clamp(.65rem,1.7vw,1rem)}
html{font-size:clamp(14px,1.25vw,18px)}body{align-items:stretch;padding:0;background:var(--page-bg-solid)}
.jang-project{width:min(100%,1100px);margin:0 auto;padding:clamp(.5rem,2vw,2rem);display:grid;gap:clamp(1rem,3vw,2rem)}
.page{width:100%;height:auto;min-height:min(1170px,130vw);overflow:visible}.page-body{gap:var(--jang-gap)}
.jang-flow{width:var(--jang-width);max-width:100%;resize:horizontal;overflow:auto}.jang-resizable{min-width:28%;max-width:100%}
.jang-block-tools{display:flex;gap:.35rem;justify-content:flex-end;padding:.35rem}.jang-block-tools button,.jang-toolbar button,.jang-image-placeholder input{font:500 .7rem var(--font-mono)}
.jang-toolbar{position:sticky;top:0;z-index:50;display:flex;gap:.5rem;flex-wrap:wrap;padding:.65rem;background:var(--surface-dark);border:1px solid var(--accent-border);border-radius:10px}
.jang-toolbar button{padding:.55rem .8rem;border:1px solid var(--accent-border-dark);border-radius:6px;background:var(--surface-gradient)}
.jang-image-placeholder{min-height:12rem;display:grid;place-items:center;gap:.5rem;border:2px dashed var(--accent-border-dark);border-radius:8px;background:#fff}.jang-image-placeholder img{width:100%;height:auto;max-height:32rem;object-fit:contain}
.jang-pathway{display:flex;align-items:center;justify-content:center;gap:.55rem;flex-wrap:wrap;width:100%}.jang-path-node{min-width:8rem;flex:1 1 10rem;padding:.8rem;border:1px solid var(--flow-box-border);border-radius:10px;background:var(--flow-box-bg);text-align:center}.jang-arrow{font-size:1.4rem;color:var(--flow-arrow)}
.jang-diagram-canvas{width:100%;min-height:12rem;padding:1rem;border:1px dashed var(--flow-box-border);border-radius:8px;white-space:pre-wrap}
[contenteditable="true"]:focus{outline:2px solid var(--accent-yellow);outline-offset:2px}.jang-source-file{display:block;color:var(--text-muted)}
@media(max-width:700px){.page-header,.page-footer{grid-template-columns:1fr}.category-tag,.page-number{justify-self:start}.img-side-text,.two-col,.three-col,.text-comparison-cols{grid-template-columns:1fr}.page-body,.page-header,.page-footer{padding-left:clamp(.8rem,4vw,1.4rem);padding-right:clamp(.8rem,4vw,1.4rem)}.jang-flow{width:100%!important;resize:none}}
@media print{.jang-toolbar,.jang-block-tools,input[type=file]{display:none!important}.jang-project{width:100%;padding:0}.page{break-after:page;box-shadow:none;min-height:100vh}}
`;
}

function editorScript(projectId) {
  return `(() => {
const root=document.querySelector('.jang-project');const key='jang-project:${projectId}';
const save=()=>{const copy=root.cloneNode(true);copy.querySelectorAll('input[type=file]').forEach(n=>n.remove());localStorage.setItem(key,copy.innerHTML);};
const restore=()=>{const value=localStorage.getItem(key);if(value&&confirm('Restore the last saved version of this project?'))root.innerHTML=value;};
const download=()=>{save();const blob=new Blob(['<!DOCTYPE html>\\n'+document.documentElement.outerHTML],{type:'text/html'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='${projectId}.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
document.addEventListener('click',e=>{const action=e.target?.dataset?.action;if(action==='save')save();if(action==='restore')restore();if(action==='download')download();if(action==='add-row'){const table=e.target.closest('[data-block-type=table]').querySelector('table');const cols=table.rows[0]?.cells.length||1;const row=table.tBodies[0].insertRow();for(let i=0;i<cols;i++){const cell=row.insertCell();cell.contentEditable='true';cell.textContent='';}}if(action==='add-col'){const table=e.target.closest('[data-block-type=table]').querySelector('table');[...table.rows].forEach((row,i)=>{const cell=i===0?document.createElement('th'):document.createElement('td');cell.contentEditable='true';cell.textContent='';row.append(cell);});}});
document.addEventListener('change',e=>{if(!e.target.matches('[data-image-input]'))return;const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const box=e.target.closest('.jang-image-placeholder');const img=box.querySelector('img');img.src=reader.result;img.hidden=false;box.querySelector('span').hidden=true;};reader.readAsDataURL(file);});
window.addEventListener('beforeunload',save);
})();`;
}

export function verifyEditableLectureHtml(html, document) {
  const ids = [...String(html).matchAll(/data-source-id="([^"]+)"/g)].map((match) => match[1]);
  const expected = document.blocks.filter((block) => !["footer", "end", "title"].includes(block.type)).map((block) => block.id);
  const missing = expected.filter((id) => !ids.includes(id));
  const duplicated = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  return { valid: missing.length === 0 && duplicated.length === 0, missing, duplicated, rendered: ids.length, expected: expected.length };
}

export function buildEditableLectureHtml(input, metadata = {}) {
  const document = typeof input === "string" ? parseLectureSource(input) : input;
  const design = assertReferenceDesign();
  const title = titleBlock(document);
  const ending = endBlock(document);
  const bodyBlocks = document.blocks.filter((block) => !["title", "footer", "end"].includes(block.type));
  const pages = paginate(bodyBlocks, Number(metadata.pageWeightLimit) || 10);
  const projectId = slug(metadata.projectId || title?.content || "lecture-project");
  const cover = title ? `<article class="page cover-page"><div class="cover-top-bar"><span class="course-code" contenteditable="true">${esc(metadata.courseCode || "COURSE")}</span><span class="term-tag" contenteditable="true">${esc(metadata.lectureLabel || "LECTURE")}</span></div><main class="cover-hero"><p class="cover-eyebrow">ACADEMIC LECTURE</p><div class="cover-rule"></div><h1 class="cover-title" data-source-id="${title.id}" data-block-type="title" contenteditable="true">${esc(title.content)}</h1><p class="cover-subtitle" contenteditable="true">${esc(metadata.subtitle || "")}</p></main><div class="cover-visual-strip"></div><div class="cover-bottom"><span contenteditable="true">${esc(metadata.courseCode || "Course")}</span><span contenteditable="true">${esc(metadata.instructor || "")}</span></div></article>` : "";
  const pageHtml = pages.map((page, index) => `<article class="page"><header class="page-header"><span class="course-label" contenteditable="true">${esc(metadata.courseCode || "COURSE")}</span><h2 class="page-title" contenteditable="true">${esc(pageTitle(page, index))}</h2><span class="category-tag" contenteditable="true">Lecture</span></header><main class="page-body">${page.map(renderBlock).join("")}</main><footer class="page-footer"><span class="footer-left" contenteditable="true">${esc(metadata.lectureLabel || "Lecture")}</span><span class="footer-center" contenteditable="true">${esc(title?.content || "")}</span><span class="page-number">${String(index + 1).padStart(2, "0")}</span></footer></article>`).join("");
  const end = ending ? `<article class="page end-page"><div class="end-top-bar"></div><main class="end-body"><div class="end-icon-mark">✓</div><h1 class="end-headline" contenteditable="true">End of lecture</h1><p class="end-subtext" data-source-id="${ending.id}" data-block-type="${ending.type}" contenteditable="true">${esc(ending.content)}</p></main><div class="end-bottom"></div></article>` : "";
  const manifest = JSON.stringify(document).replace(/</g, "\\u003c");
  const html = `<!DOCTYPE html><html lang="${esc(metadata.language || "en")}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title?.content || "Editable lecture")}</title><style data-jang-reference-design>${design.css}</style><style data-jang-editor>${responsiveEditorCss()}</style></head><body><div class="jang-project" data-project-id="${projectId}"><nav class="jang-toolbar"><button type="button" data-action="save">Save project</button><button type="button" data-action="restore">Restore</button><button type="button" data-action="download">Export HTML</button></nav>${cover}${pageHtml}${end}</div><script type="application/json" id="jang-source-manifest">${manifest}</script><script>${editorScript(projectId)}</script></body></html>`;
  const verification = verifyEditableLectureHtml(html, document);
  if (!verification.valid) throw new Error(`Editable HTML verification failed. Missing: ${verification.missing.join(", ")}; duplicated: ${verification.duplicated.join(", ")}`);
  return { html, document, verification, projectId, filename: `${projectId}.html` };
}
