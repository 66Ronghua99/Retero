# Memory

## Stable Notes

- This repository was initialized from the local Harness bootstrap pack.
- `.harness/bootstrap.toml` is the machine-readable bootstrap source of truth.
- Template files under `docs/superpowers/templates/` define the required document shape.
- Harness skills define governance standards; Superpowers drives workflow execution.
- `harness:doc-health` owns repository truth and pointer consistency.
- `harness:lint-test-design` owns lint/test invariant and hardgate design.
- `harness:refactor` owns architecture-drift review and refactor governance.
- The current product target is a Chromium MV3 extension, not an Obsidian plugin or a desktop app.
- The MVP prefers explicit failure when no PDF URL is discoverable, and only allows a visible fallback from direct folder writes to browser downloads when the user has enabled that option.
- arXiv PDF pages do not expose the paper metadata fields we need in-page; when the active URL is `/pdf/<id>`, metadata should be enriched from the matching `/abs/<id>` page.
- Chrome's built-in PDF viewer may reject `chrome.scripting.executeScript` even when the URL looks like a normal paper PDF URL, so tab-level fallback inspection is required before declaring the page unsupported.

## Working Heuristics

- Keep repository-local docs ahead of implementation drift.
- Encode repeated review feedback into templates, lint, tests, or recurring refactor work.
- Prefer explicit failure semantics over silent fallback behavior.
- Route stale docs to `harness:doc-health`, enforceable recurring issues to `harness:lint-test-design`, and architecture erosion to `harness:refactor`.
- Keep the extension implementation small and dependency-light so it can be loaded unpacked without a bundling pipeline.
