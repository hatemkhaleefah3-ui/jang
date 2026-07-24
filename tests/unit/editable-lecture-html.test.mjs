import test from "node:test";
import assert from "node:assert/strict";
import { buildEditableLectureHtml, verifyEditableLectureHtml } from "../../editable-lecture-html.js";

test("maps every source block exactly once and in source order", () => {
  const source = `[SOURCE FILE]\nLec.pdf\n[DOCUMENT TITLE]\nImmunoglobulin\n[TOPIC MAP]\nOverview\n[INFO BOX]\nLecturer: Name\n[SECTION]\nStructure\n[PARAGRAPH]\nExact paragraph.\n[NOTE BOX]\nExact note.\n[TABLE]\n| A | B |\n|---|---|\n| 1 | 2 |\n[PATHWAY]\nType: linear\nA → B\n[QUICK REVIEW]\n- Review\n[FOOTER]\nEnd`;
  const result = buildEditableLectureHtml(source, { courseCode: "BIO", lectureLabel: "Lecture 4" });
  assert.equal(result.verification.valid, true);
  assert.equal(verifyEditableLectureHtml(result.html, result.document).valid, true);
  assert.equal(result.verification.rendered, result.document.blocks.length);
  assert.match(result.html, /data-jang-reference-design/);
  assert.match(result.html, /data-width-control/);
  assert.match(result.html, /--jang-width:42%/);
});

test("image labels remain below editable percentage-sized placeholders", () => {
  const result = buildEditableLectureHtml(`[IMAGE]\nlabel: Antibody structure\nPlace beside the explanation.`);
  const imageIndex = result.html.indexOf("jang-image-placeholder");
  const labelIndex = result.html.indexOf("Antibody structure", imageIndex);
  assert.ok(imageIndex >= 0 && labelIndex > imageIndex);
  assert.match(result.html, /data-align="right" style="--jang-width:42%"/);
});

test("reference components and editor tools are included", () => {
  const result = buildEditableLectureHtml(`[DOCUMENT TITLE]\nLecture\n[DIAGRAM]\nType: branching consequence map\nTitle: Consequences\nStructure:\n- A\n- B`);
  assert.match(result.html, /cover-page/);
  assert.match(result.html, /page-header/);
  assert.match(result.html, /page-footer/);
  assert.match(result.html, /end-page/);
  assert.match(result.html, /diagram-tree-hierarchy/);
  assert.match(result.html, /data-action="add-node"/);
  assert.match(result.html, /data-action="undo"/);
});
