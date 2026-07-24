const asArray = (value) => Array.isArray(value) ? value : [];
const clean = (value) => String(value ?? "").replace(/\u0000/g, "").trim();
const esc = (value) => clean(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

export const APPROVED_HTML_TAGS = new Set([
  "article", "aside", "blockquote", "body", "br", "caption", "circle", "defs", "div", "ellipse", "figcaption", "figure",
  "footer", "g", "h1", "h2", "h3", "h4", "head", "header", "hr", "html", "img", "li", "line", "main", "marker", "meta", "nav", "ol",
  "p", "path", "polygon", "polyline", "rect", "section", "small", "span", "strong", "style", "svg", "table", "tbody", "td",
  "text", "thead", "th", "title", "tr", "tspan", "ul"
]);

export const APPROVED_COMPONENT_CLASSES = new Set([
  "page", "cover-page", "cover-top-bar", "course-code", "term-tag", "cover-hero", "cover-eyebrow", "cover-rule",
  "cover-title", "cover-subtitle", "cover-meta-row", "cover-meta-item", "meta-label", "meta-value", "cover-visual-strip",
  "cover-bottom", "page-header", "course-label", "page-title", "category-tag", "page-body", "page-footer", "footer-left",
  "footer-center", "page-number", "legend-box", "legend-title", "legend-items", "legend-item", "legend-swatch", "caption",
  "critical-highlight", "critical-highlight-svg", "var-a", "var-b", "var-c", "important-word", "callout-note", "note-icon", "note-content",
  "note-label", "section-divider", "divider-line", "divider-label", "text-bulleted", "text-steps", "text-comparison-cols",
  "compare-col", "compare-head", "text-qa", "qa-item", "qa-question", "qa-answer", "text-definitions", "def-item",
  "def-term", "def-desc", "text-key-takeaways", "takeaway-header", "takeaway-icon", "takeaway-list", "table-wrap",
  "data-table", "comparison-table", "glossary-table", "stat-table", "accent-row", "table-caption", "img-full-width",
  "img-side-text", "img-text-content", "img-thumbnail", "img-thumbnail-wrap", "img-grid", "img-overlay", "overlay-text",
  "diagram-host", "diagram-label", "diagram-best-for", "diagram-closed-circle", "diagram-linear-horizontal", "diagram-linear-vertical",
  "diagram-tree-hierarchy", "diagram-venn", "diagram-quadrant", "diagram-timeline", "mindmap-host", "mindmap-radial",
  "mindmap-hierarchical", "mindmap-open-arc", "toc-block", "toc-header", "toc-list", "toc-item", "toc-section", "toc-num",
  "toc-dots", "toc-page", "two-col", "three-col", "end-page", "end-top-bar", "end-body", "end-icon-mark", "end-headline",
  "end-subtext", "end-takeaway-list", "etl-header", "etl-num", "end-bottom"
]);

export function normalizeDesignedHtml(value) {
  return clean(value).replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function countAttribute(html, attribute) {
  const regex = new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "gi");
  const counts = new Map();
  for (const match of html.matchAll(regex)) counts.set(match[1], (counts.get(match[1]) || 0) + 1);
  return counts;
}

function unique(values) { return [...new Set(values.filter(Boolean))]; }
function findTags(html) { return unique([...html.matchAll(/<\/?\s*([a-z][a-z0-9-]*)\b/gi)].map((match) => match[1].toLowerCase())); }
function findClasses(html) {
  const values = [];
  for (const match of html.matchAll(/class\s*=\s*["']([^"']*)["']/gi)) values.push(...match[1].split(/\s+/));
  return unique(values);
}
function expectedIds(manifest, key) { return asArray(manifest?.[key]).map((item) => clean(typeof item === "string" ? item : item?.id)).filter(Boolean); }

function sourcePageNumbers(manifest) {
  return unique([
    ...asArray(manifest?.pages).map((page) => Number(page?.page)),
    ...asArray(manifest?.units).map((unit) => Number(unit?.sourcePage || unit?.page)),
    ...asArray(manifest?.assets).map((asset) => Number(asset?.sourcePage || asset?.page)),
  ].filter((page) => Number.isInteger(page) && page > 0)).sort((a, b) => a - b);
}

function inferredSlideBudget(manifest) {
  if (manifest?.slideBudget?.hardMaximum) return manifest.slideBudget;
  const count = sourcePageNumbers(manifest).length;
  if (!count) return { minimum: 1, preferredMinimum: 1, preferredMaximum: Infinity, hardMaximum: Infinity };
  return {
    minimum: count,
    preferredMinimum: count,
    preferredMaximum: count + Math.max(1, Math.ceil(count * 0.1)),
    hardMaximum: count + Math.max(2, Math.ceil(count * 0.15)),
  };
}

function pageBodies(html) {
  return [...html.matchAll(/<article\b[^>]*class\s*=\s*["'][^"']*\bpage\b[^"']*["'][^>]*>([\s\S]*?)<\/article>/gi)].map((match) => match[1]);
}

function visibleText(fragment) {
  return clean(String(fragment || "").replace(/<style\b[\s\S]*?<\/style>/gi, " ").replace(/<svg\b[\s\S]*?<\/svg>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " "));
}

export function verifyDesignedHtml(htmlInput, manifest = {}, options = {}) {
  const html = normalizeDesignedHtml(htmlInput);
  const sourceIds = expectedIds(manifest, "units");
  const assetIds = expectedIds(manifest, "assets");
  const sourceCounts = countAttribute(html, "data-source-id");
  const assetCounts = countAttribute(html, "data-asset-id");
  const approvedClasses = new Set([...APPROVED_COMPONENT_CLASSES, ...asArray(options.additionalClasses).map(clean)]);
  const approvedTags = new Set([...APPROVED_HTML_TAGS, ...asArray(options.additionalTags).map((tag) => clean(tag).toLowerCase())]);
  const missingSourceIds = sourceIds.filter((id) => !sourceCounts.has(id));
  const duplicatedSourceIds = sourceIds.filter((id) => (sourceCounts.get(id) || 0) > 1);
  const unknownSourceIds = [...sourceCounts.keys()].filter((id) => !sourceIds.includes(id));
  const missingAssetIds = assetIds.filter((id) => !assetCounts.has(id));
  const duplicatedAssetIds = assetIds.filter((id) => (assetCounts.get(id) || 0) > 1);
  const unknownAssetIds = [...assetCounts.keys()].filter((id) => !assetIds.includes(id));
  const unknownClasses = findClasses(html).filter((className) => !approvedClasses.has(className));
  const unknownTags = findTags(html).filter((tag) => !approvedTags.has(tag));
  const inlineStyles = [...html.matchAll(/\sstyle\s*=\s*["'][^"']*["']/gi)].map((match) => match[0].trim());
  const eventHandlers = unique([...html.matchAll(/\s(on[a-z]+)\s*=\s*["'][^"']*["']/gi)].map((match) => match[1].toLowerCase()));
  const scripts = [...html.matchAll(/<\s*script\b/gi)].length;
  const externalUrls = unique([...html.matchAll(/(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/gi)].map((match) => match[1]));
  const externalCssUrls = unique([...[...html.matchAll(/@import\s+(?:url\()?\s*["']?(https?:\/\/[^"')\s;]+)/gi)].map((match) => match[1]), ...[...html.matchAll(/url\(\s*["']?(https?:\/\/[^"')\s]+)/gi)].map((match) => match[1])]);
  const unsafeUrls = unique([...html.matchAll(/(?:src|href)\s*=\s*["'](javascript:|data:text\/html)[^"']*["']/gi)].map((match) => match[1]));
  const unsafeAttributes = unique([...html.matchAll(/\s(srcdoc|formaction)\s*=\s*["'][^"']*["']/gi)].map((match) => match[1].toLowerCase()));
  const bodies = pageBodies(html);
  const pages = bodies.length;
  const slideBudget = inferredSlideBudget(manifest);
  const emptyPages = bodies.map((body, index) => ({ index: index + 1, text: visibleText(body), hasSource: /data-source-id\s*=/i.test(body), hasAsset: /data-asset-id\s*=/i.test(body) })).filter((page) => page.index > 1 && !page.hasSource && !page.hasAsset && page.text.length < 40).map((page) => page.index);
  const forbiddenLabels = unique([...html.matchAll(/>\s*(SOURCE(?:\s+\d+)?|VISUAL EXPLANATION|JANG_ASSET:[^<\s]+)\s*</gi)].map((match) => match[1]));
  const titleValues = [...html.matchAll(/<(?:h1|h2)\b[^>]*class\s*=\s*["'][^"']*\bpage-title\b[^"']*["'][^>]*>([\s\S]*?)<\/(?:h1|h2)>/gi)].map((match) => visibleText(match[1]).replace(/\s+[—-]\s+continued(?:\s+[—-]\s+continued)*/gi, "").toLowerCase()).filter(Boolean);
  const repeatedTitles = unique(titleValues.filter((title, index) => titleValues.indexOf(title) !== index));
  const structuralErrors = [];
  if (!html.startsWith("<!DOCTYPE html>")) structuralErrors.push("Missing <!DOCTYPE html>.");
  if (!/<html\b/i.test(html) || !/<\/html>\s*$/i.test(html)) structuralErrors.push("HTML root element is incomplete.");
  if (!/<head\b/i.test(html) || !/<\/head>/i.test(html)) structuralErrors.push("Head element is incomplete.");
  if (!/<body\b/i.test(html) || !/<\/body>/i.test(html)) structuralErrors.push("Body element is incomplete.");
  if (!pages) structuralErrors.push("No .page article was generated.");
  if (scripts) structuralErrors.push("Script elements are forbidden.");
  if (pages < slideBudget.minimum) structuralErrors.push(`Generated ${pages} slides, below the source-page minimum of ${slideBudget.minimum}.`);
  if (pages > slideBudget.hardMaximum) structuralErrors.push(`Generated ${pages} slides, above the hard maximum of ${slideBudget.hardMaximum}.`);

  const report = { valid: false, pages, slideBudget, emptyPages, forbiddenLabels, repeatedTitles, missingSourceIds, duplicatedSourceIds, unknownSourceIds, missingAssetIds, duplicatedAssetIds, unknownAssetIds, unknownClasses, unknownTags, inlineStyles, eventHandlers, externalUrls, externalCssUrls, unsafeUrls, unsafeAttributes, structuralErrors };
  report.valid = Object.entries(report).every(([key, value]) => ["valid", "pages", "slideBudget"].includes(key) || (Array.isArray(value) && value.length === 0));
  return report;
}

export function createHtmlDesignPrompt({ manifest, referenceHtml, metadata = {}, previousHtml = "", verification = null }) {
  const sourceUnits = asArray(manifest?.units).map((unit) => ({ id: clean(unit?.id), kind: clean(unit?.kind || "paragraph"), role: clean(unit?.role || "body"), sourcePage: Number(unit?.sourcePage || unit?.page || 0), sourceOrder: Number(unit?.sourceOrder || unit?.order || 0), bbox: unit?.bbox || null, style: unit?.style || null, verbatimText: clean(unit?.verbatimText || unit?.text) })).filter((unit) => unit.id && unit.verbatimText);
  const assets = asArray(manifest?.assets).map((asset) => ({ id: clean(asset?.id), kind: clean(asset?.kind || asset?.type || "image"), sourcePage: Number(asset?.sourcePage || 0), sourceOrder: Number(asset?.sourceOrder || 0), bbox: asset?.bbox || null, alt: clean(asset?.alt), caption: clean(asset?.caption) })).filter((asset) => asset.id);
  const pageNumbers = sourcePageNumbers({ units: sourceUnits, assets, pages: manifest?.pages });
  const pages = pageNumbers.map((page) => ({ page, units: sourceUnits.filter((unit) => unit.sourcePage === page).map((unit) => unit.id), assets: assets.filter((asset) => asset.sourcePage === page).map((asset) => asset.id), relationships: asArray(manifest?.relationships).filter((relation) => Number(relation?.sourcePage) === page) }));
  const slideBudget = inferredSlideBudget({ ...manifest, units: sourceUnits, assets });

  return `Create one complete standalone academic lecture HTML document. Return HTML only, beginning with <!DOCTYPE html>.

DESIGN RESPONSIBILITY
Choose the boxes, diagrams, tables, columns, image placement, hierarchy, and spacing inside the supplied source-page structure. Use only the supplied reference design's existing classes and visual language. Copy the reference CSS into the output document. Do not invent CSS classes, colors, fonts, scripts, or external resources. Do not use inline style attributes.

SOURCE-PAGE SEMANTICS — MANDATORY
The source lecture contains ${pageNumbers.length} semantic pages. Preserve page order and keep each source page's text and visuals together. A visual and its related explanation must remain on the same output slide whenever they fit. Do not create filler pages, isolated image pages, generic SOURCE labels, generic VISUAL EXPLANATION labels, or repeated “continued” pages. Split a source page only when readability makes it unavoidable. Never split a page merely to show an image separately.

SLIDE BUDGET — MANDATORY
Minimum ${slideBudget.minimum}; preferred ${slideBudget.preferredMinimum}–${slideBudget.preferredMaximum}; hard maximum ${slideBudget.hardMaximum}. Exceeding the hard maximum is a validation failure.

CONTENT FIDELITY
Every source unit must appear exactly once in an element carrying data-source-id="SOURCE_ID". Copy its verbatimText exactly; never summarize, paraphrase, translate, correct, or omit it. Every asset must appear exactly once as an <img data-asset-id="ASSET_ID" ...> without a remote src. Do not invent IDs. Diagrams may organize source text visually, but every label must remain verbatim and tied to its source ID.

POWERPOINT CONVERSION CONTRACT
Use one <article class="page"> for every output slide. Every page is exactly 900 by 1170 CSS pixels. Keep all visible content inside each page and avoid overflow. Prefer native HTML text, tables, SVG shapes, and connectors so the converter can create editable PowerPoint objects. Avoid filters, masks, canvas, video, animation, JavaScript, remote URLs, and unsupported CSS. Keep diagrams as simple inline SVG using rect, circle, ellipse, line, polyline, polygon, path, text, and tspan. Use explicit SVG coordinates and viewBox values.

METADATA
${JSON.stringify(metadata)}

SEMANTIC PAGE MANIFEST
${JSON.stringify({ slideBudget, pages, units: sourceUnits, assets, relationships: asArray(manifest?.relationships) })}

MASTER DESIGN REFERENCE
${clean(referenceHtml)}

${previousHtml ? `PREVIOUS INVALID HTML\n${previousHtml}\n\nVALIDATION REPORT\n${JSON.stringify(verification)}\nCorrect every reported issue and return the full HTML again.` : ""}`;
}

export function hydrateDesignedHtml(htmlInput, manifest = {}, assetResolver = (id) => `asset:${id}`) {
  let html = normalizeDesignedHtml(htmlInput);
  const unitMap = new Map(asArray(manifest?.units).map((unit) => [clean(unit?.id), clean(unit?.verbatimText || unit?.text)]));
  const assetMap = new Map(asArray(manifest?.assets).map((asset) => [clean(asset?.id), asset]));
  html = html.replace(/(<([a-z][a-z0-9-]*)\b[^>]*data-source-id\s*=\s*["']([^"']+)["'][^>]*>)([\s\S]*?)(<\/\2>)/gi, (all, open, tag, id, _body, close) => {
    if (!unitMap.has(id)) return all;
    const exact = esc(unitMap.get(id));
    const hydrated = tag.toLowerCase() === "text" || tag.toLowerCase() === "tspan" ? exact.replace(/\n/g, " ") : exact.replace(/\n/g, "<br>");
    return `${open}${hydrated}${close}`;
  });
  html = html.replace(/<img\b([^>]*data-asset-id\s*=\s*["']([^"']+)["'][^>]*)>/gi, (all, attrs, id) => {
    if (!assetMap.has(id)) return all;
    const src = clean(assetResolver(id, assetMap.get(id)));
    const withoutSrc = attrs.replace(/\s+src\s*=\s*["'][^"']*["']/gi, "");
    return `<img${withoutSrc} src="${esc(src)}">`;
  });
  return html;
}
