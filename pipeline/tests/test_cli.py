import shutil
from typing import TYPE_CHECKING

import pytest

from touche_pipeline.cli import DATA, main

if TYPE_CHECKING:
    from pathlib import Path


def test_committed_data_passes_check(capsys: pytest.CaptureFixture[str]) -> None:
    assert main(["check"]) == 0, capsys.readouterr().err


@pytest.fixture
def data(tmp_path: Path) -> Path:
    _ = shutil.copytree(DATA / "layouts", tmp_path / "layouts")
    return tmp_path


def test_all_writes_the_schema_check_then_passes(data: Path) -> None:
    assert main(["check"], data) == 1  # no schema yet
    assert main(["all"], data) == 0
    assert (data / "schema" / "layout.schema.json").exists()
    assert main(["check"], data) == 0


def test_check_flags_a_stale_schema(data: Path, capsys: pytest.CaptureFixture[str]) -> None:
    _ = main(["all"], data)
    _ = (data / "schema" / "layout.schema.json").write_text("{}")
    assert main(["check"], data) == 1
    assert "stale" in capsys.readouterr().err


@pytest.mark.parametrize(
    ("content", "message"),
    [
        ('{"id": "xx-yy", "keys": {}}', "does not match the file name"),
        ('{"id": "en-us", "keys": {"KeyQ": {}}}', "validation error"),
    ],
)
def test_check_flags_bad_layouts(
    data: Path, content: str, message: str, capsys: pytest.CaptureFixture[str]
) -> None:
    _ = main(["all"], data)
    _ = (data / "layouts" / "en-us.json").write_text(content)
    assert main(["check"], data) == 1
    assert message in capsys.readouterr().err


def test_unknown_command_exits() -> None:
    with pytest.raises(SystemExit):
        _ = main(["nope"])
