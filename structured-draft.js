const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const asArray = (value) => Array.isArray(value) ? value : [];
const clean = (value) => typeof value === "string" ? value.replace(/\u0000/g, "").trim() : "";

export const STRUCTURED_DRAFT_VERSION = "2.0";

function stableId(prefix, parts) {
  const safe = parts.map((part) => String(part ?? "0").replace(/[^a-z0-9_-]+/gi, "_")).join("_");
  return `${prefix}_${safe}`.toLowerCase();
}

function sourceElementType(kind) {
  if (kind === "note") return "note";
  if (kind === "diagram") return "diagram";
  if (kind === "table") return "table";
  return "paragraph";
}

export function createSourceUnit({ page = 0, order = 0, kind = "paragraph", text = "", runs = [], extractionMethod = "native", confidence = 1 }) {
  return {
    id: stableId("src", [page, order, kind]),
    kind,
    sourcePage: page,
    sourceOrder: order,
    verbatimText: clean(text),
    runs: asArray(runs).map((run) => ({
      text: clean(run?.text),
      bold: Boolean(run?.bold),
      italic: Boolean(run?.italic),
      underline: Boolean(run?.underline),
      color: clean(run?.color) || null,
      highlight: clean(run?.highlight) || null,
    })).filter((run) => run.text),
    extractionMethod,
    confidence: Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : 0,
  };
}

export function createAssetRecord({ id, kind = "image", mimeType = "", sourcePage = 0, sourceOrder = 0, alt = "", caption = "", status = "available" }) {
  return {
    id: clean(id) || stableId("asset", [sourcePage, sourceOrder, kind]),
    kind,
    mimeType: clean(mimeType),
    sourcePage,
    sourceOrder,
    alt: clean(alt),
    caption: clean(caption),
    status,
  };
}

function sourceUnitElement(unit, index) {
  const type = sourceElementType(unit.kind);
  const base = {
    id: stableId(type, [index + 1]),
    type,
    sourceIds: [unit.id],
    text: unit.verbatimText,
  };
  if (type === "diagram") return { ...base, heading: "Source diagram", items: [unit.verbatimText] };
  if (type === "table") return { ...base, heading: "Source table", headers: ["Source content"], rows: [[unit.verbatimText]] };
  return base;
}

export function createDraftV1({ documentId = "doc_001", metadata = {}, units = [], assets = [] }) {
  const sourceUnits = asArray(units).filter(isObject);
  const sourceAssets = asArray(assets).filter(isObject);
  return {
    schemaVersion: STRUCTURED_DRAFT_VERSION,
    documentId: clean(documentId) || "doc_001",
    metadata: {
      title: clean(metadata.title) || "Untitled lecture",
      language: clean(metadata.language) || "auto",
      direction: metadata.direction === "rtl" ? "rtl" : "ltr",
    },
    sourceManifest: {
      units: sourceUnits,
      assets: sourceAssets,
    },
    titles: [{
      id: "title_source_001",
      type: "title",
      text: clean(metadata.title) || "Lecture content",
      children: [{
        id: "subtitle_source_001",
        type: "subtitle",
        text: "Source order",
        children: [
          ...sourceUnits.map(sourceUnitElement),
          ...sourceAssets.map((asset, index) => ({
            id: stableId("image_ref", [index + 1]),
            type: "image_ref",
            assetId: asset.id,
            sourceIds: [],
            caption: asset.caption || "",
          })),
        ],
      }],
    }],
  };
}

function walkElements(draft, visitor) {
  for (const title of asArray(draft?.titles)) {
    visitor(title);
    for (const subtitle of asArray(title?.children)) {
      visitor(subtitle);
      for (const element of asArray(subtitle?.children)) visitor(element);
    }
  }
}

export function collectSourceReferences(draft) {
  const counts = new Map();
  walkElements(draft, (element) => {
    for (const id of asArray(element?.sourceIds).map(clean).filter(Boolean)) counts.set(id, (counts.get(id) || 0) + 1);
  });
  return counts;
}

export function collectAssetReferences(draft) {
  const counts = new Map();
  walkElements(draft, (element) => {
    const id = clean(element?.assetId);
    if (id) counts.set(id, (counts.get(id) || 0) + 1);
  });
  return counts;
}

export function verifyDraftCoverage(draftV1, draftV2) {
  const expectedUnits = new Set(asArray(draftV1?.sourceManifest?.units).map((unit) => clean(unit?.id)).filter(Boolean));
  const expectedAssets = new Set(asArray(draftV1?.sourceManifest?.assets).map((asset) => clean(asset?.id)).filter(Boolean));
  const sourceRefs = collectSourceReferences(draftV2);
  const assetRefs = collectAssetReferences(draftV2);

  const missingSourceIds = [...expectedUnits].filter((id) => !sourceRefs.has(id));
  const duplicatedSourceIds = [...sourceRefs.entries()].filter(([id, count]) => expectedUnits.has(id) && count !== 1).map(([id, count]) => ({ id, count }));
  const unknownSourceIds = [...sourceRefs.keys()].filter((id) => !expectedUnits.has(id));
  const missingAssetIds = [...expectedAssets].filter((id) => !assetRefs.has(id));
  const duplicatedAssetIds = [...assetRefs.entries()].filter(([id, count]) => expectedAssets.has(id) && count !== 1).map(([id, count]) => ({ id, count }));
  const unknownAssetIds = [...assetRefs.keys()].filter((id) => !expectedAssets.has(id));

  const structuralErrors = [];
  if (!Array.isArray(draftV2?.titles) || !draftV2.titles.length) structuralErrors.push("Draft v2 must contain at least one title.");
  walkElements(draftV2, (element) => {
    if (!clean(element?.id)) structuralErrors.push("Every element must have an id.");
    if (!clean(element?.type)) structuralErrors.push(`Element ${clean(element?.id) || "<unknown>"} is missing a type.`);
  });

  return {
    valid: !missingSourceIds.length && !duplicatedSourceIds.length && !unknownSourceIds.length && !missingAssetIds.length && !duplicatedAssetIds.length && !unknownAssetIds.length && !structuralErrors.length,
    expectedSourceCount: expectedUnits.size,
    referencedSourceCount: sourceRefs.size,
    expectedAssetCount: expectedAssets.size,
    referencedAssetCount: assetRefs.size,
    missingSourceIds,
    duplicatedSourceIds,
    unknownSourceIds,
    missingAssetIds,
    duplicatedAssetIds,
    unknownAssetIds,
    structuralErrors,
  };
}

function recoveryElement(unit, id, index) {
  const type = sourceElementType(unit?.kind);
  const base = {
    id: stableId(`recovery_${type}`, [index + 1]),
    type,
    sourceIds: [id],
    text: unit?.verbatimText || "",
  };
  if (type === "diagram") return { ...base, heading: "Recovered source diagram", items: [unit?.verbatimText || ""] };
  if (type === "table") return { ...base, heading: "Recovered source table", headers: ["Source content"], rows: [[unit?.verbatimText || ""]] };
  return base;
}

export function appendRecoverySection(draftV1, draftV2, diff) {
  const unitsById = new Map(asArray(draftV1?.sourceManifest?.units).map((unit) => [unit.id, unit]));
  const assetsById = new Map(asArray(draftV1?.sourceManifest?.assets).map((asset) => [asset.id, asset]));
  const recoveryChildren = [
    ...asArray(diff?.missingSourceIds).map((id, index) => recoveryElement(unitsById.get(id), id, index)),
    ...asArray(diff?.missingAssetIds).map((id, index) => ({
      id: stableId("recovery_image", [index + 1]),
      type: "image_ref",
      assetId: id,
      sourceIds: [],
      caption: assetsById.get(id)?.caption || "",
    })),
  ];
  if (!recoveryChildren.length) return draftV2;
  return {
    ...draftV2,
    titles: [...asArray(draftV2?.titles), {
      id: "title_recovery_001",
      type: "title",
      text: "Recovered source content",
      children: [{
        id: "subtitle_recovery_001",
        type: "subtitle",
        text: "Automatically restored items",
        children: recoveryChildren,
      }],
    }],
  };
}
