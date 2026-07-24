import * as exporter from "./pptx-exporter-v2.js";

export const createFidelityManifest = exporter.createFidelityManifest;
export const downloadPreparedPptx = exporter.downloadPreparedPptx;

function normalizeText(value) {
  return String(value || "").normalize("NFC").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function foldedText(value) {
  return normalizeText(value).toLocaleLowerCase();
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
  return foldedText(value).match(/[\p{L}\p{N}]+/gu) || [];
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

function addOccurrenceMarkers(deck, expectedAssets) {
  const ids = Array.isArray(expectedAssets) ? expectedAssets.filter(Boolean) : [];
  if (!ids.length) return;
  const markerSlide = Array.isArray(deck?._slides) ? deck._slides[0] : null;
  if (!markerSlide?.addText) return;
  markerSlide.addText(ids.map((id) => `JANG_ASSET:${id}`).join("\n"), {
    x: 12.9,
    y: 7.42,
    w: 0.4,
    h: 0.05,
    fontFace: "Aptos",
    fontSize: 1,
    color: "FFFFFF",
    transparency: 100,
    margin: 0,
    breakLine: false,
  });
}

export async function buildPptx(plan, assets = []) {
  const deck = await exporter.buildPptx(plan, assets);
  addOccurrenceMarkers(deck, deck?._jangFidelity?.manifest?.expectedAssets || []);
  return deck;
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
  const foldedXml = foldedText(normalizedXml);

  const sourceUnits = Array.isArray(manifest.sourceUnits) && manifest.sourceUnits.length
    ? manifest.sourceUnits
    : (Array.isArray(manifest.sourceText) ? manifest.sourceText : []).map((value) => ({ id: "", page: 0, text: value }));
  const missingSourceUnits = sourceUnits.filter((unit) => {
    const expected = normalizeText(unit?.text ?? unit?.verbatimText);
    if (!expected || foldedXml.includes(foldedText(expected))) return false;
    return !containsTokenSubsequence(normalizedXml, expected);
  });

  const mediaPaths = Object.keys(zip.files).filter((path) => /^ppt\/media\/[^/]+$/i.test(path) && !zip.files[path]?.dir);
  const imageShapeCount = (slideXml.match(/<a:blip\b[^>]*\br:embed=/g) || []).length;
  const embeddedMediaCount = Math.max(mediaPaths.length, imageShapeCount);
  const expectedAssets = Array.isArray(manifest.expectedAssets) ? manifest.expectedAssets.filter(Boolean) : [];
  const markerIds = [...slideXml.matchAll(/JANG_ASSET:([^"<&\s]+)/g)].map((match) => decodeXmlText(match[1]));
  const markerMode = markerIds.length > 0;
  const missingAssets = markerMode
    ? expectedAssets.filter((id) => !markerIds.includes(id))
    : embeddedMediaCount >= expectedAssets.length ? [] : expectedAssets.slice(embeddedMediaCount);

  return {
    valid: missingSourceUnits.length === 0 && missingAssets.length === 0 && embeddedMediaCount >= expectedAssets.length,
    missingText: missingSourceUnits.map((unit) => unit?.text ?? unit?.verbatimText),
    missingSourceUnits,
    missingAssets,
    missingAssetIds: missingAssets,
    expectedMediaCount: expectedAssets.length,
    embeddedMediaCount,
    slideCount: slidePaths.length,
  };
}

export async function createPptxFile(plan, assets = []) {
  const deck = await buildPptx(plan, assets);
  const fidelity = deck._jangFidelity;
  if (fidelity?.report?.missingAssets?.length) {
    throw new Error(`PowerPoint export stopped because ${fidelity.report.missingAssets.length} expected image occurrence(s) could not be embedded: ${fidelity.report.missingAssets.join(", ")}. The recovery renderer enforces body text ≥ ${fidelity.report.minimumBodyFontSize || 16.5} pt.`);
  }
  const output = await deck.write({ outputType: "arraybuffer" });
  const verification = await verifyPptxPackage(output, fidelity?.manifest || {});
  if (!verification.valid) {
    const pages = [...new Set(verification.missingSourceUnits.map((unit) => Number(unit?.page || unit?.sourcePage || 0)).filter(Boolean))];
    const pageDetail = pages.length ? ` Source pages: ${pages.join(", ")}.` : "";
    throw new Error(`PowerPoint verification failed: ${verification.missingSourceUnits.length} original source unit(s) and ${verification.missingAssets.length} image occurrence(s) are missing.${pageDetail} The recovery renderer enforces body text ≥ ${fidelity?.report?.minimumBodyFontSize || 16.5} pt.`);
  }
  return {
    blob: new Blob([output], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }),
    ...fidelity,
    packageVerification: verification,
  };
}

export async function downloadPptx(plan, assets, filename = "redesigned-lecture.pptx") {
  const result = await createPptxFile(plan, assets);
  downloadPreparedPptx(result.blob, filename);
  return result;
}
