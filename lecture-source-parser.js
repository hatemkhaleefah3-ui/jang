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

function markerPattern() {
  const names = [...BLOCK_NAMES].sort((a, b) => b.length - a.length).map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`^\\[(${names})([^\\]]*)\\][ \\t]*(?:\\r?\\n|$)`, "gim");
}

function parseAttributes(source = "") {
  const attributes = {};
  const pattern = /([a-z][a-z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/gi;
  for (const match of String(source).matchAll(pattern)) attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  return attributes;
}

function cleanBlock(value) {
  return String(value).replace(/\r\n?/g, "\n").replace(/^\n|\n$/g, "");
}

function parseListItems(content, numbered = false) {
  const pattern = numbered ? /^\s*\d+[.)]\s+(.*)$/ : /^\s*[-*•]\s+(.*)$/;
  const sourceLines = String(content).split(/\r?\n/);
  const items = sourceLines.map((line) => line.match(pattern)?.[1]).filter((value) => value !== undefined);
  return items.length ? items : sourceLines.map((line) => line.trim()).filter(Boolean);
}

function parseMarkdownTable(content) {
  const rows = String(content).split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
  const separator = rows[1]?.every((cell) => /^:?-{3,}:?$/.test(cell));
  return { headers: rows[0] || [], rows: rows.slice(separator ? 2 : 1) };
}

function property(content, name) {
  return new RegExp(`^${name}:\\s*(.*)$`, "im").exec(content)?.[1]?.trim() || "";
}

export function parseLectureSource(input) {
  const source = String(input ?? "");
  const matches = [...source.matchAll(markerPattern())];
  if (!matches.length) {
    return { version: 4, source, blocks: source ? [{ id: "block-1", marker: "UNMARKED", type: "paragraph", content: source, rawContent: source, attributes: {} }] : [] };
  }

  const blocks = [];
  const firstStart = matches[0].index ?? 0;
  if (firstStart > 0 && source.slice(0, firstStart)) {
    const content = cleanBlock(source.slice(0, firstStart));
    blocks.push({ id: `block-${blocks.length + 1}`, marker: "UNMARKED", type: "paragraph", content, rawContent: content, attributes: {} });
  }

  matches.forEach((match, index) => {
    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = index + 1 < matches.length ? (matches[index + 1].index ?? source.length) : source.length;
    const content = cleanBlock(source.slice(contentStart, contentEnd));
    const marker = match[1].toUpperCase().replace(/\s+/g, " ");
    const type = BLOCK_ALIASES[marker];
    const block = {
      id: `block-${blocks.length + 1}`,
      marker,
      type,
      content,
      rawContent: source.slice(contentStart, contentEnd),
      attributes: parseAttributes(match[2]),
    };

    if (["bullets", "quick-review"].includes(type)) block.items = parseListItems(content, false);
    if (type === "numbered") block.items = parseListItems(content, true);
    if (type === "table") Object.assign(block, parseMarkdownTable(content));
    if (type === "image") {
      block.label = property(content, "label") || "Image";
      block.instructions = content.replace(/^label:\s*.*(?:\n|$)/im, "").trim();
    }
    if (type === "diagram") {
      block.diagramType = property(content, "Type") || "Diagram";
      block.title = property(content, "Title") || "Diagram";
      block.structure = property(content, "Structure") || content;
    }
    if (type === "pathway") {
      block.pathwayType = block.attributes.type || property(content, "Type") || "linear";
      block.pathwayContent = content.replace(/^Type:\s*.*(?:\n|$)/im, "").trim();
    }

    blocks.push(block);
  });

  return { version: 4, source, blocks };
}

export { BLOCK_ALIASES, BLOCK_NAMES, parseMarkdownTable };
