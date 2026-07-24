import * as core from "./source-importer-core.js";

export const applyOcrResults = core.applyOcrResults;
export const applyBrowserOcr = core.applyBrowserOcr;
export const getUploadPolicy = core.getUploadPolicy;
export const convertOfficeVisual = core.convertOfficeVisual;

const cleanText = (value) => String(value ?? "")
  .replace(/\u0000/g, "")
  .replace(/\u00a0/g, " ")
  .replace(/\s+/g, " ")
  .trim();

function stableSourceId(unit, index = 0) {
  return unit?.id || `src_${Number(unit?.page || unit?.sourcePage || 0)}_${Number(unit?.order || unit?.sourceOrder || index + 1)}_${String(unit?.kind || "paragraph").replace(/[^a-z0-9_-]+/gi, "_")}`.toLowerCase();
}

function blockText(block) {
  if (!block || typeof block !== "object") return "";
  const values = [block.heading, block.text, block.label, block.caption, block.alt, block.question, block.answer];
  values.push(...(Array.isArray(block.items) ? block.items : []));
  values.push(...(Array.isArray(block.headers) ? block.headers : []));
  for (const row of Array.isArray(block.rows) ? block.rows : []) values.push(...(Array.isArray(row) ? row : []));
  for (const pair of Array.isArray(block.pairs) ? block.pairs : []) values.push(pair?.term, pair?.label, pair?.description, pair?.definition, pair?.text);
  return cleanText(values.filter(Boolean).join(" "));
}

function ensureFallbackSourceCoverage(plan, extraction) {
  if (!plan || typeof plan !== "object") return plan;
  const sections = (Array.isArray(plan.sections) ? plan.sections : []).map((section) => ({
    ...section,
    blocks: (Array.isArray(section?.blocks) ? section.blocks : []).map((block) => ({ ...block })),
  }));
  const representedIds = new Set();
  const renderedText = [];

  for (const section of sections) {
    renderedText.push(cleanText(section.title));
    for (const block of section.blocks) {
      for (const id of Array.isArray(block?.sourceIds) ? block.sourceIds : []) representedIds.add(id);
      renderedText.push(blockText(block));
    }
  }

  const units = Array.isArray(extraction?.sourceUnits) ? extraction.sourceUnits : [];
  units.forEach((unit, index) => {
    const value = cleanText(unit?.text);
    if (!value) return;
    const id = stableSourceId(unit, index);
    if (representedIds.has(id) || renderedText.some((candidate) => candidate && candidate.includes(value))) return;

    const sourcePage = Number(unit?.page || unit?.sourcePage || 0);
    let section = sections.find((item) => Number(item?.sourcePage || 0) === sourcePage);
    if (!section) {
      section = {
        title: sourcePage ? `Source slide ${sourcePage}` : "Recovered source content",
        category: "Recovered source content",
        sourcePage,
        layoutHint: "text",
        keyTermsCritical: [],
        keyTermsImportant: [],
        blocks: [],
      };
      sections.push(section);
    }
    section.blocks.push({
      type: "paragraph", heading: "", text: value, label: "", items: [], pairs: [], headers: [], rows: [], assetId: "", caption: "", alt: "", question: "", answer: "",
      sourceIds: [id],
      presentation: /^\s*(?:\d+|[ivxlcdm]+|[a-z])[.)\-:]\s+/i.test(value) ? "numbered" : "paragraphs",
    });
    representedIds.add(id);
    renderedText.push(value);
  });

  return { ...plan, sections };
}

export function createFallbackPlan() {
  throw new Error("Gemini lecture design is unavailable. Jang will not generate or offer a low-quality fallback PowerPoint. Please retry when the AI design service is available.");
}

function repairExtractionStructure(extraction) {
  if (!extraction || typeof extraction !== "object") return extraction;
  const assets = Array.isArray(extraction.assets) ? extraction.assets : [];
  const existingPages = Array.isArray(extraction.sourcePages) ? extraction.sourcePages : [];
  const needsStructure = !existingPages.length || assets.some((asset) => !Number(asset?.sourcePage));
  if (!needsStructure || !String(extraction.content || "").trim()) return extraction;

  const pageRecords = new Map();
  let page = 1;
  let seenContent = 0;
  let order = 0;
  const ensurePage = () => {
    if (!pageRecords.has(page)) pageRecords.set(page, { page, title: `Source page ${page}`, assets: [] });
    return pageRecords.get(page);
  };

  for (const token of String(extraction.content).split(/\n{2,}/).map((value) => value.trim()).filter(Boolean)) {
    const heading = token.match(/^(#{1,6})\s+(.+)$/s);
    if (heading && seenContent) { page += 1; order = 0; }
    const record = ensurePage();
    if (heading) {
      record.title = String(heading[2] || "").replace(/\s+/g, " ").trim() || record.title;
      seenContent += 1;
      order += 1;
      continue;
    }
    const assetMatch = token.match(/^\[ASSET:([^\]]+)\]$/);
    if (assetMatch) {
      const asset = assets.find((item) => item?.id === assetMatch[1]);
      if (asset) {
        asset.sourcePage = Number(asset.sourcePage) || page;
        asset.sourceOrder = Number(asset.sourceOrder) || order + 1;
        asset.occurrenceId = asset.occurrenceId || asset.id;
        if (!record.assets.includes(asset.id)) record.assets.push(asset.id);
      }
      continue;
    }
    seenContent += 1;
    order += 1;
  }

  for (const asset of assets) {
    if (!Number(asset.sourcePage)) asset.sourcePage = Math.max(1, page);
    asset.sourceOrder = Number(asset.sourceOrder) || 1;
    asset.occurrenceId = asset.occurrenceId || asset.id;
    const record = pageRecords.get(Number(asset.sourcePage)) || { page: Number(asset.sourcePage), title: `Source page ${asset.sourcePage}`, assets: [] };
    if (!record.assets.includes(asset.id)) record.assets.push(asset.id);
    pageRecords.set(record.page, record);
  }

  if (!existingPages.length) extraction.sourcePages = [...pageRecords.values()].sort((left, right) => left.page - right.page);
  return extraction;
}

export async function extractLecture(file, onProgress = () => {}) {
  return repairExtractionStructure(await core.extractLecture(file, onProgress));
}
