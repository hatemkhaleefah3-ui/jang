import { extractLecture, createFallbackPlan } from "./extractor.js";
import { buildLectureHTML, safeFilename } from "./lecture-template.js";

const elements = {
  backendStatus: document.querySelector("#backendStatus"),
  fileInput: document.querySelector("#fileInput"),
  dropZone: document.querySelector("#dropZone"),
  fileCard: document.querySelector("#fileCard"),
  fileName: document.querySelector("#fileName"),
  fileMeta: document.querySelector("#fileMeta"),
  removeFile: document.querySelector("#removeFile"),
  courseCode: document.querySelector("#courseCode"),
  lectureLabel: document.querySelector("#lectureLabel"),
  instructor: document.querySelector("#instructor"),
  language: document.querySelector("#language"),
  includeToc: document.querySelector("#includeToc"),
  conciseMode: document.querySelector("#conciseMode"),
  processButton: document.querySelector("#processButton"),
  turnstileArea: document.querySelector("#turnstileArea"),
  turnstileWidget: document.querySelector("#turnstileWidget"),
  resultTitle: document.querySelector("#resultTitle"),
  downloadButton: document.querySelector("#downloadButton"),
  openPreviewButton: document.querySelector("#openPreviewButton"),
  emptyState: document.querySelector("#emptyState"),
  processingState: document.querySelector("#processingState"),
  processingTitle: document.querySelector("#processingTitle"),
  processingDetail: document.querySelector("#processingDetail"),
  previewShell: document.querySelector("#previewShell"),
  previewFrame: document.querySelector("#previewFrame"),
  resultMessage: document.querySelector("#resultMessage"),
  previewDialog: document.querySelector("#previewDialog"),
  dialogFrame: document.querySelector("#dialogFrame"),
  closeDialog: document.querySelector("#closeDialog"),
  stageRead: document.querySelector("#stageRead"),
  stageExtract: document.querySelector("#stageExtract"),
  stagePlan: document.querySelector("#stagePlan"),
  stageRender: document.querySelector("#stageRender"),
};

const stages = [elements.stageRead, elements.stageExtract, elements.stagePlan, elements.stageRender];

const state = {
  config: { configured: false, turnstileSiteKey: null, model: "gemini-2.5-flash" },
  selectedFile: null,
  extraction: null,
  generatedHTML: "",
  generatedFilename: "",
  turnstileToken: "",
  turnstileId: null,
  busy: false,
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** exponent)).toFixed(exponent ? 1 : 0)} ${units[exponent]}`;
}

function setBackendStatus(type, text) {
  elements.backendStatus.classList.remove("ready", "warning");
  if (type) elements.backendStatus.classList.add(type);
  elements.backendStatus.lastChild.textContent = ` ${text}`;
}

function updateProcessButton() {
  const verificationReady = !state.config.turnstileSiteKey || Boolean(state.turnstileToken);
  elements.processButton.disabled = !state.selectedFile || state.busy || !verificationReady;
}

function showMessage(message, tone = "error") {
  elements.resultMessage.hidden = !message;
  elements.resultMessage.textContent = message || "";
  elements.resultMessage.style.background = tone === "warning" ? "#f6efd7" : "";
  elements.resultMessage.style.borderColor = tone === "warning" ? "#d5bf71" : "";
  elements.resultMessage.style.color = tone === "warning" ? "#65521b" : "";
}

function setStage(index, title, detail) {
  stages.forEach((stage, stageIndex) => {
    stage.classList.toggle("done", stageIndex < index);
    stage.classList.toggle("active", stageIndex === index);
  });
  if (title) elements.processingTitle.textContent = title;
  if (detail) elements.processingDetail.textContent = detail;
}

function showProcessing() {
  elements.emptyState.hidden = true;
  elements.previewShell.hidden = true;
  elements.processingState.hidden = false;
  showMessage("");
  elements.downloadButton.disabled = true;
  elements.openPreviewButton.disabled = true;
}

function showPreview() {
  elements.processingState.hidden = true;
  elements.emptyState.hidden = true;
  elements.previewShell.hidden = false;
  elements.previewFrame.srcdoc = state.generatedHTML;
  elements.resultTitle.textContent = state.generatedFilename;
  elements.downloadButton.disabled = false;
  elements.openPreviewButton.disabled = false;
}

function clearResult() {
  state.extraction = null;
  state.generatedHTML = "";
  state.generatedFilename = "";
  elements.previewFrame.removeAttribute("srcdoc");
  elements.dialogFrame.removeAttribute("srcdoc");
  elements.processingState.hidden = true;
  elements.previewShell.hidden = true;
  elements.emptyState.hidden = false;
  elements.resultTitle.textContent = "Waiting for a lecture";
  elements.downloadButton.disabled = true;
  elements.openPreviewButton.disabled = true;
  showMessage("");
  stages.forEach((stage) => stage.classList.remove("done", "active"));
}

function selectFile(file) {
  if (!file) return;
  state.selectedFile = file;
  clearResult();
  elements.dropZone.hidden = true;
  elements.fileCard.hidden = false;
  elements.fileName.textContent = file.name;
  elements.fileMeta.textContent = `${formatBytes(file.size)} · ready to import`;
  updateProcessButton();
}

function removeSelectedFile() {
  state.selectedFile = null;
  elements.fileInput.value = "";
  elements.fileCard.hidden = true;
  elements.dropZone.hidden = false;
  clearResult();
  updateProcessButton();
}

function getOptions() {
  return {
    sourceTitle: state.extraction?.title || "",
    courseCode: elements.courseCode.value.trim(),
    lectureLabel: elements.lectureLabel.value.trim(),
    instructor: elements.instructor.value.trim(),
    language: elements.language.value,
    includeToc: elements.includeToc.checked,
    concise: elements.conciseMode.checked,
  };
}

async function requestPlan(extraction, options) {
  const response = await fetch("/api/redesign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      turnstileToken: state.turnstileToken || undefined,
      source: {
        title: extraction.title,
        content: extraction.content,
        assets: extraction.assets.map(({ id, type, alt, caption, sourceKind }) => ({ id, type, alt, caption, sourceKind })),
      },
      options,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `The AI service returned HTTP ${response.status}.`);
  if (!payload.plan) throw new Error("The AI service did not return a lecture plan.");
  return payload.plan;
}

function resetTurnstile() {
  state.turnstileToken = "";
  if (state.turnstileId !== null && window.turnstile) {
    try { window.turnstile.reset(state.turnstileId); } catch { /* Widget may already be reset. */ }
  }
  updateProcessButton();
}

async function processLecture() {
  if (!state.selectedFile || state.busy) return;
  state.busy = true;
  updateProcessButton();
  showProcessing();

  let fallbackReason = "";
  try {
    setStage(0, "Reading the lecture", "Validating and parsing the imported HTML…");
    state.extraction = await extractLecture(state.selectedFile);
    elements.fileMeta.textContent = `${formatBytes(state.selectedFile.size)} · ${state.extraction.stats.assetCount} visual asset${state.extraction.stats.assetCount === 1 ? "" : "s"}`;

    setStage(1, "Extracting academic content", `${state.extraction.stats.extractedChars.toLocaleString()} characters · ${state.extraction.stats.imageCount} images · ${state.extraction.stats.diagramCount} diagrams`);
    const options = getOptions();

    setStage(2, "Reorganizing with Gemini", state.config.configured ? `Using ${state.config.model} to create the lecture plan…` : "Gemini is not configured; preparing a faithful local layout…");
    let plan;
    if (state.config.configured) {
      try {
        plan = await requestPlan(state.extraction, options);
      } catch (error) {
        fallbackReason = error instanceof Error ? error.message : "The AI service was unavailable.";
        plan = createFallbackPlan(state.extraction, options);
      } finally {
        resetTurnstile();
      }
    } else {
      fallbackReason = "Gemini is not configured in Cloudflare Pages, so Jang used its local preservation layout.";
      plan = createFallbackPlan(state.extraction, options);
    }

    setStage(3, "Building the new HTML", "Applying the lecture design system and reconnecting visual assets…");
    state.generatedHTML = buildLectureHTML(plan, state.extraction.assets, options);
    state.generatedFilename = safeFilename(plan?.metadata?.title || state.extraction.title);
    showPreview();

    if (fallbackReason) {
      showMessage(`AI reorganization was unavailable: ${fallbackReason} The downloadable file was created using the local fallback and preserves extracted content in source order.`, "warning");
    } else if (state.extraction.stats.truncated) {
      showMessage("The lecture exceeded the maximum extracted-text size, so only the first 380,000 characters were reorganized.", "warning");
    }
  } catch (error) {
    elements.processingState.hidden = true;
    elements.emptyState.hidden = false;
    showMessage(error instanceof Error ? error.message : "The lecture could not be processed.");
  } finally {
    state.busy = false;
    updateProcessButton();
  }
}

function downloadResult() {
  if (!state.generatedHTML) return;
  const blob = new Blob([state.generatedHTML], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = state.generatedFilename || "redesigned-lecture.html";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function openPreview() {
  if (!state.generatedHTML) return;
  elements.dialogFrame.srcdoc = state.generatedHTML;
  elements.previewDialog.showModal();
}

function waitForTurnstile(siteKey) {
  if (!siteKey) return;
  elements.turnstileArea.hidden = false;
  const start = Date.now();
  const attempt = () => {
    if (window.turnstile?.render) {
      state.turnstileId = window.turnstile.render(elements.turnstileWidget, {
        sitekey: siteKey,
        theme: "light",
        size: "flexible",
        action: "redesign_lecture",
        callback: (token) => {
          state.turnstileToken = token;
          updateProcessButton();
        },
        "expired-callback": () => {
          state.turnstileToken = "";
          updateProcessButton();
        },
        "error-callback": () => {
          state.turnstileToken = "";
          showMessage("Verification could not load. Refresh the page or check the Turnstile domain configuration.", "warning");
          updateProcessButton();
        },
      });
      return;
    }
    if (Date.now() - start < 10000) setTimeout(attempt, 150);
    else showMessage("Turnstile did not load. Check your content-security policy or network connection.", "warning");
  };
  attempt();
}

async function loadConfig() {
  try {
    const response = await fetch("/api/config", { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.config = { ...state.config, ...(await response.json()) };
    if (state.config.configured) {
      setBackendStatus("ready", `Gemini ready · ${state.config.model}`);
    } else {
      setBackendStatus("warning", "Local mode · add Gemini secret");
    }
    waitForTurnstile(state.config.turnstileSiteKey);
  } catch {
    setBackendStatus("warning", "Local mode · API unavailable");
  } finally {
    updateProcessButton();
  }
}

elements.fileInput.addEventListener("change", () => selectFile(elements.fileInput.files?.[0]));
elements.removeFile.addEventListener("click", removeSelectedFile);
elements.processButton.addEventListener("click", processLecture);
elements.downloadButton.addEventListener("click", downloadResult);
elements.openPreviewButton.addEventListener("click", openPreview);
elements.closeDialog.addEventListener("click", () => elements.previewDialog.close());
elements.previewDialog.addEventListener("click", (event) => {
  if (event.target === elements.previewDialog) elements.previewDialog.close();
});

["dragenter", "dragover"].forEach((eventName) => {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.add("dragging");
  });
});
["dragleave", "drop"].forEach((eventName) => {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove("dragging");
  });
});
elements.dropZone.addEventListener("drop", (event) => selectFile(event.dataTransfer?.files?.[0]));

loadConfig();
