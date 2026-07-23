import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { verifyPptxPackage } from "../../pptx-exporter.js";

globalThis.JSZip = JSZip;

async function packageBuffer({ text = [], mediaCount = 0 }) {
  const zip = new JSZip();
  zip.file("ppt/slides/slide1.xml", `<p:sld xmlns:p="p" xmlns:a="a"><p:cSld><p:spTree><p:sp><p:txBody>${text.map((value) => `<a:p><a:r><a:t>${value}</a:t></a:r></a:p>`).join("")}</p:txBody></p:sp></p:spTree></p:cSld></p:sld>`);
  for (let index = 0; index < mediaCount; index += 1) zip.file(`ppt/media/image${index + 1}.png`, new Uint8Array([137, 80, 78, 71]));
  return zip.generateAsync({ type: "arraybuffer" });
}

test("accepts a package containing all expected text and media", async () => {
  const buffer = await packageBuffer({ text: ["ATP synthase", "proton gradient"], mediaCount: 2 });
  const result = await verifyPptxPackage(buffer, { sourceText: ["ATP synthase", "proton gradient"], expectedAssets: ["img_1", "img_2"] });
  assert.equal(result.valid, true);
  assert.equal(result.embeddedMediaCount, 2);
});

test("reports missing text and media", async () => {
  const buffer = await packageBuffer({ text: ["ATP synthase"], mediaCount: 0 });
  const result = await verifyPptxPackage(buffer, { sourceText: ["ATP synthase", "proton gradient"], expectedAssets: ["img_1"] });
  assert.equal(result.valid, false);
  assert.deepEqual(result.missingText, ["proton gradient"]);
  assert.equal(result.expectedMediaCount, 1);
});
