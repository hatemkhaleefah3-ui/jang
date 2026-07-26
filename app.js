import { buildLecturePptxFile } from "./pptx-output.js";
import { extractPptxManifest } from "./pptx-reader.js";
import { lectureFileSignature, selectedFileFromInput, validateLectureFile } from "./lecture-file.js";
import { loadLectureSchema, parseClaudeOutputText, selectClaudeOutputFiles } from "./claude-import.js";

const fileInput = document.querySelector("#lectureFile");
const fileButtonText = document.querySelector("#fileButtonText");
const fileCard = document.querySelector("#fileCard");
const fileTypeMark = document.querySelector("#fileTypeMark");
const fileName = document.querySelector("#fileName");
const fileMeta = document.querySelector("#fileMeta");
const lectureOption = document.querySelector("#lectureImportOption");
const claudeOption = document.querySelector("#claudeImportOption");
const lecturePanel = document.querySelector("#lectureImportPanel");
const claudePanel = document.querySelector("#claudeImportPanel");
const claudeFilesInput = document.querySelector("#claudeFiles");
const claudePairCard = document.querySelector("#claudePairCard");
const claudeJsonName = document.querySelector("#claudeJsonName");
const claudeJsonMeta = document.querySelector("#claudeJsonMeta");
const claudePptxName = document.querySelector("#claudePptxName");
const claudePptxMeta = document.querySelector("#claudePptxMeta");
const action = document.querySelector("#actionButton");
const actionLabel = document.querySelector("#actionLabel");
const status = document.querySelector("#status");
const review = document.querySelector("#imageReview");
const reviewSummary = document.querySelector("#reviewSummary");
const coverageAudit = document.querySelector("#coverageAudit");
const imageSlots = document.querySelector("#imageSlots");

let importMode = "lecture";
let selectedFile = null;
let selectedFileSignature = "";
let selectedClaudeJson = null;
let selectedClaudePptx = null;
let extraction = null;
let generated = null;
let state = "idle";
const selectedImages = new Map();

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function setStatus(message, tone = "") {
  status.textContent = message;
  status.dataset.tone = tone;
}

function setState(nextState) {
  state = nextState;
  action.dataset.state = nextState;
  action.disabled = nextState === "idle" || nextState === "extracting" || nextState === "building";
  const labels = {
    idle: "Build PPTX",
    ready: "Build PPTX",
    extracting: "Loading…",
    building: "Building PPTX…",
    review: "Continue",
    complete: "Download PPTX",
  };
  actionLabel.textContent = labels[nextState];
  action.setAttribute("aria-busy", ["extracting", "building"].includes(nextState) ? "true" : "false");
}

function resetResult() {
  extraction = null;
  generated = null;
  selectedImages.clear();
  imageSlots.replaceChildren();
  review.hidden = true;
  if (coverageAudit) {
    coverageAudit.hidden = true;
    coverageAudit.replaceChildren();
  }
}

function setImportMode(nextMode, announce = true) {
  importMode = nextMode === "claude" ? "claude" : "lecture";
  const isLecture = importMode === "lecture";
  lecturePanel.hidden = !isLecture;
  claudePanel.hidden = isLecture;
  lectureOption.dataset.active = isLecture ? "true" : "false";
  claudeOption.dataset.active = isLecture ? "false" : "true";
  lectureOption.setAttribute("aria-selected", isLecture ? "true" : "false");
  claudeOption.setAttribute("aria-selected", isLecture ? "false" : "true");
  resetResult();

  if (isLecture && selectedFile) {
    setState("ready");
    if (announce) setStatus(`${selectedFile.name} is selected and ready for Gemini extraction.`, "success");
  } else if (!isLecture && selectedClaudeJson && selectedClaudePptx) {
    setState("ready");
    if (announce) setStatus("The Claude JSON and companion PPTX are selected and ready for validation.", "success");
  } else {
    setState("idle");
    if (announce) {
      setStatus(isLecture
        ? "Import a PDF or PPTX lecture to begin."
        : "Choose the Claude JSON and companion PPTX together to begin.");
    }
  }
}

function selectLectureFile(file) {
  if (!file) return false;
  const extension = validateLectureFile(file);
  selectedFile = file;
  selectedFileSignature = lectureFileSignature(file);
  resetResult();
  fileCard.hidden = false;
  if (fileTypeMark) fileTypeMark.textContent = extension.toUpperCase();
  fileName.textContent = file.name;
  fileMeta.textContent = `${extension.toUpperCase()} · ${formatBytes(file.size)}`;
  fileButtonText.textContent = "Choose another file";
  setState("ready");
  setStatus(`${file.name} is selected and ready for Gemini extraction.`, "success");
  return true;
}

function clearLectureSelection(message, tone = "error") {
  selectedFile = null;
  selectedFileSignature = "";
  resetResult();
  fileInput.value = "";
  fileCard.hidden = true;
  if (fileTypeMark) fileTypeMark.textContent = "DOC";
  fileButtonText.textContent = "Choose PDF or PPTX";
  setState("idle");
  setStatus(message, tone);
}

function showClaudePair(jsonFile, pptxFile) {
  selectedClaudeJson = jsonFile;
  selectedClaudePptx = pptxFile;
  resetResult();
  claudePairCard.hidden = false;
  claudeJsonName.textContent = jsonFile.name;
  claudeJsonMeta.textContent = `JSON · ${formatBytes(jsonFile.size)}`;
  claudePptxName.textContent = pptxFile.name;
  claudePptxMeta.textContent = `PPTX · ${formatBytes(pptxFile.size)}`;
  setState("ready");
  setStatus("The Claude JSON and companion PPTX are selected and ready for validation.", "success");
}

function clearClaudeSelection(message, tone = "error") {
  selectedClaudeJson = null;
  selectedClaudePptx = null;
  resetResult();
  claudeFilesInput.value = "";
  claudePairCard.hidden = true;
  setState("idle");
  setStatus(message, tone);
}

function scheduleAfterPickerClose(callback) {
  if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(callback);
  else window.setTimeout(callback, 0);
}

function handleLectureFileSelection(event) {
  const input = event.currentTarget;
  const file = selectedFileFromInput(input);
  if (!file) {
    if (!selectedFile) setStatus("No file was selected. Choose a PDF or PPTX lecture.", "error");
    return;
  }
  const signature = lectureFileSignature(file);
  if (selectedFile && signature === selectedFileSignature) return;
  scheduleAfterPickerClose(() => {
    const currentFile = selectedFileFromInput(input);
    if (!currentFile || lectureFileSignature(currentFile) !== signature) return;
    try {
      selectLectureFile(currentFile);
    } catch (error) {
      clearLectureSelection(error instanceof Error ? error.message : "The selected file could not be imported.");
    }
  });
}

function handleClaudeFilesSelection(event) {
  const input = event.currentTarget;
  if (!input.files?.length) {
    if (!selectedClaudeJson || !selectedClaudePptx) setStatus("Choose one Claude JSON file and one Claude PPTX file.", "error");
    return;
  }
  scheduleAfterPickerClose(() => {
    try {
      const { jsonFile, pptxFile } = selectClaudeOutputFiles(input.files);
      showClaudePair(jsonFile, pptxFile);
    } catch (error) {
      clearClaudeSelection(error instanceof Error ? error.message : "The Claude output files could not be imported.");
    }
  });
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Choose an image file."));
      return;
    }
    if (file.size > 15_000_000) {
      reject(new Error("Images must be smaller than 15 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}

function createImageSlotCard(slot, index) {
  const card = document.createElement("article");
  card.className = "image-slot";

  const copy = document.createElement("div");
  copy.className = "image-slot-copy";

  const reference = document.createElement("p");
  reference.className = "image-slot-reference";
  reference.textContent = slot.sourceReference || slot.slideTitle || slot.sectionTitle || `Image position ${index + 1}`;

  const heading = document.createElement("h3");
  heading.textContent = slot.label;

  const description = document.createElement("p");
  description.className = "image-slot-description";
  description.textContent = slot.description || `Choose the image that matches ${slot.label}.`;

  const details = document.createElement("p");
  details.className = "image-slot-meta";
  details.textContent = `${slot.orientation || "automatic"} · ${slot.preferredAspect || "automatic"} · ${slot.fit}`;

  copy.append(reference, heading, description, details);

  const preview = document.createElement("div");
  preview.className = `image-slot-preview image-slot-preview-${slot.preferredAspect || "automatic"}`;
  preview.dataset.fit = slot.fit;
  const empty = document.createElement("span");
  empty.textContent = "No image selected";
  preview.append(empty);

  const controls = document.createElement("div");
  controls.className = "image-slot-controls";

  const inputId = `slot-image-${index}`;
  const input = document.createElement("input");
  input.className = "visually-hidden";
  input.id = inputId;
  input.type = "file";
  input.accept = "image/*";

  const importLabel = document.createElement("label");
  importLabel.className = "slot-import-button";
  importLabel.htmlFor = inputId;
  importLabel.textContent = "Import image";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "slot-remove-button";
  remove.textContent = "Remove";
  remove.hidden = true;

  input.addEventListener("change", async () => {
    const imageFile = input.files?.[0];
    input.value = "";
    if (!imageFile) return;
    try {
      const dataUrl = await readImage(imageFile);
      selectedImages.set(slot.slotId, { dataUrl, name: imageFile.name });
      preview.replaceChildren();
      const image = document.createElement("img");
      image.src = dataUrl;
      image.alt = slot.label;
      preview.append(image);
      importLabel.textContent = "Change image";
      remove.hidden = false;
      setStatus(`${imageFile.name} added for “${slot.label}”.`, "success");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "The image could not be imported.", "error");
    }
  });

  remove.addEventListener("click", () => {
    selectedImages.delete(slot.slotId);
    preview.replaceChildren();
    const placeholder = document.createElement("span");
    placeholder.textContent = "No image selected";
    preview.append(placeholder);
    importLabel.textContent = "Import image";
    remove.hidden = true;
    setStatus(`Image removed from “${slot.label}”.`);
  });

  controls.append(input, importLabel, remove);
  card.append(copy, preview, controls);
  return card;
}

function showCoverage(result, extraWarnings = []) {
  if (!coverageAudit) return;
  const audit = result.lecture?.extractionAudit;
  const warnings = [
    ...(Array.isArray(audit?.warnings) ? audit.warnings : []),
    ...(Array.isArray(extraWarnings) ? extraWarnings : []),
  ];
  if (!audit && !warnings.length) return;

  const covered = Array.isArray(audit?.coveredSourceReferences) ? audit.coveredSourceReferences.length : 0;
  const unmapped = Array.isArray(audit?.unmappedSourceReferences) ? audit.unmappedSourceReferences : [];
  const total = Number(audit?.sourcePageOrSlideCount) || 0;
  coverageAudit.hidden = false;
  coverageAudit.dataset.tone = unmapped.length || warnings.length ? "warning" : "success";

  if (audit) {
    const coverageLine = document.createElement("strong");
    coverageLine.textContent = total
      ? `Source audit: ${Math.max(0, total - unmapped.length)} of ${total} source ${audit.sourceType === "pptx" ? "slides" : "pages"} mapped.`
      : `Source audit: ${covered} source references recorded.`;
    coverageAudit.append(coverageLine);
  }
  if (unmapped.length) {
    const detail = document.createElement("p");
    detail.textContent = `Unmapped: ${unmapped.join(", ")}`;
    coverageAudit.append(detail);
  }
  if (warnings.length) {
    const detail = document.createElement("p");
    detail.textContent = warnings.join(" ");
    coverageAudit.append(detail);
  }
}

function showIntermediateStep(result, context = {}) {
  extraction = result;
  selectedImages.clear();
  imageSlots.replaceChildren();
  coverageAudit?.replaceChildren();
  const slots = Array.isArray(result.imageSlots) ? result.imageSlots : [];
  const isClaude = context.origin === "claude";
  review.hidden = false;
  if (isClaude) {
    const companion = context.companionSlideCount
      ? ` The companion PPTX was verified with ${context.companionSlideCount} readable slide${context.companionSlideCount === 1 ? "" : "s"}.`
      : "";
    reviewSummary.textContent = slots.length
      ? `Claude JSON contains ${slots.length} important image position${slots.length === 1 ? "" : "s"}. Import the matching images before continuing.${companion}`
      : `Claude JSON contains no image positions. Continue to rebuild the editable PowerPoint.${companion}`;
  } else {
    reviewSummary.textContent = slots.length
      ? `Gemini found ${slots.length} important image position${slots.length === 1 ? "" : "s"}. Each label describes the exact visual to import.`
      : "Gemini did not find any image positions. Continue to create the PowerPoint presentation.";
  }

  showCoverage(result, result.importWarnings);
  if (slots.length) {
    slots.forEach((slot, index) => imageSlots.append(createImageSlotCard(slot, index)));
  } else {
    const empty = document.createElement("p");
    empty.className = "review-empty";
    empty.textContent = "No image imports are required for this lecture.";
    imageSlots.append(empty);
  }

  review.scrollIntoView({ behavior: "smooth", block: "start" });
  setState("review");
  const sections = result.lecture?.sections || [];
  const contentPlans = sections.reduce((sum, section) => sum + (section.slides?.length || 0), 0);
  setStatus(isClaude
    ? `Claude import validated: ${sections.length} sections and ${contentPlans} structured content plans.`
    : `Extraction complete: ${sections.length} sections and ${contentPlans} structured content plans.`, "success");
}

async function extractLecture() {
  if (!selectedFile) return;
  setState("extracting");
  setStatus("Gemini is reading the lecture and preparing the reusable PowerPoint structure…");

  try {
    const extension = validateLectureFile(selectedFile);
    const form = new FormData();
    if (extension === "pdf") {
      form.append("sourceType", "pdf");
      form.append("file", selectedFile, selectedFile.name);
    } else {
      setStatus("Reading PowerPoint slides, text, tables, and image positions…");
      const manifest = await extractPptxManifest(selectedFile);
      form.append("sourceType", "pptx");
      form.append("fileName", selectedFile.name);
      form.append("manifest", JSON.stringify(manifest));
      setStatus("Gemini is connecting the source content to the reusable PowerPoint structure…");
    }

    const response = await fetch("/api/extract", { method: "POST", body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The lecture could not be extracted.");
    showIntermediateStep(payload, { origin: "gemini" });
  } catch (error) {
    setState(selectedFile ? "ready" : "idle");
    setStatus(error instanceof Error ? error.message : "The lecture could not be extracted.", "error");
  }
}

async function importClaudeOutput() {
  if (!selectedClaudeJson || !selectedClaudePptx) return;
  setState("extracting");
  setStatus("Validating the Claude JSON and checking the companion PowerPoint…");
  try {
    const [jsonText, schema, companionManifest] = await Promise.all([
      selectedClaudeJson.text(),
      loadLectureSchema(),
      extractPptxManifest(selectedClaudePptx),
    ]);
    if (!Number.isInteger(companionManifest?.slideCount) || companionManifest.slideCount < 1) {
      throw new Error("The companion Claude PPTX does not contain any readable slides.");
    }
    const result = parseClaudeOutputText(jsonText, schema);
    showIntermediateStep(result, { origin: "claude", companionSlideCount: companionManifest.slideCount });
  } catch (error) {
    setState(selectedClaudeJson && selectedClaudePptx ? "ready" : "idle");
    setStatus(error instanceof Error ? error.message : "The Claude output files could not be validated.", "error");
  }
}

function importedImagesRecord() {
  const images = {};
  for (const [slotId, image] of selectedImages) {
    const mimeType = image.dataUrl.match(/^data:([^;,]+)/)?.[1] || "application/octet-stream";
    images[slotId] = { dataUrl: image.dataUrl, fileName: image.name, mimeType };
  }
  return images;
}

async function continueToPptx() {
  if (!extraction?.lecture) return;
  setState("building");
  setStatus("Building the editable PowerPoint presentation with the approved design…");
  try {
    const result = await buildLecturePptxFile(extraction.lecture, importedImagesRecord());
    generated = result;
    setState("complete");
    const warningText = result.warnings.length ? ` ${result.warnings.length} validation warning${result.warnings.length === 1 ? "" : "s"} were recorded.` : "";
    setStatus(`Built ${result.slideCount} editable slides.${warningText} The PPTX file is ready to download.`, result.warnings.length ? "" : "success");
  } catch (error) {
    setState("review");
    setStatus(error instanceof Error ? error.message : "The PowerPoint file could not be generated.", "error");
  }
}

function downloadGeneratedFile() {
  if (!generated?.blob) return;
  const url = URL.createObjectURL(generated.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = generated.filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus(`Downloaded ${generated.filename}.`, "success");
}

lectureOption.addEventListener("click", () => setImportMode("lecture"));
claudeOption.addEventListener("click", () => setImportMode("claude"));
fileInput.addEventListener("change", handleLectureFileSelection);
claudeFilesInput.addEventListener("change", handleClaudeFilesSelection);

action.addEventListener("click", () => {
  if (state === "ready" && importMode === "lecture") extractLecture();
  else if (state === "ready" && importMode === "claude") importClaudeOutput();
  else if (state === "review") continueToPptx();
  else if (state === "complete") downloadGeneratedFile();
});

setImportMode("lecture", false);
