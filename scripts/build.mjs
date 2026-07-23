import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const staticFiles = ["styles.css", "app-v2.js", "source-importer.js", "pptx-exporter.js", "lecture-template.js", "_headers"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await Promise.all(staticFiles.map((file) => cp(resolve(root, file), resolve(output, file))));

const extractor = (await readFile(resolve(root, "extractor-v2.js"), "utf8"))
  .replace(/clone\.removeAttribute\(attr\.name\)/g, "node.removeAttribute(attr.name)");
await writeFile(resolve(output, "extractor-v2.js"), extractor);

const index = (await readFile(resolve(root, "index.html"), "utf8"))
  .replace('src="/app.js"', 'src="/app-v2.js"')
  .replace('<script type="module" src="/app-v2.js"></script>', '<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js" defer></script>\n  <script src="https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js" defer></script>\n  <script type="module" src="/app-v2.js"></script>')
  .replace('Upload a lecture HTML file.', 'Upload a PPTX or HTML lecture file.')
  .replace('Downloadable HTML', 'Downloadable PPTX + HTML')
  .replace('One .html or .htm file', 'One .pptx, .html or .htm file')
  .replace('accept=".html,.htm,text/html"', 'accept=".pptx,.html,.htm,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/html"')
  .replace('Drop lecture HTML here', 'Drop a PPTX or HTML lecture here')
  .replace('Maximum 8 MB · embedded and remote images are preserved', 'Up to 50 MB desktop / 20 MB mobile · processing stays on this device')
  .replace('<div class="file-type">HTML</div>', '<div class="file-type">FILE</div>')
  .replace('<button class="download-button" id="downloadButton" type="button" disabled>', '<button class="secondary-button" id="downloadPptxButton" type="button" disabled>Download PPTX</button>\n              <button class="download-button" id="downloadButton" type="button" disabled>')
  .replace('Select a lecture HTML file. Parsing happens locally in the visitor’s browser.', 'Select a PPTX or HTML lecture. Parsing and media extraction happen locally in the visitor’s browser.')
  .replace('A self-contained, printable HTML lecture is rendered and returned to the visitor.', 'A PowerPoint deck and a self-contained HTML lecture are generated in the browser.');
await writeFile(resolve(output, "index.html"), index);

console.log(`Prepared ${staticFiles.length + 2} static files in dist/ with direct PPTX import and export.`);
