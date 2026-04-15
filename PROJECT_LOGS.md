# Project Logs

## 2026-04-14

- Bootstrapped the repository with the local Harness greenfield skeleton.
- Froze the first delivery target as a Chromium MV3 paper-downloader extension that extracts paper metadata from the active tab, renders a normalized filename preview, and saves PDFs into either a user-selected folder or the browser downloads directory.
- Chose a browser-extension MVP instead of an Obsidian plugin because the user explicitly asked for a Zotero-like download workflow from paper pages.
- Implemented the extension popup, options page, naming engine, metadata extraction heuristics, folder-handle persistence, and browser-download fallback.
- Verified the pure logic with `npm test` and ran syntax checks on the key browser entrypoints. Evidence recorded in `artifacts/verification/2026-04-14-mvp-verification.md`.
- Root-caused a real-world metadata failure on arXiv to the user opening the extension from a PDF page, where the DOM only exposes the PDF itself and not the paper metadata tags. Fixed it by enriching `/pdf/<id>` pages from the matching `/abs/<id>` page and added a regression test.
- Root-caused a second failure mode to Chrome's PDF viewer rejecting script injection entirely. Fixed it by adding tab-level fallback inspection that synthesizes a snapshot from the tab URL/title when injection fails, then reuses the same metadata enrichment path.
