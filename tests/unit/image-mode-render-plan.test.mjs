import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateLecturePptx } from "../../pptx-engine.js";

const execFileAsync = promisify(execFile);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="#111111"/><circle cx="410" cy="350" r="170" fill="#777777"/><rect x="690" y="170" width="320" height="360" rx="28" fill="#fafaf9"/><text x="850" y="365" fill="#111111" font-size="44" text-anchor="middle">Editable evidence</text></svg>`;
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

function image(blockId, slotId, preferredAspect = "wide") {
  return {
    blockId,
    type: "image",
    slotId,
    label: `Evidence ${slotId}`,
    description: "The same planned image box must be used whether the image is filled or empty.",
    important: true,
    sourceReference: `source-${slotId}`,
    fit: "contain",
    preferredAspect,
    sourceReferences: [`source-${slotId}`],
  };
}

function lecture() {
  return {
    schemaVersion: "1.1",
    documentTitle: "Amino acids metabolism render-plan regression",
    direction: "ltr",
    overview: {
      title: "Overview",
      introduction: "A realistic two-section lecture with text, images, tables, and diagrams.",
      keyPoints: ["Glycine", "Phenylalanine and tyrosine", "Clinical integration"],
    },
    sections: [
      {
        sectionId: "glycine",
        sectionTitle: "Glycine metabolism",
        slides: [
          {
            slideId: "glycine-functions",
            slideTitle: "Metabolic functions of glycine",
            slideSubtitle: "Biosynthesis, neurotransmission, and one-carbon metabolism",
            sourceReferences: ["p1", "p2"],
            blocks: [
              {
                blockId: "glycine-intro",
                type: "paragraph",
                text: "Glycine participates in protein synthesis, heme production, purine metabolism, glutathione synthesis, and inhibitory neurotransmission. ".repeat(12),
                sourceReferences: ["p1"],
              },
              image("glycine-image", "glycine-slot"),
              {
                blockId: "glycine-points",
                type: "bullets",
                items: [
                  "Provides carbon and nitrogen for biosynthetic pathways",
                  "Contributes to antioxidant defense through glutathione",
                  "Acts as an inhibitory neurotransmitter in the central nervous system",
                  "Interconverts with serine and supports one-carbon metabolism",
                ],
                sourceReferences: ["p2"],
              },
            ],
          },
          {
            slideId: "glycine-table",
            slideTitle: "Glycine pathway comparison",
            slideSubtitle: "Editable native data",
            sourceReferences: ["p3"],
            blocks: [
              {
                blockId: "glycine-comparison",
                type: "table",
                label: "Pathways and implications",
                tableType: "comparison",
                headers: ["Pathway", "Role", "Clinical relevance", "Source"],
                rows: Array.from({ length: 18 }, (_, index) => [
                  `Pathway ${index + 1}`,
                  index % 3 === 0 ? "A longer mechanistic explanation that wraps across multiple lines in a measured row." : "Concise role",
                  `Implication ${index + 1}`,
                  `p${index + 3}`,
                ]),
                sourceReferences: ["p3"],
              },
            ],
          },
        ],
      },
      {
        sectionId: "aromatic",
        sectionTitle: "Phenylalanine and tyrosine",
        slides: [
          {
            slideId: "aromatic-pathway",
            slideTitle: "Aromatic amino acid pathway",
            slideSubtitle: "Precursor flow and clinical consequences",
            sourceReferences: ["p10", "p11"],
            blocks: [
              {
                blockId: "aromatic-text",
                type: "paragraph",
                text: "Phenylalanine is converted to tyrosine, which supplies catecholamine, thyroid hormone, and melanin synthesis. Defects in pathway enzymes cause clinically important disorders. ".repeat(10),
                sourceReferences: ["p10"],
              },
              image("aromatic-image", "aromatic-slot"),
              {
                blockId: "aromatic-diagram",
                type: "diagram",
                label: "Phenylalanine and tyrosine pathway",
                diagramType: "metabolic",
                diagramRows: [
                  ["Phenylalanine", "Tyrosine", "DOPA", "Dopamine", "Norepinephrine", "Epinephrine"],
                  ["Tyrosine", "Thyroid hormones", "Melanin"],
                ],
                sourceReferences: ["p11"],
              },
            ],
          },
          {
            slideId: "full-evidence",
            slideTitle: "Clinical image evidence",
            slideSubtitle: "Full evidence layout remains stable",
            sourceReferences: ["p12"],
            blocks: [image("full-image", "full-slot", "full")],
          },
        ],
      },
    ],
    endNote: "Questions and clinical discussion",
  };
}

const allImages = {
  "glycine-slot": { dataUrl, fileName: "glycine.svg", mimeType: "image/svg+xml" },
  "aromatic-slot": { dataUrl, fileName: "aromatic.svg", mimeType: "image/svg+xml" },
  "full-slot": { dataUrl, fileName: "full.svg", mimeType: "image/svg+xml" },
};
const someImages = { "aromatic-slot": allImages["aromatic-slot"] };

async function inspectResult(name, importedImages) {
  const result = await generateLecturePptx(lecture(), importedImages, {
    strictGeometry: true,
    compression: true,
  });
  assert.ok(result.blob.size > 1000);
  assert.equal(result.warnings.some((warning) => warning.startsWith("Geometry:")), false, result.warnings.join("\n"));

  const directory = await mkdtemp(join(tmpdir(), `jang-${name}-`));
  try {
    const path = join(directory, `${name}.pptx`);
    await writeFile(path, Buffer.from(await result.blob.arrayBuffer()));
    const { stdout: listing } = await execFileAsync("unzip", ["-Z1", path]);
    const slideNames = listing.split("\n").filter((entry) => /^ppt\/slides\/slide\d+\.xml$/.test(entry));
    assert.equal(slideNames.length, result.slideCount);
    let xml = "";
    for (const slideName of slideNames) {
      const { stdout } = await execFileAsync("unzip", ["-p", path, slideName], { maxBuffer: 20_000_000 });
      xml += stdout;
    }
    assert.match(xml, /Metabolic functions of glycine/);
    assert.match(xml, /Phenylalanine and tyrosine pathway/);
    assert.match(xml, /Evidence glycine-slot/);
    assert.match(xml, /Evidence aromatic-slot/);
    assert.match(xml, /Evidence full-slot/);
    return result;
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("no, some, and all imported images share the same geometry-safe presentation plan", { timeout: 60000 }, async () => {
  const noImages = await inspectResult("no-images", {});
  const partialImages = await inspectResult("some-images", someImages);
  const completeImages = await inspectResult("all-images", allImages);

  assert.equal(partialImages.slideCount, noImages.slideCount);
  assert.equal(completeImages.slideCount, noImages.slideCount);
  assert.equal(noImages.quality.estimatedSlideCount, noImages.slideCount);
  assert.equal(partialImages.quality.estimatedSlideCount, partialImages.slideCount);
  assert.equal(completeImages.quality.estimatedSlideCount, completeImages.slideCount);
});
