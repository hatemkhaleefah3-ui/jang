import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import JSZip from "jszip";
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

const paragraph = (value) => `<a:p><a:r><a:t>${value}</a:t></a:r></a:p>`;
const shape = (type, values) => `<p:sp><p:nvSpPr><p:cNvPr id="1" name="Text"/><p:cNvSpPr/><p:nvPr>${type ? `<p:ph type="${type}"/>` : ""}</p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${values.map(paragraph).join("")}</p:txBody></p:sp>`;
const slideXml = (title, body, image = false) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>${shape("title", [title])}${shape("body", body)}${image ? '<p:pic><p:nvPicPr><p:cNvPr id="4" name="Image"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr/></p:pic>' : ""}</p:spTree></p:cSld></p:sld>`;

const pptx = new JSZip();
pptx.file("[Content_Types].xml", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"xml\" ContentType=\"application/xml\"/><Default Extension=\"png\" ContentType=\"image/png\"/></Types>");
pptx.file("ppt/slides/slide1.xml", slideXml("Carbohydrate Metabolism", ["Pentose phosphate pathway"]));
pptx.file("ppt/slides/slide2.xml", slideXml("Pentose Phosphate Pathway", ["The pathway occurs in the cytosol and has oxidative and nonoxidative phases.", "Oxidative phase produces NADPH", "Nonoxidative phase interconverts sugars", "No ATP is directly produced"]));
pptx.file("ppt/slides/slide3.xml", slideXml("Regulation and Clinical Significance", ["Glucose-6-phosphate dehydrogenase is rate limiting.", "NADPH maintains reduced glutathione in erythrocytes."], true));
pptx.file("ppt/slides/_rels/slide3.xml.rels", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" Target=\"../media/image1.png\"/></Relationships>");
pptx.file("ppt/media/image1.png", pngBytes);
await writeFile(resolve(output, "lecture.pptx"), await pptx.generateAsync({ type: "nodebuffer" }));

const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
let page = pdf.addPage([960, 540]);
page.drawText("Carbohydrate Metabolism", { x: 60, y: 465, size: 28, font: bold, color: rgb(0.08, 0.08, 0.08) });
page.drawText("Pentose Phosphate Pathway", { x: 60, y: 410, size: 21, font: bold });
page.drawText("An alternative route for glucose oxidation that produces NADPH and ribose-5-phosphate.", { x: 60, y: 365, size: 15, font });
page.drawText("The oxidative phase is irreversible; the nonoxidative phase is reversible.", { x: 60, y: 330, size: 15, font });
page = pdf.addPage([960, 540]);
page.drawText("Regulation and Clinical Significance", { x: 60, y: 465, size: 24, font: bold });
page.drawText("Glucose-6-phosphate dehydrogenase is the rate-limiting enzyme.", { x: 60, y: 410, size: 15, font });
page.drawText("NADPH supports glutathione reduction and erythrocyte protection.", { x: 60, y: 375, size: 15, font });
page.drawRectangle({ x: 620, y: 155, width: 220, height: 220, borderColor: rgb(0.2, 0.2, 0.2), borderWidth: 2, color: rgb(0.93, 0.93, 0.88) });
page.drawText("Pathway overview", { x: 658, y: 258, size: 16, font: bold });
await writeFile(resolve(output, "lecture.pdf"), await pdf.save());

console.log(`Created browser test fixtures in ${output}`);
