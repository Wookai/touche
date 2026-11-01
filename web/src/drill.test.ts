import { describe, expect, it } from "vitest";
import { drillStep, fromLayoutMap, isTyping, LAYOUTS } from "./drill.ts";

function ids(step: ReturnType<typeof drillStep>): string[] {
  if (step.kind !== "pick") {
    return [];
  }
  return step.options.map((l) => l.id);
}

describe("drillStep", () => {
  it("asks for z first", () => {
    expect(drillStep([])).toEqual({ kind: "ask", char: "z" });
  });

  it("detects fr-ch from z on KeyY", () => {
    const step = drillStep([{ code: "KeyY", key: "z" }]);
    expect(step.kind === "detected" && step.layout.id).toBe("fr-ch");
  });

  it("asks a second probe to tell en-us from en-gb", () => {
    const step = drillStep([{ code: "KeyZ", key: "z" }]);
    expect(step).toEqual({ kind: "ask", char: '"' });
    const done = drillStep([
      { code: "KeyZ", key: "z" },
      { code: "Digit2", key: '"' },
    ]);
    expect(done.kind === "detected" && done.layout.id).toBe("en-gb");
  });

  it("offers every layout when none matches", () => {
    expect(ids(drillStep([{ code: "KeyQ", key: "'" }]))).toEqual(LAYOUTS.map((l) => l.id));
  });

  it("detects from a getLayoutMap() map in one step", () => {
    const map = new Map([
      ["KeyQ", "a"],
      ["KeyA", "q"],
      ["KeyZ", "w"],
    ]);
    const step = drillStep(fromLayoutMap(map));
    expect(step.kind === "detected" && step.layout.id).toBe("fr-fr");
  });
});

describe("isTyping", () => {
  const plain = { repeat: false, metaKey: false, ctrlKey: false, altKey: false };
  it.each([
    [plain, true],
    [{ ...plain, ctrlKey: true, altKey: true }, true], // AltGr on Windows
    [{ ...plain, ctrlKey: true }, false],
    [{ ...plain, metaKey: true }, false],
    [{ ...plain, repeat: true }, false],
  ])("%o → %s", (e, expected) => {
    expect(isTyping(e)).toBe(expected);
  });
});
