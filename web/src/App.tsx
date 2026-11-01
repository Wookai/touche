import type { Layout } from "@touche/engine";
import { useState } from "react";
import { type Lang, layoutName, t } from "./i18n/i18n.ts";
import { LayoutDrill } from "./LayoutDrill.tsx";

interface Props {
  readonly lang: Lang;
}

// Shell: detect the layout, then (once the engine has lessons) start one.
// shortcut: the layout lives in memory only, persist it per profile once profiles exist.
export function App({ lang }: Props) {
  const [layout, setLayout] = useState<Layout>();
  if (layout === undefined) {
    return (
      <main>
        <LayoutDrill lang={lang} onDone={setLayout} />
      </main>
    );
  }
  return (
    <main>
      <p>{t(lang, "app.layout", { layout: layoutName(lang, layout.id) })}</p>
    </main>
  );
}
