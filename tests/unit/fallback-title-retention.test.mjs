import test from "node:test";
import assert from "node:assert/strict";
import { createFallbackPlan } from "../../source-importer.js";

test("fallback generation is disabled even for misclassified long titles", () => {
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

  assert.throws(
    () => createFallbackPlan(extraction, { courseCode: "BIO", lectureLabel: "Lecture" }),
    /will not generate or offer a low-quality fallback PowerPoint/,
  );
});