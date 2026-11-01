import type { Layout, Observation } from "@touche/engine";
import { useEffect, useState } from "react";
import { drillStep, fromLayoutMap, isTyping, LAYOUTS } from "./drill.ts";
import { type Lang, layoutName, t } from "./i18n/i18n.ts";
import styles from "./LayoutDrill.module.css";

// The Keyboard API is Chromium-only and missing from TypeScript's DOM types.
interface KeyboardApi {
  getLayoutMap: () => Promise<ReadonlyMap<string, string>>;
}

interface Props {
  readonly lang: Lang;
  readonly onDone: (layout: Layout) => void;
}

export function LayoutDrill({ lang, onDone }: Props) {
  const [observations, setObservations] = useState<readonly Observation[]>([]);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    const { keyboard } = navigator as { keyboard?: KeyboardApi };
    keyboard
      ?.getLayoutMap()
      .then((map) => setObservations((seen) => [...seen, ...fromLayoutMap(map)]))
      // Not allowed here (insecure context, iframe): the drill asks for keys instead.
      .catch(() => undefined);

    function onKeyDown(e: KeyboardEvent) {
      if (isTyping(e)) {
        e.preventDefault();
        setObservations((seen) => [...seen, { code: e.code, key: e.key }]);
      }
    }
    globalThis.addEventListener("keydown", onKeyDown);
    return () => globalThis.removeEventListener("keydown", onKeyDown);
  }, []);

  const step = drillStep(observations);

  if (picking || step.kind === "pick") {
    let options: readonly Layout[] = LAYOUTS;
    if (step.kind === "pick") {
      ({ options } = step);
    }
    return (
      <section className={styles.drill}>
        <h1>{t(lang, "drill.pick")}</h1>
        <ul className={styles.options}>
          {options.map((layout) => (
            <li key={layout.id}>
              <button onClick={() => onDone(layout)} type="button">
                {layoutName(lang, layout.id)}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (step.kind === "detected") {
    return (
      <section className={styles.drill}>
        <h1>{t(lang, "drill.detected")}</h1>
        <p className={styles.result}>{layoutName(lang, step.layout.id)}</p>
        <button onClick={() => onDone(step.layout)} type="button">
          {t(lang, "drill.confirm")}
        </button>
        <button onClick={() => setPicking(true)} type="button">
          {t(lang, "drill.change")}
        </button>
      </section>
    );
  }

  return (
    <section className={styles.drill}>
      <h1>{t(lang, "drill.title")}</h1>
      <p>{t(lang, "drill.ask")}</p>
      <kbd className={styles.probe}>{step.char}</kbd>
    </section>
  );
}
