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
- uses section titles—not the document title—in ordinary content-slide headers;
- supports deliberate major-section divider slides for titles wrapped in `=` rows;
- ends with an end slide;
- keeps every slide at a 16:9 ratio;
- uses zero gaps between slides and zero horizontal page margins;
- uses responsive, container-relative sizing for desktop, iPad, and mobile screens;
- includes self-contained image placeholders and image controls;
- has no external runtime dependencies.

Structured markers such as `[DOCUMENT TITLE]`, `[SECTION]`, `[SUBTITLE]`, `[PARAGRAPH]`, `[BULLETS]`, `[TABLE]`, `[IMAGE]`, `[DIAGRAM]`, and `[END]` remain supported. Ordinary unmarked text is also split into headings, paragraphs, lists, and additional slides automatically.

Divider-wrapped headings have explicit meaning in pasted plain text:

```text
============================================================
2. REGULATION OF BLOOD GLUCOSE
============================================================
```

An equals-wrapped title starts a dedicated major-section slide and becomes the section header for following slides. A title wrapped in hyphen rows remains in the current section and is rendered with a divider line above and below it.

## Image placeholders

Use an image block where the image should appear:

```text
[IMAGE size=wide fit=contain]
label: Antibody structure
Insert the labeled antibody illustration here.
```

Supported placeholder sizes are `small`, `medium`, `large`, `wide`, `portrait`, `square`, and `full`. The default is `large`. Image fit may be `contain` (default, no cropping) or `cover`.

In the generated HTML:

- clicking an empty placeholder opens a bottom sheet with Close and Import image;
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
