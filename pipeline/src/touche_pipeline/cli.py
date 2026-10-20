"""touche-pipeline: rebuild and validate data/ (docs/DESIGN.md, Lesson generator)."""

import argparse
import sys
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from collections.abc import Sequence

COMMANDS = ("all", "check")


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="touche-pipeline")
    _ = parser.add_argument("command", choices=COMMANDS)
    command = str(parser.parse_args(argv).command)  # pyright: ignore[reportAny] argparse.Namespace is untyped
    # Placeholder until the word-list and schema steps exist (STATUS.md).
    _ = sys.stdout.write(f"touche-pipeline {command}: nothing to do yet\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
