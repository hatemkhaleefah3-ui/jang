import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import JSZip from "jszip";

const fixtures = resolve("tests", "fixtures");
const formats = [
  { name: "HTML", path: resolve(fixtures, "lecture.html") },
  { name: "PPTX", path: resolve(fixtures, "lecture.pptx") },
  { name: "PDF", path: resolve(fixtures, "lecture.pdf") },
];

const emptyBlock = (type, values = {}) => ({
  type, heading: "", text: "", label: "", items: [], pairs: [], headers: [], rows: [],
  assetId: "", caption: "", alt: "", question: "", answer: "", ...values,
});

function educationalPlan(source) {
  const units = Array.isArray(source.sourceUnits) ? source.sourceUnits.filter((unit) => unit?.text) : [];
  const chunkSize = Math.max(1, Math.ceil(units.length / 4));
  const sections = [];
  for (let offset = 0, index = 0; offset < units.length; offset += chunkSize, index += 1) {
    const chunk = units.slice(offset, offset + chunkSize);
    const titles = ["Pentose phosphate pathway", "Regulation and clinical significance", "Pathway details", "Clinical review"];
    sections.push({
      title: titles[index] || `Source content ${index + 1}`,
      category: index === 1 ? "Application" : "Core concept",
      keyTermsCritical: index === 0 ? ["NADPH", "ribose-5-phosphate"] : [],
      keyTermsImportant: index === 1 ? ["glutathione", "erythrocytes"] : [],
      blocks: chunk.map((unit) => emptyBlock("paragraph", { text: unit.text })),
    });
  }
  if (!sections.length) sections.push({ title: "Pentose phosphate pathway", category: "Core concept", keyTermsCritical: [], keyTermsImportant: [], blocks: [emptyBlock("paragraph", { text: source.batches?.join("\n") || "Lecture content" })] });
  const last = sections.at(-1);
  for (const asset of source.assets || []) last.blocks.push(emptyBlock("image", { assetId: asset.id, caption: "Source pathway visual" }));

  return {
    metadata: {
      title: "Carbohydrate Metabolism",
      subtitle: "Pentose phosphate pathway, regulation, and clinical significance",
      courseCode: "BIO 214",
      lectureLabel: "Lecture 08",
      instructor: "",
      language: "English",
      direction: "ltr",
    },
    overview: "",
    learningObjectives: [],
    sections,
    finalTakeaways: [],
  };
}

async function mockApi(page, captured) {
  await page.route("**/api/config*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ configured: true, model: "test-structured-model", keySource: "test", environment: "preview", branch: "test", turnstileSiteKey: null }),
    });
  });
  await page.route("**/api/redesign", async (route) => {
    const payload = route.request().postDataJSON();
    captured.push(payload.source.batches.join("\n"));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        plan: educationalPlan(payload.source),
        model: "test-structured-model",
        ocr: { applied: false, pages: [] },
        verification: {
          valid: true,
          expectedSourceCount: payload.source.sourceUnits?.length || payload.source.batches.length,
          referencedSourceCount: payload.source.sourceUnits?.length || payload.source.batches.length,
          expectedAssetCount: payload.source.assets?.length || 0,
          referencedAssetCount: payload.source.assets?.length || 0,
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
  await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
}

async function inspectPptx(path) {
  const zip = await JSZip.loadAsync(await readFile(path));
  const slidePaths = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  const slideXml = (await Promise.all(slidePaths.map((name) => zip.file(name).async("text")))).join("\n");
  return { zip, slidePaths, slideXml };
}

for (const format of formats) {
  test(`${format.name} imports, restructures, previews, and exports a complete PPTX`, async ({ page }, testInfo) => {
    const captured = [];
    await mockApi(page, captured);
    await page.goto("/");
    await page.locator("#fileInput").setInputFiles(format.path);
    await page.locator("#courseCode").fill("BIO 214");
    await page.locator("#lectureLabel").fill("Lecture 08");
    await page.locator("#processButton").click();

    await expect(page.locator("#previewShell")).toBeVisible();
    await expect(page.locator("#downloadPptxButton")).toBeEnabled();
    await expect(page.locator(".toolbar-actions button")).toHaveCount(1);
    await expect(page.locator("#resultMessage")).toContainText("PowerPoint ready and source-verified");
    expect(captured.join(" ")).toContain("NADPH");

    const preview = page.frameLocator("#previewFrame");
    await expect(preview.locator("body")).toContainText("Pentose phosphate pathway");
    await expect(preview.locator("body")).toContainText("Regulation and clinical significance");
    await expect(preview.locator("body")).not.toContainText("Next concept");

    const downloadPromise = page.waitForEvent("download");
    await page.locator("#downloadPptxButton").click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("Carbohydrate-Metabolism.pptx");
    const savedPath = testInfo.outputPath(`${format.name.toLowerCase()}-educational-output.pptx`);
    await download.saveAs(savedPath);

    const { zip, slidePaths, slideXml } = await inspectPptx(savedPath);
    expect(zip.file("[Content_Types].xml")).toBeTruthy();
    expect(slidePaths.length).toBeGreaterThanOrEqual(5);
    expect(slideXml).toContain("Carbohydrate Metabolism");
    expect(slideXml).toContain("Pentose phosphate pathway");
    expect(slideXml).toContain("Regulation and clinical significance");
    expect(slideXml.toLowerCase()).toContain("erythrocyte");
  });
}

test("image-only PDF is OCR-processed before the redesign verification gate", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    globalThis.__jangTesseract = {
      createWorker: async () => ({
        setParameters: async () => undefined,
        recognize: async () => ({ data: { text: "Scanned lecture heading\nComplete scanned lecture body text.", confidence: 98 } }),
        terminate: async () => undefined,
      }),
    };
  });

  let capturedSource;
  await page.route("**/api/config*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: true, model: "test-structured-model", environment: "preview", branch: "test", turnstileSiteKey: null }) }));
  await page.route("**/api/redesign", async (route) => {
    const payload = route.request().postDataJSON();
    capturedSource = payload.source;
    const exactText = payload.source.sourceUnits.map((unit) => unit.text).join("\n");
    const assetId = payload.source.assets[0]?.id || "";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        plan: {
          metadata: { title: "Scanned OCR Lecture", courseCode: "OCR", lectureLabel: "Lecture", language: "English", direction: "ltr" },
          overview: "",
          learningObjectives: [],
          sections: [{ title: "Scanned source", category: "OCR", keyTermsCritical: [], keyTermsImportant: [], blocks: [emptyBlock("paragraph", { text: exactText }), ...(assetId ? [emptyBlock("image", { assetId, caption: "Original scanned page" })] : [])] }],
          finalTakeaways: [],
        },
        model: "test-structured-model",
        ocr: { applied: false, pages: [] },
        verification: { valid: true, missingSourceIds: [], duplicatedSourceIds: [], unknownSourceIds: [], missingAssetIds: [], duplicatedAssetIds: [], unknownAssetIds: [], structuralErrors: [] },
      }),
    });
  });

  await page.goto("/");
  await page.locator("#fileInput").setInputFiles(resolve(fixtures, "scanned.pdf"));
  await page.locator("#processButton").click();

  await expect(page.locator("#previewShell")).toBeVisible();
  await expect(page.locator("#downloadPptxButton")).toBeEnabled();
  await expect(page.locator("#resultMessage")).toContainText("Local OCR completed before redesign");
  expect(capturedSource.extractionStatus).toBe("verified-native");
  expect(capturedSource.ocrPages).toEqual([]);
  expect(capturedSource.sourceUnits.some((unit) => unit.text === "Scanned lecture heading" && unit.extractionMethod === "ocr")).toBe(true);

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#downloadPptxButton").click();
  const download = await downloadPromise;
  const savedPath = testInfo.outputPath("scanned-ocr-output.pptx");
  await download.saveAs(savedPath);
  const { slideXml } = await inspectPptx(savedPath);
  expect(slideXml).toContain("Scanned lecture heading");
  expect(slideXml).toContain("Complete scanned lecture body text.");
});

test("local fallback produces one downloadable PowerPoint without fragment pages", async ({ page }) => {
  await page.route("**/api/config*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, environment: "preview", branch: "test", turnstileSiteKey: null }) }));
  await page.route("**/api/redesign", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "AI_NOT_CONFIGURED", environment: "preview", error: "AI unavailable in test" }) }));
  await page.goto("/");
  await page.locator("#fileInput").setInputFiles(resolve(fixtures, "lecture.html"));
  await page.locator("#processButton").click();
  await expect(page.locator("#previewShell")).toBeVisible();
  await expect(page.locator("#downloadPptxButton")).toBeEnabled();
  await expect(page.locator(".toolbar-actions button")).toHaveCount(1);
  const preview = page.frameLocator("#previewFrame");
  await expect(preview.locator("body")).toContainText("Pentose Phosphate Pathway");
  await expect(preview.locator("body")).not.toContainText("Next concept");
});
