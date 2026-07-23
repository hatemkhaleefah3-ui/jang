import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const vendor = resolve(output, "vendor");
const pdfRoot = resolve(root, "node_modules", "pdfjs-dist");
const staticFiles = ["index.html", "styles.css", "app-v2.js", "source-importer.js", "fallback-plan.js", "pptx-exporter.js", "lecture-template.js", "_headers"];

await rm(output, { recursive: true, force: true });
await mkdir(vendor, { recursive: true });
await Promise.all(staticFiles.map((file) => cp(resolve(root, file), resolve(output, file))));

const extractor = (await readFile(resolve(root, "extractor-v2.js"), "utf8"))
  .replace(/clone\.removeAttribute\(attr\.name\)/g, "node.removeAttribute(attr.name)");
await writeFile(resolve(output, "extractor-v2.js"), extractor);

await Promise.all([
  cp(resolve(root, "node_modules", "jszip", "dist", "jszip.min.js"), resolve(vendor, "jszip.min.js")),
  cp(resolve(root, "node_modules", "pptxgenjs", "dist", "pptxgen.bundle.js"), resolve(vendor, "pptxgen.bundle.js")),
  cp(resolve(pdfRoot, "legacy", "build", "pdf.min.mjs"), resolve(vendor, "pdf.min.mjs")),
  cp(resolve(pdfRoot, "legacy", "build", "pdf.worker.min.mjs"), resolve(vendor, "pdf.worker.min.mjs")),
  cp(resolve(pdfRoot, "cmaps"), resolve(vendor, "cmaps"), { recursive: true }),
  cp(resolve(pdfRoot, "standard_fonts"), resolve(vendor, "standard_fonts"), { recursive: true }),
  cp(resolve(pdfRoot, "wasm"), resolve(vendor, "wasm"), { recursive: true }),
]);

console.log(`Prepared ${staticFiles.length + 1} static files plus local JSZip, PptxGenJS, and legacy PDF.js assets in dist/.`);
