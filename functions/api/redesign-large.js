import { appendRecoverySection, createAssetRecord, createDraftV1, createSourceUnit, verifyDraftCoverage } from "../../structured-draft.js";

const MAX_BODY_BYTES = 1_900_000;
const MAX_VERIFY_RETRIES = 2;
const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" };
const respond = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers });
const cleanText = (value, max = 500_000) => typeof value === "string" ? value.replace(/\u0000/g, "").trim().slice(0, max) : "";
const asArray = (value) => Array.isArray(value) ? value : [];

function resolveModel(env) { const requested = cleanText(env.GEMINI_MODEL, 80).replace(/^models\//, ""); return !requested || requested === "gemini-2.5-flash" ? DEFAULT_MODEL : requested; }
function sameOrigin(request) { const origin = request.headers.get("origin"); if (!origin) return true; try { return new URL(origin).host === new URL(request.url).host || new URL(request.url).hostname === "localhost"; } catch { return false; } }
async function verifyTurnstile(token, env, request) { if (!env.TURNSTILE_SECRET_KEY) return true; if (!token || typeof token !== "string" || token.length > 2048) return false; const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: request.headers.get("CF-Connecting-IP") || undefined, idempotency_key: crypto.randomUUID() }) }); return verification.ok && (await verification.json()).success === true; }
async function readLimited(request) { if (!request.body) return ""; const reader = request.body.getReader(); const decoder = new TextDecoder(); let total = 0; let result = ""; try { while (true) { const { done, value } = await reader.read(); if (done) break; total += value.byteLength; if (total > MAX_BODY_BYTES) throw new Error("REQUEST_TOO_LARGE"); result += decoder.decode(value, { stream: true }); } return result + decoder.decode(); } finally { reader.releaseLock(); } }

function normalize(body) {
  const source = body?.source || {}; const options = body?.options || {};
  const batches = asArray(source.batches).map((batch) => cleanText(batch, 500_000)).filter(Boolean);
  if (!batches.length && !asArray(source.sourceUnits).length) throw new Error("No readable lecture content was provided.");
  const sourceUnits = asArray(source.sourceUnits).map((unit) => ({ page: Number(unit?.page || unit?.sourcePage || 0), order: Number(unit?.order || unit?.sourceOrder || 0), kind: cleanText(unit?.kind, 40) || "paragraph", text: cleanText(unit?.text || unit?.verbatimText, 200_000), runs: asArray(unit?.runs), extractionMethod: cleanText(unit?.extractionMethod, 30) || "native", confidence: Number.isFinite(unit?.confidence) ? unit.confidence : 1 })).filter((unit) => unit.text);
  const assets = asArray(source.assets).map((asset, index) => ({ id: cleanText(asset?.id, 80), type: cleanText(asset?.type, 30) || "image", alt: cleanText(asset?.alt, 1000), caption: cleanText(asset?.caption, 2000), sourceKind: cleanText(asset?.sourceKind, 80), sourcePage: Number(asset?.sourcePage || 0), sourceOrder: index + 1 })).filter((asset) => asset.id);
  return { source: { title: cleanText(source.title, 500), batches, sourceUnits, assets, extractionStatus: cleanText(source.extractionStatus, 40), verificationIssues: asArray(source.verificationIssues) }, options: { courseCode: cleanText(options.courseCode, 80), lectureLabel: cleanText(options.lectureLabel, 100), instructor: cleanText(options.instructor, 160), language: cleanText(options.language, 40) || "auto", concise: Boolean(options.concise) } };
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
function prompt(draftV1, data, previousDraft, diff, attempt) { return `You are reorganizing an academic lecture into Structured Draft v2. Return exactly one JSON object. Allowed child types: paragraph, image_ref, table, note, diagram. Every paragraph/table/note/diagram must include sourceIds. Every image_ref must include assetId. Each source unit id and each asset id from Draft v1 must appear exactly once. Do not invent IDs. Preserve all facts, numbers, formulas, qualifiers, uncertainty, terminology, and meaning. You may reorder and combine units. Tables and diagrams may combine multiple sourceIds. Attempt ${attempt + 1}. Course code: ${data.options.courseCode || "not supplied"}. Lecture label: ${data.options.lectureLabel || "not supplied"}. Instructor: ${data.options.instructor || "not supplied"}. ${previousDraft ? `PREVIOUS INVALID DRAFT:\n${JSON.stringify(previousDraft)}\nVERIFICATION DIFF:\n${verificationSummary(diff)}\nCorrect every problem.` : ""}\nDRAFT V1 BASELINE:\n${JSON.stringify(draftV1)}`; }
async function callGemini(promptText, env, model) { const apiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY; const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ system_instruction: { parts: [{ text: "Return strict JSON. Preserve every source and asset ID exactly once." }] }, contents: [{ role: "user", parts: [{ text: promptText }] }], generationConfig: { maxOutputTokens: 32000, responseMimeType: "application/json", temperature: 0.1 } }) }); const payload = await result.json().catch(() => ({})); if (!result.ok) throw new Error(payload?.error?.message || `Gemini returned HTTP ${result.status}.`); const raw = modelText(payload); if (!raw) throw new Error("Gemini returned an empty response."); return parseJsonOutput(raw); }

function elementText(element) { if (typeof element?.text === "string") return element.text; if (element?.type === "table") return ""; return ""; }
function draftToPlan(draft, data) {
  const sections = [];
  for (const title of asArray(draft?.titles)) {
    for (const subtitle of asArray(title?.children)) {
      const blocks = [];
      for (const element of asArray(subtitle?.children)) {
        if (element.type === "image_ref") blocks.push({ type: "image", assetId: element.assetId || "", caption: element.caption || "", sourceIds: asArray(element.sourceIds) });
        else if (element.type === "table") blocks.push({ type: "table", heading: element.heading || element.text || "", headers: asArray(element.headers), rows: asArray(element.rows), variant: element.variant || "standard", sourceIds: asArray(element.sourceIds) });
        else if (element.type === "diagram") blocks.push({ type: "diagram", heading: element.heading || element.text || "", items: asArray(element.items).length ? element.items : asArray(element.nodes).map((node) => typeof node === "string" ? node : node?.label).filter(Boolean), sourceIds: asArray(element.sourceIds) });
        else if (element.type === "note") blocks.push({ type: "callout", heading: element.heading || "Note", text: elementText(element), sourceIds: asArray(element.sourceIds) });
        else blocks.push({ type: "paragraph", heading: element.heading || "", text: elementText(element), sourceIds: asArray(element.sourceIds) });
      }
      if (blocks.length) sections.push({ title: subtitle.text || title.text || "Concept", category: title.text || "Concept", keyTermsCritical: asArray(subtitle.keyTermsCritical), keyTermsImportant: asArray(subtitle.keyTermsImportant), blocks });
    }
  }
  return { metadata: { title: draft?.metadata?.title || data.source.title || "Untitled lecture", courseCode: data.options.courseCode || "Course", lectureLabel: data.options.lectureLabel || "Lecture", instructor: data.options.instructor || "", language: draft?.metadata?.language || data.options.language, direction: draft?.metadata?.direction || "ltr" }, overview: "", learningObjectives: [], sections, finalTakeaways: [] };
}

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!sameOrigin(request)) return respond({ error: "Cross-origin requests are not allowed." }, 403);
    if (!(env.GEMINI_API_KEY || env.GOOGLE_API_KEY)) return respond({ code: "AI_NOT_CONFIGURED", error: "Gemini is not configured. Add GEMINI_API_KEY or GOOGLE_API_KEY." }, 503);
    if (!(request.headers.get("content-type") || "").includes("application/json")) return respond({ error: "Expected application/json." }, 415);
    if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return respond({ error: "The extracted lecture request is too large for this deployment." }, 413);
    let raw; try { raw = await readLimited(request); } catch (error) { if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") return respond({ error: "The extracted lecture request is too large for this deployment." }, 413); throw error; }
    let body; try { body = JSON.parse(raw); } catch { return respond({ error: "Invalid JSON request." }, 400); }
    if (!(await verifyTurnstile(body.turnstileToken, env, request))) return respond({ error: "Verification failed or expired. Please try again." }, 403);
    const data = normalize(body);
    if (data.source.extractionStatus && data.source.extractionStatus !== "verified-native") return respond({ code: "SOURCE_NOT_VERIFIED", error: "The source requires OCR or visual-format conversion before verified redesign.", verificationIssues: data.source.verificationIssues }, 422);
    const model = resolveModel(env); const draftV1 = buildDraftV1(data); let draftV2 = null; let diff = null; let attempts = 0;
    while (attempts <= MAX_VERIFY_RETRIES) { draftV2 = await callGemini(prompt(draftV1, data, draftV2, diff, attempts), env, model); diff = verifyDraftCoverage(draftV1, draftV2); if (diff.valid) break; attempts += 1; }
    let recovered = false;
    if (!diff.valid) { draftV2 = appendRecoverySection(draftV1, draftV2, diff); diff = verifyDraftCoverage(draftV1, draftV2); recovered = true; }
    if (!diff.valid) return respond({ error: "Structured Draft verification failed.", verification: diff }, 422);
    const plan = draftToPlan(draftV2, data);
    return respond({ plan, draftV1, draftV2, verification: diff, recovered, model, attempts: attempts + 1, batchesProcessed: data.source.batches.length });
  } catch (error) { console.error(JSON.stringify({ event: "redesign_large_error", message: error instanceof Error ? error.message : String(error) })); return respond({ error: error instanceof Error ? error.message : "Unexpected server error." }, 500); }
};

export const onRequestOptions = async ({ request }) => sameOrigin(request) ? new Response(null, { status: 204, headers: { allow: "POST, OPTIONS", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" } }) : new Response(null, { status: 403 });
