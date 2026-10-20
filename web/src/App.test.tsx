import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App.tsx";

describe("App", () => {
  it("renders the shell", () => {
    expect(renderToStaticMarkup(<App />)).toContain("Touche");
  });
});
