# STATUS — touche

Updated: 2026-10-20 by Claude Code (interactive cloud session: scaffold, standalone repo)

## Done this session
- #1 scaffold: npm workspaces `engine/` (src typechecks with no DOM or Node lib) and `web/` (Vite 8, React 18, Vitest 5, TS 6); `pipeline/` (Python 3.14, strict baseline); `ci.yml` with repo, python and web jobs reported as `ci`.
- DESIGN.md at the repo root as the source of truth; six contradictions fixed (read & type vs unlocked characters, unlock rule, kids content source, `ui.json` location, snapshot header, kids lesson length) plus layout detection, units, licences.
- ADRs 0001 (standalone public repo), 0002 (licences), 0003 (kids sentences offline). MIT `LICENSE`, `data/LICENSES.md`.
- Decoupled from the private org tooling before the move to a personal account: no vendored gate or checks, no private Renovate preset or plugin.

## Open (next session picks up here, in order)
1. After the transfer: repo ruleset on `main` (require PR + `ci`), install Renovate on the new owner.
2. `pages.yml`: build `web/` and deploy to Pages on push to `main`.
3. Layout data files (fr-ch, fr-fr, en-us, en-gb) with their schema, and the calibration drill.
4. Engine: logger, learner model, unlock rule with property tests; then generator and scheduler.
5. Simulator with sessions-to-target output (`npm run sim`).
6. Word-list pipeline for en and fr, once licences are settled.

## Needs the maintainer
- [ ] Merge #2 (the org ruleset still requires `merge-gate`, which no longer runs here: bypass-merge).
- [ ] Transfer the repo to the personal account (Settings → Transfer), make it public, enable Pages (source: GitHub Actions), add the `main` ruleset.
- [ ] Confirm word-list licences (Lexique, wordfreq, SUBTLEX, Manulex) before the pipeline ships any list.
- [ ] Archive the Claude Doc version of the design; DESIGN.md here is canonical.

## Blocked / waiting on external
- Word-list pipeline: licences.

## Health
- Tests: engine and web vitest, pipeline pytest (86% coverage); typecheck, build, ruff, basedpyright, actionlint, zizmor clean locally.
- Deploy: none yet.

## Decisions made in-session
- Standalone public repo in a personal account, no private dependencies (ADR 0001).
- Code MIT, generated content CC0, derived lists keep upstream licence (ADR 0002).
- Kids sentences generated once offline, reviewed, cached (ADR 0003).
- Content, pipeline, i18n, DESIGN.md and `.github/` always get the maintainer's review.
