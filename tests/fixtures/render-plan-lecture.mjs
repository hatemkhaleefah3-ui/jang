const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="#111111"/><circle cx="410" cy="350" r="170" fill="#777777"/><rect x="690" y="170" width="320" height="360" rx="28" fill="#fafaf9"/><text x="850" y="365" fill="#111111" font-size="44" text-anchor="middle">Editable evidence</text></svg>`;
export const renderPlanImageDataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

function image(blockId, slotId, preferredAspect = "wide", visualType = "pathway") {
  return {
    blockId,
    type: "image",
    slotId,
    label: `Evidence ${slotId}`,
    description: "The same planned image box must be used whether the image is filled or empty.",
    important: true,
    sourceReference: `source-${slotId}`,
    fit: ["photo", "decorative"].includes(visualType) ? "cover" : "contain",
    visualType,
    preferredAspect,
    sourceReferences: [`source-${slotId}`],
  };
}

export function renderPlanLecture() {
  return {
    schemaVersion: "1.2",
    documentTitle: "Amino acids metabolism render-plan regression",
    direction: "ltr",
    overview: {
      title: "Lecture Overview: Amino Acid Metabolism",
      introduction: "This lecture provides a comprehensive study of metabolic pathways, biosynthetic functions, and associated clinical disorders for glycine, phenylalanine, and tyrosine.",
      keyPoints: [
        "Metabolic functions of glycine",
        "Glycine pathway comparison",
        "Biosynthesis of Specialized Products from Tyrosine",
        "Clinical image evidence",
      ],
    },
    sections: [
      {
        sectionId: "glycine",
        sectionTitle: "Glycine metabolism",
        sectionDefinition: "Glycine metabolism connects biosynthesis, neurotransmission, antioxidant defense, and one-carbon transfer while explaining how synthesis, utilization, and degradation support protein, heme, purine, glutathione, and nervous-system functions and how pathway defects produce clinically important disease.",
        slides: [
          {
            slideId: "glycine-functions",
            slideTitle: "Metabolic functions of glycine",
            titleDefinition: "Glycine contributes to biosynthesis, antioxidant defense, nervous-system signaling, and one-carbon transfer through several source-supported pathways that explain its broad physiological and clinical importance.",
            slideSubtitle: "Biosynthesis, neurotransmission, and one-carbon metabolism",
            subtitleDefinition: "These functions explain the broad physiological importance of glycine.",
            sourceReferences: ["p1", "p2"],
            blocks: [
              {
                blockId: "glycine-intro",
                type: "paragraph",
                text: "Glycine participates in protein synthesis, heme production, purine metabolism, glutathione synthesis, and inhibitory neurotransmission. ".repeat(12),
                sourceReferences: ["p1"],
              },
              image("glycine-image", "glycine-slot", "wide", "pathway"),
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
            titleDefinition: "A structured comparison links glycine pathways with their metabolic roles, measurable consequences, source references, and clinically relevant effects while retaining all native table content for editing.",
            slideSubtitle: "Editable native data",
            subtitleDefinition: "The table remains editable and preserves every source row.",
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
        sectionTitle: "Phenylalanine and Tyrosine Metabolism",
        sectionDefinition: "Aromatic amino-acid metabolism links phenylalanine conversion with tyrosine-dependent catecholamine, thyroid-hormone, and melanin production while preserving the enzymes, precursor relationships, regulatory points, and inherited disorders that explain normal physiology and clinically important pathway defects.",
        slides: [
          {
            slideId: "aromatic-pathway",
            slideTitle: "Biosynthesis of Specialized Products from Tyrosine",
            titleDefinition: "Tyrosine supplies catecholamines, thyroid hormones, and melanin through distinct source-supported biosynthetic routes whose enzymes, precursor flow, tissue roles, regulation, and disease consequences remain fully explained in editable content.",
            slideSubtitle: "Precursor flow and clinical consequences",
            subtitleDefinition: "Ordered reactions connect precursor availability with physiological products and disease.",
            sourceReferences: ["p10", "p11"],
            blocks: [
              {
                blockId: "aromatic-text",
                type: "paragraph",
                text: "Phenylalanine is converted to tyrosine, which supplies catecholamine, thyroid hormone, and melanin synthesis. Defects in pathway enzymes cause clinically important disorders. ".repeat(10),
                sourceReferences: ["p10"],
              },
              image("aromatic-image", "aromatic-slot", "wide", "photo"),
              {
                blockId: "aromatic-diagram-review",
                type: "numbered",
                startAt: 1,
                items: [
                  "Phenylalanine is converted to tyrosine before tyrosine enters specialized biosynthetic pathways.",
                  "Tyrosine proceeds through DOPA to dopamine, norepinephrine, and epinephrine in the catecholamine sequence.",
                  "Separate tyrosine-dependent routes produce thyroid hormones and melanin, while enzyme defects create clinically important disorders.",
                ],
                sourceReferences: ["p10", "p11"],
              },
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
            titleDefinition: "Clinical photography can fill its reserved evidence area without changing pagination, geometry, title hierarchy, supporting text, or the editable physical presentation plan used across all image-import modes.",
            slideSubtitle: "Full evidence layout remains stable",
            subtitleDefinition: "The imported image changes painting only and not the planned slide structure.",
            sourceReferences: ["p12"],
            blocks: [image("full-image", "full-slot", "full", "decorative")],
          },
        ],
      },
    ],
    endNote: "Complete lecture reconstruction covering Glycine, Phenylalanine, and Tyrosine metabolism and clinical correlates.",
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
