# Jang — Gemini Lecture PPTX Builder

Jang turns an imported PDF or PPTX lecture into one editable, designed PowerPoint presentation.

## Visitor workflow

The same primary button controls the complete workflow:

1. Import a PDF or PPTX lecture file.
2. Click **Build PPTX**.
3. The button shows **Loading…** while Gemini reconstructs the complete lecture into the shared PowerPoint engine contract.
4. Jang shows one labelled image-import control for every important image position identified by Gemini.
5. Import the matching images and click **Continue**.
6. Jang builds the editable PowerPoint in the browser using the approved premium academic design.
7. The same button becomes **Download PPTX**.

The generated PPTX contains editable text, native bullets and numbering, native tables, native shapes and connectors, and imported image objects. Gemini does not return source image bytes.

## One shared lecture contract

Gemini output, the image-import interface, and the PPTX renderer use the same schema. The normalized document contains:

- lecture title, overview, section titles, slide titles, and subtitles;
- paragraphs and callouts;
- unordered, ordered, and nested list items with explicit indentation levels;
- standard, comparison, highlight, and heat-map tables;
- generic, metabolic, signal-transduction, gene-regulatory, and disease/pharmacology pathway diagrams;
- important labelled image placeholders with `contain`/`cover`, aspect, and transverse, longitudinal, portrait, landscape, or automatic orientation;
- stable section, slide, block, and image-slot identifiers;
- source references and a completeness audit listing covered, unmapped, and uncertain source locations.

The contract is represented by `lecture-schema.json`. `functions/api/extract.js` asks Gemini for a simpler structured response and normalizes it into that exact engine contract before returning it to the browser.

## Completeness safeguards

The extraction objective is complete lecture reconstruction, not summarization. The workflow:

- requires source references on every slide and content block;
- keeps all unique meaningful facts, values, relationships, qualifications, exceptions, and warnings;
- records the source page or slide count;
- derives covered and unmapped source locations;
- preserves extraction warnings instead of hiding ambiguous or unreadable content;
- validates the normalized document before rendering.

AI extraction cannot honestly guarantee perfection for every file, so the audit is retained in the structured document and generation fails when the engine contract is invalid.

## Important images

Gemini creates image blocks only for visuals that materially support understanding. Each block includes:

- a unique `slotId`;
- a short content-specific label;
- a one-sentence identification description;
- source traceability;
- fit, aspect, and orientation information.

The website turns these blocks into import buttons. Selected images are embedded in the generated PPTX. Unselected positions remain as labelled editable placeholders.

## Approved design and engine

The browser ships a standalone bundled copy of the approved Jang PPTX engine in `pptx-engine.js`. The engine uses the approved premium academic design and preserves:

- exact 13.33 × 7.5-inch dimensions;
- deterministic pagination and continuation slides;
- editable native PowerPoint objects;
- table and pathway continuation handling;
- intrinsic image sizing without distortion;
- geometry validation;
- RTL/LTR support;
- schema and semantic validation.

`pptx-output.js` wraps the engine result with the correct PowerPoint MIME type and a safe `.pptx` filename.

## Gemini configuration

The API key is server-side only. In Cloudflare Pages, add an encrypted secret named:

```text
GEMINI_API_KEY
```

The current configured default is:

```text
GEMINI_MODEL=gemini-3.6-flash
```

`GEMINI_MODEL` is optional. The server maps the previous `gemini-2.5-flash` value to the configured default.

## File limits

- PDF: 18 MB maximum. Gemini receives the PDF with visual page context.
- PPTX: 50 MB maximum. Jang decodes ordered slide text, tables, notes, element positions, image positions, and nearby image context in the browser before extraction.
- Imported image: 15 MB maximum per image.

## Development

```bash
npm ci
npm test
npm run sample
npm run dev
```

- Static deployment output: `dist/`
- Cloudflare extraction endpoint: `functions/api/extract.js`
- Engine schema: `lecture-schema.json`
- Example output: `generated/jang-website-pptx-workflow-sample.pptx`

For local Cloudflare testing:

```bash
npx wrangler pages dev dist --binding GEMINI_API_KEY=your-key
```
