"""Keyboard layouts (DESIGN.md, Layouts and languages): physical key -> characters and finger."""

from enum import StrEnum
from typing import Annotated, ClassVar, Literal, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

# KeyboardEvent.code values a layout may map; a typo in a data file fails validation.
type Code = Literal[
    "Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8",
    "Digit9", "Digit0", "Minus", "Equal", "Backspace",
    "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
    "BracketLeft", "BracketRight", "Backslash",
    "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote",
    "ShiftLeft", "IntlBackslash", "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM",
    "Comma", "Period", "Slash", "ShiftRight",
    "Space", "AltRight",
]  # fmt: skip

type Char = Annotated[str, Field(min_length=1, max_length=1)]


class Hand(StrEnum):
    LEFT = "left"
    RIGHT = "right"


class Finger(StrEnum):
    PINKY = "pinky"
    RING = "ring"
    MIDDLE = "middle"
    INDEX = "index"
    THUMB = "thumb"


class Row(StrEnum):
    NUMBER = "number"
    TOP = "top"
    HOME = "home"
    BOTTOM = "bottom"
    SPACE = "space"


class Level(StrEnum):
    """Modifier level a character is typed at; AltGr is AltRight on these layouts."""

    BASE = "base"
    SHIFT = "shift"
    ALTGR = "altgr"


class Key(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="forbid", frozen=True)

    hand: Hand
    finger: Finger
    row: Row
    chars: dict[Level, Char] = {}
    # Levels whose character is a dead key: it types nothing alone and accents the next letter.
    dead: list[Level] = []

    @model_validator(mode="after")
    def _dead_levels_have_chars(self) -> Self:
        if missing := set(self.dead) - self.chars.keys():
            msg = f"dead levels without a character: {sorted(missing)}"
            raise ValueError(msg)
        return self


class Layout(BaseModel):
    model_config: ClassVar[ConfigDict] = ConfigDict(extra="forbid", frozen=True)

    id: Annotated[str, Field(pattern=r"^[a-z]{2}-[a-z]{2}$")]
    keys: dict[Code, Key]
