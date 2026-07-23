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

const genericSection = /^(?:continued|continuation|cont\.?|slide\s+\d+|page\s+\d+|\d+)$/i;
function compactBlocks(blocks) {
  const output = [];
  for (const raw of Array.isArray(blocks) ? blocks : []) {
    const block = { ...raw };
    const previous = output.at(-1);
    if (block.type === "paragraph" && previous?.type === "paragraph" && !block.heading && !previous.heading) {
      const joined = `${previous.text || ""} ${block.text || ""}`.replace(/\s+/g, " ").trim();
      if (joined.length <= 1800 && (!/[.!?)]$/.test(previous.text || "") || (previous.text || "").length < 160 || (block.text || "").length < 120)) {
        previous.text = joined;
        continue;
      }
    }
    output.push(block);
  }
  return output;
}
function compactSections(sections) {
  const grouped = [];
  for (const raw of Array.isArray(sections) ? sections : []) {
    const title = String(raw?.title || "Concept").trim() || "Concept";
    const section = { ...raw, title, blocks: compactBlocks(raw?.blocks) };
    if (!section.blocks.length) continue;
    const previous = grouped.at(-1);
    if (previous && (genericSection.test(title) || previous.title.toLowerCase() === title.toLowerCase())) {
      previous.blocks = compactBlocks([...previous.blocks, ...section.blocks]);
      continue;
    }
    grouped.push(section);
  }

  const chunked = [];
  for (const section of grouped) {
    for (let offset = 0, part = 1; offset < section.blocks.length; offset += 12, part += 1) {
      chunked.push({ ...section, title: part === 1 ? section.title : `${section.title} · Part ${part}`, blocks: section.blocks.slice(offset, offset + 12) });
    }
  }
  return chunked.slice(0, 60);
}
function compactPlan(plan, extraction, userOptions) {
  const source = plan && typeof plan === "object" ? plan : {};
  return {
    ...source,
    metadata: {
      ...(source.metadata || {}),
      title: source?.metadata?.title || extraction.title,
      courseCode: userOptions.courseCode || source?.metadata?.courseCode || "Course",
      lectureLabel: userOptions.lectureLabel || source?.metadata?.lectureLabel || "Lecture",
      instructor: userOptions.instructor || source?.metadata?.instructor || "",
    },
    learningObjectives: [...new Set(Array.isArray(source.learningObjectives) ? source.learningObjectives : [])].slice(0, 8),
    sections: compactSections(source.sections),
    finalTakeaways: [...new Set(Array.isArray(source.finalTakeaways) ? source.finalTakeaways : [])].slice(0, 10),
  };
}
function mergePlans(plans, extraction, userOptions) {
  const first = plans[0] || {};
  return compactPlan({
    metadata: { ...(first.metadata || {}) },
    overview: first.overview || "",
    learningObjectives: plans.flatMap((plan) => Array.isArray(plan.learningObjectives) ? plan.learningObjectives : []),
    sections: plans.flatMap((plan) => Array.isArray(plan.sections) ? plan.sections : []),
    finalTakeaways: plans.flatMap((plan) => Array.isArray(plan.finalTakeaways) ? plan.finalTakeaways : []),
  }, extraction, userOptions);
}

async function requestBatch(extraction, userOptions, batch, index, total) {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    stage(2, "Reorganizing with Gemini", `Batch ${index + 1} of ${total}${attempt > 1 ? " · retrying" : ""}…`);
    try {
      const response = await fetch("/api/redesign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          turnstileToken: state.turnstileToken || undefined,
          source: {
            title: extraction.title,
            batches: [batch],
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
        error.nonRetryable = response.status === 400 || response.status === 401 || response.status === 403 || response.status === 413 || response.status === 503;
        throw error;
      }
      if (!payload.plan) throw new Error("The AI service did not return a lecture plan.");
      return payload.plan;
    } catch (error) {
      lastError = error;
      if (error?.nonRetryable || attempt >= 2) break;
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }
  throw lastError;
}
async function requestPlan(extraction, userOptions) {
  const plans = [];
  for (let index = 0; index < extraction.batches.length; index += 1) {
    plans.push(await requestBatch(extraction, userOptions, extraction.batches[index], index, extraction.batches.length));
  }
  return mergePlans(plans, extraction, userOptions);
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

    state.plan = compactPlan(state.plan, state.extraction, userOptions);
    stage(3, "Building the outputs", state.resultMode === "ai" ? "Creating the final HTML preview and PowerPoint deck…" : "Creating a local draft preview for inspection…");
    state.generatedHTML = buildLectureHTML(state.plan, state.extraction.assets, userOptions);
    state.generatedFilename = safeFilename(state.plan?.metadata?.title || state.extraction.title);
    showPreview();

    const notices = [...state.extraction.warnings];
    if (localMode) notices.unshift(`The ${deploymentLabel()} cannot access an AI key. A local draft preview was created, but final PPTX export is disabled until Gemini is available in this same Cloudflare environment and the deployment is rebuilt.`);
    else if (fallbackReason) notices.unshift(`AI request failed: ${fallbackReason} A local draft preview was created; final PPTX export is disabled so it is not mistaken for the AI-redesigned result.`);
    else notices.unshift(`Gemini reorganized ${stats.batchCount} independently retryable batch${stats.batchCount === 1 ? "" : "es"}. Final PPTX export is enabled.`);
    const tone = fallbackReason || state.extraction.warnings.length ? "warning" : "success";
    message(notices.join(" "), tone);
  } catch (error) {
    el.processingState.hidden = true;
    el.emptyState.hidden = false;
    message(error instanceof Error ? error.message : "The lecture could not be processed.");
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
  anchor.download = state.generatedFilename || "redesigned-lecture.html";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
async function downloadPowerPoint() {
  if (!state.plan || !state.extraction) return;
  if (state.resultMode !== "ai") {
    message("Final PowerPoint export requires a successful Gemini redesign. This result is a local draft because the current Cloudflare deployment could not use AI.", "warning");
    return;
  }
  el.downloadPptxButton.disabled = true;
  try {
    await downloadPptx(state.plan, state.extraction.assets, (state.generatedFilename || "redesigned-lecture.html").replace(/\.html$/i, ".pptx"));
  } catch (error) {
    message(error instanceof Error ? error.message : "PowerPoint export failed.");
  } finally {
    el.downloadPptxButton.disabled = false;
  }
}
function openPreview() { if (!state.generatedHTML) return; el.dialogFrame.srcdoc = state.generatedHTML; el.previewDialog.showModal(); }
function loadTurnstile(siteKey) {
  if (!siteKey) return;
  el.turnstileArea.hidden = false;
  const started = Date.now();
  const attempt = () => {
    if (window.turnstile?.render) {
      state.turnstileId = window.turnstile.render(el.turnstileWidget, {
        sitekey: siteKey,
        theme: "light",
        size: "flexible",
        action: "redesign_lecture",
        callback: (token) => { state.turnstileToken = token; updateButton(); },
        "expired-callback": () => { state.turnstileToken = ""; updateButton(); },
        "error-callback": () => { state.turnstileToken = ""; message("Verification could not load. Refresh the page or check the Turnstile domain configuration.", "warning"); updateButton(); },
      });
      return;
    }
    if (Date.now() - started < 10000) setTimeout(attempt, 150);
    else message("Turnstile did not load. Check your content-security policy or network connection.", "warning");
  };
  attempt();
}
async function loadConfig() {
  try {
    const response = await fetch(`/api/config?ts=${Date.now()}`, { headers: { accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.config = { ...state.config, ...(await response.json()) };
    backendStatus(state.config.configured ? "ready" : "warning", state.config.configured ? `Gemini ready · ${state.config.model}` : "Local draft mode · AI key unavailable");
    if (el.aiSetupHint) el.aiSetupHint.textContent = state.config.configured
      ? `AI reorganization is active through ${state.config.keySource || "a Cloudflare secret"}; final PPTX export is enabled after a successful redesign.`
      : `This ${deploymentLabel()} cannot access GEMINI_API_KEY or GOOGLE_API_KEY. Add the secret to this exact Cloudflare environment and redeploy. Until then, only a local draft preview is available.`;
    loadTurnstile(state.config.turnstileSiteKey);
  } catch {
    backendStatus("warning", "Local draft mode · API unavailable");
    if (el.aiSetupHint) el.aiSetupHint.textContent = "The Cloudflare API endpoint is unavailable. Local draft preview remains available, but final PPTX export requires a working AI endpoint.";
  } finally { updateButton(); }
}

el.fileInput.addEventListener("change", () => selectFile(el.fileInput.files?.[0]));
el.removeFile.addEventListener("click", removeFile);
el.processButton.addEventListener("click", processLecture);
el.downloadButton.addEventListener("click", downloadHtml);
el.downloadPptxButton?.addEventListener("click", downloadPowerPoint);
el.openPreviewButton.addEventListener("click", openPreview);
el.closeDialog.addEventListener("click", () => el.previewDialog.close());
el.previewDialog.addEventListener("click", (event) => { if (event.target === el.previewDialog) el.previewDialog.close(); });
["dragenter", "dragover"].forEach((name) => el.dropZone.addEventListener(name, (event) => { event.preventDefault(); el.dropZone.classList.add("dragging"); }));
["dragleave", "drop"].forEach((name) => el.dropZone.addEventListener(name, (event) => { event.preventDefault(); el.dropZone.classList.remove("dragging"); }));
el.dropZone.addEventListener("drop", (event) => selectFile(event.dataTransfer?.files?.[0]));
loadConfig();