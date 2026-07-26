import "./app.js?v=20260725-file-ready-ack";

window.__jangApplicationModuleLoaded = true;

const pendingFile = window.__jangPendingLectureFile;
const lectureInput = document.querySelector("#lectureFile");

if (pendingFile && lectureInput?.files?.length) {
  window.queueMicrotask(() => {
    lectureInput.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

window.dispatchEvent(new CustomEvent("jang:application-ready"));
