import test from "node:test";
import assert from "node:assert/strict";
import { buildLectureHtml } from "../../lecture-html.js";

test("builds cover, paginated content, and end slides without editing code", () => {
  const source = `Cell Biology\n\nIntroduction\n\n${"Cell membranes control transport and signaling. ".repeat(90)}\n\n- Lipids\n- Proteins\n- Carbohydrates`;
  const result = buildLectureHtml(source);

  assert.match(result.html, /class="slide cover-slide"/);
  assert.match(result.html, /class="slide content-slide"/);
  assert.match(result.html, /class="slide end-slide"/);
  assert.ok(result.contentSlideCount > 1);
  assert.match(result.html, /aspect-ratio:16\/9/);
  assert.doesNotMatch(result.html, /contenteditable|Save project|Open editor|preview/i);
  assert.match(result.html, /Cell membranes control transport and signaling\./);
});

test("keeps structured lecture blocks and ending content", () => {
  const source = `[DOCUMENT TITLE]\nImmunology\n\n[SECTION]\nAntibodies\n\n[PARAGRAPH]\nAntibodies recognize specific antigens.\n\n[BULLETS]\n- IgG\n- IgM\n- IgA\n\n[END]\nReview the key antibody classes.`;
  const result = buildLectureHtml(source);

  assert.equal(result.title, "Immunology");
  assert.match(result.html, /Antibodies recognize specific antigens\./);
  assert.match(result.html, /<li>IgG<\/li>/);
  assert.match(result.html, /Review the key antibody classes\./);
  assert.equal(result.filename, "immunology.html");
});

test("uses right-to-left document direction for Arabic lecture text", () => {
  const result = buildLectureHtml("علم الأحياء\n\nمقدمة عن الخلية ووظائفها.");
  assert.match(result.html, /dir="rtl"/);
});
