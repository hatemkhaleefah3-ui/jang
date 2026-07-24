import { applyOcrResults } from "./source-importer.js";

const OCR_MODULE_PATH = "/vendor/tesseract.esm.min.js";
const OCR_WORKER_PATH = "/vendor/tesseract/worker.min.js";
const OCR_CORE_PATH = "/vendor/tesseract-core";
const OCR_LANGUAGE_PATH = "/vendor/tessdata";
const MAX_OCR_DIMENSION = 2800;
const MIN_OCR_WIDTH = 1800;
const WORKER_START_TIMEOUT_MS = 120000;
const PAGE_TIMEOUT_MS = 180000;

const cleanLine = (value) => String(value || "").replace(/[\t\f\v]+/g, " ").replace(/ {2,}/g, " ").trim();

function withTimeout(promise, milliseconds, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(milliseconds / 1000)} seconds.`)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function dataUrlToBlob(source) {
  const match = String(source || "").match(/^data:([^;,]+)(?:;charset=[^;,]+)?;base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) return null;
  const binary = atob(match[2].replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: match[1].toLowerCase() });
}

async function decodeImage(source) {
  const blob = dataUrlToBlob(source);
  if (!blob) throw new Error("The rendered PDF page is not a valid embedded image.");
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      return { width: bitmap.width, height: bitmap.height, draw: (context, width, height) => context.drawImage(bitmap, 0, 0, width, height), close: () => bitmap.close?.() };
    } catch { /* use HTMLImageElement below */ }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => resolve({
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: (context, width, height) => context.drawImage(image, 0, 0, width, height),
      close: () => URL.revokeObjectURL(url),
    });
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("The browser could not decode the rendered PDF page.")); };
    image.src = url;
  });
}

function percentile(histogram, count, ratio) {
  const target = count * ratio;
  let seen = 0;
  for (let index = 0; index < histogram.length; index += 1) {
    seen += histogram[index];
    if (seen >= target) return index;
  }
  return 255;
}

function otsuThreshold(histogram, count) {
  let total = 0;
  for (let index = 0; index < 256; index += 1) total += index * histogram[index];
  let backgroundWeight = 0;
  let backgroundSum = 0;
  let bestVariance = -1;
  let threshold = 160;
  for (let index = 0; index < 256; index += 1) {
    backgroundWeight += histogram[index];
    if (!backgroundWeight) continue;
    const foregroundWeight = count - backgroundWeight;
    if (!foregroundWeight) break;
    backgroundSum += index * histogram[index];
    const backgroundMean = backgroundSum / backgroundWeight;
    const foregroundMean = (total - backgroundSum) / foregroundWeight;
    const variance = backgroundWeight * foregroundWeight * (backgroundMean - foregroundMean) ** 2;
    if (variance > bestVariance) { bestVariance = variance; threshold = index; }
  }
  return threshold;
}

async function preprocessPage(source, mode) {
  if (mode === "original") return source;
  const image = await decodeImage(source);
  try {
    const upScale = image.width < MIN_OCR_WIDTH ? MIN_OCR_WIDTH / Math.max(1, image.width) : 1;
    const downScale = Math.min(1, MAX_OCR_DIMENSION / Math.max(image.width * upScale, image.height * upScale));
    const scale = upScale * downScale;
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
    if (!context) throw new Error("The browser could not create an OCR preprocessing canvas.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    image.draw(context, width, height);
    const pixels = context.getImageData(0, 0, width, height);
    const histogram = new Uint32Array(256);
    for (let offset = 0; offset < pixels.data.length; offset += 4) {
      const gray = Math.round(0.2126 * pixels.data[offset] + 0.7152 * pixels.data[offset + 1] + 0.0722 * pixels.data[offset + 2]);
      histogram[gray] += 1;
    }
    const count = width * height;
    const low = percentile(histogram, count, 0.01);
    const high = Math.max(low + 12, percentile(histogram, count, 0.99));
    const normalizedHistogram = new Uint32Array(256);
    for (let offset = 0; offset < pixels.data.length; offset += 4) {
      const gray = Math.round(0.2126 * pixels.data[offset] + 0.7152 * pixels.data[offset + 1] + 0.0722 * pixels.data[offset + 2]);
      const normalized = Math.max(0, Math.min(255, Math.round(((gray - low) * 255) / (high - low))));
      normalizedHistogram[normalized] += 1;
      pixels.data[offset] = normalized;
      pixels.data[offset + 1] = normalized;
      pixels.data[offset + 2] = normalized;
      pixels.data[offset + 3] = 255;
    }
    if (mode === "binary") {
      const threshold = otsuThreshold(normalizedHistogram, count);
      for (let offset = 0; offset < pixels.data.length; offset += 4) {
        const value = pixels.data[offset] >= threshold ? 255 : 0;
        pixels.data[offset] = value;
        pixels.data[offset + 1] = value;
        pixels.data[offset + 2] = value;
      }
    }
    context.putImageData(pixels, 0, 0);
    const result = canvas.toDataURL("image/png");
    canvas.width = 1;
    canvas.height = 1;
    return result;
  } finally {
    image.close();
  }
}

export function ocrLanguages(language) {
  const value = String(language || "").toLowerCase();
  if (value.includes("arab") || value.includes("kurd")) return ["ara", "eng"];
  if (!value || value === "auto") return ["eng", "ara"];
  return ["eng"];
}

export function scoreOcrCandidate(candidate) {
  const text = String(candidate?.text || "").trim();
  if (!text) return 0;
  const confidence = Math.max(0, Math.min(1, Number(candidate?.confidence) || 0));
  const meaningful = (text.match(/[\p{L}\p{N}]/gu) || []).length;
  const suspicious = (text.match(/[�□◇]/g) || []).length;
  const lineCount = text.split(/\r?\n/).map(cleanLine).filter(Boolean).length;
  const coverage = Math.min(1, meaningful / 180);
  const structure = Math.min(1, lineCount / 8);
  const penalty = meaningful ? Math.min(0.35, suspicious / meaningful) : 0.35;
  return Math.max(0, confidence * 0.68 + coverage * 0.22 + structure * 0.1 - penalty);
}

function candidateFromOutput(output, mode, psm) {
  const rawText = String(output?.data?.text || "").trim();
  const lines = rawText.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const confidence = Number.isFinite(output?.data?.confidence) ? Math.max(0, Math.min(1, output.data.confidence / 100)) : 0;
  return { text: rawText, lines, confidence, mode, psm };
}

async function recognize(worker, image, mode, psm, label) {
  if (typeof worker.setParameters === "function") {
    await worker.setParameters({
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
      tessedit_pageseg_mode: String(psm),
    });
  }
  const output = await withTimeout(worker.recognize(image, { rotateAuto: true }), PAGE_TIMEOUT_MS, label);
  return candidateFromOutput(output, mode, psm);
}

async function bestPageCandidate(worker, page, onProgress) {
  const candidates = [];
  const attempts = [
    { mode: "original", psm: 3, label: "original page" },
    { mode: "contrast", psm: 6, label: "contrast-normalized page" },
    { mode: "binary", psm: 11, label: "high-contrast sparse-text page" },
  ];
  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];
    if (index === 1 && scoreOcrCandidate(candidates[0]) >= 0.82 && candidates[0].confidence >= 0.75) break;
    if (index === 2 && Math.max(...candidates.map(scoreOcrCandidate), 0) >= 0.72) break;
    onProgress(`OCR page ${page.page}: preparing ${attempt.label}…`);
    const image = await preprocessPage(page.imageData, attempt.mode);
    onProgress(`OCR page ${page.page}: reading ${attempt.label}…`);
    candidates.push(await recognize(worker, image, attempt.mode, attempt.psm, `OCR page ${page.page}`));
  }
  candidates.sort((left, right) => scoreOcrCandidate(right) - scoreOcrCandidate(left));
  return candidates[0] || { text: "", lines: [], confidence: 0 };
}

async function loadTesseract() {
  if (globalThis.__jangTesseract) return globalThis.__jangTesseract;
  try {
    return await import(OCR_MODULE_PATH);
  } catch (error) {
    throw new Error(`The self-hosted browser OCR module could not load: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function applyBrowserOcr(extraction, language = "auto", onProgress = () => {}) {
  const pages = Array.isArray(extraction?.ocrPages) ? extraction.ocrPages : [];
  if (!pages.length) return extraction;
  const tesseract = await loadTesseract();
  if (typeof tesseract?.createWorker !== "function") throw new Error("The self-hosted browser OCR module loaded without createWorker().");
  let worker;
  try {
    worker = await withTimeout(tesseract.createWorker(ocrLanguages(language), 1, {
      workerPath: OCR_WORKER_PATH,
      langPath: OCR_LANGUAGE_PATH,
      corePath: OCR_CORE_PATH,
      workerBlobURL: false,
      logger: (event) => {
        if (!event?.status) return;
        const percent = Number.isFinite(event.progress) ? ` ${Math.round(event.progress * 100)}%` : "";
        onProgress(`${event.status}${percent}`);
      },
    }), WORKER_START_TIMEOUT_MS, "Browser OCR initialization");
  } catch (error) {
    throw new Error(`The self-hosted browser OCR engine could not initialize: ${error instanceof Error ? error.message : String(error)}`);
  }

  const results = [];
  try {
    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      onProgress(`OCR page ${index + 1} of ${pages.length}…`);
      const best = await bestPageCandidate(worker, page, onProgress);
      const score = scoreOcrCandidate(best);
      const meaningful = (best.text.match(/[\p{L}\p{N}]/gu) || []).length;
      if (!best.lines.length || meaningful < 2 || score < 0.42) {
        throw new Error(`Browser OCR could not read PDF page ${page.page} reliably (confidence ${Math.round(best.confidence * 100)}%, quality ${Math.round(score * 100)}%).`);
      }
      results.push({ page: page.page, text: best.text, lines: best.lines, confidence: best.confidence, quality: score, preprocessing: best.mode, pageSegmentationMode: best.psm });
    }
  } finally {
    await worker?.terminate?.();
  }
  return applyOcrResults(extraction, results, "Browser OCR");
}
