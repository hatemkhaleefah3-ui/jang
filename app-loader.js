import "./app.js";

window.__jangApplicationModuleLoaded = true;

const pendingFile = window.__jangPendingLectureFile;
const lectureInput = document.querySelector("#lectureFile");

if (pendingFile && lectureInput?.files?.length) {
  queueMicrotask(() => {
    lectureInput.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

window.dispatchEvent(new CustomEvent("jang:application-ready"));
