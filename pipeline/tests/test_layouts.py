import string

import pytest
from pydantic import ValidationError

from touche_pipeline.cli import DATA
from touche_pipeline.layout import Key, Layout, Level, Row

IDS = ["en-gb", "en-us", "fr-ch", "fr-fr"]


def load(layout_id: str) -> Layout:
    return Layout.model_validate_json((DATA / "layouts" / f"{layout_id}.json").read_text("utf-8"))


def base(layout: Layout) -> dict[str, str]:
    """Code -> base-level character, dead keys excluded."""
    return {
        code: key.chars[Level.BASE]
        for code, key in layout.keys.items()
        if Level.BASE in key.chars and Level.BASE not in key.dead
    }


def test_every_v1_layout_is_shipped() -> None:
    assert sorted(p.stem for p in (DATA / "layouts").glob("*.json")) == IDS


@pytest.mark.parametrize(
    ("layout_id", "home"),
    [
        ("en-us", "asdfghjkl;'"),
        ("en-gb", "asdfghjkl;'#"),
        ("fr-ch", "asdfghjkléà$"),
        ("fr-fr", "qsdfghjklmù*"),
    ],
)
def test_home_row_left_to_right(layout_id: str, home: str) -> None:
    layout = load(layout_id)
    chars = base(layout)
    # dicts keep file order, which is physical left-to-right order within a row.
    row = [chars[c] for c, key in layout.keys.items() if key.row == Row.HOME and c in chars]
    assert "".join(row) == home


@pytest.mark.parametrize(
    ("layout_id", "swaps"),
    [
        ("en-us", {"KeyQ": "q", "KeyA": "a", "KeyY": "y", "KeyZ": "z", "KeyM": "m"}),
        ("fr-ch", {"KeyY": "z", "KeyZ": "y"}),
        ("fr-fr", {"KeyQ": "a", "KeyA": "q", "KeyW": "z", "KeyZ": "w", "Semicolon": "m"}),
    ],
)
def test_letter_positions(layout_id: str, swaps: dict[str, str]) -> None:
    chars = base(load(layout_id))
    assert {code: chars[code] for code in swaps} == swaps


@pytest.mark.parametrize("layout_id", IDS)
def test_every_letter_and_space_on_a_base_key(layout_id: str) -> None:
    layout = load(layout_id)
    chars = set(base(layout).values())
    assert set(string.ascii_lowercase + " ") <= chars
    for key in layout.keys.values():
        if (c := key.chars.get(Level.BASE)) in set(string.ascii_lowercase):
            assert key.chars[Level.SHIFT] == c.upper()


@pytest.mark.parametrize("layout_id", ["fr-ch", "fr-fr"])
def test_french_accents_are_single_keys(layout_id: str) -> None:
    assert set("éèàç") <= {
        c
        for key in load(layout_id).keys.values()
        for level, c in key.chars.items()
        if level not in key.dead
    }


def test_dead_keys() -> None:
    assert load("fr-ch").keys["Equal"].dead == [Level.BASE, Level.SHIFT, Level.ALTGR]
    assert load("fr-fr").keys["BracketLeft"].chars == {Level.BASE: "^", Level.SHIFT: "¨"}
    assert all(not k.dead for i in ["en-us", "en-gb"] for k in load(i).keys.values())


def test_iso_key_only_on_iso_layouts() -> None:
    assert "IntlBackslash" not in load("en-us").keys
    assert load("en-us").keys["Backslash"].row == Row.TOP
    assert all(load(i).keys["Backslash"].row == Row.HOME for i in ["en-gb", "fr-ch", "fr-fr"])


def test_dead_level_needs_a_character() -> None:
    with pytest.raises(ValidationError, match="dead levels without a character"):
        _ = Key.model_validate({"hand": "left", "finger": "pinky", "row": "top", "dead": ["base"]})


@pytest.mark.parametrize(
    "keys",
    [
        {"KeyQ": {"hand": "left", "finger": "pinky", "row": "top", "chars": {"base": "qq"}}},
        {"KeyQq": {"hand": "left", "finger": "pinky", "row": "top"}},
        {"KeyQ": {"hand": "left", "finger": "pinky", "row": "top", "colour": "red"}},
    ],
)
def test_rejects_malformed_keys(keys: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        _ = Layout.model_validate({"id": "xx-yy", "keys": keys})
