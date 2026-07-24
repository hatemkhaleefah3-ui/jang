import { test, expect } from "@playwright/test";

test("self-hosted OCR worker reads a real page without CDN access", async ({ page }) => {
  test.setTimeout(240000);
  const externalOcrRequests = [];
  page.on("request", (request) => {
    const hostname = new URL(request.url()).hostname;
    if (/jsdelivr|projectnaptha|unpkg/i.test(hostname)) externalOcrRequests.push(request.url());
  });
  await page.route("**/api/config*", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ configured: false, environment: "test", branch: "test", turnstileSiteKey: null }),
  }));
  await page.goto("/");

  const result = await page.evaluate(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1800;
    canvas.height = 1000;
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.font = "bold 92px Arial";
    context.fillText("SCANNED LECTURE HEADING", 110, 190);
    context.font = "58px Arial";
    context.fillText("Complete scanned lecture body text.", 110, 340);
    context.fillText("NADPH protects erythrocytes.", 110, 455);
    context.fillText("Table value: 123.45 mg/dL", 110, 570);
    context.fillText("Formula: G6P -> Ru5P + NADPH", 110, 685);
    const imageData = canvas.toDataURL("image/png");
    const extraction = {
      title: "Scanned lecture",
      content: "# Page 1\n\n[ASSET:pdf-page-001]",
      batches: ["# Page 1\n\n[ASSET:pdf-page-001]"],
      assets: [{ id: "pdf-page-001", type: "image", source: imageData, sourceKind: "page-snapshot", sourcePage: 1 }],
      sourceUnits: [],
      sourcePages: [{ page: 1, title: "Page 1", assets: ["pdf-page-001"] }],
      ocrPages: [{ page: 1, assetId: "pdf-page-001", imageData }],
      warnings: ["OCR will be applied automatically to PDF page 1 before redesign."],
      extractionStatus: "ocr-required",
      verificationIssues: [{ type: "ocr-required", page: 1 }],
      stats: { originalExtractedChars: 0, extractedChars: 0, batchCount: 1, nodeCount: 1, assetCount: 1, imageCount: 1, diagramCount: 0, convertedVisualCount: 0, ocrRequiredPages: 1 },
    };
    const { applyBrowserOcr } = await import("/ocr-engine.js");
    const completed = await applyBrowserOcr(extraction, "English");
    return {
      status: completed.extractionStatus,
      issues: completed.verificationIssues,
      text: completed.sourceUnits.map((unit) => unit.text).join("\n"),
      methods: completed.sourceUnits.map((unit) => unit.extractionMethod),
    };
  });

  expect(result.status).toBe("verified-native");
  expect(result.issues).toEqual([]);
  expect(result.methods.every((method) => method === "ocr")).toBe(true);
  expect(result.text.toUpperCase()).toContain("SCANNED LECTURE HEADING");
  expect(result.text.toUpperCase()).toContain("NADPH");
  expect(result.text).toMatch(/123[.,]45/);
  expect(externalOcrRequests).toEqual([]);
});
