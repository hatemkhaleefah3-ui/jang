import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const staticFiles = ["index.html", "styles.css", "app.js", "lecture-html.js", "pptx-reader.js", "_headers"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of staticFiles) {
  const source = resolve(root, file);
  const target = resolve(output, file);
  await access(source);

  if (file === "lecture-html.js") {
    const content = await readFile(source, "utf8");
    const leftAligned = content.replaceAll("text-align:right", "text-align:left");
    if (leftAligned === content) throw new Error("Expected lecture text alignment rules were not found.");
    await writeFile(target, leftAligned, "utf8");
  } else {
    await cp(source, target);
  }
}

console.log(`Prepared ${staticFiles.length} static files in dist with upper-left lecture text alignment.`);
