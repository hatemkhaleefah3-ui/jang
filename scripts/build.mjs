import { access, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const staticFiles = ["index.html", "styles.css", "app.js", "lecture-html.js", "lecture-source-parser.js", "_headers"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of staticFiles) {
  const source = resolve(root, file);
  await access(source);
  await cp(source, resolve(output, file));
}

console.log(`Prepared ${staticFiles.length} static files in dist/.`);
