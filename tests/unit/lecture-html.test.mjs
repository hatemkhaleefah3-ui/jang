import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { buildLectureHtml } from "../../lecture-html.js";

function inlineScript(html) {
  const match = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match, "generated HTML should contain an inline editor script");
  return match[1];
}

test("builds cover, content, and end slides", () => {
  const result = buildLectureHtml(`Cell Biology\n\nIntroduction\n\n${"Cell membranes control transport and signaling. ".repeat(40)}`);
  assert.match(result.html, /class="slide cover-slide"/);
  assert.match(result.html, /class="slide content-slide"/);
  assert.match(result.html, /class="slide end-slide"/);
  assert.match(result.html, /aspect-ratio:16\/9/);
  assert.doesNotMatch(result.html, /contenteditable|Save project|Open editor|preview/i);
});

test("equals divider creates a dedicated section slide and sets later headers", () => {
  const source = `Glucose Homeostasis\n\n============================================================\n2. REGULATION OF BLOOD GLUCOSE\n============================================================\n\nThe liver buffers circulating glucose.`;
  const result = buildLectureHtml(source);
  assert.match(result.html, /class="slide section-slide"[\s\S]*?<h2>2\. REGULATION OF BLOOD GLUCOSE<\/h2>/);
  assert.match(result.html, /class="slide content-slide"[\s\S]*?<header class="slide-header"><h2>2\. REGULATION OF BLOOD GLUCOSE<\/h2><\/header>/);
});

test("hyphen divider stays in the body with upper and lower rules", () => {
  const source = `Glucose Homeostasis\n\n------------------------------------------------------------\nMaintenance of Blood Glucose in the Fed State\n------------------------------------------------------------\n\nInsulin promotes glucose uptake.`;
  const result = buildLectureHtml(source);
  assert.match(result.html, /<h3 class="divider-title">Maintenance of Blood Glucose in the Fed State<\/h3>/);
  assert.match(result.html, /\.divider-title\{[^}]*border-block:/);
  assert.doesNotMatch(result.html, /class="slide section-slide"[\s\S]*?Maintenance of Blood Glucose in the Fed State/);
});

test("document title stays on the cover while slide headers use section titles", () => {
  const result = buildLectureHtml(`[DOCUMENT TITLE]\nGlucose Lecture\n\n[SECTION]\nFed State\n\n[PARAGRAPH]\nInsulin rises after a meal.`);
  assert.match(result.html, /<h1>Glucose Lecture<\/h1>/);
  assert.match(result.html, /<header class="slide-header"><h2>Fed State<\/h2><\/header>/);
  assert.doesNotMatch(result.html, /<header class="slide-header"><h2>Glucose Lecture<\/h2><\/header>/);
});

test("diagram rows keep nodes and visible arrows between components", () => {
  const result = buildLectureHtml(`[DOCUMENT TITLE]\nPathways\n[SECTION]\nRegulation\n[DIAGRAM]\nType: flow\nTitle: Glucose pathway\nStructure:\nGlucose → Glucose-6-phosphate → Glycogen\nInsulin → GLUT4 → Uptake`);
  assert.match(result.html, /<div class="sequence-row"><span class="sequence-node">Glucose<\/span><span class="sequence-arrow"[^>]*>→<\/span><span class="sequence-node">Glucose-6-phosphate<\/span>/);
  assert.match(result.html, /<div class="sequence-row"><span class="sequence-node">Insulin<\/span><span class="sequence-arrow"[^>]*>→<\/span><span class="sequence-node">GLUT4<\/span>/);
});

test("empty image placeholder opens a bottom sheet with import and close", () => {
  const result = buildLectureHtml(`[DOCUMENT TITLE]\nImaging\n[SECTION]\nFigures\n[IMAGE size=wide]\nLabel: Transport diagram\nChoose a membrane image.`);
  assert.match(result.html, /data-image-actions-empty/);
  assert.match(result.html, /data-image-action="import">Import image<\/button>/);
  assert.match(result.html, /data-image-action="close">Close<\/button>/);
  assert.match(result.html, /if \(surface\) \{\s*openSheet\(surface\.closest\("\[data-image-placeholder\]"\)\);/);
  assert.doesNotMatch(result.html, /else placeholder\.querySelector\("\[data-image-input\]"\)\.click/);
  assert.match(result.html, /class="image-file-input" data-image-input/);
});

test("filled image controls and persistent save controls remain available", () => {
  const result = buildLectureHtml(`[DOCUMENT TITLE]\nImaging\n[IMAGE]\nLabel: Figure`);
  assert.match(result.html, /data-image-actions-filled/);
  assert.match(result.html, /data-image-action="change"/);
  assert.match(result.html, /data-image-action="remove-image"/);
  assert.match(result.html, /data-image-action="remove-placeholder"/);
  assert.match(result.html, /data-image-save-bar/);
  assert.match(result.html, /showSaveFilePicker/);
  assert.match(result.html, /readAsDataURL/);
  assert.match(result.html, /history\.pop\(\)/);
});

test("generated image editor script is valid JavaScript", () => {
  const result = buildLectureHtml(`[DOCUMENT TITLE]\nImaging\n[IMAGE]\nLabel: Figure`);
  new vm.Script(inlineScript(result.html));
});

test("keeps source metadata and right-to-left direction", () => {
  const result = buildLectureHtml(`[SOURCE FILE]\nLecture 04.txt\n[DOCUMENT TITLE]\nتنظيم سكر الدم\n[SECTION]\nحالة الشبع\n[PARAGRAPH]\nيرتفع الإنسولين بعد الوجبة.`);
  assert.equal(result.sourceFile, "Lecture 04.txt");
  assert.match(result.html, /dir="rtl"/);
  assert.match(result.html, /Source file\s*\nLecture 04\.txt/);
});

test("long diagram sequences retain every node across additional slides", () => {
  const nodes = Array.from({ length: 13 }, (_, index) => `Node ${index + 1}`).join(" → ");
  const result = buildLectureHtml(`[DOCUMENT TITLE]\nPathways\n[SECTION]\nFlow\n[DIAGRAM]\nType: flow\nTitle: Long pathway\nStructure:\n${nodes}`);
  assert.ok(result.contentSlideCount >= 3);
  for (let index = 1; index <= 13; index += 1) assert.match(result.html, new RegExp(`Node ${index}`));
});
