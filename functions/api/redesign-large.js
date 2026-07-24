import { appendRecoverySection, createAssetRecord, createDraftV1, createSourceUnit, verifyDraftCoverage } from "../../structured-draft.js";

const MAX_BODY_BYTES = 8_000_000;
const MAX_VERIFY_RETRIES = 2;
const MAX_OCR_PAGES = 40;
const OCR_BATCH_IMAGES = 8;
const OCR_BATCH_BASE64_CHARS = 2_400_000;
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
const respond = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers });
const asArray = (value) => Array.isArray(value) ? value : [];

function cleanText(value) { return typeof value === "string" ? value.replace(/\u0000/g, "").trim() : ""; }
function boundedText(value, max, label) {
  const result = cleanText(value);
  if (result.length > max) throw new Error(`${label} exceeds the supported request size.`);
  return result;
}
function resolveModel(env) { const requested = boundedText(env.GEMINI_MODEL, 80, "Model name").replace(/^models\//, ""); return !requested || requested === "gemini-2.5-flash" ? DEFAULT_MODEL : requested; }
function sameOrigin(request) { const origin = request.headers.get("origin"); if (!origin) return true; try { return new URL(origin).host === new URL(request.url).host || new URL(request.url).hostname === "localhost"; } catch { return false; } }
async function verifyTurnstile(token, env, request) { if (!env.TURNSTILE_SECRET_KEY) return true; if (!token || typeof token !== "string" || token.length > 2048) return false; const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: request.headers.get("CF-Connecting-IP") || undefined, idempotency_key: crypto.randomUUID() }) }); return verification.ok && (await verification.json()).success === true; }
async function readLimited(request) { if (!request.body) return ""; const reader = request.body.getReader(); const decoder = new TextDecoder(); let total = 0; let result = ""; try { while (true) { const { done, value } = await reader.read(); if (done) break; total += value.byteLength; if (total > MAX_BODY_BYTES) throw new Error("REQUEST_TOO_LARGE"); result += decoder.decode(value, { stream: true }); } return result + decoder.decode(); } finally { reader.releaseLock(); } }

function normalizeOcrPage(page) {
  const pageNumber = Number(page?.page || 0);
  const assetId = boundedText(page?.assetId, 80, "OCR asset id");
  const imageData = cleanText(page?.imageData);
  const match = imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || !assetId || !match) return null;
  const data = match[2].replace(/\s+/g, "");
  if (data.length > 1_600_000) throw new Error(`OCR image for page ${pageNumber} is too large.`);
  return { page: pageNumber, assetId, mimeType: match[1].toLowerCase(), data };
}

function normalize(body) {
  const source = body?.source || {};
  const options = body?.options || {};
  const batches = asArray(source.batches).map((batch, index) => boundedText(batch, 500_000, `Source batch ${index + 1}`)).filter(Boolean);
  const sourceUnits = asArray(source.sourceUnits).map((unit, index) => ({
    page: Number(unit?.page || unit?.sourcePage || 0),
    order: Number(unit?.order || unit?.sourceOrder || 0),
    kind: boundedText(unit?.kind, 40, `Source unit ${index + 1} kind`) || "paragraph",
    text: boundedText(unit?.text || unit?.verbatimText, 200_000, `Source unit ${index + 1}`),
    runs: asArray(unit?.runs),
    extractionMethod: boundedText(unit?.extractionMethod, 30, `Source unit ${index + 1} extraction method`) || "native",
    confidence: Number.isFinite(unit?.confidence) ? unit.confidence : 1,
  })).filter((unit) => unit.text);
  if (!batches.length && !sourceUnits.length) throw new Error("No readable lecture content was provided.");
  const assets = asArray(source.assets).map((asset, index) => ({
    id: boundedText(asset?.id, 80, `Asset ${index + 1} id`),
    type: boundedText(asset?.type, 30, `Asset ${index + 1} type`) || "image",
    alt: boundedText(asset?.alt, 1000, `Asset ${index + 1} alt text`),
    caption: boundedText(asset?.caption, 2000, `Asset ${index + 1} caption`),
    sourceKind: boundedText(asset?.sourceKind, 80, `Asset ${index + 1} source kind`),
    sourcePage: Number(asset?.sourcePage || 0),
    sourceOrder: index + 1,
  })).filter((asset) => asset.id);
  const ocrPages = asArray(source.ocrPages).map(normalizeOcrPage).filter(Boolean);
  if (ocrPages.length > MAX_OCR_PAGES) throw new Error(`OCR supports up to ${MAX_OCR_PAGES} pages in one lecture.`);
  return {
    source: {
      title: boundedText(source.title, 500, "Lecture title"),
      batches,
      sourceUnits,
      assets,
      ocrPages,
      extractionStatus: boundedText(source.extractionStatus, 40, "Extraction status"),
      verificationIssues: asArray(source.verificationIssues),
    },
    options: {
      courseCode: boundedText(options.courseCode, 80, "Course code"),
      lectureLabel: boundedText(options.lectureLabel, 100, "Lecture label"),
      instructor: boundedText(options.instructor, 160, "Instructor"),
      language: boundedText(options.language, 40, "Language") || "auto",
      concise: Boolean(options.concise),
    },
  };
}

function buildDraftV1(data) {
  const rawUnits = data.source.sourceUnits.length ? data.source.sourceUnits : data.source.batches.map((batch, index) => ({ page: index + 1, order: 1, kind: "paragraph", text: batch, runs: [{ text: batch }], extractionMethod: "native", confidence: 1 }));
  const units = rawUnits.map((unit) => createSourceUnit(unit));
  const assets = data.source.assets.map((asset) => createAssetRecord({ id: asset.id, kind: asset.type, sourcePage: asset.sourcePage, sourceOrder: asset.sourceOrder, alt: asset.alt, caption: asset.caption, mimeType: "", status: "available" }));
  return createDraftV1({ documentId: "doc_001", metadata: { title: data.source.title || "Untitled lecture", language: data.options.language, direction: data.options.language === "Arabic" ? "rtl" : "ltr" }, units, assets });
}

function modelText(payload) { const parts = payload?.candidates?.[0]?.content?.parts; return Array.isArray(parts) ? parts.map((part) => typeof part?.text === "string" ? part.text : "").join("").trim() : ""; }
function extractObject(value) { const start = value.indexOf("{"); if (start < 0) return value; let inString = false; let escaped = false; let depth = 0; for (let i = start; i < value.length; i += 1) { const char = value[i]; if (inString) { if (escaped) escaped = false; else if (char === "\\") escaped = true; else if (char === '"') inString = false; continue; } if (char === '"') inString = true; else if (char === "{") depth += 1; else if (char === "}") { depth -= 1; if (depth === 0) return value.slice(start, i + 1); } } return value.slice(start); }
function removeTrailingCommas(value) { return value.replace(/,\s*([}\]])/g, "$1"); }
function parseJsonOutput(raw) { const base = extractObject(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").replace(/[\u201c\u201d]/g, '"').trim()); for (const candidate of [base, removeTrailingCommas(base)]) { try { const parsed = JSON.parse(candidate); if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed; } catch {} } throw new Error("Gemini returned malformed JSON."); }
function verificationSummary(diff) { return JSON.stringify({ missingSourceIds: diff.missingSourceIds, duplicatedSourceIds: diff.duplicatedSourceIds, unknownSourceIds: diff.unknownSourceIds, missingAssetIds: diff.missingAssetIds, duplicatedAssetIds: diff.duplicatedAssetIds, unknownAssetIds: diff.unknownAssetIds, structuralErrors: diff.structuralErrors }); }

async function callGeminiParts(parts, env, model, systemText, maxOutputTokens = 32000) {
  const apiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemText }] },
      contents: [{ role: "user", parts }],
      generationConfig: { maxOutputTokens, responseMimeType: "application/json", temperature: 0.05 },
    }),
  });
  const payload = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(payload?.error?.message || `Gemini returned HTTP ${result.status}.`);
  const raw = modelText(payload);
  if (!raw) throw new Error("Gemini returned an empty response.");
  return parseJsonOutput(raw);
}

function ocrBatches(pages) {
  const batches = [];
  let current = [];
  let chars = 0;
  for (const page of pages) {
    if (current.length && (current.length >= OCR_BATCH_IMAGES || chars + page.data.length > OCR_BATCH_BASE64_CHARS)) {
      batches.push(current);
      current = [];
      chars = 0;
    }
    current.push(page);
    chars += page.data.length;
  }
  if (current.length) batches.push(current);
  return batches;
}

async function callOcr(data, env, model) {
  const results = [];
  for (const batch of ocrBatches(data.source.ocrPages)) {
    const parts = [{ text: "OCR each supplied lecture page. Return one JSON object with a pages array. Every item must have page, text, lines, and confidence. Copy all visible text exactly in reading order. Preserve numbers, formulas, punctuation, symbols, labels, captions, table cells, and diagram labels. Do not summarize, translate, infer, or omit repeated text. Use the page number written immediately before each image." }];
    for (const page of batch) {
      parts.push({ text: `PAGE ${page.page}` });
      parts.push({ inline_data: { mime_type: page.mimeType, data: page.data } });
    }
    const parsed = await callGeminiParts(parts, env, model, "You are a strict OCR engine. Return JSON only and transcribe, never summarize.", 32000);
    results.push(...asArray(parsed?.pages));
  }
  const byPage = new Map(results.map((item) => [Number(item?.page), item]));
  const normalized = data.source.ocrPages.map((page) => {
    const item = byPage.get(page.page);
    const lines = asArray(item?.lines).map(cleanText).filter(Boolean);
    const text = cleanText(item?.text) || lines.join("\n");
    if (!text) throw new Error(`OCR did not return readable text for PDF page ${page.page}.`);
    return { page: page.page, text, lines: lines.length ? lines : text.split(/\r?\n/).map(cleanText).filter(Boolean), confidence: Number.isFinite(item?.confidence) ? Math.max(0, Math.min(1, item.confidence)) : 0.9 };
  });
  return normalized;
}

function applyOcrToData(data, ocrResults) {
  const pages = new Set(data.source.ocrPages.map((item) => item.page));
  const retained = data.source.sourceUnits.filter((unit) => !pages.has(Number(unit.page)));
  for (const result of ocrResults) {
    result.lines.forEach((line, index) => retained.push({ page: result.page, order: index + 1, kind: "paragraph", text: line, runs: [{ text: line }], extractionMethod: "ocr", confidence: result.confidence }));
  }
  retained.sort((a, b) => Number(a.page) - Number(b.page) || Number(a.order) - Number(b.order));
  data.source.sourceUnits = retained;
  data.source.extractionStatus = "verified-native";
  data.source.verificationIssues = data.source.verificationIssues.filter((issue) => issue?.type !== "ocr-required");
}

function prompt(draftV1, data, previousDraft, diff, attempt) {
  const diagramIds = draftV1.sourceManifest.units.filter((unit) => unit.kind === "diagram").map((unit) => unit.id);
  const tableIds = draftV1.sourceManifest.units.filter((unit) => unit.kind === "table").map((unit) => unit.id);
  return `You are reorganizing an academic lecture into Structured Draft v2. Return exactly one JSON object. Allowed child types: paragraph, image_ref, table, note, diagram. Every source unit id and every asset id from Draft v1 must appear exactly once. Do not invent IDs. Do not paraphrase source text; organization labels may be concise, but the renderer will use the exact source text. A diagram element may reference only these source diagram ids: ${JSON.stringify(diagramIds)}. A table element may reference only these source table ids: ${JSON.stringify(tableIds)}. Ordinary paragraph text and images must never be replaced by a diagram. Image references must retain their assetId. Attempt ${attempt + 1}. Course code: ${data.options.courseCode || "not supplied"}. Lecture label: ${data.options.lectureLabel || "not supplied"}. Instructor: ${data.options.instructor || "not supplied"}. ${previousDraft ? `PREVIOUS INVALID DRAFT:\n${JSON.stringify(previousDraft)}\nVERIFICATION DIFF:\n${verificationSummary(diff)}\nCorrect every problem.` : ""}\nDRAFT V1 BASELINE:\n${JSON.stringify(draftV1)}`;
}

async function callDraftGemini(promptText, env, model) {
  return callGeminiParts([{ text: promptText }], env, model, "Return strict JSON. Preserve every source and asset ID exactly once.", 32000);
}

function exactUnits(element, unitMap) {
  return asArray(element?.sourceIds).map((id) => unitMap.get(id)).filter(Boolean);
}

function draftToPlan(draft, data, draftV1) {
  const sections = [];
  const unitMap = new Map(draftV1.sourceManifest.units.map((unit) => [unit.id, unit]));
  for (const title of asArray(draft?.titles)) {
    for (const subtitle of asArray(title?.children)) {
      const blocks = [];
      for (const element of asArray(subtitle?.children)) {
        const units = exactUnits(element, unitMap);
        const exactText = units.map((unit) => unit.verbatimText).filter(Boolean);
        const kinds = new Set(units.map((unit) => unit.kind));
        const sourceIds = asArray(element?.sourceIds);
        const assetId = cleanText(element?.assetId);
        if (element.type === "image_ref" || assetId) blocks.push({ type: "image", assetId, caption: cleanText(element?.caption), sourceIds: [] });
        if (!exactText.length) continue;
        if (element.type === "diagram" && kinds.size === 1 && kinds.has("diagram")) {
          blocks.push({ type: "diagram", heading: cleanText(element?.heading || element?.text) || "Source diagram", items: exactText, sourceIds });
        } else if (element.type === "table" && kinds.size === 1 && kinds.has("table")) {
          const parsedRows = exactText.map((value) => value.split(/\s*\|\s*/));
          const width = Math.max(...parsedRows.map((row) => row.length), 1);
          const normalizedRows = parsedRows.map((row) => Array.from({ length: width }, (_, index) => row[index] || ""));
          blocks.push({ type: "table", heading: cleanText(element?.heading || element?.text) || "Source table", headers: normalizedRows[0] || ["Source content"], rows: normalizedRows.slice(1), variant: cleanText(element?.variant) || "standard", sourceIds });
        } else if (element.type === "note") {
          blocks.push({ type: "callout", heading: cleanText(element?.heading) || "Note", text: exactText.join("\n\n"), sourceIds });
        } else {
          blocks.push({ type: "paragraph", heading: cleanText(element?.heading), text: exactText.join("\n\n"), sourceIds });
        }
      }
      if (blocks.length) sections.push({ title: cleanText(subtitle?.text || title?.text) || "Concept", category: cleanText(title?.text) || "Concept", keyTermsCritical: asArray(subtitle?.keyTermsCritical).map(cleanText).filter(Boolean), keyTermsImportant: asArray(subtitle?.keyTermsImportant).map(cleanText).filter(Boolean), blocks });
    }
  }
  return { metadata: { title: cleanText(draft?.metadata?.title) || data.source.title || "Untitled lecture", courseCode: data.options.courseCode || "Course", lectureLabel: data.options.lectureLabel || "Lecture", instructor: data.options.instructor || "", language: cleanText(draft?.metadata?.language) || data.options.language, direction: cleanText(draft?.metadata?.direction) || "ltr" }, overview: "", learningObjectives: [], sections, finalTakeaways: [] };
}

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!sameOrigin(request)) return respond({ error: "Cross-origin requests are not allowed." }, 403);
    if (!(env.GEMINI_API_KEY || env.GOOGLE_API_KEY)) return respond({ code: "AI_NOT_CONFIGURED", error: "Gemini is not configured. Add GEMINI_API_KEY or GOOGLE_API_KEY." }, 503);
    if (!(request.headers.get("content-type") || "").includes("application/json")) return respond({ error: "Expected application/json." }, 415);
    if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return respond({ error: "The extracted lecture request is too large for this deployment." }, 413);
    let raw;
    try { raw = await readLimited(request); } catch (error) { if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") return respond({ error: "The extracted lecture request is too large for this deployment." }, 413); throw error; }
    let body;
    try { body = JSON.parse(raw); } catch { return respond({ error: "Invalid JSON request." }, 400); }
    if (!(await verifyTurnstile(body.turnstileToken, env, request))) return respond({ error: "Verification failed or expired. Please try again." }, 403);
    const data = normalize(body);
    const model = resolveModel(env);
    let ocrResults = [];
    if (data.source.ocrPages.length) {
      const requiredPages = data.source.verificationIssues.filter((issue) => issue?.type === "ocr-required").map((issue) => Number(issue.page));
      const suppliedPages = new Set(data.source.ocrPages.map((page) => page.page));
      const missingImages = requiredPages.filter((page) => !suppliedPages.has(page));
      if (missingImages.length) return respond({ code: "OCR_IMAGE_MISSING", error: `OCR page image${missingImages.length === 1 ? " is" : "s are"} missing for page${missingImages.length === 1 ? "" : "s"} ${missingImages.join(", ")}.` }, 422);
      ocrResults = await callOcr(data, env, model);
      applyOcrToData(data, ocrResults);
    }
    if (data.source.extractionStatus && data.source.extractionStatus !== "verified-native") return respond({ code: "SOURCE_NOT_VERIFIED", error: "The source still contains unsupported visuals or unresolved extraction problems.", verificationIssues: data.source.verificationIssues }, 422);
    const draftV1 = buildDraftV1(data);
    let draftV2 = null;
    let diff = null;
    let attempts = 0;
    while (attempts <= MAX_VERIFY_RETRIES) {
      draftV2 = await callDraftGemini(prompt(draftV1, data, draftV2, diff, attempts), env, model);
      diff = verifyDraftCoverage(draftV1, draftV2);
      if (diff.valid) break;
      attempts += 1;
    }
    let recovered = false;
    if (!diff.valid) { draftV2 = appendRecoverySection(draftV1, draftV2, diff); diff = verifyDraftCoverage(draftV1, draftV2); recovered = true; }
    if (!diff.valid) return respond({ error: "Structured Draft verification failed.", verification: diff }, 422);
    const plan = draftToPlan(draftV2, data, draftV1);
    return respond({ plan, draftV1, draftV2, verification: diff, recovered, model, attempts: attempts + 1, batchesProcessed: data.source.batches.length, ocr: { applied: ocrResults.length > 0, pages: ocrResults } });
  } catch (error) {
    console.error(JSON.stringify({ event: "redesign_large_error", message: error instanceof Error ? error.message : String(error) }));
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const status = /exceeds the supported request size|too large/i.test(message) ? 413 : 500;
    return respond({ error: message }, status);
  }
};

export const onRequestOptions = async ({ request }) => sameOrigin(request) ? new Response(null, { status: 204, headers: { allow: "POST, OPTIONS", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" } }) : new Response(null, { status: 403 });
