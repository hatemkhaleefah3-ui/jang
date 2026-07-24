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

test("page-preserving fallback retains every source page and the original manifest", () => {
  const sourcePages = Array.from({ length: 35 }, (_, index) => ({
    page: index + 1,
    title: index === 14 ? "Warburg effect" : `Lecture topic ${index + 1}`,
    assets: index === 22 ? ["image-001"] : [],
  }));
  const sourceUnits = sourcePages.flatMap((page) => {
    const title = { page: page.page, order: 1, kind: "paragraph", text: page.title, extractionMethod: "native", confidence: 1 };
    const body = page.page === 15
      ? "The PET scan uses 18F-fluorodeoxyglucose to identify tumors with increased glucose uptake."
      : `Exact source paragraph for page ${page.page}.`;
    return [title, { page: page.page, order: 2, kind: "paragraph", text: body, extractionMethod: "native", confidence: 1 }];
  });

  const plan = createFallbackPlan({
    title: "Carbohydrate metabolism",
    sourcePages,
    sourceUnits,
    assets: [{ id: "image-001", type: "image", sourcePage: 23, caption: "Converted from EMF" }],
  });

  assert.equal(plan.sections.length, 35);
  assert.equal(plan.sections[14].title, "Warburg effect");
  assert.equal(plan.sections[14].blocks[0].text, "The PET scan uses 18F-fluorodeoxyglucose to identify tumors with increased glucose uptake.");
  assert.equal(plan.sections[22].blocks.at(-1).type, "image");
  assert.equal(plan.sections[22].blocks.at(-1).caption, "");
  assert.equal(plan.sourceManifest.units.length, 70);
  assert.equal(plan.sourceManifest.assets.length, 1);
});

test("fallback preserves list numbers and reconstructs native table rows", () => {
  const plan = createFallbackPlan({
    title: "Metabolism",
    sourcePages: [
      { page: 1, title: "Cori cycle", assets: [] },
      { page: 2, title: "Glycogen storage diseases", assets: [] },
    ],
    sourceUnits: [
      { page: 1, order: 1, kind: "paragraph", text: "Cori cycle" },
      { page: 1, order: 2, kind: "paragraph", text: "1. Glucose is converted to lactate." },
      { page: 1, order: 3, kind: "paragraph", text: "2. Lactate reaches the liver." },
      { page: 1, order: 4, kind: "paragraph", text: "3. Glucose returns to muscle." },
      { page: 2, order: 1, kind: "paragraph", text: "Glycogen storage diseases" },
      { page: 2, order: 2, kind: "table", text: "Type | Name | Deficient enzyme | Clinical features" },
      { page: 2, order: 3, kind: "table", text: "Type Ia | von Gierke disease | Glucose-6-phosphatase | Fasting hypoglycemia" },
      { page: 2, order: 4, kind: "table", text: "Type II | Pompe disease | Lysosomal maltase | Cardiomyopathy" },
    ],
    assets: [],
  });

  assert.deepEqual(plan.sections[0].blocks.map((block) => block.text), [
    "1. Glucose is converted to lactate.",
    "2. Lactate reaches the liver.",
    "3. Glucose returns to muscle.",
  ]);
  const table = plan.sections[1].blocks[0];
  assert.equal(table.type, "table");
  assert.deepEqual(table.headers, ["Type", "Name", "Deficient enzyme", "Clinical features"]);
  assert.equal(table.rows.length, 2);
  assert.equal(table.rows[1][1], "Pompe disease");
});

test("long body sentences are not promoted into slide titles or truncated", () => {
  const longSentence = "Further splitting of glycogen can then proceed by phosphorylase until another branch point is reached, after which glucan transferase and glucosidase repeat their actions.";
  const plan = createFallbackPlan({
    title: "Carbohydrate metabolism",
    sourcePages: [
      { page: 1, title: "Glycogenolysis", assets: [] },
      { page: 2, title: longSentence, assets: [] },
    ],
    sourceUnits: [
      { page: 1, order: 1, kind: "paragraph", text: "Glycogenolysis" },
      { page: 1, order: 2, kind: "paragraph", text: "Initial glycogen breakdown." },
      { page: 2, order: 1, kind: "paragraph", text: longSentence },
      { page: 2, order: 2, kind: "paragraph", text: "3. Glucose-1-phosphate is converted to glucose-6-phosphate." },
    ],
    assets: [],
  });

  assert.equal(plan.sections[1].title, "Glycogenolysis — continued");
  assert.equal(plan.sections[1].blocks[0].text, longSentence);
  assert.match(plan.sections[1].blocks[1].text, /^3\./);
});
