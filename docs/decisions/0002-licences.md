# 0002 — Licences

Date: 2026-10-19 · Status: accepted

## Decision

- Code: MIT (`LICENSE`).
- Content we generate (kids sentences, layout files, curriculum orders): CC0.
- Content derived from third-party lists (frequency and graded word lists): the upstream licence, usually CC BY-SA 4.0, recorded per file in `data/LICENSES.md`, with attribution in the site footer. Share-alike applies to those data files only, not to the code.
- Nothing is copied from GPL or AGPL projects (Monkeytype, keybr), code or data. Reading them for ideas is fine.
- A source with an unknown or non-redistributable licence is not shipped.

## Why

MIT keeps the project easy to reuse; there is no commercial plan, so a copyleft code licence protects nothing we need. Mixing licences per data file is common and explicit when `data/LICENSES.md` lists each one.
