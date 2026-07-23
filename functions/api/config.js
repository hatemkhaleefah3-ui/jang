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

export const onRequestGet = async ({ env }) => {
  const source = keySource(env);
  return new Response(JSON.stringify({
    configured: Boolean(source),
    keySource: source,
    model: resolveModel(env.GEMINI_MODEL),
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || null,
    maxSourceChars: 1_200_000,
    maxFileBytes: 50 * 1024 * 1024,
    supportedFormats: ["pptx", "pdf", "html", "htm"],
    ...deploymentInfo(env),
  }), { headers });
};
