const asArray = (value) => Array.isArray(value) ? value : [];
const clean = (value) => String(value ?? "").replace(/\u0000/g, "").trim();
const esc = (value) => clean(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

export const APPROVED_HTML_TAGS = new Set([
  "article", "aside", "blockquote", "br", "caption", "circle", "defs", "div", "ellipse", "figcaption", "figure",
  "footer", "g", "h1", "h2", "h3", "h4", "header", "hr", "img", "li", "line", "main", "marker", "meta", "nav", "ol",
  "p", "path", "polygon", "polyline", "rect", "section", "small", "span", "strong", "svg", "table", "tbody", "td",
  "text", "thead", "th", "title", "tr", "tspan", "ul"
]);

export const APPROVED_COMPONENT_CLASSES = new Set([
  "page", "cover-page", "cover-top-bar", "course-code", "term-tag", "cover-hero", "cover-eyebrow", "cover-rule",
  "cover-title", "cover-subtitle", "cover-meta-row", "cover-meta-item", "meta-label", "meta-value", "cover-visual-strip",
  "cover-bottom", "page-header", "course-label", "page-title", "category-tag", "page-body", "page-footer", "footer-left",
  "footer-center", "page-number", "legend-box", "legend-title", "legend-items", "legend-item", "legend-swatch",
  "critical-highlight", "var-a", "var-b", "var-c", "important-word", "callout-note", "note-icon", "note-content",
  "note-label", "section-divider", "divider-line", "divider-label", "text-bulleted", "text-steps", "text-comparison-cols",
  "compare-col", "compare-head", "text-qa", "qa-item", "qa-question", "qa-answer", "text-definitions", "def-item",
  "def-term", "def-desc", "text-key-takeaways", "takeaway-header", "takeaway-icon", "takeaway-list", "table-wrap",
  "data-table", "comparison-table", "glossary-table", "stat-table", "accent-row", "table-caption", "img-full-width",
  "img-side-text", "img-text-content", "img-thumbnail", "img-thumbnail-wrap", "img-grid", "img-overlay", "overlay-text",
  "diagram-host", "diagram-label", "diagram-best-for", "mindmap-host", "toc-block", "toc-header", "toc-list", "toc-item",
  "toc-section", "toc-num", "toc-dots", "toc-page", "two-col", "three-col", "end-page", "end-top-bar", "end-body",
  "end-icon-mark", "end-headline", "end-subtext", "end-takeaway-list", "etl-header", "etl-num", "end-bottom"
]);

function countAttribute(html, attribute) {
  const regex = new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "gi");
  const counts = new Map();
  for (const match of html.matchAll(regex)) counts.set(match[1], (counts.get(match[1]) || 0) + 1);
  return counts;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function findTags(html) {
  return unique([...html.matchAll(/<\/?\s*([a-z][a-z0-9-]*)\b/gi)].map((match) => match[1].toLowerCase()));
}

function findClasses(html) {
  const values = [];
  for (const match of html.matchAll(/class\s*=\s*["']([^"']*)["']/gi)) values.push(...match[1].split(/\s+/));
  return unique(values);
}

function expectedIds(manifest, key) {
  return asArray(manifest?.[key]).map((item) => clean(typeof item === "string" ? item : item?.id)).filter(Boolean);
}

export function verifyDesignedHtml(htmlInput, manifest = {}, options = {}) {
  const html = clean(htmlInput);
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
  const scripts = [...html.matchAll(/<\s*script\b/gi)].length;
  const externalUrls = unique([...html.matchAll(/(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']/gi)].map((match) => match[1]));
  const unsafeUrls = unique([...html.matchAll(/(?:src|href)\s*=\s*["'](javascript:|data:text\/html)[^"']*["']/gi)].map((match) => match[1]));
  const pages = [...html.matchAll(/<article\b[^>]*class\s*=\s*["'][^"']*\bpage\b[^"']*["'][^>]*>/gi)].length;
  const structuralErrors = [];
  if (!html.startsWith("<!DOCTYPE html>")) structuralErrors.push("Missing <!DOCTYPE html>.");
  if (!/<html\b/i.test(html) || !/<\/html>\s*$/i.test(html)) structuralErrors.push("HTML root element is incomplete.");
  if (!/<body\b/i.test(html) || !/<\/body>/i.test(html)) structuralErrors.push("Body element is incomplete.");
  if (!pages) structuralErrors.push("No .page article was generated.");
  if (scripts) structuralErrors.push("Script elements are forbidden.");

  const report = {
    valid: false,
    pages,
    missingSourceIds,
    duplicatedSourceIds,
    unknownSourceIds,
    missingAssetIds,
    duplicatedAssetIds,
    unknownAssetIds,
    unknownClasses,
    unknownTags,
    inlineStyles,
    externalUrls,
    unsafeUrls,
    structuralErrors,
  };
  report.valid = Object.entries(report).every(([key, value]) => key === "valid" || key === "pages" || (Array.isArray(value) && value.length === 0));
  return report;
}

export function createHtmlDesignPrompt({ manifest, referenceHtml, metadata = {}, previousHtml = "", verification = null }) {
  const sourceUnits = asArray(manifest?.units).map((unit) => ({
    id: clean(unit?.id),
    kind: clean(unit?.kind || "paragraph"),
    sourcePage: Number(unit?.sourcePage || unit?.page || 0),
    sourceOrder: Number(unit?.sourceOrder || unit?.order || 0),
    verbatimText: clean(unit?.verbatimText || unit?.text),
  })).filter((unit) => unit.id && unit.verbatimText);
  const assets = asArray(manifest?.assets).map((asset) => ({
    id: clean(asset?.id),
    kind: clean(asset?.kind || asset?.type || "image"),
    sourcePage: Number(asset?.sourcePage || 0),
    alt: clean(asset?.alt),
    caption: clean(asset?.caption),
  })).filter((asset) => asset.id);

  return `Create one complete academic lecture HTML document. Return HTML only, beginning with <!DOCTYPE html>.

DESIGN RESPONSIBILITY
Choose the page structure, boxes, diagrams, tables, columns, image placement, hierarchy, and spacing. Use only the supplied reference design's existing classes and visual language. Do not invent CSS, classes, colors, fonts, scripts, or external resources. Do not use inline style attributes.

CONTENT FIDELITY
Every source unit must appear exactly once in an element carrying data-source-id="SOURCE_ID". Copy its verbatimText exactly; never summarize, paraphrase, translate, correct, or omit it. Every asset must appear exactly once as an <img data-asset-id="ASSET_ID" ...>. Do not invent IDs. Diagrams may organize source text visually, but every label must remain verbatim and tied to its source ID.

POWERPOINT CONVERSION CONTRACT
Use one <article class="page"> for every output slide. Keep all visible content inside each page. Prefer native HTML text, tables, SVG shapes, and connectors so the converter can create editable PowerPoint objects. Avoid filters, masks, canvas, video, animation, JavaScript, remote URLs, and unsupported CSS. Keep diagrams as simple inline SVG using rect, circle, line, polyline, polygon, path, text, and tspan.

METADATA
${JSON.stringify(metadata)}

SOURCE MANIFEST
${JSON.stringify({ units: sourceUnits, assets })}

MASTER DESIGN REFERENCE
${clean(referenceHtml)}

${previousHtml ? `PREVIOUS INVALID HTML\n${previousHtml}\n\nVALIDATION REPORT\n${JSON.stringify(verification)}\nCorrect every reported issue and return the full HTML again.` : ""}`;
}

export function hydrateDesignedHtml(htmlInput, manifest = {}, assetResolver = (id) => `asset:${id}`) {
  let html = clean(htmlInput);
  const unitMap = new Map(asArray(manifest?.units).map((unit) => [clean(unit?.id), clean(unit?.verbatimText || unit?.text)]));
  const assetMap = new Map(asArray(manifest?.assets).map((asset) => [clean(asset?.id), asset]));

  html = html.replace(/(<([a-z][a-z0-9-]*)\b[^>]*data-source-id\s*=\s*["']([^"']+)["'][^>]*>)([\s\S]*?)(<\/\2>)/gi, (all, open, tag, id, _body, close) => {
    if (!unitMap.has(id)) return all;
    return `${open}${esc(unitMap.get(id)).replace(/\n/g, "<br>")}${close}`;
  });
  html = html.replace(/<img\b([^>]*data-asset-id\s*=\s*["']([^"']+)["'][^>]*)>/gi, (all, attrs, id) => {
    if (!assetMap.has(id)) return all;
    const src = clean(assetResolver(id, assetMap.get(id)));
    const withoutSrc = attrs.replace(/\s+src\s*=\s*["'][^"']*["']/gi, "");
    return `<img${withoutSrc} src="${esc(src)}">`;
  });
  return html;
}
