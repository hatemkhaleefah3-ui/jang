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

const xmlEscape = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const paragraph = (value) => `<a:p><a:r><a:t>${xmlEscape(value)}</a:t></a:r></a:p>`;
const shape = (type, values, id = 1) => `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Text ${id}"/><p:cNvSpPr/><p:nvPr>${type ? `<p:ph type="${type}"/>` : ""}</p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${values.map(paragraph).join("")}</p:txBody></p:sp>`;
const imageShape = '<p:pic><p:nvPicPr><p:cNvPr id="40" name="Image"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr/></p:pic>';
const tableCell = (value) => `<a:tc><a:txBody><a:bodyPr/><a:lstStyle/>${paragraph(value)}</a:txBody><a:tcPr/></a:tc>`;
const tableGraphic = (headers, rows) => `<p:graphicFrame><p:nvGraphicFramePr><p:cNvPr id="50" name="Table"/><p:cNvGraphicFramePr/><p:nvPr/></p:nvGraphicFramePr><p:xfrm/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table"><a:tbl><a:tblPr firstRow="1" bandRow="1"/><a:tblGrid>${headers.map(() => '<a:gridCol w="2200000"/>').join("")}</a:tblGrid>${[headers, ...rows].map((row) => `<a:tr h="420000">${row.map(tableCell).join("")}</a:tr>`).join("")}</a:tbl></a:graphicData></a:graphic></p:graphicFrame>`;
const slideXml = (title, body = [], { image = false, extra = "" } = {}) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree>${shape("title", [title], 1)}${body.length ? shape("body", body, 2) : ""}${extra}${image ? imageShape : ""}</p:spTree></p:cSld></p:sld>`;

const pptx = new JSZip();
pptx.file("[Content_Types].xml", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"xml\" ContentType=\"application/xml\"/><Default Extension=\"png\" ContentType=\"image/png\"/></Types>");
pptx.file("ppt/slides/slide1.xml", slideXml("Carbohydrate Metabolism", ["Pentose phosphate pathway"]));
pptx.file("ppt/slides/slide2.xml", slideXml("Pentose Phosphate Pathway", ["The pathway occurs in the cytosol and has oxidative and nonoxidative phases.", "Oxidative phase produces NADPH", "Nonoxidative phase interconverts sugars", "No ATP is directly produced"]));
pptx.file("ppt/slides/slide3.xml", slideXml("Regulation and Clinical Significance", ["Glucose-6-phosphate dehydrogenase is rate limiting.", "NADPH maintains reduced glutathione in erythrocytes."], { image: true }));
pptx.file("ppt/slides/_rels/slide3.xml.rels", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" Target=\"../media/image1.png\"/></Relationships>");
pptx.file("ppt/media/image1.png", pngBytes);
await writeFile(resolve(output, "lecture.pptx"), await pptx.generateAsync({ type: "nodebuffer" }));

const fidelity = new JSZip();
fidelity.file("[Content_Types].xml", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"xml\" ContentType=\"application/xml\"/><Default Extension=\"png\" ContentType=\"image/png\"/></Types>");
fidelity.file("ppt/slides/slide1.xml", slideXml("Carbohydrate metabolism"));
fidelity.file("ppt/slides/slide2.xml", slideXml("PENTOSE PHOSPHATE PATHWAY", [
  "The pentose phosphate pathway is an alternative route for the oxidation of glucose.",
  "1. Phase I: Oxidative irreversible phase",
  "2. Phase II: Nonoxidative reversible phase.",
]));
fidelity.file("ppt/slides/slide3.xml", slideXml("Reactions of phase II", [
  "6. Transaldolase catalyzes the transfer of a three carbon dihydroxyacetone group from sedoheptulose-7-phosphate to glyceraldehyde-3-phosphate to form fructose-6-phosphate and erythrose-4-phosphate.",
  "7. Transketolase transfers two carbon units from xylulose-5-phosphate to erythrose-4-phosphate.",
]));
fidelity.file("ppt/slides/slide4.xml", slideXml("Warburg effect", [
  "The Warburg effect allows for cancer tumor detection with PET scans, which use a radioactive glucose analog 18F-fluorodeoxyglucose (FDG) to highlight areas of high glucose uptake.",
  "Cancer cells consume large amounts of glucose for glycolysis, causing injected FDG to be trapped and accumulated in highly metabolizing cells.",
]));
fidelity.file("ppt/slides/slide5.xml", slideXml("CORI'S CYCLE OR LACTIC ACID CYCLE", [
  "1. Glucose is converted to lactate in the muscle and lactate is reconverted into glucose in the liver.",
  "2. Pyruvate is reduced to lactic acid in actively contracting muscle.",
  "3. The body uses Cori's cycle to prevent lactate accumulation.",
  "4. Lactate reaches the liver and enters gluconeogenesis.",
  "5. The lactate produced in muscle is efficiently reutilized by the body.",
]));
fidelity.file("ppt/slides/slide6.xml", slideXml("GLYCOGEN STORAGE DISEASES", ["Inherited enzyme defects alter glycogen synthesis or degradation."], {
  extra: tableGraphic(
    ["Type", "Name", "Deficient enzyme", "Clinical features"],
    [
      ["Type Ia", "von Gierke's disease", "Glucose-6-phosphatase", "Fasting hypoglycemia; hepatomegaly"],
      ["Type II", "Pompe's disease", "Lysosomal maltase", "Heart and muscle glycogen accumulation"],
      ["Type III", "Cori's disease", "Debranching enzyme", "Fasting hypoglycemia; hepatomegaly"],
    ],
  ),
}));
fidelity.file("ppt/slides/slide7.xml", slideXml("Glycogen synthesis pathway", [], { image: true }));
fidelity.file("ppt/slides/_rels/slide7.xml.rels", "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" Target=\"../media/pathway.png\"/></Relationships>");
fidelity.file("ppt/media/pathway.png", pngBytes);
await writeFile(resolve(output, "source-fidelity.pptx"), await fidelity.generateAsync({ type: "nodebuffer" }));

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

const scannedPdf = await PDFDocument.create();
const scannedPage = scannedPdf.addPage([960, 540]);
scannedPage.drawRectangle({ x: 80, y: 80, width: 800, height: 380, borderColor: rgb(0.15, 0.15, 0.15), borderWidth: 3, color: rgb(0.96, 0.96, 0.93) });
scannedPage.drawRectangle({ x: 130, y: 345, width: 700, height: 55, color: rgb(0.2, 0.2, 0.2) });
scannedPage.drawRectangle({ x: 130, y: 250, width: 620, height: 20, color: rgb(0.45, 0.45, 0.45) });
scannedPage.drawRectangle({ x: 130, y: 205, width: 680, height: 20, color: rgb(0.45, 0.45, 0.45) });
scannedPage.drawRectangle({ x: 130, y: 160, width: 560, height: 20, color: rgb(0.45, 0.45, 0.45) });
await writeFile(resolve(output, "scanned.pdf"), await scannedPdf.save());

console.log(`Created browser test fixtures in ${output}`);
