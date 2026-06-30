# Hegru LoRA Source Candidates

Source candidates for Hegru, copied from priority reference images and the
ChatGPT Images2 batch generated on 2026-07-01.

## Source

- Priority source: `docs/07_visual/reference/01_character-designs/hegru/20260630_hegru_chatgpt-generated-4view-priority_v*.png`
- Batch issue: `kako-jun/studio-yokonami#23`
- Character id: `hegru`
- Trigger candidate: `hegruchar`

## Current Candidate Set

- `source-candidates/001_*` - `004_*`: priority 4view images used as Phase 1 normal views
- `source-candidates/005_*` - `007_*`: ChatGPT Images2 Phase 2 open-front full-body views
- `source-candidates/008_*` - `011_*`: ChatGPT Images2 Phase 3 normal pose variants
- `source-candidates/012_*` - `015_*`: ChatGPT Images2 Phase 4 bust / expression variants

Every source-candidate PNG has a same-name `.txt` caption.

## Notes

Hegru started from existing priority 4view images, so no new Phase 1 image batch
was needed. The Phase 2 open-front batch currently has 3 images in this folder.
If the fourth Phase 2 image is generated later, append it as `016_*` or renumber
during final LoRA preparation.

The project height source of truth is `docs/02_characters/character_bible.md`.
Source images here are raw candidates; final training selection and resizing
should be done in the LoRA preparation step.
