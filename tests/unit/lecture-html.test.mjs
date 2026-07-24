import test from "node:test";
import assert from "node:assert/strict";
import { buildLectureHtml } from "../../lecture-html.js";

test("builds a static cover-to-end 16:9 lecture without editor controls", () => {
  const source = `[DOCUMENT TITLE]\nCell Biology\n\n[SECTION]\nIntroduction\n\n[PARAGRAPH]\nCells are the basic unit of life.\n\n[BULLETS]\n- Membrane\n- Cytoplasm\n- DNA\n\n[END]\nThank you`;
  const result = buildLectureHtml(source);
  assert.equal(result.verification.valid, true);
  assert.match(result.html, /aspect-ratio:16\/9/);
  assert.match(result.html, /class="slide cover"/);
  assert.match(result.html, /class="slide end-slide"/);
  assert.doesNotMatch(result.html, /contenteditable|Save project|Open editor|<script/);
  assert.match(result.html, /Cells are the basic unit of life\./);
  assert.ok(result.slideCount >= 3);
});

test("adds slides until long content is fully represented", () => {
  const source = `[DOCUMENT TITLE]\nLong Lecture\n\n[PARAGRAPH]\n${"Complete lecture sentence. ".repeat(260)}`;
  const result = buildLectureHtml(source);
  assert.ok(result.slideCount > 3);
  assert.equal((result.html.match(/sentence\./g) || []).length, 260);
});
