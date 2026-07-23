const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

export const onRequestGet = async ({ env }) => {
  return new Response(JSON.stringify({
    configured: Boolean(env.GEMINI_API_KEY),
    model: env.GEMINI_MODEL || "gemini-2.5-flash",
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || null,
    maxSourceChars: 380000,
    maxFileBytes: 8 * 1024 * 1024,
  }), { headers });
};
