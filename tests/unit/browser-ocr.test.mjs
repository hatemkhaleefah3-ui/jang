import test from "node:test";
import assert from "node:assert/strict";
import { applyBrowserOcr } from "../../source-importer.js";

function baseExtraction() {
  return {
    title: "OCR lecture",
    content: "# Page 1\n\nx\n\n[ASSET:pdf-page-001]",
    batches: [],
    assets: [{ id: "pdf-page-001", type: "image", source: "data:image/jpeg;base64,AAAA", sourceKind: "page-snapshot", sourcePage: 1 }],
    sourceUnits: [{ page: 1, order: 1, kind: "paragraph", text: "x", extractionMethod: "native", confidence: 1 }],
    sourcePages: [{ page: 1, title: "Page 1", assets: ["pdf-page-001"] }],
    ocrPages: [{ page: 1, assetId: "pdf-page-001", imageData: "data:image/jpeg;base64,AAAA" }],
    warnings: ["OCR will be applied automatically to PDF page 1 before redesign."],
    extractionStatus: "ocr-required",
    verificationIssues: [{ type: "ocr-required", page: 1 }],
    stats: { originalExtractedChars: 1, extractedChars: 1, batchCount: 1, nodeCount: 1, ocrRequiredPages: 1 },
  };
}

test("browser OCR completes before the redesign request", async () => {
  let terminated = false;
  globalThis.__jangTesseract = {
    createWorker: async () => ({
      setParameters: async () => undefined,
      recognize: async () => ({ data: { text: "OCR heading\nOCR body text", confidence: 97 } }),
      terminate: async () => { terminated = true; },
    }),
  };

  try {
    const result = await applyBrowserOcr(baseExtraction(), "English");
    assert.equal(result.extractionStatus, "verified-native");
    assert.equal(result.verificationIssues.length, 0);
    assert.equal(result.ocrPages.length, 0);
    assert.match(result.content, /OCR heading/);
    assert.match(result.content, /OCR body text/);
    assert.equal(terminated, true);
  } finally {
    delete globalThis.__jangTesseract;
  }
});
