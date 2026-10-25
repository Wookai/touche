import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["engine", "web"],
    // Branch-coverage floor, the TypeScript counterpart of pipeline/pyproject.toml's 80%.
    // Never lowered. web/src/main.tsx is the DOM bootstrap: nothing to test without a browser.
    coverage: {
      provider: "v8",
      include: ["engine/src/**", "web/src/**"],
      exclude: ["web/src/main.tsx", "**/*.test.{ts,tsx}"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
  },
});
