const clean = (value) => String(value ?? "").replace(/\u0000/g, "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
const asArray = (value) => Array.isArray(value) ? value : [];

function sourceId(unit, index) {
  return clean(unit?.id) || `src_${Number(unit?.page || unit?.sourcePage || 0)}_${Number(unit?.order || unit?.sourceOrder || index + 1)}_${clean(unit?.kind || "paragraph").replace(/[^a-z0-9_-]+/gi, "_")}`.toLowerCase();
}

function assetId(asset, index) {
  return clean(asset?.id || asset?.occurrenceId) || `asset_${index + 1}`;
}

function normalizedBox(value) {
  if (!value || typeof value !== "object") return null;
  const x = Number(value.x ?? value.left);
  const y = Number(value.y ?? value.top);
  const width = Number(value.width ?? ((Number(value.right) || 0) - x));
  const height = Number(value.height ?? ((Number(value.bottom) || 0) - y));
  if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

function inferRole(unit, pageUnits) {
  const explicit = clean(unit?.role).toLowerCase();
  if (explicit) return explicit;
  const text = clean(unit?.text || unit?.verbatimText);
  const order = Number(unit?.order || unit?.sourceOrder || 0);
  if (unit?.kind === "title" || unit?.kind === "heading") return "heading";
  if (order === Math.min(...pageUnits.map((item) => Number(item?.order || item?.sourceOrder || 0)).filter(Number.isFinite)) && text.length <= 120) return "heading";
  if (/^(?:figure|fig\.|table)\s*\d+/i.test(text)) return "caption";
  if (/^(?:•|[-–—]|\d+[.)])\s*/.test(text)) return "list-item";
  return "body";
}

function pageTitle(page, units) {
  const explicit = clean(page?.title);
  if (explicit && !/^source (?:page|slide)\s+\d+$/i.test(explicit)) return explicit;
  const heading = units.find((unit) => unit.role === "heading" && unit.verbatimText);
  return heading?.verbatimText || explicit || `Source page ${Number(page?.page || 0)}`;
}

function nearestUnit(asset, units) {
  if (!units.length) return null;
  const assetOrder = Number(asset?.sourceOrder || 0);
  const byOrder = [...units].sort((a, b) => Math.abs(a.sourceOrder - assetOrder) - Math.abs(b.sourceOrder - assetOrder));
  return byOrder[0] || null;
}

function relationKind(asset, unit) {
  const combined = `${clean(asset?.caption)} ${clean(asset?.alt)} ${unit?.verbatimText || ""}`.toLowerCase();
  if (/diagram|pathway|cycle|scheme|metabolism|synthesis|reaction|flow/.test(combined)) return "explains";
  if (/table|comparison|values|results/.test(combined)) return "supports";
  return "illustrates";
}

export function buildSemanticManifest(extraction = {}) {
  const rawUnits = asArray(extraction.sourceUnits);
  const rawAssets = asArray(extraction.assets);
  const pageMap = new Map();

  const ensurePage = (pageNumber) => {
    const number = Math.max(1, Number(pageNumber) || 1);
    if (!pageMap.has(number)) pageMap.set(number, { page: number, width: null, height: null, title: "", units: [], assets: [], relationships: [] });
    return pageMap.get(number);
  };

  for (const page of asArray(extraction.sourcePages)) {
    const target = ensurePage(page?.page);
    target.width = Number(page?.width) || null;
    target.height = Number(page?.height) || null;
    target.title = clean(page?.title);
  }

  rawUnits.forEach((unit, index) => {
    const pageNumber = Number(unit?.page || unit?.sourcePage || 1);
    const pageUnits = rawUnits.filter((candidate) => Number(candidate?.page || candidate?.sourcePage || 1) === pageNumber);
    const normalized = {
      id: sourceId(unit, index),
      kind: clean(unit?.kind || "paragraph"),
      role: inferRole(unit, pageUnits),
      sourcePage: pageNumber,
      sourceOrder: Number(unit?.order || unit?.sourceOrder || index + 1),
      verbatimText: clean(unit?.text || unit?.verbatimText),
      bbox: normalizedBox(unit?.bbox || unit?.box || unit?.bounds),
      style: unit?.style && typeof unit.style === "object" ? { ...unit.style } : null,
      extractionMethod: clean(unit?.extractionMethod || "native"),
      confidence: Number.isFinite(unit?.confidence) ? unit.confidence : 1,
    };
    if (normalized.verbatimText) ensurePage(pageNumber).units.push(normalized);
  });

  rawAssets.forEach((asset, index) => {
    const pageNumber = Number(asset?.sourcePage || asset?.page || 1);
    ensurePage(pageNumber).assets.push({
      id: assetId(asset, index),
      occurrenceId: clean(asset?.occurrenceId || asset?.id) || assetId(asset, index),
      kind: clean(asset?.type || asset?.kind || "image"),
      sourcePage: pageNumber,
      sourceOrder: Number(asset?.sourceOrder || index + 1),
      bbox: normalizedBox(asset?.bbox || asset?.box || asset?.bounds),
      alt: clean(asset?.alt),
      caption: clean(asset?.caption),
      originalFormat: clean(asset?.originalFormat),
    });
  });

  const pages = [...pageMap.values()].sort((a, b) => a.page - b.page).map((page) => {
    page.units.sort((a, b) => a.sourceOrder - b.sourceOrder);
    page.assets.sort((a, b) => a.sourceOrder - b.sourceOrder);
    page.title = pageTitle(page, page.units);
    for (const asset of page.assets) {
      const related = nearestUnit(asset, page.units);
      if (related) page.relationships.push({
        from: asset.id,
        to: related.id,
        type: relationKind(asset, related),
        requiredTogether: true,
      });
    }
    return page;
  });

  const units = pages.flatMap((page) => page.units);
  const assets = pages.flatMap((page) => page.assets);
  const sourcePageCount = pages.length;
  const visualPageCount = pages.filter((page) => page.assets.length > 0).length;
  const preferredExtra = Math.min(Math.max(1, Math.ceil(visualPageCount * 0.15)), Math.max(2, Math.ceil(sourcePageCount * 0.1)));

  return {
    version: 2,
    sourcePageCount,
    slideBudget: {
      minimum: sourcePageCount,
      preferredMinimum: sourcePageCount,
      preferredMaximum: sourcePageCount + preferredExtra,
      hardMaximum: sourcePageCount + Math.max(2, Math.ceil(sourcePageCount * 0.15)),
    },
    pages,
    units,
    assets,
    relationships: pages.flatMap((page) => page.relationships.map((relation) => ({ ...relation, sourcePage: page.page }))),
  };
}
