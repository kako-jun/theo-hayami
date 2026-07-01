# Dekaris LoRA Source Candidates

Source candidates for Dekaris, copied from the ChatGPT Images2 batch generated on
2026-07-01.

## Source

- Batch issue: `kako-jun/studio-yokonami#23`
- Character id: `dekaris`
- Trigger candidate: `dekarischar`

## Current Candidate Set

- `source-candidates/001_*` - `004_*`: ChatGPT Images2 Phase 1 normal full-body views
- `source-candidates/005_*` - `008_*`: ChatGPT Images2 Phase 2 open-front full-body views
- `source-candidates/009_*` - `012_*`: ChatGPT Images2 Phase 3 normal pose variants
- `source-candidates/013_*` - `016_*`: ChatGPT Images2 Phase 4 bust / expression variants

Every source-candidate PNG has a same-name `.txt` caption.

## Notes

The project height source of truth is `docs/02_characters/character_bible.md`.
Source images here are raw candidates; final training selection and resizing
should be done in the LoRA preparation step.
