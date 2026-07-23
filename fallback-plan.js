const clean = (value) => String(value || "")
  .replace(/\u00a0/g, " ")
  .replace(/[\t\f\v]+/g, " ")
  .replace(/ +\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .replace(/ {2,}/g, " ")
  .trim();

const emptyBlock = (type, values = {}) => ({
  type,
  heading: "",
  text: "",
  label: "",
  items: [],
  pairs: [],
  headers: [],
  rows: [],
  assetId: "",
  caption: "",
  alt: "",
  question: "",
  answer: "",
  ...values,
});

const genericSection = /^(?:continued|continuation|cont\.?|slide\s+\d+|page\s+\d+|\d+)$/i;
const majorLabel = /^(?:location|regulation|significance|functions?|reactions?|clinical significance|mechanism|summary|definition|pathway|phase\s+[ivx\d]+|importance|note)$/i;

function normalizeTitle(value, fallback = "Lecture") {
  const title = clean(value).replace(/^[#\s]+/, "").slice(0, 140);
  return title || fallback;
}

function looksLikeSubheading(value) {
  const text = clean(value);
  if (!text || text.length > 90 || /[.!?;:]$/.test(text)) return false;
  const words = text.split(/\s+/).filter(Boolean);
  if (majorLabel.test(text)) return true;
  if (words.length < 2 || words.length > 8) return false;
  if (/^[A-Z\d\s()\-–—/:]+$/.test(text) && /[A-Z]/.test(text)) return true;
  return words.every((word) => /^[A-Z][\p{L}\p{N}'’\-–—()]*$/u.test(word));
}

function mergeParagraphBlocks(blocks) {
  const merged = [];
  for (const block of blocks) {
    if (block.type !== "paragraph") {
      merged.push(block);
      continue;
    }
    const text = clean(block.text);
    if (!text) continue;
    const previous = merged.at(-1);
    const canMerge = previous?.type === "paragraph"
      && !previous.heading
      && !block.heading
      && `${previous.text} ${text}`.length <= 1800
      && (!/[.!?)]$/.test(previous.text) || previous.text.length < 160 || text.length < 120);
    if (canMerge) previous.text = clean(`${previous.text} ${text}`);
    else merged.push({ ...block, text });
  }
  return merged;
}

function parseTable(token) {
  const lines = token.split("\n").map(clean).filter(Boolean);
  if (lines.length < 2 || !lines[0].includes("|") || !/^\|?\s*:?-{3,}/.test(lines[1])) return null;
  const cells = (line) => line.replace(/^\||\|$/g, "").split("|").map(clean);
  return emptyBlock("table", { headers: cells(lines[0]), rows: lines.slice(2).map(cells) });
}

function parseToken(token, pendingHeading = "") {
  const value = clean(token);
  if (!value) return { block: null, heading: pendingHeading };

  const asset = value.match(/^\[ASSET:([^\]]+)\]$/);
  if (asset) return { block: emptyBlock("image", { assetId: asset[1] }), heading: pendingHeading };

  const table = parseTable(token);
  if (table) return { block: table, heading: pendingHeading };

  const lines = token.split("\n").map(clean).filter(Boolean);
  if (lines.length && lines.every((line) => /^[-*]\s+/.test(line))) {
    return {
      block: emptyBlock("bullets", {
        heading: pendingHeading,
        items: lines.map((line) => line.replace(/^[-*]\s+/, "")),
      }),
      heading: "",
    };
  }
  if (lines.length && lines.every((line) => /^\d+[.)]\s+/.test(line))) {
    return {
      block: emptyBlock("steps", {
        heading: pendingHeading,
        items: lines.map((line) => line.replace(/^\d+[.)]\s+/, "")),
      }),
      heading: "",
    };
  }

  return {
    block: emptyBlock("paragraph", { heading: pendingHeading, text: value.replace(/\n+/g, " ") }),
    heading: "",
  };
}

function consolidateSections(sections, fallbackTitle) {
  const consolidated = [];
  for (const raw of sections) {
    const section = {
      title: normalizeTitle(raw.title, fallbackTitle),
      category: raw.category || "Concept",
      keyTermsCritical: [],
      keyTermsImportant: [],
      blocks: mergeParagraphBlocks(raw.blocks || []),
    };
    if (!section.blocks.length) continue;

    const previous = consolidated.at(-1);
    const sameTitle = previous && previous.title.toLowerCase() === section.title.toLowerCase();
    if (previous && (genericSection.test(section.title) || sameTitle)) {
      previous.blocks = mergeParagraphBlocks([...previous.blocks, ...section.blocks]);
      continue;
    }
    consolidated.push(section);
  }

  const chunked = [];
  for (const section of consolidated) {
    const size = 10;
    for (let offset = 0, part = 1; offset < section.blocks.length; offset += size, part += 1) {
      const blocks = section.blocks.slice(offset, offset + size);
      chunked.push({
        ...section,
        title: part === 1 ? section.title : `${section.title} · Part ${part}`,
        blocks,
      });
    }
  }
  return chunked.slice(0, 40);
}

export function createFallbackPlan(extraction, options = {}) {
  const sourceTitle = normalizeTitle(extraction?.title, "Untitled lecture");
  const tokens = clean(extraction?.content).split(/\n{2,}/).map((token) => token.trim()).filter(Boolean);
  const sections = [];
  let current = { title: sourceTitle, category: "Lecture", blocks: [] };
  let pendingHeading = "";

  const flush = () => {
    if (current.blocks.length) sections.push(current);
    current = { title: sourceTitle, category: "Concept", blocks: [] };
    pendingHeading = "";
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const heading = token.match(/^(#{1,6})\s+(.+)$/s);
    if (heading) {
      flush();
      current = { title: normalizeTitle(heading[2], sourceTitle), category: "Concept", blocks: [] };
      continue;
    }

    const plain = clean(token).replace(/\n+/g, " ");
    const next = clean(tokens[index + 1] || "");
    if (looksLikeSubheading(plain) && next && !/^#{1,6}\s+/.test(next) && !/^\[ASSET:/.test(next)) {
      pendingHeading = plain;
      continue;
    }

    const parsed = parseToken(token, pendingHeading);
    pendingHeading = parsed.heading;
    if (parsed.block) current.blocks.push(parsed.block);
  }
  flush();

  const grouped = consolidateSections(sections, sourceTitle);
  return {
    metadata: {
      title: sourceTitle,
      subtitle: "Reformatted lecture notes",
      courseCode: options.courseCode || "Course",
      lectureLabel: options.lectureLabel || "Lecture",
      instructor: options.instructor || "",
      language: options.language === "auto" ? "" : options.language,
      direction: options.language === "Arabic" ? "rtl" : "ltr",
    },
    overview: "Source-preserving layout grouped by the lecture's original headings and paragraphs.",
    learningObjectives: [],
    sections: grouped.length ? grouped : [{
      title: sourceTitle,
      category: "Lecture",
      keyTermsCritical: [],
      keyTermsImportant: [],
      blocks: [emptyBlock("paragraph", { text: "No readable lecture content was found." })],
    }],
    finalTakeaways: [],
  };
}
