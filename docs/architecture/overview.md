# Architecture Overview

## System Goal

Provide a narrow browser-extension workflow that turns the current tab into a paper-save action: inspect the page, normalize metadata, render a deterministic target path, and save the PDF to user-configured storage.

## Major Boundaries

- `src/popup.js`: UI orchestration, active-tab inspection, editable metadata form, save trigger
- `src/options.js`: configuration UI for templates, save mode, and target-folder selection
- `src/lib/metadata.js` and `src/lib/naming.js`: pure domain logic for extraction and path generation
- `src/lib/storage.js` and `src/lib/fs-access.js`: browser API adapters for settings persistence and folder writes

## Invariants

- Domain logic stays importable and testable outside the browser UI.
- The popup never invents a PDF URL when heuristics fail; the user must supply or correct it.
- Any fallback from direct folder writes to browser downloads must be surfaced in the result message.

## Related Docs

- `docs/architecture/layers.md`
- `docs/testing/strategy.md`
- `docs/superpowers/plans/2026-04-14-paper-downloader-extension.md`
