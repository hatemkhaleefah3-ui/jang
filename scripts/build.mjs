import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const vendor = resolve(output, "vendor");
const pdfRoot = resolve(root, "node_modules", "pdfjs-dist");
const staticFiles = ["index.html", "styles.css", "app-v2.js", "source-importer.js", "pptx-exporter.js", "extractor-v2.js", "lecture-template.js", "_headers"];

await rm(output, { recursive: true, force: true });
await mkdir(vendor, { recursive: true });
await Promise.all(staticFiles.map((file) => cp(resolve(root, file), resolve(output, file))));
await Promise.all([
  cp(resolve(pdfRoot, "build", "pdf.min.mjs"), resolve(vendor, "pdf.min.mjs")),
  cp(resolve(pdfRoot, "build", "pdf.worker.min.mjs"), resolve(vendor, "pdf.worker.min.mjs")),
  cp(resolve(pdfRoot, "cmaps"), resolve(vendor, "cmaps"), { recursive: true }),
  cp(resolve(pdfRoot, "standard_fonts"), resolve(vendor, "standard_fonts"), { recursive: true }),
  cp(resolve(pdfRoot, "wasm"), resolve(vendor, "wasm"), { recursive: true }),
]);

console.log(`Prepared ${staticFiles.length} static files plus local PDF.js assets in dist/.`);
