import test from "node:test";
import assert from "node:assert/strict";
import { convertOfficeVisual } from "../../source-importer.js";

test("EMF and WMF visuals are converted to PowerPoint-safe PNG", async () => {
  const png = "data:image/png;base64,AAAA";
  let emfCalls = 0;
  let wmfCalls = 0;
  const converter = {
    convertEmfToDataUrl: async () => { emfCalls += 1; return png; },
    convertWmfToDataUrl: async () => { wmfCalls += 1; return png; },
  };

  assert.equal(await convertOfficeVisual(new ArrayBuffer(8), "ppt/media/image1.emf", { converter }), png);
  assert.equal(await convertOfficeVisual(new ArrayBuffer(8), "ppt/media/image2.wmf", { converter }), png);
  assert.equal(emfCalls, 1);
  assert.equal(wmfCalls, 1);
});

test("visual conversion fails closed when the converter cannot produce PNG", async () => {
  const result = await convertOfficeVisual(new ArrayBuffer(8), "ppt/media/image1.emf", {
    converter: { convertEmfToDataUrl: async () => "data:image/jpeg;base64,AAAA" },
  });
  assert.equal(result, null);
});
