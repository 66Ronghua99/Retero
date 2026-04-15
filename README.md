# Retero

Retero is a small Chromium extension for people who save a lot of papers and want those PDFs to land in a predictable folder structure instead of piling up in `Downloads`.

It is designed for a simple workflow:

- browse papers in the browser
- save them with normalized names
- keep them in a folder that Obsidian, Finder, Spotlight, Raycast, Alfred, or any other file-based workflow can index cleanly

## Why This Exists

Zotero is powerful, but sometimes the job is much smaller:

- you already manage papers as plain files
- you want your PDFs to live inside an Obsidian vault or a nearby library folder
- you care more about consistent file names than full bibliography management
- you want one click from a paper page to a clean file path

Retero focuses on that narrow problem:

- detect paper metadata from the current tab
- let you correct it before saving
- build a deterministic target path
- save directly into your library folder when the browser allows it

## What It Does

- Detects title, authors, year, date, venue, and PDF URL from the current paper page
- Supports direct PDF pages and arXiv PDF viewer fallback
- Lets you preview and edit metadata before saving
- Saves into a user-selected folder via the File System Access API
- Falls back to the browser downloads directory when you allow it
- Generates stable paths from configurable templates

## Obsidian-Friendly Workflow

Retero does not try to replace your note system.

It helps with the file-management layer so your Obsidian workflow stays simple:

- choose a folder inside or next to your vault, such as `vault/papers/`
- save papers with a uniform path pattern like `papers/2025/arXiv/2025 - arXiv - DeepSeek-R1.pdf`
- use Obsidian search, backlinks, Dataview, or manual notes on top of those files

This means you keep ownership of your files and can reorganize the rest of your workflow however you like.

## Install

This project is currently meant to be loaded as an unpacked extension.

1. Open `chrome://extensions/`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select this repository root
5. Open the extension options page
6. Choose your paper library folder
7. Adjust the naming templates if needed

## How To Use

1. Open a paper page or direct PDF page in Chromium
2. Click the `Retero` extension icon
3. Review the detected metadata
4. Fix any field that is incomplete or wrong
5. Check the target path preview
6. Click `保存 PDF`

## Naming Templates

Available tokens:

- `{{title}}`
- `{{conference}}`
- `{{year}}`
- `{{date}}`
- `{{author}}`
- `{{authors}}`
- `{{sourceHost}}`

Default structure:

```text
Subdirectory: papers/{{year}}/{{conference}}
Filename: {{year}} - {{conference}} - {{title}}
```

## Current Scope

Retero is intentionally narrow right now.

Included:

- metadata extraction from common page metadata
- editable save form
- deterministic file naming
- local-folder save mode
- browser-download fallback

Not included yet:

- Markdown sidecar generation
- automatic Obsidian note creation
- full citation database features
- deep site-specific parsers for every publisher

## Development

Run the automated checks with:

```bash
npm test
```

## Status

This is an early but usable MVP. The main goal right now is to make paper download + file management slightly smoother for an Obsidian-centered workflow.
