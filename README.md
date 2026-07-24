# Jang — Lecture HTML Builder

Jang is a small browser-first tool that turns pasted lecture content or an imported UTF-8 text file into one standalone HTML lecture. Generation is deterministic and local; it does not use AI.

## Workflow

1. Paste lecture content or import a `.txt`, `.text`, or `.md` file.
2. The Build HTML button becomes available when content exists.
3. Build the lecture. While building, the same button acts as Reload.
4. When generation finishes, the same button becomes Download HTML.

There is no preview, general layout editor, saved-project system, PowerPoint conversion, or PDF pipeline.

## Generated file

The downloaded HTML file:

- begins with a cover slide;
- creates as many content slides as needed;
- uses section titles in slide headers instead of creating title-only section slides;
- ends with an end slide;
- keeps every slide at a 16:9 ratio;
- uses zero gaps between slides and zero horizontal page margins;
- uses responsive, container-relative sizing for desktop, iPad, and mobile screens;
- includes self-contained image placeholders and image controls;
- has no external runtime dependencies.

Structured markers such as `[DOCUMENT TITLE]`, `[SECTION]`, `[SUBTITLE]`, `[PARAGRAPH]`, `[BULLETS]`, `[TABLE]`, `[IMAGE]`, and `[END]` remain supported. Ordinary unmarked text is also split into headings, paragraphs, lists, and additional slides automatically.

## Image placeholders

Use an image block where the image should appear:

```text
[IMAGE size=wide fit=contain]
label: Antibody structure
Insert the labeled antibody illustration here.
```

Supported placeholder sizes are `small`, `medium`, `large`, `wide`, `portrait`, `square`, and `full`. The default is `large`. Image fit may be `contain` (default, no cropping) or `cover`.

In the generated HTML:

- an empty placeholder opens the image picker when clicked;
- a filled placeholder opens a bottom sheet with Change image, Remove image, and Remove placeholder;
- imported images are resized inside the fixed placeholder dimensions;
- Save embeds the selected images as data URLs and saves an updated standalone HTML file;
- Cancel reverses the most recent unsaved image action;
- the Save and Cancel controls remain fixed at the bottom while unsaved image changes exist.

Browsers with the File System Access API show a save-file picker. Other browsers download the updated HTML file.

## Development

```bash
npm test
npm run dev
```

The build output is written to `dist/` and can be deployed as a static site, including on Cloudflare Pages.
