import { createStaticSchemaValidator } from "./lecture-validator.js";

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

function formatValidationErrors(errors, limit = 6) {
  const details = (Array.isArray(errors) ? errors : []).slice(0, limit).map((error) => {
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
    payload = JSON.parse(String(text || ""));
  } catch {
    throw new Error("The Claude JSON file is not valid JSON.");
  }

  const lecture = isObject(payload?.lecture) ? payload.lecture : payload;
  if (!isObject(lecture)) throw new Error("The Claude JSON must contain a lecture object.");

  const validate = createStaticSchemaValidator(schema);
  if (!validate(lecture)) {
    throw new Error(`The Claude JSON does not match the Jang lecture schema: ${formatValidationErrors(validate.errors)}`);
  }

  assertUniqueIdentifiers(lecture);
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
  return {
    lecture,
    imageSlots,
    importWarnings: unusedDeclaredSlots.map((slotId) => `Top-level image slot “${slotId}” has no matching image block and was ignored.`),
  };
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
