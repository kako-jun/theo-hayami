# Aristo LoRA Source Candidates

Source candidates for Aristo, copied from the ChatGPT Images2 batch generated on
2026-06-30.

## Source

- Batch issue: `kako-jun/studio-yokonami#23`
- Character id: `aristo`
- Trigger candidate: `aristochar`

## Current Candidate Set

- `source-candidates/001_*` - `004_*`: ChatGPT Images2 Phase 1 normal full-body views
- `source-candidates/005_*` - `008_*`: ChatGPT Images2 Phase 2 open-front full-body views
- `source-candidates/009_*` - `012_*`: ChatGPT Images2 Phase 3 normal pose variants
- `source-candidates/013_*` - `016_*`: ChatGPT Images2 Phase 4 bust / expression variants

Every source-candidate PNG has a same-name `.txt` caption.

## Open-front Variant

The Phase 2 open-front images are accepted as shirt-open / jacket-open
candidates. Their jacket design differs slightly from the normal outfit, so keep
them in the open-front slot. Do not use them as references for normal clothing,
Phase 3 normal poses, or Phase 4 normal expressions.

## Notes

The project height source of truth is `docs/02_characters/character_bible.md`.
Source images here are raw candidates; final training selection and resizing
should be done in the LoRA preparation step.
