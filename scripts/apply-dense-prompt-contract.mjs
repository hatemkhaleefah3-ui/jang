import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

async function replaceRequired(path, search, replacement, label) {
  const target = resolve(root, path);
  const source = await readFile(target, "utf8");
  if (!source.includes(search)) throw new Error(`Missing ${label} in ${path}`);
  await writeFile(target, source.replace(search, replacement), "utf8");
}

async function replaceRange(path, startMarker, endMarker, replacement, label) {
  const target = resolve(root, path);
  const source = await readFile(target, "utf8");
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error(`Missing ${label} range in ${path}`);
  await writeFile(target, `${source.slice(0, start)}${replacement}${source.slice(end)}`, "utf8");
}

const extractPath = "functions/api/extract.js";

await replaceRequired(
  extractPath,
  `definition: { type: "string", description: "Short traceable definition for a title or sub-title." },`,
  `definition: { type: "string", description: "Source-grounded description: 20–42 words for a title or 12–28 words for a sub-title." },`,
  "block definition description",
);
await replaceRequired(
  extractPath,
  `sectionDefinition: { type: "string", description: "Short definition of the section, grounded in the extracted lecture." },`,
  `sectionDefinition: { type: "string", description: "Source-grounded 35–65 word section description designed to occupy about 3–5 lines." },`,
  "section definition description",
);
await replaceRequired(
  extractPath,
  `titleDefinition: { type: "string", description: "Short definition of the title, grounded in the extracted lecture." },`,
  `titleDefinition: { type: "string", description: "Source-grounded 20–42 word title description designed to occupy about 2–3 lines." },`,
  "title definition description",
);
await replaceRequired(
  extractPath,
  `subtitleDefinition: { type: "string", description: "Short definition of the sub-title, grounded in the extracted lecture." },`,
  `subtitleDefinition: { type: "string", description: "Source-grounded 12–28 word explanation of the sub-title." },`,
  "subtitle definition description",
);

await replaceRequired(
  extractPath,
  `8. Regroup compatible material when it improves coherence, but do not combine unrelated topics.`,
  `8. Regroup compatible material when it improves coherence. Prefer complete content plans that naturally use about 90% of a slide and avoid sparse continuation pages, but never combine unrelated topics or remove content.`,
  "density prompt",
);
await replaceRequired(
  extractPath,
  `10. Configure, decide, or make section titles. Every sectionTitle must have a short sectionDefinition grounded in the extracted content.`,
  `10. Configure, decide, or make section titles. Every sectionTitle must have one specific 35–65 word source-grounded paragraph that renders as approximately 3–5 lines; do not return generic one-sentence filler.`,
  "section description prompt",
);
await replaceRequired(
  extractPath,
  `11. Configure, decide, or make logical titles. Use the user-facing word title, not slide title. Every non-empty title must have a short titleDefinition.`,
  `11. Configure, decide, or make logical titles. Use the user-facing word title, not slide title. Every non-empty title must have one specific 20–42 word source-grounded paragraph that renders as approximately 2–3 lines.`,
  "title description prompt",
);
await replaceRequired(
  extractPath,
  `12. Configure, decide, or make sub-titles. Every non-empty subTitle and every in-content subtitle block must have a short definition. A subtitle block's definition explains that sub-title and does not replace the complete paragraph content.`,
  `12. Configure, decide, or make sub-titles. Every non-empty subTitle and every in-content subtitle block must have a specific 12–28 word source-grounded explanation. It does not replace complete paragraph content.`,
  "subtitle description prompt",
);
await replaceRequired(
  extractPath,
  `17. Every overview keyPoints item must be exactly one sectionTitle in the same order; do not generate unrelated key terms.`,
  `17. overview.keyPoints must contain every ordered non-empty title, including in-content title blocks, while excluding section titles and all sub-titles. Preserve title order and remove duplicates.`,
  "overview title terms prompt",
);
await replaceRequired(
  extractPath,
  `21. Actively inspect prose, bullets, numbered steps, and arrow notation for explicit pathways. When at least three entities or at least two ordered conversions are supported, include a diagram block in addition to complete explanatory text.`,
  `21. Actively inspect prose, bullets, numbered steps, and arrow notation for explicit pathways. When at least three entities or at least two ordered conversions are supported, place a detailed bullets or numbered block immediately before the diagram. The list must preserve the mechanism, enzymes, cofactors, regulation, exceptions, and clinical meaning; the diagram is only a simplified review.`,
  "diagram review list prompt",
);
await replaceRequired(
  extractPath,
  `22. Use metabolic, signal-transduction, gene-regulatory, disease-pharmacology, or generic diagramType as appropriate. Keep node labels concise and keep enzymes, cofactors, qualifications, and clinical detail in adjacent text. Never invent missing links.`,
  `22. Use metabolic, signal-transduction, gene-regulatory, disease-pharmacology, or generic diagramType as appropriate. Keep node labels concise. Never rely on the diagram alone and never invent missing links.`,
  "diagram simplification prompt",
);
await replaceRequired(
  extractPath,
  `23. Place each existing companion block at its logical point. The layout engine—not you—will choose image, then table, then list, then note for a right-side region and will use full width when none exists.`,
  `23. Place every block at its logical point. The layout engine may reserve the right side for an image or a supported table; lists, numbered lists, and notes remain in the normal left reading flow when no image is present.`,
  "left flow prompt",
);

const helperReplacement = `function wordsOf(value) {
  return clean(value).split(/\\s+/).filter(Boolean);
}

function ensureSentence(value) {
  const text = clean(value);
  if (!text) return "";
  return /[.!?]$/u.test(text) ? text : \`${"${text}"}.\`;
}

function rawBlockSummary(rawBlock) {
  if (!rawBlock || typeof rawBlock !== "object") return "";
  if (["title", "subtitle", "paragraph", "callout"].includes(rawBlock.type)) return clean(rawBlock.text);
  if (["bullets", "numbered"].includes(rawBlock.type)) return listItems(rawBlock.items).map((item) => item.text).join(" ");
  if (rawBlock.type === "table") return [rawBlock.label, ...(rawBlock.headers || []), ...(rawBlock.rows || []).flat()].map(clean).filter(Boolean).join(" ");
  if (rawBlock.type === "diagram") return [rawBlock.label, ...(rawBlock.diagramRows || []).flat()].map(clean).filter(Boolean).join(" ");
  if (rawBlock.type === "image") return clean(rawBlock.description || rawBlock.label);
  return "";
}

function definitionFallback(heading, role) {
  const subject = clean(heading);
  if (role === "section") return \`${"${subject}"} brings together the source-supported concepts, mechanisms, functions, relationships, and clinical implications developed throughout this part of the lecture.\`;
  if (role === "title") return \`${"${subject}"} is defined by the source-supported mechanisms, functions, relationships, and implications explained in the accompanying content.\`;
  return \`${"${subject}"} focuses the accompanying content on its source-supported details, sequence, and relationships.\`;
}

function deriveDefinition(candidates, heading, role, minimumWords, maximumWords) {
  const selected = [];
  const seen = new Set([key(heading)]);
  for (const candidate of candidates) {
    const text = clean(candidate);
    const normalized = key(text);
    if (!text || !normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    selected.push(text);
  }
  const words = wordsOf(selected.join(" "));
  if (words.length < minimumWords) words.push(...wordsOf(definitionFallback(heading, role)));
  return ensureSentence(words.slice(0, maximumWords).join(" ") || definitionFallback(heading, role));
}

function isDetailedReviewList(block) {
  if (!["bullets", "numbered"].includes(block?.type)) return false;
  const items = Array.isArray(block.items) ? block.items : [];
  return items.length >= 2 && items.reduce((sum, item) => sum + wordsOf(item?.text ?? item).length, 0) >= 10;
}

function diagramReviewItems(diagram) {
  const label = clean(diagram.label) || "the pathway";
  const items = [];
  const seen = new Set();
  for (const row of Array.isArray(diagram.diagramRows) ? diagram.diagramRows : []) {
    const nodes = row.map(clean).filter(Boolean);
    for (let index = 0; index < nodes.length - 1; index += 1) {
      const text = \`Review the ordered relationship from ${"${nodes[index]}"} to ${"${nodes[index + 1]}"} in ${"${label}"}.\`;
      if (!seen.has(key(text))) {
        seen.add(key(text));
        items.push({ text, level: 0 });
      }
    }
  }
  if (!items.length) items.push({ text: \`Review the named components and their source-supported order in ${"${label}"}.\`, level: 0 });
  if (items.length === 1) items.push({ text: \`Retain the detailed enzymes, cofactors, regulation, exceptions, and clinical context in the explanatory content before using ${"${label}"} as a visual review.\`, level: 0 });
  return items;
}

function ensureDiagramReviewLists(blocks, usedIds) {
  const output = [];
  let added = 0;
  for (const block of blocks) {
    if (block?.type === "diagram" && !isDetailedReviewList(output.at(-1))) {
      output.push({
        blockId: uniqueId(idPart(\`${"${block.blockId}"}-review-steps\`, "diagram-review-steps"), usedIds),
        type: "numbered",
        startAt: 1,
        items: diagramReviewItems(block),
        sourceReferences: [...(block.sourceReferences || [])],
      });
      added += 1;
    }
    output.push(block);
  }
  return { blocks: output, added };
}

function collectOrderedTitles(sections) {
  const titles = [];
  const seen = new Set();
  const remember = (value) => {
    const text = clean(value);
    const normalized = key(text);
    if (!text || seen.has(normalized)) return;
    seen.add(normalized);
    titles.push(text);
  };
  for (const section of sections) {
    for (const slide of section.slides || []) {
      remember(slide.slideTitle);
      for (const block of slide.blocks || []) if (block?.type === "title") remember(block.text);
    }
  }
  return titles;
}

`;

await replaceRange(
  extractPath,
  "function conciseDefinition",
  "function inferVisualType",
  helperReplacement,
  "definition and diagram helpers",
);

await replaceRequired(
  extractPath,
  `              const definition = deriveDefinition(
                [rawBlock?.definition, nextSummary],
                text,
                type === "title" ? "title" : "sub-title",
              );`,
  `              const definition = deriveDefinition(
                [rawBlock?.definition, nextSummary, rawBlockSummary(rawBlocks[blockIndex + 2])],
                text,
                type === "title" ? "title" : "sub-title",
                type === "title" ? 20 : 12,
                type === "title" ? 42 : 28,
              );`,
  "inline definition normalization",
);
await replaceRequired(
  extractPath,
  `        if (block) blocks.push(block);
      }

      if (blocks.length) {`,
  `        if (block) blocks.push(block);
      }

      const diagramNormalized = ensureDiagramReviewLists(blocks, usedIds);
      blocks.splice(0, blocks.length, ...diagramNormalized.blocks);
      if (diagramNormalized.added) warnings.push(\`${"${diagramNormalized.added}"} detailed pathway review list(s) were added before simplified diagrams.\`);

      if (blocks.length) {`,
  "diagram list insertion",
);
await replaceRequired(
  extractPath,
  `          ? deriveDefinition([rawSlide?.titleDefinition, slideSubtitle, firstSupportingText], slideTitle, "title")`,
  `          ? deriveDefinition([rawSlide?.titleDefinition, slideSubtitle, firstSupportingText, ...rawBlocks.slice(1, 3).map(rawBlockSummary)], slideTitle, "title", 20, 42)`,
  "slide title definition",
);
await replaceRequired(
  extractPath,
  `          ? deriveDefinition([rawSlide?.subtitleDefinition, firstSupportingText], slideSubtitle, "sub-title")`,
  `          ? deriveDefinition([rawSlide?.subtitleDefinition, firstSupportingText], slideSubtitle, "sub-title", 12, 28)`,
  "slide subtitle definition",
);
await replaceRequired(
  extractPath,
  `      ], sectionTitle, "section");`,
  `        ...slides.slice(1, 3).flatMap((slide) => [slide.titleDefinition, slide.blocks?.find((block) => block.type === "paragraph")?.text]),
      ], sectionTitle, "section", 35, 65);`,
  "section definition",
);
await replaceRequired(
  extractPath,
  `        keyPoints: sections.map((section) => section.sectionTitle),`,
  `        keyPoints: collectOrderedTitles(sections),`,
  "overview ordered titles",
);

await replaceRequired(
  "scripts/build.mjs",
  `const assetVersion = "20260726-claude-output-import";`,
  `const assetVersion = "20260726-dense-content-spacing";`,
  "build asset version",
);
await replaceRequired(
  "tests/unit/csp-scan.test.mjs",
  `const assetVersion = "20260726-claude-output-import";`,
  `const assetVersion = "20260726-dense-content-spacing";`,
  "CSP asset version",
);

await replaceRequired(
  "tests/unit/extract-function.test.mjs",
  `  assert.deepEqual(lecture.overview.keyPoints, ["Carbohydrate Metabolism"]);`,
  `  assert.deepEqual(lecture.overview.keyPoints, ["Glycolysis"]);`,
  "extract title terms assertion",
);
await replaceRequired(
  "tests/unit/extract-function.test.mjs",
  `  assert.equal(lecture.sections[0].slides[1].blocks[1].diagramType, "metabolic");`,
  `  assert.equal(lecture.sections[0].slides[1].blocks[1].type, "numbered");
  assert.ok(lecture.sections[0].slides[1].blocks[1].items.length >= 2);
  assert.equal(lecture.sections[0].slides[1].blocks[2].diagramType, "metabolic");`,
  "diagram review list assertion",
);
await replaceRequired(
  "tests/unit/extract-function.test.mjs",
  `  assert.match(extractionPrompt, /unmappedSourceReferences/i);`,
  `  assert.match(extractionPrompt, /unmappedSourceReferences/i);
  assert.match(extractionPrompt, /35–65 word/i);
  assert.match(extractionPrompt, /20–42 word/i);
  assert.match(extractionPrompt, /every ordered non-empty title/i);
  assert.match(extractionPrompt, /detailed bullets or numbered block immediately before the diagram/i);
  assert.match(extractionPrompt, /about 90% of a slide/i);`,
  "dense extraction prompt assertions",
);
await replaceRequired(
  "tests/unit/extract-function.test.mjs",
  `  assert.equal(lecture.sections[0].sectionDefinition, hierarchical.sections[0].sectionDefinition);`,
  `  assert.ok(lecture.sections[0].sectionDefinition.startsWith(hierarchical.sections[0].sectionDefinition));
  assert.ok(lecture.sections[0].sectionDefinition.split(/\\s+/).length >= 35);`,
  "section description length assertion",
);
await replaceRequired(
  "tests/unit/extract-function.test.mjs",
  `  assert.equal(lecture.sections[0].slides[0].titleDefinition, hierarchical.sections[0].slides[0].titleDefinition);`,
  `  assert.ok(lecture.sections[0].slides[0].titleDefinition.startsWith(hierarchical.sections[0].slides[0].titleDefinition));
  assert.ok(lecture.sections[0].slides[0].titleDefinition.split(/\\s+/).length >= 20);`,
  "title description length assertion",
);

await replaceRequired(
  "README.md",
  `The generated PPTX contains editable text, native bullets and numbering, native tables, native shapes and connectors, and imported image objects. Gemini and Claude output do not need to contain source image bytes.`,
  `The generated PPTX contains editable text, native bullets and numbering, native tables, native shapes and connectors, and imported image objects. Gemini and Claude output do not need to contain source image bytes. Dense content plans target 60%–100% utilization, prefer approximately 90%, keep lists and notes in the left reading flow, use every ordered title in the overview key-terms box, and place a detailed review list before each simplified pathway diagram.`,
  "README dense contract",
);
