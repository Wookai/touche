import { describe, expect, it } from "vitest";
import en from "./en.json" with { type: "json" };
import fr from "./fr.json" with { type: "json" };
import { layoutName, pickLang, t } from "./i18n.ts";

const UNSPACED_PUNCTUATION = /[^\u202f][:?!;]/u;

describe("i18n", () => {
  it("has the same keys in both languages", () => {
    expect(Object.keys(fr).sort()).toEqual(Object.keys(en).sort());
  });

  it("names every shipped layout", () => {
    expect(layoutName("fr", "fr-ch")).toBe("Suisse romand (QWERTZ)");
    expect(layoutName("en", "en-gb")).toBe("English (UK)");
  });

  it("fills placeholders and leaves unknown ones visible", () => {
    expect(t("en", "app.layout", { layout: "X" })).toBe("Keyboard: X");
    expect(t("en", "app.layout")).toBe("Keyboard: {layout}");
  });

  it("uses typographic French: no straight apostrophe, narrow no-break space before : and ?", () => {
    for (const s of Object.values(fr)) {
      expect(s).not.toContain("'");
      expect(s).not.toMatch(UNSPACED_PUNCTUATION);
    }
  });

  it.each([
    [["fr-CH", "en"], "fr"],
    [["de-CH", "en-GB"], "en"],
    [["de"], "en"],
    [[], "en"],
  ])("pickLang(%o) → %s", (preferred, lang) => {
    expect(pickLang(preferred)).toBe(lang);
  });
});
