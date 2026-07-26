import { createStaticSchemaValidator } from "./lecture-validator.js";
import { validateLecture } from "./pptx-engine.js";

export const MAX_CLAUDE_JSON_BYTES = 20_000_000;

function extensionOf(file) {
  const match = String(file?.name || "").toLowerCase().match(/\.([^.]+)$/);
  return match?.[1] || "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function plainText(value) {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value.map((run) => String(run?.text || "")).join("");
}

function cleanText(value) {
  return plainText(value).replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function textKey(value) {
  return cleanText(value).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function wordsOf(value) {
  return cleanText(value).split(/\s+/).filter(Boolean);
}

function ensureSentence(value) {
  const text = cleanText(value);
  if (!text) return "";
  return /[.!?]$/u.test(text) ? text : `${text}.`;
}

function listItemText(item) {
  return typeof item === "string" ? item : item?.text;
}

function blockSummary(block) {
  if (!block || typeof block !== "object") return "";
  if (["title", "subtitle", "paragraph"].includes(block.type)) return cleanText(block.text);
  if (["bullets", "numbered"].includes(block.type)) {
    return (block.items || []).map((item) => cleanText(listItemText(item))).filter(Boolean).join(" ");
  }
  if (block.type === "callout") return cleanText(block.text || block.label);
  if (block.type === "table") {
    return [block.label, ...(block.headers || []), ...(block.rows || []).flat()].map(cleanText).filter(Boolean).join(" ");
  }
  if (block.type === "diagram") {
    return [block.label, ...(block.diagramRows || []).flat()].map(cleanText).filter(Boolean).join(" ");
  }
  if (block.type === "image") return cleanText(block.description || block.label);
  return "";
}

function definitionFallback(heading, role) {
  const subject = cleanText(heading);
  if (role === "section") {
    return `${subject} brings together the source-supported concepts, mechanisms, functions, relationships, and clinical implications developed throughout this part of the lecture.`;
  }
  if (role === "title") {
    return `${subject} is defined by the source-supported mechanisms, functions, relationships, and implications explained in the accompanying content.`;
  }
  return `${subject} focuses the accompanying content on its source-supported details, sequence, and relationships.`;
}

function deriveDefinition(candidates, heading, role, minimumWords, maximumWords) {
  const selected = [];
  const seen = new Set([textKey(heading)]);
  for (const candidate of candidates) {
    const text = cleanText(candidate);
    const key = textKey(text);
    if (!text || !key || seen.has(key)) continue;
    seen.add(key);
    selected.push(text);
  }

  const combined = selected.join(" ");
  const words = wordsOf(combined);
  if (words.length < minimumWords) words.push(...wordsOf(definitionFallback(heading, role)));
  const result = words.slice(0, maximumWords).join(" ");
  return ensureSentence(result || definitionFallback(heading, role));
}

function firstParagraphText(slides) {
  for (const slide of slides || []) {
    const paragraph = (slide.blocks || []).find((block) => block?.type === "paragraph");
    const text = blockSummary(paragraph);
    if (text) return text;
  }
  return "";
}

function collectExistingBlockIds(lecture) {
  const ids = new Set();
  for (const section of lecture.sections || []) {
    for (const slide of section.slides || []) {
      for (const block of slide.blocks || []) if (block?.blockId) ids.add(block.blockId);
    }
  }
  return ids;
}

function uniqueGeneratedId(base, used) {
  let value = base;
  let suffix = 2;
  while (used.has(value)) value = `${base}-${suffix++}`;
  used.add(value);
  return value;
}

function isDetailedReviewList(block) {
  if (!["bullets", "numbered"].includes(block?.type)) return false;
  const items = Array.isArray(block.items) ? block.items : [];
  const wordCount = items.reduce((sum, item) => sum + wordsOf(listItemText(item)).length, 0);
  return items.length >= 2 && wordCount >= 10;
}

function diagramReviewItems(diagram) {
  const label = cleanText(diagram.label) || "the pathway";
  const items = [];
  const seen = new Set();
  for (const row of Array.isArray(diagram.diagramRows) ? diagram.diagramRows : []) {
    const nodes = row.map(cleanText).filter(Boolean);
    for (let index = 0; index < nodes.length - 1; index += 1) {
      const text = `Review the ordered relationship from ${nodes[index]} to ${nodes[index + 1]} in ${label}.`;
      const key = textKey(text);
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ text, level: 0 });
      }
    }
  }
  if (!items.length) {
    items.push({ text: `Review the named components and their source-supported order in ${label}.`, level: 0 });
  }
  if (items.length === 1) {
    items.push({
      text: `Retain the detailed enzymes, cofactors, regulation, exceptions, and clinical context in the explanatory content before using ${label} as a visual review.`,
      level: 0,
    });
  }
  return items;
}

function ensureDiagramReviewLists(blocks, usedBlockIds) {
  const output = [];
  let added = 0;
  for (const block of blocks) {
    if (block?.type === "diagram" && !isDetailedReviewList(output.at(-1))) {
      output.push({
        blockId: uniqueGeneratedId(`${block.blockId}-review-steps`, usedBlockIds),
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
    const text = cleanText(value);
    const key = textKey(text);
    if (!text || seen.has(key)) return;
    seen.add(key);
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

/**
 * Normalize Claude JSON into the complete schema 1.2 semantic contract.
 * Existing source-specific content is retained; short or missing hierarchy
 * descriptions are expanded from adjacent content, and every diagram receives
 * a detailed review list before the simplified visual.
 */
export function normalizeClaudeLectureHierarchy(lecture) {
  let generatedDefinitions = 0;
  let diagramListsAdded = 0;
  const usedBlockIds = collectExistingBlockIds(lecture);

  const sections = (lecture.sections || []).map((section) => {
    const slides = (section.slides || []).map((slide) => {
      const sourceBlocks = Array.isArray(slide.blocks) ? slide.blocks : [];
      const definedBlocks = sourceBlocks.map((block, blockIndex) => {
        if (!["title", "subtitle"].includes(block?.type)) return block;
        const nextSummaries = sourceBlocks.slice(blockIndex + 1, blockIndex + 4).map(blockSummary);
        const role = block.type === "title" ? "title" : "sub-title";
        const minimum = block.type === "title" ? 20 : 12;
        const maximum = block.type === "title" ? 42 : 28;
        const definition = deriveDefinition(
          [block.definition, ...nextSummaries],
          block.text,
          role,
          minimum,
          maximum,
        );
        if (textKey(definition) !== textKey(block.definition)) generatedDefinitions += 1;
        return { ...block, definition };
      });

      const diagramNormalized = ensureDiagramReviewLists(definedBlocks, usedBlockIds);
      diagramListsAdded += diagramNormalized.added;
      const blocks = diagramNormalized.blocks;
      const firstSupportingText = blocks.map(blockSummary).find(Boolean) || "";
      const slideTitle = cleanText(slide.slideTitle);
      const slideSubtitle = cleanText(slide.slideSubtitle);
      let titleDefinition = slide.titleDefinition;
      let subtitleDefinition = slide.subtitleDefinition;

      if (slideTitle) {
        const normalizedDefinition = deriveDefinition(
          [titleDefinition, slideSubtitle, firstSupportingText, ...blocks.slice(1, 3).map(blockSummary)],
          slideTitle,
          "title",
          20,
          42,
        );
        if (textKey(normalizedDefinition) !== textKey(titleDefinition)) generatedDefinitions += 1;
        titleDefinition = normalizedDefinition;
      }
      if (slideSubtitle) {
        const normalizedDefinition = deriveDefinition(
          [subtitleDefinition, firstSupportingText, titleDefinition],
          slideSubtitle,
          "sub-title",
          12,
          28,
        );
        if (textKey(normalizedDefinition) !== textKey(subtitleDefinition)) generatedDefinitions += 1;
        subtitleDefinition = normalizedDefinition;
      }

      return {
        ...slide,
        ...(slideTitle ? { titleDefinition } : {}),
        ...(slideSubtitle ? { subtitleDefinition } : {}),
        blocks,
      };
    });

    const sectionCandidates = [
      section.sectionDefinition,
      ...slides.slice(0, 3).flatMap((slide) => [
        slide.titleDefinition,
        slide.subtitleDefinition,
        ...(slide.blocks || []).slice(0, 2).map(blockSummary),
      ]),
      firstParagraphText(slides),
    ];
    const sectionDefinition = deriveDefinition(
      sectionCandidates,
      section.sectionTitle,
      "section",
      35,
      65,
    );
    if (textKey(sectionDefinition) !== textKey(section.sectionDefinition)) generatedDefinitions += 1;
    return { ...section, sectionDefinition, slides };
  });

  const expectedKeyPoints = collectOrderedTitles(sections);
  const originalKeyPoints = Array.isArray(lecture.overview?.keyPoints) ? lecture.overview.keyPoints : [];
  const keyPointsChanged = JSON.stringify(originalKeyPoints.map(cleanText)) !== JSON.stringify(expectedKeyPoints);

  return {
    lecture: {
      ...lecture,
      overview: {
        ...lecture.overview,
        keyPoints: expectedKeyPoints,
      },
      sections,
    },
    generatedDefinitions,
    diagramListsAdded,
    keyPointsChanged,
  };
}

function formatValidationErrors(errors, limit = 12) {
  const details = (Array.isArray(errors) ? errors : []).slice(0, limit).map((error) => {
    if (typeof error === "string") return error;
    const path = error.instancePath || "/";
    return `${path} ${error.message || "is invalid"}`;
  });
  return details.length ? details.join("; ") : "The lecture document is invalid.";
}

function assertUniqueIdentifiers(lecture) {
  const seen = new Map();
  const remember = (kind, id, context) => {
    if (!id) return;
    const key = `${kind}:${id}`;
    if (seen.has(key)) throw new Error(`Duplicate ${kind} identifier “${id}” in ${context}; first used in ${seen.get(key)}.`);
    seen.set(key, context);
  };

  for (const section of lecture.sections || []) {
    remember("section", section.sectionId, section.sectionTitle || "section");
    for (const slide of section.slides || []) {
      remember("slide", slide.slideId, slide.slideTitle || section.sectionTitle || "slide");
      for (const block of slide.blocks || []) remember("block", block.blockId, slide.slideTitle || slide.slideId || "slide");
    }
  }
}

export function selectClaudeOutputFile(fileList) {
  const files = Array.from(fileList || []);
  if (files.length !== 1) throw new Error("Choose exactly one Claude .json file.");
  const [jsonFile] = files;
  if (extensionOf(jsonFile) !== "json") throw new Error("Choose a valid Claude .json file.");
  if (Number(jsonFile.size) > MAX_CLAUDE_JSON_BYTES) throw new Error("The Claude JSON file must be 20 MB or smaller.");
  return jsonFile;
}

export function collectLectureImageSlots(lecture) {
  const slots = [];
  const usedSlotIds = new Set();

  for (const section of lecture.sections || []) {
    for (const slide of section.slides || []) {
      for (const block of slide.blocks || []) {
        if (block?.type !== "image") continue;
        if (usedSlotIds.has(block.slotId)) throw new Error(`Duplicate image slot identifier “${block.slotId}”.`);
        usedSlotIds.add(block.slotId);
        slots.push({
          slotId: block.slotId,
          label: plainText(block.label) || "Lecture image",
          description: plainText(block.description) || "Choose the matching lecture image.",
          fit: block.fit || "contain",
          preferredAspect: block.preferredAspect || "automatic",
          orientation: block.orientation || "automatic",
          visualType: block.visualType || "other",
          sourceReference: block.sourceReference || block.sourceReferences?.[0] || "",
          sectionTitle: section.sectionTitle || "",
          slideTitle: slide.slideTitle || "",
          slideSubtitle: plainText(slide.slideSubtitle),
        });
      }
    }
  }

  return slots;
}

export function parseClaudeOutputText(text, schema) {
  let payload;
  try {
    payload = JSON.parse(String(text || "").replace(/^\uFEFF/, ""));
  } catch {
    throw new Error("The Claude JSON file is not valid JSON.");
  }

  const sourceLecture = isObject(payload?.lecture) ? payload.lecture : payload;
  if (!isObject(sourceLecture)) throw new Error("The Claude JSON must contain a lecture object.");

  const validateSchema = createStaticSchemaValidator(schema);
  if (!validateSchema(sourceLecture)) {
    throw new Error(`The Claude JSON does not match the Jang lecture schema: ${formatValidationErrors(validateSchema.errors)}`);
  }

  assertUniqueIdentifiers(sourceLecture);
  const normalized = normalizeClaudeLectureHierarchy(sourceLecture);
  const lecture = normalized.lecture;
  assertUniqueIdentifiers(lecture);

  if (!validateSchema(lecture)) {
    throw new Error(`The normalized Claude JSON does not match the Jang lecture schema: ${formatValidationErrors(validateSchema.errors)}`);
  }

  const semanticValidation = validateLecture(lecture);
  if (!semanticValidation.valid) {
    throw new Error(`The Claude JSON does not satisfy the complete Jang lecture contract: ${formatValidationErrors(semanticValidation.errors)}`);
  }

  const derivedSlots = collectLectureImageSlots(lecture);
  const declaredSlots = Array.isArray(payload?.imageSlots) ? payload.imageSlots : [];
  const declaredById = new Map();
  for (const slot of declaredSlots) {
    const slotId = String(slot?.slotId || "").trim();
    if (!slotId) continue;
    if (declaredById.has(slotId)) throw new Error(`Duplicate top-level image slot identifier “${slotId}”.`);
    declaredById.set(slotId, slot);
  }

  const imageSlots = derivedSlots.map((slot) => {
    const declared = declaredById.get(slot.slotId);
    if (!isObject(declared)) return slot;
    return {
      ...slot,
      label: plainText(declared.label) || slot.label,
      description: plainText(declared.description) || slot.description,
      sourceReference: String(declared.sourceReference || slot.sourceReference),
      sectionTitle: String(declared.sectionTitle || slot.sectionTitle),
      slideTitle: String(declared.slideTitle || slot.slideTitle),
      slideSubtitle: plainText(declared.slideSubtitle) || slot.slideSubtitle,
    };
  });

  const derivedIds = new Set(derivedSlots.map((slot) => slot.slotId));
  const unusedDeclaredSlots = [...declaredById.keys()].filter((slotId) => !derivedIds.has(slotId));
  const importWarnings = unusedDeclaredSlots.map((slotId) => `Top-level image slot “${slotId}” has no matching image block and was ignored.`);
  if (normalized.generatedDefinitions) {
    importWarnings.push(`Jang completed or expanded ${normalized.generatedDefinitions} hierarchy description${normalized.generatedDefinitions === 1 ? "" : "s"} from adjacent lecture content.`);
  }
  if (normalized.diagramListsAdded) {
    importWarnings.push(`Jang added ${normalized.diagramListsAdded} detailed review list${normalized.diagramListsAdded === 1 ? "" : "s"} before pathway diagrams that did not include one.`);
  }
  if (normalized.keyPointsChanged) {
    importWarnings.push("Overview key terms were aligned to every ordered title, excluding section titles and sub-titles.");
  }

  return { lecture, imageSlots, importWarnings };
}

let schemaPromise;
export function loadLectureSchema(schemaUrl = "./lecture-schema.json") {
  if (!schemaPromise) {
    schemaPromise = fetch(schemaUrl, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("The Jang lecture schema could not be loaded.");
      return response.json();
    });
  }
  return schemaPromise;
}
