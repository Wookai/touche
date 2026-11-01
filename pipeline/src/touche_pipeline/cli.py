"""touche-pipeline: rebuild and validate data/ (DESIGN.md, Stack and architecture)."""

import argparse
import json
import sys
from pathlib import Path
from typing import TYPE_CHECKING

from pydantic import ValidationError

from touche_pipeline.layout import Layout

if TYPE_CHECKING:
    from collections.abc import Sequence

COMMANDS = ("all", "check")
DATA = Path(__file__).resolve().parents[3] / "data"
SCHEMAS = {"layout": Layout}


def schema_path(data: Path, name: str) -> Path:
    return data / "schema" / f"{name}.schema.json"


def write_schemas(data: Path) -> None:
    for name, model in SCHEMAS.items():
        path = schema_path(data, name)
        path.parent.mkdir(parents=True, exist_ok=True)
        schema = json.dumps(model.model_json_schema(), indent=2, ensure_ascii=False)
        _ = path.write_text(schema + "\n", encoding="utf-8")


def check(data: Path) -> list[str]:
    """Return one message per problem: a stale schema or a data file that does not validate."""
    problems: list[str] = []
    for name, model in SCHEMAS.items():
        path = schema_path(data, name)
        # Compared parsed, so Biome's reformatting of the committed file is not a difference.
        if not path.exists() or json.loads(path.read_text("utf-8")) != model.model_json_schema():
            problems.append(f"{path}: stale, run touche-pipeline all")
    for path in sorted((data / "layouts").glob("*.json")):
        try:
            layout = Layout.model_validate_json(path.read_text("utf-8"))
        except ValidationError as e:
            problems.append(f"{path}: {e}")
            continue
        if layout.id != path.stem:
            problems.append(f"{path}: id {layout.id!r} does not match the file name")
    return problems


def main(argv: Sequence[str] | None = None, data: Path = DATA) -> int:
    parser = argparse.ArgumentParser(prog="touche-pipeline")
    _ = parser.add_argument("command", choices=COMMANDS)
    command = str(parser.parse_args(argv).command)  # pyright: ignore[reportAny] argparse.Namespace is untyped
    if command == "all":
        write_schemas(data)
    problems = check(data)
    for problem in problems:
        _ = sys.stderr.write(problem + "\n")
    _ = sys.stdout.write(f"touche-pipeline {command}: {len(problems)} problem(s)\n")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
