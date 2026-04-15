# Testing Strategy

## Goal

Protect the paper-save workflow with cheap, repeatable proof before any manual browser validation.

## Required Layers

1. Pure behavior tests for metadata extraction heuristics
2. Pure behavior tests for filename and subdirectory normalization
3. Manual extension checks on representative paper pages before broader release
4. Fresh verification evidence recorded under `artifacts/verification/`

## Evidence Rule

Before claiming completion, record the commands run and the evidence produced.

## MVP Commands

- `node --test tests/*.test.js`
- Optional manual smoke test in Chromium with the unpacked extension loaded from the repository root
