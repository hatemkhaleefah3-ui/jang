import { buildEditableLectureHtml } from "./editable-lecture-html.js";

const $ = (selector) => document.querySelector(selector);
const els = {
  text: $("#lectureText"), file: $("#textFile"), status: $("#status"), preview: $("#preview"),
  download: $("#downloadHtml"), open: $("#openWindow"), save: $("#saveProject"), title: $("#previewTitle"),
  projectTitle: $("#projectTitle"), courseCode: $("#courseCode"), lectureLabel: $("#lectureLabel"),
  instructor: $("#instructor"), language: $("#language"), savedProjects: $("#savedProjects"), fileMeta: $("#fileMeta"),
};

let current = null;
const INDEX_KEY = "jang-builder-project-index";

function setStatus(message, error = false) {
  els.status.textContent = message;
  els.status.dataset.tone = error ? "error" : "success";
}

function readIndex() {
  try { return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]"); } catch { return []; }
}

function writeIndex(items) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(items.slice(0, 40)));
}

function projectKey(id) { return `jang-builder-project:${id}`; }

function frameHtml() {
  const doc = els.preview.contentDocument;
  return doc?.documentElement ? `<!DOCTYPE html>\n${doc.documentElement.outerHTML}` : current?.html || "";
}

function metadata() {
  return {
    title: els.projectTitle.value.trim(),
    courseCode: els.courseCode.value.trim(),
    lectureLabel: els.lectureLabel.value.trim(),
    instructor: els.instructor.value.trim(),
    language: els.language.value,
    direction: /^(ar|ku)/i.test(els.language.value) ? "rtl" : "ltr",
  };
}

function setResult(project) {
  current = project;
  els.preview.srcdoc = project.html;
  els.download.disabled = false;
  els.open.disabled = false;
  els.save.disabled = false;
  els.title.textContent = `Preview · ${project.blockCount} source blocks`;
}

function renderProjects() {
  const projects = readIndex();
  if (!projects.length) {
    els.savedProjects.innerHTML = "<p>No saved projects in this browser.</p>";
    return;
  }
  els.savedProjects.innerHTML = projects.map((project) => `<article class="saved-project"><button type="button" data-open-project="${project.id}"><strong>${project.title}</strong><small>${new Date(project.savedAt).toLocaleString()}</small></button><button type="button" class="delete-project" data-delete-project="${project.id}" aria-label="Delete ${project.title}">×</button></article>`).join("");
  els.savedProjects.querySelectorAll("[data-open-project]").forEach((button) => {
    button.onclick = () => {
      const stored = localStorage.getItem(projectKey(button.dataset.openProject));
      if (!stored) return setStatus("The saved project could not be found.", true);
      const project = JSON.parse(stored);
      els.text.value = project.source;
      els.projectTitle.value = project.metadata.title || "";
      els.courseCode.value = project.metadata.courseCode || "";
      els.lectureLabel.value = project.metadata.lectureLabel || "";
      els.instructor.value = project.metadata.instructor || "";
      els.language.value = project.metadata.language || "en";
      setResult(project);
      setStatus(`Opened “${project.title}”.`);
    };
  });
  els.savedProjects.querySelectorAll("[data-delete-project]").forEach((button) => {
    button.onclick = () => {
      localStorage.removeItem(projectKey(button.dataset.deleteProject));
      writeIndex(readIndex().filter((item) => item.id !== button.dataset.deleteProject));
      renderProjects();
      setStatus("Saved project deleted.");
    };
  });
}

async function importTextFile(file) {
  if (!file) return;
  const accepted = /\.(?:txt|md|text)$/i.test(file.name) || file.type === "text/plain" || file.type === "text/markdown" || !file.type;
  if (!accepted) throw new Error("Import a UTF-8 .txt or .md text file.");
  if (file.size > 5_000_000) throw new Error("Text files larger than 5 MB are not supported.");
  const value = await file.text();
  els.text.value = value;
  els.fileMeta.textContent = `${file.name} · ${value.length.toLocaleString()} characters`;
  if (!els.projectTitle.value) els.projectTitle.value = file.name.replace(/\.[^.]+$/, "");
  setStatus(`Imported ${file.name}. It will use exactly the same parser as pasted text.`);
}

function build() {
  if (!els.text.value) throw new Error("Paste lecture text or import a text file first.");
  const projectId = `jang-${Date.now().toString(36)}`;
  const result = buildEditableLectureHtml(els.text.value, { ...metadata(), projectId });
  const title = metadata().title || result.document.blocks.find((block) => block.type === "title")?.content || "Lecture";
  setResult({
    id: result.projectId,
    title,
    source: els.text.value,
    metadata: metadata(),
    html: result.html,
    blockCount: result.document.blocks.length,
    verification: result.verification,
    savedAt: new Date().toISOString(),
  });
  setStatus(`Verified ${result.verification.rendered} source blocks in exact order. No block was changed, omitted, duplicated, or reordered.`);
}

function saveProject() {
  if (!current) return;
  current.html = frameHtml();
  current.savedAt = new Date().toISOString();
  localStorage.setItem(projectKey(current.id), JSON.stringify(current));
  const index = readIndex().filter((item) => item.id !== current.id);
  index.unshift({ id: current.id, title: current.title, savedAt: current.savedAt });
  writeIndex(index);
  renderProjects();
  setStatus("Project saved in this browser and can be reopened from the project list.");
}

function downloadHtml() {
  if (!current) return;
  const html = frameHtml();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${current.id}.html`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

function openEditor() {
  if (!current) return;
  const win = window.open("", "_blank");
  if (!win) return setStatus("The browser blocked the editor window.", true);
  win.document.open();
  win.document.write(frameHtml());
  win.document.close();
}

els.file.addEventListener("change", () => importTextFile(els.file.files?.[0]).catch((error) => setStatus(error.message, true)));
$("#clearText").addEventListener("click", () => {
  els.text.value = ""; current = null; els.preview.removeAttribute("srcdoc");
  els.download.disabled = true; els.open.disabled = true; els.save.disabled = true; els.title.textContent = "Preview"; els.fileMeta.textContent = ""; setStatus("Ready.");
});
$("#buildHtml").addEventListener("click", () => { try { build(); } catch (error) { setStatus(error.message || "The lecture could not be built.", true); } });
els.save.addEventListener("click", saveProject);
els.download.addEventListener("click", downloadHtml);
els.open.addEventListener("click", openEditor);
renderProjects();
