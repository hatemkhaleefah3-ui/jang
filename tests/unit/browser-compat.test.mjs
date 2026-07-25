import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

class FakeElement {
  constructor() {
    this.children = [];
  }

  get firstChild() {
    return this.children[0] || null;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    return child;
  }
}

test("browser compatibility restores replaceChildren before app selection", async () => {
  const source = await readFile(new URL("../../browser-compat.js", import.meta.url), "utf8");
  const windowListeners = new Map();
  const document = {
    readyState: "complete",
    getElementById() {
      return null;
    },
    createTextNode(value) {
      return { nodeType: 3, textContent: value };
    },
    createEvent() {
      return {
        initCustomEvent(type, bubbles, cancelable, detail) {
          this.type = type;
          this.bubbles = bubbles;
          this.cancelable = cancelable;
          this.detail = detail;
        },
      };
    },
  };
  const window = {
    addEventListener(type, listener) {
      windowListeners.set(type, listener);
    },
    setTimeout() {},
  };

  vm.runInNewContext(source, {
    window,
    document,
    Element: FakeElement,
    Promise,
    Object,
    String,
    Boolean,
    Event,
  }, { filename: "browser-compat.js" });

  const element = new FakeElement();
  element.appendChild({ id: "old" });
  element.replaceChildren("new");

  assert.equal(element.children.length, 1);
  assert.equal(element.children[0].textContent, "new");
  assert.equal(typeof window.queueMicrotask, "function");
  assert.equal(typeof window.CustomEvent, "function");
  assert.ok(windowListeners.has("error"));
  assert.ok(windowListeners.has("unhandledrejection"));
});

test("deployment loads compatibility first and cache-busts app.js", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const loader = await readFile(new URL("../../app-loader.js", import.meta.url), "utf8");
  const build = await readFile(new URL("../../scripts/build.mjs", import.meta.url), "utf8");

  const compatibilityIndex = html.indexOf("browser-compat.js");
  const pickerIndex = html.indexOf("file-picker-bootstrap.js");
  const loaderIndex = html.indexOf("app-loader.js");

  assert.ok(compatibilityIndex >= 0);
  assert.ok(compatibilityIndex < pickerIndex);
  assert.ok(pickerIndex < loaderIndex);
  assert.match(loader, /app\.js\?v=20260725-file-ready-ack/);
  assert.match(build, /"browser-compat\.js"/);
});
