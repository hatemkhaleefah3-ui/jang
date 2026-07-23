# Jang — Lecture Rebuilder

Jang is a browser-first lecture redesign tool deployed on Cloudflare Pages. It imports PPTX or HTML lectures, extracts text and visual assets locally, uses Gemini to reorganize the material, creates a redesigned HTML preview, and downloads the result as either HTML or PowerPoint.

## Processing path

1. Import a `.pptx`, `.html`, or `.htm` lecture.
2. Parse the source locally in the visitor's browser.
3. Extract headings, paragraphs, slide text, tables, images, SVG, and Mermaid diagrams where supported.
4. Divide the extracted text into bounded, independently retryable AI batches.
5. Send only text plus an asset manifest to a Cloudflare Pages Function.
6. Merge Gemini's structured plans into one semantic lecture plan.
7. Render the plan as a safe HTML preview.
8. Generate and download a `.pptx` directly in the browser with PptxGenJS.

## Architecture

- **Hosting:** Cloudflare Pages, deployed from `main`.
- **Frontend:** framework-free HTML, CSS, and JavaScript.
- **HTML parsing:** browser `DOMParser`.
- **PPTX parsing:** JSZip in the browser; slide XML and embedded media never need to be uploaded.
- **AI proxy:** Cloudflare Pages Function at `/api/redesign-large`.
- **AI model:** `gemini-3.5-flash-lite` by default.
- **PPTX output:** PptxGenJS in the browser.
- **Abuse protection:** optional Cloudflare Turnstile.
- **Storage:** no database required for the default anonymous workflow.

This design deliberately keeps large files and images on the visitor's device. Cloudflare D1 would be useful later for accounts, project metadata, job records, and usage tracking. Cloudflare R2 would be useful later for resumable uploads, saved projects, or cross-device downloads, but neither is required for the free first version.

## Current limits

- Desktop source file: 50 MB.
- Mobile or low-memory device: 20 MB.
- Extracted text: up to 1.2 million characters.
- AI batches: up to 12, each approximately 110,000 characters.
- Visual assets: up to 300.
- PPTX slides imported: up to 300.

These limits protect browser responsiveness and free-tier AI usage. They are application safety limits, not database limits.

## Cloudflare Pages setup

1. Connect this repository to Cloudflare Pages.
2. Set the production branch to `main`.
3. Use **no framework preset**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add `GEMINI_API_KEY` as an encrypted secret.
7. Optionally add `GEMINI_MODEL`; the default is `gemini-3.5-flash-lite`.
8. Optionally configure `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
9. Redeploy.

The `/functions` directory must remain at the repository root.

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars
npm run check
npm run dev
```

Example `.dev.vars`:

```dotenv
GEMINI_API_KEY="your-key"
# GEMINI_MODEL="gemini-3.5-flash-lite"
# TURNSTILE_SITE_KEY="optional-public-site-key"
# TURNSTILE_SECRET_KEY="optional-secret-key"
```

Never commit `.dev.vars` or `.env` files.

## Validation

```bash
npm run check
npm run build
```

## Privacy and security

- The Gemini key remains server-side.
- Original PPTX and HTML files are processed locally.
- Embedded images stay in browser memory and are reconnected during rendering/export.
- Imported scripts, forms, frames, embedded objects, event handlers, and common webpage boilerplate are removed from HTML sources.
- Lecture text is treated as untrusted data in the Gemini prompt.
- Gemini returns validated structural JSON rather than executable HTML.
- Preview frames are sandboxed.
- Turnstile can protect the public AI endpoint.

## Important limitations

- PPTX import focuses on readable slide text and embedded images; complex charts, SmartArt, animations, transitions, speaker notes, and exact original positioning are not reconstructed.
- PDF and DOCX import are planned but are not included in this branch yet.
- Script-rendered canvas diagrams cannot be reconstructed from static HTML alone.
- Relative image paths in standalone HTML cannot be read unless the images are embedded or remotely accessible.
- “Free” means operation within the current free allowances of GitHub, Cloudflare, and Gemini. It is not unlimited usage.
- Review Google's current free-tier data terms before processing sensitive educational material.
