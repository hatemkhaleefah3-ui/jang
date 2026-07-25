import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL("../../", import.meta.url));
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

test("production JavaScript avoids CSP-blocked string execution", async () => {
  await execFileAsync(process.execPath, ["scripts/build.mjs"], { cwd: root });
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

  await mkdir(join(root, "generated"), { recursive: true });
  await writeFile(
    join(root, "generated", "csp-scan.json"),
    `${JSON.stringify({ findings }, null, 2)}\n`,
    "utf8",
  );

  assert.deepEqual(findings, [], `CSP-blocked string execution found:\n${JSON.stringify(findings, null, 2)}`);
});
