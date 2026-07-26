import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL("../../", import.meta.url));
const reportPath = join(root, "generated", "csp-scan.json");
const assetVersion = "20260726-immutable-render-plan";
const FILES = [
  "browser-compat.js",
  "file-picker-bootstrap.js",
  "app-loader.js",
  "app.js",
  "lecture-validator.js",
  "pptx-output.js",
  "pptx-engine.js",
  "pptx-reader.js",
  "__vite-browser-external.js",
];

const TOKENS = [
  ["e", "val", "("].join(""),
  ["new ", "Func", "tion("].join(""),
  ["Func", "tion(\""].join(""),
  ["Func", "tion('"] .join(""),
  [".constructor(\""].join(""),
  [".constructor('"] .join(""),
];

function lineAndContext(source, offset) {
  const line = source.slice(0, offset).split("\n").length;
  const start = Math.max(0, source.lastIndexOf("\n", offset - 1) + 1);
  const nextBreak = source.indexOf("\n", offset);
  const end = nextBreak === -1 ? source.length : nextBreak;
  return { line, context: source.slice(start, end).trim().slice(0, 500) };
}

async function writeReport(report) {
  await mkdir(join(root, "generated"), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function minimalLecture() {
  return {
    schemaVersion: "1.1",
    documentTitle: "Carbohydrate metabolism",
    direction: "ltr",
    overview: {
      title: "Overview",
      introduction: "Core pathways and regulation.",
      keyPoints: ["Glycolysis"],
    },
    sections: [{
      sectionId: "section-1",
      sectionTitle: "Glycolysis",
      slides: [{
        slideId: "slide-1",
        slideTitle: "Pathway",
        slideSubtitle: "",
        sourceReferences: ["Page 1"],
        blocks: [{
          blockId: "block-1",
          sourceReferences: ["Page 1"],
          type: "paragraph",
          text: "Glucose is converted to pyruvate.",
        }],
      }],
    }],
    endNote: "Questions",
  };
}

test("production JavaScript is CSP-safe, versioned, and importable", async () => {
  try {
    await execFileAsync(process.execPath, ["scripts/build.mjs"], { cwd: root });
  } catch (error) {
    const buildError = {
      message: error instanceof Error ? error.message : String(error),
      stdout: typeof error?.stdout === "string" ? error.stdout : "",
      stderr: typeof error?.stderr === "string" ? error.stderr : "",
    };
    await writeReport({ buildError, findings: [] });
    assert.fail(`Production build failed during CSP transformation: ${buildError.stderr || buildError.message}`);
  }

  const findings = [];
  for (const file of FILES) {
    const source = await readFile(join(root, "dist", file), "utf8");
    for (const token of TOKENS) {
      let offset = source.indexOf(token);
      while (offset !== -1) {
        const detail = lineAndContext(source, offset);
        findings.push({ file, token, line: detail.line, context: detail.context });
        offset = source.indexOf(token, offset + token.length);
      }
    }
  }

  await writeReport({ buildError: null, findings });
  assert.deepEqual(findings, [], `CSP-blocked string execution found:\n${JSON.stringify(findings, null, 2)}`);

  const indexHtml = await readFile(join(root, "dist", "index.html"), "utf8");
  const loader = await readFile(join(root, "dist", "app-loader.js"), "utf8");
  const app = await readFile(join(root, "dist", "app.js"), "utf8");
  const output = await readFile(join(root, "dist", "pptx-output.js"), "utf8");
  assert.match(indexHtml, new RegExp(`v=${assetVersion}`, "g"));
  assert.match(loader, new RegExp(`app\\.js\\?v=${assetVersion}`));
  assert.match(app, new RegExp(`pptx-output\\.js\\?v=${assetVersion}`));
  assert.match(output, new RegExp(`pptx-engine\\.js\\?v=${assetVersion}`));

  const engineUrl = `${pathToFileURL(join(root, "dist", "pptx-engine.js")).href}?test=${Date.now()}`;
  const productionEngine = await import(engineUrl);
  const validation = productionEngine.validateLecture(minimalLecture());
  assert.equal(validation.valid, true, validation.errors.join("\n"));
});
