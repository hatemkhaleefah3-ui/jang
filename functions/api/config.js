const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const RETIRED_MODELS = new Set(["gemini-2.5-flash", "models/gemini-2.5-flash"]);

const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

function resolveModel(value) {
  const configured = String(value || "").trim();
  return !configured || RETIRED_MODELS.has(configured) ? DEFAULT_MODEL : configured.replace(/^models\//, "");
}

export const onRequestGet = async ({ env }) => {
  return new Response(JSON.stringify({
    configured: Boolean(env.GEMINI_API_KEY),
    model: resolveModel(env.GEMINI_MODEL),
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || null,
    maxSourceChars: 1_200_000,
    maxFileBytes: 50 * 1024 * 1024,
  }), { headers });
};