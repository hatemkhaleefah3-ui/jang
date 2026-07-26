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

function conciseDefinition(value, maximumWords = 30) {
  const normalized = cleanText(value);
  if (!normalized) return "";
  const firstSentence = normalized.match(/^.*?(?:[.!?]|$)/u)?.[0] || normalized;
  const words = firstSentence.split(/\s+/).filter(Boolean);
  const result = words.slice(0, maximumWords).join(" ");
  return /[.!?]$/u.test(result) ? result : `${result}.`;
}

function listItemText(item) {
  return typeof item === "string" ? item : item?.text;
}

function blockSummary(block) {
  if (!block || typeof block !== "object") return "";
  if (["title", "subtitle", "paragraph"].includes(block.type)) return cleanText(block.text);
  if (["bullets", "numbered"].includes(block.type)) return cleanText(listItemText(block.items?.[0]));
  if (block.type === "callout") return cleanText(block.text || block.label);
  if (["table", "diagram"].includes(block.type)) return cleanText(block.label);
  if (block.type === "image") return cleanText(block.description || block.label);
  return "";
}

function deriveDefinition(candidates, heading, role) {
  for (const candidate of candidates) {
    const definition = conciseDefinition(candidate);
    if (definition && textKey(definition) !== textKey(heading)) return definition;
  }
  return `This ${role} organizes the lecture content about ${cleanText(heading)}.`;
}

function firstParagraphText(slides) {
  for (const slide of slides || []) {
    const paragraph = (slide.blocks || []).find((block) => block?.type === "paragraph");
    const text = blockSummary(paragraph);
    if (text) return text;
  }
  return "";
}

/**
 * Claude output is allowed to omit schema-optional hierarchy definitions, but
 * the schema 1.2 engine requires them semantically. Fill only missing values,
 * using the same adjacent-source derivation strategy as Gemini normalization.
 */
export function normalizeClaudeLectureHierarchy(lecture) {
  let generatedDefinitions = 0;

  const sections = (lecture.sections || []).map((section) => {
    const slides = (section.slides || []).map((slide) => {
      const sourceBlocks = Array.isArray(slide.blocks) ? slide.blocks : [];
      const blocks = sourceBlocks.map((block, blockIndex) => {
        if (!["title", "subtitle"].includes(block?.type) || cleanText(block.definition)) return block;
        generatedDefinitions += 1;
        return {
          ...block,
          definition: deriveDefinition(
            [blockSummary(sourceBlocks[blockIndex + 1])],
            block.text,
            block.type === "title" ? "title" : "sub-title",
          ),
        };
      });

      const firstSupportingText = blocks.map(blockSummary).find(Boolean) || "";
      const slideTitle = cleanText(slide.slideTitle);
      const slideSubtitle = cleanText(slide.slideSubtitle);
      let titleDefinition = slide.titleDefinition;
      let subtitleDefinition = slide.subtitleDefinition;

      if (slideTitle && !cleanText(titleDefinition)) {
        generatedDefinitions += 1;
        titleDefinition = deriveDefinition(
          [slideSubtitle, firstSupportingText],
          slideTitle,
          "title",
        );
      }
      if (slideSubtitle && !cleanText(subtitleDefinition)) {
        generatedDefinitions += 1;
        subtitleDefinition = deriveDefinition(
          [firstSupportingText, titleDefinition],
          slideSubtitle,
          "sub-title",
        );
      }

      return {
        ...slide,
        ...(slideTitle ? { titleDefinition } : {}),
        ...(slideSubtitle ? { subtitleDefinition } : {}),
        blocks,
      };
    });

    let sectionDefinition = section.sectionDefinition;
    if (cleanText(section.sectionTitle) && !cleanText(sectionDefinition)) {
      generatedDefinitions += 1;
      sectionDefinition = deriveDefinition(
        [
          slides[0]?.titleDefinition,
          slides[0]?.subtitleDefinition,
          firstParagraphText(slides),
        ],
        section.sectionTitle,
        "section",
      );
    }

    return { ...section, sectionDefinition, slides };
  });

  const expectedKeyPoints = sections.map((section) => section.sectionTitle);
  const originalKeyPoints = Array.isArray(lecture.overview?.keyPoints) ? lecture.overview.keyPoints : [];
  const keyPointsChanged = JSON.stringify(originalKeyPoints.map(cleanText)) !== JSON.stringify(expectedKeyPoints.map(cleanText));

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
      for (const block of slide.blocks || []) {
        remember("block", block.blockId, slide.slideTitle || slide.slideId || "slide");
      }
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
    importWarnings.push(`Jang completed ${normalized.generatedDefinitions} missing hierarchy definition${normalized.generatedDefinitions === 1 ? "" : "s"} from adjacent lecture content.`);
  }
  if (normalized.keyPointsChanged) {
    importWarnings.push("Overview key points were aligned to the ordered section titles required by schema 1.2.");
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
