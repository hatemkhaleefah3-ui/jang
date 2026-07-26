import { parseClaudeOutputText } from "../_generated/claude-import-worker.js";
import { buildLecturePptxFile, PPTX_MIME } from "../_generated/pptx-output-worker.js";
import lectureSchema from "../_generated/lecture-schema.js";

const MAX_JSON_BYTES = 20_000_000;
const MAX_IMAGE_BYTES = 15_000_000;
const MAX_TOTAL_IMAGE_BYTES = 60_000_000;
const IMPORT_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const STATE_VERSION = 1;

class ApiError extends Error {
  constructor(status, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function safeEqual(left, right) {
  const a = new TextEncoder().encode(String(left || ""));
  const b = new TextEncoder().encode(String(right || ""));
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) mismatch |= (a[index] || 0) ^ (b[index] || 0);
  return mismatch === 0;
}

function suppliedApiKey(request) {
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer || request.headers.get("x-jang-api-key") || "";
}

function requireBindings(context) {
  if (!context.env?.JANG_API_KEY) {
    throw new ApiError(503, "JANG_API_KEY is not configured on the server.");
  }
  if (!safeEqual(suppliedApiKey(context.request), context.env.JANG_API_KEY)) {
    throw new ApiError(401, "A valid Jang API key is required.");
  }
  if (!context.env?.JANG_AUTOMATION_BUCKET) {
    throw new ApiError(503, "JANG_AUTOMATION_BUCKET is not bound to this Pages project.");
  }
  return context.env.JANG_AUTOMATION_BUCKET;
}

async function readTextBody(request, maximumBytes) {
  const length = Number(request.headers.get("content-length") || 0);
  if (Number.isFinite(length) && length > maximumBytes) {
    throw new ApiError(413, `The request body must be ${Math.round(maximumBytes / 1_000_000)} MB or smaller.`);
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maximumBytes) {
    throw new ApiError(413, `The request body must be ${Math.round(maximumBytes / 1_000_000)} MB or smaller.`);
  }
  return text;
}

async function readObjectBody(request, maximumBytes = 1_000_000) {
  const text = await readTextBody(request, maximumBytes);
  let value;
  try {
    value = JSON.parse(text || "{}");
  } catch {
    throw new ApiError(400, "The request body is not valid JSON.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "The request body must be a JSON object.");
  }
  return value;
}

function importPrefix(importId) {
  return `imports/${importId}`;
}

function stateKey(importId) {
  return `${importPrefix(importId)}/state.json`;
}

function imageKey(importId, slotId) {
  return `${importPrefix(importId)}/images/${encodeURIComponent(slotId)}`;
}

function presentationKey(importId) {
  return `${importPrefix(importId)}/presentation.pptx`;
}

async function deleteImport(bucket, state) {
  const keys = [stateKey(state.importId), presentationKey(state.importId)];
  for (const image of Object.values(state.images || {})) if (image?.key) keys.push(image.key);
  await bucket.delete(keys);
}

async function loadState(bucket, importId) {
  if (!/^[0-9a-f-]{36}$/i.test(String(importId || ""))) {
    throw new ApiError(400, "A valid importId is required.");
  }
  const object = await bucket.get(stateKey(importId));
  if (!object) throw new ApiError(404, "The importId does not exist or has expired.");
  let state;
  try {
    state = JSON.parse(await object.text());
  } catch {
    throw new ApiError(500, "The stored import state is unreadable.");
  }
  if (Date.parse(state.expiresAt || "") <= Date.now()) {
    await deleteImport(bucket, state);
    throw new ApiError(410, "The import has expired. Create a new import.");
  }
  return state;
}

async function saveState(bucket, state) {
  state.updatedAt = new Date().toISOString();
  await bucket.put(stateKey(state.importId), JSON.stringify(state), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
    customMetadata: { status: state.status, version: String(STATE_VERSION) },
  });
}

function cleanLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function apiImageSlots(imageSlots) {
  const slots = Array.isArray(imageSlots) ? imageSlots : [];
  const counts = new Map();
  for (const slot of slots) {
    const key = cleanLabel(slot.label).toLocaleLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const used = new Set();
  return slots.map((slot, index) => {
    const original = cleanLabel(slot.label) || `Image ${index + 1}`;
    const duplicate = (counts.get(original.toLocaleLowerCase()) || 0) > 1;
    const context = [slot.sectionTitle, slot.slideTitle].map(cleanLabel).filter(Boolean).join(" / ");
    let apiLabel = duplicate && context ? `${original} — ${context}` : original;
    let suffix = 2;
    while (used.has(apiLabel.toLocaleLowerCase())) apiLabel = `${original} (${suffix++})`;
    used.add(apiLabel.toLocaleLowerCase());
    return { ...slot, apiLabel };
  });
}

function requireBuiltState(state) {
  if (!state.lecture || !Array.isArray(state.imageSlots)) {
    throw new ApiError(409, "Call POST /api/build before importing images or continuing.");
  }
}

function missingSlots(state) {
  return state.imageSlots.filter((slot) => !state.images?.[slot.slotId]);
}

function labelsResponse(state) {
  const missing = missingSlots(state);
  return {
    labels: missing.map((slot) => slot.apiLabel),
    images: missing.map((slot) => ({
      label: slot.apiLabel,
      topic: slot.label,
      description: slot.description,
      sectionTitle: slot.sectionTitle,
      slideTitle: slot.slideTitle,
      preferredAspect: slot.preferredAspect,
      orientation: slot.orientation,
      visualType: slot.visualType,
    })),
    status: missing.length ? "awaiting_images" : "ready",
  };
}

function findSlotByLabel(state, label) {
  const requested = cleanLabel(label);
  if (!requested) throw new ApiError(400, "label is required.");
  const exactApi = state.imageSlots.find((slot) => slot.apiLabel === requested);
  if (exactApi) return exactApi;
  const folded = requested.toLocaleLowerCase();
  const apiMatches = state.imageSlots.filter((slot) => slot.apiLabel.toLocaleLowerCase() === folded);
  if (apiMatches.length === 1) return apiMatches[0];
  const originalMatches = state.imageSlots.filter((slot) => cleanLabel(slot.label).toLocaleLowerCase() === folded);
  if (originalMatches.length === 1) return originalMatches[0];
  if (originalMatches.length > 1) {
    throw new ApiError(409, "The label is ambiguous. Use the exact disambiguated label returned by POST /api/build.");
  }
  throw new ApiError(404, `No image label named “${requested}” exists for this import.`);
}

function privateIpv4(hostname) {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const parts = match.slice(1).map(Number);
  if (parts.some((part) => part < 0 || part > 255)) return true;
  const [a, b] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function assertPublicImageUrl(value) {
  let url;
  try {
    url = new URL(String(value || ""));
  } catch {
    throw new ApiError(400, "imageUrl must be a valid absolute URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new ApiError(400, "imageUrl must use http or https.");
  if (url.username || url.password) throw new ApiError(400, "imageUrl must not contain credentials.");
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLocaleLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal") || hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd") || hostname.startsWith("fe80:") || privateIpv4(hostname)) {
    throw new ApiError(400, "imageUrl must point to a public internet host.");
  }
  return url;
}

async function fetchImage(imageUrl) {
  let url = assertPublicImageUrl(imageUrl);
  let response;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { accept: "image/*" },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new ApiError(400, "imageUrl redirected too many times.");
      url = assertPublicImageUrl(new URL(location, url).href);
      continue;
    }
    break;
  }
  if (!response?.ok) throw new ApiError(400, `The image could not be downloaded (HTTP ${response?.status || 500}).`);
  const mimeType = String(response.headers.get("content-type") || "").split(";")[0].trim().toLocaleLowerCase();
  if (!mimeType.startsWith("image/")) throw new ApiError(400, "imageUrl did not return an image content type.");
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > MAX_IMAGE_BYTES) throw new ApiError(413, "Images must be 15 MB or smaller.");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > MAX_IMAGE_BYTES) throw new ApiError(413, "Images must be 15 MB or smaller.");
  const pathname = decodeURIComponent(url.pathname.split("/").pop() || "image");
  const fileName = pathname.replace(/[^\p{L}\p{N}._-]+/gu, "-").slice(0, 160) || "image";
  return { bytes, mimeType, fileName, finalUrl: url.href };
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary);
}

async function importedImagesRecord(bucket, state) {
  const imported = {};
  for (const [slotId, metadata] of Object.entries(state.images || {})) {
    const object = await bucket.get(metadata.key);
    if (!object) throw new ApiError(409, `The stored image for slot “${slotId}” is missing.`);
    const bytes = await object.arrayBuffer();
    imported[slotId] = {
      dataUrl: `data:${metadata.mimeType};base64,${arrayBufferToBase64(bytes)}`,
      fileName: metadata.fileName,
      mimeType: metadata.mimeType,
    };
  }
  return imported;
}

function errorResponse(error) {
  if (error instanceof ApiError) {
    return json({ error: error.message, ...(error.details === undefined ? {} : { details: error.details }) }, error.status, error.status === 401 ? { "www-authenticate": "Bearer" } : {});
  }
  console.error(JSON.stringify({ event: "jang_automation_api_failed", message: error?.message || String(error) }));
  return json({ error: error?.message || "The automation request failed." }, 500);
}

async function run(context, handler) {
  try {
    const bucket = requireBindings(context);
    return await handler(bucket);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleImport(context) {
  return run(context, async (bucket) => {
    const text = await readTextBody(context.request, MAX_JSON_BYTES);
    let rawConfig;
    try {
      rawConfig = JSON.parse(text.replace(/^\uFEFF/, ""));
    } catch {
      throw new ApiError(400, "The imported configuration is not valid JSON.");
    }
    if (!rawConfig || typeof rawConfig !== "object" || Array.isArray(rawConfig)) {
      throw new ApiError(400, "The imported configuration must be a JSON object.");
    }
    const now = new Date();
    const importId = crypto.randomUUID();
    const state = {
      version: STATE_VERSION,
      importId,
      status: "imported",
      rawConfig,
      images: {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + IMPORT_LIFETIME_MS).toISOString(),
    };
    await saveState(bucket, state);
    return json({ importId });
  });
}

export async function handleBuild(context) {
  return run(context, async (bucket) => {
    const body = await readObjectBody(context.request);
    const state = await loadState(bucket, body.importId);
    if (!state.lecture) {
      let parsed;
      try {
        parsed = parseClaudeOutputText(JSON.stringify(state.rawConfig), lectureSchema);
      } catch (error) {
        throw new ApiError(400, error?.message || "The imported configuration could not be built.");
      }
      state.lecture = parsed.lecture;
      state.imageSlots = apiImageSlots(parsed.imageSlots);
      state.importWarnings = parsed.importWarnings || [];
      delete state.rawConfig;
    }
    state.status = "built";
    await saveState(bucket, state);
    return json(labelsResponse(state));
  });
}

export async function handleImageImport(context) {
  return run(context, async (bucket) => {
    const body = await readObjectBody(context.request, 2_000_000);
    const state = await loadState(bucket, body.importId);
    requireBuiltState(state);
    const slot = findSlotByLabel(state, body.label);
    const downloaded = await fetchImage(body.imageUrl);
    const currentTotal = Object.values(state.images || {}).reduce((sum, image) => sum + Number(image?.bytes || 0), 0) - Number(state.images?.[slot.slotId]?.bytes || 0);
    if (currentTotal + downloaded.bytes.byteLength > MAX_TOTAL_IMAGE_BYTES) {
      throw new ApiError(413, "The combined imported images for one presentation must be 60 MB or smaller.");
    }
    const key = imageKey(state.importId, slot.slotId);
    await bucket.put(key, downloaded.bytes, {
      httpMetadata: { contentType: downloaded.mimeType },
      customMetadata: { slotId: slot.slotId, label: slot.apiLabel.slice(0, 512) },
    });
    state.images ||= {};
    state.images[slot.slotId] = {
      key,
      fileName: downloaded.fileName,
      mimeType: downloaded.mimeType,
      bytes: downloaded.bytes.byteLength,
      sourceUrl: downloaded.finalUrl,
      importedAt: new Date().toISOString(),
    };
    state.status = "built";
    await saveState(bucket, state);
    return json({ success: true, label: slot.apiLabel, remainingLabels: missingSlots(state).map((item) => item.apiLabel) });
  });
}

export async function handleContinue(context) {
  return run(context, async (bucket) => {
    const body = await readObjectBody(context.request);
    const state = await loadState(bucket, body.importId);
    requireBuiltState(state);
    const importedImages = await importedImagesRecord(bucket, state);
    const result = await buildLecturePptxFile(state.lecture, importedImages);
    const bytes = await result.blob.arrayBuffer();
    const key = presentationKey(state.importId);
    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType: PPTX_MIME,
        contentDisposition: `attachment; filename="${result.filename.replace(/["\\]/g, "-")}"`,
      },
      customMetadata: { filename: result.filename, slideCount: String(result.slideCount) },
    });
    state.generated = {
      key,
      filename: result.filename,
      slideCount: result.slideCount,
      warnings: result.warnings || [],
      bytes: bytes.byteLength,
      generatedAt: new Date().toISOString(),
    };
    state.status = "complete";
    await saveState(bucket, state);
    return json({
      success: true,
      status: "complete",
      slideCount: result.slideCount,
      warnings: result.warnings || [],
      missingLabels: missingSlots(state).map((slot) => slot.apiLabel),
    });
  });
}

export async function handleExport(context) {
  return run(context, async (bucket) => {
    const body = await readObjectBody(context.request);
    const state = await loadState(bucket, body.importId);
    if (state.status !== "complete" || !state.generated?.key) {
      throw new ApiError(409, "Call POST /api/continue before exporting the PPTX file.");
    }
    const object = await bucket.get(state.generated.key);
    if (!object) throw new ApiError(404, "The generated PPTX file is no longer available.");
    const filename = state.generated.filename || "lecture.pptx";
    return new Response(object.body, {
      status: 200,
      headers: {
        "content-type": PPTX_MIME,
        "content-disposition": `attachment; filename="${filename.replace(/["\\]/g, "-")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "content-length": String(object.size),
        "cache-control": "no-store",
      },
    });
  });
}

export function methodNotAllowed(method = "POST") {
  return json({ error: `Use ${method} for this endpoint.` }, 405, { allow: method });
}
