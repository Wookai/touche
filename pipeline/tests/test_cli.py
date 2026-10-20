import pytest

from touche_pipeline.cli import main


@pytest.mark.parametrize("command", ["all", "check"])
def test_known_commands_succeed(command: str, capsys: pytest.CaptureFixture[str]) -> None:
    assert main([command]) == 0
    assert command in capsys.readouterr().out


def test_unknown_command_exits() -> None:
    with pytest.raises(SystemExit):
        _ = main(["nope"])
