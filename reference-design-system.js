import { MASTER_DESIGN_REFERENCE } from "./master-design-reference.js";

const REQUIRED_TOKENS = Object.freeze([
  "page-bg", "page-bg-solid", "text-primary", "text-secondary", "text-muted",
  "surface-gradient", "surface-dark", "surface-solid", "accent-yellow", "accent-red",
  "accent-border", "flow-arrow", "flow-box-bg", "flow-box-border", "font-body",
  "font-display", "font-accent", "font-mono",
]);

const REQUIRED_CLASSES = Object.freeze([
  "page", "cover-page", "cover-title", "cover-subtitle", "page-header", "page-title",
  "page-body", "page-footer", "callout-note", "note-label", "section-divider",
  "text-bulleted", "text-steps", "table-wrap", "comparison-table", "img-full-width",
  "img-side-text", "diagram-host", "diagram-closed-circle", "diagram-linear-horizontal",
  "diagram-tree-hierarchy", "mindmap-open-arc", "end-page", "end-headline", "end-subtext",
]);

const DESIGN_TOOLS = Object.freeze({
  fonts: ["font-body", "font-display", "font-accent", "font-mono"],
  colors: [
    "page-bg", "page-bg-solid", "text-primary", "text-secondary", "text-muted",
    "surface-gradient", "surface-dark", "surface-solid", "accent-yellow", "accent-red",
    "accent-red-dark", "accent-border", "accent-border-dark", "flow-arrow",
    "flow-box-bg", "flow-box-border",
  ],
  textStyles: ["cover-title", "cover-subtitle", "page-title", "compare-head", "important-word", "critical-highlight"],
  formsAndBoxes: ["legend-box", "callout-note", "text-key-takeaways", "compare-col", "section-divider"],
  diagrams: [
    "diagram-host", "diagram-closed-circle", "diagram-linear-horizontal", "diagram-linear-vertical",
    "diagram-tree-hierarchy", "diagram-venn", "diagram-quadrant", "diagram-timeline",
    "mindmap-host", "mindmap-radial", "mindmap-hierarchical", "mindmap-open-arc",
  ],
  tables: ["table-wrap", "data-table", "comparison-table", "glossary-table", "stat-table", "table-caption"],
  images: ["img-full-width", "img-side-text", "img-grid", "img-overlay", "img-text-content"],
  header: ["page-header", "course-label", "page-title", "category-tag"],
  footer: ["page-footer", "footer-left", "footer-center", "page-number"],
  cover: ["cover-page", "cover-top-bar", "cover-hero", "cover-title", "cover-subtitle", "cover-bottom"],
  endPage: ["end-page", "end-top-bar", "end-body", "end-headline", "end-subtext", "end-bottom"],
});

function extractStyle(reference) {
  const match = String(reference).match(/<style\b[^>]*>([\s\S]*?)<\/style>/i);
  if (!match) throw new Error("The reference HTML design file does not contain a style block.");
  return match[1].trim();
}

function extractTokens(css) {
  const tokens = {};
  for (const match of css.matchAll(/--([a-z0-9_-]+)\s*:\s*([^;]+);/gi)) {
    tokens[match[1]] = match[2].trim();
  }
  return Object.freeze(tokens);
}

function extractClasses(reference, css) {
  const values = new Set();
  for (const match of String(reference).matchAll(/class\s*=\s*["']([^"']+)["']/gi)) {
    for (const name of match[1].split(/\s+/)) if (name) values.add(name);
  }
  for (const match of String(css).matchAll(/\.([a-z_][a-z0-9_-]*)/gi)) values.add(match[1]);
  return Object.freeze([...values].sort());
}

function extractArticleTemplates(reference) {
  const templates = { cover: "", standard: "", diagram: "", evidence: "", end: "" };
  const articles = [...String(reference).matchAll(/<article\b[^>]*class\s*=\s*["']([^"']*\bpage\b[^"']*)["'][^>]*>[\s\S]*?<\/article>/gi)];
  for (const match of articles) {
    const classes = new Set(match[1].split(/\s+/));
    const html = match[0];
    if (classes.has("cover-page")) templates.cover = html;
    else if (classes.has("end-page")) templates.end = html;
    else if (/diagram-host/.test(html)) templates.diagram = html;
    else if (/table-wrap|img-side-text/.test(html)) templates.evidence = html;
    else if (!templates.standard) templates.standard = html;
  }
  return Object.freeze(templates);
}

function buildComponentCatalog(classSet, tokens) {
  const catalog = {};
  for (const [tool, names] of Object.entries(DESIGN_TOOLS)) {
    const tokenTool = tool === "fonts" || tool === "colors";
    catalog[tool] = Object.freeze(names.map((name) => ({
      className: name,
      recognized: tokenTool ? Object.prototype.hasOwnProperty.call(tokens, name) : classSet.has(name),
    })));
  }
  return Object.freeze(catalog);
}

export function inspectReferenceDesign(referenceHtml = MASTER_DESIGN_REFERENCE) {
  const css = extractStyle(referenceHtml);
  const tokens = extractTokens(css);
  const classes = extractClasses(referenceHtml, css);
  const classSet = new Set(classes);
  const templates = extractArticleTemplates(referenceHtml);
  const componentCatalog = buildComponentCatalog(classSet, tokens);
  const errors = [];

  for (const token of REQUIRED_TOKENS) if (!(token in tokens)) errors.push(`Missing design token --${token}.`);
  for (const className of REQUIRED_CLASSES) if (!classSet.has(className)) errors.push(`Missing design component class .${className}.`);
  for (const [name, template] of Object.entries(templates)) if (!template) errors.push(`Missing ${name} page/component template.`);
  if (!/h1\s*,\s*h2\s*,\s*h3|h1\s*\{/.test(css)) errors.push("Missing heading text styles.");
  if (!/p\s*,\s*li\s*\{/.test(css)) errors.push("Missing paragraph/list text styles.");

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    css,
    tokens,
    classes,
    templates,
    componentCatalog,
  });
}

export function assertReferenceDesign(referenceHtml = MASTER_DESIGN_REFERENCE) {
  const report = inspectReferenceDesign(referenceHtml);
  if (!report.valid) throw new Error(`Reference HTML design validation failed: ${report.errors.join(" ")}`);
  return report;
}

export { DESIGN_TOOLS, REQUIRED_CLASSES, REQUIRED_TOKENS };
