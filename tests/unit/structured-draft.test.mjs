import test from "node:test";
import assert from "node:assert/strict";
import {
  appendRecoverySection,
  createAssetRecord,
  createDraftV1,
  createSourceUnit,
  verifyDraftCoverage,
} from "../../structured-draft.js";

function fixture() {
  const units = [
    createSourceUnit({ page: 1, order: 1, text: "Alpha" }),
    createSourceUnit({ page: 1, order: 2, text: "Beta" }),
  ];
  const assets = [createAssetRecord({ id: "img_001", sourcePage: 1, sourceOrder: 3 })];
  return createDraftV1({ metadata: { title: "Lecture" }, units, assets });
}

test("validates complete source and asset coverage", () => {
  const draftV1 = fixture();
  const draftV2 = structuredDraft(draftV1, {
    sourceIds: draftV1.sourceManifest.units.map((unit) => unit.id),
    assetIds: ["img_001"],
  });
  assert.equal(verifyDraftCoverage(draftV1, draftV2).valid, true);
});

test("reports missing, duplicated, and unknown references", () => {
  const draftV1 = fixture();
  const firstId = draftV1.sourceManifest.units[0].id;
  const draftV2 = {
    ...structuredDraft(draftV1, { sourceIds: [firstId, firstId, "src_unknown"], assetIds: ["img_unknown"] }),
  };
  const diff = verifyDraftCoverage(draftV1, draftV2);
  assert.equal(diff.valid, false);
  assert.equal(diff.missingSourceIds.length, 1);
  assert.deepEqual(diff.duplicatedSourceIds, [{ id: firstId, count: 2 }]);
  assert.deepEqual(diff.unknownSourceIds, ["src_unknown"]);
  assert.deepEqual(diff.missingAssetIds, ["img_001"]);
  assert.deepEqual(diff.unknownAssetIds, ["img_unknown"]);
});

test("appends missing source units and assets to a recovery section", () => {
  const draftV1 = fixture();
  const incomplete = structuredDraft(draftV1, { sourceIds: [], assetIds: [] });
  const diff = verifyDraftCoverage(draftV1, incomplete);
  const recovered = appendRecoverySection(draftV1, incomplete, diff);
  const recoveredDiff = verifyDraftCoverage(draftV1, recovered);
  assert.equal(recoveredDiff.valid, true);
  assert.equal(recovered.titles.at(-1).text, "Recovered source content");
});

function structuredDraft(draftV1, { sourceIds, assetIds }) {
  return {
    schemaVersion: "2.0",
    documentId: draftV1.documentId,
    metadata: draftV1.metadata,
    sourceManifest: draftV1.sourceManifest,
    titles: [{
      id: "title_001",
      type: "title",
      text: "Lecture",
      children: [{
        id: "subtitle_001",
        type: "subtitle",
        text: "Section",
        children: [
          ...sourceIds.map((id, index) => ({ id: `paragraph_${index}`, type: "paragraph", sourceIds: [id], text: id })),
          ...assetIds.map((id, index) => ({ id: `image_${index}`, type: "image_ref", sourceIds: [], assetId: id })),
        ],
      }],
    }],
  };
}
