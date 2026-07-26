import test from "node:test";
import assert from "node:assert/strict";
import { renderPlanLecture } from "../fixtures/render-plan-lecture.mjs";

class MemoryR2Bucket {
  constructor() {
    this.objects = new Map();
  }

  async put(key, value, options = {}) {
    let bytes;
    if (typeof value === "string") bytes = new TextEncoder().encode(value);
    else if (value instanceof ArrayBuffer) bytes = new Uint8Array(value);
    else if (ArrayBuffer.isView(value)) bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    else if (value instanceof Blob) bytes = new Uint8Array(await value.arrayBuffer());
    else throw new TypeError(`Unsupported R2 value for ${key}`);
    this.objects.set(key, {
      bytes: new Uint8Array(bytes),
      httpMetadata: options.httpMetadata || {},
      customMetadata: options.customMetadata || {},
    });
  }

  async get(key) {
    const stored = this.objects.get(key);
    if (!stored) return null;
    const copy = stored.bytes.slice();
    return {
      size: copy.byteLength,
      body: new Response(copy).body,
      httpMetadata: stored.httpMetadata,
      customMetadata: stored.customMetadata,
      text: async () => new TextDecoder().decode(copy),
      arrayBuffer: async () => copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength),
    };
  }

  async delete(keys) {
    for (const key of Array.isArray(keys) ? keys : [keys]) this.objects.delete(key);
  }
}

function context(path, body, bucket, apiKey = "test-secret") {
  return {
    request: new Request(`https://jang.example${path}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }),
    env: {
      JANG_API_KEY: "test-secret",
      JANG_AUTOMATION_BUCKET: bucket,
    },
  };
}

async function payload(response) {
  return response.json();
}

test("n8n API mirrors JSON import, build, image import, continue, and binary export", { timeout: 60000 }, async () => {
  const {
    handleImport,
    handleBuild,
    handleImageImport,
    handleContinue,
    handleExport,
  } = await import("../../functions/_shared/automation.js");

  const bucket = new MemoryR2Bucket();
  const unauthorized = await handleImport(context("/api/import", { lecture: renderPlanLecture() }, bucket, "wrong"));
  assert.equal(unauthorized.status, 401);

  const imported = await handleImport(context("/api/import", { lecture: renderPlanLecture() }, bucket));
  assert.equal(imported.status, 200);
  const { importId } = await payload(imported);
  assert.match(importId, /^[0-9a-f-]{36}$/i);

  const built = await handleBuild(context("/api/build", { importId }, bucket));
  assert.equal(built.status, 200);
  const buildResult = await payload(built);
  assert.ok(buildResult.labels.length >= 1);
  assert.equal(buildResult.images.length, buildResult.labels.length);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700"><rect width="1200" height="700" fill="#111"/></svg>',
    { status: 200, headers: { "content-type": "image/svg+xml" } },
  );
  try {
    const imageImported = await handleImageImport(context("/api/images/import", {
      importId,
      label: buildResult.labels[0],
      imageUrl: "https://images.example/lecture.svg",
    }, bucket));
    assert.equal(imageImported.status, 200);
    assert.equal((await payload(imageImported)).success, true);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const previousDocument = globalThis.document;
  globalThis.document = {};
  let continued;
  try {
    continued = await handleContinue(context("/api/continue", { importId }, bucket));
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
  assert.equal(continued.status, 200, await continued.clone().text());
  const continueResult = await payload(continued);
  assert.equal(continueResult.success, true);
  assert.ok(continueResult.slideCount > 0);

  const exported = await handleExport(context("/api/export", { importId }, bucket));
  assert.equal(exported.status, 200);
  assert.equal(exported.headers.get("content-type"), "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  assert.match(exported.headers.get("content-disposition"), /attachment/i);
  assert.ok((await exported.arrayBuffer()).byteLength > 1000);
});
