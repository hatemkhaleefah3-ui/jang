import { buildEditableLectureHtml } from "./editable-lecture-html.js";

const $ = (selector) => document.querySelector(selector);
const els = {
  text: $("#lectureText"),
  file: $("#textFile"),
  status: $("#status"),
  preview: $("#preview"),
  previewEmpty: $("#previewEmpty"),
  download: $("#downloadHtml"),
  open: $("#openWindow"),
  save: $("#saveProject"),
  title: $("#previewTitle"),
  savedProjects: $("#savedProjects"),
  fileMeta: $("#fileMeta"),
  textStats: $("#textStats"),
};

let current = null;
const INDEX_KEY = "jang-builder-project-index";

function setStatus(message, error = false) {
  els.status.textContent = message;
  els.status.dataset.tone = error ? "error" : "success";
}

function updateStats() {
  const count = els.text.value.length;
  els.textStats.textContent = `${count.toLocaleString()} character${count === 1 ? "" : "s"}`;
}

function readIndex() {
  try {
    const value = JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeIndex(items) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(items.slice(0, 40)));
}

function projectKey(id) {
  return `jang-builder-project:${id}`;
}

function frameHtml() {
  const doc = els.preview.contentDocument;
  return doc?.documentElement ? `<!DOCTYPE html>\n${doc.documentElement.outerHTML}` : current?.html || "";
}

function projectTitleFromSource(source, document) {
  return document.blocks.find((block) => block.type === "title")?.content?.trim()
    || source.split(/\r?\n/).find((line) => line.trim() && !/^\s*\[/.test(line))?.trim()
    || "Lecture";
}

function setResult(project) {
  current = project;
  els.preview.srcdoc = project.html;
  els.preview.hidden = false;
  els.previewEmpty.hidden = true;
  els.download.disabled = false;
  els.open.disabled = false;
  els.save.disabled = false;
  els.title.textContent = `Preview · ${project.blockCount} source blocks`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

function renderProjects() {
  const projects = readIndex();
  if (!projects.length) {
    els.savedProjects.innerHTML = '<p class="projects-empty">No saved projects yet.</p>';
    return;
  }

  els.savedProjects.innerHTML = projects.map((project) => `
    <article class="saved-project">
      <button type="button" data-open-project="${escapeHtml(project.id)}">
        <strong>${escapeHtml(project.title)}</strong>
        <small>${new Date(project.savedAt).toLocaleString()}</small>
      </button>
      <button type="button" class="delete-project" data-delete-project="${escapeHtml(project.id)}" aria-label="Delete ${escapeHtml(project.title)}">×</button>
    </article>`).join("");

  els.savedProjects.querySelectorAll("[data-open-project]").forEach((button) => {
    button.addEventListener("click", () => {
      const stored = localStorage.getItem(projectKey(button.dataset.openProject));
      if (!stored) return setStatus("The saved project could not be found.", true);
      try {
        const project = JSON.parse(stored);
        els.text.value = project.source || "";
        updateStats();
        setResult(project);
        setStatus(`Opened “${project.title}”.`);
      } catch {
        setStatus("The saved project is damaged and could not be opened.", true);
      }
    });
  });

  els.savedProjects.querySelectorAll("[data-delete-project]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem(projectKey(button.dataset.deleteProject));
      writeIndex(readIndex().filter((item) => item.id !== button.dataset.deleteProject));
      renderProjects();
      setStatus("Saved project deleted.");
    });
  });
}

async function importTextFile(file) {
  if (!file) return;
  const accepted = /\.txt$/i.test(file.name) || file.type === "text/plain" || !file.type;
  if (!accepted) throw new Error("Choose a UTF-8 .txt content text file.");
  if (file.size > 5_000_000) throw new Error("Text files larger than 5 MB are not supported.");

  const value = await file.text();
  els.text.value = value;
  updateStats();
  els.fileMeta.textContent = `${file.name} · ${value.length.toLocaleString()} characters`;
  setStatus(`Imported ${file.name}. It will use the same parser as pasted content text.`);
}

function build() {
  const source = els.text.value;
  if (!source.trim()) throw new Error("Paste content text or choose a .txt content text file first.");

  const projectId = `jang-${Date.now().toString(36)}`;
  const result = buildEditableLectureHtml(source, { projectId });
  const title = projectTitleFromSource(source, result.document);

  setResult({
    id: result.projectId,
    title,
    source,
    metadata: {},
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
  setStatus("Project saved in this browser.");
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

els.text.addEventListener("input", updateStats);
els.file.addEventListener("change", () => importTextFile(els.file.files?.[0]).catch((error) => setStatus(error.message, true)));
$("#clearText").addEventListener("click", () => {
  els.text.value = "";
  els.file.value = "";
  current = null;
  els.preview.removeAttribute("srcdoc");
  els.preview.hidden = true;
  els.previewEmpty.hidden = false;
  els.download.disabled = true;
  els.open.disabled = true;
  els.save.disabled = true;
  els.title.textContent = "Preview";
  els.fileMeta.textContent = "";
  updateStats();
  setStatus("Ready for content text.");
});
$("#buildHtml").addEventListener("click", () => {
  try { build(); } catch (error) { setStatus(error.message || "The lecture could not be built.", true); }
});
els.save.addEventListener("click", saveProject);
els.download.addEventListener("click", downloadHtml);
els.open.addEventListener("click", openEditor);

els.preview.hidden = true;
updateStats();
renderProjects();
