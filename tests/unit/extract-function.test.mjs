import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_GEMINI_MODEL,
  lectureResponseSchema,
  normalizeLectureResult,
  resolveGeminiModel,
} from "../../functions/api/extract.js";

test("normalizes Gemini lecture JSON and derives ordered image slots", () => {
  const result = normalizeLectureResult({
    documentTitle: "Blood Glucose",
    direction: "ltr",
    endNote: "Complete",
    slides: [
      { kind: "section", sectionTitle: "Fed State", blocks: [] },
      { kind: "content", sectionTitle: "Fed State", blocks: [
        { type: "paragraph", text: "Insulin rises." },
        { type: "image", slotId: "figure", label: "Insulin response", size: "wide", fit: "contain", sourceReference: "Slide 4" },
        { type: "image", slotId: "figure", label: "Glucose uptake" },
      ] },
    ],
  });
  assert.equal(result.lecture.documentTitle, "Blood Glucose");
  assert.deepEqual(result.imageSlots.map((slot) => slot.slotId), ["figure", "figure-2"]);
  assert.equal(result.imageSlots[0].sourceReference, "Slide 4");
  assert.equal(result.lecture.slides[1].blocks[1].type, "image");
});

test("structured response schema requires the lecture essentials", () => {
  assert.deepEqual(lectureResponseSchema.required, ["documentTitle", "direction", "endNote", "slides"]);
  assert.ok(lectureResponseSchema.properties.slides.items.properties.blocks.items.properties.slotId);
});

test("uses Gemini 3.6 Flash and migrates the previous model setting", () => {
  assert.equal(DEFAULT_GEMINI_MODEL, "gemini-3.6-flash");
  assert.equal(resolveGeminiModel(""), "gemini-3.6-flash");
  assert.equal(resolveGeminiModel("models/gemini-2.5-flash"), "gemini-3.6-flash");
  assert.equal(resolveGeminiModel("gemini-3.5-flash-lite"), "gemini-3.5-flash-lite");
});

test("rejects an extraction with no usable slides", () => {
  assert.throws(() => normalizeLectureResult({ documentTitle: "Empty", slides: [] }), /usable lecture slides/);
});
