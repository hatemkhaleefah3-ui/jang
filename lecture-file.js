export const LECTURE_FILE_LIMITS = Object.freeze({
  pdf: 18_000_000,
  pptx: 50_000_000,
});

export function selectedFileFromInput(input) {
  const files = input?.files;
  if (!files || files.length === 0) return null;
  if (typeof files.item === "function") return files.item(0);
  return files[0] || null;
}

export function lectureFileSignature(file) {
  if (!file) return "";
  return [file.name || "", Number(file.size) || 0, Number(file.lastModified) || 0].join(":");
}

export function validateLectureFile(file) {
  if (!file || typeof file.name !== "string") {
    throw new Error("Choose a PDF or PPTX lecture file.");
  }

  const extension = file.name.trim().split(".").pop()?.toLowerCase();
  if (!extension || !Object.prototype.hasOwnProperty.call(LECTURE_FILE_LIMITS, extension)) {
    throw new Error("Choose a PDF or PPTX lecture file.");
  }

  const size = Number(file.size);
  if (!Number.isFinite(size) || size < 0) {
    throw new Error("The selected file size could not be read.");
  }

  const limit = LECTURE_FILE_LIMITS[extension];
  if (size > limit) {
    const label = extension === "pdf" ? "PDF files must be 18 MB or smaller." : "PPTX files must be 50 MB or smaller.";
    throw new Error(label);
  }

  return extension;
}
