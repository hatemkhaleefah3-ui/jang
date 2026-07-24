# Jang — Lecture HTML Builder

Jang is a browser-only tool that turns pasted lecture text or an imported plain-text file into one downloadable HTML lecture.

## Workflow

1. Paste lecture content, or import a UTF-8 `.txt` / `.ptx` text file.
2. Press **Build HTML**.
3. During generation, the button becomes **Reload**.
4. When generation finishes, the same button becomes **Download HTML**.

There is no preview, editor, save-project system, PDF import, PowerPoint import/export, or conversion mode.

## Generated HTML

- One standalone HTML file.
- A cover slide, as many content slides as needed, and an end slide.
- Every slide uses a 16:9 ratio.
- Slides touch edge-to-edge with no gaps between them and no left/right page margin.
- Responsive typography and layout rules cover desktop, iPad, and mobile widths.
- No editing controls or runtime JavaScript are embedded in the generated lecture.

Structured markers such as `[DOCUMENT TITLE]`, `[SECTION]`, `[PARAGRAPH]`, `[BULLETS]`, `[TABLE]`, `[DIAGRAM]`, and `[END]` remain supported. Unmarked text also works.

## Development

```bash
npm test
```

The build command copies the six static application files into `dist/`:

```bash
npm run build
```
