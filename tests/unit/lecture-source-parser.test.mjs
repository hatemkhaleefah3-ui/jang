import test from "node:test";
import assert from "node:assert/strict";
import { parseLectureSource } from "../../lecture-source-parser.js";

test("parses marked lecture blocks without changing order", () => {
  const result = parseLectureSource("[DOCUMENT TITLE]\nBiology\n[SECTION]\nCells\n[PARAGRAPH]\nAll cells have membranes.");
  assert.deepEqual(result.blocks.map((block) => block.type), ["title", "section", "paragraph"]);
  assert.equal(result.blocks[2].content, "All cells have membranes.");
});

test("keeps unmarked text as source content", () => {
  const source = "Lecture title\n\nComplete lecture paragraph.";
  const result = parseLectureSource(source);
  assert.equal(result.blocks.length, 1);
  assert.equal(result.blocks[0].content, source);
});
