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
