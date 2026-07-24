const BLOCK_PATTERN = /^\[(TITLE|SUBTITLE|PARAGRAPH|NOTE|WARNING|INFO|TABLE|IMAGE|PATHWAY|SECTION|BULLETS|NUMBERED)([^\]]*)\][ \t]*(?:\r?\n|$)/gim;

const PATHWAY_TYPES = new Set(["linear", "open-circle", "closed-circle", "branched"]);

function parseAttributes(source = "") {
  const attributes = {};
  const pattern = /([a-z][a-z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+))/gi;
  for (const match of source.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

function removeSingleSeparatorNewline(value) {
  if (value.endsWith("\r\n")) return value.slice(0, -2);
  if (value.endsWith("\n")) return value.slice(0, -1);
  return value;
}

function imagePayload(content, blockIndex) {
  const labelMatch = content.match(/(?:^|\r?\n)label:[ \t]*([^\r\n]*)(?=\r?\n|$)/i);
  if (!labelMatch) {
    throw new Error(`Image block ${blockIndex + 1} requires a label: line.`);
  }
  return {
    label: labelMatch[1],
    content,
  };
}

function pathwayPayload(content, attributes, blockIndex) {
  const type = String(attributes.type || "").toLowerCase();
  if (!PATHWAY_TYPES.has(type)) {
    throw new Error(`Pathway block ${blockIndex + 1} requires type=linear, open-circle, closed-circle, or branched.`);
  }
  return { type, content };
}

/**
 * Parse explicitly marked lecture text without rewriting, correcting, splitting,
 * merging, or reordering its content. Marker lines are structural and are not
 * included in block content. Every other character is retained in source order.
 */
export function parseLectureSource(input) {
  const source = String(input ?? "");
  const matches = [...source.matchAll(BLOCK_PATTERN)];

  if (!matches.length) {
    return {
      version: 1,
      source,
      blocks: source ? [{ id: "block-1", type: "paragraph", content: source, sourceStart: 0, sourceEnd: source.length }] : [],
    };
  }

  const blocks = [];
  const firstMarkerStart = matches[0].index ?? 0;
  if (firstMarkerStart > 0) {
    const prefix = source.slice(0, firstMarkerStart);
    if (prefix) {
      blocks.push({
        id: `block-${blocks.length + 1}`,
        type: "paragraph",
        content: removeSingleSeparatorNewline(prefix),
        sourceStart: 0,
        sourceEnd: firstMarkerStart,
      });
    }
  }

  matches.forEach((match, index) => {
    const markerStart = match.index ?? 0;
    const contentStart = markerStart + match[0].length;
    const nextMarkerStart = index + 1 < matches.length ? (matches[index + 1].index ?? source.length) : source.length;
    const content = removeSingleSeparatorNewline(source.slice(contentStart, nextMarkerStart));
    const type = match[1].toLowerCase();
    const attributes = parseAttributes(match[2]);
    const block = {
      id: `block-${blocks.length + 1}`,
      type,
      content,
      attributes,
      sourceStart: markerStart,
      sourceEnd: nextMarkerStart,
    };

    if (type === "image") Object.assign(block, imagePayload(content, blocks.length));
    if (type === "pathway") Object.assign(block, pathwayPayload(content, attributes, blocks.length));
    blocks.push(block);
  });

  return { version: 1, source, blocks };
}

export { PATHWAY_TYPES };
