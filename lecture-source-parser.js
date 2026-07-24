const BLOCK_ALIASES = Object.freeze({
  "SOURCE FILE": "source-file",
  "DOCUMENT TITLE": "title",
  TITLE: "title",
  "TOPIC MAP": "topic-map",
  SUBTITLE: "subtitle",
  PARAGRAPH: "paragraph",
  NOTE: "note",
  "NOTE BOX": "note",
  WARNING: "warning",
  "WARNING BOX": "warning",
  INFO: "info",
  "INFO BOX": "info",
  TABLE: "table",
  IMAGE: "image",
  DIAGRAM: "diagram",
  PATHWAY: "pathway",
  SECTION: "section",
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
const PATHWAY_TYPES = new Set(["linear", "open-circle", "closed-circle", "branched"]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function blockPattern() {
  const names = [...BLOCK_NAMES].sort((a, b) => b.length - a.length).map(escapeRegex).join("|");
  return new RegExp(`^\\[(${names})([^\\]]*)\\][ \\t]*(?:\\r?\\n|$)`, "gim");
}

function parseAttributes(source = "") {
  const attributes = {};
  const pattern = /([a-z][a-z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/gi;
  for (const match of String(source).matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

function removeStructuralSeparator(value) {
  if (value.endsWith("\r\n")) return value.slice(0, -2);
  if (value.endsWith("\n")) return value.slice(0, -1);
  return value;
}

function extractPropertyLine(content, propertyName) {
  const escaped = escapeRegex(propertyName);
  const match = new RegExp(`^${escaped}:[ \\t]*([^\\r\\n]*)$`, "im").exec(content);
  if (!match) return null;
  const start = match.index;
  let end = start + match[0].length;
  if (content.slice(end, end + 2) === "\r\n") end += 2;
  else if (content[end] === "\n") end += 1;
  return { value: match[1], start, end };
}

function withoutRanges(content, ranges) {
  let result = content;
  for (const range of [...ranges].sort((a, b) => b.start - a.start)) {
    result = `${result.slice(0, range.start)}${result.slice(range.end)}`;
  }
  return result.replace(/^\r?\n|\r?\n$/g, "");
}

function normalizePathwayType(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[_\s]+/g, "-");
  const aliases = {
    "open-circular": "open-circle",
    "closed-circular": "closed-circle",
    branching: "branched",
    branch: "branched",
  };
  return aliases[normalized] || normalized;
}

function parseImagePayload(content, blockIndex) {
  const labels = [...content.matchAll(/^label:[ \t]*([^\r\n]*)$/gim)];
  if (labels.length !== 1 || !labels[0][1].trim()) {
    throw new Error(`Image block ${blockIndex + 1} requires exactly one non-empty label: line.`);
  }
  const labelLine = extractPropertyLine(content, "label");
  return {
    label: labelLine.value,
    instructions: withoutRanges(content, [labelLine]),
  };
}

function parseDiagramPayload(content) {
  const typeLine = extractPropertyLine(content, "Type");
  const titleLine = extractPropertyLine(content, "Title");
  const sourceLine = extractPropertyLine(content, "Source page or slide");
  const structureLine = extractPropertyLine(content, "Structure");
  const ranges = [typeLine, titleLine, sourceLine, structureLine].filter(Boolean);
  const structure = withoutRanges(content, ranges);
  return {
    diagramType: typeLine?.value || "diagram",
    title: titleLine?.value || "Diagram",
    label: titleLine?.value || "Diagram",
    sourceReference: sourceLine?.value || "",
    structure,
    diagramContent: structure,
  };
}

function parsePathwayPayload(content, attributes, blockIndex) {
  const typeLine = extractPropertyLine(content, "Type");
  const type = normalizePathwayType(attributes.type || typeLine?.value);
  if (!PATHWAY_TYPES.has(type)) {
    throw new Error(`Pathway block ${blockIndex + 1} requires type=linear, open-circle, closed-circle, or branched, either in the marker or a Type: line.`);
  }
  return {
    pathwayType: type,
    pathwayContent: typeLine ? withoutRanges(content, [typeLine]) : content,
  };
}

function parseListItems(content, numbered = false) {
  const pattern = numbered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*•]\s+(.*)$/;
  const sourceLines = String(content).split(/\r?\n/);
  const items = sourceLines.map((line) => line.match(pattern)?.[1]).filter((value) => value !== undefined);
  return items.length ? items : sourceLines.filter((line) => line.length > 0);
}

function parseMarkdownTable(content) {
  const sourceRows = String(content).split(/\r?\n/).filter((line) => line.trim()).map((line) => line.trim());
  const parsed = sourceRows.map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  const separator = parsed[1]?.every((cell) => /^:?-{3,}:?$/.test(cell));
  return { headers: parsed[0] || [], rows: parsed.slice(separator ? 2 : 1) };
}

/**
 * Parses explicitly marked lecture text without rewriting, correcting, splitting,
 * merging, or reordering lecture content. The complete source and each raw block
 * range are retained for fidelity verification.
 */
export function parseLectureSource(input) {
  const source = String(input ?? "");
  const matches = [...source.matchAll(blockPattern())];

  if (!matches.length) {
    return {
      version: 3,
      source,
      blocks: source ? [{
        id: "block-1",
        marker: "UNMARKED",
        type: "paragraph",
        content: source,
        rawContent: source,
        attributes: {},
        sourceStart: 0,
        contentStart: 0,
        sourceEnd: source.length,
      }] : [],
    };
  }

  const blocks = [];
  const firstMarkerStart = matches[0].index ?? 0;
  if (firstMarkerStart > 0) {
    const rawContent = source.slice(0, firstMarkerStart);
    if (rawContent) {
      blocks.push({
        id: `block-${blocks.length + 1}`,
        marker: "UNMARKED",
        type: "paragraph",
        content: removeStructuralSeparator(rawContent),
        rawContent,
        attributes: {},
        sourceStart: 0,
        contentStart: 0,
        sourceEnd: firstMarkerStart,
      });
    }
  }

  matches.forEach((match, index) => {
    const markerStart = match.index ?? 0;
    const contentStart = markerStart + match[0].length;
    const nextMarkerStart = index + 1 < matches.length ? (matches[index + 1].index ?? source.length) : source.length;
    const rawContent = source.slice(contentStart, nextMarkerStart);
    const content = removeStructuralSeparator(rawContent);
    const marker = match[1].toUpperCase().replace(/\s+/g, " ");
    const type = BLOCK_ALIASES[marker];
    const attributes = parseAttributes(match[2]);
    const block = {
      id: `block-${blocks.length + 1}`,
      marker,
      type,
      content,
      rawContent,
      attributes,
      sourceStart: markerStart,
      contentStart,
      sourceEnd: nextMarkerStart,
    };

    if (type === "image") Object.assign(block, parseImagePayload(content, blocks.length));
    if (type === "diagram") Object.assign(block, parseDiagramPayload(content));
    if (type === "pathway") Object.assign(block, parsePathwayPayload(content, attributes, blocks.length));
    if (type === "bullets") block.items = parseListItems(content, false);
    if (type === "numbered") block.items = parseListItems(content, true);
    if (type === "quick-review") block.items = parseListItems(content, false);
    if (type === "table") Object.assign(block, parseMarkdownTable(content));
    blocks.push(block);
  });

  return { version: 3, source, blocks };
}

export { BLOCK_ALIASES, BLOCK_NAMES, PATHWAY_TYPES, parseMarkdownTable };
