import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const staticFiles = ["styles.css", "app-v2.js", "extractor-v2.js", "lecture-template.js", "_headers"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(staticFiles.map((file) => cp(resolve(root, file), resolve(output, file))));

const index = (await readFile(resolve(root, "index.html"), "utf8"))
  .replace('src="/app.js"', 'src="/app-v2.js"')
  .replace("Maximum 8 MB · embedded and remote images are preserved", "Up to 50 MB desktop / 20 MB mobile · adaptive safe processing");
await writeFile(resolve(output, "index.html"), index);

console.log(`Prepared ${staticFiles.length + 1} static files in dist/ with adaptive large-file support.`);
