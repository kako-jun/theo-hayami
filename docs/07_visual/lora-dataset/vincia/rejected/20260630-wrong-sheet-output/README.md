# Rejected: wrong sheet output

- Reason: built-in ImageGEN returned 4 views inside one bitmap, then crops were too low-resolution for LoRA source.
- Correct procedure: use the Issue #23 prompt pattern as separate high-resolution images, one ImageGEN call per view.
- Do not mix these files into source candidates.
