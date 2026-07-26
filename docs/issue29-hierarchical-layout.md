# Issue #29 hierarchical lecture layout

This integration preserves the existing Jang browser workflow, immutable presentation planning, editable PowerPoint objects, and approved editorial design.

Implemented contract:

- Gemini performs complete extraction, important-image mapping, reorganization, and hierarchy/block construction in that order.
- Configure, Decide, and Make retain the user-defined meanings.
- Overview key terms are the ordered section titles.
- Section titles, titles, and sub-titles carry grounded short definitions.
- Title rules are exactly 3 px below measured one-, two-, or three-line titles.
- Normal slides use colored header/footer bands; cover, ending, and section slides keep their established compositions.
- Existing right-side companions are selected by image, table, list, then note; otherwise content uses full width.
- New logical titles start a new physical slide only when prior natural use exceeds 50%.
- Normal slides use 60%–100% of the available content area without content loss.
- Safely croppable photographs fill image boxes; information-bearing figures remain uncropped.
- Imported image bytes do not alter pagination.

Verification evidence:

- The exact maintainable engine commit was independently typechecked, tested, built, packaged, and rendered before browser integration.
- The application passed two complete verification rounds, including extraction/schema tests and the strict CSP production build.
- No-image, partial-image, and all-image decks retained the same 16-slide structure and produced zero geometry warnings.
- The all-images deck completed with zero warnings.
- LibreOffice rendered all three modes successfully for visual review.
