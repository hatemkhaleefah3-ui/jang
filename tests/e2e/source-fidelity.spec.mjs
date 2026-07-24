import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import JSZip from "jszip";

const fixture = resolve("tests", "fixtures", "source-fidelity.pptx");

const emptyBlock = (type, values = {}) => ({
  type,
  heading: "",
  text: "",
  label: "",
  items: [],
  pairs: [],
  headers: [],
  rows: [],
  assetId: "",
  caption: "",
  alt: "",
  question: "",
  answer: "",
  ...values,
});

async function inspectPptx(path) {
  const zip = await JSZip.loadAsync(await readFile(path));
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  const slideXml = (await Promise.all(slidePaths.map((name) => zip.file(name).async("text")))).join("\n");
  const mediaPaths = Object.keys(zip.files).filter((name) => /^ppt\/media\/[^/]+$/.test(name) && !zip.files[name]?.dir);
  return { slidePaths, slideXml, mediaPaths };
}

test("lossy AI layout is rejected and rebuilt from every original PPTX source unit", async ({ page }, testInfo) => {
  await page.route("**/api/config*", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ configured: true, model: "test-lossy-model", environment: "preview", branch: "test", turnstileSiteKey: null }),
  }));

  await page.route("**/api/redesign", async (route) => {
    const payload = route.request().postDataJSON();
    const firstUnit = payload.source.sourceUnits.find((unit) => unit.text)?.text || "Carbohydrate metabolism";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        plan: {
          metadata: { title: "Carbohydrate metabolism", courseCode: "BIO", lectureLabel: "Lecture", language: "English", direction: "ltr" },
          overview: "",
          learningObjectives: [],
          sections: [{
            title: "Incomplete AI result",
            category: "Concept",
            keyTermsCritical: [],
            keyTermsImportant: [],
            blocks: [emptyBlock("paragraph", { text: firstUnit })],
          }],
          finalTakeaways: [],
        },
        model: "test-lossy-model",
        ocr: { applied: false, pages: [] },
        verification: {
          valid: true,
          missingSourceIds: [],
          duplicatedSourceIds: [],
          unknownSourceIds: [],
          missingAssetIds: [],
          duplicatedAssetIds: [],
          unknownAssetIds: [],
          structuralErrors: [],
        },
      }),
    });
  });

  await page.goto("/");
  await page.locator("#fileInput").setInputFiles(fixture);
  await page.locator("#processButton").click();

  await expect(page.locator("#previewShell")).toBeVisible({ timeout: 120_000 });
  await expect(page.locator("#downloadPptxButton")).toBeEnabled();
  await expect(page.locator("#resultMessage")).toContainText("source-faithful PowerPoint was created");
  await expect(page.locator("#resultMessage")).toContainText("AI layout failed source-fidelity verification");
  await expect(page.locator("#resultMessage")).toContainText("body text ≥ 16.5 pt");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#downloadPptxButton").click();
  const download = await downloadPromise;
  const savedPath = testInfo.outputPath("source-fidelity-recovered.pptx");
  await download.saveAs(savedPath);

  const { slidePaths, slideXml, mediaPaths } = await inspectPptx(savedPath);
  expect(slidePaths.length).toBeGreaterThanOrEqual(7);
  expect(slideXml).toContain("The Warburg effect allows for cancer tumor detection with PET scans");
  expect(slideXml).toContain("6. Transaldolase catalyzes the transfer of a three carbon dihydroxyacetone group");
  expect(slideXml).toContain("glyceraldehyde-3-phosphate to form fructose-6-phosphate and erythrose-4-phosphate");
  expect(slideXml).toContain("1. Glucose is converted to lactate");
  expect(slideXml).toContain("2. Pyruvate is reduced to lactic acid");
  expect(slideXml).toContain("3. The body uses Cori");
  expect(slideXml).toContain("4. Lactate reaches the liver");
  expect(slideXml).toContain("5. The lactate produced in muscle");
  expect(slideXml).toContain("<a:tbl>");
  expect(slideXml).toContain("von Gierke");
  expect(slideXml).toContain("JANG_ASSET:image-001");
  expect(slideXml).not.toContain("Converted from EMF");
  expect(mediaPaths.length).toBeGreaterThanOrEqual(1);
});
