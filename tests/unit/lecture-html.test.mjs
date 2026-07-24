import test from "node:test";
import assert from "node:assert/strict";
import { buildLectureHtml, normalizeLectureData } from "../../lecture-html.js";

const lecture = {
  documentTitle: "Glucose Homeostasis",
  direction: "ltr",
  overview: {
    title: "Overview",
    introduction: "How the body maintains blood glucose.",
    keyPoints: ["Fed state", "Fasting state"],
  },
  endNote: "Review glucose regulation.",
  sections: [{
    sectionTitle: "Regulation of Blood Glucose",
    slides: [
      {
        slideTitle: "Fed-State Regulation",
        slideSubtitle: "Insulin-dominant metabolism",
        blocks: [
          { type: "subtitle", text: "Hepatic glucose handling" },
          { type: "paragraph", text: "Insulin promotes glucose uptake and storage." },
          { type: "table", label: "Fed-state hormone effects", headers: ["Hormone", "Effect"], rows: [["Insulin", "Storage"]] },
        ],
      },
      {
        slideTitle: "Fed-State Regulation",
        slideSubtitle: "Glycolysis pathway",
        blocks: [
          { type: "paragraph", text: "Glucose is converted to pyruvate." },
          { type: "diagram", label: "Glycolysis biochemical pathway", diagramRows: [["Glucose", "G6P", "Pyruvate"]] },
          { type: "image", slotId: "glycolysis-image", label: "Glycolysis biochemical pathway", description: "The complete glycolysis pathway.", fit: "contain", sourceReference: "Page 8" },
        ],
      },
      {
        slideTitle: "Hormonal Comparison",
        slideSubtitle: "Fed versus fasting state",
        blocks: [
          { type: "table", label: "Fed and fasting hormone comparison", headers: ["State", "Insulin", "Glucagon", "Main pathway"], rows: [["Fed", "High", "Low", "Storage"], ["Fasting", "Low", "High", "Production"]] },
        ],
      },
    ],
  }],
};

test("builds the required cover, overview, section, and section-content flow", () => {
  const result = buildLectureHtml(lecture);
  const cover = result.html.indexOf("class=\"slide cover-slide\"");
  const overview = result.html.indexOf("class=\"slide overview-slide\"");
  const section = result.html.indexOf("class=\"slide section-slide\"");
  const content = result.html.indexOf("class=\"slide content-slide");
  assert.ok(cover < overview && overview < section && section < content);
  assert.match(result.html, /<nav class="toc"[^>]*>[\s\S]*Regulation of Blood Glucose/);
  assert.match(result.html, /How the body maintains blood glucose\./);
});

test("renders section headers, one-time slide titles with divider lines, and subtitles without divider lines", () => {
  const result = buildLectureHtml(lecture);
  assert.match(result.html, /<header class="section-header"><h2>Regulation of Blood Glucose<\/h2><\/header>/);
  assert.equal((result.html.match(/<h2 class="slide-title">Fed-State Regulation<\/h2>/g) || []).length, 1);
  assert.match(result.html, /<h3 class="slide-subtitle">Insulin-dominant metabolism<\/h3>/);
  assert.match(result.html, /<h3 class="content-subtitle">Hepatic glucose handling<\/h3>/);
  assert.match(result.html, /\.slide-title\{[^}]*border-bottom/);
  assert.doesNotMatch(result.html, /\.slide-subtitle\{[^}]*border-bottom/);
});

test("places a compact table with preceding text on the physical upper-right side", () => {
  const result = buildLectureHtml(lecture);
  assert.match(result.html, /layout-table-after/);
  assert.match(result.html, /\.layout-table-after \.mixed-table-grid \.visual-zone\{grid-column:2;grid-row:1\}/);
  assert.match(result.html, /Fed-state hormone effects/);
});

test("places a compact diagram below preceding text and labels it", () => {
  const result = buildLectureHtml(lecture);
  assert.match(result.html, /layout-diagram-after/);
  assert.match(result.html, /Glycolysis biochemical pathway/);
  assert.match(result.html, /<span class="sequence-node">Glucose<\/span><span class="sequence-arrow"[^>]*>→<\/span><span class="sequence-node">G6P<\/span>/);
});

test("gives tables with more than three columns a dedicated centered slide", () => {
  const result = buildLectureHtml(lecture);
  assert.match(result.html, /layout-table-only/);
  assert.match(result.html, /class="visual-zone visual-zone-full"/);
  assert.match(result.html, /Fed and fasting hormone comparison/);
});

test("puts images on dedicated full visual slides and embeds selected images", () => {
  const images = new Map([["glycolysis-image", { dataUrl: "data:image/png;base64,AAAA", name: "glycolysis.png" }]]);
  const result = buildLectureHtml(lecture, images);
  assert.match(result.html, /layout-image-only/);
  assert.match(result.html, /src="data:image\/png;base64,AAAA"/);
  assert.match(result.html, /alt="Glycolysis biochemical pathway"/);
  assert.match(result.html, /\.lecture-image\{width:100%;height:100%/);
  assert.doesNotMatch(result.html, /data-image-input|Import image|showSaveFilePicker|<script>/);
});

test("keeps a labeled static image position when no image was selected", () => {
  const result = buildLectureHtml(lecture);
  assert.match(result.html, /Image position/);
  assert.match(result.html, /The complete glycolysis pathway\./);
  assert.match(result.html, /Page 8/);
});

test("normalizes duplicate image slot ids and repeated titles", () => {
  const normalized = normalizeLectureData({
    documentTitle: "Images",
    sections: [{ sectionTitle: "Figures", slides: [
      { slideTitle: "Same", slideSubtitle: "First", blocks: [{ type: "image", slotId: "figure", label: "First" }] },
      { slideTitle: "Same", slideSubtitle: "Second", blocks: [{ type: "image", slotId: "figure", label: "Second" }] },
    ] }],
  });
  assert.deepEqual(normalized.sections[0].slides.map((slide) => slide.slideTitle), ["Same", ""]);
  assert.deepEqual(normalized.sections[0].slides.map((slide) => slide.blocks[0].slotId), ["figure", "figure-2"]);
});

test("paginates long paragraphs without repeating the slide title", () => {
  const text = "Cell membranes regulate transport and signaling. ".repeat(100);
  const result = buildLectureHtml({ documentTitle: "Cells", sections: [{ sectionTitle: "Membranes", slides: [{ slideTitle: "Membrane Functions", slideSubtitle: "", blocks: [{ type: "paragraph", text }] }] }] });
  assert.ok(result.contentSlideCount > 3);
  assert.equal((result.html.match(/<h2 class="slide-title">Membrane Functions<\/h2>/g) || []).length, 1);
  assert.match(result.html, /Cell membranes regulate transport and signaling\./);
});

test("uses right-to-left document direction and right-aligned text zones", () => {
  const result = buildLectureHtml({ documentTitle: "تنظيم سكر الدم", direction: "rtl", sections: [{ sectionTitle: "حالة الشبع", slides: [{ slideTitle: "", slideSubtitle: "تنظيم الإنسولين", blocks: [{ type: "paragraph", text: "يرتفع الإنسولين بعد الوجبة." }] }] }] });
  assert.match(result.html, /dir="rtl"/);
  assert.match(result.html, /\.text-zone\{[^}]*text-align:right/);
});
