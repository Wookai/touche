import { describe, expect, it } from "vitest";
import enGb from "../../data/layouts/en-gb.json" with { type: "json" };
import enUs from "../../data/layouts/en-us.json" with { type: "json" };
import frCh from "../../data/layouts/fr-ch.json" with { type: "json" };
import frFr from "../../data/layouts/fr-fr.json" with { type: "json" };
import { candidates, type Layout, nextProbe, type Observation } from "../src/index.ts";

const IDS = ["en-gb", "en-us", "fr-ch", "fr-fr"];
// JSON imports widen enums to string; pipeline/ validates the files against the schema.
const LAYOUTS = [enGb, enUs, frCh, frFr] as Layout[];
function ids(layouts: Layout[]): string[] {
  return layouts.map((l) => l.id);
}

// What the browser reports when a learner on `layout` types `char`.
function type(layout: Layout, char: string): Observation {
  const entry = Object.entries(layout.keys).find(([, key]) =>
    Object.values(key.chars ?? {}).includes(char),
  );
  if (entry === undefined) {
    throw new Error(`${char} not on ${layout.id}`);
  }
  return { code: entry[0], key: char };
}

describe("layout detection", () => {
  it.each(LAYOUTS)("identifies $id from the drill in at most two probes", (truth) => {
    const observed: Observation[] = [];
    let left = LAYOUTS;
    for (let probe = nextProbe(left); probe !== undefined; probe = nextProbe(left)) {
      observed.push(type(truth, probe));
      left = candidates(LAYOUTS, observed);
    }
    expect(ids(left)).toEqual([truth.id]);
    expect(observed.length).toBeLessThanOrEqual(2);
  });

  it.each(LAYOUTS)("identifies $id from a getLayoutMap()-shaped map in one step", (truth) => {
    const map: Observation[] = [];
    for (const [code, key] of Object.entries(truth.keys)) {
      if (key.chars?.base !== undefined) {
        map.push({ code, key: key.chars.base });
      }
    }
    expect(ids(candidates(LAYOUTS, map))).toEqual([truth.id]);
  });

  it("asks for z first: it sits on three different keys across the v1 layouts", () => {
    expect(nextProbe(LAYOUTS)).toBe("z");
  });

  it("keeps every candidate after a typo or a key that says nothing", () => {
    const noInfo = [
      { code: "KeyE", key: "e" },
      { code: "ShiftLeft", key: "Shift" },
      { code: "Numpad1", key: "1" },
    ];
    expect(ids(candidates(LAYOUTS, noInfo))).toEqual(IDS);
  });

  it("matches a dead key only to layouts with a dead key there", () => {
    expect(ids(candidates(LAYOUTS, [{ code: "BracketLeft", key: "Dead" }]))).toEqual(["fr-fr"]);
  });

  it("ends with no candidate on a layout it does not know", () => {
    const dvorak = { code: "KeyQ", key: "'" };
    expect(candidates(LAYOUTS, [dvorak])).toEqual([]);
    expect(nextProbe([])).toBeUndefined();
  });

  it("has nothing to ask when the candidates cannot be told apart", () => {
    const us = enUs as Layout;
    expect(nextProbe([us, { ...us, id: "en-xx" }])).toBeUndefined();
  });
});
