import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import PptxGenJS from "pptxgenjs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const output = resolve("tests", "fixtures");
await mkdir(output, { recursive: true });

const pngData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAC0lEQVR4nO3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfg0wQAABy3l4AAAAAElFTkSuQmCC";
const pngBytes = Buffer.from(pngData.split(",")[1], "base64");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Carbohydrate Metabolism</title></head><body>
<h1>Carbohydrate Metabolism</h1>
<h2>Pentose Phosphate Pathway</h2>
<p>The pentose phosphate pathway is an alternative route for glucose oxidation. It forms pentose phosphates and produces NADPH without directly producing ATP.</p>
<h3>Major phases</h3>
<ol><li>Oxidative irreversible phase</li><li>Nonoxidative reversible phase</li></ol>
<h2>Regulation and significance</h2>
<p>Glucose-6-phosphate dehydrogenase is the rate-limiting enzyme. NADPH supports reductive biosynthesis and protects erythrocytes from oxidative damage.</p>
<ul><li>Occurs in the cytosol</li><li>Produces ribose-5-phosphate</li><li>Supports glutathione reduction</li></ul>
<img src="${pngData}" alt="Pathway overview diagram">
</body></html>`;
await writeFile(resolve(output, "lecture.html"), html);

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Jang browser test";
let slide = pptx.addSlide();
slide.addText("Carbohydrate Metabolism", { x: 0.7, y: 0.8, w: 11.8, h: 0.8, fontSize: 30, bold: true });
slide.addText("Pentose phosphate pathway", { x: 0.7, y: 2.0, w: 10, h: 0.5, fontSize: 20 });
slide = pptx.addSlide();
slide.addText("Pentose Phosphate Pathway", { x: 0.7, y: 0.5, w: 11.8, h: 0.6, fontSize: 26, bold: true });
slide.addText("The pathway occurs in the cytosol and has oxidative and nonoxidative phases.", { x: 0.8, y: 1.5, w: 11, h: 0.7, fontSize: 18 });
slide.addText("Oxidative phase produces NADPH\nNonoxidative phase interconverts sugars\nNo ATP is directly produced", { x: 1, y: 2.5, w: 10.5, h: 2.2, fontSize: 18, bullet: false });
slide = pptx.addSlide();
slide.addText("Regulation and Clinical Significance", { x: 0.7, y: 0.5, w: 11.8, h: 0.6, fontSize: 26, bold: true });
slide.addText("Glucose-6-phosphate dehydrogenase is rate limiting. NADPH maintains reduced glutathione in erythrocytes.", { x: 0.7, y: 1.5, w: 6.2, h: 2, fontSize: 18 });
slide.addImage({ data: pngData, x: 7.4, y: 1.5, w: 4.4, h: 3.6 });
await pptx.writeFile({ fileName: resolve(output, "lecture.pptx") });

const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const image = await pdf.embedPng(pngBytes);
let page = pdf.addPage([960, 540]);
page.drawText("Carbohydrate Metabolism", { x: 60, y: 465, size: 28, font: bold, color: rgb(0.08, 0.08, 0.08) });
page.drawText("Pentose Phosphate Pathway", { x: 60, y: 410, size: 21, font: bold });
page.drawText("An alternative route for glucose oxidation that produces NADPH and ribose-5-phosphate.", { x: 60, y: 365, size: 15, font });
page.drawText("The oxidative phase is irreversible; the nonoxidative phase is reversible.", { x: 60, y: 330, size: 15, font });
page = pdf.addPage([960, 540]);
page.drawText("Regulation and Clinical Significance", { x: 60, y: 465, size: 24, font: bold });
page.drawText("Glucose-6-phosphate dehydrogenase is the rate-limiting enzyme.", { x: 60, y: 410, size: 15, font });
page.drawText("NADPH supports glutathione reduction and erythrocyte protection.", { x: 60, y: 375, size: 15, font });
page.drawImage(image, { x: 620, y: 155, width: 220, height: 220 });
await writeFile(resolve(output, "lecture.pdf"), await pdf.save());

console.log(`Created browser test fixtures in ${output}`);
