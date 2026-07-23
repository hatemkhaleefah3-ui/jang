import test from "node:test";
import assert from "node:assert/strict";
import { createFallbackPlan } from "../../fallback-plan.js";

test("fallback groups sentence fragments and generic continuation headings", () => {
  const extraction = {
    title: "Carbohydrate Metabolism",
    content: `# PENTOSE PHOSPHATE PATHWAY

The pentose phosphate pathway is

an alternative route for

the oxidation of glucose. It produces NADPH and ribose-5-phosphate.

# Continued

The pathway occurs in the cytosol.

Regulation

Glucose-6-phosphate dehydrogenase is the rate-limiting enzyme.

# Slide 3

NADPH maintains reduced glutathione in erythrocytes.`,
  };

  const plan = createFallbackPlan(extraction, { courseCode: "BIO 214", lectureLabel: "Lecture 08" });
  const titles = plan.sections.map((section) => section.title);
  const paragraphText = plan.sections.flatMap((section) => section.blocks).filter((block) => block.type === "paragraph").map((block) => block.text).join(" ");

  assert.equal(titles.some((title) => /continued|slide\s+\d+/i.test(title)), false);
  assert.match(paragraphText, /alternative route for the oxidation of glucose/i);
  assert.match(paragraphText, /rate-limiting enzyme/i);
  assert.match(paragraphText, /reduced glutathione/i);
  assert.ok(plan.sections.length <= 3);
});
