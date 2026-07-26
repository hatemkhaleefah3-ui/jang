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

## n8n automation API

The API mirrors the Claude JSON UI flow and reuses the same parser, semantic validator, image slots, PPTX engine, filename logic, and MIME type. Every route requires either:

```text
Authorization: Bearer <JANG_API_KEY>
```

or:

```text
X-Jang-API-Key: <JANG_API_KEY>
```

### Cloudflare setup

The Workers KV namespace binding is committed in `wrangler.jsonc` and is the source of truth for deployments:

```jsonc
"kv_namespaces": [
  {
    "binding": "JANG_AUTOMATION_KV",
    "id": "b3d01801415042df951f4b0ebdb4c788"
  }
]
```

`JANG_API_KEY` remains an encrypted Pages secret and must not be added to `wrangler.jsonc`, source control, or a plaintext `vars` block. Create or update it with:

```bash
npx wrangler pages secret put JANG_API_KEY --project-name jang
```

The command prompts for the secret value and stores it in Cloudflare. For local development only, use a gitignored `.dev.vars` or `.env` file.

After the secret is configured, redeploy the Pages project. Every import, normalized build record, image, presentation metadata record, and generated PPTX uses an absolute seven-day KV expiration.

Workers KV is eventually consistent. A write is normally visible immediately in the same Cloudflare location, but a following n8n request may reach another location where a new value can take up to about 60 seconds to appear. The API retries required KV reads for several seconds and returns a `Retry-After: 2` header when a value is still unavailable. In n8n, add a short Wait node—two to five seconds—between dependent calls and retry HTTP `404` or `409` responses with increasing delays for up to 60 seconds.

The API uses immutable keys for the raw import, normalized build, each image, generated presentation metadata, and final PPTX. This avoids repeatedly overwriting a shared state key, but it cannot make KV strongly consistent. Workflows that require guaranteed immediate cross-location consistency need Durable Objects, D1, R2, or another transactional store.

Workers KV limits each individual value to 25 MiB. Jang therefore:

- keeps the raw JSON request at 20 MB or less;
- keeps each imported image at 15 MB or less;
- rejects any normalized build record or stored value above 25 MiB;
- adds a warning when the generated PPTX reaches 22 MiB;
- rejects `/api/continue` with HTTP `413` when the generated PPTX exceeds 25 MiB.

A presentation rejected by that final guard cannot be exported through KV. Its final binary would need R2, another object store, or a future one-request streaming export route that generates and returns the PPTX without persisting it.

Server-side PPTX generation is CPU-heavy. The browser workflow remains available regardless of API bindings or server-side generation limits.

### API sequence

#### 1. `POST /api/import`

Send the raw Claude JSON as the entire request body. The response is:

```json
{ "importId": "..." }
```

This performs the file-import stage and stores the raw JSON configuration.

#### 2. `POST /api/build`

```json
{ "importId": "..." }
```

This calls the same `parseClaudeOutputText()` path used by the **Build PPTX** button. It returns the remaining image labels and extra slot context:

```json
{
  "labels": ["Tyrosine metabolic pathway"],
  "images": [
    {
      "label": "Tyrosine metabolic pathway",
      "topic": "Tyrosine metabolic pathway",
      "description": "...",
      "sectionTitle": "...",
      "slideTitle": "..."
    }
  ],
  "status": "awaiting_images"
}
```

Use the exact returned `label` in the next request. Duplicate display labels are automatically disambiguated without changing the presentation content.

#### 3. `POST /api/images/import`

```json
{
  "importId": "...",
  "label": "Tyrosine metabolic pathway",
  "imageUrl": "https://example.com/pathway.png"
}
```

Jang downloads a public `http` or `https` image, verifies the image content type and 15 MB limit, and stores it under the corresponding canonical image slot. Private-network and local URLs are rejected.

#### 4. `POST /api/continue`

```json
{ "importId": "..." }
```

This calls the same `buildLecturePptxFile()` path used by the **Continue** button and stores the generated PPTX in KV when it is below the 25 MiB value limit. Missing images remain as the same labelled placeholders used by the browser workflow.

#### 5. `POST /api/export`

```json
{ "importId": "..." }
```

This implementation returns the PPTX file directly as the response body with:

```text
Content-Type: application/vnd.openxmlformats-officedocument.presentationml.presentation
Content-Disposition: attachment; filename="...pptx"
```

In the n8n HTTP Request node, select a file/binary response format for this request.

### Internal reuse map

- `/api/import`: persistent API state wrapper only; raw JSON is retained for the build step.
- `/api/build`: `parseClaudeOutputText()` and the schema/semantic validation in `claude-import.js`.
- `/api/images/import`: the canonical `imageSlots` returned by that same parser; images remain keyed by `slotId`, exactly like the UI `selectedImages` map.
- `/api/continue`: `buildLecturePptxFile()` from `pptx-output.js`, which calls the existing deterministic `generateLecturePptx()` engine.
- `/api/export`: `PPTX_MIME` and the generated filename from `pptx-output.js`; the already-built binary is read from Workers KV and returned directly.

The browser-only state (`extraction`, `selectedImages`, and `generated` in `app.js`) could not be called directly from n8n. The minimal backend refactor is the KV-backed state wrapper in `functions/_shared/automation.js`; the lecture and PPTX business logic remains shared and is generated into a Worker-safe module graph during `npm run build`.

## File limits

- PDF: 18 MB maximum. Gemini receives the PDF with visual page context.
- PPTX lecture: 50 MB maximum. Jang decodes ordered slide text, tables, notes, element positions, image positions, and nearby image context in the browser before extraction.
- Claude JSON: 20 MB maximum.
- Imported image: 15 MB maximum per image.
- n8n automation images: 60 MB combined maximum per presentation.
- KV-stored generated PPTX: less than or equal to 25 MiB; warning begins at 22 MiB.

## Development

```bash
npm ci
npm test
npm run sample
npm run dev
```

- Static deployment output: `dist/`
- Cloudflare extraction endpoint: `functions/api/extract.js`
- n8n API routes: `functions/api/import.js`, `functions/api/build.js`, `functions/api/images/import.js`, `functions/api/continue.js`, `functions/api/export.js`
- Shared API state layer: `functions/_shared/automation.js`
- Engine schema: `lecture-schema.json`
- Claude import helper: `claude-import.js`
- Example output: `generated/jang-website-pptx-workflow-sample.pptx`

For local Cloudflare testing:

```bash
npm run build
npx wrangler pages dev dist --binding GEMINI_API_KEY=your-key --binding JANG_API_KEY=your-api-key
```
