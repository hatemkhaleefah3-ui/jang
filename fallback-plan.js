const clean = (value) => String(value ?? "")
  .replace(/\u0000/g, "")
  .replace(/\u00a0/g, " ")
  .replace(/[\t\f\v]+/g, " ")
  .replace(/ +\n/g, "\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim();

const compact = (value) => clean(value).replace(/\s+/g, " ");
const asArray = (value) => Array.isArray(value) ? value : [];

const emptyBlock = (type, values = {}) => ({
  type, heading: "", text: "", label: "", items: [], pairs: [], headers: [], rows: [],
  assetId: "", caption: "", alt: "", question: "", answer: "", sourceIds: [], ...values,
});

const genericTitle = /^(?:(?:slide|page)\s*\d+|continued|continuation|cont\.?|untitled)$/i;
const numberedStart = /^\s*(?:\d+|[ivxlcdm]+|[a-z])[.)\-:]\s+/i;
const bulletStart = /^\s*[•▪◦‣–—-]\s+/;
const sentenceEnd = /[.!?;:]$/;
const technicalCaption = /^(?:converted from|source (?:pdf )?page|embedded (?:image|visual)|office visual)/i;

function sourceId(unit) {
  if (unit?.id) return String(unit.id);
  const page = Number(unit?.page ?? unit?.sourcePage ?? 0);
  const order = Number(unit?.order ?? unit?.sourceOrder ?? 0);
  const kind = String(unit?.kind || "paragraph").replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();
  return `src_${page}_${order}_${kind}`;
}

function manifestUnit(unit) {
  return {
    id: sourceId(unit),
    kind: String(unit?.kind || "paragraph"),
    sourcePage: Number(unit?.page ?? unit?.sourcePage ?? 0),
    sourceOrder: Number(unit?.order ?? unit?.sourceOrder ?? 0),
    verbatimText: clean(unit?.text ?? unit?.verbatimText),
    extractionMethod: String(unit?.extractionMethod || "native"),
    confidence: Number.isFinite(unit?.confidence) ? unit.confidence : 1,
  };
}

function usableTitle(value) {
  const title = compact(value).replace(/^[#\s]+/, "");
  if (!title || title.length > 145 || genericTitle.test(title) || numberedStart.test(title) || bulletStart.test(title)) return false;
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length > 18 && sentenceEnd.test(title)) return false;
  return true;
}

function chooseTitle(record, units, previousTitle) {
  const explicit = units.find((unit) => unit.kind === "title" && usableTitle(unit.text))?.text;
  if (explicit) return compact(explicit);
  if (usableTitle(record?.title)) return compact(record.title);
  const previous = usableTitle(previousTitle) ? compact(previousTitle).replace(/\s+[—-]\s+(?:continued|visual)$/i, "") : "Source lecture";
  return `${previous} — ${asArray(record?.assets).length && !units.length ? "visual" : "continued"}`;
}

function tableCells(value) {
  return compact(value).split(/\s*\|\s*/).map(compact);
}

function blocksFromUnits(units, sectionTitle) {
  const result = [];
  let index = 0;
  if (units.length && compact(units[0]?.text ?? units[0]?.verbatimText) === compact(sectionTitle)) index = 1;

  while (index < units.length) {
    const unit = units[index];
    const value = clean(unit?.text ?? unit?.verbatimText);
    if (!value || unit.kind === "title") { index += 1; continue; }

    if (unit.kind === "table") {
      const rows = [];
      const ids = [];
      while (index < units.length && units[index]?.kind === "table") {
        const rowText = clean(units[index]?.text ?? units[index]?.verbatimText);
        if (rowText) { rows.push(tableCells(rowText)); ids.push(sourceId(units[index])); }
        index += 1;
      }
      if (rows.length) result.push(emptyBlock("table", { headers: rows[0], rows: rows.slice(1), sourceIds: ids }));
      continue;
    }

    if (unit.kind === "diagram") {
      const items = [];
      const ids = [];
      while (index < units.length && units[index]?.kind === "diagram") {
        const item = clean(units[index]?.text ?? units[index]?.verbatimText);
        if (item) { items.push(item); ids.push(sourceId(units[index])); }
        index += 1;
      }
      if (items.length) result.push(emptyBlock("diagram", { heading: "Source diagram", items, sourceIds: ids }));
      continue;
    }

    result.push(emptyBlock("paragraph", { text: value, sourceIds: [sourceId(unit)] }));
    index += 1;
  }
  return result;
}

function pagePreservingPlan(extraction, options) {
  const pages = asArray(extraction?.sourcePages).slice().sort((a, b) => Number(a?.page) - Number(b?.page));
  const allUnits = asArray(extraction?.sourceUnits).map(manifestUnit).filter((unit) => unit.verbatimText);
  const unitsByPage = new Map();
  for (const unit of allUnits) {
    if (!unitsByPage.has(unit.sourcePage)) unitsByPage.set(unit.sourcePage, []);
    unitsByPage.get(unit.sourcePage).push({ ...unit, page: unit.sourcePage, order: unit.sourceOrder, text: unit.verbatimText });
  }
  for (const units of unitsByPage.values()) units.sort((a, b) => a.sourceOrder - b.sourceOrder);

  const assets = asArray(extraction?.assets);
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const sections = [];
  let previousTitle = extraction?.title || "Source lecture";

  for (const record of pages) {
    const page = Number(record?.page || sections.length + 1);
    const units = unitsByPage.get(page) || [];
    const title = chooseTitle(record, units, previousTitle);
    const contentBlocks = blocksFromUnits(units, title);
    const imageBlocks = asArray(record?.assets).map((assetId) => {
      const asset = assetMap.get(assetId) || {};
      const caption = technicalCaption.test(compact(asset.caption)) ? "" : compact(asset.caption);
      return emptyBlock("image", { assetId, caption, alt: compact(asset.alt), sourcePage: page });
    });
    const blocks = [...contentBlocks, ...imageBlocks];
    if (!blocks.length) continue;
    sections.push({ title, category: `Source slide ${page}`, sourcePage: page, keyTermsCritical: [], keyTermsImportant: [], blocks });
    previousTitle = title;
  }

  if (!sections.length) return null;
  return {
    metadata: {
      title: compact(extraction?.title) || "Untitled lecture", subtitle: "",
      courseCode: options.courseCode || "Course", lectureLabel: options.lectureLabel || "Lecture",
      instructor: options.instructor || "", language: options.language === "auto" ? "" : options.language,
      direction: options.language === "Arabic" ? "rtl" : "ltr",
    },
    overview: "", learningObjectives: [], sections, finalTakeaways: [],
    sourceManifest: {
      units: allUnits,
      assets: assets.map((asset, index) => ({ id: asset.id, kind: asset.type || "image", sourcePage: Number(asset.sourcePage || 0), sourceOrder: index + 1, status: "available" })),
    },
  };
}

function legacyPlan(extraction, options) {
  const sourceTitle = compact(extraction?.title) || "Untitled lecture";
  const tokens = clean(extraction?.content).split(/\n{2,}/).map((token) => token.trim()).filter(Boolean);
  const diagramMap = new Map(asArray(extraction?.diagramSources).map((item) => [item?.id, item?.text]));
  const sections = [];
  let current = null;
  const flush = () => { if (current?.blocks?.length) sections.push(current); };

  for (const token of tokens) {
    const heading = token.match(/^#{1,6}\s+(.+)$/s);
    if (heading) {
      flush();
      current = { title: compact(heading[1]) || sourceTitle, category: "Concept", keyTermsCritical: [], keyTermsImportant: [], blocks: [] };
      continue;
    }
    if (!current) current = { title: sourceTitle, category: "Lecture", keyTermsCritical: [], keyTermsImportant: [], blocks: [] };
    const asset = token.match(/^\[ASSET:([^\]]+)\]$/);
    const diagram = token.match(/^\[DIAGRAM:([^\]]+)\]$/);
    if (asset) current.blocks.push(emptyBlock("image", { assetId: asset[1] }));
    else if (diagram) current.blocks.push(emptyBlock("diagram", { heading: "Source diagram", items: clean(diagramMap.get(diagram[1])).split(/\n+/).map(compact).filter(Boolean) }));
    else current.blocks.push(emptyBlock("paragraph", { text: clean(token).replace(/\n+/g, " ") }));
  }
  flush();

  return {
    metadata: { title: sourceTitle, subtitle: "", courseCode: options.courseCode || "Course", lectureLabel: options.lectureLabel || "Lecture", instructor: options.instructor || "", language: options.language === "auto" ? "" : options.language, direction: options.language === "Arabic" ? "rtl" : "ltr" },
    overview: "", learningObjectives: [],
    sections: sections.length ? sections : [{ title: sourceTitle, category: "Lecture", keyTermsCritical: [], keyTermsImportant: [], blocks: [emptyBlock("paragraph", { text: "No readable lecture content was found." })] }],
    finalTakeaways: [],
  };
}

export function createFallbackPlan(extraction, options = {}) {
  return pagePreservingPlan(extraction, options) || legacyPlan(extraction, options);
}
