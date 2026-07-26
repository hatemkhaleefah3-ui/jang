import { readFile, writeFile } from "node:fs/promises";

async function replaceRequired(path, search, replacement, description) {
  const source = await readFile(path, "utf8");
  if (!source.includes(search)) throw new Error(`Could not find ${description} in ${path}`);
  await writeFile(path, source.replace(search, replacement), "utf8");
}

function dedent(value) {
  const lines = String(value).replace(/^\n/, "").split("\n");
  const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^\s*/)?.[0].length ?? 0);
  const indentation = indents.length ? Math.min(...indents) : 0;
  return lines.map((line) => line.slice(indentation)).join("\n");
}

await replaceRequired(
  "functions/api/extract.js",
  'diagramRows: { type: "array", items: { type: "array", items: { type: "string" } } },',
  'diagramRows: { type: "array", items: { type: "array", items: { type: "string" } }, description: "Concise ordered pathway nodes. Use this whenever the source explicitly supports a multi-step conversion, mechanism, cascade, or causal chain." },',
  "diagramRows schema description",
);

const oldPathwayPrompt = dedent(`
  PATHWAY-DIAGRAM SELECTION:
  19. Use diagramType metabolic for enzyme-catalyzed substrate-to-product chains such as glycolysis.
  20. Use diagramType signal-transduction for extracellular signals, receptors, intracellular cascades, activation, inhibition, and binding events.
  21. Use diagramType gene-regulatory for DNA, RNA, transcription factors, and gene-expression control relationships.
  22. Use diagramType disease-pharmacology for disrupted processes, disease mechanisms, drug targets, and therapeutic intervention points.
  23. Use diagramType generic for other supported processes or relationships. Populate diagramRows in reading order. Create a diagram only when the source supports the relationships.

  IMPORTANT IMAGE POSITIONS:
  24. Do not return image bytes. Create image blocks only for important source visuals that materially support understanding and should be manually imported by the user.
  25. Give every important image a unique slotId, a unique simple content-specific label, a one-sentence description, important=true, fit, preferredAspect, orientation, sourceReference, and sourceReferences.
  26. Use orientation transverse for cross-sectional/anatomical transverse views and longitudinal for lengthwise views. Use portrait or landscape for ordinary orientation, and automatic only when the source does not establish it.
  27. Use contain for pathways, charts, microscopy, radiology, anatomy labels, and diagrams where cropping could remove information. Use cover only for photographs that can crop safely.
  28. Place each image block at the logical point in the reconstructed lecture near the content it supports.

  AUDIT BEFORE RETURNING:
  29. Count the source pages or slides and return sourcePageOrSlideCount.
  30. Return coveredSourceReferences for all represented locations and unmappedSourceReferences for any location whose meaningful content could not be mapped. Do not hide omissions.
  31. Return warnings for ambiguous, unreadable, contradictory, or uncertain source content.
  32. Verify that every source page or slide containing meaningful content is represented by at least one traceable block or explicitly listed as unmapped.
  33. Return only JSON matching the supplied schema. Do not return markdown, HTML, CSS, coordinates, commentary, or unsupported fields.
`);

const newPathwayPrompt = dedent(`
  PATHWAY-DIAGRAM SELECTION:
  19. Actively inspect every source page or slide for explicit process relationships, even when they are written as prose, bullets, numbered steps, or arrow notation rather than already drawn as a pathway.
  20. Treat content as a pathway candidate when it contains at least three linked entities, at least two conversions or ordered mechanism steps, arrows, or relationship language such as converted to, forms, produces, via, catalyzed by, activates, inhibits, binds, phosphorylates, translocates, or leads to.
  21. When those relationships are supported, include one diagram block in addition to the explanatory paragraph or list. Do not leave a supported biochemical, signaling, gene-regulatory, or disease mechanism only as bullets or numbered prose.
  22. Use concise node labels in diagramRows. Keep full explanations, enzyme requirements, cofactors, clinical details, and qualifications in adjacent text blocks so the diagram remains readable without losing content.
  23. Use diagramType metabolic for enzyme-catalyzed substrate-to-product chains such as glycolysis, amino-acid conversion, biosynthesis, and degradation.
  24. Use diagramType signal-transduction for extracellular signals, receptors, intracellular cascades, activation, inhibition, binding, phosphorylation, and translocation events.
  25. Use diagramType gene-regulatory for DNA, RNA, transcription factors, epigenetic control, and gene-expression relationships.
  26. Use diagramType disease-pharmacology for disrupted processes, disease mechanisms, drug targets, and therapeutic intervention points.
  27. Use diagramType generic for other supported sequential or causal relationships. Populate diagramRows in reading order.
  28. Never invent missing links. If fewer than three entities are linked or the order is ambiguous, preserve the content as text instead of forcing a diagram.
  29. Before returning, audit every slide containing explicit linked steps and ensure it has a diagram block; when a clear candidate is omitted because the source is ambiguous, record that reason in warnings.

  IMPORTANT IMAGE POSITIONS:
  30. Do not return image bytes. Create image blocks only for important source visuals that materially support understanding and should be manually imported by the user.
  31. Give every important image a unique slotId, a unique simple content-specific label, a one-sentence description, important=true, fit, preferredAspect, orientation, sourceReference, and sourceReferences.
  32. Use orientation transverse for cross-sectional/anatomical transverse views and longitudinal for lengthwise views. Use portrait or landscape for ordinary orientation, and automatic only when the source does not establish it.
  33. Use contain for pathways, charts, microscopy, radiology, anatomy labels, and diagrams where cropping could remove information. Use cover only for photographs that can crop safely.
  34. Place each image block at the logical point in the reconstructed lecture near the content it supports.

  AUDIT BEFORE RETURNING:
  35. Count the source pages or slides and return sourcePageOrSlideCount.
  36. Return coveredSourceReferences for all represented locations and unmappedSourceReferences for any location whose meaningful content could not be mapped. Do not hide omissions.
  37. Return warnings for ambiguous, unreadable, contradictory, or uncertain source content.
  38. Verify that every source page or slide containing meaningful content is represented by at least one traceable block or explicitly listed as unmapped.
  39. Return only JSON matching the supplied schema. Do not return markdown, HTML, CSS, coordinates, commentary, or unsupported fields.
`);

await replaceRequired("functions/api/extract.js", oldPathwayPrompt, newPathwayPrompt, "pathway extraction prompt");

const oldSelectionHandler = dedent(`
  function handleLectureFileSelection(event) {
    const input = event.currentTarget;
    const file = selectedFileFromInput(input);

    // Some browsers can emit an empty input/change event while the native picker
    // is closing. Never erase a valid selection because of that transient event.
    if (!file) {
      if (!selectedFile) setStatus("No file was selected. Choose a PDF or PPTX lecture.", "error");
      return;
    }

    const signature = lectureFileSignature(file);
    if (selectedFile && signature === selectedFileSignature) return;

    try {
      selectLectureFile(file);
    } catch (error) {
      clearLectureSelection(error instanceof Error ? error.message : "The selected file could not be imported.");
    }
  }
`);

const newSelectionHandler = dedent(`
  function scheduleAfterPickerClose(callback) {
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(callback);
    } else {
      window.setTimeout(callback, 0);
    }
  }

  function handleLectureFileSelection(event) {
    const input = event.currentTarget;
    const file = selectedFileFromInput(input);

    // Some browsers can emit an empty change event while the native picker is
    // closing. Return immediately so the sheet can dismiss before DOM work.
    if (!file) {
      if (!selectedFile) setStatus("No file was selected. Choose a PDF or PPTX lecture.", "error");
      return;
    }

    const signature = lectureFileSignature(file);
    if (selectedFile && signature === selectedFileSignature) return;

    scheduleAfterPickerClose(() => {
      const currentFile = selectedFileFromInput(input);
      if (!currentFile || lectureFileSignature(currentFile) !== signature) return;
      try {
        selectLectureFile(currentFile);
      } catch (error) {
        clearLectureSelection(error instanceof Error ? error.message : "The selected file could not be imported.");
      }
    });
  }
`);

await replaceRequired("app.js", oldSelectionHandler, newSelectionHandler, "lecture selection handler");
await replaceRequired(
  "app.js",
  'fileInput.addEventListener("input", handleLectureFileSelection);\nfileInput.addEventListener("change", handleLectureFileSelection);',
  'fileInput.addEventListener("change", handleLectureFileSelection);',
  "single file selection listener",
);

await replaceRequired(
  "file-picker-bootstrap.js",
  "  var selectedAction = null;\n",
  "  var selectedAction = null;\n  var bootstrapSelectionHandler = null;\n",
  "bootstrap handler state",
);
await replaceRequired(
  "file-picker-bootstrap.js",
  dedent(`
      function markApplicationReady() {
        applicationState = "ready";
        window.__jangApplicationModuleLoaded = true;
      }
  `),
  dedent(`
      function markApplicationReady() {
        applicationState = "ready";
        window.__jangApplicationModuleLoaded = true;
        if (selectedInput && bootstrapSelectionHandler) {
          selectedInput.removeEventListener("change", bootstrapSelectionHandler);
          bootstrapSelectionHandler = null;
        }
      }
  `),
  "bootstrap listener cleanup",
);
await replaceRequired(
  "file-picker-bootstrap.js",
  '    input.addEventListener("input", handleSelection);\n    input.addEventListener("change", handleSelection);',
  '    bootstrapSelectionHandler = handleSelection;\n    if (applicationState !== "ready") input.addEventListener("change", bootstrapSelectionHandler);',
  "bootstrap single listener",
);
await replaceRequired(
  "app-loader.js",
  'lectureInput.dispatchEvent(new Event("input", { bubbles: true }));',
  'lectureInput.dispatchEvent(new Event("change", { bubbles: true }));',
  "pending file handoff event",
);

await replaceRequired(
  "tests/unit/extract-function.test.mjs",
  "  assert.match(extractionPrompt, /diagramType metabolic/i);\n",
  "  assert.match(extractionPrompt, /diagramType metabolic/i);\n  assert.match(extractionPrompt, /at least three linked entities/i);\n  assert.match(extractionPrompt, /in addition to the explanatory paragraph or list/i);\n  assert.match(extractionPrompt, /converted to.*activates.*inhibits/is);\n  assert.match(extractionPrompt, /audit every slide containing explicit linked steps/i);\n",
  "pathway prompt assertions",
);

await replaceRequired(
  "tests/unit/file-picker.test.mjs",
  dedent(`
      const [html, app, build, headers] = await Promise.all([
        readFile(new URL("../../index.html", import.meta.url), "utf8"),
        readFile(new URL("../../app.js", import.meta.url), "utf8"),
        readFile(new URL("../../scripts/build.mjs", import.meta.url), "utf8"),
        readFile(new URL("../../_headers", import.meta.url), "utf8"),
      ]);
  `),
  dedent(`
      const [html, app, bootstrap, loader, build, headers] = await Promise.all([
        readFile(new URL("../../index.html", import.meta.url), "utf8"),
        readFile(new URL("../../app.js", import.meta.url), "utf8"),
        readFile(new URL("../../file-picker-bootstrap.js", import.meta.url), "utf8"),
        readFile(new URL("../../app-loader.js", import.meta.url), "utf8"),
        readFile(new URL("../../scripts/build.mjs", import.meta.url), "utf8"),
        readFile(new URL("../../_headers", import.meta.url), "utf8"),
      ]);
  `),
  "picker test inputs",
);
await replaceRequired(
  "tests/unit/file-picker.test.mjs",
  dedent(`
      assert.match(app, /addEventListener\\("input", handleLectureFileSelection\\)/);
      assert.match(app, /addEventListener\\("change", handleLectureFileSelection\\)/);
  `),
  dedent(`
      assert.doesNotMatch(app, /addEventListener\\("input", handleLectureFileSelection\\)/);
      assert.match(app, /requestAnimationFrame/);
      assert.match(app, /addEventListener\\("change", handleLectureFileSelection\\)/);
      assert.doesNotMatch(bootstrap, /addEventListener\\("input"/);
      assert.match(bootstrap, /removeEventListener\\("change", bootstrapSelectionHandler\\)/);
      assert.match(loader, /new Event\\("change"/);
  `),
  "picker listener assertions",
);

await replaceRequired("tests/fixtures/render-plan-lecture.mjs", 'title: "Overview",', 'title: "Lecture Overview: Amino Acid Metabolism",', "long overview title fixture");
await replaceRequired(
  "tests/fixtures/render-plan-lecture.mjs",
  'introduction: "A realistic two-section lecture with text, images, tables, and diagrams.",',
  'introduction: "This lecture provides a comprehensive study of metabolic pathways, biosynthetic functions, and associated clinical disorders for glycine, phenylalanine, and tyrosine.",',
  "overview introduction fixture",
);
await replaceRequired("tests/fixtures/render-plan-lecture.mjs", 'sectionTitle: "Phenylalanine and tyrosine",', 'sectionTitle: "Phenylalanine and Tyrosine Metabolism",', "wrapped section title fixture");
await replaceRequired("tests/fixtures/render-plan-lecture.mjs", 'slideTitle: "Aromatic amino acid pathway",', 'slideTitle: "Biosynthesis of Specialized Products from Tyrosine",', "wrapped slide title fixture");
await replaceRequired(
  "tests/fixtures/render-plan-lecture.mjs",
  'endNote: "Questions and clinical discussion",',
  'endNote: "Complete lecture reconstruction covering Glycine, Phenylalanine, and Tyrosine metabolism and clinical correlates.",',
  "wrapped ending title fixture",
);

const oldVersion = "20260726-immutable-render-plan";
const newVersion = "20260726-pathway-picker-title-polish";
await replaceRequired("scripts/build.mjs", `const assetVersion = "${oldVersion}";`, `const assetVersion = "${newVersion}";`, "build asset version");
await replaceRequired("tests/unit/csp-scan.test.mjs", `const assetVersion = "${oldVersion}";`, `const assetVersion = "${newVersion}";`, "CSP asset version");

console.log("Applied pathway, picker, and title-spacing refinements.");
