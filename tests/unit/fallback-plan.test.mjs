import test from "node:test";
import assert from "node:assert/strict";
import { createFallbackPlan } from "../../fallback-plan.js";

function lectureWithSections(count) {
  return Array.from({ length: count }, (_, index) => `# Section ${index + 1}\n\nExact source paragraph ${index + 1}.`).join("\n\n");
}

test("local fallback preserves sections beyond the former forty-section cap", () => {
  const plan = createFallbackPlan({
    title: "Large lecture",
    content: lectureWithSections(45),
    diagramSources: [],
  });

  assert.equal(plan.sections.length, 45);
  assert.equal(plan.sections.at(-1).title, "Section 45");
  assert.equal(plan.sections.at(-1).blocks[0].text, "Exact source paragraph 45.");
});

test("local fallback keeps source diagrams as diagram blocks", () => {
  const plan = createFallbackPlan({
    title: "Diagram lecture",
    content: "# Pathway\n\n[DIAGRAM:diagram-001]",
    diagramSources: [{ id: "diagram-001", text: "Glucose\nPyruvate\nATP" }],
  });

  assert.equal(plan.sections.length, 1);
  assert.equal(plan.sections[0].blocks[0].type, "diagram");
  assert.deepEqual(plan.sections[0].blocks[0].items, ["Glucose", "Pyruvate", "ATP"]);
});

test("source-unit fallback preserves pages, numbering, tables, and visual occurrences", () => {
  const plan = createFallbackPlan({
    title: "Carbohydrate metabolism",
    sourcePages: [
      { page: 1, title: "Cori's cycle", assets: [] },
      { page: 2, title: "Types", assets: ["image-001"] },
    ],
    sourceUnits: [
      { page: 1, order: 1, kind: "paragraph", text: "Cori's cycle" },
      { page: 1, order: 2, kind: "paragraph", text: "1. Glucose is converted to lactate." },
      { page: 1, order: 3, kind: "paragraph", text: "2. Lactate returns to the liver." },
      { page: 1, order: 4, kind: "paragraph", text: "3. Glucose returns to muscle." },
      { page: 2, order: 1, kind: "paragraph", text: "Types" },
      { page: 2, order: 2, kind: "table", text: "Type | Name | Deficient enzyme | Clinical features" },
      { page: 2, order: 3, kind: "table", text: "Type Ia | von Gierke's disease | Glucose-6-phosphatase | Fasting hypoglycemia" },
    ],
    assets: [{ id: "image-001", type: "image", sourcePage: 2, caption: "Converted from EMF", alt: "Source diagram" }],
  });

  assert.equal(plan.sections.length, 2);
  assert.equal(plan.sections[0].title, "Cori's cycle");
  assert.deepEqual(plan.sections[0].blocks.map((block) => block.text), [
    "1. Glucose is converted to lactate.",
    "2. Lactate returns to the liver.",
    "3. Glucose returns to muscle.",
  ]);

  const table = plan.sections[1].blocks.find((block) => block.type === "table");
  assert.deepEqual(table.headers, ["Type", "Name", "Deficient enzyme", "Clinical features"]);
  assert.deepEqual(table.rows[0], ["Type Ia", "von Gierke's disease", "Glucose-6-phosphatase", "Fasting hypoglycemia"]);

  const image = plan.sections[1].blocks.find((block) => block.assetId === "image-001");
  assert.equal(image.caption, "");
  assert.equal(plan.sourceManifest.units.length, 7);
  assert.deepEqual(plan.sourceManifest.assets.map((asset) => asset.id), ["image-001"]);
});

test("a long body sentence is never promoted into a truncated slide title", () => {
  const longSentence = "Further splitting of glycogen can proceed until another branch point is reached and the complete biochemical explanation remains body content.";
  const plan = createFallbackPlan({
    title: "Lecture",
    sourcePages: [{ page: 7, title: longSentence, assets: [] }],
    sourceUnits: [{ page: 7, order: 1, kind: "paragraph", text: longSentence }],
    assets: [],
  });

  assert.equal(plan.sections[0].title, "Lecture — continued");
  assert.equal(plan.sections[0].blocks[0].text, longSentence);
});
