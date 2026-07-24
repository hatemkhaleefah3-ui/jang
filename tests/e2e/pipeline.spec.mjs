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
  const assetId = source.assets?.[0]?.id || "";
  const visual = assetId ? [emptyBlock("image", { assetId, caption: "Source pathway visual" })] : [];
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
    overview: "This lecture explains the pentose phosphate pathway as a cytosolic route that produces NADPH and ribose-5-phosphate, then connects regulation to erythrocyte protection.",
    learningObjectives: [
      "Distinguish the oxidative and nonoxidative phases.",
      "Explain how NADPH supports reduced glutathione.",
      "Relate glucose-6-phosphate dehydrogenase to pathway regulation.",
    ],
    sections: [
      {
        title: "Pentose phosphate pathway",
        category: "Core concept",
        keyTermsCritical: ["NADPH", "ribose-5-phosphate"],
        keyTermsImportant: ["cytosol"],
        blocks: [
          emptyBlock("paragraph", { text: "The pentose phosphate pathway is an alternative cytosolic route for glucose oxidation. It produces NADPH and ribose-5-phosphate without directly producing ATP." }),
          emptyBlock("bullets", { heading: "Two coordinated phases", items: ["The oxidative phase is irreversible and generates NADPH.", "The nonoxidative phase is reversible and interconverts sugar phosphates."] }),
        ],
      },
      {
        title: "Regulation and clinical significance",
        category: "Application",
        keyTermsCritical: ["glucose-6-phosphate dehydrogenase"],
        keyTermsImportant: ["glutathione", "erythrocytes"],
        blocks: [
          emptyBlock("paragraph", { text: "Glucose-6-phosphate dehydrogenase is the rate-limiting enzyme. NADPH maintains reduced glutathione and helps protect erythrocytes from oxidative damage." }),
          emptyBlock("takeaways", { heading: "Clinical connection", items: ["Reduced NADPH availability weakens antioxidant protection.", "Erythrocytes depend strongly on this pathway for glutathione reduction."] }),
          ...visual,
        ],
      },
    ],
    finalTakeaways: [
      "The pathway produces NADPH and ribose-5-phosphate.",
      "Its oxidative and nonoxidative phases have different roles.",
      "NADPH is essential for erythrocyte antioxidant defense.",
    ],
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
    await expect(page.locator("#resultMessage")).toContainText("PowerPoint ready and verified");
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
    expect(slideXml).toContain("erythrocyte");
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
  await expect(page.locator("#resultMessage")).toContainText("Browser OCR completed before redesign");
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
