const clean = (value) => String(value ?? "")
  .replace(/\u0000/g, "")
  .replace(/\u00a0/g, " ")
  .replace(/[\t\f\v]+/g, " ")
  .replace(/ +\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const compact = (value) => clean(value).replace(/\s+/g, " ");
const asArray = (value) => Array.isArray(value) ? value : [];
const stableSourceId = (unit) => unit?.id || `src_${Number(unit?.page || unit?.sourcePage || 0)}_${Number(unit?.order || unit?.sourceOrder || 0)}_${String(unit?.kind || "paragraph").replace(/[^a-z0-9_-]+/gi, "_")}`.toLowerCase();

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
  sourceIds: [],
  ...values,
});

const genericTitle = /^(?:slide|page)\s*\d+$|^(?:continued|continuation|cont\.?|untitled)$/i;
const numberedStart = /^\s*(?:\d+|[ivxlcdm]+|[a-z])[.)\-:]\s+/i;
const bulletStart = /^\s*[•▪◦‣–—-]\s+/;
const sentenceEnd = /[.!?;:]$/;
const technicalCaption = /^(?:converted from|source (?:pdf )?page|embedded (?:image|visual)|office visual)/i;

function normalizedTitle(value) {
  return compact(value).replace(/^[#\s]+/, "").trim();
}

function usableTitle(value) {
  const title = normalizedTitle(value);
  if (!title || genericTitle.test(title) || title.length > 145 || numberedStart.test(title) || bulletStart.test(title)) return false;
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length > 18 && sentenceEnd.test(title)) return false;
  return true;
}

function continuationTitle(previous, page, visualOnly = false) {
  const base = usableTitle(previous) ? normalizedTitle(previous).replace(/\s+[·—-]\s+(?:continued|visual)$/i, "") : `Source slide ${page}`;
  return `${base} — ${visualOnly ? "visual" : "continued"}`;
}

function looksLikeSubheading(value) {
  const text = compact(value);
  if (!text || text.length > 90 || numberedStart.test(text) || bulletStart.test(text) || sentenceEnd.test(text)) return false;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 10) return false;
  if (/^[A-Z\d\s()\-–—/:]+$/.test(text) && /[A-Z]/.test(text)) return true;
  return words.length <= 6 && words.every((word) => /^[A-Z][\p{L}\p{N}'’\-–—()]*$/u.test(word));
}

function categoryFor(title, hasImage, hasTable, hasDiagram) {
  const value = normalizedTitle(title).toLowerCase();
  if (hasTable) return "Reference table";
  if (hasDiagram || hasImage) return "Visual explanation";
  if (/regulation|control|inhibit|stimulat/.test(value)) return "Regulation";
  if (/deficien|disease|clinical|intolerance|galactosemia|therapy|cancer/.test(value)) return "Clinical application";
  if (/synthesis|lysis|cycle|pathway|metabolism|reaction|phase/.test(value)) return "Biochemical process";
  if (/significance|function|importance/.test(value)) return "Key significance";
  return "Lecture content";
}

function splitFixedColumns(value) {
  return String(value ?? "").trim().split(/ {2,}/).map((cell) => compact(cell)).filter(Boolean);
}

function detectFixedWidthTable(units) {
  const candidates = units.filter((unit) => unit.kind === "paragraph" && clean(unit.text));
  if (candidates.length < 3) return null;
  const headerIndex = candidates.findIndex((unit) => {
    const cells = splitFixedColumns(unit.text);
    if (cells.length < 3) return false;
    const signals = cells.filter((cell) => /^(?:type|name|deficient(?:\s+enzyme)?|enzyme|clinical(?:\s+features?)?|features?|class|condition|category|description)$/i.test(cell)).length;
    return signals >= 3;
  });
  if (headerIndex < 0) return null;

  const headers = splitFixedColumns(candidates[headerIndex].text);
  if (headers.length < 3) return null;
  const width = headers.length;
  const rows = [];
  const sourceIds = [stableSourceId(candidates[headerIndex])];
  let current = null;

  for (const unit of candidates.slice(headerIndex + 1)) {
    const raw = String(unit.text ?? "");
    const cells = splitFixedColumns(raw);
    if (!cells.length) continue;
    sourceIds.push(stableSourceId(unit));
    const startsIndented = /^\s{2,}/.test(raw);
    const startsNewRecord = !startsIndented && (cells.length >= Math.min(3, width) || /^(?:type|class|stage|grade)\b/i.test(cells[0]));

    if (!current || startsNewRecord) {
      current = Array.from({ length: width }, (_, index) => cells[index] || "");
      if (cells.length > width) current[width - 1] = compact(cells.slice(width - 1).join(" "));
      rows.push(current);
      continue;
    }

    if (cells.length === 1) {
      current[width - 1] = compact(`${current[width - 1]} ${cells[0]}`);
    } else if (cells.length === 2 && width >= 4) {
      current[1] = compact(`${current[1]} ${cells[0]}`);
      current[width - 1] = compact(`${current[width - 1]} ${cells[1]}`);
    } else {
      const offset = Math.max(0, width - cells.length);
      cells.forEach((cell, index) => {
        const target = Math.min(width - 1, offset + index);
        current[target] = compact(`${current[target]} ${cell}`);
      });
    }
  }

  if (!rows.length) return null;
  return {
    headerIndex,
    consumed: new Set(candidates.slice(headerIndex).map((unit) => stableSourceId(unit))),
    block: emptyBlock("table", {
      heading: "",
      headers,
      rows,
      sourceIds,
      variant: "clinical",
    }),
  };
}

function paragraphBlocks(units, consumed = new Set()) {
  const blocks = [];
  let pendingHeading = "";
  let grouped = [];
  let groupedMode = "";

  const flushGroup = () => {
    if (!grouped.length) return;
    blocks.push(emptyBlock("paragraph", {
      heading: pendingHeading,
      text: grouped.map((unit) => clean(unit.text)).filter(Boolean).join("\n\n"),
      sourceIds: grouped.map(stableSourceId),
      presentation: groupedMode || "paragraphs",
    }));
    pendingHeading = "";
    grouped = [];
    groupedMode = "";
  };

  for (const unit of units) {
    const id = stableSourceId(unit);
    if (consumed.has(id)) continue;
    const value = clean(unit.text);
    if (!value) continue;

    if (unit.kind === "diagram") {
      flushGroup();
      const previous = blocks.at(-1);
      if (previous?.type === "diagram" && !pendingHeading) {
        previous.items.push(value);
        previous.sourceIds.push(id);
      } else {
        blocks.push(emptyBlock("diagram", { heading: pendingHeading || "Process diagram", items: [value], sourceIds: [id] }));
        pendingHeading = "";
      }
      continue;
    }

    if (unit.kind === "table") {
      flushGroup();
      const cells = value.split(/\s*\|\s*/).map(compact);
      const previous = blocks.at(-1);
      if (previous?.type === "table") {
        previous.rows.push(cells);
        previous.sourceIds.push(id);
      } else {
        blocks.push(emptyBlock("table", { heading: pendingHeading, headers: cells, rows: [], sourceIds: [id] }));
        pendingHeading = "";
      }
      continue;
    }

    if (looksLikeSubheading(value) && !unit.role?.includes("title")) {
      flushGroup();
      pendingHeading = value;
      continue;
    }

    const mode = numberedStart.test(value) ? "numbered" : bulletStart.test(value) ? "bulleted" : "paragraphs";
    if (mode !== "paragraphs") {
      flushGroup();
      blocks.push(emptyBlock("paragraph", {
        heading: pendingHeading,
        text: value,
        sourceIds: [id],
        presentation: mode,
      }));
      pendingHeading = "";
      continue;
    }
    if (grouped.length && (groupedMode !== mode || grouped.map((item) => clean(item.text)).join(" ").length + value.length > 1050)) flushGroup();
    groupedMode = mode;
    grouped.push(unit);
  }
  flushGroup();
  if (pendingHeading) blocks.push(emptyBlock("paragraph", { text: pendingHeading, sourceIds: [] }));
  return blocks;
}

function sourceManifest(extraction) {
  const units = asArray(extraction?.sourceUnits).map((unit) => ({
    id: stableSourceId(unit),
    kind: unit?.kind || "paragraph",
    sourcePage: Number(unit?.page || unit?.sourcePage || 0),
    sourceOrder: Number(unit?.order || unit?.sourceOrder || 0),
    verbatimText: clean(unit?.text),
    role: unit?.role || "body",
    extractionMethod: unit?.extractionMethod || "native",
    confidence: Number.isFinite(unit?.confidence) ? unit.confidence : 1,
  })).filter((unit) => unit.verbatimText);

  const assets = asArray(extraction?.assets).map((asset, index) => ({
    id: clean(asset?.id) || `asset_${index + 1}`,
    occurrenceId: clean(asset?.occurrenceId) || clean(asset?.id) || `asset_${index + 1}`,
    sourcePage: Number(asset?.sourcePage || 0),
    sourceOrder: Number(asset?.sourceOrder || index + 1),
    kind: asset?.type || "image",
    status: "available",
  }));
  return { units, assets };
}

function legacyPlan(extraction, options = {}) {
  const content = String(extraction?.content || "");
  const diagramMap = new Map(asArray(extraction?.diagramSources).map((item) => [clean(item?.id), clean(item?.text)]));
  const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)];
  const sections = [];

  if (!headings.length) {
    const value = clean(content);
    if (value) sections.push({ title: normalizedTitle(extraction?.title) || "Lecture", category: "Lecture content", sourcePage: 1, keyTermsCritical: [], keyTermsImportant: [], blocks: [emptyBlock("paragraph", { text: value })] });
  } else {
    headings.forEach((heading, index) => {
      const start = heading.index + heading[0].length;
      const end = headings[index + 1]?.index ?? content.length;
      const title = clean(heading[1]) || `Section ${index + 1}`;
      const blocks = [];
      for (const token of content.slice(start, end).trim().split(/\n{2,}/).map((item) => item.trim()).filter(Boolean)) {
        const asset = token.match(/^\[ASSET:([^\]]+)\]$/);
        if (asset) { blocks.push(emptyBlock("image", { assetId: clean(asset[1]) })); continue; }
        const diagram = token.match(/^\[DIAGRAM:([^\]]+)\]$/);
        if (diagram) {
          blocks.push(emptyBlock("diagram", { heading: "Source diagram", items: clean(diagramMap.get(clean(diagram[1]))).split(/\n+/).map(clean).filter(Boolean) }));
          continue;
        }
        blocks.push(emptyBlock("paragraph", { text: clean(token.replace(/\n+/g, " ")) }));
      }
      if (blocks.length) sections.push({ title, category: "Lecture content", sourcePage: index + 1, keyTermsCritical: [], keyTermsImportant: [], blocks });
    });
  }

  return {
    metadata: {
      title: normalizedTitle(extraction?.title) || "Untitled lecture",
      subtitle: "Source-faithful redesigned lecture",
      courseCode: options.courseCode || "Course",
      lectureLabel: options.lectureLabel || "Lecture",
      instructor: options.instructor || "",
      language: options.language === "auto" ? "" : options.language,
      direction: options.language === "Arabic" ? "rtl" : "ltr",
    },
    overview: "",
    learningObjectives: [],
    sections: sections.length ? sections : [{ title: normalizedTitle(extraction?.title) || "Lecture", category: "Lecture content", sourcePage: 1, keyTermsCritical: [], keyTermsImportant: [], blocks: [emptyBlock("paragraph", { text: "No readable lecture content was found." })] }],
    finalTakeaways: [],
  };
}

export function createFallbackPlan(extraction, options = {}) {
  const pages = asArray(extraction?.sourcePages);
  const rawUnits = asArray(extraction?.sourceUnits);
  const assets = asArray(extraction?.assets);
  if (!pages.length && !rawUnits.length && !assets.length) return legacyPlan(extraction, options);
  const units = rawUnits.map((unit) => ({ ...unit, id: stableSourceId(unit) }));
  const manifest = sourceManifest(extraction);
  const sourceTitle = normalizedTitle(extraction?.title) || "Untitled lecture";
  const sections = [];
  let previousTitle = sourceTitle;

  const pageNumbers = pages.length
    ? pages.map((page) => Number(page?.page)).filter(Number.isFinite)
    : [...new Set([...units.map((unit) => Number(unit.page)), ...assets.map((asset) => Number(asset.sourcePage))].filter(Number.isFinite))].sort((a, b) => a - b);

  for (const pageNumber of pageNumbers) {
    const page = pages.find((item) => Number(item?.page) === pageNumber) || { page: pageNumber, title: `Slide ${pageNumber}`, assets: [] };
    const pageUnits = units.filter((unit) => Number(unit.page) === pageNumber).sort((a, b) => Number(a.order) - Number(b.order));
    const pageAssets = assets.filter((asset) => Number(asset.sourcePage) === pageNumber || asArray(page.assets).includes(asset.id));
    const visualOnly = !pageUnits.some((unit) => clean(unit.text)) && pageAssets.length > 0;

    let title = usableTitle(page.title)
      ? normalizedTitle(page.title)
      : sections.length ? continuationTitle(previousTitle, pageNumber, visualOnly) : `Source slide ${pageNumber}`;
    const titleUnit = pageUnits.find((unit) => unit.role === "title" || unit.role === "inferred-title")
      || (usableTitle(page.title) ? pageUnits.find((unit) => compact(unit.text) === compact(page.title)) : null);
    if (titleUnit && usableTitle(titleUnit.text)) title = normalizedTitle(titleUnit.text);
    if (usableTitle(title)) previousTitle = title;

    const bodyUnits = pageUnits.filter((unit) => {
      if (unit === titleUnit) return false;
      if ((unit.role === "title" || unit.role === "inferred-title") && compact(unit.text) === compact(title)) return false;
      return true;
    });

    const fixedTable = detectFixedWidthTable(bodyUnits);
    const blocks = paragraphBlocks(bodyUnits, fixedTable?.consumed || new Set());
    if (fixedTable) blocks.push(fixedTable.block);

    for (const asset of pageAssets) {
      const caption = technicalCaption.test(clean(asset.caption)) ? "" : clean(asset.caption);
      blocks.push(emptyBlock("image", {
        assetId: asset.id,
        caption,
        alt: clean(asset.alt),
        sourceIds: [],
        sourcePage: pageNumber,
        occurrenceId: asset.occurrenceId || asset.id,
      }));
    }

    if (!blocks.length && pageUnits.length) {
      blocks.push(emptyBlock("paragraph", {
        text: pageUnits.map((unit) => clean(unit.text)).filter(Boolean).join("\n\n"),
        sourceIds: pageUnits.map(stableSourceId),
      }));
    }
    const duplicateCover = pageNumber === pageNumbers[0]
      && bodyUnits.length === 0
      && pageAssets.length === 0
      && compact(title).toLowerCase() === compact(sourceTitle).toLowerCase();
    if (!blocks.length || duplicateCover) continue;

    sections.push({
      title,
      category: categoryFor(title, pageAssets.length > 0, Boolean(fixedTable), bodyUnits.some((unit) => unit.kind === "diagram")),
      sourcePage: pageNumber,
      layoutHint: fixedTable ? "table" : pageAssets.length && bodyUnits.length ? "split" : pageAssets.length ? "visual" : "text",
      keyTermsCritical: [],
      keyTermsImportant: [],
      blocks,
    });
  }

  return {
    metadata: {
      title: sourceTitle,
      subtitle: "Source-faithful redesigned lecture",
      courseCode: options.courseCode || "Course",
      lectureLabel: options.lectureLabel || "Lecture",
      instructor: options.instructor || "",
      language: options.language === "auto" ? "" : options.language,
      direction: options.language === "Arabic" ? "rtl" : "ltr",
    },
    overview: "",
    learningObjectives: [],
    sections: sections.length ? sections : [{
      title: sourceTitle,
      category: "Lecture content",
      sourcePage: 1,
      layoutHint: "text",
      keyTermsCritical: [],
      keyTermsImportant: [],
      blocks: [emptyBlock("paragraph", { text: "No readable lecture content was found." })],
    }],
    finalTakeaways: [],
    sourceManifest: manifest,
  };
}
