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

async function deckXml() {
  const plan = emphasisPlan();
  const deck = await buildPptx(plan, []);
  const output = await deck.write({ outputType: "arraybuffer" });
  const verification = await verifyPptxPackage(output, deck._jangFidelity.manifest);
  const zip = await JSZip.loadAsync(output);
  const slidePaths = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path));
  const xml = (await Promise.all(slidePaths.map((path) => zip.file(path).async("text")))).join("\n");
  return { deck, verification, xml };
}

test("PowerPoint limits body emphasis and leaves titles and subtitles plain", async () => {
  const { deck, verification, xml } = await deckXml();

  assert.equal(verification.valid, true);
  assert.equal(deck._jangFidelity.report.highlightCount, 10);
  assert.equal(deck._jangFidelity.report.redTextCount, 5);
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
