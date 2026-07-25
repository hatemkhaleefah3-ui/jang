import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { normalizeLectureResult } from "../functions/api/extract.js";
import { buildLecturePptxFile } from "../pptx-output.js";

const extraction = {
  documentTitle: "Cell Biology and Metabolism",
  direction: "ltr",
  overview: {
    title: "Overview",
    introduction: "A complete example generated through the same shared Gemini-to-PowerPoint contract used by the website.",
    keyPoints: ["Native editable objects", "Traceable source coverage", "Typed tables and pathways", "Labelled image imports"],
  },
  sections: [{
    sectionTitle: "Cellular Respiration",
    slides: [{
      slideTitle: "The opportunity is not ATP alone",
      slideSubtitle: "From glucose to usable cellular energy",
      sourceReferences: ["Slide 1", "Slide 2"],
      blocks: [
        { type: "paragraph", text: "Cellular respiration is a coordinated sequence of reactions that converts chemical energy in glucose into ATP while preserving the relationships between glycolysis, the citric acid cycle, and oxidative phosphorylation.", sourceReferences: ["Slide 1"] },
        { type: "bullets", items: [
          { text: "Glycolysis occurs in the cytoplasm", level: 0 },
          { text: "Produces pyruvate and a small net ATP yield", level: 1 },
          { text: "Oxidative phosphorylation occurs at the inner mitochondrial membrane", level: 0 },
          { text: "Uses a proton gradient to drive ATP synthase", level: 1 }
        ], sourceReferences: ["Slide 2"] },
      ],
    }, {
      slideTitle: "Glycolysis converts glucose into pyruvate",
      slideSubtitle: "An editable metabolic pathway",
      sourceReferences: ["Slide 3"],
      blocks: [{
        type: "diagram", label: "Simplified glycolysis pathway", diagramType: "metabolic",
        diagramRows: [["Glucose", "Investment phase", "Two 3-carbon molecules"], ["Payoff phase", "ATP + NADH", "Pyruvate"]],
        sourceReferences: ["Slide 3"],
      }],
    }, {
      slideTitle: "ATP production summary",
      slideSubtitle: "Editable table classifications",
      sourceReferences: ["Slide 4"],
      blocks: [{
        type: "table", label: "ATP yield by stage", tableType: "highlight",
        headers: ["Stage", "ATP", "Location", "Main output"],
        rows: [["Glycolysis", "2 net", "Cytoplasm", "Pyruvate + NADH"], ["Citric acid cycle", "2", "Matrix", "NADH + FADH₂"], ["Oxidative phosphorylation", "~34", "Inner membrane", "ATP via proton gradient"]],
        sourceReferences: ["Slide 4"],
      }],
    }, {
      slideTitle: "Mitochondrial architecture",
      slideSubtitle: "Manually imported important visual",
      sourceReferences: ["Slide 5"],
      blocks: [{
        type: "image", slotId: "mitochondria", label: "Mitochondrial energy-conversion architecture",
        description: "Diagram showing the inner membrane, matrix, electron transport, and proton gradient.", important: true,
        fit: "contain", preferredAspect: "wide", orientation: "longitudinal",
        sourceReference: "Slide 5", sourceReferences: ["Slide 5"],
      }],
    }],
  }, {
    sectionTitle: "Signal Transduction",
    slides: [{
      slideTitle: "G-protein–coupled receptor activation",
      slideSubtitle: "A nested ordered sequence",
      sourceReferences: ["Slide 6"],
      blocks: [{
        type: "numbered", items: [
          { text: "Ligand binds the extracellular receptor domain", level: 0 },
          { text: "The receptor changes conformation", level: 1 },
          { text: "GDP is exchanged for GTP on Gα", level: 0 },
          { text: "Downstream effectors are activated", level: 1 },
          { text: "GTP hydrolysis resets the complex", level: 0 }
        ], sourceReferences: ["Slide 6"],
      }],
    }, {
      slideTitle: "From signal to cellular response",
      slideSubtitle: "Editable signal-transduction pathway",
      sourceReferences: ["Slide 7"],
      blocks: [{
        type: "diagram", label: "Epinephrine to cAMP signaling cascade", diagramType: "signal-transduction",
        diagramRows: [["Epinephrine", "β-adrenergic receptor", "Gαs-GTP"], ["Adenylyl cyclase", "cAMP", "Protein kinase A"], ["Target proteins", "Cellular response"]],
        sourceReferences: ["Slide 7"],
      }],
    }],
  }],
  endNote: "Questions for discussion",
  sourcePageOrSlideCount: 7,
  coveredSourceReferences: ["Slide 1", "Slide 2", "Slide 3", "Slide 4", "Slide 5", "Slide 6", "Slide 7"],
  unmappedSourceReferences: [],
  warnings: [],
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#111111"/><g fill="none" stroke="#777777" stroke-width="8"><ellipse cx="575" cy="360" rx="420" ry="230"/><ellipse cx="575" cy="360" rx="310" ry="170"/><ellipse cx="575" cy="360" rx="190" ry="105"/></g><circle cx="575" cy="360" r="34" fill="#FAFAF9"/><text x="600" y="650" text-anchor="middle" font-family="Arial" font-size="34" fill="#D7D7D5">Imported lecture image</text></svg>`;
const images = {
  mitochondria: {
    fileName: "mitochondrial-architecture.svg",
    mimeType: "image/svg+xml",
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
  },
};

const { lecture } = normalizeLectureResult(extraction, { sourceType: "pptx", sourceCount: 7 });
globalThis.document = {};
const result = await buildLecturePptxFile(lecture, images);
delete globalThis.document;
const outputDir = resolve("generated");
await mkdir(outputDir, { recursive: true });
const outputPath = resolve(outputDir, "jang-website-pptx-workflow-sample.pptx");
await writeFile(outputPath, Buffer.from(await result.blob.arrayBuffer()));
console.log(JSON.stringify({ outputPath, slideCount: result.slideCount, warnings: result.warnings }, null, 2));
