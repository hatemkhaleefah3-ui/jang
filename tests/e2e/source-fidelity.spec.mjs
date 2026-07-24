import { test, expect } from "@playwright/test";
import { resolve } from "node:path";

const fixture = resolve("tests", "fixtures", "source-fidelity.pptx");

test("lossy HTML design is rejected and cannot be exported", async ({ page }) => {
  await page.route("**/api/config*", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ configured: true, model: "test-lossy-model", environment: "preview", branch: "test", turnstileSiteKey: null }),
  }));

  await page.route("**/api/design-html", async (route) => {
    const payload = route.request().postDataJSON();
    const sourceCount = payload.source.sourceUnits?.length || 0;
    await route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        code: "HTML_DESIGN_REJECTED",
        error: `HTML design rejected: ${Math.max(1, sourceCount - 1)} source units were missing.`,
        verification: {
          valid: false,
          missingSourceIds: (payload.source.sourceUnits || []).slice(1).map((unit, index) => unit.id || `missing-${index + 1}`),
          duplicatedSourceIds: [],
          unknownSourceIds: [],
          missingAssetIds: [],
          duplicatedAssetIds: [],
          unknownAssetIds: [],
          structuralErrors: ["Source fidelity verification failed."],
        },
      }),
    });
  });

  await page.goto("/");
  await page.locator("#fileInput").setInputFiles(fixture);
  await page.locator("#processButton").click();

  await expect(page.locator("#resultMessage")).toContainText("HTML design rejected");
  await expect(page.locator("#previewShell")).toBeHidden();
  await expect(page.locator("#downloadPptxButton")).toBeDisabled();
  await expect(page.locator("#resultTitle")).toHaveText("Waiting for a lecture");
});
