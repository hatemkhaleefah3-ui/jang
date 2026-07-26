const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="#111111"/><circle cx="410" cy="350" r="170" fill="#777777"/><rect x="690" y="170" width="320" height="360" rx="28" fill="#fafaf9"/><text x="850" y="365" fill="#111111" font-size="44" text-anchor="middle">Editable evidence</text></svg>`;
export const renderPlanImageDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

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

export function renderPlanLecture() {
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
                  index % 3 === 0
                    ? "A longer mechanistic explanation that wraps across multiple lines in a measured row."
                    : "Concise role",
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

export const renderPlanAllImages = {
  "glycine-slot": {
    dataUrl: renderPlanImageDataUrl,
    fileName: "glycine.svg",
    mimeType: "image/svg+xml",
  },
  "aromatic-slot": {
    dataUrl: renderPlanImageDataUrl,
    fileName: "aromatic.svg",
    mimeType: "image/svg+xml",
  },
  "full-slot": {
    dataUrl: renderPlanImageDataUrl,
    fileName: "full.svg",
    mimeType: "image/svg+xml",
  },
};

export const renderPlanSomeImages = {
  "aromatic-slot": renderPlanAllImages["aromatic-slot"],
};
