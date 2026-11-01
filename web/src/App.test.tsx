import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App.tsx";

describe("App", () => {
  it("opens on the layout drill, asking for the first probe", () => {
    const html = renderToStaticMarkup(<App lang="en" />);
    expect(html).toContain("Which keyboard do you have?");
    expect(html).toContain("<kbd");
    expect(html).toContain(">z</kbd>");
  });

  it("speaks French", () => {
    expect(renderToStaticMarkup(<App lang="fr" />)).toContain("Appuie sur cette touche");
  });
});
