import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createStaticSchemaValidator } from "../../lecture-validator.js";

const schema = JSON.parse(await readFile(new URL("../../lecture-schema.json", import.meta.url), "utf8"));

function minimalLecture() {
  return {
    schemaVersion: "1.2",
    documentTitle: "Carbohydrate metabolism",
    direction: "ltr",
    overview: {
      title: "Overview",
      introduction: "Core pathways and regulation.",
      keyPoints: ["Glycolysis"],
    },
    sections: [{
      sectionId: "section-1",
      sectionTitle: "Glycolysis",
      sectionDefinition: "Glycolysis converts glucose to pyruvate while conserving energy.",
      slides: [{
        slideId: "slide-1",
        slideTitle: "Pathway",
        titleDefinition: "The pathway summarizes the ordered reactions of glycolysis.",
        slideSubtitle: "",
        sourceReferences: ["Page 1"],
        blocks: [{
          blockId: "block-1",
          sourceReferences: ["Page 1"],
          type: "paragraph",
          text: "Glucose is converted to pyruvate.",
        }],
      }],
    }],
    endNote: "Questions",
  };
}

test("static validator accepts a valid lecture document", () => {
  const validate = createStaticSchemaValidator(schema);
  assert.equal(validate(minimalLecture()), true, JSON.stringify(validate.errors));
  assert.equal(validate.errors, null);
});

test("static validator reports required, enum, and oneOf failures", () => {
  const lecture = minimalLecture();
  delete lecture.documentTitle;
  lecture.direction = "sideways";
  lecture.sections[0].slides[0].blocks[0].type = "unknown";

  const validate = createStaticSchemaValidator(schema);
  assert.equal(validate(lecture), false);
  assert.ok(Array.isArray(validate.errors));
  assert.ok(validate.errors.some((error) => error.keyword === "required"));
  assert.ok(validate.errors.some((error) => error.keyword === "enum"));
  assert.ok(validate.errors.some((error) => error.keyword === "oneOf"));
});

test("static validator rejects additional properties and empty required arrays", () => {
  const lecture = minimalLecture();
  lecture.unexpected = true;
  lecture.sections = [];

  const validate = createStaticSchemaValidator(schema);
  assert.equal(validate(lecture), false);
  assert.ok(validate.errors.some((error) => error.keyword === "additionalProperties"));
  assert.ok(validate.errors.some((error) => error.keyword === "minItems"));
});
