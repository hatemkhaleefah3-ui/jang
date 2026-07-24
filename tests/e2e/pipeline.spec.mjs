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

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

function sourceId(unit, index) {
  return unit?.id || `src_${Number(unit?.page || unit?.sourcePage || 0)}_${Number(unit?.order || unit?.sourceOrder || index + 1)}_${String(unit?.kind || "paragraph").replace(/[^a-z0-9_-]+/gi, "_")}`.toLowerCase();
}

function designedPayload(source, metadata = {}, title = "Carbohydrate Metabolism") {
  const units = (source.sourceUnits || []).map((unit, index) => ({
    id: sourceId(unit, index),
    sourcePage: Number(unit?.page || unit?.sourcePage || 0),
    sourceOrder: Number(unit?.order || unit?.sourceOrder || index + 1),
    kind: unit?.kind || "paragraph",
    verbatimText: String(unit?.text || unit?.verbatimText || "").trim(),
  })).filter((unit) => unit.verbatimText);
  const assets = (source.assets || []).map((asset, index) => ({
    id: asset?.id || `asset_${index + 1}`,
    sourcePage: Number(asset?.sourcePage || 0),
    sourceOrder: Number(asset?.sourceOrder || index + 1),
    kind: asset?.type || asset?.kind || "image",
  }));
  const chunkSize = Math.max(1, Math.ceil(units.length / 4));
  const chunks = Array.from({ length: 4 }, (_, index) => units.slice(index * chunkSize, (index + 1) * chunkSize));
  const headings = ["Pentose phosphate pathway", "Regulation and clinical significance", "Pathway details", "Clinical review"];
  const pages = chunks.map((chunk, index) => `<article class="page"><header class="page-header"><span class="course-label">BIO 214</span><h2 class="page-title">${headings[index]}</h2><span class="category-tag">Concept</span></header><main class="page-body">${chunk.map((unit) => `<p data-source-id="${escapeHtml(unit.id)}">${escapeHtml(unit.verbatimText)}</p>`).join("")}${index === chunks.length - 1 ? assets.map((asset) => `<figure class="img-full-width"><img data-asset-id="${escapeHtml(asset.id)}" alt="Source visual"><figcaption>Source pathway visual</figcaption></figure>`).join("") : ""}</main><footer class="page-footer"><span class="footer-left">Lecture 08</span><span class="footer-center">${escapeHtml(title)}</span><span class="page-number">${String(index + 1).padStart(2, "0")}</span></footer></article>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>*{box-sizing:border-box}body{margin:0;background:#ccc;font-family:Arial,sans-serif}.page{width:900px;height:1170px;overflow:hidden;background:#fff;display:flex;flex-direction:column}.cover-page{background:#1e1e1c;color:#fff}.cover-hero{flex:1;padding:100px 70px}.cover-title{font-size:58px}.cover-subtitle{font-size:25px}.page-header,.page-footer{height:54px;padding:14px 28px;display:flex;justify-content:space-between;background:#e0e0db}.page-body{flex:1;padding:35px;overflow:hidden}.page-body p{font-size:18px;line-height:1.45;margin:0 0 14px}.img-full-width{margin:15px 0}.img-full-width img{display:block;width:320px;height:220px;object-fit:contain}.page-title{font-size:20px;margin:0}.cover-title{margin:0 0 25px}</style></head><body><article class="page cover-page"><main class="cover-hero"><h1 class="cover-title">${escapeHtml(title)}</h1><p class="cover-subtitle">Pentose phosphate pathway, regulation, and clinical significance</p></main></article>${pages}</body></html>`;
  return {
    html,
    manifest: { units, assets },
    metadata: { title, courseCode: metadata.courseCode || "BIO 214", lectureLabel: metadata.lectureLabel || "Lecture 08", language: "English", direction: "ltr" },
    model: "test-structured-model",
    ocr: { applied: false, pages: [] },
    verification: { valid: true, missingSourceIds: [], duplicatedSourceIds: [], unknownSourceIds: [], missingAssetIds: [], duplicatedAssetIds: [], unknownAssetIds: [], structuralErrors: [] },
  };
}

async function mockApi(page, captured) {
  await page.route("**/api/config*", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: true, model: "test-structured-model", keySource: "test", environment: "preview", branch: "test", turnstileSiteKey: null }) });
  });
  await page.route("**/api/design-html", async (route) => {
    const payload = route.request().postDataJSON();
    captured.push((payload.source.sourceUnits || []).map((unit) => unit.text || unit.verbatimText || "").join("\n"));
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(designedPayload(payload.source, payload.metadata)) });
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
  test(`${format.name} imports, previews verified HTML, and exports a complete PPTX`, async ({ page }, testInfo) => {
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
    await expect(page.locator("#resultMessage")).toContainText("PowerPoint ready from verified Gemini HTML");
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

test("image-only PDF is OCR-processed before the HTML design verification gate", async ({ page }, testInfo) => {
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
  await page.route("**/api/design-html", async (route) => {
    const payload = route.request().postDataJSON();
    capturedSource = payload.source;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(designedPayload(payload.source, payload.metadata, "Scanned OCR Lecture")) });
  });

  await page.goto("/");
  await page.locator("#fileInput").setInputFiles(resolve(fixtures, "scanned.pdf"));
  await page.locator("#processButton").click();

  await expect(page.locator("#previewShell")).toBeVisible();
  await expect(page.locator("#downloadPptxButton")).toBeEnabled();
  await expect(page.locator("#resultMessage")).toContainText("Local OCR completed before design");
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

test("AI-unavailable file conversion fails closed without offering a low-quality PowerPoint", async ({ page }) => {
  await page.route("**/api/config*", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ configured: false, environment: "preview", branch: "test", turnstileSiteKey: null }) }));
  await page.route("**/api/design-html", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "AI_NOT_CONFIGURED", environment: "preview", error: "AI unavailable in test" }) }));
  await page.goto("/");
  await page.locator("#fileInput").setInputFiles(resolve(fixtures, "lecture.html"));
  await page.locator("#processButton").click();
  await expect(page.locator("#resultMessage")).toContainText("will not generate or offer a low-quality fallback PowerPoint");
  await expect(page.locator("#previewShell")).toBeHidden();
  await expect(page.locator("#downloadPptxButton")).toBeDisabled();
});
