import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import PptxGenJS from "pptxgenjs";
import { buildPptx, verifyPptxPackage } from "../../pptx-exporter.js";

globalThis.JSZip = JSZip;
globalThis.PptxGenJS = PptxGenJS;

function emphasisPlan() {
  return {
    metadata: {
      title: "NADPH lecture title",
      subtitle: "NADPH lecture subtitle",
      courseCode: "BIO 214",
      lectureLabel: "Lecture 08",
      language: "English",
      direction: "ltr",
    },
    overview: "",
    learningObjectives: [],
    sections: [
      {
        title: "NADPH section title",
        category: "Core concept",
        keyTermsCritical: ["NADPH"],
        keyTermsImportant: ["redterm"],
        blocks: [
          {
            type: "paragraph",
            heading: "NADPH subtitle",
            text: `${Array(12).fill("NADPH").join(" ")} ${Array(7).fill("redterm").join(" ")}`,
          },
        ],
      },
      {
        title: "Source pathway",
        category: "Diagram",
        keyTermsCritical: [],
        keyTermsImportant: [],
        blocks: [
          {
            type: "diagram",
            heading: "Source diagram",
            items: ["Glucose enters", "Pyruvate forms", "ATP is produced"],
          },
          {
            type: "paragraph",
            text: "This ordinary source paragraph remains separate from the diagram.",
          },
        ],
      },
    ],
    finalTakeaways: [],
  };
}

async function deckXml(plan = emphasisPlan(), assets = []) {
  const deck = await buildPptx(plan, assets);
  const output = await deck.write({ outputType: "arraybuffer" });
  const verification = await verifyPptxPackage(output, deck._jangFidelity.manifest);
  const zip = await JSZip.loadAsync(output);
  const slidePaths = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path));
  const xml = (await Promise.all(slidePaths.map((path) => zip.file(path).async("text")))).join("\n");
  return { deck, verification, xml, output };
}

test("PowerPoint limits body emphasis and leaves titles and subtitles plain", async () => {
  const { deck, verification, xml } = await deckXml();

  assert.equal(verification.valid, true);
  assert.equal(deck._jangFidelity.report.highlightCount, 10);
  assert.equal(deck._jangFidelity.report.redTextCount, 5);
  assert.equal(deck._jangFidelity.report.minimumBodyFontPt, 17.5);
  assert.equal((xml.match(/<a:highlight>/g) || []).length, 10);
  assert.equal((xml.match(/<a:srgbClr val="922B21"/g) || []).length, 5);

  const titleRun = xml.match(/<a:r>([\s\S]*?)<a:t>NADPH section title<\/a:t>[\s\S]*?<\/a:r>/)?.[0] || "";
  const subtitleRun = xml.match(/<a:r>([\s\S]*?)<a:t>NADPH SUBTITLE[\s\S]*?<\/a:t>[\s\S]*?<\/a:r>/)?.[0] || "";
  assert.ok(titleRun);
  assert.ok(subtitleRun);
  assert.doesNotMatch(titleRun, /<a:highlight>/);
  assert.doesNotMatch(subtitleRun, /<a:highlight>/);
  assert.doesNotMatch(titleRun, /922B21/);
  assert.doesNotMatch(subtitleRun, /922B21/);
});

test("native diagram text and ordinary paragraph text both remain in the PPTX", async () => {
  const { verification, xml } = await deckXml();

  assert.equal(verification.valid, true);
  assert.match(xml, /Glucose enters/);
  assert.match(xml, /Pyruvate forms/);
  assert.match(xml, /ATP is produced/);
  assert.match(xml, /This ordinary source paragraph remains separate from the diagram\./);
});

test("original source manifest catches content omitted before final rendering", async () => {
  const petText = "The PET scan uses 18F-fluorodeoxyglucose to identify tumors with increased glucose uptake.";
  const plan = {
    metadata: { title: "Carbohydrate metabolism", courseCode: "BIO", lectureLabel: "Lecture" },
    overview: "",
    learningObjectives: [],
    sections: [{
      title: "Warburg effect",
      category: "Source slide 15",
      keyTermsCritical: [],
      keyTermsImportant: [],
      blocks: [{ type: "paragraph", text: "Cancer cells use aerobic glycolysis." }],
    }],
    finalTakeaways: [],
    sourceManifest: {
      units: [
        { id: "src_15_1_paragraph", verbatimText: "Warburg effect" },
        { id: "src_15_2_paragraph", verbatimText: "Cancer cells use aerobic glycolysis." },
        { id: "src_15_3_paragraph", verbatimText: petText },
      ],
      assets: [],
    },
  };

  const { verification } = await deckXml(plan);
  assert.equal(verification.valid, false);
  assert.deepEqual(verification.missingText, [petText]);
});

test("numbered source paragraphs and native tables remain structured", async () => {
  const plan = {
    metadata: { title: "Carbohydrate metabolism", courseCode: "BIO", lectureLabel: "Lecture" },
    overview: "",
    learningObjectives: [],
    sections: [
      {
        title: "Cori cycle",
        category: "Source slide 17",
        keyTermsCritical: [],
        keyTermsImportant: [],
        blocks: [
          { type: "paragraph", text: "1. Glucose is converted to lactate." },
          { type: "paragraph", text: "2. Lactate reaches the liver." },
          { type: "paragraph", text: "3. Glucose returns to muscle." },
        ],
      },
      {
        title: "Glycogen storage diseases",
        category: "Source slide 31",
        keyTermsCritical: [],
        keyTermsImportant: [],
        blocks: [{
          type: "table",
          headers: ["Type", "Name", "Deficient enzyme", "Clinical features"],
          rows: [
            ["Type Ia", "von Gierke disease", "Glucose-6-phosphatase", "Fasting hypoglycemia"],
            ["Type II", "Pompe disease", "Lysosomal maltase", "Cardiomyopathy"],
          ],
        }],
      },
    ],
    finalTakeaways: [],
  };

  const { verification, xml } = await deckXml(plan);
  assert.equal(verification.valid, true);
  assert.match(xml, /1\. Glucose is converted to lactate\./);
  assert.match(xml, /2\. Lactate reaches the liver\./);
  assert.match(xml, /3\. Glucose returns to muscle\./);
  assert.match(xml, /<a:tbl>/);
  assert.match(xml, /Deficient enzyme/);
  assert.match(xml, /Pompe disease/);
});
