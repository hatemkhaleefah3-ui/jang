import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const vendor = resolve(output, "vendor");
const pdfRoot = resolve(root, "node_modules", "pdfjs-dist");
const tesseractRoot = resolve(root, "node_modules", "tesseract.js");
const tesseractCoreRoot = resolve(root, "node_modules", "tesseract.js-core");
const tessdataRoot = resolve(vendor, "tessdata");
const tesseractWorkerRoot = resolve(vendor, "tesseract");
const tesseractCoreOutput = resolve(vendor, "tesseract-core");
const staticFiles = ["index.html", "styles.css", "app-v2.js", "semantic-manifest.js", "source-importer.js", "source-importer-core.js", "ocr-engine.js", "fallback-plan.js", "pptx-exporter.js", "pptx-exporter-v2.js", "html-pptx-exporter.js", "lecture-template.js", "_headers"];

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
await Promise.all([
  mkdir(vendor, { recursive: true }),
  mkdir(tessdataRoot, { recursive: true }),
  mkdir(tesseractWorkerRoot, { recursive: true }),
  mkdir(tesseractCoreOutput, { recursive: true }),
]);
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
  copyRequired(resolve(tesseractRoot, "dist", "tesseract.esm.min.js"), resolve(vendor, "tesseract.esm.min.js")),
  copyRequired(resolve(tesseractRoot, "dist", "worker.min.js"), resolve(tesseractWorkerRoot, "worker.min.js")),
  copyRequired(tesseractCoreRoot, tesseractCoreOutput, { recursive: true }),
  copyRequired(resolve(root, "node_modules", "@tesseract.js-data", "eng", "4.0.0_best_int", "eng.traineddata.gz"), resolve(tessdataRoot, "eng.traineddata.gz")),
  copyRequired(resolve(root, "node_modules", "@tesseract.js-data", "ara", "4.0.0_best_int", "ara.traineddata.gz"), resolve(tessdataRoot, "ara.traineddata.gz")),
]);

const optionalResults = await Promise.all([
  copyOptional(resolve(pdfRoot, "cmaps"), resolve(vendor, "cmaps"), { recursive: true }),
  copyOptional(resolve(pdfRoot, "standard_fonts"), resolve(vendor, "standard_fonts"), { recursive: true }),
  copyOptional(resolve(pdfRoot, "wasm"), resolve(vendor, "wasm"), { recursive: true }),
]);

const optionalCount = optionalResults.filter(Boolean).length;
console.log(`Prepared ${staticFiles.length + 1} static files plus local OCR, Office visual conversion, JSZip, PptxGenJS, PDF.js, and ${optionalCount} optional PDF.js asset directories in dist/.`);
