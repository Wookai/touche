// Headless typing engine: logger, learner model, generator, scheduler and
// simulated learner (docs/DESIGN.md). No DOM, no browser APIs, no timers:
// it runs unchanged in the browser, under Node tests and in the simulator.

export { candidates, nextProbe, type Observation } from "./detect.ts";
export type { Layout } from "./layout.generated.ts";
export { mulberry32 } from "./random.ts";
