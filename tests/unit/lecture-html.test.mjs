import test from "node:test";
import assert from "node:assert/strict";
import { buildLectureHtml } from "../../lecture-html.js";

test("builds cover, paginated content, and end slides without general editing code", () => {
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

test("keeps structured lecture blocks, source metadata, and ending content", () => {
  const source = `[SOURCE FILE]\nLecture 04.txt\n\n[DOCUMENT TITLE]\nImmunology\n\n[SECTION]\nAntibodies\n\n[PARAGRAPH]\nAntibodies recognize specific antigens.\n\n[BULLETS]\n- IgG\n- IgM\n- IgA\n\n[END]\nReview the key antibody classes.`;
  const result = buildLectureHtml(source);

  assert.equal(result.title, "Immunology");
  assert.equal(result.sourceFile, "Lecture 04.txt");
  assert.match(result.html, /Source file\s*\nLecture 04\.txt/);
  assert.match(result.html, /Antibodies recognize specific antigens\./);
  assert.match(result.html, /<li>IgG<\/li>/);
  assert.match(result.html, /Review the key antibody classes\./);
  assert.equal(result.filename, "immunology.html");
});

test("splits long diagram sequences into additional slides without dropping nodes", () => {
  const nodes = Array.from({ length: 13 }, (_, index) => `Node ${index + 1}`).join(" → ");
  const result = buildLectureHtml(`[DOCUMENT TITLE]\nPathways\n[DIAGRAM]\nType: flow\nTitle: Long pathway\nStructure:\n${nodes}`);

  assert.ok(result.contentSlideCount >= 3);
  for (let index = 1; index <= 13; index += 1) assert.match(result.html, new RegExp(`Node ${index}`));
});

test("uses section titles in slide headers instead of standalone section slides", () => {
  const result = buildLectureHtml(`[DOCUMENT TITLE]\nBiology\n[SECTION]\nCells\n[SUBTITLE]\nMembranes\n[PARAGRAPH]\nMembrane content.`);

  assert.match(result.html, /<header class="slide-header"><h2>Cells<\/h2><\/header>/);
  assert.match(result.html, /<h3 class="content-subtitle">Membranes<\/h3>/);
  assert.doesNotMatch(result.html, /section-intro/);
});

test("removes generated Jang lecture labels", () => {
  const result = buildLectureHtml("Biology\n\nCell content.");
  assert.doesNotMatch(result.html, /Jang lecture|JANG LECTURE/);
});

test("renders sized interactive image placeholders in source order", () => {
  const source = `[DOCUMENT TITLE]\nBiology\n[SECTION]\nCells\n[PARAGRAPH]\nBefore image.\n[IMAGE size=wide fit=cover]\nlabel: Cell membrane\nInsert the membrane illustration here.\n[PARAGRAPH]\nAfter image.`;
  const result = buildLectureHtml(source);

  assert.match(result.html, /data-image-placeholder/);
  assert.match(result.html, /image-size-wide/);
  assert.match(result.html, /data-image-fit="cover"/);
  assert.match(result.html, /accept="image\/\*"/);
  assert.match(result.html, /Change image/);
  assert.match(result.html, /Remove image/);
  assert.match(result.html, /Remove placeholder/);
  assert.match(result.html, /data-image-save>Save<\/button>/);
  assert.match(result.html, /data-image-cancel>Cancel<\/button>/);
  assert.ok(result.html.indexOf("Before image.") < result.html.indexOf("Cell membrane"));
  assert.ok(result.html.indexOf("Cell membrane") < result.html.indexOf("After image."));
});

test("embeds image data in saved HTML and supports cancelling the last action", () => {
  const result = buildLectureHtml(`[DOCUMENT TITLE]\nBiology\n[IMAGE]\nlabel: Cell image`);
  assert.match(result.html, /FileReader/);
  assert.match(result.html, /reader\.readAsDataURL/);
  assert.match(result.html, /clone\.outerHTML/);
  assert.match(result.html, /showSaveFilePicker/);
  assert.match(result.html, /history\.pop\(\)/);
});

test("uses right-to-left document direction for Arabic lecture text", () => {
  const result = buildLectureHtml("علم الأحياء\n\nمقدمة عن الخلية ووظائفها.");
  assert.match(result.html, /dir="rtl"/);
});
