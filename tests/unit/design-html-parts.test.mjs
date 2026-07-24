import test from "node:test";
import assert from "node:assert/strict";
import { createGeminiDesignParts, normalizeAssetPreview, publicDesignManifest } from "../../functions/api/design-html-parts.js";

const tinyPng = "data:image/png;base64,iVBORw0KGgo=";

test("normalizes bounded source image previews", () => {
  const preview = normalizeAssetPreview(tinyPng, "Preview");
  assert.equal(preview.mimeType, "image/png");
  assert.equal(preview.data, "iVBORw0KGgo=");
});

test("adds labeled inline image parts without placing image bytes in the prompt", () => {
  const preview = normalizeAssetPreview(tinyPng);
  const parts = createGeminiDesignParts("DESIGN PROMPT", [{ id: "img-1", preview }]);
  assert.equal(parts[0].text, "DESIGN PROMPT");
  assert.match(parts[1].text, /asset id img-1/);
  assert.deepEqual(parts[2].inline_data, { mime_type: "image/png", data: "iVBORw0KGgo=" });
});

test("removes private preview bytes from the public manifest", () => {
  const manifest = publicDesignManifest({ units: [{ id: "src-1", verbatimText: "Text" }], assets: [{ id: "img-1", preview: normalizeAssetPreview(tinyPng) }] });
  assert.equal(manifest.assets[0].id, "img-1");
  assert.equal("preview" in manifest.assets[0], false);
});

test("rejects unsupported and oversized previews", () => {
  assert.throws(() => normalizeAssetPreview("data:image/svg+xml;base64,PHN2Zz4="), /PNG, JPEG, or WebP/);
  assert.throws(() => normalizeAssetPreview(`data:image/png;base64,${"A".repeat(900001)}`), /too large/);
});
