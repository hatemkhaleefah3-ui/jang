import { buildLectureHtml } from "./lecture-html.js";

const text = document.querySelector("#lectureText");
const file = document.querySelector("#textFile");
const action = document.querySelector("#actionButton");
const actionLabel = document.querySelector("#actionLabel");
const status = document.querySelector("#status");
const textMeta = document.querySelector("#textMeta");

let generated = null;
let state = "idle";

function setStatus(message, tone = "") {
  status.textContent = message;
  status.dataset.tone = tone;
}

function setState(nextState) {
  state = nextState;
  action.dataset.state = nextState;
  action.disabled = nextState === "idle";

  const labels = {
    idle: "Build HTML",
    ready: "Build HTML",
    building: "Reload",
    complete: "Download HTML",
  };
  actionLabel.textContent = labels[nextState];
}

function updateInputState() {
  const count = text.value.length;
  textMeta.textContent = `${count.toLocaleString()} character${count === 1 ? "" : "s"}`;
  if (state === "building") return;
  generated = null;
  setState(text.value.trim() ? "ready" : "idle");
  setStatus(text.value.trim() ? "Ready to build the HTML lecture." : "Paste text or import a file to begin.");
}

async function importTextFile(selectedFile) {
  if (!selectedFile) return;
  const validType = /\.(?:txt|text|md)$/i.test(selectedFile.name) || selectedFile.type.startsWith("text/") || !selectedFile.type;
  if (!validType) throw new Error("Choose a UTF-8 text file (.txt, .text, or .md).");
  if (selectedFile.size > 8_000_000) throw new Error("Text files larger than 8 MB are not supported.");

  text.value = await selectedFile.text();
  updateInputState();
  setStatus(`Imported ${selectedFile.name}. Ready to build.`, "success");
}

function downloadGeneratedFile() {
  if (!generated) return;
  const blob = new Blob([generated.html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = generated.filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus(`Downloaded ${generated.filename}.`, "success");
}

async function build() {
  const source = text.value;
  if (!source.trim()) return;

  setState("building");
  setStatus("Building the responsive lecture HTML file…");

  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  try {
    generated = buildLectureHtml(source);
    setState("complete");
    setStatus(`Built ${generated.slideCount} slides. The file is ready to download.`, "success");
  } catch (error) {
    generated = null;
    setState("ready");
    setStatus(error?.message || "The lecture could not be built.", "error");
  }
}

text.addEventListener("input", updateInputState);
file.addEventListener("change", () => {
  importTextFile(file.files?.[0]).catch((error) => setStatus(error.message, "error"));
});

action.addEventListener("click", () => {
  if (state === "building") {
    window.location.reload();
    return;
  }
  if (state === "complete") {
    downloadGeneratedFile();
    return;
  }
  build();
});

updateInputState();
