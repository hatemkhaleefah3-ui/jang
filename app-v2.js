import { extractLecture, applyOcrResults, createFallbackPlan, getUploadPolicy } from "./source-importer.js";
import { applyBrowserOcr } from "./ocr-engine.js";
import { buildLectureHTML, safeFilename } from "./lecture-template.js";
import { createPptxFile, downloadPreparedPptx } from "./pptx-exporter.js";
import { createPptxFileFromHtml, hydrateHtmlAssetSources } from "./html-pptx-exporter.js";

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
  config: { configured: null, turnstileSiteKey: null, model: "gemini-3.5-flash", keySource: null, environment: "deployment", branch: "" },
  selectedFile: null,
  extraction: null,
  plan: null,
  manifest: null,
  generatedHTML: "",
  generatedFilename: "",
  resultMode: "none",
  turnstileToken: "",
  turnstileId: null,
  busy: false,
  verification: null,
  designReport: null,
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
function clearResult() { state.extraction = null; state.plan = null; state.manifest = null; state.verification = null; state.designReport = null; state.generatedHTML = ""; state.generatedFilename = ""; state.resultMode = "none"; state.pptxBlob = null; state.pptxReport = null; el.previewFrame.removeAttribute("srcdoc"); el.processingState.hidden = true; el.previewShell.hidden = true; el.emptyState.hidden = false; el.resultTitle.textContent = "Waiting for a lecture"; el.downloadPptxButton.disabled = true; message(""); stages.forEach((item) => item?.classList.remove("done", "active")); }
function selectFile(file) { if (!file) return; state.selectedFile = file; clearResult(); el.dropZone.hidden = true; el.fileCard.hidden = false; el.fileName.textContent = file.name; if (el.fileType) el.fileType.textContent = (file.name.split(".").pop() || "FILE").toUpperCase().slice(0, 5); const policy = getUploadPolicy(); const warning = file.size > policy.warningBytes ? " · large file; adaptive mode" : " · ready to import"; el.fileMeta.textContent = `${formatBytes(file.size)}${warning}`; if (file.size > policy.maxBytes) message(`This device's safe upload limit is ${policy.mobile ? "20" : "50"} MB.`, "warning"); updateButton(); }
function removeFile() { state.selectedFile = null; el.fileInput.value = ""; el.fileCard.hidden = true; el.dropZone.hidden = false; clearResult(); updateButton(); }
function options() { return { sourceTitle: state.extraction?.title || "", courseCode: el.courseCode.value.trim(), lectureLabel: el.lectureLabel.value.trim(), instructor: el.instructor.value.trim(), language: el.language.value, includeToc: el.includeToc.checked, concise: el.conciseMode.checked }; }

function stableSourceId(unit, index) {
  return unit?.id || `src_${Number(unit?.page || unit?.sourcePage || 0)}_${Number(unit?.order || unit?.sourceOrder || index + 1)}_${String(unit?.kind || "paragraph").replace(/[^a-z0-9_-]+/gi, "_")}`.toLowerCase();
}

function extractionManifest(extraction) {
  return {
    units: (Array.isArray(extraction?.sourceUnits) ? extraction.sourceUnits : []).map((unit, index) => ({
      id: stableSourceId(unit, index),
      kind: unit?.kind || "paragraph",
      sourcePage: Number(unit?.page || unit?.sourcePage || 0),
      sourceOrder: Number(unit?.order || unit?.sourceOrder || index + 1),
      verbatimText: String(unit?.text || unit?.verbatimText || "").replace(/\u0000/g, "").trim(),
      role: unit?.role || "body",
      extractionMethod: unit?.extractionMethod || "native",
      confidence: Number.isFinite(unit?.confidence) ? unit.confidence : 1,
    })).filter((unit) => unit.verbatimText),
    assets: (Array.isArray(extraction?.assets) ? extraction.assets : []).map((asset, index) => ({
      id: asset?.id || `asset_${index + 1}`,
      occurrenceId: asset?.occurrenceId || asset?.id || `asset_${index + 1}`,
      sourcePage: Number(asset?.sourcePage || 0),
      sourceOrder: Number(asset?.sourceOrder || index + 1),
      kind: asset?.type || "image",
      alt: String(asset?.alt || "").trim(),
      caption: String(asset?.caption || "").trim(),
      status: "available",
    })),
  };
}

function assetPreviews(assets, byteBudget = 3_800_000, limit = 16) {
  const previews = new Map();
  let used = 0;
  for (const asset of Array.isArray(assets) ? assets : []) {
    const source = String(asset?.source || "");
    if (!asset?.id || !/^data:image\/(?:png|jpe?g|webp);base64,/i.test(source) || previews.size >= limit) continue;
    if (used + source.length > byteBudget) continue;
    previews.set(asset.id, source);
    used += source.length;
  }
  return previews;
}

function compactPlan(plan, extraction, userOptions) {
  const source = plan && typeof plan === "object" ? plan : {};
  return {
    ...source,
    metadata: { ...(source.metadata || {}), title: source?.metadata?.title || extraction.title, courseCode: userOptions.courseCode || source?.metadata?.courseCode || "Course", lectureLabel: userOptions.lectureLabel || source?.metadata?.lectureLabel || "Lecture", instructor: userOptions.instructor || source?.metadata?.instructor || "" },
    learningObjectives: [...new Set(Array.isArray(source.learningObjectives) ? source.learningObjectives : [])],
    sections: Array.isArray(source.sections) ? source.sections.filter((section) => Array.isArray(section?.blocks) && section.blocks.length) : [],
    finalTakeaways: [...new Set(Array.isArray(source.finalTakeaways) ? source.finalTakeaways : [])],
    sourceManifest: extractionManifest(extraction),
  };
}

async function requestDesignedHtml(extraction, userOptions) {
  stage(2, extraction.ocrPages?.length ? "Reading sparse pages and designing with Gemini" : "Designing the lecture with Gemini", extraction.ocrPages?.length ? `Gemini will verify ${extraction.ocrPages.length} OCR page${extraction.ocrPages.length === 1 ? "" : "s"}, then create the complete lecture HTML using the master design system…` : "Creating the complete page structure, boxes, diagrams, tables, and image composition in HTML…");
  const previews = assetPreviews(extraction.assets);
  const response = await fetch("/api/design-html", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      turnstileToken: state.turnstileToken || undefined,
      source: {
        title: extraction.title,
        sourceUnits: extraction.sourceUnits || [],
        assets: (extraction.assets || []).map(({ id, occurrenceId, type, alt, caption, sourceKind, sourcePage, sourceOrder, originalFormat }) => ({ id, occurrenceId, type, alt, caption, sourceKind, sourcePage, sourceOrder, originalFormat, previewData: previews.get(id) || "" })),
        ocrPages: extraction.ocrPages || [],
        extractionStatus: extraction.extractionStatus,
        verificationIssues: extraction.verificationIssues || [],
      },
      metadata: {
        title: extraction.title,
        courseCode: userOptions.courseCode,
        lectureLabel: userOptions.lectureLabel,
        instructor: userOptions.instructor,
        language: userOptions.language,
        direction: userOptions.language === "Arabic" ? "rtl" : "ltr",
      },
      options: userOptions,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(payload.error || `The HTML design service returned HTTP ${response.status}.`); error.code = payload.code || "HTML_DESIGN_FAILED"; error.environment = payload.environment || state.config.environment; error.verification = payload.verification || null; throw error; }
  if (!payload.html || !payload.verification?.valid || !payload.manifest) throw new Error("Gemini did not return a verified complete lecture HTML document.");
  return payload;
}

function unresolvedConversionMessage(extraction) {
  const issues = Array.isArray(extraction?.verificationIssues) ? extraction.verificationIssues : [];
  const visualIssues = issues.filter((issue) => /visual|image|svg|canvas|snapshot/i.test(String(issue?.type || issue?.reason || "")));
  if (!visualIssues.length) return extraction?.warnings?.join(" ") || "Automatic source conversion did not finish.";
  const locations = visualIssues.map((issue) => issue?.sourcePage ? `slide ${issue.sourcePage}` : issue?.page ? `page ${issue.page}` : issue?.id || issue?.mediaPath || "an unknown visual");
  return `Automatic visual conversion failed for ${locations.join(", ")}. No content was omitted; the PowerPoint was not created.`;
}

function hasNonOcrIssues(extraction) {
  return (Array.isArray(extraction?.verificationIssues) ? extraction.verificationIssues : []).some((issue) => String(issue?.type || issue?.reason || "") !== "ocr-required");
}

function resetTurnstile() { state.turnstileToken = ""; if (state.turnstileId !== null && window.turnstile) { try { window.turnstile.reset(state.turnstileId); } catch {} } updateButton(); }
function deploymentLabel() { const environment = state.config.environment || "current"; const branch = state.config.branch ? ` (${state.config.branch})` : ""; return `${environment} deployment${branch}`; }

async function createLocalFallback(userOptions, reason) {
  if (state.extraction?.ocrPages?.length || state.extraction?.extractionStatus !== "verified-native") throw new Error(reason || unresolvedConversionMessage(state.extraction));
  state.plan = compactPlan(createFallbackPlan(state.extraction, userOptions), state.extraction, userOptions);
  state.manifest = state.plan.sourceManifest;
  state.resultMode = "local";
  stage(3, "Building the source-faithful fallback PowerPoint", "Gemini is unavailable. Creating and verifying the deterministic recovery layout…");
  const pptx = await createPptxFile(state.plan, state.extraction.assets || []);
  state.generatedHTML = buildLectureHTML(state.plan, state.extraction.assets, userOptions);
  state.pptxBlob = pptx.blob;
  state.pptxReport = pptx;
  return pptx;
}

async function processLecture() {
  if (!state.selectedFile || state.busy) return;
  state.busy = true;
  updateButton();
  showProcessing();
  let browserOcrApplied = false;
  let browserOcrError = "";
  try {
    stage(0, "Reading and converting the lecture", "Extracting text, preserving source order, rendering PDF pages, and converting Office visuals locally…");
    state.extraction = await extractLecture(state.selectedFile, (detail) => stage(0, "Reading and converting the lecture", detail));
    let stats = state.extraction.stats;
    el.fileMeta.textContent = `${formatBytes(state.selectedFile.size)} · ${stats.nodeCount.toLocaleString()} source pages · ${stats.assetCount} visual assets${stats.convertedVisualCount ? ` · ${stats.convertedVisualCount} converted` : ""}`;
    const userOptions = options();

    if (state.extraction.ocrPages?.length) {
      stage(1, "Applying local multi-pass OCR", `Reading ${state.extraction.ocrPages.length} sparse PDF page${state.extraction.ocrPages.length === 1 ? "" : "s"} with rotation, contrast, and segmentation retries…`);
      try {
        state.extraction = await applyBrowserOcr(state.extraction, userOptions.language, (detail) => stage(1, "Applying local multi-pass OCR", detail));
        browserOcrApplied = true;
      } catch (error) {
        browserOcrError = error instanceof Error ? error.message : "Browser OCR failed.";
        stage(1, "Local OCR requested a second reading", "The page images will be sent to Gemini together with the lecture design request…");
      }
    }

    stats = state.extraction.stats;
    stage(1, "Content extraction verified", `${stats.extractedChars.toLocaleString()} characters · ${stats.imageCount} images · ${stats.diagramCount || 0} source diagrams${stats.convertedVisualCount ? ` · ${stats.convertedVisualCount} visuals converted` : ""}${browserOcrApplied ? " · local OCR complete" : ""}`);
    if (state.extraction.extractionStatus === "incomplete" && hasNonOcrIssues(state.extraction)) throw new Error(unresolvedConversionMessage(state.extraction));

    let payload;
    try {
      payload = await requestDesignedHtml(state.extraction, userOptions);
    } catch (error) {
      resetTurnstile();
      if (error?.code !== "AI_NOT_CONFIGURED") {
        const prefix = browserOcrError && state.extraction?.ocrPages?.length ? `${browserOcrError} ` : "";
        throw new Error(`${prefix}${error instanceof Error ? error.message : "Gemini HTML design failed."}`);
      }
      const fallback = await createLocalFallback(userOptions, error instanceof Error ? error.message : "Gemini is not configured.");
      state.generatedFilename = safeFilename(state.plan?.metadata?.title || state.extraction.title || "redesigned-lecture").replace(/\.html$/i, "");
      const verificationText = `${fallback.packageVerification.slideCount} slides · ${fallback.report.expectedTextCount} original text units · ${fallback.packageVerification.embeddedMediaCount} image occurrence${fallback.packageVerification.embeddedMediaCount === 1 ? "" : "s"}`;
      message(`Gemini is not configured; a source-faithful fallback PowerPoint was created and verified: ${verificationText}.`, "warning");
      showPreview();
      return;
    } finally {
      resetTurnstile();
    }

    if (payload.ocr?.applied) state.extraction = applyOcrResults(state.extraction, payload.ocr.pages, "Gemini OCR");
    state.manifest = payload.manifest;
    state.verification = payload.verification;
    state.designReport = payload;
    state.resultMode = "html-ai";
    state.generatedHTML = hydrateHtmlAssetSources(payload.html, state.extraction.assets || []);
    state.generatedFilename = safeFilename(payload.metadata?.title || state.extraction.title || "redesigned-lecture").replace(/\.html$/i, "");

    stage(3, "Converting the verified HTML to PowerPoint", "Recreating text, tables, boxes, images, SVG shapes, connectors, and page geometry as editable PowerPoint objects, then verifying the package…");
    const pptx = await createPptxFileFromHtml(state.generatedHTML, state.extraction.assets || [], state.manifest, payload.metadata || userOptions);
    state.generatedHTML = pptx.verifiedHtml;
    state.pptxBlob = pptx.blob;
    state.pptxReport = pptx;
    stats = state.extraction.stats;
    el.fileMeta.textContent = `${formatBytes(state.selectedFile.size)} · ${stats.extractedChars.toLocaleString()} characters · ${stats.imageCount} images · verified HTML-derived PPTX`;
    const verificationText = `${pptx.packageVerification.slideCount} slides · ${pptx.report.expectedTextCount} exact source units · ${pptx.report.images} original images · ${pptx.report.nativeSvgShapes} editable diagram objects${pptx.report.fallbackSvgPaths ? ` · ${pptx.report.fallbackSvgPaths} decorative SVG path fallback${pptx.report.fallbackSvgPaths === 1 ? "" : "s"}` : ""}`;
    message(`PowerPoint ready from verified Gemini HTML: ${verificationText}.${browserOcrApplied ? " Local OCR completed before design." : payload.ocr?.applied ? " Gemini OCR completed before design." : ""}`, "success");
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
