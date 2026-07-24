# Post-merge browser fixes

This follow-up records the browser failures found immediately after PR #5 merged and the fixes applied:

- Permit same-origin DOM inspection in the script-disabled sandbox used by the verified HTML-to-PPTX renderer.
- Align the editable text builder browser test with the final text-only workspace.
- Align the file-conversion browser suite with `/api/design-html` and fail-closed behavior when verified design is unavailable.
- Add a unit guard preventing the renderer sandbox from losing DOM access again.
