import { createHtmlDesignPrompt, hydrateDesignedHtml, normalizeDesignedHtml, verifyDesignedHtml } from "../../html-design-contract.js";
import { applyMasterDesignCss } from "../../html-design-finalizer.js";
import { MASTER_DESIGN_REFERENCE } from "../../master-design-reference.js";
import { callOcr, resolveOcrModel } from "./redesign-large.js";

const MAX_BODY_BYTES = 8_000_000;
const MAX_DESIGN_RETRIES = 2;
const GEMINI_REQUEST_RETRIES = 2;
const MAX_OCR_PAGES = 40;
const DEFAULT_MODEL = "gemini-3.5-flash";
const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

const respond = (payload, status = 200) => new Response(JSON.stringify(payload), { status, headers });
const asArray = (value) => Array.isArray(value) ? value : [];
const clean = (value) => typeof value === "string" ? value.replace(/\u0000/g, "").trim() : "";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function bounded(value, max, label) {
  const result = clean(value);
  if (result.length > max) throw new Error(`${label} exceeds the supported size.`);
  return result;
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const requestUrl = new URL(request.url);
    return new URL(origin).host === requestUrl.host || requestUrl.hostname === "localhost";
  } catch {
    return false;
  }
}

async function verifyTurnstile(token, env, request) {
  if (!env.TURNSTILE_SECRET_KEY) return true;
  if (!token || typeof token !== "string" || token.length > 2048) return false;
  const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: request.headers.get("CF-Connecting-IP") || undefined,
      idempotency_key: crypto.randomUUID(),
    }),
  });
  return verification.ok && (await verification.json()).success === true;
}

async function readLimited(request) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let result = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) throw new Error("REQUEST_TOO_LARGE");
      result += decoder.decode(value, { stream: true });
    }
    return result + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

export function resolveDesignModel(env = {}) {
  const requested = clean(env.GEMINI_HTML_MODEL || env.GEMINI_MODEL).replace(/^models\//, "");
  return requested || DEFAULT_MODEL;
}

function stableId(value, fallback) {
  const id = clean(value || fallback).replace(/[^a-z0-9_.:-]+/gi, "_");
  if (!id || id.length > 100) throw new Error("A source or asset ID is invalid.");
  return id;
}

function sourceId(unit, index) {
  return stableId(unit?.id, `src_${Number(unit?.sourcePage || unit?.page || 0)}_${Number(unit?.sourceOrder || unit?.order || index + 1)}_${clean(unit?.kind || "paragraph").replace(/[^a-z0-9_-]+/gi, "_")}`.toLowerCase());
}

function normalizeOcrPage(page) {
  const pageNumber = Number(page?.page || 0);
  const assetId = bounded(page?.assetId, 100, "OCR asset id");
  const imageData = clean(page?.imageData);
  const match = imageData.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || !assetId || !match) return null;
  const data = match[2].replace(/\s+/g, "");
  if (data.length > 2_400_000) throw new Error(`OCR image for page ${pageNumber} is too large.`);
  return { page: pageNumber, assetId, mimeType: match[1].toLowerCase(), data };
}

function normalizeUnits(rawUnits) {
  return asArray(rawUnits).map((unit, index) => ({
    id: sourceId(unit, index),
    kind: bounded(unit?.kind || "paragraph", 40, `Source unit ${index + 1} kind`),
    sourcePage: Number(unit?.sourcePage || unit?.page || 0),
    sourceOrder: Number(unit?.sourceOrder || unit?.order || index + 1),
    verbatimText: bounded(unit?.verbatimText || unit?.text, 200_000, `Source unit ${index + 1}`),
    extractionMethod: bounded(unit?.extractionMethod || "native", 30, `Source unit ${index + 1} extraction method`),
    confidence: Number.isFinite(unit?.confidence) ? Math.max(0, Math.min(1, unit.confidence)) : 1,
  })).filter((unit) => unit.verbatimText);
}

function normalizeAssets(rawAssets) {
  return asArray(rawAssets).map((asset, index) => ({
    id: stableId(asset?.id, `asset_${index + 1}`),
    kind: bounded(asset?.kind || asset?.type || "image", 40, `Asset ${index + 1} kind`),
    sourcePage: Number(asset?.sourcePage || 0),
    sourceOrder: Number(asset?.sourceOrder || index + 1),
    alt: bounded(asset?.alt, 1000, `Asset ${index + 1} alt`),
    caption: bounded(asset?.caption, 2000, `Asset ${index + 1} caption`),
  }));
}

function assertUniqueManifest(manifest) {
  const sourceIds = new Set(manifest.units.map((unit) => unit.id));
  const assetIds = new Set(manifest.assets.map((asset) => asset.id));
  if (sourceIds.size !== manifest.units.length) throw new Error("Source IDs must be unique before HTML design.");
  if (assetIds.size !== manifest.assets.length) throw new Error("Asset IDs must be unique before HTML design.");
}

export function normalizeDesignRequest(body) {
  const suppliedManifest = body?.manifest && typeof body.manifest === "object" ? body.manifest : null;
  const source = body?.source && typeof body.source === "object" ? body.source : {};
  const options = body?.options && typeof body.options === "object" ? body.options : {};
  const metadataInput = body?.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const units = normalizeUnits(suppliedManifest ? suppliedManifest.units : source.sourceUnits);
  const assets = normalizeAssets(suppliedManifest ? suppliedManifest.assets : source.assets);
  const ocrPages = asArray(source.ocrPages).map(normalizeOcrPage).filter(Boolean);
  if (ocrPages.length > MAX_OCR_PAGES) throw new Error(`OCR supports up to ${MAX_OCR_PAGES} pages in one lecture.`);
  if (!units.length && !ocrPages.length) throw new Error("No verified lecture source units were provided.");
  const manifest = { units, assets };
  assertUniqueManifest(manifest);
  return {
    manifest,
    ocrPages,
    extractionStatus: bounded(source.extractionStatus, 40, "Extraction status"),
    verificationIssues: asArray(source.verificationIssues),
    metadata: {
      title: bounded(metadataInput.title || source.title, 500, "Lecture title"),
      courseCode: bounded(metadataInput.courseCode || options.courseCode, 80, "Course code"),
      lectureLabel: bounded(metadataInput.lectureLabel || options.lectureLabel, 100, "Lecture label"),
      instructor: bounded(metadataInput.instructor || options.instructor, 160, "Instructor"),
      language: bounded(metadataInput.language || options.language, 40, "Language") || "auto",
      direction: metadataInput.direction === "rtl" || options.language === "Arabic" ? "rtl" : "ltr",
    },
  };
}

function modelText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  return Array.isArray(parts) ? parts.map((part) => typeof part?.text === "string" ? part.text : "").join("").trim() : "";
}

async function callGemini(prompt, env, model) {
  const apiKey = env.GEMINI_API_KEY || env.GOOGLE_API_KEY;
  let lastError;
  for (let attempt = 0; attempt <= GEMINI_REQUEST_RETRIES; attempt += 1) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "You are a senior academic information designer. Return one complete standalone HTML document only. Preserve every supplied source and asset ID exactly once." }],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 65536,
            responseMimeType: "text/plain",
            temperature: 0.15,
          },
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(payload?.error?.message || `Gemini returned HTTP ${response.status}.`);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }
      const html = normalizeDesignedHtml(modelText(payload));
      if (!html) throw new Error("Gemini returned an empty HTML document.");
      return html;
    } catch (error) {
      lastError = error;
      if (attempt >= GEMINI_REQUEST_RETRIES || error?.retryable === false) break;
      await sleep(500 * (2 ** attempt));
    }
  }
  throw lastError || new Error("Gemini HTML generation failed.");
}

function applyOcrResults(data, ocrResults) {
  if (!ocrResults.length) return data;
  const pages = new Set(ocrResults.map((result) => Number(result.page)));
  const retained = data.manifest.units.filter((unit) => !pages.has(Number(unit.sourcePage)));
  for (const result of ocrResults) {
    asArray(result.lines).map(clean).filter(Boolean).forEach((line, index) => retained.push({
      id: stableId(`src_${result.page}_${index + 1}_ocr`, `src_${result.page}_${index + 1}_ocr`),
      kind: "paragraph",
      sourcePage: Number(result.page),
      sourceOrder: index + 1,
      verbatimText: line,
      extractionMethod: "ocr",
      confidence: Number.isFinite(result.confidence) ? result.confidence : 0,
    }));
  }
  retained.sort((left, right) => Number(left.sourcePage) - Number(right.sourcePage) || Number(left.sourceOrder) - Number(right.sourceOrder));
  const unresolvedIssues = data.verificationIssues.filter((issue) => {
    const type = clean(issue?.type || issue?.reason);
    const page = Number(issue?.page || issue?.sourcePage || 0);
    return !(type === "ocr-required" && pages.has(page));
  });
  const next = {
    ...data,
    manifest: { ...data.manifest, units: retained },
    verificationIssues: unresolvedIssues,
    extractionStatus: unresolvedIssues.length ? "incomplete" : "verified-native",
  };
  assertUniqueManifest(next.manifest);
  return next;
}

async function prepareVerifiedSource(data, env) {
  let prepared = data;
  let ocrResults = [];
  let ocrModel = null;
  if (data.ocrPages.length) {
    ocrModel = resolveOcrModel(env);
    ocrResults = await callOcr({ source: { ocrPages: data.ocrPages }, options: { language: data.metadata.language } }, env, ocrModel);
    prepared = applyOcrResults(data, ocrResults);
  }
  if (prepared.extractionStatus && prepared.extractionStatus !== "verified-native") {
    const issueTypes = prepared.verificationIssues.map((issue) => clean(issue?.type || issue?.reason)).filter(Boolean);
    const error = new Error(`Source conversion is incomplete: ${issueTypes.join(", ") || prepared.extractionStatus}.`);
    error.code = "SOURCE_NOT_VERIFIED";
    throw error;
  }
  if (!prepared.manifest.units.length) throw new Error("No verified lecture source units were available after OCR.");
  return { data: prepared, ocr: { applied: ocrResults.length > 0, pages: ocrResults, model: ocrModel } };
}

export async function generateVerifiedHtml(data, env) {
  const model = resolveDesignModel(env);
  let designedHtml = "";
  let verification = null;
  for (let attempt = 0; attempt <= MAX_DESIGN_RETRIES; attempt += 1) {
    const prompt = createHtmlDesignPrompt({
      manifest: data.manifest,
      metadata: data.metadata,
      referenceHtml: MASTER_DESIGN_REFERENCE,
      previousHtml: attempt ? designedHtml : "",
      verification: attempt ? verification : null,
    });
    designedHtml = applyMasterDesignCss(await callGemini(prompt, env, model));
    verification = verifyDesignedHtml(designedHtml, data.manifest);
    if (verification.valid) {
      return {
        html: hydrateDesignedHtml(designedHtml, data.manifest),
        verification,
        model,
        attempts: attempt + 1,
      };
    }
  }
  const error = new Error("Gemini could not produce HTML that passed source, asset, component, and safety verification.");
  error.verification = verification;
  throw error;
}

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!sameOrigin(request)) return respond({ code: "CROSS_ORIGIN_DENIED", error: "Cross-origin requests are not allowed." }, 403);
    if (!(env.GEMINI_API_KEY || env.GOOGLE_API_KEY)) return respond({ code: "AI_NOT_CONFIGURED", error: "Gemini is not configured. Add GEMINI_API_KEY or GOOGLE_API_KEY." }, 503);
    if (!(request.headers.get("content-type") || "").includes("application/json")) return respond({ error: "Expected application/json." }, 415);
    if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return respond({ error: "The lecture design request is too large for this deployment." }, 413);
    let raw;
    try {
      raw = await readLimited(request);
    } catch (error) {
      if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") return respond({ error: "The lecture design request is too large for this deployment." }, 413);
      throw error;
    }
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return respond({ error: "Invalid JSON request." }, 400);
    }
    if (!(await verifyTurnstile(body.turnstileToken, env, request))) return respond({ error: "Verification failed or expired. Please try again." }, 403);
    const normalized = normalizeDesignRequest(body);
    let prepared;
    try {
      prepared = await prepareVerifiedSource(normalized, env);
    } catch (error) {
      if (normalized.ocrPages.length) {
        const message = error instanceof Error ? error.message : String(error);
        return respond({ code: error?.code || "GEMINI_OCR_FAILED", error: `Gemini OCR failed before HTML design: ${message}` }, 422);
      }
      throw error;
    }
    const result = await generateVerifiedHtml(prepared.data, env);
    return respond({
      ...result,
      manifest: prepared.data.manifest,
      metadata: prepared.data.metadata,
      ocr: prepared.ocr,
      designReference: "master-reference-2026-07",
    });
  } catch (error) {
    console.error(JSON.stringify({ event: "design_html_error", message: error instanceof Error ? error.message : String(error) }));
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    const status = /exceeds the supported size|too large/i.test(message) ? 413 : /No verified|must be unique|invalid|incomplete/i.test(message) ? 422 : 500;
    return respond({ code: error?.code || "HTML_DESIGN_FAILED", error: message, verification: error?.verification || null }, status);
  }
};

export const onRequestOptions = async ({ request }) => sameOrigin(request)
  ? new Response(null, { status: 204, headers: { allow: "POST, OPTIONS", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type", "cache-control": "no-store" } })
  : new Response(null, { status: 403 });
