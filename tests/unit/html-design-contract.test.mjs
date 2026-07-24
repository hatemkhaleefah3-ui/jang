import test from "node:test";
import assert from "node:assert/strict";
import { createHtmlDesignPrompt, hydrateDesignedHtml, verifyDesignedHtml } from "../../html-design-contract.js";

const manifest = {
  units: [
    { id: "src-1", kind: "paragraph", sourcePage: 1, sourceOrder: 1, verbatimText: "Exact first paragraph." },
    { id: "src-2", kind: "diagram", sourcePage: 1, sourceOrder: 2, verbatimText: "ATP → ADP" },
  ],
  assets: [{ id: "img-1", kind: "image", sourcePage: 1, alt: "Source figure" }],
};

const validHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Lecture</title></head><body>
<article class="page">
<header class="page-header"><span class="page-title" data-source-id="src-1">placeholder</span></header>
<main class="page-body"><div class="diagram-host"><svg viewBox="0 0 300 100"><rect x="10" y="10" width="280" height="80"></rect><text x="150" y="55" data-source-id="src-2">placeholder</text></svg></div><figure class="img-full-width"><img data-asset-id="img-1" alt="Source figure"></figure></main>
<footer class="page-footer"><span class="page-number">1</span></footer>
</article></body></html>`;

test("accepts a complete reference-class HTML lecture", () => {
  const report = verifyDesignedHtml(validHtml, manifest, { additionalTags: ["meta"] });
  assert.equal(report.valid, true);
  assert.equal(report.pages, 1);
});

test("rejects missing, duplicated, invented, styled, scripted, and remote content", () => {
  const invalid = validHtml
    .replace("</main>", '<p class="invented" data-source-id="src-1" style="color:red">duplicate</p><script>alert(1)</script></main>')
    .replace('data-source-id="src-2"', 'data-source-id="unknown"')
    .replace('data-asset-id="img-1"', 'data-asset-id="made-up" src="https://example.com/a.png"');
  const report = verifyDesignedHtml(invalid, manifest, { additionalTags: ["meta"] });
  assert.equal(report.valid, false);
  assert.deepEqual(report.missingSourceIds, ["src-2"]);
  assert.deepEqual(report.duplicatedSourceIds, ["src-1"]);
  assert.deepEqual(report.unknownSourceIds, ["unknown"]);
  assert.deepEqual(report.missingAssetIds, ["img-1"]);
  assert.deepEqual(report.unknownAssetIds, ["made-up"]);
  assert.deepEqual(report.unknownClasses, ["invented"]);
  assert.equal(report.inlineStyles.length, 1);
  assert.equal(report.externalUrls.length, 1);
  assert.ok(report.structuralErrors.includes("Script elements are forbidden."));
});

test("hydrates exact source text and local asset URLs after validation", () => {
  const hydrated = hydrateDesignedHtml(validHtml, manifest, (id) => `/assets/${id}.png`);
  assert.match(hydrated, />Exact first paragraph\.<\/span>/);
  assert.match(hydrated, />ATP → ADP<\/text>/);
  assert.match(hydrated, /src="\/assets\/img-1\.png"/);
  assert.doesNotMatch(hydrated, />placeholder</);
});

test("prompt explicitly delegates design while preserving source fidelity and PPTX-safe structure", () => {
  const prompt = createHtmlDesignPrompt({ manifest, referenceHtml: "<style>.page{width:900px}</style>", metadata: { title: "Biochemistry" } });
  assert.match(prompt, /Choose the page structure, boxes, diagrams/);
  assert.match(prompt, /Every source unit must appear exactly once/);
  assert.match(prompt, /one <article class="page"> for every output slide/);
  assert.match(prompt, /ATP → ADP/);
});
