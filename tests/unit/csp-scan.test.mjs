import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const FILES = [
  "browser-compat.js",
  "file-picker-bootstrap.js",
  "app-loader.js",
  "app.js",
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

test("deployed JavaScript avoids CSP-blocked string execution", async () => {
  const findings = [];

  for (const file of FILES) {
    const source = await readFile(new URL(`../../${file}`, import.meta.url), "utf8");
    for (const token of TOKENS) {
      let offset = source.indexOf(token);
      while (offset !== -1) {
        const detail = lineAndContext(source, offset);
        findings.push({ file, token, line: detail.line, context: detail.context });
        offset = source.indexOf(token, offset + token.length);
      }
    }
  }

  await mkdir(new URL("../../generated/", import.meta.url), { recursive: true });
  await writeFile(
    new URL("../../generated/csp-scan.json", import.meta.url),
    `${JSON.stringify({ findings }, null, 2)}\n`,
    "utf8",
  );

  assert.deepEqual(findings, [], `CSP-blocked string execution found:\n${JSON.stringify(findings, null, 2)}`);
});
