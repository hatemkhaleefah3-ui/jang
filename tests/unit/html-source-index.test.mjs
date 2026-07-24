import test from "node:test";
import assert from "node:assert/strict";
import { indexSourceStructure } from "../../extractor-v2.js";

test("HTML source indexing assigns each image occurrence to its surrounding heading page", () => {
  const assets = [{ id: "image-001", type: "image", source: "data:image/png;base64,AA==" }];
  const result = indexSourceStructure([
    "# Lecture title",
    "Opening paragraph.",
    "## Pathway",
    "Pathway explanation.",
    "[ASSET:image-001]",
  ].join("\n\n"), [], assets);

  assert.equal(result.sourcePages.length, 2);
  assert.deepEqual(result.sourcePages[1], { page: 2, title: "Pathway", assets: ["image-001"] });
  assert.equal(result.assets[0].sourcePage, 2);
  assert.equal(result.assets[0].occurrenceId, "image-001");
  assert.ok(result.assets[0].sourceOrder > 0);
  assert.equal(result.sourceUnits.some((unit) => unit.page === 2 && unit.text === "Pathway explanation."), true);
});

test("HTML source indexing emits native table rows instead of one markdown blob", () => {
  const result = indexSourceStructure([
    "# Glycogen storage diseases",
    [
      "| Type | Name | Deficient enzyme |",
      "| --- | --- | --- |",
      "| Ia | von Gierke's disease | Glucose-6-phosphatase |",
    ].join("\n"),
  ].join("\n\n"));

  const tableUnits = result.sourceUnits.filter((unit) => unit.kind === "table");
  assert.deepEqual(tableUnits.map((unit) => unit.text), [
    "Type | Name | Deficient enzyme",
    "Ia | von Gierke's disease | Glucose-6-phosphatase",
  ]);
});
