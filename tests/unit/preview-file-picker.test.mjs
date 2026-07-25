import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

function createElement(initial = {}) {
  return {
    hidden: false,
    disabled: false,
    value: "",
    textContent: "",
    dataset: {},
    files: [],
    listeners: new Map(),
    addEventListener(type, listener) {
      this.listeners.set(type, listener);
    },
    ...initial,
  };
}

test("preview assets resolve relative to a repository subpath", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const build = await readFile(new URL("../../scripts/build.mjs", import.meta.url), "utf8");

  assert.match(html, /href="\.\/styles\.css\?v=/);
  assert.match(html, /src="\.\/file-picker-bootstrap\.js\?v=/);
  assert.match(html, /src="\.\/app\.js\?v=/);
  assert.doesNotMatch(html, /(?:href|src)="\/(?:styles\.css|app\.js)/);
  assert.match(build, /"file-picker-bootstrap\.js"/);
});

test("bootstrap displays a selected PDF before application modules finish", async () => {
  const source = await readFile(new URL("../../file-picker-bootstrap.js", import.meta.url), "utf8");
  const timers = [];
  const elements = {
    lectureFile: createElement(),
    fileButtonText: createElement({ textContent: "Choose PDF or PPTX" }),
    fileCard: createElement({ hidden: true }),
    fileTypeMark: createElement({ textContent: "DOC" }),
    fileName: createElement(),
    fileMeta: createElement(),
    status: createElement(),
    actionButton: createElement({ disabled: true }),
  };

  const context = {
    document: {
      readyState: "complete",
      getElementById(id) {
        return elements[id] || null;
      },
    },
    window: {
      setTimeout(callback) {
        timers.push(callback);
      },
    },
    Object,
    Number,
    Math,
    Error,
  };

  vm.runInNewContext(source, context, { filename: "file-picker-bootstrap.js" });

  elements.lectureFile.files = [{
    name: "Lecture.PDF",
    size: 2048,
    lastModified: 123,
  }];
  elements.lectureFile.listeners.get("change")();

  assert.equal(elements.fileCard.hidden, false);
  assert.equal(elements.fileTypeMark.textContent, "PDF");
  assert.equal(elements.fileName.textContent, "Lecture.PDF");
  assert.match(elements.fileMeta.textContent, /^PDF · 2\.0 KB$/);
  assert.match(elements.status.textContent, /Lecture\.PDF is selected/);
  assert.equal(context.window.__jangPendingLectureFile.name, "Lecture.PDF");

  // The full application normally enables the action immediately after its
  // module listener processes the same native event.
  elements.actionButton.disabled = false;
  timers.forEach((callback) => callback());
  assert.match(elements.status.textContent, /Lecture\.PDF is selected/);
});

test("bootstrap reports a module-load failure without discarding the file", async () => {
  const source = await readFile(new URL("../../file-picker-bootstrap.js", import.meta.url), "utf8");
  const timers = [];
  const elements = {
    lectureFile: createElement(),
    fileButtonText: createElement(),
    fileCard: createElement({ hidden: true }),
    fileTypeMark: createElement(),
    fileName: createElement(),
    fileMeta: createElement(),
    status: createElement(),
    actionButton: createElement({ disabled: true }),
  };
  const context = {
    document: { readyState: "complete", getElementById: (id) => elements[id] || null },
    window: { setTimeout: (callback) => timers.push(callback) },
    Object,
    Number,
    Math,
    Error,
  };

  vm.runInNewContext(source, context);
  elements.lectureFile.files = [{ name: "lecture.pptx", size: 4096, lastModified: 1 }];
  elements.lectureFile.listeners.get("input")();
  timers.forEach((callback) => callback());

  assert.equal(elements.lectureFile.files.length, 1);
  assert.equal(elements.fileCard.hidden, false);
  assert.match(elements.status.textContent, /application did not finish loading/i);
});
