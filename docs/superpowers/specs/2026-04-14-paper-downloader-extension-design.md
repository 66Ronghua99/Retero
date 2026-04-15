---
doc_type: spec
status: approved
supersedes: []
related: []
---

# Paper Downloader Extension Spec

## Problem

The user wants a Zotero-like paper download plugin that can capture PDFs from paper pages, save them into a configurable library directory, and apply a consistent filename structure based on paper metadata so the files are easier to search and manage inside Obsidian.

## Success

- A Chromium extension popup can inspect the active tab and detect a PDF URL plus core metadata fields when available.
- The extension options page lets the user configure a target save mode, a directory template, and a filename template without code changes.
- Saving a paper produces a normalized target path such as `papers/2024/ACL/2024 - ACL - Retrieval Augmented Generation.pdf`.
- If direct folder access is not available, the extension either saves via the configured browser downloads fallback or fails with a clear message.

## Out Of Scope

- Deep, site-specific parsers for every publisher or paper host
- Automatic note creation inside Obsidian
- Browser sync, cloud storage, or citation export formats

## Critical Paths

1. User opens the extension on a paper page, reviews or edits detected metadata, and saves the PDF into a deterministic path.
2. User opens options, selects a local target folder or download mode, customizes templates, and sees that future saves follow the same convention.

## Frozen Contracts
<!-- drift_anchor: frozen_contracts -->

- The first release is a Chromium Manifest V3 extension loaded unpacked from this repository.
- Metadata extraction is heuristic-first: citation meta tags, JSON-LD, direct PDF URLs, and obvious PDF links are supported.
- The popup displays editable metadata fields before saving so imperfect extraction does not block the workflow.
- Save mode supports `filesystem` and `downloads`. `filesystem` is preferred when the browser supports File System Access and the user has granted a folder handle.
- Filename generation uses token templates with at least `title`, `conference`, `year`, `date`, `authors`, and `sourceHost`.

## Architecture Invariants

- Browser APIs stay out of the pure metadata and naming modules.
- The popup owns orchestration only; it does not embed extraction heuristics directly.
- Any fallback from `filesystem` to `downloads` is explicit in the UI result state.
- Missing PDF URLs are treated as actionable errors, not silently bypassed.

## Failure Policy

- If the current tab cannot be inspected because it is a restricted browser page, the popup shows an unsupported-page message.
- If no PDF URL can be detected, saving is blocked until the user provides or corrects one.
- If direct folder writes fail and downloads fallback is disabled, the save action fails loudly with the underlying reason.
- If direct folder writes fail and downloads fallback is enabled, the UI reports that the file was saved via browser downloads instead.

## Acceptance
<!-- drift_anchor: acceptance -->

- Automated tests cover metadata extraction heuristics and path rendering.
- The repository includes installable extension assets: `manifest.json`, popup page, options page, and source modules.
- Documentation explains how to load the unpacked extension and configure the folder strategy.
- Fresh verification evidence is recorded for the automated test run.

## Deferred Decisions

- Whether to generate Markdown sidecar notes for Obsidian automatically
- Whether to add site-specific extractors for arXiv, ACL Anthology, OpenReview, Semantic Scholar, and publisher portals
- Whether to package a release zip or migrate to a bundler later

