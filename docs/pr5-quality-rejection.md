# PR #5 quality rejection analysis

The supplied amino-acid lecture exposed an unacceptable fallback path.

Observed failure:

- A 27-page source was expanded into a 31-slide output.
- Rendered PDF-page snapshots were treated as separate visual occurrences, splitting text and diagrams that belonged to the same source page.
- Generic headings such as `SOURCE`, `VISUAL EXPLANATION`, and repeated `— continued` labels replaced meaningful lecture structure.
- Near-empty continuation slides were produced.
- The result came from the deterministic fallback path rather than the verified Gemini HTML design path.

Immediate rule:

- The application must fail closed whenever Gemini HTML design is unavailable.
- No deterministic fallback PowerPoint may be offered to a user.
- A download is allowed only after verified Gemini HTML, layout bounds checks, source/image occurrence checks, and PPTX package verification all pass.

CI failure root cause:

- Both browser jobs still mocked `/api/redesign` while the application now calls `/api/design-html`, causing HTTP 501 responses in the test server.
- The browser fixtures must be rewritten around verified HTML responses before this PR can be accepted.
