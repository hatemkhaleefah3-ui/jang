import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const vendor = resolve(output, "vendor");
const pdfRoot = resolve(root, "node_modules", "pdfjs-dist");
const staticFiles = ["index.html", "styles.css", "app-v2.js", "source-importer.js", "fallback-plan.js", "pptx-exporter.js", "lecture-template.js", "_headers"];

async function copyRequired(source, destination, options) {
  await access(source);
  await cp(source, destination, options);
}

async function copyOptional(source, destination, options) {
  try {
    await access(source);
    await cp(source, destination, options);
    return true;
  } catch {
    return false;
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(vendor, { recursive: true });
await Promise.all(staticFiles.map((file) => copyRequired(resolve(root, file), resolve(output, file))));

const extractor = (await readFile(resolve(root, "extractor-v2.js"), "utf8"))
  .replace(/clone\.removeAttribute\(attr\.name\)/g, "node.removeAttribute(attr.name)");
await writeFile(resolve(output, "extractor-v2.js"), extractor);

await Promise.all([
  copyRequired(resolve(root, "node_modules", "emf-converter", "dist", "index.mjs"), resolve(vendor, "emf-converter.mjs")),
  copyRequired(resolve(root, "node_modules", "jszip", "dist", "jszip.min.js"), resolve(vendor, "jszip.min.js")),
  copyRequired(resolve(root, "node_modules", "pptxgenjs", "dist", "pptxgen.bundle.js"), resolve(vendor, "pptxgen.bundle.js")),
  copyRequired(resolve(pdfRoot, "legacy", "build", "pdf.min.mjs"), resolve(vendor, "pdf.min.mjs")),
  copyRequired(resolve(pdfRoot, "legacy", "build", "pdf.worker.min.mjs"), resolve(vendor, "pdf.worker.min.mjs")),
]);

const optionalResults = await Promise.all([
  copyOptional(resolve(pdfRoot, "cmaps"), resolve(vendor, "cmaps"), { recursive: true }),
  copyOptional(resolve(pdfRoot, "standard_fonts"), resolve(vendor, "standard_fonts"), { recursive: true }),
  copyOptional(resolve(pdfRoot, "wasm"), resolve(vendor, "wasm"), { recursive: true }),
]);

const optionalCount = optionalResults.filter(Boolean).length;
console.log(`Prepared ${staticFiles.length + 1} static files plus local Office visual conversion, JSZip, PptxGenJS, PDF.js, and ${optionalCount} optional PDF.js asset directories in dist/.`);
