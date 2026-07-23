import { extractLecture, createFallbackPlan, getUploadPolicy } from "./source-importer.js";
import { buildLectureHTML, safeFilename } from "./lecture-template.js";
import { downloadPptx } from "./pptx-exporter.js";

const $ = (selector) => document.querySelector(selector);
const el = {
  backendStatus: $("#backendStatus"), fileInput: $("#fileInput"), dropZone: $("#dropZone"), fileCard: $("#fileCard"), fileType: $("#fileType"), fileName: $("#fileName"), fileMeta: $("#fileMeta"), removeFile: $("#removeFile"),
  courseCode: $("#courseCode"), lectureLabel: $("#lectureLabel"), instructor: $("#instructor"), language: $("#language"), includeToc: $("#includeToc"), conciseMode: $("#conciseMode"), processButton: $("#processButton"), aiSetupHint: $("#aiSetupHint"),
  turnstileArea: $("#turnstileArea"), turnstileWidget: $("#turnstileWidget"), resultTitle: $("#resultTitle"), downloadButton: $("#downloadButton"), downloadPptxButton: $("#downloadPptxButton"), openPreviewButton: $("#openPreviewButton"),
  emptyState: $("#emptyState"), processingState: $("#processingState"), processingTitle: $("#processingTitle"), processingDetail: $("#processingDetail"), previewShell: $("#previewShell"), previewFrame: $("#previewFrame"),
  resultMessage: $("#resultMessage"), previewDialog: $("#previewDialog"), dialogFrame: $("#dialogFrame"), closeDialog: $("#closeDialog"), stageRead: $("#stageRead"), stageExtract: $("#stageExtract"), stagePlan: $("#stagePlan"), stageRender: $("#stageRender"),
};
const stages = [el.stageRead, el.stageExtract, el.stagePlan, el.stageRender];
const state = {
  config: { configured: null, turnstileSiteKey: null, model: "gemini-3.5-flash-lite", keySource: null, environment: "deployment", branch: "" },
  selectedFile: null,
  extraction: null,
  plan: null,
  generatedHTML: "",
  generatedFilename: "",
  resultMode: "none",
  turnstileToken: "",
  turnstileId: null,
  busy: false,
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** exp)).toFixed(exp ? 1 : 0)} ${units[exp]}`;
}
function backendStatus(type, value) {
  el.backendStatus.classList.remove("ready", "warning");
  if (type) el.backendStatus.classList.add(type);
  el.backendStatus.lastChild.textContent = ` ${value}`;
}
function updateButton() { el.processButton.disabled = !state.selectedFile || state.busy || (state.config.turnstileSiteKey && !state.turnstileToken); }
function message(value, tone = "error") {
  el.resultMessage.hidden = !value;
  el.resultMessage.textContent = value || "";
  const palette = {
    error: ["#f7e6e1", "#d9a69d", "#71382f"],
    warning: ["#f6efd7", "#d5bf71", "#65521b"],
    info: ["#e7edf3", "#b4c4d3", "#334d63"],
    success: ["#e6f1e4", "#adc8a8", "#355d32"],
  }[tone] || ["#f7e6e1", "#d9a69d", "#71382f"];
  [el.resultMessage.style.background, el.resultMessage.style.borderColor, el.resultMessage.style.color] = palette;
}
function stage(index, title, detail) {
  stages.forEach((item, i) => { item.classList.toggle("done", i < index); item.classList.toggle("active", i === index); });
  if (title) el.processingTitle.textContent = title;
  if (detail) el.processingDetail.textContent = detail;
}
function showProcessing() {
  el.emptyState.hidden = true;
  el.previewShell.hidden = true;
  el.processingState.hidden = false;
  message("");
  [el.downloadButton, el.downloadPptxButton, el.openPreviewButton].forEach((button) => { if (button) button.disabled = true; });
}
function showPreview() {
  el.processingState.hidden = true;
  el.emptyState.hidden = true;
  el.previewShell.hidden = false;
  el.previewFrame.srcdoc = state.generatedHTML;
  el.resultTitle.textContent = `${state.resultMode === "ai" ? "AI redesign" : "Local draft"} · ${state.generatedFilename}`;
  if (el.downloadButton) el.downloadButton.disabled = false;
  if (el.openPreviewButton) el.openPreviewButton.disabled = false;
  if (el.downloadPptxButton) el.downloadPptxButton.disabled = state.resultMode !== "ai";
}
function clearResult() {
  state.extraction = null;
  state.plan = null;
  state.generatedHTML = "";
  state.generatedFilename = "";
  state.resultMode = "none";
  el.previewFrame.removeAttribute("srcdoc");
  el.dialogFrame.removeAttribute("srcdoc");
  el.processingState.hidden = true;
  el.previewShell.hidden = true;
  el.emptyState.hidden = false;
  el.resultTitle.textContent = "Waiting for a lecture";
  [el.downloadButton, el.downloadPptxButton, el.openPreviewButton].forEach((button) => { if (button) button.disabled = true; });
  message("");
  stages.forEach((item) => item.classList.remove("done", "active"));
}

function selectFile(file) {
  if (!file) return;
  state.selectedFile = file;
  clearResult();
  el.dropZone.hidden = true;
  el.fileCard.hidden = false;
  el.fileName.textContent = file.name;
  if (el.fileType) el.fileType.textContent = (file.name.split(".").pop() || "FILE").toUpperCase().slice(0, 5);
  const policy = getUploadPolicy();
  const warning = file.size > policy.warningBytes ? " · large file; adaptive mode" : " · ready to import";
  el.fileMeta.textContent = `${formatBytes(file.size)}${warning}`;
  if (file.size > policy.maxBytes) message(`This device's safe upload limit is ${policy.mobile ? "20" : "50"} MB.`, "warning");
  updateButton();
}
function removeFile() { state.selectedFile = null; el.fileInput.value = ""; el.fileCard.hidden = true; el.dropZone.hidden = false; clearResult(); updateButton(); }
function options() {
  return {
    sourceTitle: state.extraction?.title || "",
    courseCode: el.courseCode.value.trim(),
    lectureLabel: el.lectureLabel.value.trim(),
    instructor: el.instructor.value.trim(),
    language: el.language.value,
    includeToc: el.includeToc.checked,
    concise: el.conciseMode.checked,
  };
}

function structuredDraftToPlan(draft, extraction, userOptions) {
  const sections = [];
  for (const title of Array.isArray(draft?.titles) ? draft.titles : []) {
    for (const subtitle of Array.isArray(title?.children) ? title.children : []) {
      const blocks = [];
      for (const element of Array.isArray(subtitle?.children) ? subtitle.children : []) {
        if (element.type === "image_ref") {
          blocks.push({ type: "image", assetId: element.assetId || "", caption: element.caption || "", sourceIds: element.sourceIds || [] });
        } else if (element.type === "table") {
          blocks.push({ type: "table", heading: element.heading || "", headers: element.headers || [], rows: element.rows || [], sourceIds: element.sourceIds || [], variant: element.variant || "standard" });
        } else if (element.type === "diagram") {
          blocks.push({ type: "diagram", heading: element.heading || "", items: element.items || element.nodes?.map((node) => node.label) || [], sourceIds: element.sourceIds || [] });
        } else if (element.type === "note") {
          blocks.push({ type: "callout", heading: element.heading || "Note", text: element.text || "", sourceIds: element.sourceIds || [] });
        } else {
          blocks.push({ type: "paragraph", heading: element.heading || "", text: element.text || "", sourceIds: element.sourceIds || [] });
        }
      }
      if (blocks.length) sections.push({
        title: subtitle.text || title.text || "Concept",
        category: title.text || "Concept",
        keyTermsCritical: [],
        keyTermsImportant: [],
        blocks,
      });
    }
  }
  return {
    metadata: {
      title: draft?.metadata?.title || extraction.title,
      courseCode: userOptions.courseCode || "Course",
      lectureLabel: userOptions.lectureLabel || "Lecture",
      instructor: userOptions.instructor || "",
      language: draft?.metadata?.language || userOptions.language || "auto",
      direction: draft?.metadata?.direction || "ltr",
    },
    overview: "",
    learningObjectives: [],
    sections,
    finalTakeaways: [],
    sourceManifest: draft?.sourceManifest || null,
  };
}

async function requestPlan(extraction, userOptions) {
  stage(2, "Reorganizing with Gemini", "Creating and verifying a complete structured draft…");
  const response = await fetch("/api/redesign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      turnstileToken: state.turnstileToken || undefined,
      source: {
        title: extraction.title,
        batches: extraction.batches,
        assets: extraction.assets.map(({ id, type, alt, caption, sourceKind }) => ({ id, type, alt, caption, sourceKind })),
      },
      options: userOptions,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `The AI service returned HTTP ${response.status}.`);
    error.code = payload.code || "AI_REQUEST_FAILED";
    error.environment = payload.environment || state.config.environment;
    error.nonRetryable = response.status === 400 || response.status === 401 || response.status === 403 || response.status === 413 || response.status === 422 || response.status === 503;
    throw error;
  }
  if (!payload.draftV2 || payload.verification?.valid !== true) throw new Error("The AI service did not return a verified structured draft.");
  return structuredDraftToPlan(payload.draftV2, extraction, userOptions);
}
function resetTurnstile() {
  state.turnstileToken = "";
  if (state.turnstileId !== null && window.turnstile) {
    try { window.turnstile.reset(state.turnstileId); } catch { /* already reset */ }
  }
  updateButton();
}
function deploymentLabel() {
  const environment = state.config.environment || "current";
  const branch = state.config.branch ? ` (${state.config.branch})` : "";
  return `${environment} deployment${branch}`;
}

async function processLecture() {
  if (!state.selectedFile || state.busy) return;
  state.busy = true;
  updateButton();
  showProcessing();
  let fallbackReason = "";
  let localMode = false;
  try {
    stage(0, "Reading the lecture", "Preparing the source for local extraction…");
    state.extraction = await extractLecture(state.selectedFile, (detail) => stage(0, "Reading the lecture", detail));
    const stats = state.extraction.stats;
    el.fileMeta.textContent = `${formatBytes(state.selectedFile.size)} · ${stats.nodeCount.toLocaleString()} units · ${stats.assetCount} assets`;
    stage(1, "Academic content extracted", `${stats.extractedChars.toLocaleString()} characters · ${stats.batchCount} AI batch${stats.batchCount === 1 ? "" : "es"} · ${stats.imageCount} images`);
    const userOptions = options();

    try {
      state.plan = await requestPlan(state.extraction, userOptions);
      state.resultMode = "ai";
    } catch (error) {
      localMode = error?.code === "AI_NOT_CONFIGURED";
      fallbackReason = error instanceof Error ? error.message : "The AI service was unavailable.";
      state.plan = createFallbackPlan(state.extraction, userOptions);
      state.resultMode = "local";
    } finally {
      resetTurnstile();
    }

    stage(3, "Building the outputs", state.resultMode === "ai" ? "Creating the final HTML preview and PowerPoint deck…" : "Creating a local draft preview for inspection…");
    state.generatedHTML = buildLectureHTML(state.plan, state.extraction.assets, userOptions);
    state.generatedFilename = safeFilename(state.plan?.metadata?.title || state.extraction.title || "redesigned-lecture");
    showPreview();
    if (fallbackReason) message(localMode ? "AI is not configured for this deployment. A local draft was created." : `AI redesign failed, so a local draft was created: ${fallbackReason}`, "warning");
  } catch (error) {
    clearResult();
    message(error instanceof Error ? error.message : "Unable to process this lecture.");
  } finally {
    state.busy = false;
    updateButton();
  }
}

function downloadHtml() {
  if (!state.generatedHTML) return;
  const blob = new Blob([state.generatedHTML], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${state.generatedFilename || "redesigned-lecture"}.html`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
async function downloadPowerPoint() {
  if (!state.plan || !state.extraction || state.resultMode !== "ai") return;
  try {
    el.downloadPptxButton.disabled = true;
    el.downloadPptxButton.textContent = "Building PPTX…";
    await downloadPptx(state.plan, state.extraction.assets, `${state.generatedFilename || "redesigned-lecture"}.pptx`);
  } catch (error) {
    message(error instanceof Error ? error.message : "Unable to create the PowerPoint file.");
  } finally {
    el.downloadPptxButton.textContent = "Download PPTX";
    el.downloadPptxButton.disabled = false;
  }
}

el.fileInput.addEventListener("change", () => selectFile(el.fileInput.files?.[0]));
el.dropZone.addEventListener("click", () => el.fileInput.click());
el.dropZone.addEventListener("dragover", (event) => { event.preventDefault(); el.dropZone.classList.add("dragging"); });
el.dropZone.addEventListener("dragleave", () => el.dropZone.classList.remove("dragging"));
el.dropZone.addEventListener("drop", (event) => { event.preventDefault(); el.dropZone.classList.remove("dragging"); selectFile(event.dataTransfer?.files?.[0]); });
el.removeFile.addEventListener("click", removeFile);
el.processButton.addEventListener("click", processLecture);
el.downloadButton?.addEventListener("click", downloadHtml);
el.downloadPptxButton?.addEventListener("click", downloadPowerPoint);
el.openPreviewButton?.addEventListener("click", () => { el.dialogFrame.srcdoc = state.generatedHTML; el.previewDialog.showModal(); });
el.closeDialog?.addEventListener("click", () => el.previewDialog.close());

window.onTurnstileSuccess = (token) => { state.turnstileToken = token; updateButton(); };
window.onTurnstileExpired = () => { state.turnstileToken = ""; updateButton(); };

async function init() {
  try {
    const response = await fetch("/api/config", { cache: "no-store" });
    const config = await response.json();
    state.config = { ...state.config, ...config };
    if (config.configured) backendStatus("ready", `${config.model || "Gemini"} ready · ${deploymentLabel()}`);
    else backendStatus("warning", `AI unavailable · ${deploymentLabel()}`);
    if (config.turnstileSiteKey) {
      el.turnstileArea.hidden = false;
      const render = () => {
        if (!window.turnstile || state.turnstileId !== null) return;
        state.turnstileId = window.turnstile.render(el.turnstileWidget, {
          sitekey: config.turnstileSiteKey,
          callback: window.onTurnstileSuccess,
          "expired-callback": window.onTurnstileExpired,
          theme: "light",
        });
      };
      if (window.turnstile) render(); else window.addEventListener("load", render, { once: true });
    }
  } catch {
    backendStatus("warning", "Unable to check AI status");
  }
  updateButton();
}

init();