import { onRequestPost as redesignPost, onRequestOptions as redesignOptions } from "./redesign-large.js";

function normalizeEnvironment(env) {
  if (env.GEMINI_API_KEY || !env.GOOGLE_API_KEY) return env;
  const normalized = Object.create(env);
  normalized.GEMINI_API_KEY = env.GOOGLE_API_KEY;
  return normalized;
}

export const onRequestPost = (context) => redesignPost({ ...context, env: normalizeEnvironment(context.env) });
export const onRequestOptions = redesignOptions;
