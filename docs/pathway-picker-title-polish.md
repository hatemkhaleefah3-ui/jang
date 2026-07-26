# Pathway, picker, and wrapped-title polish

This follow-up preserves the approved PowerPoint design while addressing three targeted issues reported after the immutable render-plan release.

## Gemini pathway extraction

The extraction prompt now actively audits prose, bullets, numbered mechanisms, and arrow notation for supported pathway relationships. A pathway candidate requires at least three linked entities or at least two ordered conversions/mechanism steps. When supported by the source, Gemini is instructed to return a diagram block in addition to the complete explanatory text. Missing or ambiguous links must not be invented.

## File-picker responsiveness

The lecture picker now uses one `change` listener rather than duplicate `input` and `change` processing. The temporary bootstrap listener is removed when the application module becomes ready, and selected-file DOM updates are deferred to the next animation frame so the native mobile picker can dismiss first.

## Wrapped-title spacing

Slide titles, section titles, overview title/introduction spacing, and the ending statement are measured before their decorative rule or following content is positioned. Pagination uses the same measured heading reserve as rendering.

## Verification

The final branch passed:

- maintainable engine typecheck, unit, geometry, and OOXML tests
- Gemini pathway-prompt tests
- file-picker bootstrap and handoff tests
- no/some/all-image render-plan regressions
- strict CSP transformation and production build
- LibreOffice PDF/PNG rendering of the reported long-title cases

The rendered regression uses:

- `Lecture Overview: Amino Acid Metabolism`
- `Phenylalanine and Tyrosine Metabolism`
- `Biosynthesis of Specialized Products from Tyrosine`
- `Complete lecture reconstruction covering Glycine, Phenylalanine, and Tyrosine metabolism and clinical correlates.`
