import test from "node:test";
import assert from "node:assert/strict";
import { buildLectureHtml, normalizeLectureData } from "../../lecture-html.js";

const lecture = {
  documentTitle: "Glucose Homeostasis",
  direction: "ltr",
  endNote: "Review glucose regulation.",
  slides: [
    { kind: "section", sectionTitle: "Regulation of Blood Glucose", blocks: [] },
    {
      kind: "content",
      sectionTitle: "Regulation of Blood Glucose",
      blocks: [
        { type: "dividerTitle", text: "Maintenance in the Fed State" },
        { type: "paragraph", text: "Insulin promotes glucose uptake and storage." },
        { type: "diagram", label: "Fed-state pathway", diagramRows: [["Glucose", "Glucose-6-phosphate", "Glycogen"]] },
        { type: "image", slotId: "fed-state-image", label: "Fed-state glucose metabolism", size: "wide", fit: "contain", sourceReference: "Page 8" },
      ],
    },
  ],
};

test("keeps the document title on the cover and section titles in content headers", () => {
  const result = buildLectureHtml(lecture);
  assert.match(result.html, /<h1>Glucose Homeostasis<\/h1>/);
  assert.match(result.html, /class="slide section-slide"[\s\S]*?<h2>Regulation of Blood Glucose<\/h2>/);
  assert.match(result.html, /<header class="slide-header"><h2>Regulation of Blood Glucose<\/h2><\/header>/);
  assert.doesNotMatch(result.html, /<header class="slide-header"><h2>Glucose Homeostasis<\/h2>/);
});

test("renders divider titles and diagram nodes with connectors", () => {
  const result = buildLectureHtml(lecture);
  assert.match(result.html, /<h3 class="divider-title">Maintenance in the Fed State<\/h3>/);
  assert.match(result.html, /<span class="sequence-node">Glucose<\/span><span class="sequence-arrow"[^>]*>→<\/span><span class="sequence-node">Glucose-6-phosphate<\/span>/);
});

test("embeds selected intermediate-step images into the standalone HTML", () => {
  const images = new Map([["fed-state-image", { dataUrl: "data:image/png;base64,AAAA", name: "fed.png" }]]);
  const result = buildLectureHtml(lecture, images);
  assert.match(result.html, /src="data:image\/png;base64,AAAA"/);
  assert.match(result.html, /alt="Fed-state glucose metabolism"/);
  assert.doesNotMatch(result.html, /data-image-input|Import image|showSaveFilePicker|<script>/);
});

test("keeps a labeled static image position when no image was selected", () => {
  const result = buildLectureHtml(lecture);
  assert.match(result.html, /Image position/);
  assert.match(result.html, /Fed-state glucose metabolism/);
  assert.match(result.html, /Page 8/);
});

test("normalizes duplicate image slot ids without losing image blocks", () => {
  const normalized = normalizeLectureData({
    documentTitle: "Images",
    slides: [{ kind: "content", sectionTitle: "Figures", blocks: [
      { type: "image", slotId: "figure", label: "First" },
      { type: "image", slotId: "figure", label: "Second" },
    ] }],
  });
  const slots = normalized.slides[0].blocks.map((block) => block.slotId);
  assert.deepEqual(slots, ["figure", "figure-2"]);
});

test("paginates long paragraphs without dropping source content", () => {
  const text = "Cell membranes regulate transport and signaling. ".repeat(100);
  const result = buildLectureHtml({ documentTitle: "Cells", slides: [{ kind: "content", sectionTitle: "Membranes", blocks: [{ type: "paragraph", text }] }] });
  assert.ok(result.contentSlideCount > 1);
  assert.match(result.html, /Cell membranes regulate transport and signaling\./);
});

test("uses right-to-left document direction", () => {
  const result = buildLectureHtml({ documentTitle: "تنظيم سكر الدم", direction: "rtl", slides: [{ kind: "content", sectionTitle: "حالة الشبع", blocks: [{ type: "paragraph", text: "يرتفع الإنسولين بعد الوجبة." }] }] });
  assert.match(result.html, /dir="rtl"/);
});
