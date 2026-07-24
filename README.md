# Jang — Lecture HTML Builder

Jang is a small browser-first tool that turns pasted lecture content or an imported UTF-8 text file into one standalone HTML lecture.

## Workflow

1. Paste lecture content or import a `.txt`, `.text`, or `.md` file.
2. The Build HTML button becomes available when content exists.
3. Build the lecture. While building, the same button acts as Reload.
4. When generation finishes, the same button becomes Download HTML.

There is no preview, editor, saved-project system, PowerPoint conversion, or PDF pipeline.

## Generated file

The downloaded HTML file:

- begins with a cover slide;
- creates as many content slides as needed;
- ends with an end slide;
- keeps every slide at a 16:9 ratio;
- uses zero gaps between slides and zero horizontal page margins;
- uses responsive, container-relative sizing for desktop, iPad, and mobile screens;
- contains no editing controls or external runtime dependencies.

Structured markers such as `[DOCUMENT TITLE]`, `[SECTION]`, `[PARAGRAPH]`, `[BULLETS]`, `[TABLE]`, and `[END]` remain supported. Ordinary unmarked text is also split into headings, paragraphs, lists, and additional slides automatically.

## Development

```bash
npm test
npm run dev
```

The build output is written to `dist/` and can be deployed as a static site, including on Cloudflare Pages.
