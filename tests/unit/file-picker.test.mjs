import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  lectureFileSignature,
  selectedFileFromInput,
  validateLectureFile,
} from "../../lecture-file.js";

test("reads the selected file from browser FileList implementations", () => {
  const pdf = { name: "lecture.PDF", size: 1024, lastModified: 123 };
  const itemFileList = { length: 1, item: (index) => index === 0 ? pdf : null };
  const indexedFileList = { 0: pdf, length: 1 };
  const embeddedBrowserFileList = { 0: pdf, length: 1, item: () => null };

  assert.equal(selectedFileFromInput({ files: itemFileList }), pdf);
  assert.equal(selectedFileFromInput({ files: indexedFileList }), pdf);
  assert.equal(
    selectedFileFromInput({ files: embeddedBrowserFileList }),
    pdf,
    "Indexed FileList access must win when a broken item() shim returns null.",
  );
  assert.equal(selectedFileFromInput({ files: { length: 0, item: () => null } }), null);
  assert.equal(selectedFileFromInput(null), null);
});

test("accepts PDF and PPTX files independently of MIME type or extension case", () => {
  assert.equal(validateLectureFile({ name: "lecture.PDF", size: 18_000_000, type: "" }), "pdf");
  assert.equal(validateLectureFile({ name: "lecture.PPTX", size: 50_000_000, type: "application/octet-stream" }), "pptx");
});

test("rejects unsupported and oversized lecture files with useful errors", () => {
  assert.throws(() => validateLectureFile({ name: "lecture.ppt", size: 100 }), /PDF or PPTX/);
  assert.throws(() => validateLectureFile({ name: "lecture.pdf", size: 18_000_001 }), /18 MB/);
  assert.throws(() => validateLectureFile({ name: "lecture.pptx", size: 50_000_001 }), /50 MB/);
});

test("uses a stable signature to deduplicate input and change events", () => {
  const first = { name: "lecture.pdf", size: 4096, lastModified: 456 };
  const duplicateEventFile = { ...first };
  assert.equal(lectureFileSignature(first), lectureFileSignature(duplicateEventFile));
});

test("the deployed markup and scripts keep the picker contract in sync", async () => {
  const [html, app, recovery, styles, build, headers] = await Promise.all([
    readFile(new URL("../../index.html", import.meta.url), "utf8"),
    readFile(new URL("../../app.js", import.meta.url), "utf8"),
    readFile(new URL("../../file-picker-recovery.js", import.meta.url), "utf8"),
    readFile(new URL("../../styles.css", import.meta.url), "utf8"),
    readFile(new URL("../../scripts/build.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../_headers", import.meta.url), "utf8"),
  ]);

  for (const id of [
    "lectureFile",
    "fileButtonText",
    "fileCard",
    "fileName",
    "fileMeta",
    "actionButton",
    "actionLabel",
    "status",
    "imageReview",
    "reviewSummary",
    "imageSlots",
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `Missing #${id} from index.html`);
  }

  assert.doesNotMatch(html, /<label class="upload-zone"/, "The native input must not be wrapped in a second activating label.");
  assert.match(html, /<div class="upload-zone">[\s\S]*id="lectureFile"[\s\S]*<\/div>/);
  assert.match(html, /file-picker-recovery\.js/);
  assert.match(styles, /\.upload-file-input::file-selector-button/);
  assert.doesNotMatch(styles, /\.upload-file-input\s*\{[^}]*opacity:\s*0/s, "The browser's own selected filename must remain visible.");

  assert.match(app, /addEventListener\("input", handleLectureFileSelection\)/);
  assert.match(app, /addEventListener\("change", handleLectureFileSelection\)/);
  assert.match(app, /if \(coverageAudit\)/, "Optional new DOM nodes must not break older cached markup.");
  assert.match(recovery, /window\.addEventListener\("focus", scheduleRecovery\)/);
  assert.match(recovery, /visibilitychange/);
  assert.match(recovery, /dispatchEvent\(new Event\("change"/);
  assert.match(build, /"lecture-file\.js"/);
  assert.match(build, /"file-picker-recovery\.js"/);
  assert.match(headers, /Cache-Control: no-store, max-age=0/);
});
