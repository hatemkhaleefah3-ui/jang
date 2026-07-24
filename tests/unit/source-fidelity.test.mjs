import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { createFallbackPlan } from "../../fallback-plan.js";
import { createFidelityManifest, verifyPptxPackage } from "../../pptx-exporter.js";

function allPlanText(plan) {
  const values = [];
  for (const section of plan.sections || []) {
    values.push(section.title || "");
    for (const block of section.blocks || []) {
      values.push(block.heading || "", block.text || "");
      values.push(...(block.items || []));
      values.push(...(block.headers || []));
      for (const row of block.rows || []) values.push(...row);
    }
  }
  return values.join("\n");
}

test("source-preserving fallback keeps pages, numbering, tables, and image-only slides", () => {
  const extraction = {
    title: "Carbohydrate metabolism",
    sourcePages: [
      { page: 1, title: "Carbohydrate metabolism", assets: [] },
      { page: 2, title: "CORI'S CYCLE OR LACTIC ACID CYCLE", assets: [] },
      { page: 3, title: "Slide 3", assets: [] },
      { page: 4, title: "types", assets: [] },
      { page: 5, title: "Slide 5", assets: ["image-001"] },
    ],
    sourceUnits: [
      { page: 1, order: 1, kind: "paragraph", role: "title", text: "Carbohydrate metabolism" },
      { page: 2, order: 1, kind: "paragraph", role: "title", text: "CORI'S CYCLE OR LACTIC ACID CYCLE" },
      { page: 2, order: 2, kind: "paragraph", text: "1. Glucose is converted to lactate in muscle." },
      { page: 2, order: 3, kind: "paragraph", text: "2. Lactate reaches the liver." },
      { page: 2, order: 4, kind: "paragraph", text: "3. Glucose returns to muscle." },
      { page: 3, order: 1, kind: "paragraph", text: "6. Transaldolase catalyzes transfer of a three carbon group without losing the rest of this sentence." },
      { page: 3, order: 2, kind: "paragraph", text: "7. Transketolase transfers two carbon units." },
      { page: 4, order: 1, kind: "paragraph", role: "title", text: "types" },
      { page: 4, order: 2, kind: "paragraph", text: "Type        Name           Deficient enzyme           Clinical features" },
      { page: 4, order: 3, kind: "paragraph", text: "Type Ia       von Gierke's disease        Glucose-6-phosphatase                Fasting hypoglycemia; hepatomegaly" },
      { page: 4, order: 4, kind: "paragraph", text: "                                                                                                          heart and muscle; death before 2 years" },
      { page: 4, order: 5, kind: "paragraph", text: "Type III    Limit dextrinosis          Debranching enzyme                   Highly branched dextrin accumulates;" },
      { page: 4, order: 6, kind: "paragraph", text: "                  Cori's disease                                                                  Fasting hypoglycemia; hepatomegaly" },
    ],
    assets: [{ id: "image-001", occurrenceId: "occ-p005-001", type: "image", sourcePage: 5, caption: "Converted from EMF" }],
  };

  const plan = createFallbackPlan(extraction, { courseCode: "BIO 214", lectureLabel: "Lecture 08" });
  assert.equal(plan.sections.length, 4, "the source cover becomes the redesigned cover while every remaining source page stays represented");
  assert.equal(plan.sections[1].title, "CORI'S CYCLE OR LACTIC ACID CYCLE — continued");
  assert.match(allPlanText(plan), /1\. Glucose is converted/);
  assert.match(allPlanText(plan), /2\. Lactate reaches/);
  assert.match(allPlanText(plan), /3\. Glucose returns/);
  assert.match(allPlanText(plan), /without losing the rest of this sentence/);

  const table = plan.sections[2].blocks.find((block) => block.type === "table");
  assert.ok(table, "fixed-width source text should become a native table");
  assert.deepEqual(table.headers, ["Type", "Name", "Deficient enzyme", "Clinical features"]);
  assert.equal(table.rows[0][3], "Fasting hypoglycemia; hepatomegaly heart and muscle; death before 2 years");
  assert.equal(table.rows[1][1], "Limit dextrinosis Cori's disease");
  assert.equal(table.rows[1][3], "Highly branched dextrin accumulates; Fasting hypoglycemia; hepatomegaly");

  const image = plan.sections[3].blocks.find((block) => block.assetId === "image-001");
  assert.ok(image, "image-only slides must remain in the plan");
  assert.equal(image.caption, "", "technical conversion captions must not be user-visible");
  assert.equal(plan.sourceManifest.units.length, extraction.sourceUnits.length);
  assert.equal(plan.sourceManifest.assets.length, 1);
});

test("fidelity manifest is based on original extraction rather than the generated layout", () => {
  const plan = {
    sections: [{ title: "Generated", blocks: [{ type: "paragraph", text: "Only one visible unit" }] }],
    sourceManifest: {
      units: [
        { id: "src_1", sourcePage: 1, verbatimText: "Only one visible unit" },
        { id: "src_2", sourcePage: 2, verbatimText: "The missing PET scan explanation" },
      ],
      assets: [{ id: "image-001", occurrenceId: "occ-p002-001" }],
    },
  };
  const manifest = createFidelityManifest(plan, [{ id: "image-001", type: "image", source: "data:image/png;base64,AA==" }]);
  assert.equal(manifest.sourceUnits.length, 2);
  assert.equal(manifest.expectedAssets.length, 1);
  assert.equal(manifest.sourceUnits[1].text, "The missing PET scan explanation");
});

test("PPTX verification reports missing original units and image occurrences", async () => {
  globalThis.JSZip = JSZip;
  const manifest = {
    sourceUnits: [
      { id: "src_1", page: 1, text: "Visible source sentence" },
      { id: "src_2", page: 2, text: "Missing source sentence" },
    ],
    expectedAssets: ["image-001"],
  };

  const incomplete = new JSZip();
  incomplete.file("ppt/slides/slide1.xml", '<p:sld xmlns:p="p" xmlns:a="a"><p:sp><a:p><a:r><a:t>Visible source sentence</a:t></a:r></a:p></p:sp></p:sld>');
  const incompleteResult = await verifyPptxPackage(await incomplete.generateAsync({ type: "arraybuffer" }), manifest);
  assert.equal(incompleteResult.valid, false);
  assert.deepEqual(incompleteResult.missingSourceUnits.map((unit) => unit.id), ["src_2"]);
  assert.deepEqual(incompleteResult.missingAssets, ["image-001"]);

  const complete = new JSZip();
  complete.file("ppt/slides/slide1.xml", '<p:sld xmlns:p="p" xmlns:a="a" xmlns:r="r"><p:sp><a:p><a:r><a:t>Visible source sentence</a:t></a:r></a:p><a:p><a:r><a:t>Missing source sentence</a:t></a:r></a:p></p:sp><p:pic><p:nvPicPr><p:cNvPr id="2" name="JANG_ASSET:image-001" descr="JANG_ASSET:image-001"/></p:nvPicPr><p:blipFill><a:blip r:embed="rId1"/></p:blipFill></p:pic></p:sld>');
  complete.file("ppt/media/image1.png", new Uint8Array([1, 2, 3]));
  const completeResult = await verifyPptxPackage(await complete.generateAsync({ type: "arraybuffer" }), manifest);
  assert.equal(completeResult.valid, true);
  assert.equal(completeResult.missingSourceUnits.length, 0);
  assert.equal(completeResult.missingAssets.length, 0);
});
