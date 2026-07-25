(() => {
  function selectedInput() {
    return document.querySelector("#lectureFile");
  }

  function recoverSelection() {
    const input = selectedInput();
    if (!input?.files?.length) return;

    // Some mobile and embedded browsers return focus to the page without
    // delivering the native change event. Re-dispatching it lets the main
    // application consume the FileList that the browser already populated.
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function scheduleRecovery() {
    window.setTimeout(recoverSelection, 150);
  }

  window.addEventListener("focus", scheduleRecovery);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") scheduleRecovery();
  });
  window.addEventListener("pageshow", scheduleRecovery);
})();
