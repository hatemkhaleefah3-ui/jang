import * as core from "./source-importer-core.js";

export const applyOcrResults = core.applyOcrResults;
export const applyBrowserOcr = core.applyBrowserOcr;
export const createFallbackPlan = core.createFallbackPlan;
export const getUploadPolicy = core.getUploadPolicy;
export const convertOfficeVisual = core.convertOfficeVisual;

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
