import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_GEMINI_MODEL,
  lectureResponseSchema,
  normalizeLectureResult,
  resolveGeminiModel,
} from "../../functions/api/extract.js";

const extracted = {
  documentTitle: "Glucose Metabolism",
  direction: "ltr",
  overview: {
    title: "Overview",
    introduction: "The lecture explains glucose use and storage.",
    keyPoints: ["Glycolysis", "Glycogen metabolism"],
  },
  sections: [{
    sectionTitle: "Carbohydrate Metabolism",
    slides: [
      {
        slideTitle: "Glycolysis",
        slideSubtitle: "Energy investment phase",
        blocks: [
          { type: "paragraph", text: "Glucose is phosphorylated." },
          { type: "image", slotId: "pathway", label: "Image", description: "Glycolysis biochemical pathway from glucose to pyruvate.", sourceReference: "Page 7" },
        ],
      },
      {
        slideTitle: "Glycolysis",
        slideSubtitle: "Energy payoff phase",
        blocks: [
          { type: "image", slotId: "pathway", label: "Image", description: "ATP and NADH production during the payoff phase." },
          { type: "table", rows: [["ATP", "2"]] },
          { type: "diagram", diagramRows: [["Glucose", "Pyruvate"]] },
        ],
      },
    ],
  }],
  endNote: "Review the pathways.",
};

test("normalizes hierarchy, removes repeated slide titles, and derives unique meaningful image labels", () => {
  const result = normalizeLectureResult(extracted);
  assert.equal(result.lecture.sections[0].slides[0].slideTitle, "Glycolysis");
  assert.equal(result.lecture.sections[0].slides[1].slideTitle, "");
  assert.equal(result.lecture.sections[0].slides[1].slideSubtitle, "Energy payoff phase");
  assert.deepEqual(result.imageSlots.map((slot) => slot.slotId), ["pathway", "pathway-2"]);
  assert.match(result.imageSlots[0].label, /Glycolysis biochemical pathway/i);
  assert.match(result.imageSlots[1].label, /ATP and NADH production/i);
  assert.notEqual(result.imageSlots[0].label, result.imageSlots[1].label);
  assert.equal(result.imageSlots[0].sourceReference, "Page 7");
});

test("adds specific table and diagram labels from slide context", () => {
  const result = normalizeLectureResult(extracted);
  const blocks = result.lecture.sections[0].slides[1].blocks;
  assert.equal(blocks.find((block) => block.type === "table").label, "Energy payoff phase comparison table");
  assert.equal(blocks.find((block) => block.type === "diagram").label, "Energy payoff phase process diagram");
});

test("structured response schema explicitly models overview, sections, slide title, subtitle, and visual descriptions", () => {
  assert.deepEqual(lectureResponseSchema.required, ["documentTitle", "direction", "overview", "sections", "endNote"]);
  const slideProperties = lectureResponseSchema.properties.sections.items.properties.slides.items.properties;
  assert.ok(slideProperties.slideTitle);
  assert.ok(slideProperties.slideSubtitle);
  assert.ok(slideProperties.blocks.items.properties.description);
});

test("uses Gemini 3.6 Flash and migrates the previous model setting", () => {
  assert.equal(DEFAULT_GEMINI_MODEL, "gemini-3.6-flash");
  assert.equal(resolveGeminiModel(""), "gemini-3.6-flash");
  assert.equal(resolveGeminiModel("models/gemini-2.5-flash"), "gemini-3.6-flash");
  assert.equal(resolveGeminiModel("gemini-3.5-flash-lite"), "gemini-3.5-flash-lite");
});

test("rejects an extraction with no usable sections", () => {
  assert.throws(() => normalizeLectureResult({ documentTitle: "Empty", sections: [] }), /usable lecture sections/);
});
