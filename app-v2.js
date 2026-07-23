import { extractLecture, createFallbackPlan, getUploadPolicy } from "./extractor-v2.js";
import { buildLectureHTML, safeFilename } from "./lecture-template.js";

const $ = (selector) => document.querySelector(selector);
const el = {
  backendStatus: $("#backendStatus"), fileInput: $("#fileInput"), dropZone: $("#dropZone"), fileCard: $("#fileCard"), fileName: $("#fileName"), fileMeta: $("#fileMeta"), removeFile: $("#removeFile"),
  courseCode: $("#courseCode"), lectureLabel: $("#lectureLabel"), instructor: $("#instructor"), language: $("#language"), includeToc: $("#includeToc"), conciseMode: $("#conciseMode"), processButton: $("#processButton"),
  turnstileArea: $("#turnstileArea"), turnstileWidget: $("#turnstileWidget"), resultTitle: $("#resultTitle"), downloadButton: $("#downloadButton"), openPreviewButton: $("#openPreviewButton"),
  emptyState: $("#emptyState"), processingState: $("#processingState"), processingTitle: $("#processingTitle"), processingDetail: $("#processingDetail"), previewShell: $("#previewShell"), previewFrame: $("#previewFrame"),
  resultMessage: $("#resultMessage"), previewDialog: $("#previewDialog"), dialogFrame: $("#dialogFrame"), closeDialog: $("#closeDialog"), stageRead: $("#stageRead"), stageExtract: $("#stageExtract"), stagePlan: $("#stagePlan"), stageRender: $("#stageRender"),
};
const stages = [el.stageRead, el.stageExtract, el.stagePlan, el.stageRender];
const state = { config: { configured: false, turnstileSiteKey: null, model: "gemini-2.5-flash" }, selectedFile: null, extraction: null, generatedHTML: "", generatedFilename: "", turnstileToken: "", turnstileId: null, busy: false };

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"]; const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** exp)).toFixed(exp ? 1 : 0)} ${units[exp]}`;
}
function backendStatus(type, value) { el.backendStatus.classList.remove("ready", "warning"); if (type) el.backendStatus.classList.add(type); el.backendStatus.lastChild.textContent = ` ${value}`; }
function updateButton() { el.processButton.disabled = !state.selectedFile || state.busy || (state.config.turnstileSiteKey && !state.turnstileToken); }
function message(value, tone = "error") { el.resultMessage.hidden = !value; el.resultMessage.textContent = value || ""; el.resultMessage.style.background = tone === "warning" ? "#f6efd7" : ""; el.resultMessage.style.borderColor = tone === "warning" ? "#d5bf71" : ""; el.resultMessage.style.color = tone === "warning" ? "#65521b" : ""; }
function stage(index, title, detail) { stages.forEach((item, i) => { item.classList.toggle("done", i < index); item.classList.toggle("active", i === index); }); if (title) el.processingTitle.textContent = title; if (detail) el.processingDetail.textContent = detail; }
function showProcessing() { el.emptyState.hidden = true; el.previewShell.hidden = true; el.processingState.hidden = false; message(""); el.downloadButton.disabled = true; el.openPreviewButton.disabled = true; }
function showPreview() { el.processingState.hidden = true; el.emptyState.hidden = true; el.previewShell.hidden = false; el.previewFrame.srcdoc = state.generatedHTML; el.resultTitle.textContent = state.generatedFilename; el.downloadButton.disabled = false; el.openPreviewButton.disabled = false; }
function clearResult() { state.extraction = null; state.generatedHTML = ""; state.generatedFilename = ""; el.previewFrame.removeAttribute("srcdoc"); el.dialogFrame.removeAttribute("srcdoc"); el.processingState.hidden = true; el.previewShell.hidden = true; el.emptyState.hidden = false; el.resultTitle.textContent = "Waiting for a lecture"; el.downloadButton.disabled = true; el.openPreviewButton.disabled = true; message(""); stages.forEach((item) => item.classList.remove("done", "active")); }

function selectFile(file) {
  if (!file) return;
  state.selectedFile = file; clearResult(); el.dropZone.hidden = true; el.fileCard.hidden = false; el.fileName.textContent = file.name;
  const policy = getUploadPolicy();
  const warning = file.size > policy.warningBytes ? " · large file; adaptive mode" : " · ready to import";
  el.fileMeta.textContent = `${formatBytes(file.size)}${warning}`;
  if (file.size > policy.maxBytes) message(`This device's safe upload limit is ${policy.mobile ? "20" : "50"} MB.`, "warning");
  updateButton();
}
function removeFile() { state.selectedFile = null; el.fileInput.value = ""; el.fileCard.hidden = true; el.dropZone.hidden = false; clearResult(); updateButton(); }
function options() { return { sourceTitle: state.extraction?.title || "", courseCode: el.courseCode.value.trim(), lectureLabel: el.lectureLabel.value.trim(), instructor: el.instructor.value.trim(), language: el.language.value, includeToc: el.includeToc.checked, concise: el.conciseMode.checked }; }

async function requestPlan(extraction, userOptions) {
  const response = await fetch("/api/redesign-large", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ turnstileToken: state.turnstileToken || undefined, source: { title: extraction.title, batches: extraction.batches, assets: extraction.assets.map(({ id, type, alt, caption, sourceKind }) => ({ id, type, alt, caption, sourceKind })) }, options: userOptions }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `The AI service returned HTTP ${response.status}.`);
  if (!payload.plan) throw new Error("The AI service did not return a lecture plan.");
  return payload;
}
function resetTurnstile() { state.turnstileToken = ""; if (state.turnstileId !== null && window.turnstile) { try { window.turnstile.reset(state.turnstileId); } catch { /* already reset */ } } updateButton(); }

async function processLecture() {
  if (!state.selectedFile || state.busy) return;
  state.busy = true; updateButton(); showProcessing(); let fallbackReason = ""; let batchesProcessed = 0;
  try {
    stage(0, "Reading the lecture", "Preparing the file for adaptive extraction…");
    state.extraction = await extractLecture(state.selectedFile, (detail) => stage(0, "Reading the lecture", detail));
    const stats = state.extraction.stats;
    el.fileMeta.textContent = `${formatBytes(state.selectedFile.size)} · ${stats.nodeCount.toLocaleString()} elements · ${stats.assetCount} assets`;
    stage(1, "Academic content extracted", `${stats.extractedChars.toLocaleString()} characters · ${stats.batchCount} AI batch${stats.batchCount === 1 ? "" : "es"} · ${stats.imageCount} images · ${stats.diagramCount} diagrams`);
    const userOptions = options(); let plan;
    if (state.config.configured) {
      stage(2, "Reorganizing with Gemini", `Processing ${stats.batchCount} bounded batch${stats.batchCount === 1 ? "" : "es"} in one protected job…`);
      try { const result = await requestPlan(state.extraction, userOptions); plan = result.plan; batchesProcessed = result.batchesProcessed || stats.batchCount; }
      catch (error) { fallbackReason = error instanceof Error ? error.message : "The AI service was unavailable."; plan = createFallbackPlan(state.extraction, userOptions); }
      finally { resetTurnstile(); }
    } else {
      fallbackReason = "Gemini is not configured in Cloudflare Pages, so Jang used its local preservation layout.";
      plan = createFallbackPlan(state.extraction, userOptions);
    }
    stage(3, "Building the new HTML", "Applying the lecture design system and reconnecting visual assets…");
    state.generatedHTML = buildLectureHTML(plan, state.extraction.assets, userOptions);
    state.generatedFilename = safeFilename(plan?.metadata?.title || state.extraction.title);
    showPreview();
    const notices = [...state.extraction.warnings];
    if (fallbackReason) notices.unshift(`AI reorganization was unavailable: ${fallbackReason} A local source-order layout was created instead.`);
    else notices.unshift(`Gemini reorganized ${batchesProcessed} batch${batchesProcessed === 1 ? "" : "es"}.`);
    if (notices.length) message(notices.join(" "), notices.some((item) => /not included|unavailable|limited|too complex|large/i.test(item)) ? "warning" : "warning");
  } catch (error) {
    el.processingState.hidden = true; el.emptyState.hidden = false; message(error instanceof Error ? error.message : "The lecture could not be processed.");
  } finally { state.busy = false; updateButton(); }
}

function download() { if (!state.generatedHTML) return; const blob = new Blob([state.generatedHTML], { type: "text/html;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = state.generatedFilename || "redesigned-lecture.html"; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); }
function openPreview() { if (!state.generatedHTML) return; el.dialogFrame.srcdoc = state.generatedHTML; el.previewDialog.showModal(); }

function loadTurnstile(siteKey) {
  if (!siteKey) return; el.turnstileArea.hidden = false; const started = Date.now();
  const attempt = () => {
    if (window.turnstile?.render) {
      state.turnstileId = window.turnstile.render(el.turnstileWidget, { sitekey: siteKey, theme: "light", size: "flexible", action: "redesign_lecture", callback: (token) => { state.turnstileToken = token; updateButton(); }, "expired-callback": () => { state.turnstileToken = ""; updateButton(); }, "error-callback": () => { state.turnstileToken = ""; message("Verification could not load. Refresh the page or check the Turnstile domain configuration.", "warning"); updateButton(); } });
      return;
    }
    if (Date.now() - started < 10000) setTimeout(attempt, 150); else message("Turnstile did not load. Check your content-security policy or network connection.", "warning");
  };
  attempt();
}
async function loadConfig() {
  try { const response = await fetch("/api/config", { headers: { accept: "application/json" } }); if (!response.ok) throw new Error(`HTTP ${response.status}`); state.config = { ...state.config, ...(await response.json()) }; backendStatus(state.config.configured ? "ready" : "warning", state.config.configured ? `Gemini ready · ${state.config.model}` : "Local mode · add Gemini secret"); loadTurnstile(state.config.turnstileSiteKey); }
  catch { backendStatus("warning", "Local mode · API unavailable"); }
  finally { updateButton(); }
}

el.fileInput.addEventListener("change", () => selectFile(el.fileInput.files?.[0])); el.removeFile.addEventListener("click", removeFile); el.processButton.addEventListener("click", processLecture); el.downloadButton.addEventListener("click", download); el.openPreviewButton.addEventListener("click", openPreview); el.closeDialog.addEventListener("click", () => el.previewDialog.close()); el.previewDialog.addEventListener("click", (event) => { if (event.target === el.previewDialog) el.previewDialog.close(); });
["dragenter", "dragover"].forEach((name) => el.dropZone.addEventListener(name, (event) => { event.preventDefault(); el.dropZone.classList.add("dragging"); }));
["dragleave", "drop"].forEach((name) => el.dropZone.addEventListener(name, (event) => { event.preventDefault(); el.dropZone.classList.remove("dragging"); }));
el.dropZone.addEventListener("drop", (event) => selectFile(event.dataTransfer?.files?.[0]));
loadConfig();
