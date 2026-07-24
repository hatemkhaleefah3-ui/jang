import { buildLectureHtml } from "./lecture-html.js";

const text = document.querySelector("#lectureText");
const file = document.querySelector("#textFile");
const fileMeta = document.querySelector("#fileMeta");
const stats = document.querySelector("#textStats");
const button = document.querySelector("#actionButton");
const label = document.querySelector("#actionLabel");
const status = document.querySelector("#status");

let state = "empty";
let result = null;

function setStatus(message, tone = "") {
  status.textContent = message;
  status.dataset.tone = tone;
}

function updateInputState() {
  const count = text.value.length;
  stats.textContent = `${count.toLocaleString()} character${count === 1 ? "" : "s"}`;
  if (state === "building" || state === "ready-download") return;
  state = count && text.value.trim() ? "ready-build" : "empty";
  button.disabled = state === "empty";
  button.dataset.state = state;
  label.textContent = "Build HTML";
  if (state === "empty") setStatus("Paste lecture content or import a text file to begin.");
  else setStatus("Ready to build the lecture HTML file.");
}

async function importFile(selected) {
  if (!selected) return;
  const accepted = /\.(txt|ptx)$/i.test(selected.name) || selected.type === "text/plain" || !selected.type;
  if (!accepted) throw new Error("Choose a plain-text .txt or .ptx file.");
  if (selected.size > 10_000_000) throw new Error("Text files larger than 10 MB are not supported.");
  text.value = await selected.text();
  fileMeta.textContent = `${selected.name} · ${text.value.length.toLocaleString()} characters`;
  result = null;
  state = "ready-build";
  updateInputState();
}

function download() {
  if (!result) return;
  const blob = new Blob([result.html], { type: "text/html;charset=utf-8" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = result.filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
  setStatus(`Downloaded ${result.filename}.`, "success");
}

async function build() {
  state = "building";
  button.disabled = false;
  button.dataset.state = state;
  label.textContent = "Reload";
  setStatus("Building the responsive 16:9 lecture slides…");
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 120)));
  result = buildLectureHtml(text.value);
  state = "ready-download";
  button.dataset.state = state;
  label.textContent = "Download HTML";
  setStatus(`Built ${result.slideCount} slides. The HTML file is ready to download.`, "success");
}

text.addEventListener("input", () => {
  if (state === "ready-download") {
    result = null;
    state = "ready-build";
  }
  updateInputState();
});
file.addEventListener("change", () => importFile(file.files?.[0]).catch((error) => setStatus(error.message, "error")));
button.addEventListener("click", () => {
  if (state === "building") return location.reload();
  if (state === "ready-download") return download();
  build().catch((error) => {
    result = null;
    state = "ready-build";
    button.dataset.state = state;
    label.textContent = "Build HTML";
    setStatus(error.message || "The lecture could not be built.", "error");
  });
});

updateInputState();
