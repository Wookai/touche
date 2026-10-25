// Seeded PRNG so the generator is deterministic given its seed (CLAUDE.md).
// mulberry32: 32-bit state, good enough for sampling words, not for crypto.
/** biome-ignore-all lint/suspicious/noBitwiseOperators: mulberry32 is 32-bit integer arithmetic by definition */

const INCREMENT = 0x6d_2b_79_f5;
const TWO_POW_32 = 4_294_967_296;

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + INCREMENT) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / TWO_POW_32;
  };
}
