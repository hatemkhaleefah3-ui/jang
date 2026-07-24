import test from "node:test";
import assert from "node:assert/strict";
import { callOcr, resolveOcrModel } from "../../functions/api/redesign-large.js";

function geminiResponse(value, status = 200) {
  return new Response(JSON.stringify(status === 200 ? {
    candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }],
  } : { error: { message: String(value) } }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("Gemini OCR uses the current vision model and audits a weak first transcript", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), body: JSON.parse(options.body) });
    if (calls.length === 1) {
      return geminiResponse({
        page: 5,
        text: "Scanned lecture heeding",
        lines: ["Scanned lecture heeding"],
        confidence: 0.62,
        uncertainFragments: ["heeding"],
      });
    }
    return geminiResponse({
      page: 5,
      text: "Scanned lecture heading\nComplete scanned lecture body text.",
      lines: ["Scanned lecture heading", "Complete scanned lecture body text."],
      confidence: 0.98,
      uncertainFragments: [],
    });
  };

  try {
    const data = {
      source: { ocrPages: [{ page: 5, assetId: "pdf-page-005", mimeType: "image/jpeg", data: "AA==" }] },
      options: { language: "English" },
    };
    const result = await callOcr(data, { GEMINI_API_KEY: "test-key" });
    assert.equal(resolveOcrModel({}), "gemini-3.6-flash");
    assert.equal(calls.length, 2);
    assert.match(calls[0].url, /gemini-3\.6-flash:generateContent/);
    assert.equal(calls[0].body.generationConfig.responseMimeType, "application/json");
    assert.equal(calls[0].body.generationConfig.responseSchema.required.includes("uncertainFragments"), true);
    assert.equal(calls[0].body.contents[0].parts[0].inline_data.mime_type, "image/jpeg");
    assert.match(calls[1].body.contents[0].parts[1].text, /Audit this proposed transcription/);
    assert.equal(result[0].audited, true);
    assert.equal(result[0].text, "Scanned lecture heading\nComplete scanned lecture body text.");
    assert.ok(result[0].quality > 0.8);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Gemini OCR retries transient API failures", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    if (calls === 1) return geminiResponse("temporary outage", 503);
    return geminiResponse({
      page: 1,
      text: "Recovered OCR text",
      lines: ["Recovered OCR text"],
      confidence: 0.99,
      uncertainFragments: [],
    });
  };

  try {
    const result = await callOcr({
      source: { ocrPages: [{ page: 1, assetId: "pdf-page-001", mimeType: "image/png", data: "AA==" }] },
      options: { language: "English" },
    }, { GEMINI_API_KEY: "test-key" });
    assert.equal(calls, 2);
    assert.equal(result[0].text, "Recovered OCR text");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
