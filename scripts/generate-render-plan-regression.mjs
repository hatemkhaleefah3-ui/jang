import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { generateLecturePptx } from "../pptx-engine.js";
import {
  renderPlanAllImages,
  renderPlanLecture,
  renderPlanSomeImages,
} from "../tests/fixtures/render-plan-lecture.mjs";

const outputDirectory = resolve(import.meta.dirname, "..", "generated");
await mkdir(outputDirectory, { recursive: true });

const modes = [
  ["no-images", {}],
  ["some-images", renderPlanSomeImages],
  ["all-images", renderPlanAllImages],
];

const report = [];
for (const [name, importedImages] of modes) {
  const result = await generateLecturePptx(renderPlanLecture(), importedImages, {
    strictGeometry: true,
    compression: true,
  });
  const geometryWarnings = result.warnings.filter((warning) => warning.startsWith("Geometry:"));
  if (geometryWarnings.length > 0) {
    throw new Error(`${name} produced geometry warnings:\n${geometryWarnings.join("\n")}`);
  }

  const path = resolve(outputDirectory, `amino-acids-render-plan-${name}.pptx`);
  await writeFile(path, Buffer.from(await result.blob.arrayBuffer()));
  report.push({
    mode: name,
    slideCount: result.slideCount,
    estimatedSlideCount: result.quality.estimatedSlideCount,
    warningCount: result.warnings.length,
    warnings: result.warnings,
    file: path,
  });
}

const slideCounts = new Set(report.map((entry) => entry.slideCount));
if (slideCounts.size !== 1) {
  throw new Error(`Image modes changed the slide plan: ${JSON.stringify(report, null, 2)}`);
}
if (report.some((entry) => entry.estimatedSlideCount !== entry.slideCount)) {
  throw new Error(`Quality slide count disagrees with generated output: ${JSON.stringify(report, null, 2)}`);
}

const complete = report.find((entry) => entry.mode === "all-images");
if (!complete || complete.warnings.length > 0) {
  throw new Error(`The complete-image deck must be warning-free: ${JSON.stringify(complete, null, 2)}`);
}

const reportPath = resolve(outputDirectory, "amino-acids-render-plan-report.json");
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
