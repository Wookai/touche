import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { pickLang } from "./i18n/i18n.ts";

const lang = pickLang(navigator.languages);
document.documentElement.lang = lang;
const root = document.querySelector("#root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App lang={lang} />
    </StrictMode>,
  );
}
