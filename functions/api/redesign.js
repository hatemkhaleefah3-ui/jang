import { onRequestPost as redesignPost, onRequestOptions as redesignOptions } from "./redesign-large.js";

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

function normalizeEnvironment(env) {
  if (env.GEMINI_API_KEY || !env.GOOGLE_API_KEY) return env;
  const normalized = Object.create(env);
  normalized.GEMINI_API_KEY = env.GOOGLE_API_KEY;
  return normalized;
}

function environmentName(env) {
  const branch = String(env.CF_PAGES_BRANCH || "").trim();
  return branch && branch !== "main" ? "preview" : "production";
}

function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

function productionOrigin(request, env) {
  const explicit = String(env.AI_FALLBACK_ORIGIN || "").trim();
  if (explicit) {
    try { return new URL(explicit).origin; } catch { /* ignore invalid override */ }
  }
  if (environmentName(env) !== "preview") return "";
  try {
    const current = new URL(String(env.CF_PAGES_URL || "").trim() || request.url);
    const labels = current.hostname.split(".");
    if (labels.length >= 4 && labels.at(-2) === "pages" && labels.at(-1) === "dev") {
      return `https://${labels.at(-3)}.pages.dev`;
    }
  } catch { /* unable to infer production origin */ }
  return "";
}

async function productionCapabilities(origin) {
  try {
    const response = await fetch(`${origin}/api/config?source=ocr-proxy`, { headers: { accept: "application/json" } });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function requestNeedsOcr(body) {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(body));
    return Array.isArray(parsed?.source?.ocrPages) && parsed.source.ocrPages.length > 0;
  } catch {
    return false;
  }
}

async function proxyToProduction(request, env) {
  const origin = productionOrigin(request, env);
  if (!origin || origin === new URL(request.url).origin) return null;
  const body = await request.arrayBuffer();
  if (requestNeedsOcr(body)) {
    const capabilities = await productionCapabilities(origin);
    if (Number(capabilities?.ocrCapabilityVersion || 0) < 2) {
      return new Response(JSON.stringify({
        code: "GEMINI_OCR_PROXY_OUTDATED",
        environment: "preview",
        error: "The configured production Gemini proxy does not yet contain the page-level OCR engine. Local OCR was attempted, but this preview cannot safely send the page to an older endpoint.",
      }), { status: 503, headers });
    }
  }
  const upstream = await fetch(`${origin}/api/redesign-large`, {
    method: "POST",
    headers: {
      "content-type": request.headers.get("content-type") || "application/json",
      "accept": "application/json",
      "x-jang-preview-proxy": "1",
    },
    body,
  });
  const responseHeaders = new Headers(headers);
  responseHeaders.set("x-jang-ai-source", "production-proxy");
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const onRequestPost = async (context) => {
  if (!sameOrigin(context.request)) {
    return new Response(JSON.stringify({ code: "CROSS_ORIGIN_DENIED", error: "Cross-origin requests are not allowed." }), { status: 403, headers });
  }

  const env = normalizeEnvironment(context.env);
  if (env.GEMINI_API_KEY) return redesignPost({ ...context, env });

  try {
    const proxied = await proxyToProduction(context.request, env);
    if (proxied) return proxied;
  } catch (error) {
    console.error(JSON.stringify({ event: "preview_ai_proxy_error", message: error instanceof Error ? error.message : String(error) }));
  }

  const environment = environmentName(env);
  return new Response(JSON.stringify({
    code: "AI_NOT_CONFIGURED",
    environment,
    error: `This ${environment} deployment cannot access GEMINI_API_KEY or GOOGLE_API_KEY, and no configured production endpoint was available.`,
  }), { status: 503, headers });
};

export const onRequestOptions = redesignOptions;
