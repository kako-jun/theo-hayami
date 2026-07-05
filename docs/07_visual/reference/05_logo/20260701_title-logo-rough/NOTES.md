# 20260701 title logo roughs

Studio-yokonami #17 rough generation.

## Files

- `concept-sheet-01.png` — first concept sheet. Candidate B was preferred by kako-jun.
- `concept-sheet-02.png` — eye/book direction comparison. Useful for icon nucleus, but not the preferred title logo direction.
- `b-original-crop.png` — cropped original B candidate from `concept-sheet-01.png`. **Current preferred direction** after kako-jun review.
- `b-direction-01.png` — B direction enlarged. Good theory-diagram feeling, but the word gap reads too tight (`THEOHAYAMI` risk).
- `b-direction-02-clear-gap.png` — later refinement. Clearer `THEO HAYAMI` gap, but weaker than the original B rough.
- `b-original-with-ja-sublogo.png` — original B candidate with a small centered Japanese sub-logo `せおはやみ` below the English mark.
- `generated-b-with-ja-sublogo-01.png` — generated logo composition with both English `THEO HAYAMI` and Japanese `せおはやみ` designed as logo lettering. This is the correct route for the Japanese sub-logo, unlike the simple composited check above.
- `o-eye-second-a-01.png` — **adopted rough**. Revised generated logo: `O` no longer uses a gear; it uses a closed eye inside a star-map ring. The second `A` in `HAYAMI` gets a quiet balance-scale motif so the `AMI` side is not plain. kako-jun approved adopting this whole logo as-is on 2026-07-01.

## Current Direction

Adopt `o-eye-second-a-01.png` as the current title-logo rough.

Use the original B direction as the main title logo route:

- Deep shadow-library blue background.
- Warm white title letters.
- Sparse muted gold points/threads.
- Letterforms feel like a theory diagram / measuring instrument.
- The name also means "セオリーの早見表" (a quick reference table for theory), so the diagram / measurement / star-map feeling is semantically appropriate, not just decorative.
- `O` in `THEO` can carry gear/lens symbolism.
- `A` in `HAYAMI` can carry compass/divider symbolism.
- Constellation guide lines should remain secondary.
- Keep the stronger asymmetry and diagram feeling of `b-original-crop.png`; do not over-normalize it into a plain readable logo.
- Use the Japanese `せおはやみ` as a small centered sub-logo below the English title when the layout needs the Japanese name. It should remain subordinate to the English mark.
- The Japanese sub-logo should be generated/designed as lettering, not simply typed with a system font.
- Prefer replacing the gear inside `O` with a closed eye + star-map ring. The gear reads too mechanical/engineering for the app's library/philosophy/question mood.
- Give the second `A` in `HAYAMI` a quieter motif than the first `A` so it does not look like an untouched leftover. A small balance-scale crossbar works, but should be reduced during vector cleanup if it competes with readability.

## Final Vectorized Version (2026-07-05)

Manual cleanup of `o-eye-second-a-01.png` is complete and adopted into the site (Issue #32):

- `theo-logo.png` (English mark + Japanese sub-logo `せおはやみ`) and `theo-logo_en.png` (English-only) — same navy background, chroma-keyed transparent and shipped as `assets/masters/logo/theo-logo{,-en}.png` (masters) / `assets/images/logo/theo-logo{,-en}.webp` (delivery). The JA version is wired into the homepage hero (`src/pages/index.astro`); the EN-only version is staged as an asset only, not yet wired anywhere.
- `theo-icon2.png` — the app icon, derived separately per the rule below (a `T` glyph inside the star-map ring, not a shrink of the full logo). Shipped opaque (no transparency needed) as `assets/masters/icon/theo-icon.png`, resized into the `public/favicon*.png` / `public/apple-touch-icon.png` set referenced by `LibraryLayout.astro`.

## Manual Cleanup Needed

- Preserve exact spelling: `THEO HAYAMI`.
- Keep the word gap clearly visible.
- Simplify the star-map lines if they compete with the letters.
- Preserve the original B candidate's energetic `HAYAMI` geometry, but ensure the `Y` remains readable during vector cleanup.
- Keep strokes thick enough for title screen and web header use.
- Derive the app icon separately from a simpler nucleus; do not shrink the full horizontal logo.
