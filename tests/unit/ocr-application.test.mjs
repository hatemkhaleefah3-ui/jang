import test from "node:test";
import assert from "node:assert/strict";
import { applyOcrResults } from "../../source-importer.js";

function baseExtraction() {
  return {
    title: "OCR lecture",
    content: "# Native page\n\nNative text.\n\n# Page 2\n\nx\n\n[ASSET:pdf-page-002]",
    batches: [],
    assets: [{ id: "pdf-page-002", type: "image", source: "data:image/jpeg;base64,AA==", sourceKind: "page-snapshot", sourcePage: 2 }],
    sourceUnits: [
      { page: 1, order: 1, kind: "paragraph", text: "Native text.", extractionMethod: "native", confidence: 1 },
      { page: 2, order: 1, kind: "paragraph", text: "x", extractionMethod: "native", confidence: 1 },
    ],
    sourcePages: [
      { page: 1, title: "Native page", assets: [] },
      { page: 2, title: "Page 2", assets: ["pdf-page-002"] },
    ],
    ocrPages: [{ page: 2, assetId: "pdf-page-002", imageData: "data:image/jpeg;base64,AA==" }],
    warnings: ["OCR will be applied to PDF page 2 before the PowerPoint is built."],
    extractionStatus: "ocr-required",
    verificationIssues: [{ type: "ocr-required", page: 2 }],
    stats: { originalExtractedChars: 1, extractedChars: 1, batchCount: 1, nodeCount: 2, ocrRequiredPages: 1 },
  };
}

test("OCR replaces sparse native text and preserves the page image marker", () => {
  const result = applyOcrResults(baseExtraction(), [{
    page: 2,
    lines: ["Complete OCR heading", "Complete OCR body text."],
    confidence: 0.96,
  }]);

  assert.equal(result.extractionStatus, "verified-native");
  assert.equal(result.verificationIssues.length, 0);
  assert.equal(result.stats.ocrRequiredPages, 0);
  assert.equal(result.sourceUnits.some((unit) => unit.page === 2 && unit.text === "x"), false);
  assert.deepEqual(
    result.sourceUnits.filter((unit) => unit.page === 2).map((unit) => [unit.text, unit.extractionMethod]),
    [["Complete OCR heading", "ocr"], ["Complete OCR body text.", "ocr"]],
  );
  assert.match(result.content, /Complete OCR heading/);
  assert.match(result.content, /Complete OCR body text\./);
  assert.match(result.content, /\[ASSET:pdf-page-002\]/);
});

test("OCR fails closed when a required page has no readable result", () => {
  assert.throws(
    () => applyOcrResults(baseExtraction(), [{ page: 2, lines: [], text: "" }]),
    /OCR did not return readable text for PDF page 2/,
  );
});
