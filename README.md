# Jang — Gemini and Claude Lecture PPTX Builder

Jang turns an imported PDF/PPTX lecture or validated Claude lecture JSON into one editable, designed PowerPoint presentation.

## Visitor workflow

The same primary button controls the complete workflow.

### Option 1 — import a lecture

1. Import a PDF or PPTX lecture file.
2. Click **Build PPTX**.
3. The button shows **Loading…** while Gemini reconstructs the complete lecture into the shared PowerPoint engine contract.
4. Jang shows one labelled image-import control for every important image position identified by Gemini.
5. Import the matching images and click **Continue**.
6. Jang builds the editable PowerPoint in the browser using the approved premium academic design.
7. The same button becomes **Download PPTX**.

### Option 2 — import Claude JSON

1. Ask Claude to produce only `lecture-output.json` using the Jang schema and extraction prompt.
2. Select **Import Claude JSON** on the website.
3. Choose the single `.json` file.
4. Click **Build PPTX**.
5. Jang validates the JSON locally against `lecture-schema.json`.
6. Jang shows the image slots declared by image blocks in the validated JSON.
7. Import the matching images and click **Continue**.
8. Jang builds the final editable PowerPoint with its approved engine.
9. Click **Download PPTX**.

Claude does not need to generate a PPTX. Its JSON is the authoritative lecture structure and image-slot description. Jang owns template selection, physical layout, pagination, rendering, and final PPTX creation.

The generated PPTX contains editable text, native bullets and numbering, native tables, native shapes and connectors, and imported image objects. Gemini and Claude output do not need to contain source image bytes. Content plans target 60%–100% utilization and prefer approximately 90%, but density is created only by grouping real content and producing complete descriptions and review lists. The renderer never stretches gaps or text boxes to imitate density. Lists and notes remain in the left reading flow, the overview key-terms box uses every ordered title, and each simplified pathway diagram is preceded by a detailed review list.

## One shared lecture contract

Gemini output, Claude JSON import, the image-import interface, and the PPTX renderer use the same schema. The normalized document contains:

- lecture title, overview, section titles, slide titles, and subtitles;
- paragraphs and callouts;
- unordered, ordered, and nested list items with explicit indentation levels;
- standard, comparison, highlight, and heat-map tables;
- generic, metabolic, signal-transduction, gene-regulatory, and disease/pharmacology pathway diagrams;
- important labelled image placeholders with `contain`/`cover`, aspect, and transverse, longitudinal, portrait, landscape, or automatic orientation;
- stable section, slide, block, and image-slot identifiers;
- source references and a completeness audit listing covered, unmapped, and uncertain source locations.

The contract is represented by `lecture-schema.json`. `functions/api/extract.js` asks Gemini for a simpler structured response and normalizes it into that exact engine contract before returning it to the browser. `claude-import.js` validates Claude JSON directly against the final contract and derives its image-review list from canonical image blocks.

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

Gemini or Claude creates image blocks only for visuals that materially support understanding. Each block includes:

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

The renderer compacts adjacent compatible topics within a section before pagination, targeting naturally dense content without changing the exact two-pixel vertical rhythm. Non-full images share a balanced text/image layout with their related content when space permits, while unfilled image slots remain compact labelled placeholders rather than blank dedicated slides. A post-layout quality audit reports genuinely sparse slides instead of visually padding them.

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

Claude JSON import is entirely local and does not require a Gemini API call.

## File limits

- PDF: 18 MB maximum. Gemini receives the PDF with visual page context.
- PPTX lecture: 50 MB maximum. Jang decodes ordered slide text, tables, notes, element positions, image positions, and nearby image context in the browser before extraction.
- Claude JSON: 20 MB maximum.
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
- Claude import helper: `claude-import.js`
- Example output: `generated/jang-website-pptx-workflow-sample.pptx`

For local Cloudflare testing:

```bash
npx wrangler pages dev dist --binding GEMINI_API_KEY=your-key
```
