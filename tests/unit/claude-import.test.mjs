import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  collectLectureImageSlots,
  parseClaudeOutputText,
  selectClaudeOutputFile,
} from "../../claude-import.js";

const schema = JSON.parse(await readFile(new URL("../../lecture-schema.json", import.meta.url), "utf8"));

function lectureWithImage() {
  return {
    schemaVersion: "1.2",
    documentTitle: "Claude lecture import",
    direction: "ltr",
    overview: {
      title: "Overview",
      introduction: "A complete source-grounded introduction.",
      keyPoints: ["Metabolism"],
    },
    sections: [{
      sectionId: "section-metabolism",
      sectionTitle: "Metabolism",
      sectionDefinition: "Metabolism organizes biochemical reactions and energy transfer.",
      slides: [{
        slideId: "slide-pathway",
        slideTitle: "Core pathway",
        titleDefinition: "The pathway connects a precursor with its products.",
        slideSubtitle: "Ordered reactions",
        subtitleDefinition: "The reactions retain their source-supported order.",
        sourceReferences: ["Page 1"],
        blocks: [{
          blockId: "block-pathway-text",
          type: "paragraph",
          text: "The precursor is converted through an ordered pathway.",
          sourceReferences: ["Page 1"],
        }, {
          blockId: "block-pathway-image",
          type: "image",
          slotId: "image-pathway",
          label: "Pathway figure",
          description: "A labelled figure showing the ordered pathway.",
          important: true,
          sourceReference: "Page 1",
          sourceReferences: ["Page 1"],
          fit: "contain",
          preferredAspect: "wide",
          orientation: "landscape",
          visualType: "pathway",
        }],
      }],
    }],
    endNote: "Lecture complete.",
    extractionAudit: {
      sourceType: "pdf",
      sourcePageOrSlideCount: 1,
      coveredSourceReferences: ["Page 1"],
      unmappedSourceReferences: [],
      warnings: [],
    },
  };
}

test("Claude output selector accepts exactly one JSON file", () => {
  const jsonFile = { name: "lecture-output.json", size: 1_000 };
  assert.equal(selectClaudeOutputFile([jsonFile]), jsonFile);
  assert.throws(() => selectClaudeOutputFile([]), /exactly one/i);
  assert.throws(() => selectClaudeOutputFile([jsonFile, jsonFile]), /exactly one/i);
  assert.throws(() => selectClaudeOutputFile([{ name: "lecture-output.pptx", size: 2_000 }]), /valid Claude .json/i);
});

test("Claude output parser validates the lecture and derives image slots", () => {
  const lecture = lectureWithImage();
  const parsed = parseClaudeOutputText(JSON.stringify({
    lecture,
    imageSlots: [{
      slotId: "image-pathway",
      label: "Imported pathway image",
      description: "Choose the exact labelled pathway from the lecture.",
      sourceReference: "Page 1",
    }],
  }), schema);

  assert.equal(parsed.lecture.documentTitle, "Claude lecture import");
  assert.equal(parsed.imageSlots.length, 1);
  assert.equal(parsed.imageSlots[0].slotId, "image-pathway");
  assert.equal(parsed.imageSlots[0].label, "Imported pathway image");
  assert.equal(parsed.imageSlots[0].fit, "contain");
  assert.deepEqual(parsed.importWarnings, []);
});

test("Claude output parser accepts a bare lecture and rejects invalid schema", () => {
  const lecture = lectureWithImage();
  assert.equal(parseClaudeOutputText(JSON.stringify(lecture), schema).imageSlots.length, 1);
  delete lecture.documentTitle;
  assert.throws(() => parseClaudeOutputText(JSON.stringify({ lecture }), schema), /does not match the Jang lecture schema/i);
});

test("image slot collection rejects duplicate slot identifiers", () => {
  const lecture = lectureWithImage();
  lecture.sections[0].slides[0].blocks.push({
    ...lecture.sections[0].slides[0].blocks[1],
    blockId: "block-second-image",
  });
  assert.throws(() => collectLectureImageSlots(lecture), /Duplicate image slot identifier/i);
});

test("application exposes both import modes and ships the helper", async () => {
  const [html, app, build, packageJson] = await Promise.all([
    readFile(new URL("../../index.html", import.meta.url), "utf8"),
    readFile(new URL("../../app.js", import.meta.url), "utf8"),
    readFile(new URL("../../scripts/build.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(html, /id="lectureImportOption"/);
  assert.match(html, /id="claudeImportOption"/);
  assert.match(html, /id="claudeFile"/);
  assert.doesNotMatch(html, /id="claudeFiles"[^>]*multiple/);
  assert.match(app, /importClaudeOutput/);
  assert.match(app, /parseClaudeOutputText/);
  assert.match(app, /selectClaudeOutputFile/);
  assert.match(build, /"claude-import\.js"/);
  assert.match(packageJson, /claude-import\.test\.mjs/);
});
