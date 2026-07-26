import test from "node:test";
import assert from "node:assert/strict";
import { generateLecturePptx } from "../../pptx-engine.js";

function geometryRegressionLecture() {
  const mediumParagraph = "alpha beta ".repeat(40);
  return {
    schemaVersion: "1.1",
    documentTitle: "Geometry regression",
    direction: "ltr",
    overview: {
      title: "Overview",
      introduction: "Regression coverage for title reserves and late inline images.",
      keyPoints: ["First-page reserve", "Mixed-column reflow"],
    },
    sections: [{
      sectionId: "geometry",
      sectionTitle: "Geometry",
      slides: [
        {
          slideId: "title-reserve",
          slideTitle: "Title and subtitle reserve",
          slideSubtitle: "Both blocks must remain above the footer.",
          sourceReferences: ["p1"],
          blocks: [
            { blockId: "p1", type: "paragraph", text: mediumParagraph, sourceReferences: ["p1"] },
            { blockId: "p2", type: "paragraph", text: mediumParagraph, sourceReferences: ["p1"] },
          ],
        },
        {
          slideId: "late-image",
          slideTitle: "Late inline image",
          slideSubtitle: "The image narrows text after the paragraph has been encountered.",
          sourceReferences: ["p2"],
          blocks: [
            {
              blockId: "late-image-text",
              type: "paragraph",
              text: "alpha beta ".repeat(50),
              sourceReferences: ["p2"],
            },
            {
              blockId: "late-image-block",
              type: "image",
              slotId: "unfilled-late-image",
              label: "Late image placeholder",
              description: "This image block appears after the related paragraph.",
              important: true,
              sourceReference: "p2",
              fit: "contain",
              preferredAspect: "wide",
              sourceReferences: ["p2"],
            },
          ],
        },
      ],
    }],
    endNote: "Questions",
  };
}

test("production engine prevents first-page and late-image geometry overflow", async () => {
  const result = await generateLecturePptx(
    geometryRegressionLecture(),
    {},
    { strictGeometry: true },
  );
  assert.ok(result.blob.size > 1000);
  assert.equal(result.warnings.some((warning) => warning.startsWith("Geometry:")), false);
});
