# STATUS — touche

Updated: 2026-11-01 by Claude Code (local session: #31 placement test design, #33 layout data, #35 layout detection engine and drill screen)

## Done this session
- #31 DESIGN.md: the adult 60 s baseline becomes a staged placement test (home row → frequent letters → alphabet
  → capitals and punctuation), passed on the unlock rule's accuracy terms, stopping at the first failed stage.
  Kids still start from zero. Design only; implementation waits for layouts and the learner model.
- #33 `data/layouts/{en-us,en-gb,fr-ch,fr-fr}.json`: code → base/shift/AltGr characters, dead keys, hand, finger,
  row. Schema from pydantic models in `pipeline/` (`data/schema/layout.schema.json`); `touche-pipeline all`
  exports it, `check` validates the files and fails on a stale schema, both under pytest so CI enforces them.
- #35, engine half: `candidates(layouts, observations)` keeps the layouts consistent with every observed
  `(code, key)` pair (typos still narrow, modifiers and unmapped keys ignored); `nextProbe` picks the character
  that splits them best (no AltGr, letters first). v1 layouts resolve in at most two probes (`z`, then `"`), or
  in one step from a `getLayoutMap()` map. `Layout` type generated from the schema (`npm run types`,
  json-schema-to-typescript); a test fails when it is stale.
- #35, web half: the app opens on the layout drill (`web/src/LayoutDrill.tsx`, logic in `drill.ts`): Keyboard API
  map where present, else one probe at a time, confirm or override, picker for unknown layouts. First i18n
  (`web/src/i18n/{en,fr}.json`, `t()`, UI language from `navigator.languages`). happy-dom for component tests.
- #21 Renovate: patch and minor bumps automerge once `ci` is green; majors wait for a tick under Pending Approval on the
  Dependency Dashboard (#5), as Python already did.
- #14, first item: Biome 2.6 as the TypeScript lint and format baseline (`biome.jsonc`, every rule at error
  severity, same shape as the Python baseline), `npm run lint` in CI before tsc, `npm run format` to write
  fixes. Six exemptions, each with its reason in the config or inline. Markdown is left to hand formatting.
- #14: the hard rule "engine/src never imports from web/" is enforced by a Biome `noRestrictedImports`
  override on `engine/src/**` (also bans imports of `engine/bin` and `engine/test` from src). Verified on
  probe files: four forbidden imports fail, a `web/src` import of the engine passes.
- #14: vitest coverage floor at 80% (statements, branches, functions, lines) over `engine/src` and `web/src`,
  the counterpart of the pipeline's `--cov-fail-under=80`; `npm test` now runs with coverage. The DOM
  bootstrap `web/src/main.tsx` is excluded.
- #14: knip in CI (`npm run knip`), the counterpart of deptry: unused files, exports, types and dependencies
  across the npm workspaces, with vitest, vite and TypeScript understood through its built-in plugins.

## Open (next session picks up here, in order)
1. #14, remaining: bundle budget for the initial chunk, once real code lands.
2. Profiles in IndexedDB (kids/adult mode, layout, language); the drill's choice is in memory until then.
3. Engine: logger, learner model, unlock rule with property tests; then generator and scheduler.
4. Simulator with sessions-to-target output (`npm run sim`).
5. Word-list pipeline for en and fr, once licences are settled.
6. #31 placement test: engine (stage generation, pass/stop rule, seeding) with simulator check, then the web flow.

## Needs the maintainer
- [ ] Review the #35 French UI strings (`web/src/i18n/fr.json`, tutoiement) and try the drill on a real keyboard.
- [ ] Close PR #2 once this PR is in: its deploy lives in `ci.yml` now.
- [ ] #12 ruleset: require branches to be up to date. #15 free security features (Dependabot alerts, CodeQL,
      SHA pinning required, private vulnerability reporting, non-provider secret patterns); commands in the issue.
- [ ] Confirm word-list licences (Lexique, wordfreq, SUBTLEX, Manulex) before the pipeline ships any list.
- [ ] Archive the Claude Doc version of the design; DESIGN.md here is canonical.

## Blocked / waiting on external
- Word-list pipeline: licences.

## Health
- Tests: engine and web vitest, pipeline pytest (98% coverage); typecheck, build, ruff, basedpyright, actionlint, zizmor clean locally.
- Deploy: https://wookai.github.io/touche/ from `main`, by the `deploy` job of `ci.yml`.

## Decisions made in-session
- Standalone public repo in a personal account, no private dependencies (ADR 0001).
- Code MIT, generated content CC0, derived lists keep upstream licence (ADR 0002).
- Kids sentences generated once offline, reviewed, cached (ADR 0003).
- Content, pipeline, i18n, DESIGN.md and `.github/` always get the maintainer's review.
- Adults get a staged placement test instead of a 60 s baseline; kids always start from zero (#31).
- Renovate installed on `Wookai/touche` (GitHub App, this repo only). Patch/minor automerge on green `ci`, majors need a
  Dependency Dashboard tick (#21).
- Deploy only from a `ci` run in which every check passed; vulnerability audits are scheduled, never required.
