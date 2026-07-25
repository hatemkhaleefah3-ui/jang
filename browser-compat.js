(function () {
  "use strict";

  function rememberRuntimeError(error) {
    var message = "";
    if (error && typeof error.message === "string") message = error.message;
    else if (typeof error === "string") message = error;
    if (message) window.__jangLastRuntimeError = message;
  }

  if (typeof Element !== "undefined" && !Element.prototype.replaceChildren) {
    Element.prototype.replaceChildren = function () {
      while (this.firstChild) this.removeChild(this.firstChild);
      for (var index = 0; index < arguments.length; index += 1) {
        var child = arguments[index];
        this.appendChild(child && typeof child === "object" ? child : document.createTextNode(String(child)));
      }
    };
  }

  if (typeof window.queueMicrotask !== "function") {
    window.queueMicrotask = function (callback) {
      Promise.resolve()
        .then(callback)
        .catch(function (error) {
          window.setTimeout(function () { throw error; }, 0);
        });
    };
  }

  if (typeof window.CustomEvent !== "function" && typeof document.createEvent === "function") {
    window.CustomEvent = function (type, parameters) {
      var event = document.createEvent("CustomEvent");
      var detail = parameters && Object.prototype.hasOwnProperty.call(parameters, "detail")
        ? parameters.detail
        : null;
      event.initCustomEvent(type, Boolean(parameters && parameters.bubbles), Boolean(parameters && parameters.cancelable), detail);
      return event;
    };
  }

  window.addEventListener("error", function (event) {
    rememberRuntimeError(event && (event.error || event.message));
  });

  window.addEventListener("unhandledrejection", function (event) {
    rememberRuntimeError(event && event.reason);
  });

  function installSelectionRecovery() {
    var input = document.getElementById("lectureFile");
    var action = document.getElementById("actionButton");
    var status = document.getElementById("status");
    var recoveryPending = false;

    if (!input || !action || !status) return;

    function reportFailure() {
      if (!input.files || !input.files.length || !action.disabled) return;
      var detail = window.__jangLastRuntimeError
        ? " Browser error: " + window.__jangLastRuntimeError
        : "";
      status.textContent = "The file is selected, but the application could not activate the Build button." + detail;
      status.dataset.tone = "error";
    }

    function recoverSelection() {
      if (recoveryPending || !window.__jangApplicationModuleLoaded) return;
      if (!input.files || !input.files.length || !action.disabled) return;

      recoveryPending = true;
      window.setTimeout(function () {
        recoveryPending = false;
        if (!input.files || !input.files.length || !action.disabled) return;

        try {
          input.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (error) {
          rememberRuntimeError(error);
        }

        window.setTimeout(reportFailure, 0);
      }, 0);
    }

    input.addEventListener("input", recoverSelection);
    input.addEventListener("change", recoverSelection);
    window.addEventListener("jang:application-ready", recoverSelection);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installSelectionRecovery, { once: true });
  } else {
    installSelectionRecovery();
  }
}());
