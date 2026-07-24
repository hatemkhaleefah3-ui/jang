import test from "node:test";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { verifyPptxPackage } from "../../pptx-exporter.js";

globalThis.JSZip = JSZip;

async function packageBuffer({ text = [], mediaCount = 0, paragraphXml = "" }) {
  const zip = new JSZip();
  const paragraphs = paragraphXml || text.map((value) => `<a:p><a:r><a:rPr lang="en-US"/><a:t>${value}</a:t></a:r><a:endParaRPr lang="en-US"/></a:p>`).join("");
  const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="TextBox 1"/>
          <p:cNvSpPr txBox="1"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${paragraphs}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
  zip.file("ppt/slides/slide1.xml", slideXml);
  for (let index = 0; index < mediaCount; index += 1) {
    zip.file(`ppt/media/image${index + 1}.png`, new Uint8Array([137, 80, 78, 71]));
  }
  return zip.generateAsync({ type: "arraybuffer" });
}

test("accepts a package containing all expected text and media", async () => {
  const buffer = await packageBuffer({ text: ["ATP synthase", "proton gradient"], mediaCount: 2 });
  const result = await verifyPptxPackage(buffer, {
    sourceText: ["ATP synthase", "proton gradient"],
    expectedAssets: ["img_1", "img_2"],
  });
  assert.equal(result.valid, true);
  assert.equal(result.embeddedMediaCount, 2);
});

test("preserves adjacency across styled runs and punctuation", async () => {
  const buffer = await packageBuffer({
    paragraphXml: `<a:p><a:r><a:t xml:space="preserve">It produces </a:t></a:r><a:r><a:rPr b="1"><a:highlight><a:srgbClr val="F5E642"/></a:highlight></a:rPr><a:t>NADPH</a:t></a:r><a:r><a:t>.</a:t></a:r></a:p>`,
  });
  const result = await verifyPptxPackage(buffer, {
    sourceText: ["It produces NADPH."],
    expectedAssets: [],
  });
  assert.equal(result.valid, true);
  assert.deepEqual(result.missingText, []);
});

test("reports missing text and media", async () => {
  const buffer = await packageBuffer({ text: ["ATP synthase"], mediaCount: 0 });
  const result = await verifyPptxPackage(buffer, {
    sourceText: ["ATP synthase", "proton gradient"],
    expectedAssets: ["img_1"],
  });
  assert.equal(result.valid, false);
  assert.deepEqual(result.missingText, ["proton gradient"]);
  assert.equal(result.expectedMediaCount, 1);
});
