# Jang — Gemini Lecture HTML Builder

Jang turns an imported PDF or PPTX lecture into one standalone, responsive HTML lecture.

## Visitor workflow

1. Import a PDF or PPTX lecture file. There is no paste-text field.
2. Click **Build HTML**.
3. A Cloudflare Pages Function sends the lecture to Gemini using a strict structured-output schema.
   - PDFs are sent with their visual page context.
   - PPTX files are decoded in the browser into ordered slide text, tables, notes, element positions, and image positions before Gemini structures them.
4. Jang shows an intermediate list of every recognized image position. Each item displays the image label above a native **Import image** control.
5. Click **Continue** to embed the selected images and build the final static lecture.
6. The same button becomes **Download HTML**.

The downloaded HTML contains no image picker, editor, Gemini call, or external runtime dependency. Images chosen during the intermediate step are embedded as data URLs. Unfilled positions remain as labeled static image positions.

## Gemini configuration

The API key is server-side only. In Cloudflare Pages, add an encrypted secret named:

```text
GEMINI_API_KEY
```

An optional plain environment variable can select the model:

```text
GEMINI_MODEL=gemini-2.5-flash
```

In the Cloudflare dashboard, open the Pages project and use **Settings → Variables and Secrets**. Configure the secret for both preview and production environments before deploying.

## File limits

- PDF: 18 MB maximum. PDFs are visually analyzed by Gemini.
- PPTX: 50 MB maximum. PPTX content is decoded locally and only the structured slide manifest is uploaded.
- Intermediate images: 15 MB maximum per image.

## Development

```bash
npm test
npm run build
npx wrangler pages dev dist --binding GEMINI_API_KEY=your-key
```

The static output is written to `dist/`. The server endpoint lives at `functions/api/extract.js` and is deployed as `/api/extract` by Cloudflare Pages Functions.
