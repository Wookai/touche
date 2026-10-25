# STATUS — touche

Updated: 2026-10-25 by Claude Code (local session: #14, knip)

## Done this session
- #14, first item: Biome 2.6 as the TypeScript lint and format baseline (`biome.jsonc`, every rule at error
  severity, same shape as the Python baseline), `npm run lint` in CI before tsc, `npm run format` to write
  fixes. Six exemptions, each with its reason in the config or inline. Markdown is left to hand formatting.
- #14: knip in CI (`npm run knip`), the counterpart of deptry: unused files, exports, types and dependencies
  across the npm workspaces, with vitest, vite and TypeScript understood through its built-in plugins.

## Open (next session picks up here, in order)
1. #14, remaining items: restricted imports (engine/src never imports web/), knip, vitest coverage floor, bundle budget.
2. Layout data files (fr-ch, fr-fr, en-us, en-gb) with their schema, and the calibration drill.
3. Engine: logger, learner model, unlock rule with property tests; then generator and scheduler.
4. Simulator with sessions-to-target output (`npm run sim`).
5. Word-list pipeline for en and fr, once licences are settled.

## Needs the maintainer
- [ ] Close PR #2 once this PR is in: its deploy lives in `ci.yml` now.
- [ ] #12 ruleset: require branches to be up to date. #15 free security features (Dependabot alerts, CodeQL,
      SHA pinning required, private vulnerability reporting, non-provider secret patterns); commands in the issue.
- [ ] Confirm word-list licences (Lexique, wordfreq, SUBTLEX, Manulex) before the pipeline ships any list.
- [ ] Archive the Claude Doc version of the design; DESIGN.md here is canonical.

## Blocked / waiting on external
- Word-list pipeline: licences.

## Health
- Tests: engine and web vitest, pipeline pytest (86% coverage); typecheck, build, ruff, basedpyright, actionlint, zizmor clean locally.
- Deploy: https://wookai.github.io/touche/ from `main`, by the `deploy` job of `ci.yml`.

## Decisions made in-session
- Standalone public repo in a personal account, no private dependencies (ADR 0001).
- Code MIT, generated content CC0, derived lists keep upstream licence (ADR 0002).
- Kids sentences generated once offline, reviewed, cached (ADR 0003).
- Content, pipeline, i18n, DESIGN.md and `.github/` always get the maintainer's review.
- Renovate installed on `Wookai/touche` (GitHub App, this repo only).
- Deploy only from a `ci` run in which every check passed; vulnerability audits are scheduled, never required.
