import test from "node:test";
import assert from "node:assert/strict";
import { renderPlanLecture } from "../fixtures/render-plan-lecture.mjs";

class MemoryKVNamespace {
  constructor() {
    this.values = new Map();
    this.transientMisses = new Map();
  }

  async put(key, value, options = {}) {
    let bytes;
    if (typeof value === "string") bytes = new TextEncoder().encode(value);
    else if (value instanceof ArrayBuffer) bytes = new Uint8Array(value);
    else if (ArrayBuffer.isView(value)) bytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    else if (value instanceof Blob) bytes = new Uint8Array(await value.arrayBuffer());
    else throw new TypeError(`Unsupported KV value for ${key}`);
    if (bytes.byteLength > 25 * 1024 * 1024) throw new Error("KV value exceeds 25 MiB");
    const expiration = options.expiration || (options.expirationTtl ? Math.floor(Date.now() / 1000) + options.expirationTtl : undefined);
    this.values.set(key, {
      bytes: new Uint8Array(bytes),
      metadata: options.metadata || null,
      expiration,
    });
  }

  #stored(key) {
    const remainingMisses = this.transientMisses.get(key) || 0;
    if (remainingMisses > 0) {
      this.transientMisses.set(key, remainingMisses - 1);
      return null;
    }
    const stored = this.values.get(key);
    if (!stored) return null;
    if (stored.expiration && stored.expiration <= Math.floor(Date.now() / 1000)) {
      this.values.delete(key);
      return null;
    }
    return stored;
  }

  #decode(stored, type = "text") {
    if (!stored) return null;
    const copy = stored.bytes.slice();
    if (type === "arrayBuffer") return copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
    const text = new TextDecoder().decode(copy);
    if (type === "json") return JSON.parse(text);
    if (type === "stream") return new Response(copy).body;
    return text;
  }

  async get(key, options = {}) {
    const type = typeof options === "string" ? options : options.type || "text";
    return this.#decode(this.#stored(key), type);
  }

  async getWithMetadata(key, options = {}) {
    const stored = this.#stored(key);
    const type = typeof options === "string" ? options : options.type || "text";
    return {
      value: this.#decode(stored, type),
      metadata: stored?.metadata || null,
    };
  }

  async list(options = {}) {
    const prefix = options.prefix || "";
    const keys = [...this.values.entries()]
      .filter(([key, stored]) => key.startsWith(prefix) && (!stored.expiration || stored.expiration > Math.floor(Date.now() / 1000)))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, stored]) => ({ name, expiration: stored.expiration, metadata: stored.metadata }));
    return { keys, list_complete: true, cursor: "" };
  }

  async delete(key) {
    this.values.delete(key);
  }
}

function context(path, body, kv, apiKey = "test-secret") {
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
      JANG_AUTOMATION_KV: kv,
    },
  };
}

async function payload(response) {
  return response.json();
}

test("n8n API mirrors JSON import, build, image import, continue, and binary export through KV", { timeout: 60000 }, async () => {
  const {
    handleImport,
    handleBuild,
    handleImageImport,
    handleContinue,
    handleExport,
  } = await import("../../functions/_shared/automation.js");

  const kv = new MemoryKVNamespace();
  const unauthorized = await handleImport(context("/api/import", { lecture: renderPlanLecture() }, kv, "wrong"));
  assert.equal(unauthorized.status, 401);

  const imported = await handleImport(context("/api/import", { lecture: renderPlanLecture() }, kv));
  assert.equal(imported.status, 200);
  const { importId } = await payload(imported);
  assert.match(importId, /^[0-9a-f-]{36}$/i);

  // Simulate one transient eventually-consistent miss. Required KV reads retry.
  kv.transientMisses.set(`imports/${importId}/import.json`, 1);
  const built = await handleBuild(context("/api/build", { importId }, kv));
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
    }, kv));
    assert.equal(imageImported.status, 200);
    assert.equal((await payload(imageImported)).success, true);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const previousDocument = globalThis.document;
  globalThis.document = {};
  let continued;
  try {
    continued = await handleContinue(context("/api/continue", { importId }, kv));
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
  assert.equal(continued.status, 200, await continued.clone().text());
  const continueResult = await payload(continued);
  assert.equal(continueResult.success, true);
  assert.ok(continueResult.slideCount > 0);

  const exported = await handleExport(context("/api/export", { importId }, kv));
  assert.equal(exported.status, 200);
  assert.equal(exported.headers.get("content-type"), "application/vnd.openxmlformats-officedocument.presentationml.presentation");
  assert.match(exported.headers.get("content-disposition"), /attachment/i);
  const pptxBytes = (await exported.arrayBuffer()).byteLength;
  assert.ok(pptxBytes > 1000);
  assert.ok(pptxBytes < 25 * 1024 * 1024);
});
