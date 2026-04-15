# Layer Rules

## Canonical Direction

`Pure domain -> Browser adapters -> UI entrypoints`

Browser APIs are the only approved entry point for extension runtime capabilities such as tabs, downloads, storage, and file-system handles.

## Rules

1. Pure domain modules must not import `chrome`, DOM globals, or File System Access APIs.
2. UI entrypoints may coordinate adapters but should not duplicate extraction or naming rules inline.
3. Settings, folder handles, and save operations belong to adapters, not to popup rendering code.
4. External or untrusted page metadata must be normalized before it reaches naming or save logic.
5. Any user-visible fallback path must be deliberate and surfaced in status text.
