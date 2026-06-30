# Vincia LoRA Source Candidates

Source candidates for Vincia, copied from the Issue #7 studio-yokonami dataset
and the ChatGPT Images2 batch generated on 2026-06-30.

## Source

- Upstream: `studio-yokonami/characters/vincia/adult/`
- Issue basis: `kako-jun/studio-yokonami#7`
- Batch issue: `kako-jun/studio-yokonami#23`
- Character id: `vincia`
- Trigger candidate: `vinciachar`

## Current Candidate Set

- `source-candidates/001_*`: normal full-body front
- `source-candidates/002_*`: normal turnaround front
- `source-candidates/003_*`: normal turnaround side
- `source-candidates/004_*`: normal turnaround back
- `source-candidates/005_*`: open-front full-body front
- `source-candidates/006_*` - `009_*`: bust / expression references
- `source-candidates/010_*` - `013_*`: ChatGPT Images2 Phase 1 normal full-body views
- `source-candidates/014_*` - `017_*`: ChatGPT Images2 Phase 2 open-front full-body views
- `source-candidates/018_*` - `021_*`: ChatGPT Images2 Phase 3 normal pose variants
- `source-candidates/022_*` - `025_*`: ChatGPT Images2 Phase 4 bust / expression variants

Every source-candidate PNG has a same-name `.txt` caption.

## Rejected

`rejected/20260630-wrong-sheet-output/` and `rejected/20260630-elongated-body/`
are failed built-in ImageGEN attempts from this session. Do not mix them into LoRA
source. The sheet output was too low-resolution after cropping, and the standalone
front retries produced elongated body proportions.

## Notes

The project height source of truth is
`docs/02_characters/character_bible.md`. Vincia is 178 cm / 728 px for final
standing-portrait scaling. Source images here are raw candidates; final training
selection and resizing should be done in the LoRA preparation step.
