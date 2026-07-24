import test from "node:test";
import assert from "node:assert/strict";
import { parseLectureSource } from "../../lecture-source-parser.js";

test("preserves explicit lecture blocks in their original order", () => {
  const source = `[TITLE]\nGlycine Metabolism\n[SUBTITLE]\nBiosynthesis\n[PARAGRAPH]\nGlycine  is synthesized from serine.\nSecond line stays here.\n[NOTE]\nDo not rewrite this note.`;
  const document = parseLectureSource(source);

  assert.deepEqual(document.blocks.map((block) => block.type), ["title", "subtitle", "paragraph", "note"]);
  assert.equal(document.blocks[0].content, "Glycine Metabolism");
  assert.equal(document.blocks[2].content, "Glycine  is synthesized from serine.\nSecond line stays here.");
  assert.equal(document.blocks[3].content, "Do not rewrite this note.");
  assert.equal(document.source, source);
});

test("requires and preserves an image label", () => {
  const document = parseLectureSource(`[IMAGE]\nlabel: Glycolysis pathway\nOptional image instructions`);
  assert.equal(document.blocks[0].type, "image");
  assert.equal(document.blocks[0].label, "Glycolysis pathway");
  assert.equal(document.blocks[0].content, "label: Glycolysis pathway\nOptional image instructions");

  assert.throws(() => parseLectureSource(`[IMAGE]\nMissing label`), /requires.*label/i);
});

test("accepts only declared pathway types", () => {
  const document = parseLectureSource(`[PATHWAY type="branched"]\nA -> B\nA -> C`);
  assert.equal(document.blocks[0].type, "pathway");
  assert.equal(document.blocks[0].type, "pathway");
  assert.equal(document.blocks[0].attributes.type, "branched");
  assert.equal(document.blocks[0].content, "A -> B\nA -> C");

  assert.throws(() => parseLectureSource(`[PATHWAY type="spiral"]\nA -> B`), /requires type=linear/i);
});

test("treats unmarked input as one unchanged paragraph", () => {
  const source = "First line\n\nSecond  line";
  const document = parseLectureSource(source);
  assert.equal(document.blocks.length, 1);
  assert.equal(document.blocks[0].type, "paragraph");
  assert.equal(document.blocks[0].content, source);
});