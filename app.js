import { buildLectureHtml } from "./lecture-html.js";
import { extractPptxManifest } from "./pptx-reader.js";

const fileInput = document.querySelector("#lectureFile");
const fileButtonText = document.querySelector("#fileButtonText");
const fileCard = document.querySelector("#fileCard");
const fileName = document.querySelector("#fileName");
const fileMeta = document.querySelector("#fileMeta");
const action = document.querySelector("#actionButton");
const actionLabel = document.querySelector("#actionLabel");
const status = document.querySelector("#status");
const review = document.querySelector("#imageReview");
const reviewSummary = document.querySelector("#reviewSummary");
const imageSlots = document.querySelector("#imageSlots");

let selectedFile = null;
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
  action.disabled = nextState === "idle" || nextState === "extracting";
  const labels = {
    idle: "Build HTML",
    ready: "Build HTML",
    extracting: "Loading…",
    review: "Continue",
    complete: "Download HTML",
  };
  actionLabel.textContent = labels[nextState];
  action.setAttribute("aria-busy", nextState === "extracting" ? "true" : "false");
}

function resetResult() {
  extraction = null;
  generated = null;
  selectedImages.clear();
  imageSlots.replaceChildren();
  review.hidden = true;
}

function validateLectureFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["pdf", "pptx"].includes(extension)) throw new Error("Choose a PDF or PPTX lecture file.");
  if (extension === "pdf" && file.size > 18_000_000) throw new Error("PDF files must be 18 MB or smaller.");
  if (extension === "pptx" && file.size > 50_000_000) throw new Error("PPTX files must be 50 MB or smaller.");
  return extension;
}

function selectLectureFile(file) {
  if (!file) return;
  const extension = validateLectureFile(file);
  selectedFile = file;
  resetResult();
  fileCard.hidden = false;
  fileName.textContent = file.name;
  fileMeta.textContent = `${extension.toUpperCase()} · ${formatBytes(file.size)}`;
  fileButtonText.textContent = "Choose another file";
  setState("ready");
  setStatus(`${file.name} is ready for Gemini extraction.`, "success");
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
  details.textContent = `${slot.size} · ${slot.fit}`;

  copy.append(reference, heading, description, details);

  const preview = document.createElement("div");
  preview.className = `image-slot-preview image-slot-preview-${slot.size}`;
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
      setStatus(error.message, "error");
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

function showIntermediateStep(result) {
  extraction = result;
  selectedImages.clear();
  imageSlots.replaceChildren();
  const slots = Array.isArray(result.imageSlots) ? result.imageSlots : [];
  review.hidden = false;
  reviewSummary.textContent = slots.length
    ? `Gemini found ${slots.length} important image position${slots.length === 1 ? "" : "s"}. Each label describes the exact visual to import.`
    : "Gemini did not find any image positions. Continue to create the lecture HTML.";

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
  const contentPlans = (result.lecture?.sections || []).reduce((sum, section) => sum + (section.slides?.length || 0), 0);
  setStatus(`Extraction complete: ${result.lecture.sections.length} sections and ${contentPlans} structured content plans.`, "success");
}

async function extractLecture() {
  if (!selectedFile) return;
  setState("extracting");
  setStatus("Gemini is reading the lecture and preparing the reusable slide structure…");

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
      setStatus("Gemini is connecting the PowerPoint content to the lecture HTML structure…");
    }

    const response = await fetch("/api/extract", { method: "POST", body: form });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "The lecture could not be extracted.");
    showIntermediateStep(payload);
  } catch (error) {
    setState(selectedFile ? "ready" : "idle");
    setStatus(error?.message || "The lecture could not be extracted.", "error");
  }
}

function continueToHtml() {
  if (!extraction?.lecture) return;
  try {
    generated = buildLectureHtml(extraction.lecture, selectedImages);
    setState("complete");
    setStatus(`Built ${generated.slideCount} slides. The standalone HTML file is ready to download.`, "success");
  } catch (error) {
    setStatus(error?.message || "The HTML file could not be generated.", "error");
  }
}

function downloadGeneratedFile() {
  if (!generated) return;
  const blob = new Blob([generated.html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = generated.filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus(`Downloaded ${generated.filename}.`, "success");
}

fileInput.addEventListener("change", () => {
  try {
    selectLectureFile(fileInput.files?.[0]);
  } catch (error) {
    selectedFile = null;
    resetResult();
    fileInput.value = "";
    fileCard.hidden = true;
    fileButtonText.textContent = "Choose PDF or PPTX";
    setState("idle");
    setStatus(error.message, "error");
  }
});

action.addEventListener("click", () => {
  if (state === "ready") extractLecture();
  else if (state === "review") continueToHtml();
  else if (state === "complete") downloadGeneratedFile();
});

setState("idle");
