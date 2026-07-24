export function imageEditorScript(filename) {
  return `(() => {
  const deck = document.querySelector(".deck");
  const sheet = document.querySelector("[data-image-sheet]");
  const sheetTitle = document.querySelector("[data-image-sheet-title]");
  const emptyActions = document.querySelector("[data-image-empty-actions]");
  const filledActions = document.querySelector("[data-image-filled-actions]");
  const saveBar = document.querySelector("[data-image-save-bar]");
  const saveStatus = document.querySelector("[data-image-save-status]");
  const outputFilename = ${JSON.stringify(filename)};
  const history = [];
  let activePlaceholder = null;

  const setSaveBar = () => {
    saveBar.hidden = history.length === 0;
    saveStatus.textContent = history.length ? "Unsaved image changes" : "";
  };

  const showError = (message) => {
    const notice = document.createElement("div");
    notice.className = "image-error";
    notice.textContent = message;
    document.body.append(notice);
    setTimeout(() => notice.remove(), 3200);
  };

  const closeSheet = () => {
    sheet.hidden = true;
    activePlaceholder = null;
  };

  const openSheet = (placeholder) => {
    activePlaceholder = placeholder;
    const hasImage = placeholder.classList.contains("has-image");
    sheetTitle.textContent = placeholder.dataset.label || "Image";
    emptyActions.hidden = hasImage;
    filledActions.hidden = !hasImage;
    sheet.hidden = false;
  };

  const remember = () => {
    history.push(deck.innerHTML);
    if (history.length > 30) history.shift();
  };

  const markChanged = (message) => {
    setSaveBar();
    saveStatus.textContent = message;
  };

  const applyImage = (placeholder, source) => {
    const image = placeholder.querySelector("[data-placeholder-image]");
    const empty = placeholder.querySelector("[data-image-empty]");
    image.src = source || "";
    image.hidden = !source;
    empty.hidden = Boolean(source);
    placeholder.classList.toggle("has-image", Boolean(source));
  };

  const renumberSlides = () => {
    const slides = [...deck.querySelectorAll(".slide")];
    const total = slides.length;
    slides.forEach((slide, index) => {
      if (slide.classList.contains("cover-slide")) slide.setAttribute("aria-label", "Cover slide");
      else if (slide.classList.contains("end-slide")) slide.setAttribute("aria-label", "End slide");
      else {
        slide.setAttribute("aria-label", "Slide " + (index + 1) + " of " + total);
        const number = slide.querySelector(".slide-footer span:last-child");
        if (number) number.textContent = String(index + 1).padStart(2, "0");
      }
    });
  };

  const cleanupEmptySlides = () => {
    deck.querySelectorAll(".content-slide").forEach((slide) => {
      const body = slide.querySelector(".slide-body");
      if (body && !body.children.length) slide.remove();
    });
    renumberSlides();
  };

  const serialize = () => {
    const clone = document.documentElement.cloneNode(true);
    const clonedSheet = clone.querySelector("[data-image-sheet]");
    const clonedBar = clone.querySelector("[data-image-save-bar]");
    if (clonedSheet) clonedSheet.hidden = true;
    if (clonedBar) clonedBar.hidden = true;
    clone.querySelectorAll("[data-image-input]").forEach((input) => input.removeAttribute("value"));
    clone.querySelectorAll(".image-error").forEach((notice) => notice.remove());
    return "<!doctype html>\\n" + clone.outerHTML;
  };

  const downloadBlob = (blob) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = outputFilename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const saveHtml = async () => {
    closeSheet();
    const blob = new Blob([serialize()], { type: "text/html;charset=utf-8" });
    try {
      if ("showSaveFilePicker" in window) {
        const handle = await window.showSaveFilePicker({
          suggestedName: outputFilename,
          types: [{ description: "HTML file", accept: { "text/html": [".html"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        downloadBlob(blob);
      }
      history.length = 0;
      setSaveBar();
    } catch (error) {
      if (error && error.name === "AbortError") return;
      downloadBlob(blob);
      history.length = 0;
      setSaveBar();
    }
  };

  document.addEventListener("click", (event) => {
    const surface = event.target.closest("[data-image-surface]");
    if (surface) {
      openSheet(surface.closest("[data-image-placeholder]"));
      return;
    }

    const action = event.target.closest("[data-image-action]")?.dataset.imageAction;
    if (action === "close" || event.target === sheet) {
      closeSheet();
      return;
    }
    if (!action || !activePlaceholder) return;

    if (action === "import" || action === "change") {
      const input = activePlaceholder.querySelector("[data-image-input]");
      closeSheet();
      input.click();
      return;
    }
    if (action === "remove-image") {
      remember();
      applyImage(activePlaceholder, "");
      closeSheet();
      markChanged("Image removed. Save or cancel the last action.");
      return;
    }
    if (action === "remove-placeholder") {
      remember();
      activePlaceholder.remove();
      cleanupEmptySlides();
      closeSheet();
      markChanged("Placeholder removed. Save or cancel the last action.");
    }
  });

  document.addEventListener("change", (event) => {
    const input = event.target.closest("[data-image-input]");
    if (!input) return;
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("Choose an image file.");
      return;
    }
    if (file.size > 15000000) {
      showError("Choose an image smaller than 15 MB.");
      return;
    }

    const placeholder = input.closest("[data-image-placeholder]");
    const reader = new FileReader();
    reader.onload = () => {
      remember();
      applyImage(placeholder, reader.result);
      markChanged("Image added. Save the HTML file or cancel the last action.");
    };
    reader.onerror = () => showError("The image could not be read.");
    reader.readAsDataURL(file);
  });

  document.querySelector("[data-image-cancel]").addEventListener("click", () => {
    if (!history.length) return;
    deck.innerHTML = history.pop();
    renumberSlides();
    closeSheet();
    setSaveBar();
    if (history.length) saveStatus.textContent = "Last action cancelled. Earlier unsaved changes remain.";
  });

  document.querySelector("[data-image-save]").addEventListener("click", saveHtml);
  setSaveBar();
})();`;
}
