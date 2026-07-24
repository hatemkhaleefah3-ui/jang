import test from "node:test";
import assert from "node:assert/strict";
import { ocrLanguages, scoreOcrCandidate } from "../../ocr-engine.js";

test("OCR language selection uses local English and Arabic packs", () => {
  assert.deepEqual(ocrLanguages("English"), ["eng"]);
  assert.deepEqual(ocrLanguages("Arabic"), ["ara", "eng"]);
  assert.deepEqual(ocrLanguages("auto"), ["eng", "ara"]);
});

test("OCR quality scoring prefers readable high-confidence transcripts", () => {
  const strong = scoreOcrCandidate({
    text: "Scanned lecture heading\nComplete scanned lecture body text with NADPH and 123.45 mg/dL.",
    confidence: 0.94,
  });
  const weak = scoreOcrCandidate({ text: "� □ x", confidence: 0.22 });
  assert.ok(strong > 0.7, `expected strong OCR score, received ${strong}`);
  assert.ok(weak < 0.25, `expected weak OCR score, received ${weak}`);
  assert.ok(strong > weak);
});
