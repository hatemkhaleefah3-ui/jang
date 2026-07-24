import test from "node:test";
import assert from "node:assert/strict";
import { createFallbackPlan } from "../../source-importer.js";

function allPlanText(plan) {
  const values = [];
  for (const section of plan.sections || []) {
    values.push(section.title || "");
    for (const block of section.blocks || []) {
      values.push(block.heading || "", block.text || "");
      values.push(...(block.items || []));
      values.push(...(block.headers || []));
      for (const row of block.rows || []) values.push(...row);
    }
  }
  return values.join("\n");
}

test("fallback keeps a long sentence misclassified as an inferred title", () => {
  const longSourceUnit = "The Warburg effect allows for cancer tumor detection with PET scans because rapidly proliferating tumor cells consume more glucose than surrounding tissue.";
  const extraction = {
    title: "Carbohydrate metabolism",
    sourcePages: [
      { page: 1, title: "Carbohydrate metabolism", assets: [] },
      { page: 4, title: "Slide 4", assets: [] },
    ],
    sourceUnits: [
      { page: 1, order: 1, kind: "paragraph", role: "title", text: "Carbohydrate metabolism" },
      { page: 4, order: 1, kind: "paragraph", role: "inferred-title", text: longSourceUnit },
      { page: 4, order: 2, kind: "paragraph", text: "This explanatory sentence must remain on the same source page." },
    ],
    assets: [],
  };

  const plan = createFallbackPlan(extraction, { courseCode: "BIO", lectureLabel: "Lecture" });
  const rendered = allPlanText(plan);
  assert.ok(rendered.includes(longSourceUnit));
  assert.ok(rendered.includes("This explanatory sentence must remain"));

  const pageFour = plan.sections.find((section) => Number(section.sourcePage) === 4);
  assert.ok(pageFour, "source page 4 should remain represented");
  assert.ok(pageFour.blocks.some((block) => block.sourceIds?.includes("src_4_1_paragraph") && block.text === longSourceUnit));
});
