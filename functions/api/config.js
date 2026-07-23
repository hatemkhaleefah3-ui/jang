const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const RETIRED_MODELS = new Set(["gemini-2.5-flash", "models/gemini-2.5-flash"]);

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, max-age=0",
  "x-content-type-options": "nosniff",
};

function resolveModel(value) {
  const configured = String(value || "").trim();
  return !configured || RETIRED_MODELS.has(configured) ? DEFAULT_MODEL : configured.replace(/^models\//, "");
}

function keySource(env) {
  if (env.GEMINI_API_KEY) return "GEMINI_API_KEY";
  if (env.GOOGLE_API_KEY) return "GOOGLE_API_KEY";
  return null;
}

function deploymentInfo(env) {
  const branch = String(env.CF_PAGES_BRANCH || "").trim();
  return {
    branch,
    deploymentUrl: String(env.CF_PAGES_URL || "").trim(),
    environment: branch && branch !== "main" ? "preview" : "production",
  };
}

function productionOrigin(request, env) {
  const explicit = String(env.AI_FALLBACK_ORIGIN || "").trim();
  if (explicit) {
    try { return new URL(explicit).origin; } catch { /* ignore invalid override */ }
  }
  const info = deploymentInfo(env);
  if (info.environment !== "preview") return "";
  try {
    const current = new URL(info.deploymentUrl || request.url);
    const labels = current.hostname.split(".");
    if (labels.length >= 4 && labels.at(-2) === "pages" && labels.at(-1) === "dev") {
      return `https://${labels.at(-3)}.pages.dev`;
    }
  } catch { /* unable to infer production origin */ }
  return "";
}

async function productionConfig(request, env) {
  const origin = productionOrigin(request, env);
  if (!origin || origin === new URL(request.url).origin) return null;
  try {
    const response = await fetch(`${origin}/api/config?source=preview`, { headers: { accept: "application/json" } });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.configured ? { origin, payload } : null;
  } catch {
    return null;
  }
}

export const onRequestGet = async ({ request, env }) => {
  const source = keySource(env);
  const proxy = source ? null : await productionConfig(request, env);
  const info = deploymentInfo(env);
  return new Response(JSON.stringify({
    configured: Boolean(source || proxy),
    keySource: source || (proxy ? "production deployment proxy" : null),
    proxied: Boolean(proxy),
    proxyOrigin: proxy?.origin || null,
    model: source ? resolveModel(env.GEMINI_MODEL) : resolveModel(proxy?.payload?.model),
    turnstileSiteKey: source ? env.TURNSTILE_SITE_KEY || null : null,
    maxSourceChars: 1_200_000,
    maxFileBytes: 50 * 1024 * 1024,
    supportedFormats: ["pptx", "pdf", "html", "htm"],
    ...info,
  }), { headers });
};
