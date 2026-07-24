import test from "node:test";
import assert from "node:assert/strict";
import { buildSemanticManifest } from "../../semantic-manifest.js";

test("groups source units and assets by source page", () => {
  const manifest = buildSemanticManifest({
    sourcePages: [{ page: 1, title: "Glycine synthesis" }, { page: 2, title: "Glycine pathway" }],
    sourceUnits: [
      { id: "s1", page: 1, order: 1, kind: "heading", text: "Metabolism of Glycine" },
      { id: "s2", page: 1, order: 2, text: "Glycine can be synthesized through several pathways." },
      { id: "s3", page: 2, order: 1, text: "Serine hydroxymethyl transferase" },
    ],
    assets: [{ id: "diagram-1", sourcePage: 2, sourceOrder: 2, type: "image", caption: "Glycine synthesis pathway" }],
  });

  assert.equal(manifest.version, 2);
  assert.equal(manifest.sourcePageCount, 2);
  assert.equal(manifest.pages.length, 2);
  assert.deepEqual(manifest.pages[0].units.map((unit) => unit.id), ["s1", "s2"]);
  assert.deepEqual(manifest.pages[1].assets.map((asset) => asset.id), ["diagram-1"]);
  assert.equal(manifest.pages[1].relationships[0].from, "diagram-1");
  assert.equal(manifest.pages[1].relationships[0].to, "s3");
  assert.equal(manifest.pages[1].relationships[0].requiredTogether, true);
});

test("creates a bounded slide budget instead of unlimited expansion", () => {
  const sourcePages = Array.from({ length: 27 }, (_, index) => ({ page: index + 1 }));
  const sourceUnits = sourcePages.map((page) => ({ page: page.page, order: 1, text: `Page ${page.page} content` }));
  const assets = [3, 6, 8, 14, 15, 19, 21, 24, 26].map((page) => ({ id: `image-${page}`, sourcePage: page, type: "image" }));
  const manifest = buildSemanticManifest({ sourcePages, sourceUnits, assets });

  assert.equal(manifest.slideBudget.minimum, 27);
  assert.equal(manifest.slideBudget.preferredMinimum, 27);
  assert.ok(manifest.slideBudget.preferredMaximum <= 30);
  assert.ok(manifest.slideBudget.hardMaximum <= 32);
});

test("preserves bounding boxes and style hints when extraction provides them", () => {
  const manifest = buildSemanticManifest({
    sourceUnits: [{ page: 1, order: 1, text: "Heading", bbox: { x: 10, y: 20, width: 300, height: 40 }, style: { fontSize: 28, bold: true } }],
    assets: [{ id: "img", sourcePage: 1, bbox: { left: 20, top: 100, right: 420, bottom: 500 } }],
  });
  assert.deepEqual(manifest.units[0].bbox, { x: 10, y: 20, width: 300, height: 40 });
  assert.deepEqual(manifest.assets[0].bbox, { x: 20, y: 100, width: 400, height: 400 });
  assert.deepEqual(manifest.units[0].style, { fontSize: 28, bold: true });
});
