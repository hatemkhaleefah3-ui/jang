# Jang — Gemini Lecture HTML Builder

Jang turns an imported PDF or PPTX lecture into one standalone, responsive HTML lecture.

## Visitor workflow

1. Import a PDF or PPTX lecture file. There is no paste-text field.
2. Click **Build HTML**.
3. A Cloudflare Pages Function sends the lecture to Gemini using a strict structured-output schema.
   - PDFs are sent with their visual page context.
   - PPTX files are decoded in the browser into ordered slide text, tables, notes, element positions, image positions, and nearby image context before Gemini structures them.
4. Jang shows an intermediate list of every important image position. Each item has a unique, content-specific label, a short description, and a native **Import image** control.
5. Click **Continue** to embed the selected images and build the final static lecture.
6. The same button becomes **Download HTML**.

The downloaded HTML contains no image picker, editor, Gemini call, or external runtime dependency. Images chosen during the intermediate step are embedded as data URLs. Unfilled positions remain as labeled static image positions.

## Lecture structure

Gemini and the reusable HTML renderer share one explicit hierarchy:

1. Lecture name on the cover slide.
2. One overview slide containing introductory information and an automatically generated table of contents.
3. A standalone slide for every major section title.
4. Content slides whose header is the active section title.
5. Optional unique slide titles rendered large, bold, and with a divider line.
6. Optional slide subtitles and in-slide subtitle blocks rendered bold without divider lines.

Repeated slide titles are removed from continuation slides. Gemini is instructed not to promote subtitles into slide titles.

## Visual layouts

- Text, titles, subtitles, and lists begin at the upper-right of content slides.
- Images receive dedicated centered slides and use the available slide body.
- Tables with more than three columns and diagrams with more than four nodes receive dedicated centered slides.
- Smaller tables and diagrams may share a slide with nearby text. Their physical placement is inferred from whether the visual appears before or after that text in the source.
- Every table and diagram has a specific content label.
- Gemini may faithfully convert comparisons into tables and processes or pathways into connected diagrams.

## Gemini configuration

The API key is server-side only. In Cloudflare Pages, add an encrypted secret named:

```text
GEMINI_API_KEY
```

Jang uses the current stable multimodal model by default:

```text
GEMINI_MODEL=gemini-3.6-flash
```

`GEMINI_MODEL` is optional. The server also automatically maps the previous `gemini-2.5-flash` value to `gemini-3.6-flash`, so an old Cloudflare model variable will not block extraction.

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
