import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_GEMINI_MODEL,
  extractionPrompt,
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
        sourceReferences: ["Slide 2", "Slide 3"],
        blocks: [
          { type: "paragraph", text: "Glucose is phosphorylated.", sourceReferences: ["Slide 2"] },
          {
            type: "bullets",
            items: [
              { text: "Investment phase", level: 0 },
              { text: "Consumes two ATP", level: 1 },
            ],
            sourceReferences: ["Slide 3"],
          },
          {
            type: "image",
            slotId: "pathway",
            label: "Image",
            description: "Glycolysis biochemical pathway from glucose to pyruvate.",
            important: true,
            fit: "contain",
            preferredAspect: "wide",
            orientation: "landscape",
            sourceReference: "Slide 3",
            sourceReferences: ["Slide 3"],
          },
        ],
      },
      {
        slideTitle: "Glycolysis",
        slideSubtitle: "Energy payoff phase",
        sourceReferences: ["Slide 4", "Slide 5"],
        blocks: [
          {
            type: "table",
            tableType: "heatmap",
            label: "Energy yield heat map",
            headers: ["Stage", "ATP"],
            rows: [["Investment", "-2"], ["Payoff", "4"]],
            heatmap: { min: -2, max: 4, values: [[-2, -2], [4, 4]] },
            sourceReferences: ["Slide 4"],
          },
          {
            type: "diagram",
            diagramType: "metabolic",
            label: "Energy payoff pathway",
            diagramRows: [["G3P", "Pyruvate"]],
            sourceReferences: ["Slide 5"],
          },
        ],
      },
    ],
  }],
  endNote: "Review the pathways.",
  sourcePageOrSlideCount: 6,
  coveredSourceReferences: ["Slide 1", "Slide 2", "Slide 3", "Slide 4", "Slide 5"],
  unmappedSourceReferences: ["Slide 6"],
  warnings: [],
};

test("normalizes directly into the shared PPTX engine contract", () => {
  const result = normalizeLectureResult(extracted, { sourceType: "pptx", sourceCount: 6 });
  const lecture = result.lecture;
  assert.equal(lecture.schemaVersion, "1.1");
  assert.match(lecture.sections[0].sectionId, /carbohydrate-metabolism/);
  assert.equal(lecture.sections[0].slides[0].slideTitle, "Glycolysis");
  assert.equal(lecture.sections[0].slides[1].slideTitle, "");
  assert.ok(lecture.sections[0].slides[0].slideId);
  assert.ok(lecture.sections[0].slides[0].blocks[0].blockId);
  assert.deepEqual(lecture.sections[0].slides[0].blocks[1].items, [
    { text: "Investment phase", level: 0 },
    { text: "Consumes two ATP", level: 1 },
  ]);
  assert.equal(lecture.sections[0].slides[1].blocks[0].tableType, "heatmap");
  assert.equal(lecture.sections[0].slides[1].blocks[1].diagramType, "metabolic");
  assert.equal(lecture.extractionAudit.sourceType, "pptx");
  assert.equal(lecture.extractionAudit.sourcePageOrSlideCount, 6);
  assert.ok(lecture.extractionAudit.unmappedSourceReferences.includes("Slide 6"));
});

test("derives unique labelled image imports with aspect and orientation", () => {
  const result = normalizeLectureResult(extracted, { sourceType: "pptx", sourceCount: 6 });
  assert.equal(result.imageSlots.length, 1);
  assert.match(result.imageSlots[0].label, /Glycolysis biochemical pathway/i);
  assert.equal(result.imageSlots[0].preferredAspect, "wide");
  assert.equal(result.imageSlots[0].orientation, "landscape");
  assert.equal(result.imageSlots[0].sourceReference, "Slide 3");
});

test("downgrades malformed heat maps instead of producing invalid engine input", () => {
  const malformed = structuredClone(extracted);
  malformed.sections[0].slides[1].blocks[0].heatmap.values = [[1]];
  const result = normalizeLectureResult(malformed, { sourceType: "pptx", sourceCount: 6 });
  const table = result.lecture.sections[0].slides[1].blocks[0];
  assert.equal(table.tableType, "highlight");
  assert.equal(table.heatmap, undefined);
  assert.match(result.lecture.extractionAudit.warnings.join(" "), /downgraded/i);
});

test("structured response schema models all requested reusable template inputs", () => {
  const blockProperties = lectureResponseSchema.properties.sections.items.properties.slides.items.properties.blocks.items.properties;
  assert.ok(blockProperties.items.items.properties.level);
  assert.deepEqual(blockProperties.tableType.enum, ["standard", "comparison", "highlight", "heatmap"]);
  assert.deepEqual(blockProperties.diagramType.enum, ["generic", "metabolic", "signal-transduction", "gene-regulatory", "disease-pharmacology"]);
  assert.ok(blockProperties.preferredAspect);
  assert.ok(blockProperties.orientation.enum.includes("transverse"));
  assert.ok(blockProperties.orientation.enum.includes("longitudinal"));
  assert.ok(lectureResponseSchema.properties.unmappedSourceReferences);
});

test("Gemini prompt requires complete traceable reconstruction and exact block classification", () => {
  assert.match(extractionPrompt, /exact structured input contract/i);
  assert.match(extractionPrompt, /every unique meaningful instructional item/i);
  assert.match(extractionPrompt, /nested hierarchical items/i);
  assert.match(extractionPrompt, /tableType heatmap/i);
  assert.match(extractionPrompt, /diagramType metabolic/i);
  assert.match(extractionPrompt, /at least three linked entities/i);
  assert.match(extractionPrompt, /in addition to the explanatory paragraph or list/i);
  assert.match(extractionPrompt, /converted to.*activates.*inhibits/is);
  assert.match(extractionPrompt, /audit every slide containing explicit linked steps/i);
  assert.match(extractionPrompt, /orientation transverse/i);
  assert.match(extractionPrompt, /unmappedSourceReferences/i);
});

test("uses the configured Gemini model migration behavior", () => {
  assert.equal(DEFAULT_GEMINI_MODEL, "gemini-3.6-flash");
  assert.equal(resolveGeminiModel(""), "gemini-3.6-flash");
  assert.equal(resolveGeminiModel("models/gemini-2.5-flash"), "gemini-3.6-flash");
  assert.equal(resolveGeminiModel("gemini-3.5-flash-lite"), "gemini-3.5-flash-lite");
});

test("rejects an extraction with no usable sections", () => {
  assert.throws(() => normalizeLectureResult({ documentTitle: "Empty", sections: [] }), /usable lecture sections/);
});
