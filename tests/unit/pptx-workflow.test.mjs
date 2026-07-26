import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateLecture } from "../../pptx-engine.js";
import { buildLecturePptxFile, PPTX_MIME } from "../../pptx-output.js";
import { normalizeLectureResult } from "../../functions/api/extract.js";

const execFileAsync = promisify(execFile);

const extracted = {
  documentTitle: "Cell Signaling",
  direction: "ltr",
  overview: {
    title: "Overview",
    introduction: "How extracellular information becomes a cellular response.",
    keyPoints: ["Receptors", "Second messengers", "Regulation"],
  },
  sections: [{
    sectionTitle: "Signal Transduction",
    slides: [{
      slideTitle: "GPCR activation",
      slideSubtitle: "A traceable sequence",
      sourceReferences: ["Slide 1", "Slide 2"],
      blocks: [
        {
          type: "paragraph",
          text: "G protein-coupled receptors translate extracellular ligand binding into intracellular signaling by coupling receptor conformational change to nucleotide exchange on a heterotrimeric G protein. The activated alpha subunit and beta-gamma complex regulate downstream effectors, amplify second-messenger production, and coordinate protein-kinase activity until intrinsic GTP hydrolysis and regulatory proteins terminate the response.",
          sourceReferences: ["Slide 1", "Slide 2"],
        },
        {
          type: "numbered",
          items: [
            { text: "Ligand binds the extracellular receptor domain and stabilizes the active receptor conformation.", level: 0 },
            { text: "The activated receptor promotes GDP release and GTP binding on the G-protein alpha subunit.", level: 0 },
            { text: "The alpha subunit and beta-gamma complex regulate effectors such as adenylyl cyclase and ion channels.", level: 0 },
            { text: "Second messengers activate protein kinases that phosphorylate targets and generate the cellular response.", level: 0 },
            { text: "GTP hydrolysis and receptor desensitization return the pathway toward its resting state.", level: 0 },
          ],
          sourceReferences: ["Slide 1", "Slide 2"],
        },
        {
          type: "diagram",
          label: "GPCR signaling cascade",
          diagramType: "signal-transduction",
          diagramRows: [["Ligand", "GPCR", "G protein"], ["Adenylyl cyclase", "cAMP", "PKA"]],
          sourceReferences: ["Slide 2"],
        },
      ],
    }, {
      slideTitle: "Evidence table",
      slideSubtitle: "Editable native data",
      sourceReferences: ["Slide 3"],
      blocks: [{
        type: "paragraph",
        text: "The comparison summarizes how receptor stimulation changes second-messenger concentration, kinase activity, target phosphorylation, and the final cellular state. Each row preserves the relationship between experimental condition, measured signal, mechanistic interpretation, and expected response so the data remain useful as editable teaching evidence rather than an isolated sparse table.",
        sourceReferences: ["Slide 3"],
      }, {
        type: "table",
        label: "Signal intensity table",
        tableType: "highlight",
        headers: ["Condition", "Signal", "Response"],
        rows: [
          ["Baseline", "Low cAMP and basal kinase activity", "Resting cellular state"],
          ["Ligand stimulation", "Rapid cAMP increase", "Active phosphorylation response"],
          ["Receptor desensitization", "Falling second messenger", "Attenuated downstream signaling"],
          ["Phosphodiesterase activation", "Accelerated cAMP removal", "Signal termination and recovery"],
        ],
        sourceReferences: ["Slide 3"],
      }],
    }, {
      slideTitle: "Microscopy reference",
      slideSubtitle: "",
      sourceReferences: ["Slide 4"],
      blocks: [{
        type: "image",
        slotId: "cell-image",
        label: "Receptor localization microscopy",
        description: "Microscopy image showing receptor localization at the plasma membrane.",
        important: true,
        fit: "contain",
        preferredAspect: "wide",
        orientation: "landscape",
        sourceReference: "Slide 4",
        sourceReferences: ["Slide 4"],
      }],
    }],
  }],
  endNote: "Questions",
  sourcePageOrSlideCount: 4,
  coveredSourceReferences: ["Slide 1", "Slide 2", "Slide 3", "Slide 4"],
  unmappedSourceReferences: [],
  warnings: [],
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="#111111"/><circle cx="600" cy="350" r="180" fill="none" stroke="#d7d7d5" stroke-width="18"/><circle cx="600" cy="350" r="45" fill="#fafaf9"/></svg>`;
const importedImages = {
  "cell-image": {
    dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    fileName: "receptor-localization.svg",
    mimeType: "image/svg+xml",
  },
};

test("normalized Gemini output validates and generates an editable PPTX", { timeout: 30000 }, async () => {
  const { lecture } = normalizeLectureResult(extracted, { sourceType: "pptx", sourceCount: 4 });
  const validation = validateLecture(lecture);
  assert.equal(validation.valid, true, validation.errors.join("\n"));

  globalThis.document = {};
  const result = await buildLecturePptxFile(lecture, importedImages);
  delete globalThis.document;

  assert.ok(result.slideCount >= 7);
  assert.equal(result.warnings.length, 0, result.warnings.join("\n"));
  assert.equal(result.blob.type, PPTX_MIME);
  assert.equal(result.filename, "cell-signaling.pptx");

  const directory = await mkdtemp(join(tmpdir(), "jang-pptx-test-"));
  try {
    const output = join(directory, "lecture.pptx");
    await writeFile(output, Buffer.from(await result.blob.arrayBuffer()));
    const { stdout: listing } = await execFileAsync("unzip", ["-Z1", output]);
    const slideNames = listing.split("\n").filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
    assert.equal(slideNames.length, result.slideCount);

    const { stdout: presentation } = await execFileAsync("unzip", ["-p", output, "ppt/presentation.xml"], { maxBuffer: 5_000_000 });
    assert.match(presentation, /cx="12188952"/);
    assert.match(presentation, /cy="6858000"/);

    let slideXml = "";
    for (const slideName of slideNames) {
      const { stdout } = await execFileAsync("unzip", ["-p", output, slideName], { maxBuffer: 10_000_000 });
      slideXml += stdout;
    }
    assert.match(slideXml, /<a:buAutoNum/);
    assert.match(slideXml, /<a:tbl>/);
    assert.match(slideXml, /<p:pic>/);
    assert.match(slideXml, /<a:tailEnd[^>]*type="(?:triangle|arrow|stealth)"/);
    assert.match(slideXml, /GPCR signaling cascade/);
    assert.match(slideXml, /Receptor localization microscopy/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
