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
const state = { config: { configured: null, turnstileSiteKey: null, model: "gemini-3.5-flash-lite", keySource: null, environment: "deployment", branch: "" }, selectedFile: null, extraction: null, plan: null, generatedHTML: "", generatedFilename: "", resultMode: "none", turnstileToken: "", turnstileId: null, busy: false, verification: null };

function formatBytes(bytes) { if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"; const units = ["B", "KB", "MB", "GB"]; const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${(bytes / (1024 ** exp)).toFixed(exp ? 1 : 0)} ${units[exp]}`; }
function backendStatus(type, value) { el.backendStatus.classList.remove("ready", "warning"); if (type) el.backendStatus.classList.add(type); el.backendStatus.lastChild.textContent = ` ${value}`; }
function updateButton() { el.processButton.disabled = !state.selectedFile || state.busy || (state.config.turnstileSiteKey && !state.turnstileToken); }
function message(value, tone = "error") { el.resultMessage.hidden = !value; el.resultMessage.textContent = value || ""; const palette = { error: ["#f7e6e1", "#d9a69d", "#71382f"], warning: ["#f6efd7", "#d5bf71", "#65521b"], info: ["#e7edf3", "#b4c4d3", "#334d63"], success: ["#e6f1e4", "#adc8a8", "#355d32"] }[tone] || ["#f7e6e1", "#d9a69d", "#71382f"]; [el.resultMessage.style.background, el.resultMessage.style.borderColor, el.resultMessage.style.color] = palette; }
function stage(index, title, detail) { stages.forEach((item, i) => { item.classList.toggle("done", i < index); item.classList.toggle("active", i === index); }); if (title) el.processingTitle.textContent = title; if (detail) el.processingDetail.textContent = detail; }
function showProcessing() { el.emptyState.hidden = true; el.previewShell.hidden = true; el.processingState.hidden = false; message(""); [el.downloadButton, el.downloadPptxButton, el.openPreviewButton].forEach((button) => { if (button) button.disabled = true; }); }
function showPreview() { el.processingState.hidden = true; el.emptyState.hidden = true; el.previewShell.hidden = false; el.previewFrame.srcdoc = state.generatedHTML; el.resultTitle.textContent = `${state.resultMode === "ai" ? "AI redesign" : "Local draft"} · ${state.generatedFilename}`; if (el.downloadButton) el.downloadButton.disabled = false; if (el.openPreviewButton) el.openPreviewButton.disabled = false; if (el.downloadPptxButton) el.downloadPptxButton.disabled = state.resultMode !== "ai" || state.extraction?.extractionStatus !== "verified-native"; }
function clearResult() { state.extraction = null; state.plan = null; state.verification = null; state.generatedHTML = ""; state.generatedFilename = ""; state.resultMode = "none"; el.previewFrame.removeAttribute("srcdoc"); el.dialogFrame.removeAttribute("srcdoc"); el.processingState.hidden = true; el.previewShell.hidden = true; el.emptyState.hidden = false; el.resultTitle.textContent = "Waiting for a lecture"; [el.downloadButton, el.downloadPptxButton, el.openPreviewButton].forEach((button) => { if (button) button.disabled = true; }); message(""); stages.forEach((item) => item.classList.remove("done", "active")); }
function selectFile(file) { if (!file) return; state.selectedFile = file; clearResult(); el.dropZone.hidden = true; el.fileCard.hidden = false; el.fileName.textContent = file.name; if (el.fileType) el.fileType.textContent = (file.name.split(".").pop() || "FILE").toUpperCase().slice(0, 5); const policy = getUploadPolicy(); const warning = file.size > policy.warningBytes ? " · large file; adaptive mode" : " · ready to import"; el.fileMeta.textContent = `${formatBytes(file.size)}${warning}`; if (file.size > policy.maxBytes) message(`This device's safe upload limit is ${policy.mobile ? "20" : "50"} MB.`, "warning"); updateButton(); }
function removeFile() { state.selectedFile = null; el.fileInput.value = ""; el.fileCard.hidden = true; el.dropZone.hidden = false; clearResult(); updateButton(); }
function options() { return { sourceTitle: state.extraction?.title || "", courseCode: el.courseCode.value.trim(), lectureLabel: el.lectureLabel.value.trim(), instructor: el.instructor.value.trim(), language: el.language.value, includeToc: el.includeToc.checked, concise: el.conciseMode.checked }; }

function compactPlan(plan, extraction, userOptions) {
  const source = plan && typeof plan === "object" ? plan : {};
  return { ...source, metadata: { ...(source.metadata || {}), title: source?.metadata?.title || extraction.title, courseCode: userOptions.courseCode || source?.metadata?.courseCode || "Course", lectureLabel: userOptions.lectureLabel || source?.metadata?.lectureLabel || "Lecture", instructor: userOptions.instructor || source?.metadata?.instructor || "" }, learningObjectives: [...new Set(Array.isArray(source.learningObjectives) ? source.learningObjectives : [])], sections: Array.isArray(source.sections) ? source.sections.filter((section) => Array.isArray(section?.blocks) && section.blocks.length) : [], finalTakeaways: [...new Set(Array.isArray(source.finalTakeaways) ? source.finalTakeaways : [])] };
}

async function requestPlan(extraction, userOptions) {
  stage(2, "Reorganizing with Gemini", "Creating and verifying the structured draft…");
  const response = await fetch("/api/redesign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      turnstileToken: state.turnstileToken || undefined,
      source: {
        title: extraction.title,
        batches: extraction.batches,
        sourceUnits: extraction.sourceUnits || [],
        assets: extraction.assets.map(({ id, type, alt, caption, sourceKind, sourcePage }) => ({ id, type, alt, caption, sourceKind, sourcePage })),
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
  return payload.plan;
}

function resetTurnstile() { state.turnstileToken = ""; if (state.turnstileId !== null && window.turnstile) { try { window.turnstile.reset(state.turnstileId); } catch {} } updateButton(); }
function deploymentLabel() { const environment = state.config.environment || "current"; const branch = state.config.branch ? ` (${state.config.branch})` : ""; return `${environment} deployment${branch}`; }

async function processLecture() {
  if (!state.selectedFile || state.busy) return;
  state.busy = true; updateButton(); showProcessing(); let fallbackReason = ""; let localMode = false;
  try {
    stage(0, "Reading the lecture", "Preparing the source for local extraction…");
    state.extraction = await extractLecture(state.selectedFile, (detail) => stage(0, "Reading the lecture", detail));
    const stats = state.extraction.stats;
    el.fileMeta.textContent = `${formatBytes(state.selectedFile.size)} · ${stats.nodeCount.toLocaleString()} units · ${stats.assetCount} assets`;
    stage(1, "Academic content extracted", `${stats.extractedChars.toLocaleString()} characters · ${stats.batchCount} AI batch${stats.batchCount === 1 ? "" : "es"} · ${stats.imageCount} images`);
    const userOptions = options();
    try { state.plan = await requestPlan(state.extraction, userOptions); state.resultMode = "ai"; }
    catch (error) { localMode = error?.code === "AI_NOT_CONFIGURED"; fallbackReason = error instanceof Error ? error.message : "The AI service was unavailable."; state.plan = createFallbackPlan(state.extraction, userOptions); state.resultMode = "local"; }
    finally { resetTurnstile(); }
    state.plan = compactPlan(state.plan, state.extraction, userOptions);
    stage(3, "Building the outputs", state.resultMode === "ai" ? "Creating the final HTML preview and PowerPoint deck…" : "Creating a local draft preview for inspection…");
    state.generatedHTML = buildLectureHTML(state.plan, state.extraction.assets, userOptions);
    state.generatedFilename = safeFilename(state.plan?.metadata?.title || state.extraction.title || "redesigned-lecture");
    if (state.extraction.extractionStatus !== "verified-native") message(state.extraction.warnings.join(" ") || "This file needs OCR or media conversion before verified PowerPoint export.", "warning");
    else if (state.resultMode === "ai" && state.verification?.valid) message("Structured draft verified: every source unit and supported image is accounted for.", "success");
    else if (state.resultMode === "local") message(`${localMode ? "AI is not configured" : "AI redesign failed"}; showing a local draft. ${fallbackReason}`, "warning");
    showPreview();
  } catch (error) { message(error instanceof Error ? error.message : "The lecture could not be processed."); clearResult(); }
  finally { state.busy = false; updateButton(); }
}

el.fileInput?.addEventListener("change", () => selectFile(el.fileInput.files?.[0]));
el.removeFile?.addEventListener("click", removeFile);
el.processButton?.addEventListener("click", processLecture);
el.dropZone?.addEventListener("dragover", (event) => { event.preventDefault(); el.dropZone.classList.add("dragging"); });
el.dropZone?.addEventListener("dragleave", () => el.dropZone.classList.remove("dragging"));
el.dropZone?.addEventListener("drop", (event) => { event.preventDefault(); el.dropZone.classList.remove("dragging"); selectFile(event.dataTransfer?.files?.[0]); });
el.downloadButton?.addEventListener("click", () => { const blob = new Blob([state.generatedHTML], { type: "text/html;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${state.generatedFilename}.html`; anchor.click(); URL.revokeObjectURL(url); });
el.downloadPptxButton?.addEventListener("click", async () => { try { if (state.extraction?.extractionStatus !== "verified-native") throw new Error("Verified PowerPoint export is blocked until OCR-required pages or unsupported visuals are resolved."); el.downloadPptxButton.disabled = true; await downloadPptx(state.plan, state.extraction?.assets || [], `${state.generatedFilename}.pptx`); } catch (error) { message(error instanceof Error ? error.message : "PowerPoint export failed."); } finally { el.downloadPptxButton.disabled = false; } });
el.openPreviewButton?.addEventListener("click", () => { el.dialogFrame.srcdoc = state.generatedHTML; el.previewDialog.showModal(); });
el.closeDialog?.addEventListener("click", () => el.previewDialog.close());

async function loadConfig() {
  try { const response = await fetch("/api/config", { cache: "no-store" }); const config = await response.json(); state.config = { ...state.config, ...config }; backendStatus(config.configured ? "ready" : "warning", config.configured ? `AI ready · ${config.model}` : `AI unavailable on ${deploymentLabel()}`); if (config.turnstileSiteKey) { state.config.turnstileSiteKey = config.turnstileSiteKey; el.turnstileArea.hidden = false; const render = () => { if (!window.turnstile || state.turnstileId !== null) return; state.turnstileId = window.turnstile.render(el.turnstileWidget, { sitekey: config.turnstileSiteKey, callback: (token) => { state.turnstileToken = token; updateButton(); }, "expired-callback": resetTurnstile, "error-callback": resetTurnstile }); }; window.turnstile ? render() : window.addEventListener("load", render, { once: true }); } }
  catch { backendStatus("warning", "Backend status unavailable"); }
  updateButton();
}

loadConfig();
