// UI strings (CLAUDE.md: hand-written in fr.json and en.json, never inline). Typing fr
// against en's keys makes a missing French string a type error.
import en from "./en.json" with { type: "json" };
import fr from "./fr.json" with { type: "json" };

type StringKey = keyof typeof en;
type Lang = "en" | "fr";

const STRINGS: Record<Lang, Record<StringKey, string>> = { en, fr };
const PLACEHOLDER = /\{(?<name>\w+)\}/gu;

function t(lang: Lang, key: StringKey, vars: Record<string, string> = {}): string {
  return STRINGS[lang][key].replaceAll(PLACEHOLDER, (match, name: string) => vars[name] ?? match);
}

function layoutName(lang: Lang, layoutId: string): string {
  return t(lang, `layout.${layoutId}` as StringKey);
}

/** The first of the browser's preferred languages the UI speaks; English otherwise. */
function pickLang(preferred: readonly string[]): Lang {
  for (const tag of preferred) {
    const [base] = tag.toLowerCase().split("-");
    if (base === "fr" || base === "en") {
      return base;
    }
  }
  return "en";
}

export { type Lang, layoutName, pickLang, t };
