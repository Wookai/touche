# Security

touche is a static site: no accounts, no server, no analytics. Learner data stays in the browser. The things that can go wrong are in the code we ship, the dependencies we bundle and the CI that builds and deploys it.

## Reporting a vulnerability

Use GitHub's private reporting: [Report a vulnerability](https://github.com/Wookai/touche/security/advisories/new). Please do not open a public issue for anything that could put a learner at risk before it is fixed.

Include what you found, how to reproduce it and, if you know it, which commit or release is affected. You will get an acknowledgement within a week. Fixes land on `main` and deploy from there; there is no release line to backport to and no bug bounty.

## Scope

- In scope: the site at https://wookai.github.io/touche/, the code in this repository, the published build, the workflows under `.github/`.
- Out of scope: GitHub Pages and GitHub Actions themselves (report those to GitHub), and findings that need a compromised browser or machine.

## What is already in place

Every GitHub Action is pinned to a commit SHA and GitHub refuses unpinned ones. CI lints the workflows (actionlint, zizmor), scans the history for secrets (gitleaks, next to GitHub's own secret scanning with push protection), and CodeQL runs on every pull request. Dependencies are locked, updated by Renovate, and audited weekly. The deploy runs only from a `main` commit on which every check passed.
