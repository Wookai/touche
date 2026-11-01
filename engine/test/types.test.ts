import { expect, it } from "vitest";
import { isStale } from "../bin/types.ts";

it("layout.generated.ts matches data/schema (run `npm run types`)", async () => {
  expect(await isStale()).toBe(false);
});
