import { test, expect } from "@playwright/test";

const lectureText = `[SOURCE FILE]\nLec.4 Immunoglobulin.pdf\n[DOCUMENT TITLE]\nImmunoglobulin\n[TOPIC MAP]\nExact overview.\n[INFO BOX]\nLecturer: Dr. Example\n[SECTION]\nStructure\n[PARAGRAPH]\nThis paragraph must remain exactly where it appears.\n[NOTE BOX]\nThis note must remain unchanged.\n[IMAGE]\nlabel: Antibody structure\nPlace beside the paragraph.\n[TABLE]\n| Class | Chain |\n|---|---|\n| IgG | Gamma |\n[PATHWAY]\nType: linear\nA → B → C\n[QUICK REVIEW]\n- Review point.\n[FOOTER]\nEnd of lecture.`;

test("imports structured text and builds a verified editable HTML project", async ({ page }) => {
  await page.goto("/builder.html");
  await page.locator("#textFile").setInputFiles({
    name: "Lec-4-Immunoglobulin.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(lectureText, "utf8"),
  });
  await expect(page.locator("#lectureText")).toHaveValue(lectureText);
  await page.locator("#courseCode").fill("BIO");
  await page.locator("#lectureLabel").fill("Lecture 4");
  await page.locator("#buildHtml").click();

  await expect(page.locator("#status")).toContainText("No block was changed, omitted, duplicated, or reordered");
  const frame = page.frameLocator("#preview");
  await expect(frame.locator(".cover-page")).toBeVisible();
  await expect(frame.locator("[data-source-id]")).toHaveCount(12);
  await expect(frame.locator(".jang-image-placeholder + .jang-figure-label")).toHaveText("Antibody structure");
  await expect(frame.locator(".comparison-table")).toBeVisible();
  await expect(frame.locator(".jang-pathway-block")).toBeVisible();

  const width = frame.locator(".jang-image-block [data-width-control]");
  await width.evaluate((element) => {
    element.value = "35";
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(frame.locator(".jang-image-block")).toHaveAttribute("style", /--jang-width:35%/);

  await page.locator("#saveProject").click();
  await expect(page.locator("#savedProjects .saved-project")).toHaveCount(1);
  await expect(page.locator("#savedProjects")).toContainText("Immunoglobulin");
});

test("home page exposes the editable text builder", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Text → editable HTML" })).toHaveAttribute("href", "/builder.html");
});
