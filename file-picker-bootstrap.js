(function () {
  "use strict";

  var FILE_LIMITS = {
    pdf: 18000000,
    pptx: 50000000,
  };
  var lastSignature = "";
  var applicationState = window.__jangApplicationModuleLoaded ? "ready" : "loading";
  var selectedInput = null;
  var selectedStatus = null;

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function fileExtension(file) {
    var name = file && typeof file.name === "string" ? file.name.trim() : "";
    var parts = name.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  }

  function fileSignature(file) {
    return [file.name || "", Number(file.size) || 0, Number(file.lastModified) || 0].join(":");
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < Math.pow(1024, 2)) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / Math.pow(1024, 2)).toFixed(1) + " MB";
  }

  function validate(file) {
    var extension = fileExtension(file);
    if (!extension || !hasOwn(FILE_LIMITS, extension)) {
      throw new Error("Choose a PDF or PPTX lecture file.");
    }

    var size = Number(file.size);
    if (!Number.isFinite(size) || size < 0) {
      throw new Error("The selected file size could not be read.");
    }

    if (size > FILE_LIMITS[extension]) {
      throw new Error(extension === "pdf"
        ? "PDF files must be 18 MB or smaller."
        : "PPTX files must be 50 MB or smaller.");
    }

    return extension;
  }

  function setStatus(message, tone) {
    if (!selectedStatus) return;
    selectedStatus.textContent = message;
    selectedStatus.dataset.tone = tone || "";
  }

  function markApplicationReady() {
    applicationState = "ready";
    window.__jangApplicationModuleLoaded = true;
  }

  function markApplicationFailed() {
    applicationState = "failed";
    window.__jangApplicationModuleFailed = true;
    if (selectedInput && selectedInput.files && selectedInput.files.length) {
      setStatus("The file remains selected, but the application module failed to load. Redeploy the latest commit and check the browser console.", "error");
    }
  }

  function watchApplicationModule() {
    if (window.addEventListener) {
      window.addEventListener("jang:application-ready", markApplicationReady, { once: true });
    }

    var moduleScript = document.querySelector
      ? document.querySelector("script[data-jang-application]")
      : null;

    if (!moduleScript) {
      applicationState = "missing";
      return;
    }

    moduleScript.addEventListener("load", markApplicationReady, { once: true });
    moduleScript.addEventListener("error", markApplicationFailed, { once: true });
  }

  function initialize() {
    var input = document.getElementById("lectureFile");
    var buttonText = document.getElementById("fileButtonText");
    var card = document.getElementById("fileCard");
    var typeMark = document.getElementById("fileTypeMark");
    var fileName = document.getElementById("fileName");
    var fileMeta = document.getElementById("fileMeta");
    var status = document.getElementById("status");

    if (!input || !buttonText || !card || !fileName || !fileMeta || !status) return;

    selectedInput = input;
    selectedStatus = status;

    function handleSelection() {
      var file = input.files && input.files.length ? input.files[0] : null;
      if (!file) return;

      var signature = fileSignature(file);
      if (signature === lastSignature) return;

      try {
        var extension = validate(file);
        lastSignature = signature;
        window.__jangPendingLectureFile = file;
        card.hidden = false;
        if (typeMark) typeMark.textContent = extension.toUpperCase();
        fileName.textContent = file.name;
        fileMeta.textContent = extension.toUpperCase() + " · " + formatBytes(file.size);
        buttonText.textContent = "Choose another file";

        if (applicationState === "failed") {
          setStatus("The file remains selected, but the application module failed to load. Redeploy the latest commit and check the browser console.", "error");
        } else if (applicationState === "missing") {
          setStatus("The file remains selected, but the application loader is missing from this deployment.", "error");
        } else if (applicationState === "ready") {
          setStatus(file.name + " is selected and ready for processing.", "success");
        } else {
          setStatus(file.name + " is selected. Finishing application loading…", "success");
          window.setTimeout(function () {
            if (applicationState === "loading" && input.files && input.files.length) {
              setStatus("The file is still selected. The application is taking longer than expected to load…", "");
            }
          }, 15000);
        }
      } catch (error) {
        lastSignature = "";
        window.__jangPendingLectureFile = null;
        input.value = "";
        card.hidden = true;
        if (typeMark) typeMark.textContent = "DOC";
        buttonText.textContent = "Choose PDF or PPTX";
        setStatus(error && error.message ? error.message : "The selected file could not be imported.", "error");
      }
    }

    input.addEventListener("input", handleSelection);
    input.addEventListener("change", handleSelection);
    window.__jangPickerBootstrapReady = true;
  }

  watchApplicationModule();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
}());
