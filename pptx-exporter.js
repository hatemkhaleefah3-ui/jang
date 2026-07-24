import * as exporter from "./pptx-exporter-v2.js";

export const createFidelityManifest = exporter.createFidelityManifest;
export const buildPptx = exporter.buildPptx;
export const createPptxFile = exporter.createPptxFile;
export const downloadPreparedPptx = exporter.downloadPreparedPptx;
export const downloadPptx = exporter.downloadPptx;

function normalizeText(value) {
  return String(value || "").normalize("NFC").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function decodeXmlText(value) {
  return String(value || "")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function contentTokens(value) {
  return normalizeText(value).toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

function containsTokenSubsequence(haystack, needle) {
  const expected = contentTokens(needle);
  if (expected.length < 4) return false;
  const actual = contentTokens(haystack);
  let index = 0;
  for (const token of actual) {
    if (token === expected[index]) index += 1;
    if (index === expected.length) return true;
  }
  return false;
}

export async function verifyPptxPackage(arrayBuffer, manifest = {}) {
  if (!globalThis.JSZip) throw new Error("PowerPoint verification could not load JSZip.");
  const zip = await globalThis.JSZip.loadAsync(arrayBuffer);
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path) && !zip.files[path]?.dir)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
  const slideXml = (await Promise.all(slidePaths.map((path) => zip.file(path)?.async("text")))).filter(Boolean).join("\n");
  const paragraphText = [...slideXml.matchAll(/<a:p(?:\s[^>]*)?>([\s\S]*?)<\/a:p>/g)]
    .map((paragraph) => [...paragraph[1].matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXmlText(match[1])).join(""));
  const fallbackRuns = [...slideXml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)].map((match) => decodeXmlText(match[1]));
  const normalizedXml = normalizeText((paragraphText.length ? paragraphText : fallbackRuns).join(" "));

  const sourceUnits = Array.isArray(manifest.sourceUnits) && manifest.sourceUnits.length
    ? manifest.sourceUnits
    : (Array.isArray(manifest.sourceText) ? manifest.sourceText : []).map((text) => ({ id: "", page: 0, text }));
  const missingSourceUnits = sourceUnits.filter((unit) => {
    const expected = normalizeText(unit?.text ?? unit?.verbatimText);
    if (!expected || normalizedXml.includes(expected)) return false;
    return !containsTokenSubsequence(normalizedXml, expected);
  });

  const mediaPaths = Object.keys(zip.files).filter((path) => /^ppt\/media\/[^/]+$/i.test(path) && !zip.files[path]?.dir);
  const imageShapeCount = (slideXml.match(/<a:blip\b[^>]*\br:embed=/g) || []).length;
  const embeddedMediaCount = Math.max(mediaPaths.length, imageShapeCount);
  const expectedAssets = Array.isArray(manifest.expectedAssets) ? manifest.expectedAssets.filter(Boolean) : [];
  const markerIds = [...slideXml.matchAll(/JANG_ASSET:([^"<&]+)/g)].map((match) => decodeXmlText(match[1]));
  const markerMode = markerIds.length > 0;
  const missingAssets = markerMode ? expectedAssets.filter((id) => !markerIds.includes(id)) : [];
  const assetsValid = markerMode ? missingAssets.length === 0 : embeddedMediaCount >= expectedAssets.length;

  return {
    valid: missingSourceUnits.length === 0 && assetsValid,
    missingText: missingSourceUnits.map((unit) => unit?.text ?? unit?.verbatimText),
    missingSourceUnits,
    missingAssets,
    missingAssetIds: missingAssets,
    expectedMediaCount: expectedAssets.length,
    embeddedMediaCount,
    slideCount: slidePaths.length,
  };
}
