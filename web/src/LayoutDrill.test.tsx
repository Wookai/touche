// @vitest-environment happy-dom
import type { Layout } from "@touche/engine";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutDrill } from "./LayoutDrill.tsx";

// Tells React this is a test environment, so act() flushes effects and updates.
// biome-ignore lint/style/useNamingConvention: React reads this exact global name
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLElement;
let root: Root;
let chosen: Layout | undefined;

function render(): void {
  act(() =>
    root.render(
      <LayoutDrill
        lang="en"
        onDone={(l) => {
          chosen = l;
        }}
      />,
    ),
  );
}

function press(code: string, key: string, init: KeyboardEventInit = {}): void {
  act(() => {
    globalThis.dispatchEvent(new KeyboardEvent("keydown", { code, key, ...init }));
  });
}

function click(label: string): void {
  const button = [...container.querySelectorAll("button")].find((b) => b.textContent === label);
  if (button === undefined) {
    throw new Error(`no button ${label} in ${container.innerHTML}`);
  }
  act(() => button.click());
}

beforeEach(() => {
  container = document.createElement("div");
  root = createRoot(container);
  chosen = undefined;
});

afterEach(() => {
  act(() => root.unmount());
  vi.unstubAllGlobals();
});

describe("LayoutDrill", () => {
  it("asks for keys until one layout is left, then confirms it", () => {
    render();
    expect(container.querySelector("kbd")?.textContent).toBe("z");
    press("ShiftLeft", "Shift");
    press("KeyZ", "z", { ctrlKey: true }); // a shortcut, not typing
    expect(container.querySelector("kbd")?.textContent).toBe("z");
    press("KeyZ", "z");
    expect(container.querySelector("kbd")?.textContent).toBe('"');
    press("Quote", '"', { shiftKey: true });
    expect(container.textContent).toContain("English (US)");
    click("That’s right");
    expect(chosen?.id).toBe("en-us");
  });

  it("lets the learner override the detected layout", () => {
    render();
    press("KeyY", "z");
    expect(container.textContent).toContain("Swiss French (QWERTZ)");
    click("Choose another");
    click("French (AZERTY)");
    expect(chosen?.id).toBe("fr-fr");
  });

  it("falls back to the picker on a layout it does not know", () => {
    render();
    press("KeyQ", "'");
    expect(container.textContent).toContain("Choose your keyboard:");
    click("English (UK)");
    expect(chosen?.id).toBe("en-gb");
  });

  it("detects without asking where the Keyboard API exists", async () => {
    const map = new Map([
      ["KeyQ", "a"],
      ["KeyA", "q"],
    ]);
    vi.stubGlobal("navigator", { keyboard: { getLayoutMap: () => Promise.resolve(map) } });
    render();
    await act(async () => {
      await Promise.resolve();
    });
    expect(container.textContent).toContain("French (AZERTY)");
  });

  it("keeps asking when the Keyboard API refuses", async () => {
    vi.stubGlobal("navigator", {
      keyboard: { getLayoutMap: () => Promise.reject(new Error("not allowed")) },
    });
    render();
    await act(async () => {
      await Promise.resolve();
    });
    expect(container.querySelector("kbd")?.textContent).toBe("z");
  });
});
