# STATUS — touche

Updated: 2026-10-24 by Claude Code (local session: move to Wookai, Pages deploy)

## Done this session
- Repo moved to `Wookai/touche` and recreated from two clean commits, so no history, issue or PR names the private org or its repos. The earlier scaffold issue and PR are gone; their content is in commit `#1 Scaffold touche…`.
- `pages.yml`: builds `web/` and deploys it to Pages on push to `main` (and on manual dispatch). Actions pinned by SHA; actionlint and zizmor clean.

## Open (next session picks up here, in order)
1. Layout data files (fr-ch, fr-fr, en-us, en-gb) with their schema, and the calibration drill.
2. Engine: logger, learner model, unlock rule with property tests; then generator and scheduler.
3. Simulator with sessions-to-target output (`npm run sim`).
4. Word-list pipeline for en and fr, once licences are settled.

## Needs the maintainer
- [ ] Confirm word-list licences (Lexique, wordfreq, SUBTLEX, Manulex) before the pipeline ships any list.
- [ ] Archive the Claude Doc version of the design; DESIGN.md here is canonical.

## Blocked / waiting on external
- Word-list pipeline: licences.

## Health
- Tests: engine and web vitest, pipeline pytest (86% coverage); typecheck, build, ruff, basedpyright, actionlint, zizmor clean locally.
- Deploy: https://wookai.github.io/touche/ from `main` via `pages.yml`.
- Local Node is 22 on the maintainer's WSL box while `.nvmrc` says 24; checks pass on both, CI uses 24.

## Decisions made in-session
- Standalone public repo in a personal account, no private dependencies (ADR 0001).
- Code MIT, generated content CC0, derived lists keep upstream licence (ADR 0002).
- Kids sentences generated once offline, reviewed, cached (ADR 0003).
- Content, pipeline, i18n, DESIGN.md and `.github/` always get the maintainer's review.
- Renovate installed on `Wookai/touche` (GitHub App, this repo only).
- Pages deploys straight from `main` without re-running checks: the ruleset already requires a green `ci` on every PR.
