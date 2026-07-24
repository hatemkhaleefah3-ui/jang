import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("sandboxed HTML renderer permits same-origin DOM inspection without scripts", async () => {
  const source = await readFile(new URL("../../html-pptx-exporter.js", import.meta.url), "utf8");
  assert.match(source, /setAttribute\("sandbox",\s*"allow-same-origin"\)/);
  assert.doesNotMatch(source, /setAttribute\("sandbox",\s*"allow-scripts/);
});
