import { generateLecturePptx } from "./pptx-engine.js";

export const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export function slugifyLectureTitle(value) {
  const slug = String(value || "lecture")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return slug || "lecture";
}

export async function buildLecturePptxFile(lecture, importedImages = {}, options = {}) {
  const result = await generateLecturePptx(lecture, importedImages, {
    strictGeometry: true,
    compression: true,
    ...options,
  });
  const bytes = await result.blob.arrayBuffer();
  return {
    ...result,
    blob: new Blob([bytes], { type: PPTX_MIME }),
    filename: `${slugifyLectureTitle(lecture.documentTitle)}.pptx`,
  };
}
