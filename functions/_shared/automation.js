import { parseClaudeOutputText } from "../_generated/claude-import-worker.js";
import { buildLecturePptxFile, PPTX_MIME } from "../_generated/pptx-output-worker.js";
import lectureSchema from "../_generated/lecture-schema.js";

const MAX_JSON_BYTES = 20_000_000;
const MAX_IMAGE_BYTES = 15_000_000;
const MAX_TOTAL_IMAGE_BYTES = 60_000_000;
const MAX_KV_VALUE_BYTES = 25 * 1024 * 1024;
const KV_PPTX_WARNING_BYTES = 22 * 1024 * 1024;
const IMPORT_LIFETIME_SECONDS = 7 * 24 * 60 * 60;
const KV_READ_RETRY_DELAYS_MS = [0, 250, 750, 1_500, 3_000];
const STATE_VERSION = 2;

class ApiError extends Error {
  constructor(status, message, details = undefined, headers = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.headers = headers;
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
  if (!context.env?.JANG_AUTOMATION_KV) {
    throw new ApiError(503, "JANG_AUTOMATION_KV is not bound to this Pages project.");
  }
  return context.env.JANG_AUTOMATION_KV;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function kvGetWithRetry(kv, key, type = "text") {
  for (let attempt = 0; attempt < KV_READ_RETRY_DELAYS_MS.length; attempt += 1) {
    const delay = KV_READ_RETRY_DELAYS_MS[attempt];
    if (delay) await sleep(delay);
    const value = await kv.get(key, { type, cacheTtl: 30 });
    if (value !== null) return value;
  }
  return null;
}

async function kvGetWithMetadataRetry(kv, key, type = "arrayBuffer") {
  for (let attempt = 0; attempt < KV_READ_RETRY_DELAYS_MS.length; attempt += 1) {
    const delay = KV_READ_RETRY_DELAYS_MS[attempt];
    if (delay) await sleep(delay);
    const result = await kv.getWithMetadata(key, { type, cacheTtl: 30 });
    if (result?.value !== null && result?.value !== undefined) return result;
  }
  return { value: null, metadata: null };
}

function expirationFor(record) {
  const timestamp = Date.parse(record?.expiresAt || "");
  if (Number.isFinite(timestamp) && timestamp > Date.now()) return Math.floor(timestamp / 1000);
  return Math.floor(Date.now() / 1000) + IMPORT_LIFETIME_SECONDS;
}

function byteLength(value) {
  if (typeof value === "string") return new TextEncoder().encode(value).byteLength;
  if (value instanceof ArrayBuffer) return value.byteLength;
  if (ArrayBuffer.isView(value)) return value.byteLength;
  throw new TypeError("Unsupported KV value type.");
}

async function kvPut(kv, key, value, record, metadata = {}) {
  const bytes = byteLength(value);
  if (bytes > MAX_KV_VALUE_BYTES) {
    throw new ApiError(413, `The value for ${key.split("/").pop()} is ${Math.ceil(bytes / 1024 / 1024)} MiB, above Workers KV's 25 MiB value limit.`);
  }
  await kv.put(key, value, {
    expiration: expirationFor(record),
    metadata: {
      version: STATE_VERSION,
      ...metadata,
    },
  });
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

function validateImportId(importId) {
  const value = String(importId || "");
  if (!/^[0-9a-f-]{36}$/i.test(value)) throw new ApiError(400, "A valid importId is required.");
  return value;
}

function importPrefix(importId) {
  return `imports/${validateImportId(importId)}`;
}

function importKey(importId) {
  return `${importPrefix(importId)}/import.json`;
}

function buildKey(importId) {
  return `${importPrefix(importId)}/build.json`;
}

function imageKey(importId, slotId) {
  return `${importPrefix(importId)}/images/${encodeURIComponent(slotId)}`;
}

function presentationKey(importId) {
  return `${importPrefix(importId)}/presentation.pptx`;
}

function presentationMetadataKey(importId) {
  return `${importPrefix(importId)}/presentation.json`;
}

async function loadJsonRecord(kv, key, missingMessage) {
  const text = await kvGetWithRetry(kv, key, "text");
  if (text === null) {
    throw new ApiError(404, missingMessage, undefined, { "retry-after": "2" });
  }
  let record;
  try {
    record = JSON.parse(text);
  } catch {
    throw new ApiError(500, "The stored automation data is unreadable.");
  }
  if (Date.parse(record.expiresAt || "") <= Date.now()) {
    throw new ApiError(410, "The import has expired. Create a new import.");
  }
  return record;
}

async function loadImport(kv, importId) {
  return loadJsonRecord(
    kv,
    importKey(importId),
    "The importId does not exist, has expired, or is not visible in this KV location yet. Retry the request shortly.",
  );
}

async function loadBuild(kv, importId) {
  return loadJsonRecord(
    kv,
    buildKey(importId),
    "Call POST /api/build first. If it just succeeded, retry shortly while Workers KV propagates the new value.",
  );
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

function findSlotByLabel(build, label) {
  const requested = cleanLabel(label);
  if (!requested) throw new ApiError(400, "label is required.");
  const exactApi = build.imageSlots.find((slot) => slot.apiLabel === requested);
  if (exactApi) return exactApi;
  const folded = requested.toLocaleLowerCase();
  const apiMatches = build.imageSlots.filter((slot) => slot.apiLabel.toLocaleLowerCase() === folded);
  if (apiMatches.length === 1) return apiMatches[0];
  const originalMatches = build.imageSlots.filter((slot) => cleanLabel(slot.label).toLocaleLowerCase() === folded);
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

async function listImageKeys(kv, build) {
  const prefix = `${importPrefix(build.importId)}/images/`;
  const keys = [];
  let cursor;
  do {
    const page = await kv.list({ prefix, ...(cursor ? { cursor } : {}) });
    keys.push(...(page.keys || []));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return keys;
}

async function imageIndex(kv, build, assumePresentSlotIds = new Set()) {
  const listed = await listImageKeys(kv, build);
  const bySlotId = new Map();
  for (const entry of listed) {
    const slotId = String(entry.metadata?.slotId || "");
    if (slotId) bySlotId.set(slotId, entry);
  }
  for (const slotId of assumePresentSlotIds) {
    if (!bySlotId.has(slotId)) bySlotId.set(slotId, { name: imageKey(build.importId, slotId), metadata: { slotId } });
  }
  return bySlotId;
}

async function labelsResponse(kv, build, assumePresentSlotIds = new Set()) {
  const indexed = await imageIndex(kv, build, assumePresentSlotIds);
  const missing = build.imageSlots.filter((slot) => !indexed.has(slot.slotId));
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

async function importedImagesRecord(kv, build) {
  const indexed = await imageIndex(kv, build);
  const imported = {};
  const missingLabels = [];
  let totalBytes = 0;
  for (const slot of build.imageSlots) {
    const entry = indexed.get(slot.slotId);
    if (!entry) {
      missingLabels.push(slot.apiLabel);
      continue;
    }
    const result = await kvGetWithMetadataRetry(kv, entry.name, "arrayBuffer");
    if (result.value === null) {
      missingLabels.push(slot.apiLabel);
      continue;
    }
    const metadata = result.metadata || entry.metadata || {};
    totalBytes += result.value.byteLength;
    imported[slot.slotId] = {
      dataUrl: `data:${metadata.mimeType || "application/octet-stream"};base64,${arrayBufferToBase64(result.value)}`,
      fileName: metadata.fileName || "image",
      mimeType: metadata.mimeType || "application/octet-stream",
    };
  }
  if (totalBytes > MAX_TOTAL_IMAGE_BYTES) {
    throw new ApiError(413, "The combined imported images for one presentation must be 60 MB or smaller.");
  }
  return { imported, missingLabels };
}

function errorResponse(error) {
  if (error instanceof ApiError) {
    return json(
      { error: error.message, ...(error.details === undefined ? {} : { details: error.details }) },
      error.status,
      {
        ...(error.status === 401 ? { "www-authenticate": "Bearer" } : {}),
        ...error.headers,
      },
    );
  }
  console.error(JSON.stringify({ event: "jang_automation_api_failed", message: error?.message || String(error) }));
  return json({ error: error?.message || "The automation request failed." }, 500);
}

async function run(context, handler) {
  try {
    const kv = requireBindings(context);
    return await handler(kv);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleImport(context) {
  return run(context, async (kv) => {
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
    const record = {
      version: STATE_VERSION,
      importId: crypto.randomUUID(),
      rawConfig,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + IMPORT_LIFETIME_SECONDS * 1000).toISOString(),
    };
    await kvPut(kv, importKey(record.importId), JSON.stringify(record), record, { kind: "import" });
    return json({ importId: record.importId });
  });
}

export async function handleBuild(context) {
  return run(context, async (kv) => {
    const body = await readObjectBody(context.request);
    const importRecord = await loadImport(kv, body.importId);
    let build = await kv.get(buildKey(importRecord.importId), { type: "json", cacheTtl: 30 });
    if (!build) {
      let parsed;
      try {
        parsed = parseClaudeOutputText(JSON.stringify(importRecord.rawConfig), lectureSchema);
      } catch (error) {
        throw new ApiError(400, error?.message || "The imported configuration could not be built.");
      }
      build = {
        version: STATE_VERSION,
        importId: importRecord.importId,
        lecture: parsed.lecture,
        imageSlots: apiImageSlots(parsed.imageSlots),
        importWarnings: parsed.importWarnings || [],
        createdAt: new Date().toISOString(),
        expiresAt: importRecord.expiresAt,
      };
      await kvPut(kv, buildKey(build.importId), JSON.stringify(build), build, { kind: "build" });
    }
    return json(await labelsResponse(kv, build));
  });
}

export async function handleImageImport(context) {
  return run(context, async (kv) => {
    const body = await readObjectBody(context.request, 2_000_000);
    const build = await loadBuild(kv, body.importId);
    const slot = findSlotByLabel(build, body.label);
    const downloaded = await fetchImage(body.imageUrl);
    await kvPut(kv, imageKey(build.importId, slot.slotId), downloaded.bytes, build, {
      kind: "image",
      slotId: slot.slotId,
      fileName: downloaded.fileName.slice(0, 160),
      mimeType: downloaded.mimeType.slice(0, 100),
      bytes: downloaded.bytes.byteLength,
    });
    const remaining = await labelsResponse(kv, build, new Set([slot.slotId]));
    return json({ success: true, label: slot.apiLabel, remainingLabels: remaining.labels });
  });
}

export async function handleContinue(context) {
  return run(context, async (kv) => {
    const body = await readObjectBody(context.request);
    const build = await loadBuild(kv, body.importId);
    const { imported, missingLabels } = await importedImagesRecord(kv, build);
    const result = await buildLecturePptxFile(build.lecture, imported);
    const bytes = await result.blob.arrayBuffer();
    if (bytes.byteLength > MAX_KV_VALUE_BYTES) {
      throw new ApiError(
        413,
        `The generated PPTX is ${Math.ceil(bytes.byteLength / 1024 / 1024)} MiB, above Workers KV's 25 MiB value limit. Use R2 or an external object store for final export of presentations this large.`,
      );
    }
    const generatedAt = new Date().toISOString();
    const warnings = [...(result.warnings || [])];
    if (bytes.byteLength >= KV_PPTX_WARNING_BYTES) {
      warnings.push(`The generated PPTX is ${Math.ceil(bytes.byteLength / 1024 / 1024)} MiB and is close to Workers KV's 25 MiB per-value limit.`);
    }
    const metadata = {
      version: STATE_VERSION,
      importId: build.importId,
      filename: result.filename,
      slideCount: result.slideCount,
      warnings,
      bytes: bytes.byteLength,
      generatedAt,
      expiresAt: build.expiresAt,
    };
    await kvPut(kv, presentationKey(build.importId), bytes, build, {
      kind: "presentation",
      filename: result.filename.slice(0, 300),
      slideCount: result.slideCount,
      bytes: bytes.byteLength,
    });
    await kvPut(kv, presentationMetadataKey(build.importId), JSON.stringify(metadata), build, { kind: "presentation-metadata" });
    return json({
      success: true,
      status: "complete",
      slideCount: result.slideCount,
      warnings,
      missingLabels,
    });
  });
}

export async function handleExport(context) {
  return run(context, async (kv) => {
    const body = await readObjectBody(context.request);
    const metadata = await loadJsonRecord(
      kv,
      presentationMetadataKey(body.importId),
      "Call POST /api/continue before exporting. If it just succeeded, retry shortly while Workers KV propagates the generated file.",
    );
    const bytes = await kvGetWithRetry(kv, presentationKey(body.importId), "arrayBuffer");
    if (bytes === null) {
      throw new ApiError(404, "The generated PPTX is not visible in this KV location yet. Retry the request shortly.", undefined, { "retry-after": "2" });
    }
    const filename = metadata.filename || "lecture.pptx";
    return new Response(bytes, {
      status: 200,
      headers: {
        "content-type": PPTX_MIME,
        "content-disposition": `attachment; filename="${filename.replace(/["\\]/g, "-")}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "content-length": String(bytes.byteLength),
        "cache-control": "no-store",
      },
    });
  });
}

export function methodNotAllowed(method = "POST") {
  return json({ error: `Use ${method} for this endpoint.` }, 405, { allow: method });
}
