import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL("../../", import.meta.url));
const reportPath = join(root, "generated", "csp-scan.json");
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

test("production JavaScript avoids CSP-blocked string execution", async () => {
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
});
