import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateLecturePptx } from "../../pptx-engine.js";
import {
  renderPlanAllImages,
  renderPlanLecture,
  renderPlanSomeImages,
} from "../fixtures/render-plan-lecture.mjs";

const execFileAsync = promisify(execFile);

async function inspectResult(name, importedImages) {
  const result = await generateLecturePptx(renderPlanLecture(), importedImages, {
    strictGeometry: true,
    compression: true,
  });
  assert.ok(result.blob.size > 1000);
  assert.equal(
    result.warnings.some((warning) => warning.startsWith("Geometry:")),
    false,
    result.warnings.join("\n"),
  );

  const directory = await mkdtemp(join(tmpdir(), `jang-${name}-`));
  try {
    const path = join(directory, `${name}.pptx`);
    await writeFile(path, Buffer.from(await result.blob.arrayBuffer()));
    const { stdout: listing } = await execFileAsync("unzip", ["-Z1", path]);
    const slideNames = listing
      .split("\n")
      .filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry));
    assert.equal(slideNames.length, result.slideCount);

    let xml = "";
    for (const slideName of slideNames) {
      const { stdout } = await execFileAsync(
        "unzip",
        ["-p", path, slideName],
        { maxBuffer: 20_000_000 },
      );
      xml += stdout;
    }
    assert.match(xml, /Metabolic functions of glycine/);
    assert.match(xml, /Phenylalanine and tyrosine pathway/);
    assert.match(xml, /Evidence glycine-slot/);
    assert.match(xml, /Evidence aromatic-slot/);
    assert.match(xml, /Evidence full-slot/);
    return result;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test(
  "no, some, and all imported images share the same geometry-safe presentation plan",
  { timeout: 60000 },
  async () => {
    const noImages = await inspectResult("no-images", {});
    const partialImages = await inspectResult("some-images", renderPlanSomeImages);
    const completeImages = await inspectResult("all-images", renderPlanAllImages);

    assert.equal(partialImages.slideCount, noImages.slideCount);
    assert.equal(completeImages.slideCount, noImages.slideCount);
    assert.equal(noImages.quality.estimatedSlideCount, noImages.slideCount);
    assert.equal(partialImages.quality.estimatedSlideCount, partialImages.slideCount);
    assert.equal(completeImages.quality.estimatedSlideCount, completeImages.slideCount);
  },
);
