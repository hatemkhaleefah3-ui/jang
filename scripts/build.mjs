import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const staticFiles = ["index.html", "styles.css", "app.js", "extractor.js", "lecture-template.js", "_headers"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(staticFiles.map((file) => cp(resolve(root, file), resolve(output, file))));
console.log(`Prepared ${staticFiles.length} static files in dist/`);
