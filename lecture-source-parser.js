const BLOCK_ALIASES = Object.freeze({
  "SOURCE FILE": "source-file",
  "DOCUMENT TITLE": "title",
  TITLE: "title",
  "TOPIC MAP": "topic-map",
  SECTION: "section",
  SUBTITLE: "subtitle",
  PARAGRAPH: "paragraph",
  NOTE: "note",
  "NOTE BOX": "note",
  INFO: "info",
  "INFO BOX": "info",
  WARNING: "warning",
  "WARNING BOX": "warning",
  TABLE: "table",
  IMAGE: "image",
  DIAGRAM: "diagram",
  PATHWAY: "pathway",
  BULLETS: "bullets",
  "BULLET LIST": "bullets",
  NUMBERED: "numbered",
  "NUMBERED LIST": "numbered",
  "QUICK REVIEW": "quick-review",
  FOOTER: "footer",
  PAGE: "page",
  END: "end",
});

const BLOCK_NAMES = Object.freeze(Object.keys(BLOCK_ALIASES));
const BLOCK_PATTERN = new RegExp(`^\\[(${BLOCK_NAMES.map((name) => name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")).join("|")})([^\\]]*)\\][ \\t]*(?:\\r?\\n|$)`, "gim");
const PATHWAY_TYPES = new Set(["linear", "open-circle", "closed-circle", "branched"]);

function parseAttributes(source = "") {
  const attributes = {};
  const pattern = /([a-z][a-z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/gi;
  for (const match of String(source).matchAll(pattern)) attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  return attributes;
}

function removeStructuralSeparator(value) {
  if (value.endsWith("\r\n")) return value.slice(0, -2);
  if (value.endsWith("\n")) return value.slice(0, -1);
  return value;
}

function firstField(content, field) {
  const match = String(content).match(new RegExp(`^${field}:[ \\t]*([^\\r\\n]*)$`, "im"));
  return match?.[1] ?? "";
}

function stripFieldLines(content, fields) {
  const names = fields.map((field) => field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return String(content).replace(new RegExp(`^(?:${names}):[^\\r\\n]*(?:\\r?\\n|$)`, "gim"), "").replace(/^\s+|\s+$/g, "");
}

function parseImagePayload(content, blockIndex) {
  const matches = [...String(content).matchAll(/^label:[ \t]*([^\r\n]*)$/gim)];
  if (matches.length !== 1 || !matches[0][1].trim()) throw new Error(`Image block ${blockIndex + 1} requires exactly one non-empty label: line.`);
  return { label: matches[0][1], instructions: stripFieldLines(content, ["label"]) };
}

function parsePathwayPayload(content, attributes, blockIndex) {
  const declared = String(attributes.type || firstField(content, "Type") || "").trim().toLowerCase();
  if (!PATHWAY_TYPES.has(declared)) throw new Error(`Pathway block ${blockIndex + 1} requires type linear, open-circle, closed-circle, or branched.`);
  return { pathwayType: declared, pathwayContent: stripFieldLines(content, ["Type"]) };
}

function parseDiagramPayload(content) {
  return {
    diagramType: firstField(content, "Type"),
    title: firstField(content, "Title"),
    sourceReference: firstField(content, "Source page or slide"),
    structure: stripFieldLines(content, ["Type", "Title", "Source page or slide"]).replace(/^Structure:[ \t]*(?:\r?\n|$)/im, ""),
  };
}

function parseListItems(content, numbered = false) {
  const linePattern = numbered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*•]\s+(.*)$/;
  const lines = String(content).split(/\r?\n/);
  const items = lines.map((line) => line.match(linePattern)?.[1]).filter((value) => value !== undefined);
  return items.length ? items : lines.filter((line) => line.length > 0);
}

function parseMarkdownTable(content) {
  const rows = String(content).split(/\r?\n/).filter((line) => line.trim()).map((line) => line.trim());
  const parsed = rows.map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  const separator = parsed[1]?.every((cell) => /^:?-{3,}:?$/.test(cell));
  return { headers: parsed[0] || [], rows: parsed.slice(separator ? 2 : 1) };
}

/** Parse explicitly marked lecture text without rewriting, correcting, splitting, merging, or reordering content. */
export function parseLectureSource(input) {
  const source = String(input ?? "");
  const matcher = new RegExp(BLOCK_PATTERN.source, BLOCK_PATTERN.flags);
  const matches = [...source.matchAll(matcher)];
  if (!matches.length) return { version: 3, source, blocks: source ? [{ id: "block-1", type: "paragraph", marker: "", content: source, rawContent: source, attributes: {}, sourceStart: 0, contentStart: 0, sourceEnd: source.length }] : [] };

  const blocks = [];
  const addBlock = (data) => blocks.push({ id: `block-${blocks.length + 1}`, ...data });
  const firstMarkerStart = matches[0].index ?? 0;
  if (firstMarkerStart > 0) {
    const rawContent = source.slice(0, firstMarkerStart);
    if (rawContent) addBlock({ type: "paragraph", marker: "", content: removeStructuralSeparator(rawContent), rawContent, attributes: {}, sourceStart: 0, contentStart: 0, sourceEnd: firstMarkerStart });
  }

  matches.forEach((match, index) => {
    const markerStart = match.index ?? 0;
    const contentStart = markerStart + match[0].length;
    const nextMarkerStart = index + 1 < matches.length ? (matches[index + 1].index ?? source.length) : source.length;
    const rawContent = source.slice(contentStart, nextMarkerStart);
    const content = removeStructuralSeparator(rawContent);
    const marker = match[1].toUpperCase();
    const type = BLOCK_ALIASES[marker];
    const attributes = parseAttributes(match[2]);
    const block = { type, marker, content, rawContent, attributes, sourceStart: markerStart, contentStart, sourceEnd: nextMarkerStart };
    if (type === "image") Object.assign(block, parseImagePayload(content, blocks.length));
    if (type === "pathway") Object.assign(block, parsePathwayPayload(content, attributes, blocks.length));
    if (type === "diagram") Object.assign(block, parseDiagramPayload(content));
    if (type === "bullets") block.items = parseListItems(content, false);
    if (type === "numbered") block.items = parseListItems(content, true);
    if (type === "quick-review") block.items = parseListItems(content, false);
    if (type === "table") Object.assign(block, parseMarkdownTable(content));
    addBlock(block);
  });

  return { version: 3, source, blocks };
}

export { BLOCK_ALIASES, BLOCK_NAMES, PATHWAY_TYPES, parseMarkdownTable };
