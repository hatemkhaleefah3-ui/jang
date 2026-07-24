import { parseLectureSource } from "./lecture-source-parser.js";
import { assertReferenceDesign } from "./reference-design-system.js";

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const slug = (value) => String(value || "lecture").trim().replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "").toLowerCase() || "lecture";
const lines = (value) => String(value || "").split(/\r?\n/).filter((line) => line.length > 0);
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/-->/g, "--\\u003e");

function editable(tag, block, className = "") {
  return `<${tag}${className ? ` class="${className}"` : ""} data-source-id="${esc(block.id)}" data-block-type="${esc(block.type)}" contenteditable="true" spellcheck="false">${esc(block.content)}</${tag}>`;
}

function listItems(block, ordered = false) {
  const items = Array.isArray(block.items) && block.items.length ? block.items : lines(block.content).map((line) => ordered ? line.replace(/^\s*\d+[.)]\s*/, "") : line.replace(/^\s*[-*•]\s*/, ""));
  return items.map((item) => `<li contenteditable="true" spellcheck="false">${esc(item)}</li>`).join("");
}

function componentTools(width, align = "full", extra = "") {
  return `<div class="jang-block-tools" contenteditable="false"><label>Width <input type="range" min="20" max="100" step="1" value="${width}" data-width-control><output>${width}%</output></label><label>Align <select data-align-control><option value="full"${align === "full" ? " selected" : ""}>Full</option><option value="left"${align === "left" ? " selected" : ""}>Left</option><option value="right"${align === "right" ? " selected" : ""}>Right</option></select></label>${extra}</div>`;
}

function flowAttrs(block, width, align) {
  return `data-source-id="${esc(block.id)}" data-block-type="${esc(block.type)}" data-align="${align}" style="--jang-width:${width}%"`;
}

function renderCallout(block) {
  const label = block.type === "warning" ? "Warning" : block.type === "info" ? "Information" : block.type === "topic-map" ? "Topic map" : "Note";
  const icon = block.type === "warning" ? "!" : "i";
  const width = block.type === "note" ? 42 : 48;
  return `<aside class="callout-note jang-flow" ${flowAttrs(block, width, "right")}>${componentTools(width, "right")}<span class="note-icon">${icon}</span><div class="note-content"><div class="note-label">${label}</div><p contenteditable="true" spellcheck="false">${esc(block.content)}</p></div></aside>`;
}

function renderList(block, ordered = false) {
  const tag = ordered ? "ol" : "ul";
  const cls = ordered ? "text-steps" : "text-bulleted";
  return `<${tag} class="${cls}" data-source-id="${esc(block.id)}" data-block-type="${esc(block.type)}">${listItems(block, ordered)}</${tag}>`;
}

function tableData(block) {
  if (Array.isArray(block.headers) && Array.isArray(block.rows)) return { headers: block.headers, rows: block.rows };
  const parsed = lines(block.content).filter((line) => line.includes("|")).map((line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  const rows = parsed.filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)));
  return { headers: rows[0] || ["Table"], rows: rows.slice(1) };
}

function renderTable(block) {
  const { headers, rows } = tableData(block);
  const head = `<thead><tr>${headers.map((cell) => `<th contenteditable="true">${esc(cell)}</th>`).join("")}</tr></thead>`;
  const body = `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td contenteditable="true">${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  return `<div class="table-wrap jang-flow" ${flowAttrs(block, 100, "full")}>${componentTools(100, "full", '<button type="button" data-action="add-row">+ row</button><button type="button" data-action="add-col">+ column</button>')}<table class="comparison-table">${head}${body}</table></div>`;
}

function pathwayNodes(block) {
  const source = block.pathwayContent || block.content;
  if (source.includes("→")) return source.split("→").map((item) => item.trim()).filter(Boolean);
  if (source.includes("->")) return source.split(/\s*->\s*/).map((item) => item.trim()).filter(Boolean);
  return lines(source).map((line) => line.replace(/^\s*[-*•]\s*/, ""));
}

function renderPathway(block) {
  const nodes = pathwayNodes(block);
  const type = block.pathwayType || "linear";
  const className = type === "closed-circle" ? "diagram-closed-circle" : type === "open-circle" ? "mindmap-open-arc" : type === "branched" ? "diagram-tree-hierarchy" : "diagram-linear-horizontal";
  return `<figure class="diagram-host ${className} jang-flow jang-pathway-block" ${flowAttrs(block, 100, "full")}>${componentTools(100, "full", '<button type="button" data-action="add-node">+ node</button><button type="button" data-action="remove-node">− node</button>')}<div class="diagram-label" contenteditable="true">${esc(type)} pathway</div><div class="jang-pathway">${nodes.map((node, index) => `<div class="jang-path-node" contenteditable="true" data-node-index="${index}">${esc(node)}</div>`).join("")}</div></figure>`;
}

function diagramDetails(block) {
  return block.structure || block.diagramContent || block.content;
}

function renderDiagram(block) {
  const type = String(block.diagramType || "diagram").toLowerCase();
  const className = /branch|tree|hierarchy/.test(type) ? "diagram-tree-hierarchy" : /circle|cycle/.test(type) ? "diagram-closed-circle" : "diagram-linear-vertical";
  const nodes = lines(diagramDetails(block)).map((line) => line.replace(/^\s*(?:[-*•]|[│├└─]+)\s*/, "")).filter(Boolean);
  return `<figure class="diagram-host ${className} jang-flow jang-diagram-block" ${flowAttrs(block, 48, "right")}>${componentTools(48, "right", '<button type="button" data-action="add-node">+ node</button><button type="button" data-action="remove-node">− node</button>')}<div class="diagram-label" contenteditable="true">${esc(block.diagramType || "Diagram")}</div><div class="jang-diagram-nodes">${(nodes.length ? nodes : ["Diagram element"]).map((node) => `<div class="jang-diagram-node" contenteditable="true">${esc(node)}</div>`).join("")}</div><figcaption class="jang-figure-label" contenteditable="true">${esc(block.title || block.label || "Diagram")}</figcaption>${block.sourceReference ? `<small contenteditable="true">Source page or slide: ${esc(block.sourceReference)}</small>` : ""}</figure>`;
}

function renderImage(block) {
  return `<figure class="img-full-width jang-flow jang-image-block" ${flowAttrs(block, 42, "right")}>${componentTools(42, "right")}<input type="file" accept="image/*" data-image-input hidden><div class="jang-image-placeholder" data-action="choose-image"><img alt="${esc(block.label)}" hidden><span>Click to insert an image</span></div><figcaption class="jang-figure-label" contenteditable="true">${esc(block.label)}</figcaption>${block.instructions ? `<small contenteditable="true">${esc(block.instructions)}</small>` : ""}</figure>`;
}

function renderQuickReview(block) {
  return `<div class="text-key-takeaways" data-source-id="${esc(block.id)}" data-block-type="quick-review"><div class="takeaway-header">Quick review</div><ul class="takeaway-list">${listItems(block)}</ul></div>`;
}

function renderBlock(block) {
  switch (block.type) {
    case "title": return editable("h1", block, "cover-title");
    case "section": return `<div class="section-divider" data-source-id="${esc(block.id)}" data-block-type="section"><span class="divider-line"></span><span class="divider-label" contenteditable="true">${esc(block.content)}</span><span class="divider-line"></span></div>`;
    case "subtitle": return editable("h3", block, "compare-head");
    case "paragraph": return editable("p", block, "jang-paragraph");
    case "note": case "info": case "warning": case "topic-map": return renderCallout(block);
    case "bullets": return renderList(block, false);
    case "numbered": return renderList(block, true);
    case "quick-review": return renderQuickReview(block);
    case "table": return renderTable(block);
    case "image": return renderImage(block);
    case "diagram": return renderDiagram(block);
    case "pathway": return renderPathway(block);
    case "source-file": return editable("small", block, "jang-source-file");
    case "footer": case "end": return editable("p", block, "end-subtext");
    default: return editable("p", block, "jang-paragraph");
  }
}

function partition(document) {
  const coverTypes = new Set(["source-file", "title", "topic-map", "info"]);
  const endingTypes = new Set(["quick-review", "footer", "end"]);
  let coverEnd = 0;
  while (coverEnd < document.blocks.length && coverTypes.has(document.blocks[coverEnd].type)) coverEnd += 1;
  let endStart = document.blocks.length;
  while (endStart > coverEnd && endingTypes.has(document.blocks[endStart - 1].type)) endStart -= 1;
  const cover = document.blocks.slice(0, coverEnd);
  const body = document.blocks.slice(coverEnd, endStart);
  const ending = document.blocks.slice(endStart);
  const pages = [];
  let current = { heading: null, blocks: [] };
  for (const block of body) {
    if (block.type === "page" || block.type === "section") {
      if (current.heading || current.blocks.length) pages.push(current);
      current = { heading: block, blocks: [] };
    } else current.blocks.push(block);
  }
  if (current.heading || current.blocks.length) pages.push(current);
  return { cover, pages, ending };
}

function titleText(document, metadata) {
  return document.blocks.find((block) => block.type === "title")?.content || metadata.title || "Editable lecture";
}

function renderCover(blocks, metadata, title) {
  const content = blocks.map((block) => {
    if (block.type === "source-file") return editable("small", block, "jang-source-file");
    if (block.type === "title") return editable("h1", block, "cover-title");
    if (block.type === "topic-map") return editable("p", block, "cover-subtitle");
    if (block.type === "info") return `<div class="cover-meta-row" data-source-id="${esc(block.id)}" data-block-type="info"><div class="cover-meta-item"><span class="meta-label">Lecture information</span><pre class="meta-value" contenteditable="true">${esc(block.content)}</pre></div></div>`;
    return renderBlock(block);
  }).join("");
  const fallback = blocks.some((block) => block.type === "title") ? "" : `<h1 class="cover-title" contenteditable="true">${esc(title)}</h1>`;
  return `<article class="page cover-page"><div class="cover-top-bar"><span class="course-code" contenteditable="true">${esc(metadata.courseCode || "COURSE")}</span><span class="term-tag" contenteditable="true">${esc(metadata.lectureLabel || "LECTURE")}</span></div><main class="cover-hero">${fallback}${content}</main><div class="cover-visual-strip"></div><div class="cover-bottom"><span contenteditable="true">${esc(metadata.courseCode || "Course")}</span><span contenteditable="true">${esc(metadata.instructor || "")}</span></div></article>`;
}

function renderPage(page, index, metadata, title) {
  const headingText = page.heading?.content || page.blocks.find((block) => block.type === "subtitle")?.content || title;
  const heading = page.heading ? `<h2 class="page-title" data-source-id="${esc(page.heading.id)}" data-block-type="${esc(page.heading.type)}" contenteditable="true">${esc(headingText)}</h2>` : `<h2 class="page-title" contenteditable="true">${esc(headingText)}</h2>`;
  return `<article class="page"><header class="page-header"><span class="course-label" contenteditable="true">${esc(metadata.courseCode || "COURSE")}</span>${heading}<span class="category-tag" contenteditable="true">Lecture</span></header><main class="page-body">${page.blocks.map(renderBlock).join("")}</main><footer class="page-footer"><span class="footer-left" contenteditable="true">${esc(metadata.lectureLabel || "Lecture")}</span><span class="footer-center" contenteditable="true">${esc(title)}</span><span class="page-number">${String(index + 1).padStart(2, "0")}</span></footer></article>`;
}

function renderEnd(blocks) {
  return `<article class="page end-page"><div class="end-top-bar"></div><main class="end-body"><div class="end-icon-mark">✓</div><h1 class="end-headline" contenteditable="true">End of lecture</h1>${blocks.map(renderBlock).join("")}</main><div class="end-bottom"></div></article>`;
}

function editorCss() {
  return String.raw`
:root{--jang-project-width:94%;--jang-gap:2.2%;--jang-toolbar-bg:#111110;--jang-toolbar-fg:#fff}
html{font-size:clamp(14px,1.15vw,18px);scroll-behavior:smooth}body{align-items:stretch;padding:2%;gap:var(--jang-gap);background:var(--page-bg-solid)}
.jang-project{width:var(--jang-project-width);margin-inline:auto;display:grid;gap:var(--jang-gap);container-type:inline-size}.page{width:100%;height:auto;min-height:88svh;overflow:visible}.page-body{display:block;min-height:65svh}.page-body::after{content:"";display:block;clear:both}
p,li,td,th,figcaption{font-size:clamp(.92rem,1.2vw,1.08rem)}.cover-title{font-size:clamp(2.2rem,7vw,4.8rem)}.cover-subtitle{font-size:clamp(1rem,2.5vw,1.45rem)}
.jang-flow{width:var(--jang-width,100%);max-width:100%;margin:1.2% 0 1.5%;position:relative}.jang-flow[data-align="left"]{float:left;margin-right:2.5%}.jang-flow[data-align="right"]{float:right;margin-left:2.5%}.jang-flow[data-align="full"]{float:none;clear:both}
.jang-block-tools{display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;padding:.45rem .6rem;background:var(--jang-toolbar-bg);color:var(--jang-toolbar-fg);border-radius:8px 8px 0 0;font:500 .68rem var(--font-mono)}.jang-block-tools label{display:flex;align-items:center;gap:.35rem}.jang-block-tools input[type=range]{width:9rem;max-width:38%}.jang-block-tools select,.jang-block-tools button{font:inherit;padding:.25rem .45rem;border:0;border-radius:4px}.jang-block-tools output{min-width:3.5ch}
.jang-toolbar{position:sticky;top:1%;z-index:50;display:flex;gap:.5rem;flex-wrap:wrap;padding:.7rem;background:var(--surface-dark);border:1px solid var(--accent-border);border-radius:10px;box-shadow:0 8px 28px #0002}.jang-toolbar button{padding:.55rem .8rem;border:1px solid var(--accent-border-dark);border-radius:6px;background:var(--surface-gradient)}.jang-status{margin-left:auto;font:500 .72rem var(--font-mono)}
.jang-image-placeholder{min-height:20vh;display:grid;place-items:center;border:2px dashed var(--accent-border-dark);border-radius:8px;background:#fff;cursor:pointer;overflow:hidden;padding:4%;text-align:center}.jang-image-placeholder img{width:100%;height:auto;max-height:55vh;object-fit:contain}.jang-figure-label{display:block;text-align:center;margin-top:2%;font-style:italic;color:var(--text-muted)}
.jang-pathway,.jang-diagram-nodes{display:flex;align-items:center;justify-content:center;gap:2%;flex-wrap:wrap;padding:3%}.jang-path-node,.jang-diagram-node{flex:1 1 22%;min-width:16%;padding:2%;border:1px solid var(--flow-box-border);border-radius:var(--radius-lg);background:var(--flow-box-bg);text-align:center}.diagram-tree-hierarchy .jang-pathway,.diagram-tree-hierarchy .jang-diagram-nodes{display:grid;grid-template-columns:repeat(2,1fr)}.diagram-closed-circle .jang-pathway,.mindmap-open-arc .jang-pathway{border:2px solid var(--flow-box-border);border-radius:50%;min-height:28vh}
.table-wrap{overflow:auto}.comparison-table{min-width:55%}.jang-paragraph,.jang-source-file,.meta-value,.note-content p{white-space:pre-wrap}[contenteditable=true]:focus{outline:2px solid var(--accent-yellow);outline-offset:2px}
@media print{.jang-toolbar,.jang-block-tools,input[type=file]{display:none!important}.jang-project{width:100%}.page{break-after:page;box-shadow:none;min-height:100vh}body{padding:0}}
`;
}

function editorScript(projectId) {
  return `(() => {const root=document.querySelector('.jang-project');const key='jang-project:${projectId}';const history=[];let pointer=-1,timer;const status=()=>document.querySelector('.jang-status');const say=m=>{const n=status();if(n)n.textContent=m};const snap=()=>root.innerHTML;const remember=()=>{const v=snap();if(history[pointer]===v)return;history.splice(pointer+1);history.push(v);if(history.length>40)history.shift();pointer=history.length-1};const restore=i=>{if(i<0||i>=history.length)return;pointer=i;root.innerHTML=history[i];say('Edit restored')};const save=()=>{localStorage.setItem(key,snap());localStorage.setItem(key+':savedAt',new Date().toISOString());say('Saved in this browser')};const download=()=>{save();const blob=new Blob(['<!DOCTYPE html>\\n'+document.documentElement.outerHTML],{type:'text/html;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='${projectId}.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};document.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(remember,250)});document.addEventListener('click',e=>{const a=e.target?.dataset?.action;if(a==='save')save();if(a==='download')download();if(a==='undo')restore(pointer-1);if(a==='redo')restore(pointer+1);if(a==='reset'){localStorage.removeItem(key);location.reload()}if(a==='choose-image')e.target.closest('.jang-image-block').querySelector('[data-image-input]').click();if(a==='add-row'){const t=e.target.closest('[data-block-type=table]').querySelector('table'),c=t.rows[0]?.cells.length||1,r=t.tBodies[0].insertRow();for(let i=0;i<c;i++){const x=r.insertCell();x.contentEditable='true';x.textContent='New cell'}remember()}if(a==='add-col'){const t=e.target.closest('[data-block-type=table]').querySelector('table');[...t.rows].forEach((r,i)=>{const x=i===0?document.createElement('th'):document.createElement('td');x.contentEditable='true';x.textContent='New column';r.append(x)});remember()}if(a==='add-node'){const host=e.target.closest('.jang-pathway-block,.jang-diagram-block'),box=host.querySelector('.jang-pathway,.jang-diagram-nodes'),x=document.createElement('div');x.className=box.classList.contains('jang-pathway')?'jang-path-node':'jang-diagram-node';x.contentEditable='true';x.textContent='New node';box.append(x);remember()}if(a==='remove-node'){const host=e.target.closest('.jang-pathway-block,.jang-diagram-block'),nodes=host.querySelectorAll('.jang-path-node,.jang-diagram-node');nodes[nodes.length-1]?.remove();remember()}});document.addEventListener('input',e=>{if(e.target.matches('[data-width-control]')){const b=e.target.closest('.jang-flow');b.style.setProperty('--jang-width',e.target.value+'%');e.target.parentElement.querySelector('output').value=e.target.value+'%'}});document.addEventListener('change',e=>{if(e.target.matches('[data-align-control]')){e.target.closest('.jang-flow').dataset.align=e.target.value;remember()}if(e.target.matches('[data-image-input]')){const f=e.target.files?.[0];if(!f||!f.type.startsWith('image/'))return;const r=new FileReader();r.onload=()=>{const box=e.target.closest('.jang-image-block').querySelector('.jang-image-placeholder'),img=box.querySelector('img');img.src=r.result;img.hidden=false;box.querySelector('span').hidden=true;remember()};r.readAsDataURL(f)}});const saved=localStorage.getItem(key);if(saved)root.innerHTML=saved;remember();say(saved?'Saved project restored':'Ready to edit');window.addEventListener('beforeunload',save)})();`;
}

export function verifyEditableLectureHtml(html, document) {
  const expected = document.blocks.map((block) => block.id);
  const rendered = [...String(html).matchAll(/data-source-id="([^"]+)"/g)].map((match) => match[1]);
  const counts = new Map();
  for (const id of rendered) counts.set(id, (counts.get(id) || 0) + 1);
  const missing = expected.filter((id) => !counts.has(id));
  const duplicated = expected.filter((id) => (counts.get(id) || 0) > 1);
  const unknown = rendered.filter((id) => !expected.includes(id));
  const orderErrors = rendered.filter((id) => expected.includes(id)).some((id, index) => id !== expected[index]);
  return { valid: !missing.length && !duplicated.length && !unknown.length && !orderErrors, missing, duplicated, unknown, orderErrors, rendered: rendered.length, expected: expected.length };
}

export function buildEditableLectureHtml(input, metadata = {}) {
  const document = typeof input === "string" ? parseLectureSource(input) : input;
  if (!document || !Array.isArray(document.blocks)) throw new TypeError("A parsed lecture document is required.");
  const design = assertReferenceDesign();
  const title = titleText(document, metadata);
  const projectId = slug(metadata.projectId || title || "lecture-project");
  const language = metadata.language || "en";
  const direction = metadata.direction || (/^(ar|ku)/i.test(language) ? "rtl" : "ltr");
  const grouped = partition(document);
  const cover = renderCover(grouped.cover, metadata, title);
  const pages = grouped.pages.map((page, index) => renderPage(page, index, metadata, title)).join("");
  const end = renderEnd(grouped.ending);
  const html = `<!DOCTYPE html><html lang="${esc(language)}" dir="${esc(direction)}" data-project-id="${esc(projectId)}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style data-jang-reference-design>${design.css}</style><style data-jang-editor>${editorCss()}</style></head><body><div class="jang-project" data-project-id="${esc(projectId)}"><nav class="jang-toolbar" contenteditable="false"><button type="button" data-action="save">Save project</button><button type="button" data-action="undo">Undo</button><button type="button" data-action="redo">Redo</button><button type="button" data-action="download">Download HTML</button><button type="button" data-action="reset">Reset saved edits</button><span class="jang-status">Ready</span></nav>${cover}${pages}${end}</div><script type="application/json" id="jang-source-manifest">${safeJson(document)}</script><script>${editorScript(projectId)}</script></body></html>`;
  const verification = verifyEditableLectureHtml(html, document);
  if (!verification.valid) throw new Error(`Editable HTML verification failed: ${JSON.stringify(verification)}`);
  return { html, document, verification, projectId, filename: `${projectId}.html`, design: { tokens: design.tokens, componentCatalog: design.componentCatalog } };
}
