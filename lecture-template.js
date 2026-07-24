const CSS = String.raw`
:root{--ink:#111110;--ink2:#3a3a38;--muted:#787874;--line:#c8c8c2;--line2:#9a9a92;--surface:linear-gradient(135deg,#f5f5f3,#e8e8e4);--surface2:linear-gradient(135deg,#e0e0db,#d0d0ca);--yellow:#f5e642;--red:#922b21;--body:'Inter',sans-serif;--display:'Playfair Display',serif;--mono:'JetBrains Mono',monospace;--page:900px;--pageh:1170px}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:var(--body);color:var(--ink);background:#ccc;display:flex;flex-direction:column;align-items:center;gap:2rem;padding:2rem 0 4rem}body[dir=rtl]{font-family:'Noto Sans Arabic',var(--body)}
.page{width:min(var(--page),calc(100vw - 28px));min-height:var(--pageh);background:linear-gradient(160deg,#fff,#f0f0ee);box-shadow:0 4px 40px #0003;display:flex;flex-direction:column;overflow:hidden;position:relative}.page-body{flex:1;padding:1.6rem 2.4rem;display:flex;flex-direction:column;gap:1rem}.page-header{min-height:52px;padding:.6rem 2.4rem;display:grid;grid-template-columns:1fr auto 1fr;gap:1rem;align-items:center;background:var(--surface2);border-bottom:2px solid var(--line)}.course-label,.page-number,.page-footer span{font:500 .7rem var(--mono);color:var(--muted)}.page-title{font:700 1rem var(--display);text-align:center}.category-tag{justify-self:end;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;padding:3px 10px;border:1px solid var(--line);border-radius:99px;background:var(--surface)}.page-footer{min-height:40px;padding:.6rem 2.4rem;display:flex;justify-content:space-between;align-items:center;gap:1rem;background:var(--surface2);border-top:1px solid var(--line)}.page-number{font-weight:700;color:var(--ink2)}
h1,h2{font-family:var(--display)}h1{font-size:2.1rem;line-height:1.15}h2{font-size:1.55rem;line-height:1.2}h3{font-size:1.15rem;line-height:1.3}p{font-size:.92rem;line-height:1.72}.block-heading{font:500 .7rem var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:.6rem}.divider{display:flex;align-items:center;gap:1rem;margin:.3rem 0}.divider:before,.divider:after{content:'';height:1px;flex:1;background:linear-gradient(to right,transparent,var(--line2),transparent)}.divider span{font:500 .7rem var(--mono);text-transform:uppercase;letter-spacing:.13em;color:var(--muted)}
.critical{position:relative;display:inline;z-index:0}.critical:before{content:'';position:absolute;z-index:-1;left:-3px;right:-4px;top:1px;bottom:-1px;background:var(--yellow);clip-path:polygon(2% 20%,7% 3%,27% 1%,50% 4%,75% 0,98% 7%,100% 30%,97% 90%,76% 96%,51% 90%,26% 100%,2% 93%,0 60%);transform:rotate(-.6deg)}.important{color:var(--red);font-family:'Libre Baskerville',serif;font-style:italic}
.intro,.callout,.takeaways,.figure,.diagram,.toc{background:var(--surface);border:1px solid var(--line);border-radius:12px}.intro{padding:1.6rem;display:grid;gap:1rem}.intro p{color:var(--ink2)}.objectives{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:.6rem}.objectives li{position:relative;padding:.7rem .8rem .7rem 2.25rem;background:#fafaf7;border:1px solid var(--line);border-radius:8px;font-size:.8rem;line-height:1.55}.objectives li:before{content:'✓';position:absolute;left:.75rem;top:.65rem;width:18px;height:18px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:#fff;font-size:.62rem}
.bullets{padding-left:1.4rem}.bullets li{list-style:none;position:relative;margin-bottom:.6rem;font-size:.92rem;line-height:1.65}.bullets li:before{content:'▪';position:absolute;left:-1.15rem}.steps{counter-reset:s;list-style:none;display:grid;gap:.6rem}.steps li{counter-increment:s;display:flex;gap:1rem;font-size:.92rem;line-height:1.65}.steps li:before{content:counter(s);flex:none;width:25px;height:25px;border:1px solid var(--line2);border-radius:50%;display:grid;place-items:center;background:var(--surface2);font:600 .7rem var(--mono)}.callout{border-left:4px solid var(--ink);padding:1rem 1.6rem;display:flex;gap:1rem}.note-icon{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:#fff}.note-label{font:600 .7rem var(--mono);text-transform:uppercase;letter-spacing:.12em;color:var(--ink2);margin-bottom:4px}.qa-q{font-weight:700;border-left:3px solid var(--ink);padding-left:1rem;margin-bottom:.6rem}.qa-a{padding-left:calc(1rem + 3px);color:var(--ink2);line-height:1.7}.definitions{display:grid;gap:.6rem}.def{display:grid;grid-template-columns:180px 1fr;gap:1rem;padding:.3rem 0;border-bottom:1px dashed var(--line)}.term{font:500 .8rem var(--mono)}.desc{font-size:.8rem;line-height:1.6;color:var(--ink2)}
.takeaways{padding:1rem 1.6rem}.take-title{font:600 .7rem var(--mono);text-transform:uppercase;letter-spacing:.12em;color:var(--ink2);padding-bottom:.6rem;margin-bottom:.6rem;border-bottom:1px solid var(--line)}.takeaways ul{list-style:none;display:grid;gap:6px}.takeaways li{display:flex;gap:.6rem;font-size:.8rem;line-height:1.6}.takeaways li:before{content:'→';color:var(--muted)}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:8px}table{width:100%;border-collapse:collapse;font-size:.8rem}th{background:var(--surface2);text-align:left;padding:9px 14px;font-size:.7rem;text-transform:uppercase;letter-spacing:.06em;border-bottom:2px solid var(--line2)}td{padding:8px 14px;border-bottom:1px solid var(--line);vertical-align:top;line-height:1.5}tr:nth-child(odd) td{background:#fbfbf9}tr:nth-child(even) td{background:#eeeeea}
.figure,.diagram{padding:1rem;display:flex;flex-direction:column;align-items:center;gap:.6rem}.figure img{width:100%;max-height:430px;object-fit:contain;border-radius:8px;background:#fff}.diagram svg{width:100%;max-height:430px}.figure figcaption,.diagram figcaption{font-size:.7rem;line-height:1.5;color:var(--muted);font-style:italic;text-align:center}.placeholder{width:100%;min-height:170px;border:1px dashed var(--line2);border-radius:8px;display:grid;place-items:center;text-align:center;padding:1.6rem;color:var(--muted);font-size:.8rem;background:repeating-linear-gradient(45deg,#f5f5f1,#f5f5f1 12px,#ecece7 12px,#ecece7 24px)}.mermaid{width:100%;overflow:auto;display:flex;justify-content:center}
.toc{overflow:hidden}.toc-head{padding:.6rem 1.6rem;background:var(--surface2);border-bottom:1px solid var(--line);font:500 .7rem var(--mono);text-transform:uppercase;letter-spacing:.12em;color:var(--muted)}.toc ol{list-style:none;padding:1rem 1.6rem;display:grid;gap:8px}.toc li{display:flex;align-items:baseline;gap:.6rem;font-size:.8rem}.toc a{text-decoration:none;color:var(--ink2)}.dots{flex:1;border-bottom:1px dotted var(--line2)}.toc-num,.toc-page{font:500 .7rem var(--mono);color:var(--muted)}
.cover{background:linear-gradient(150deg,#111110,#1e1e1c 60%,#2a2a26);color:#f0f0ec}.cover .cover-bar,.cover .cover-foot{padding:1.2rem 2.4rem;display:flex;justify-content:space-between;border-bottom:1px solid #fff2;font:500 .7rem var(--mono);color:#ffffff73}.cover-hero{flex:1;padding:3.6rem 2.4rem;display:flex;flex-direction:column;justify-content:center}.eyebrow{font:500 .8rem var(--mono);letter-spacing:.18em;text-transform:uppercase;color:#ffffff70}.cover-rule{width:60px;height:3px;background:#f0d21e80;margin:1rem 0}.cover-title{font-size:3.8rem;line-height:1;color:#f0f0ec;max-width:720px}.cover-sub{font-size:1.2rem;color:#ffffff8c;max-width:560px;margin-top:1.6rem}.meta{display:flex;gap:2.4rem;margin-top:2.4rem;flex-wrap:wrap}.meta b,.meta span{display:block}.meta b{font:500 .7rem var(--mono);text-transform:uppercase;letter-spacing:.1em;color:#ffffff4d}.meta span{font-size:.8rem;color:#ffffffb3;margin-top:4px}.cover-visual{height:220px;margin:0 2.4rem 2.4rem;border:1px solid #ffffff14;border-radius:14px;background:radial-gradient(circle at 70% 30%,#f5e64226,transparent 32%),linear-gradient(135deg,#191918,#32322f)}.cover .cover-foot{border-top:1px solid #fff2;border-bottom:0}.end-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3.6rem 2.4rem;gap:2rem}.end-icon{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:#fff;font-size:1.5rem}.end-title{font-size:2.8rem;text-align:center;max-width:650px}.end-sub{text-align:center;max-width:580px;color:var(--muted)}.end-body .takeaways{width:100%;max-width:680px}
@media(max-width:650px){.page-header{grid-template-columns:1fr}.page-header>*{justify-self:start!important;text-align:left!important}.page-body{padding:1.2rem}.objectives{grid-template-columns:1fr}.def{grid-template-columns:1fr}.cover-title{font-size:2.7rem}.cover-hero,.cover .cover-bar,.cover .cover-foot{padding-left:1.4rem;padding-right:1.4rem}}
@media print{body{background:#fff;gap:0;padding:0}.page{width:100%;min-height:100vh;box-shadow:none;break-after:page}.page:last-child{break-after:auto}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}.callout,.figure,.diagram,.table-wrap,.takeaways{break-inside:avoid}}
`;

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const text = (value, max = 12000) => String(value ?? "").replace(/\u0000/g, "").trim().slice(0, max);
const arr = (value, max = 40) => Array.isArray(value) ? value.slice(0, max) : [];

function terms(value, critical = [], important = [], budget = { highlights: 0, red: 0 }, allowStyles = true) {
  let result = esc(text(value));
  if (!allowStyles) return result.replace(/\n/g, "<br>");
  const apply = (values, className, key, limit) => {
    for (const term of arr(values, 15).map((item) => text(item, 100)).filter((item) => item.length > 1).sort((a, b) => b.length - a.length)) {
      if (budget[key] >= limit) break;
      const escaped = esc(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})(?=$|[^\\p{L}\\p{N}])`, "giu");
      result = result.replace(regex, (match, prefix, found) => {
        if (budget[key] >= limit) return match;
        budget[key] += 1;
        return `${prefix}<span class="${className}">${found}</span>`;
      });
    }
  };
  apply(critical, "critical", "highlights", 10);
  apply(important, "important", "red", 5);
  return result.replace(/\n/g, "<br>");
}

function blankBlock(type = "paragraph") { return { type, heading: "", text: "", label: "", items: [], pairs: [], headers: [], rows: [], assetId: "", caption: "", alt: "", question: "", answer: "" }; }
function normalize(raw, options) {
  const p = raw && typeof raw === "object" ? raw : {};
  const m = p.metadata && typeof p.metadata === "object" ? p.metadata : {};
  const sections = arr(p.sections, 60).map((s, i) => ({
    title: text(s?.title, 160) || `Section ${i + 1}`,
    category: text(s?.category, 40) || "Concept",
    keyTermsCritical: arr(s?.keyTermsCritical, 12).map((x) => text(x, 100)),
    keyTermsImportant: arr(s?.keyTermsImportant, 12).map((x) => text(x, 100)),
    blocks: arr(s?.blocks, 60).map((b) => ({ ...blankBlock(text(b?.type, 30) || "paragraph"), ...b, heading: text(b?.heading, 180), text: text(b?.text), label: text(b?.label, 80), items: arr(b?.items, 60).map((x) => text(x, 12000)), pairs: arr(b?.pairs, 60).map((x) => ({ term: text(x?.term, 200), description: text(x?.description, 12000) })), headers: arr(b?.headers, 30).map((x) => text(x, 2000)), rows: arr(b?.rows, 200).map((r) => arr(r, 30).map((x) => text(x, 12000))), assetId: text(b?.assetId, 80), caption: text(b?.caption, 1000), alt: text(b?.alt, 500), question: text(b?.question, 12000), answer: text(b?.answer, 12000) })),
  })).filter((s) => s.blocks.length);
  return { metadata: { title: text(m.title, 300) || text(options.sourceTitle, 300) || "Untitled lecture", subtitle: text(m.subtitle, 500), courseCode: text(options.courseCode || m.courseCode, 50) || "Course", lectureLabel: text(options.lectureLabel || m.lectureLabel, 70) || "Lecture", instructor: text(options.instructor || m.instructor, 100), language: text(m.language || options.language, 40), direction: m.direction === "rtl" || options.language === "Arabic" ? "rtl" : "ltr" }, overview: text(p.overview, 12000), learningObjectives: arr(p.learningObjectives, 30).map((x) => text(x, 12000)), sections: sections.length ? sections : [{ title: "Lecture", category: "Content", keyTermsCritical: [], keyTermsImportant: [], blocks: [{ ...blankBlock(), text: "No structured content was returned." }] }], finalTakeaways: arr(p.finalTakeaways, 30).map((x) => text(x, 12000)) };
}

function assetHTML(block, map) {
  const asset = map.get(block.assetId);
  const caption = block.caption || asset?.caption || "";
  const alt = block.alt || asset?.alt || "Lecture visual";
  if (!asset) return `<div class="placeholder">Visual asset ${esc(block.assetId || "unknown")} was not available.</div>`;
  if (asset.type === "svg" && asset.source) return `<figure class="diagram">${asset.source}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
  if (asset.type === "mermaid" && asset.source) return `<figure class="diagram"><pre class="mermaid">${esc(asset.source)}</pre>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
  if (asset.type === "image" && asset.source && ["embedded", "remote", "pdf-page-render", "page-snapshot", "ocr-page"].includes(asset.sourceKind)) return `<figure class="figure"><img src="${esc(asset.source)}" alt="${esc(alt)}" loading="eager" referrerpolicy="no-referrer">${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
  const reason = asset.sourceKind === "relative" ? `Relative image path: ${esc(asset.source)}. Embed the image or use an absolute HTTPS URL.` : (asset.caption || "The visual required scripts or separate files and could not be reconstructed.");
  return `<div class="placeholder"><div><strong>${esc(alt)}</strong><br><br>${reason}</div></div>`;
}

function blockHTML(block, map, critical, important, budget) {
  const heading = block.heading ? `<h3 class="block-heading">${esc(block.heading)}</h3>` : "";
  switch (block.type) {
    case "bullets": return `<section>${heading}<ul class="bullets">${block.items.map((item) => `<li>${terms(item, critical, important, budget)}</li>`).join("")}</ul></section>`;
    case "steps": return `<section>${heading}<ol class="steps">${block.items.map((item) => `<li><span>${terms(item, critical, important, budget)}</span></li>`).join("")}</ol></section>`;
    case "callout": return `<aside class="callout"><span class="note-icon">!</span><div><div class="note-label">${esc(block.label || block.heading || "Important")}</div><p>${terms(block.text, critical, important, budget)}</p></div></aside>`;
    case "qa": return `<section>${heading}<div class="qa-q">${terms(block.question || block.heading, critical, important, budget)}</div><div class="qa-a">${terms(block.answer || block.text, critical, important, budget)}</div></section>`;
    case "definitions": return `<section>${heading}<div class="definitions">${block.pairs.map((pair) => `<div class="def"><div class="term">${terms(pair.term, critical, important, budget)}</div><div class="desc">${terms(pair.description, critical, important, budget)}</div></div>`).join("")}</div></section>`;
    case "table": {
      const width = Math.max(block.headers.length, ...block.rows.map((row) => row.length), 1);
      const heads = block.headers.length ? block.headers : Array.from({ length: width }, (_, index) => `Column ${index + 1}`);
      return `<section>${heading}<div class="table-wrap"><table><thead><tr>${heads.map((item) => `<th>${esc(item)}</th>`).join("")}</tr></thead><tbody>${block.rows.map((row) => `<tr>${heads.map((_, index) => `<td>${terms(row[index] || "", critical, important, budget)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`;
    }
    case "image": return `<section>${heading}${assetHTML(block, map)}</section>`;
    case "diagram": return block.assetId ? `<section>${heading}${assetHTML(block, map)}</section>` : `<section>${heading}<div class="diagram"><ol class="steps">${block.items.map((item) => `<li><span>${terms(item, critical, important, budget)}</span></li>`).join("")}</ol></div></section>`;
    case "takeaways": return `<section class="takeaways"><div class="take-title">${esc(block.heading || block.label || "Key takeaways")}</div><ul>${block.items.map((item) => `<li>${terms(item, critical, important, budget)}</li>`).join("")}</ul></section>`;
    default: return `<section>${heading}<p>${terms(block.text, critical, important, budget)}</p></section>`;
  }
}

function shell(meta, title, category, body, number, total, id) {
  return `<article class="page" id="${esc(id)}"><header class="page-header"><span class="course-label">${esc(meta.courseCode)} · ${esc(meta.lectureLabel)}</span><span class="page-title">${esc(title)}</span><span class="category-tag">${esc(category)}</span></header><main class="page-body">${body}</main><footer class="page-footer"><span>${esc(meta.courseCode)} · ${esc(meta.lectureLabel)}</span><span>${esc(title)}</span><span class="page-number">${number} / ${total}</span></footer></article>`;
}

export function buildLectureHTML(rawPlan, assets, options = {}) {
  const plan = normalize(rawPlan, options);
  const map = new Map(arr(assets, 2000).map((asset) => [asset.id, asset]));
  const toc = options.includeToc !== false;
  const total = 1 + (toc ? 1 : 0) + plan.sections.length + 1;
  const meta = plan.metadata;
  const pages = [];
  const budget = { highlights: 0, red: 0 };
  let number = 1;
  pages.push(`<article class="page cover"><header class="cover-bar"><span>${esc(meta.courseCode)}</span><span>${esc(meta.lectureLabel)}</span></header><main class="cover-hero"><p class="eyebrow">PowerPoint lecture</p><div class="cover-rule"></div><h1 class="cover-title">${esc(meta.title)}</h1>${meta.subtitle ? `<p class="cover-sub">${esc(meta.subtitle)}</p>` : ""}<div class="meta">${meta.instructor ? `<div><b>Instructor</b><span>${esc(meta.instructor)}</span></div>` : ""}${meta.language ? `<div><b>Language</b><span>${esc(meta.language)}</span></div>` : ""}<div><b>Output</b><span>Verified .pptx</span></div></div></main><div class="cover-visual"></div><footer class="cover-foot"><span>Jang PowerPoint preview</span><span>${number++} / ${total}</span></footer></article>`);
  if (toc) {
    const body = `<section class="intro"><h1>${esc(meta.title)}</h1>${plan.overview ? `<p>${terms(plan.overview, [], [], budget, false)}</p>` : ""}${plan.learningObjectives.length ? `<div class="divider"><span>Learning objectives</span></div><ul class="objectives">${plan.learningObjectives.map((item) => `<li>${terms(item, [], [], budget, false)}</li>`).join("")}</ul>` : ""}</section><div class="divider"><span>Table of contents</span></div><nav class="toc"><div class="toc-head">Contents</div><ol>${plan.sections.map((section, index) => `<li><span class="toc-num">${String(index + 1).padStart(2, "0")}</span><a href="#section-${index + 1}">${esc(section.title)}</a><span class="dots"></span><span class="toc-page">${number + index + 1}</span></li>`).join("")}</ol></nav>`;
    pages.push(shell(meta, "Lecture overview", "Reference", body, number++, total, "overview"));
  }
  plan.sections.forEach((section, index) => {
    const body = section.blocks.map((block) => blockHTML(block, map, section.keyTermsCritical, section.keyTermsImportant, budget)).join("");
    pages.push(shell(meta, section.title, section.category, body, number++, total, `section-${index + 1}`));
  });
  const final = plan.finalTakeaways.length ? plan.finalTakeaways : plan.sections.flatMap((section) => section.blocks.filter((block) => block.type === "takeaways").flatMap((block) => block.items)).slice(-8);
  pages.push(`<article class="page"><header class="page-header"><span class="course-label">${esc(meta.courseCode)}</span><span class="page-title">Lecture complete</span><span class="category-tag">Summary</span></header><main class="end-body"><div class="end-icon">✓</div><h2 class="end-title">PowerPoint ready.<br>All verified content is downloadable.</h2>${plan.overview ? `<p class="end-sub">${terms(plan.overview, [], [], budget, false)}</p>` : ""}${final.length ? `<section class="takeaways"><div class="take-title">Final takeaways</div><ul>${final.map((item) => `<li>${terms(item, [], [], budget, false)}</li>`).join("")}</ul></section>` : ""}</main><footer class="page-footer"><span>Jang PowerPoint preview</span><span>${esc(meta.title)}</span><span class="page-number">${number} / ${total}</span></footer></article>`);
  const mermaid = [...map.values()].some((asset) => asset.type === "mermaid") ? `<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"><\/script><script>mermaid.initialize({startOnLoad:true,securityLevel:'strict',theme:'neutral'});<\/script>` : "";
  return `<!doctype html><html lang="${meta.language.toLowerCase().startsWith("arab") ? "ar" : "en"}" dir="${meta.direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="generator" content="Jang Lecture Rebuilder"><title>${esc(meta.title)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Libre+Baskerville:ital@0;1&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet"><style>${CSS}</style></head><body>${pages.join("\n")}${mermaid}</body></html>`;
}

export function safeFilename(title) {
  const cleanTitle = String(title || "redesigned-lecture").normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return cleanTitle || "redesigned-lecture";
}
