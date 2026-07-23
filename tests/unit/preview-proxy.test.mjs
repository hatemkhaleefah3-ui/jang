import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../../functions/api/redesign.js";
import { onRequestGet } from "../../functions/api/config.js";

test("preview AI requests proxy to the same Pages project's production endpoint", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("/api/config")) {
      return new Response(JSON.stringify({ configured: true, model: "gemini-3.5-flash-lite" }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({ plan: { metadata: { title: "Test" }, sections: [] } }), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const env = {
      CF_PAGES_BRANCH: "agent/pdf-import-gemini-config",
      CF_PAGES_URL: "https://agent-pdf-import-gemini-config.jang.pages.dev",
    };
    const configRequest = new Request("https://agent-pdf-import-gemini-config.jang.pages.dev/api/config");
    const configResponse = await onRequestGet({ request: configRequest, env });
    const config = await configResponse.json();
    assert.equal(config.configured, true);
    assert.equal(config.proxied, true);
    assert.equal(config.proxyOrigin, "https://jang.pages.dev");

    const request = new Request("https://agent-pdf-import-gemini-config.jang.pages.dev/api/redesign", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://agent-pdf-import-gemini-config.jang.pages.dev" },
      body: JSON.stringify({ source: { title: "Test", batches: ["Lecture content"], assets: [] }, options: {} }),
    });
    const response = await onRequestPost({ request, env });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-jang-ai-source"), "production-proxy");
    assert.ok(calls.some((call) => call.url === "https://jang.pages.dev/api/redesign-large"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});
