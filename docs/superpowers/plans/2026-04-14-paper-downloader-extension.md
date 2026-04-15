---
doc_type: plan
status: completed
implements:
  - docs/superpowers/specs/2026-04-14-paper-downloader-extension-design.md
verified_by:
  - node --test tests/*.test.js
supersedes: []
related: []
---

# Paper Downloader Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Spec Path:** `docs/superpowers/specs/2026-04-14-paper-downloader-extension-design.md`

**Goal:** Ship a first working Chromium MV3 paper-downloader extension with configurable naming and save destinations.

**Allowed Write Scope:** Repository docs, extension source files, tests, and verification artifacts.

**Verification Commands:** `node --test tests/*.test.js`

**Evidence Location:** `artifacts/verification/2026-04-14-mvp-verification.md`

**Rule:** Do not expand scope during implementation. New requests must be recorded through `CHANGE_REQUEST_TEMPLATE.md`.

---

## File Map

- Create: `manifest.json`
- Create: `popup.html`
- Create: `options.html`
- Create: `styles.css`
- Create: `src/popup.js`
- Create: `src/options.js`
- Create: `src/lib/defaults.js`
- Create: `src/lib/metadata.js`
- Create: `src/lib/naming.js`
- Create: `src/lib/storage.js`
- Create: `src/lib/fs-access.js`
- Create: `src/lib/download.js`
- Create: `tests/metadata.test.js`
- Create: `tests/naming.test.js`
- Modify: `docs/project/README.md`
- Modify: `docs/architecture/overview.md`
- Modify: `docs/testing/strategy.md`

## Tasks

### Task 1: Define and prove the pure domain logic

- [x] Write failing tests for metadata extraction and naming behavior
- [x] Run the tests and confirm the expected red state
- [x] Implement the smallest metadata and naming modules that make the tests pass
- [x] Re-run focused verification
- [x] Record any acceptance-impacting edge cases in docs

### Task 2: Build the browser API adapters and popup flow

- [x] Add settings persistence, directory-handle persistence, and folder write helpers
- [x] Build the popup UI that inspects the active tab, renders editable metadata, and triggers the save flow
- [x] Implement explicit status messages for filesystem saves, download fallback, and hard failures
- [x] Manually sanity-check imports and extension wiring
- [x] Update docs if the actual boundary shape differs from the spec

### Task 3: Build the options flow and delivery docs

- [x] Add the options page with save-mode controls, folder selection, and token template fields
- [x] Write install and usage documentation
- [x] Run the verification command fresh
- [x] Save verification evidence under `artifacts/verification/`
- [x] Sync `PROGRESS.md`, `NEXT_STEP.md`, `MEMORY.md`, and `PROJECT_LOGS.md`

## Execution Truth

```yaml
schema: harness-execution-truth.v1
claims:
  - claim_id: plan.paper-downloader.frozen-contracts
    source_spec: docs/superpowers/specs/2026-04-14-paper-downloader-extension-design.md
    source_anchor: frozen_contracts
    source_hash: 2026-04-14-paper-downloader-v1
```

## Completion Checklist

- [x] Spec requirements are covered
- [x] Verification commands were run fresh
- [x] Evidence location is populated or explicitly noted
- [x] Repository state docs are updated
