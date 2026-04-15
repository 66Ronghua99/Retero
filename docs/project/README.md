# Project Context

## Purpose

Retero is a lightweight Zotero-style paper downloader for Chromium browsers. It helps capture the current paper page, extract metadata such as title, venue, year, and authors, then save the PDF with a normalized file name into an Obsidian-friendly folder structure.

## Success Criteria

- A user can open the extension on a paper page and see detected metadata plus a generated target path preview.
- The user can configure naming templates and a target save mode from the options page without editing code.
- A saved paper lands in a predictable, searchable path that matches the configured naming convention.

## Constraints

- The MVP should work as an unpacked Chromium MV3 extension with minimal dependencies.
- Saving to an arbitrary local folder depends on the browser File System Access API and must degrade visibly, not silently.
- Metadata extraction should be heuristic and testable, but the first version does not need site-specific deep parsers.

## Related Docs

- `docs/architecture/overview.md`
- `docs/testing/strategy.md`
- `docs/superpowers/templates/SPEC_TEMPLATE.md`
- `docs/superpowers/specs/2026-04-14-paper-downloader-extension-design.md`
