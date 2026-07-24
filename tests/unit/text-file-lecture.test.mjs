import test from "node:test";
import assert from "node:assert/strict";
import { parseLectureSource } from "../../lecture-source-parser.js";
import { buildEditableLectureHtml } from "../../editable-lecture-html.js";

test("parses the structured text-file lecture format", () => {
  const source = `[SOURCE FILE]\nLec.4 Immunoglobulin.pdf\n\n[DOCUMENT TITLE]\nImmunoglobulin\n\n[TOPIC MAP]\nOverview remains unchanged.\n\n[INFO BOX]\nLecturer: Dr. Example\n\n[SECTION]\nBasic Structure\n\n[BULLET LIST]\n- First point.\n- Second point.\n\n[DIAGRAM]\nType: labeled structural diagram\nTitle: Antibody structure\nStructure:\n- Heavy chain\n- Light chain\nSource page or slide: 7\n\n[PATHWAY]\nType: linear\nA → B → C\n\n[TABLE]\n| Class | Chain |\n|---|---|\n| IgG | Gamma |\n\n[QUICK REVIEW]\n- Review point.\n\n[FOOTER]\nEnd of lecture.`;
  const document = parseLectureSource(source);
  assert.equal(document.version, 3);
  assert.deepEqual(document.blocks.map((block) => block.type), ["source-file", "title", "topic-map", "info", "section", "bullets", "diagram", "pathway", "table", "quick-review", "footer"]);
  assert.equal(document.blocks[5].items[0], "First point.");
  assert.equal(document.blocks[6].title, "Antibody structure");
  assert.equal(document.blocks[7].pathwayType, "linear");
  assert.deepEqual(document.blocks[8].headers, ["Class", "Chain"]);
  assert.equal(document.source, source);
});

test("builds verified editable HTML from imported text", () => {
  const source = `[DOCUMENT TITLE]\nImmunoglobulin\n[SECTION]\nIntroduction\n[PARAGRAPH]\nExact source paragraph.\n[TABLE]\n| A | B |\n|---|---|\n| 1 | 2 |\n[PATHWAY]\nType: linear\nA → B\n[FOOTER]\nEnd.`;
  const result = buildEditableLectureHtml(source, { courseCode: "BIO", lectureLabel: "Lecture 4" });
  assert.equal(result.verification.valid, true);
  assert.match(result.html, /data-jang-reference-design/);
  assert.match(result.html, /data-source-id="block-3"/);
  assert.match(result.html, /contenteditable="true"/);
  assert.match(result.html, /data-action="save"/);
  assert.match(result.html, /data-image-input|comparison-table/);
});
