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
        sourcePage: 1,
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
        sourcePage: 2,
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
  return { deck, verification, xml };
}

test("PowerPoint limits body emphasis and leaves titles and subtitles plain", async () => {
  const { deck, verification, xml } = await deckXml();

  assert.equal(verification.valid, true);
  assert.equal(deck._jangFidelity.report.highlightCount, 10);
  assert.equal(deck._jangFidelity.report.redTextCount, 5);
  assert.equal(deck._jangFidelity.report.minimumBodyFontSize, 16.5);
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

test("package verification is grounded in the immutable source manifest", async () => {
  const plan = {
    metadata: { title: "Manifest test", courseCode: "BIO", lectureLabel: "Lecture" },
    sections: [{ sourcePage: 1, title: "Visible content", category: "Lecture", blocks: [{ type: "paragraph", text: "Visible source sentence." }] }],
    sourceManifest: {
      units: [
        { id: "src_1", kind: "paragraph", sourcePage: 1, verbatimText: "Visible source sentence." },
        { id: "src_2", kind: "paragraph", sourcePage: 1, verbatimText: "This original sentence was omitted from the plan." },
      ],
      assets: [],
    },
  };

  const { verification } = await deckXml(plan);
  assert.equal(verification.valid, false);
  assert.ok(verification.missingText.some((value) => value.includes("original sentence was omitted")));
});

test("technical conversion labels are not shown as lecture captions", async () => {
  const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZpYQAAAAASUVORK5CYII=";
  const plan = {
    metadata: { title: "Image test", courseCode: "BIO", lectureLabel: "Lecture" },
    sections: [{ sourcePage: 1, title: "Source visual", category: "Lecture", blocks: [{ type: "image", assetId: "image-001", caption: "Converted from EMF" }] }],
    sourceManifest: { units: [], assets: [{ id: "image-001", sourcePage: 1 }] },
  };
  const assets = [{ id: "image-001", type: "image", source: png, caption: "Converted from EMF", sourcePage: 1 }];
  const { verification, xml } = await deckXml(plan, assets);

  assert.equal(verification.valid, true);
  assert.doesNotMatch(xml, /Converted from EMF/i);
});
