import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

function createEventTarget(initial = {}) {
  const listeners = new Map();
  return {
    hidden: false,
    disabled: false,
    value: "",
    textContent: "",
    dataset: {},
    files: [],
    listeners,
    addEventListener(type, listener) {
      const callbacks = listeners.get(type) || [];
      callbacks.push(listener);
      listeners.set(type, callbacks);
    },
    dispatchEvent(event) {
      const callbacks = listeners.get(event.type) || [];
      callbacks.forEach((listener) => listener.call(this, event));
      return true;
    },
    ...initial,
  };
}

function createBootstrapHarness() {
  const timers = [];
  const moduleScript = createEventTarget();
  const elements = {
    lectureFile: createEventTarget(),
    fileButtonText: createEventTarget({ textContent: "Choose PDF or PPTX" }),
    fileCard: createEventTarget({ hidden: true }),
    fileTypeMark: createEventTarget({ textContent: "DOC" }),
    fileName: createEventTarget(),
    fileMeta: createEventTarget(),
    status: createEventTarget(),
    actionButton: createEventTarget({ disabled: true }),
  };
  const windowTarget = createEventTarget({
    setTimeout(callback) {
      timers.push(callback);
    },
  });
  const document = {
    readyState: "complete",
    getElementById(id) {
      return elements[id] || null;
    },
    querySelector(selector) {
      return selector === "script[data-jang-application]" ? moduleScript : null;
    },
  };

  return { document, elements, moduleScript, timers, windowTarget };
}

test("preview assets and application loader resolve relative to a repository subpath", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const build = await readFile(new URL("../../scripts/build.mjs", import.meta.url), "utf8");
  const loader = await readFile(new URL("../../app-loader.js", import.meta.url), "utf8");

  assert.match(html, /href="\.\/styles\.css\?v=/);
  assert.match(html, /src="\.\/browser-compat\.js\?v=/);
  assert.match(html, /src="\.\/file-picker-bootstrap\.js\?v=/);
  assert.match(html, /data-jang-application src="\.\/app-loader\.js\?v=/);
  assert.doesNotMatch(html, /(?:href|src)="\/(?:styles\.css|app(?:-loader)?\.js)/);
  assert.match(build, /"browser-compat\.js"/);
  assert.match(build, /"file-picker-bootstrap\.js"/);
  assert.match(build, /"app-loader\.js"/);
  assert.match(loader, /^import "\.\/app\.js\?v=20260725-file-ready-ack";/m);
  assert.match(loader, /__jangApplicationModuleLoaded = true/);
  assert.match(loader, /dispatchEvent\(new Event\("input"/);
});

test("bootstrap preserves a file while the application module is still loading", async () => {
  const source = await readFile(new URL("../../file-picker-bootstrap.js", import.meta.url), "utf8");
  const harness = createBootstrapHarness();
  const context = {
    document: harness.document,
    window: harness.windowTarget,
    Object,
    Number,
    Math,
    Error,
  };

  vm.runInNewContext(source, context, { filename: "file-picker-bootstrap.js" });

  harness.elements.lectureFile.files = [{
    name: "Lecture.PDF",
    size: 2048,
    lastModified: 123,
  }];
  harness.elements.lectureFile.dispatchEvent({ type: "change" });

  assert.equal(harness.elements.fileCard.hidden, false);
  assert.equal(harness.elements.fileTypeMark.textContent, "PDF");
  assert.equal(harness.elements.fileName.textContent, "Lecture.PDF");
  assert.match(harness.elements.fileMeta.textContent, /^PDF · 2\.0 KB$/);
  assert.match(harness.elements.status.textContent, /Finishing application loading/);
  assert.equal(harness.windowTarget.__jangPendingLectureFile.name, "Lecture.PDF");

  harness.windowTarget.dispatchEvent({ type: "jang:application-ready" });
  harness.timers.forEach((callback) => callback());

  assert.equal(harness.windowTarget.__jangApplicationModuleLoaded, true);
  assert.doesNotMatch(harness.elements.status.textContent, /did not finish loading/i);
  assert.equal(harness.elements.lectureFile.files.length, 1);
});

test("bootstrap reports only a genuine application module error", async () => {
  const source = await readFile(new URL("../../file-picker-bootstrap.js", import.meta.url), "utf8");
  const harness = createBootstrapHarness();
  const context = {
    document: harness.document,
    window: harness.windowTarget,
    Object,
    Number,
    Math,
    Error,
  };

  vm.runInNewContext(source, context, { filename: "file-picker-bootstrap.js" });
  harness.elements.lectureFile.files = [{ name: "lecture.pptx", size: 4096, lastModified: 1 }];
  harness.elements.lectureFile.dispatchEvent({ type: "input" });
  harness.moduleScript.dispatchEvent({ type: "error" });

  assert.equal(harness.elements.lectureFile.files.length, 1);
  assert.equal(harness.elements.fileCard.hidden, false);
  assert.equal(harness.windowTarget.__jangApplicationModuleFailed, true);
  assert.match(harness.elements.status.textContent, /application module failed to load/i);
});
