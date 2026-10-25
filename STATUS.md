# STATUS — touche

Updated: 2026-10-25 by Claude Code (local session: GitHub setup audit, CI hardening)

## Done this session
- Audit of the GitHub setup, filed as #10 to #15. This PR covers #10, #11 and #13:
  - `ci.yml` deploys `web/` to Pages from `main` after every check job passed (replaces the separate
    `pages.yml` of PR #2); the Node job is named `node` since it runs the engine tests too.
  - Tool pins in `env:` carry `# renovate:` comments and `renovate.json` extends
    `customManagers:githubActionsVersions`, so Renovate bumps uv, actionlint, zizmor, deptry, gitleaks and
    pip-audit. gitleaks is verified against the release's checksums file instead of a committed hash.
  - `npm audit` and `pip-audit` moved to the weekly `audit.yml`; `ci` has no step that can fail without a
    change in the PR.

## Open (next session picks up here, in order)
1. #14 TypeScript checks on a par with the pipeline baseline (lint/format, restricted imports, knip, coverage floor).
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
