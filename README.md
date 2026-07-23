# Jang — Lecture HTML Rebuilder

Jang is a browser-first website that imports a lecture HTML file, extracts its useful academic content and visual assets, uses the Gemini API to reorganize the material, and creates a downloadable lecture HTML file based on the supplied academic design reference.

## What it does

1. Presents a clean upload workspace.
2. Parses the imported HTML in the visitor's browser.
3. Extracts headings, paragraphs, lists, tables, embedded/remote images, inline SVG diagrams, and Mermaid diagrams.
4. Sends only the extracted text and a visual-asset manifest to a Cloudflare Pages Function.
5. Uses Gemini to produce a structured, source-faithful lecture plan.
6. Renders a self-contained printable HTML document and reconnects the original visual assets in the browser.
7. Shows a sandboxed preview and downloads the result as `.html`.

A deterministic local fallback is included. If Gemini is unavailable or not configured, Jang still creates a readable document while preserving the extracted source order.

## Architecture

- **Frontend:** framework-free HTML, CSS, and JavaScript.
- **Extraction:** runs locally with `DOMParser`; the original HTML file is not uploaded.
- **AI proxy:** Cloudflare Pages Function at `/api/redesign`.
- **AI model:** `gemini-2.5-flash` by default because it has a documented free tier and structured-output support.
- **Publishing:** Cloudflare Pages Git integration from the `main` branch.
- **Abuse protection:** optional Cloudflare Turnstile verification.

## Cloudflare Pages setup

The repository is ready for Cloudflare Pages Git deployment.

1. In Cloudflare, open **Workers & Pages** and create or open the Pages project connected to this GitHub repository.
2. Set the production branch to `main`.
3. Use **no framework preset**.
4. Use `npm run build` as the build command.
5. Use `dist` as the build output directory.
6. In **Settings → Variables and Secrets**, add:
   - `GEMINI_API_KEY` as an encrypted secret.
   - Optional `GEMINI_MODEL` as a normal variable. Default: `gemini-2.5-flash`.
7. Redeploy the latest commit.

The `/functions` directory must stay at the repository root because Cloudflare Pages discovers Functions from that location.

### Optional Turnstile protection

A public AI endpoint can have its free quota consumed by automated requests. Cloudflare Turnstile is supported and recommended.

1. Create a Turnstile widget for the production `pages.dev` or custom domain.
2. Add `TURNSTILE_SITE_KEY` as a normal Pages variable.
3. Add `TURNSTILE_SECRET_KEY` as an encrypted Pages secret.
4. Redeploy.

When both variables are present, the UI automatically renders a verification widget and the Function validates every token server-side.

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars
# Put your Gemini key in .dev.vars
npm run dev
```

Create `.dev.vars` manually with:

```dotenv
GEMINI_API_KEY="your-key"
# GEMINI_MODEL="gemini-2.5-flash"
# TURNSTILE_SITE_KEY="optional-public-site-key"
# TURNSTILE_SECRET_KEY="optional-secret-key"
```

Never commit `.dev.vars` or `.env` files.

## Validation

```bash
npm run check
npm run build
```

## Important limitations

- A single HTML file cannot include separate local image files unless they are embedded as data URLs. Relative image paths are shown as explicit placeholders in the generated document.
- Script-rendered canvas diagrams cannot be reconstructed from static HTML alone. Inline SVG and Mermaid source are preserved.
- “100% free” means the project can operate inside the current free allowances of GitHub, Cloudflare Pages/Workers, Turnstile, and the Gemini API. Free tiers have quotas and policies; the application does not guarantee unlimited no-cost usage.
- Gemini free-tier data handling may differ from paid-tier handling. Review Google's current terms before processing sensitive educational material.

## Security choices

- The Gemini key is server-side only.
- Imported scripts, forms, frames, embedded objects, event handlers, and common webpage boilerplate are removed before extraction.
- The source lecture is explicitly treated as untrusted data in the Gemini prompt to reduce prompt-injection risk.
- Gemini returns a validated structural plan rather than executable HTML.
- Preview frames are sandboxed.
- Pages security headers are included in `_headers`.
- Input size and source length are bounded on both client and server.
