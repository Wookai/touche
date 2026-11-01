// Layout detection drill (DESIGN.md, Layouts and languages): turns the keystrokes seen
// so far into what the screen shows next. Pure, so it is tested without a browser.
import { candidates, type Layout, nextProbe, type Observation } from "@touche/engine";
import enGb from "../../data/layouts/en-gb.json" with { type: "json" };
import enUs from "../../data/layouts/en-us.json" with { type: "json" };
import frCh from "../../data/layouts/fr-ch.json" with { type: "json" };
import frFr from "../../data/layouts/fr-fr.json" with { type: "json" };

// JSON imports widen enums to string; pipeline/ validates the files against the schema.
export const LAYOUTS = [enGb, enUs, frCh, frFr] as Layout[];

export type DrillStep =
  | { readonly kind: "ask"; readonly char: string }
  | { readonly kind: "detected"; readonly layout: Layout }
  | { readonly kind: "pick"; readonly options: readonly Layout[] };

export function drillStep(observations: readonly Observation[]): DrillStep {
  const left = candidates(LAYOUTS, observations);
  const [only] = left;
  if (left.length === 1 && only !== undefined) {
    return { kind: "detected", layout: only };
  }
  const char = nextProbe(left);
  if (char !== undefined) {
    return { kind: "ask", char };
  }
  // A layout we do not ship, or several we cannot tell apart: the learner picks.
  if (left.length === 0) {
    return { kind: "pick", options: LAYOUTS };
  }
  return { kind: "pick", options: left };
}

/** Observations from `navigator.keyboard.getLayoutMap()` (Chromium only): code → base character. */
export function fromLayoutMap(map: ReadonlyMap<string, string>): Observation[] {
  return [...map].map(([code, key]) => ({ code, key }));
}

/** Whether a keydown is typing, not a shortcut. AltGr reports Ctrl+Alt on Windows, so Ctrl alone is a shortcut. */
export function isTyping(e: {
  readonly repeat: boolean;
  readonly metaKey: boolean;
  readonly ctrlKey: boolean;
  readonly altKey: boolean;
}): boolean {
  return !(e.repeat || e.metaKey || (e.ctrlKey && !e.altKey));
}
