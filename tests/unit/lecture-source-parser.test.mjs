import test from "node:test";
import assert from "node:assert/strict";
import { parseLectureSource } from "../../lecture-source-parser.js";

test("recognizes the imported lecture text vocabulary", () => {
  const source = `[SOURCE FILE]\nLec.4.pdf\n[DOCUMENT TITLE]\nImmunoglobulin\n[TOPIC MAP]\nExact overview\n[INFO BOX]\nLecturer: Name\n[SECTION]\nIntroduction\n[NOTE BOX]\nExact note\n[BULLET LIST]\n- First\n- Second\n[NUMBERED LIST]\n1. One\n2. Two\n[DIAGRAM]\nType: labeled structural diagram\nTitle: Antibody structure\nStructure:\n- Arm\n- Stem\n[PATHWAY]\nType: linear\nA → B\n[QUICK REVIEW]\n- Review\n[FOOTER]\nEnd`;
  const parsed = parseLectureSource(source);
  assert.equal(parsed.source, source);
  assert.deepEqual(parsed.blocks.map((block) => block.type), ["source-file","title","topic-map","info","section","note","bullets","numbered","diagram","pathway","quick-review","footer"]);
  assert.equal(parsed.blocks[8].label, "Antibody structure");
  assert.equal(parsed.blocks[9].pathwayType, "linear");
  assert.equal(parsed.blocks[9].pathwayContent, "A → B");
});

test("preserves exact text, spacing, and source order", () => {
  const source = `[PARAGRAPH]\nGlycine  is synthesized.\nSecond line.\n[NOTE BOX]\nDo not rewrite this.`;
  const parsed = parseLectureSource(source);
  assert.equal(parsed.source, source);
  assert.equal(parsed.blocks[0].content, "Glycine  is synthesized.\nSecond line.");
  assert.equal(parsed.blocks[1].content, "Do not rewrite this.");
  assert.ok(parsed.blocks[0].sourceEnd <= parsed.blocks[1].sourceStart);
});

test("requires an image label and accepts pathway type lines", () => {
  assert.equal(parseLectureSource(`[IMAGE]\nlabel: Antibody image`).blocks[0].label, "Antibody image");
  assert.throws(() => parseLectureSource(`[IMAGE]\nNo label`), /requires exactly one/i);
  assert.equal(parseLectureSource(`[PATHWAY]\nType: closed circular\nA → B`).blocks[0].pathwayType, "closed-circle");
});
