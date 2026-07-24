const BLOCK_NAMES = [
  "TITLE", "SUBTITLE", "PARAGRAPH", "NOTE", "WARNING", "INFO", "TABLE", "IMAGE",
  "PATHWAY", "SECTION", "BULLETS", "NUMBERED", "PAGE", "END",
];

const BLOCK_PATTERN = new RegExp(`^\\[(${BLOCK_NAMES.join("|")})([^\\]]*)\\][ \\t]*(?:\\r?\\n|$)`, "gim");
const PATHWAY_TYPES = new Set(["linear", "open-circle", "closed-circle", "branched"]);

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

function parseImagePayload(content, blockIndex) {
  const matches = [...content.matchAll(/^label:[ \t]*([^\r\n]*)$/gim)];
  if (matches.length !== 1 || !matches[0][1]) {
    throw new Error(`Image block ${blockIndex + 1} requires a label: line; exactly one non-empty label is allowed.`);
  }

  const match = matches[0];
  const lineStart = match.index ?? 0;
  let lineEnd = lineStart + match[0].length;
  if (content.slice(lineEnd, lineEnd + 2) === "\r\n") lineEnd += 2;
  else if (content[lineEnd] === "\n") lineEnd += 1;
  let instructions = `${content.slice(0, lineStart)}${content.slice(lineEnd)}`;
  if (lineEnd === content.length) instructions = instructions.replace(/\r?\n$/, "");

  return {
    label: match[1],
    instructions,
  };
}

function parsePathwayPayload(content, attributes, blockIndex) {
  const type = String(attributes.type || "").toLowerCase();
  if (!PATHWAY_TYPES.has(type)) {
    throw new Error(`Pathway block ${blockIndex + 1} requires type=linear, open-circle, closed-circle, or branched.`);
  }
  return { pathwayType: type };
}

/**
 * Parse explicitly marked lecture text without rewriting, correcting, splitting,
 * merging, or reordering lecture content. Marker lines and the single separator
 * newline immediately before the next marker are structural syntax. The complete
 * pasted source is retained byte-for-byte in document.source and each block keeps
 * its unmodified rawContent range for fidelity checks.
 */
export function parseLectureSource(input) {
  const source = String(input ?? "");
  const matcher = new RegExp(BLOCK_PATTERN.source, BLOCK_PATTERN.flags);
  const matches = [...source.matchAll(matcher)];

  if (!matches.length) {
    return {
      version: 2,
      source,
      blocks: source ? [{
        id: "block-1",
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
    const type = match[1].toLowerCase();
    const attributes = parseAttributes(match[2]);
    const block = {
      id: `block-${blocks.length + 1}`,
      type,
      content,
      rawContent,
      attributes,
      sourceStart: markerStart,
      contentStart,
      sourceEnd: nextMarkerStart,
    };

    if (type === "image") Object.assign(block, parseImagePayload(content, blocks.length));
    if (type === "pathway") Object.assign(block, parsePathwayPayload(content, attributes, blocks.length));
    blocks.push(block);
  });

  return { version: 2, source, blocks };
}

export { BLOCK_NAMES, PATHWAY_TYPES };
