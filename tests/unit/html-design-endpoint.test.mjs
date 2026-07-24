import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDesignRequest, resolveDesignModel } from "../../functions/api/design-html.js";
import { applyMasterDesignCss, MASTER_DESIGN_CSS } from "../../html-design-finalizer.js";
import { verifyDesignedHtml } from "../../html-design-contract.js";

test("normalizes the verified source manifest without changing lecture text", () => {
  const result = normalizeDesignRequest({
    manifest: {
      units: [{ id: "src:p1:1", kind: "paragraph", sourcePage: 1, sourceOrder: 1, verbatimText: "Exact text — unchanged." }],
      assets: [{ id: "asset:p1:1", type: "image", sourcePage: 1, alt: "Figure" }],
    },
    metadata: { title: "Lecture", direction: "rtl", language: "Arabic" },
  });
  assert.equal(result.manifest.units[0].verbatimText, "Exact text — unchanged.");
  assert.equal(result.manifest.assets[0].id, "asset:p1:1");
  assert.equal(result.metadata.direction, "rtl");
});

test("rejects duplicate source IDs before Gemini is called", () => {
  assert.throws(() => normalizeDesignRequest({
    manifest: {
      units: [
        { id: "same", text: "One" },
        { id: "same", text: "Two" },
      ],
    },
  }), /Source IDs must be unique/);
});

test("uses a dedicated HTML model override and a safe default", () => {
  assert.equal(resolveDesignModel({}), "gemini-3.5-flash");
  assert.equal(resolveDesignModel({ GEMINI_HTML_MODEL: "models/gemini-custom" }), "gemini-custom");
});

test("replaces model-authored CSS with the exact master design CSS", () => {
  const html = `<!DOCTYPE html><html><head><style>.page{background:red}</style></head><body><article class="page"><header class="page-header"><span class="page-title" data-source-id="src-1">Text</span></header><main class="page-body"><img data-asset-id="img-1"></main><footer class="page-footer"><span class="page-number">1</span></footer></article></body></html>`;
  const finalized = applyMasterDesignCss(html);
  assert.doesNotMatch(finalized, /background:red/);
  assert.match(finalized, /data-jang-master-design="2026-07"/);
  assert.match(finalized, /--page-w:900px/);
  assert.ok(finalized.includes(MASTER_DESIGN_CSS));
  const report = verifyDesignedHtml(finalized, {
    units: [{ id: "src-1", verbatimText: "Text" }],
    assets: [{ id: "img-1" }],
  });
  assert.equal(report.valid, true);
});
