import { extractLecture, applyOcrResults, applyBrowserOcr, createFallbackPlan, getUploadPolicy } from "./source-importer.js";
import { buildLectureHTML, safeFilename } from "./lecture-template.js";
import { createPptxFile, downloadPreparedPptx } from "./pptx-exporter.js";

const $ = (selector) => document.querySelector(selector);
const el = {
  backendStatus: $("#backendStatus"), fileInput: $("#fileInput"), dropZone: $("#dropZone"), fileCard: $("#fileCard"), fileType: $("#fileType"), fileName: $("#fileName"), fileMeta: $("#fileMeta"), removeFile: $("#removeFile"),
  courseCode: $("#courseCode"), lectureLabel: $("#lectureLabel"), instructor: $("#instructor"), language: $("#language"), includeToc: $("#includeToc"), conciseMode: $("#conciseMode"), processButton: $("#processButton"), aiSetupHint: $("#aiSetupHint"),
  turnstileArea: $("#turnstileArea"), turnstileWidget: $("#turnstileWidget"), resultTitle: $("#resultTitle"), downloadPptxButton: $("#downloadPptxButton"),
  emptyState: $("#emptyState"), processingState: $("#processingState"), processingTitle: $("#processingTitle"), processingDetail: $("#processingDetail"), previewShell: $("#previewShell"), previewFrame: $("#previewFrame"),
  resultMessage: $("#resultMessage"), stageRead: $("#stageRead"), stageExtract: $("#stageExtract"), stagePlan: $("#stagePlan"), stageRender: $("#stageRender"),
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
  verification: null,
  pptxBlob: null,
  pptxReport: null,
};

function formatBytes(bytes) { if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"; const units = ["B", "KB", "MB", "GB"]; const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${(bytes / (1024 ** exp)).toFixed(exp ? 1 : 0)} ${units[exp]}`; }
function backendStatus(type, value) { el.backendStatus.classList.remove("ready", "warning"); if (type) el.backendStatus.classList.add(type); el.backendStatus.lastChild.textContent = ` ${value}`; }
function updateButton() { el.processButton.disabled = !state.selectedFile || state.busy || Boolean(state.config.turnstileSiteKey && !state.turnstileToken); }
function message(value, tone = "error") { el.resultMessage.hidden = !value; el.resultMessage.textContent = value || ""; const palette = { error: ["#f7e6e1", "#d9a69d", "#71382f"], warning: ["#f6efd7", "#d5bf71", "#65521b"], info: ["#e7edf3", "#b4c4d3", "#334d63"], success: ["#e6f1e4", "#adc8a8", "#355d32"] }[tone] || ["#f7e6e1", "#d9a69d", "#71382f"]; [el.resultMessage.style.background, el.resultMessage.style.borderColor, el.resultMessage.style.color] = palette; }
function stage(index, title, detail) { stages.forEach((item, i) => { item?.classList.toggle("done", i < index); item?.classList.toggle("active", i === index); }); if (title) el.processingTitle.textContent = title; if (detail) el.processingDetail.textContent = detail; }
function showProcessing() { el.emptyState.hidden = true; el.previewShell.hidden = true; el.processingState.hidden = false; message(""); el.downloadPptxButton.disabled = true; }
function showPreview() { el.processingState.hidden = true; el.emptyState.hidden = true; el.previewShell.hidden = false; el.previewFrame.srcdoc = state.generatedHTML; el.resultTitle.textContent = `PowerPoint preview · ${state.generatedFilename}.pptx`; el.downloadPptxButton.disabled = !(state.pptxBlob instanceof Blob); }
function clearResult() { state.extraction = null; state.plan = null; state.verification = null; state.generatedHTML = ""; state.generatedFilename = ""; state.resultMode = "none"; state.pptxBlob = null; state.pptxReport = null; el.previewFrame.removeAttribute("srcdoc"); el.processingState.hidden = true; el.previewShell.hidden = true; el.emptyState.hidden = false; el.resultTitle.textContent = "Waiting for a lecture"; el.downloadPptxButton.disabled = true; message(""); stages.forEach((item) => item?.classList.remove("done", "active")); }
function selectFile(file) { if (!file) return; state.selectedFile = file; clearResult(); el.dropZone.hidden = true; el.fileCard.hidden = false; el.fileName.textContent = file.name; if (el.fileType) el.fileType.textContent = (file.name.split(".").pop() || "FILE").toUpperCase().slice(0, 5); const policy = getUploadPolicy(); const warning = file.size > policy.warningBytes ? " · large file; adaptive mode" : " · ready to import"; el.fileMeta.textContent = `${formatBytes(file.size)}${warning}`; if (file.size > policy.maxBytes) message(`This device's safe upload limit is ${policy.mobile ? "20" : "50"} MB.`, "warning"); updateButton(); }
function removeFile() { state.selectedFile = null; el.fileInput.value = ""; el.fileCard.hidden = true; el.dropZone.hidden = false; clearResult(); updateButton(); }
function options() { return { sourceTitle: state.extraction?.title || "", courseCode: el.courseCode.value.trim(), lectureLabel: el.lectureLabel.value.trim(), instructor: el.instructor.value.trim(), language: el.language.value, includeToc: el.includeToc.checked, concise: el.conciseMode.checked }; }

function compactPlan(plan, extraction, userOptions) {
  const source = plan && typeof plan === "object" ? plan : {};
  return {
    ...source,
    metadata: { ...(source.metadata || {}), title: source?.metadata?.title || extraction.title, courseCode: userOptions.courseCode || source?.metadata?.courseCode || "Course", lectureLabel: userOptions.lectureLabel || source?.metadata?.lectureLabel || "Lecture", instructor: userOptions.instructor || source?.metadata?.instructor || "" },
    learningObjectives: [...new Set(Array.isArray(source.learningObjectives) ? source.learningObjectives : [])],
    sections: Array.isArray(source.sections) ? source.sections.filter((section) => Array.isArray(section?.blocks) && section.blocks.length) : [],
    finalTakeaways: [...new Set(Array.isArray(source.finalTakeaways) ? source.finalTakeaways : [])],
  };
}

async function requestPlan(extraction, userOptions) {
  stage(2, extraction.ocrPages?.length ? "Applying backup OCR and reorganizing" : "Reorganizing with Gemini", extraction.ocrPages?.length ? `The browser OCR path was unavailable; transcribing ${extraction.ocrPages.length} page${extraction.ocrPages.length === 1 ? "" : "s"} with Gemini and verifying the draft…` : "Creating and verifying the structured draft…");
  const response = await fetch("/api/redesign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      turnstileToken: state.turnstileToken || undefined,
      source: {
        title: extraction.title,
        batches: extraction.batches,
        sourceUnits: extraction.sourceUnits || [],
        assets: extraction.assets.map(({ id, type, alt, caption, sourceKind, sourcePage, originalFormat }) => ({ id, type, alt, caption, sourceKind, sourcePage, originalFormat })),
        ocrPages: extraction.ocrPages || [],
        extractionStatus: extraction.extractionStatus,
        verificationIssues: extraction.verificationIssues || [],
      },
      options: userOptions,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(payload.error || `The AI service returned HTTP ${response.status}.`); error.code = payload.code || "AI_REQUEST_FAILED"; error.environment = payload.environment || state.config.environment; throw error; }
  if (!payload.plan) throw new Error("The AI service did not return a verified lecture plan.");
  state.verification = payload.verification || null;
  return payload;
}

function unresolvedConversionMessage(extraction) {
  const issues = Array.isArray(extraction?.verificationIssues) ? extraction.verificationIssues : [];
  const visualIssues = issues.filter((issue) => /visual|image|svg|canvas|snapshot/i.test(String(issue?.type || issue?.reason || "")));
  if (!visualIssues.length) return extraction?.warnings?.join(" ") || "Automatic source conversion did not finish.";
  const locations = visualIssues.map((issue) => issue?.sourcePage ? `slide ${issue.sourcePage}` : issue?.page ? `page ${issue.page}` : issue?.id || issue?.mediaPath || "an unknown visual");
  return `Automatic visual conversion failed for ${locations.join(", ")}. No content was omitted; the PowerPoint was not created.`;
}

function resetTurnstile() { state.turnstileToken = ""; if (state.turnstileId !== null && window.turnstile) { try { window.turnstile.reset(state.turnstileId); } catch {} } updateButton(); }
function deploymentLabel() { const environment = state.config.environment || "current"; const branch = state.config.branch ? ` (${state.config.branch})` : ""; return `${environment} deployment${branch}`; }

async function processLecture() {
  if (!state.selectedFile || state.busy) return;
  state.busy = true;
  updateButton();
  showProcessing();
  let fallbackReason = "";
  let localMode = false;
  let browserOcrError = "";
  let browserOcrApplied = false;
  try {
    stage(0, "Reading and converting the lecture", "Extracting text, rendering PDF pages, and converting Office visuals locally…");
    state.extraction = await extractLecture(state.selectedFile, (detail) => stage(0, "Reading and converting the lecture", detail));
    let stats = state.extraction.stats;
    el.fileMeta.textContent = `${formatBytes(state.selectedFile.size)} · ${stats.nodeCount.toLocaleString()} units · ${stats.assetCount} visual assets${stats.convertedVisualCount ? ` · ${stats.convertedVisualCount} converted` : ""}`;
    const userOptions = options();

    if (state.extraction.ocrPages?.length) {
      stage(1, "Applying browser OCR", `Reading ${state.extraction.ocrPages.length} sparse PDF page${state.extraction.ocrPages.length === 1 ? "" : "s"} locally before redesign…`);
      try {
        state.extraction = await applyBrowserOcr(state.extraction, userOptions.language, (detail) => stage(1, "Applying browser OCR", detail));
        browserOcrApplied = true;
      } catch (error) {
        browserOcrError = error instanceof Error ? error.message : "Browser OCR failed.";
        stage(1, "Browser OCR unavailable", "Trying the configured Gemini vision OCR path instead…");
      }
    }

    stats = state.extraction.stats;
    stage(1, "Content extraction verified", `${stats.extractedChars.toLocaleString()} characters · ${stats.imageCount} images · ${stats.diagramCount || 0} source diagrams${stats.convertedVisualCount ? ` · ${stats.convertedVisualCount} visuals converted` : ""}${browserOcrApplied ? " · browser OCR complete" : ""}`);

    if (state.extraction.extractionStatus === "incomplete") throw new Error(unresolvedConversionMessage(state.extraction));

    try {
      const payload = await requestPlan(state.extraction, userOptions);
      if (payload.ocr?.applied) state.extraction = applyOcrResults(state.extraction, payload.ocr.pages, "Gemini OCR");
      state.plan = payload.plan;
      state.resultMode = "ai";
    } catch (error) {
      const needsOcr = Boolean(state.extraction?.ocrPages?.length);
      if (needsOcr || error?.code === "SOURCE_NOT_VERIFIED" || error?.code === "OCR_IMAGE_MISSING") {
        const prefix = browserOcrError ? `${browserOcrError} Gemini OCR also failed: ` : "Automatic OCR failed: ";
        throw new Error(`${prefix}${error instanceof Error ? error.message : "unknown OCR error"}`);
      }
      localMode = error?.code === "AI_NOT_CONFIGURED";
      fallbackReason = error instanceof Error ? error.message : "The AI service was unavailable.";
      state.plan = createFallbackPlan(state.extraction, userOptions);
      state.resultMode = "local";
    } finally { resetTurnstile(); }

    if (state.extraction.extractionStatus !== "verified-native") throw new Error(unresolvedConversionMessage(state.extraction));
    state.plan = compactPlan(state.plan, state.extraction, userOptions);
    stage(3, "Building and verifying the PowerPoint", "Creating the final .pptx package and checking every expected text block and image occurrence…");
    state.generatedHTML = buildLectureHTML(state.plan, state.extraction.assets, userOptions);
    state.generatedFilename = safeFilename(state.plan?.metadata?.title || state.extraction.title || "redesigned-lecture").replace(/\.html$/i, "");
    const pptx = await createPptxFile(state.plan, state.extraction.assets || []);
    state.pptxBlob = pptx.blob;
    state.pptxReport = pptx;
    stats = state.extraction.stats;
    el.fileMeta.textContent = `${formatBytes(state.selectedFile.size)} · ${stats.extractedChars.toLocaleString()} characters · ${stats.imageCount} images · verified PPTX`;
    const verificationText = `${pptx.packageVerification.slideCount} slides · ${pptx.packageVerification.embeddedMediaCount} image occurrence${pptx.packageVerification.embeddedMediaCount === 1 ? "" : "s"} · ${pptx.report.highlightCount} highlights · ${pptx.report.redTextCount} red terms`;
    if (state.resultMode === "ai" && state.verification?.valid) message(`PowerPoint ready and verified: ${verificationText}.${browserOcrApplied ? " Browser OCR completed before redesign." : ""}`, "success");
    else if (state.resultMode === "local") message(`${localMode ? "AI is not configured" : "AI redesign failed"}; a verified local PowerPoint was created. ${fallbackReason}`, "warning");
    else message(`PowerPoint ready and verified: ${verificationText}.`, "success");
    showPreview();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "The lecture could not be processed.";
    clearResult();
    message(errorMessage, "error");
  } finally {
    state.busy = false;
    updateButton();
  }
}

el.fileInput?.addEventListener("change", () => selectFile(el.fileInput.files?.[0]));
el.removeFile?.addEventListener("click", removeFile);
el.processButton?.addEventListener("click", processLecture);
el.dropZone?.addEventListener("dragover", (event) => { event.preventDefault(); el.dropZone.classList.add("dragging"); });
el.dropZone?.addEventListener("dragleave", () => el.dropZone.classList.remove("dragging"));
el.dropZone?.addEventListener("drop", (event) => { event.preventDefault(); el.dropZone.classList.remove("dragging"); selectFile(event.dataTransfer?.files?.[0]); });
el.downloadPptxButton?.addEventListener("click", () => {
  try {
    downloadPreparedPptx(state.pptxBlob, `${state.generatedFilename}.pptx`);
  } catch (error) {
    message(error instanceof Error ? error.message : "PowerPoint download failed.");
  }
});

async function loadConfig() {
  try {
    const response = await fetch("/api/config", { cache: "no-store" });
    const config = await response.json();
    state.config = { ...state.config, ...config };
    backendStatus(config.configured ? "ready" : "warning", config.configured ? `AI ready · ${config.model}` : `AI unavailable on ${deploymentLabel()}`);
    if (config.turnstileSiteKey) {
      state.config.turnstileSiteKey = config.turnstileSiteKey;
      el.turnstileArea.hidden = false;
      const render = () => {
        if (!window.turnstile || state.turnstileId !== null) return;
        state.turnstileId = window.turnstile.render(el.turnstileWidget, { sitekey: config.turnstileSiteKey, callback: (token) => { state.turnstileToken = token; updateButton(); }, "expired-callback": resetTurnstile, "error-callback": resetTurnstile });
      };
      window.turnstile ? render() : window.addEventListener("load", render, { once: true });
    }
  } catch { backendStatus("warning", "Backend status unavailable"); }
  updateButton();
}

loadConfig();
