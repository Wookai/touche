// Layout detection (DESIGN.md, Layouts and languages): narrow the candidate layouts
// from observed (KeyboardEvent.code, KeyboardEvent.key) pairs, and pick the next
// character to ask for. Every keystroke is evidence, so a typo narrows the set too.
import type { Layout } from "./layout.generated.ts";

const DEAD = "Dead";
const LETTER = /^\p{L}$/u;

function consistent(layout: Layout, { code, key }: Observation): boolean {
  const mapped = layout.keys[code];
  // A key the layout does not map (numpad, an ISO key on ANSI data) says nothing against it.
  if (mapped === undefined) {
    return true;
  }
  if (key === DEAD) {
    return (mapped.dead ?? []).length > 0;
  }
  return Object.values(mapped.chars ?? {}).includes(key);
}

// The physical key and modifier level that type `char`, skipping dead levels.
function find(layout: Layout, char: string): { code: string; level: string } | undefined {
  for (const [code, key] of Object.entries(layout.keys)) {
    const dead: string[] = key.dead ?? [];
    for (const [level, c] of Object.entries(key.chars ?? {})) {
      if (c === char && !dead.includes(level)) {
        return { code, level };
      }
    }
  }
  return undefined;
}

// How good a probe `char` is, lower first: needs AltGr on some candidate, is not a
// letter, size of the largest group of candidates typing it on the same physical key.
// undefined when some candidate cannot type it or it splits nothing.
function rank(layouts: readonly Layout[], char: string): number[] | undefined {
  const groups = new Map<string, number>();
  let altgr = 0;
  for (const layout of layouts) {
    const found = find(layout, char);
    if (found === undefined) {
      return undefined;
    }
    groups.set(found.code, (groups.get(found.code) ?? 0) + 1);
    altgr = Math.max(altgr, Number(found.level === "altgr"));
  }
  const largest = Math.max(...groups.values());
  if (largest === layouts.length) {
    return undefined;
  }
  return [altgr, Number(!LETTER.test(char)), largest];
}

function better(a: number[], b: number[]): boolean {
  const i = a.findIndex((x, j) => x !== b[j]);
  return i !== -1 && (a[i] ?? 0) < (b[i] ?? 0);
}

export interface Observation {
  readonly code: string;
  readonly key: string;
}

/** Layouts consistent with every observation; modifiers and named keys ("Shift", "Enter") are ignored. */
export function candidates(
  layouts: readonly Layout[],
  observations: Iterable<Observation>,
): Layout[] {
  const typed = [...observations].filter((o) => o.key.length === 1 || o.key === DEAD);
  return layouts.filter((layout) => typed.every((o) => consistent(layout, o)));
}

/**
 * The character, typable on every candidate, that best splits them by physical key:
 * no AltGr first, then letters, then the smallest largest group. `undefined` when
 * fewer than two candidates remain or nothing tells them apart.
 */
export function nextProbe(layouts: readonly Layout[]): string | undefined {
  const [first] = layouts;
  if (first === undefined || layouts.length < 2) {
    return undefined;
  }
  let best: { char: string; rank: number[] } | undefined;
  const chars = Object.values(first.keys).flatMap((key) => Object.values(key.chars ?? {}));
  for (const char of new Set(chars)) {
    const r = rank(layouts, char);
    if (r !== undefined && (best === undefined || better(r, best.rank))) {
      best = { char, rank: r };
    }
  }
  return best?.char;
}
