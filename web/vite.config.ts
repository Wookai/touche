import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./", // relative, so the build works under any Pages path
  plugins: [react()],
  test: {
    name: "web",
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
