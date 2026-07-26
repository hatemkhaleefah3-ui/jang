import { readFile, writeFile } from "node:fs/promises";

async function replaceRequired(path, search, replacement, description) {
  const source = await readFile(path, "utf8");
  if (!source.includes(search)) throw new Error(`Could not find ${description} in ${path}`);
  await writeFile(path, source.replace(search, replacement), "utf8");
}

await replaceRequired(
  "tests/unit/preview-file-picker.test.mjs",
  `    addEventListener(type, listener) {
      const callbacks = listeners.get(type) || [];
      callbacks.push(listener);
      listeners.set(type, callbacks);
    },
    dispatchEvent(event) {`,
  `    addEventListener(type, listener) {
      const callbacks = listeners.get(type) || [];
      callbacks.push(listener);
      listeners.set(type, callbacks);
    },
    removeEventListener(type, listener) {
      const callbacks = listeners.get(type) || [];
      listeners.set(type, callbacks.filter((callback) => callback !== listener));
    },
    dispatchEvent(event) {`,
  "event-target removeEventListener support",
);

await replaceRequired(
  "tests/unit/preview-file-picker.test.mjs",
  `assert.match(loader, /dispatchEvent\\(new Event\\("input"/);`,
  `assert.match(loader, /dispatchEvent\\(new Event\\("change"/);`,
  "change-event loader assertion",
);

await replaceRequired(
  "tests/unit/preview-file-picker.test.mjs",
  `harness.elements.lectureFile.dispatchEvent({ type: "input" });`,
  `harness.elements.lectureFile.dispatchEvent({ type: "change" });`,
  "change-event bootstrap simulation",
);

console.log("Updated preview picker harness for the change-only listener flow.");
