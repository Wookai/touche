# Touche

A free, open-source touch-typing trainer for kids and adults, in French and English. Short adaptive lessons that drill your weak keys and letter pairs with real words, for Swiss (QWERTZ), French (AZERTY), US and UK keyboards. Everything runs in the browser: no account, no tracking, your progress never leaves your device.

Status: early development; nothing to try yet.

- Design and the research behind it: [DESIGN.md](DESIGN.md)
- Decisions: [docs/decisions/](docs/decisions/)

## Develop

Node 24 and [uv](https://docs.astral.sh/uv/).

```sh
npm install && npm run typecheck && npm test && npm run build
cd pipeline && uv sync --all-groups && uv run pytest
```

## Licence

Code: MIT. Generated content: CC0. Word lists keep their upstream licences; see [data/LICENSES.md](data/LICENSES.md).
