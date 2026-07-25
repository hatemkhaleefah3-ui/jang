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

  assert.equal(selectedFileFromInput({ files: itemFileList }), pdf);
  assert.equal(selectedFileFromInput({ files: indexedFileList }), pdf);
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

test("the deployed markup and script keep the picker contract in sync", async () => {
  const [html, app, build, headers] = await Promise.all([
    readFile(new URL("../../index.html", import.meta.url), "utf8"),
    readFile(new URL("../../app.js", import.meta.url), "utf8"),
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

  const uploadStart = html.indexOf('<label class="upload-zone"');
  const uploadEnd = html.indexOf("</label>", uploadStart);
  const inputPosition = html.indexOf('id="lectureFile"', uploadStart);
  assert.ok(uploadStart >= 0 && inputPosition > uploadStart && inputPosition < uploadEnd, "The native file input must be inside the upload zone.");

  assert.match(app, /addEventListener\("input", handleLectureFileSelection\)/);
  assert.match(app, /addEventListener\("change", handleLectureFileSelection\)/);
  assert.match(app, /if \(coverageAudit\)/, "Optional new DOM nodes must not break older cached markup.");
  assert.match(build, /"lecture-file\.js"/);
  assert.match(headers, /Cache-Control: no-store, max-age=0/);
});
