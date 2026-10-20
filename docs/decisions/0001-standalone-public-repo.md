# 0001 — A standalone public repo

Date: 2026-10-20 · Status: accepted

## Context

touche is free and open source, with no commercial plan, and shares no code with any other project. It needs a public repo: GitHub Pages on a free plan serves only public repos, and contributors need to see the code. Hosting it inside a private organisation's tooling would mean copying that tooling's private workflows and checks into a public repo and keeping the copies in sync.

## Decision

- touche lives in a personal account as a standalone public repo, with no dependency on private repos, packages, presets or plugins.
- Its CI is self-contained (`.github/workflows/ci.yml`): workflow lint, secret scan, the Python checks for `pipeline/`, the TypeScript checks for `engine/` and `web/`, all reported as one `ci` check.
- A repo ruleset on `main` requires a pull request and a green `ci`.
- The Python strictness (ruff `ALL`, basedpyright `recommended`, strict pytest, 80% branch coverage) is kept as touche's own baseline in `pipeline/pyproject.toml`.
- Renovate uses its public `config:recommended` preset, with actions pinned to commit SHAs.

## Consequences

- Nothing here can leak private infrastructure, and forks run the full CI with no secrets.
- Improvements to shared tooling elsewhere reach touche only if someone ports them by hand.
