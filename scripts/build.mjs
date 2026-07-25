import { access, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const staticFiles = [
  "index.html",
  "styles.css",
  "app.js",
  "pptx-engine.js",
  "pptx-output.js",
  "__vite-browser-external.js",
  "lecture-schema.json",
  "pptx-reader.js",
  "_headers",
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of staticFiles) {
  const source = resolve(root, file);
  const target = resolve(output, file);
  await access(source);
  await cp(source, target);
}

console.log(`Prepared ${staticFiles.length} static files, including the bundled editable PPTX engine, in dist.`);
