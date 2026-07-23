# Jang — Lecture Rebuilder

Jang is a browser-first lecture redesign tool deployed on Cloudflare Pages. It imports PPTX, PDF, HTML, or HTM lectures, extracts readable academic content and useful visuals locally, optionally uses Gemini to reorganize the material, and generates both an HTML preview and a downloadable PowerPoint presentation.

## Processing path

1. Import a `.pptx`, `.pdf`, `.html`, or `.htm` lecture.
2. Parse the source locally in the visitor's browser.
3. Extract slide/page text and supported visual assets.
4. Divide extracted text into bounded, independently retryable AI batches.
5. Send only text plus an asset manifest to a Cloudflare Pages Function.
6. Merge Gemini's structured plans into one lecture plan.
7. Render a safe HTML preview.
8. Generate a `.pptx` directly in the browser.

When Gemini is not configured, Jang creates a local source-preserving layout. This is a normal fallback mode, not a file-processing failure.

## Architecture

- **Hosting:** Cloudflare Pages from `main`.
- **Frontend:** framework-free HTML, CSS, and JavaScript.
- **HTML parsing:** browser `DOMParser`.
- **PPTX parsing:** JSZip reads slide XML and embedded media locally.
- **PDF parsing:** Mozilla PDF.js is packaged into the Pages build and runs locally with its web worker.
- **AI proxy:** Cloudflare Pages Function at `/api/redesign`.
- **AI model:** `gemini-3.5-flash-lite` by default.
- **PPTX output:** PptxGenJS in the browser.
- **Storage:** no database is required for the anonymous workflow.

## Cloudflare Pages setup

1. Connect this repository to Cloudflare Pages.
2. Set the production branch to `main`.
3. Use **no framework preset**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. In **Settings → Variables and Secrets**, add one encrypted secret:
   - `GEMINI_API_KEY`, or
   - `GOOGLE_API_KEY`.
7. Optionally add `GEMINI_MODEL`; default: `gemini-3.5-flash-lite`.
8. Optionally configure `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
9. Redeploy the project after adding or changing secrets.

The `/functions` directory must remain at the repository root.

### Fixing “Gemini is not configured”

The API key must exist in the Cloudflare Pages project, not only in GitHub or on your local computer.

1. Open the deployed Pages project in Cloudflare.
2. Open **Settings → Variables and Secrets**.
3. Add `GEMINI_API_KEY` or `GOOGLE_API_KEY` as an encrypted production secret.
4. Add the same secret to Preview if preview deployments also need AI.
5. Trigger a new deployment.
6. Reload the site and confirm the header says `Gemini ready`.

Jang never sends the secret to the browser.

## Local development

```bash
npm install
npm run check
cp .dev.vars.example .dev.vars
npm run dev
```

Example `.dev.vars`:

```dotenv
GEMINI_API_KEY="your-key"
# GOOGLE_API_KEY="your-key"
# GEMINI_MODEL="gemini-3.5-flash-lite"
# TURNSTILE_SITE_KEY="optional-public-site-key"
# TURNSTILE_SECRET_KEY="optional-secret-key"
```

Never commit `.dev.vars` or `.env` files.

## Current safety limits

- Desktop source file: 50 MB.
- Mobile or low-memory device: 20 MB.
- Extracted text: up to 1.2 million characters.
- AI batches: up to 12, about 110,000 characters each.
- PPTX slides: up to 300.
- PDF pages: up to 250.
- PDF visual snapshots: up to 80 relevant pages.
- Visual assets: up to 300.

These are application safety limits designed to protect browser memory and free-tier usage.

## PDF behavior

PDF.js extracts selectable text from each page. Pages containing images or very little text may also be rendered as page snapshots so diagrams and scanned content can be preserved visually. Jang does not perform OCR, so image-only pages cannot be semantically reorganized unless OCR is added later.

## Privacy and security

- Original files are processed locally.
- Embedded images stay in browser memory.
- Only extracted text and asset metadata are sent to the AI proxy.
- The Gemini key remains server-side.
- Imported HTML scripts, forms, frames, embedded objects, and event handlers are removed.
- Lecture text is treated as untrusted data in the Gemini prompt.
- Gemini returns structural JSON rather than executable HTML.
- Preview frames are sandboxed.
- Turnstile can protect the public AI endpoint.

## Important limitations

- PPTX import does not reconstruct animations, transitions, SmartArt, speaker notes, or exact original positioning.
- PDF import does not perform OCR and may preserve complex pages as images rather than editable elements.
- Script-rendered canvas diagrams cannot be reconstructed from static HTML alone.
- Relative image paths in standalone HTML cannot be read unless the images are embedded or remotely accessible.
- “Free” means operation within the current free allowances of GitHub, Cloudflare, and Gemini; it is not unlimited usage.
