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

export const onRequestPost = (context) => {
  const env = normalizeEnvironment(context.env);
  if (!env.GEMINI_API_KEY) {
    const environment = environmentName(env);
    return new Response(JSON.stringify({
      code: "AI_NOT_CONFIGURED",
      environment,
      error: `This ${environment} deployment cannot access GEMINI_API_KEY or GOOGLE_API_KEY. Add the secret to the same Cloudflare Pages environment and redeploy.`,
    }), { status: 503, headers });
  }
  return redesignPost({ ...context, env });
};

export const onRequestOptions = redesignOptions;
