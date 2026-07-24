import test from "node:test";
import assert from "node:assert/strict";
import { createFallbackPlan } from "../../source-importer.js";

test("AI outages fail closed instead of producing a low-quality fallback deck", () => {
  assert.throws(
    () => createFallbackPlan({ sourceUnits: [{ page: 1, order: 1, text: "Exact source text" }], assets: [] }),
    /will not generate or offer a low-quality fallback PowerPoint/,
  );
});
