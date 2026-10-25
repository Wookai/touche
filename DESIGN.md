# Touch-typing trainer — research & design principles

This file is the source of truth for touche's design. Change it in a PR; the earlier Claude Doc is retired.

## Purpose and scope

A free, open-source, static website that teaches eyes-off typing through 2–3 minute adaptive lessons, in French and English, for learners from age ~7 to adults who already type but want to improve.

**Design constraints (decided)**

- Static site on GitHub Pages; everything the learner uses runs client-side. No accounts, no analytics that leave the device.
- Local-first profiles in IndexedDB; several profiles per device (one per family member); export/import to move a profile.
- An optional sync API (Python/FastAPI) may be added later. It is additive: the site must stay fully functional with the API absent, unreachable or turned off, and the API stores only opaque, client-encrypted profile blobs keyed by a passphrase-derived id. No email, no identity, nothing a server operator can read. If a feature cannot be built under that rule, it is out of scope.
- Content pipeline, offline log analysis and the future API are Python; the learner-facing engine is TypeScript so one implementation runs in the browser, in tests and under the simulator.
- Open source in a public repo: code MIT, generated content CC0, derived word lists under their upstream licence (ADR 0002). Content and engine are the product; the UI is thin.
- Every teaching rule in this document is a hypothesis with a measurable proxy, so the lesson generator can be iterated against a simulated learner and against real logs.

**Non-goals**

- Monetisation, ads, leaderboards across users, or any feature that needs a server to work. The optional sync API is the one exception, and it never becomes load-bearing.
- Replacing a classroom curriculum. This is practice-anywhere drilling, not a course.
- Alternative layouts (Dvorak, Colemak, BÉPO) in v1. The engine should not preclude them.

## What the research says

The evidence supports eyes-off, consistent, low-error typing as the goal; it does not support strict ten-finger fingering as the goal, and it is ambivalent about drills versus sheer volume.

| Finding | Source | Implication for the product |
| --- | --- | --- |
| Self-taught typists using ~6 fingers reached speeds comparable to course-trained touch typists (n=30, motion capture). Three predictors of speed: a consistent finger-to-key mapping, preparing the next keystroke early, minimal global hand motion. | [Feit, Weir & Oulasvirta 2016](https://userinterfaces.aalto.fi/how-we-type/) | Teach and measure consistency and eyes-off, not finger count. For adults with a working habit, improve the habit rather than reset it. |
| 168k volunteers, 136M keystrokes: faster typists make fewer errors; slow typists lose most time finding and correcting errors. Fast typists use rollover on 40–70% of keystrokes. Letter pairs typed by different hands/fingers predict speed better than repetitions. | [Dhakal et al. 2018](https://userinterfaces.aalto.fi/136Mkeystrokes/); [Cambridge summary](https://www.cam.ac.uk/research/news/what-makes-a-faster-typist) | Accuracy first; model bigrams (not just keys); explicitly train alternating-hand and alternating-finger pairs; measure rollover as a progress signal. |
| 1,301 students: neither structured drills nor formal touch-typing training significantly predicted speed; accumulated keyboard exposure did. Today's typists reach high skill incidentally. | [Pinet et al. 2022](https://doi.org/10.1186/s41235-022-00424-3) | Drills alone will not move adult speed. Pair short drills with a "volume" mode on real text, and track total characters typed as a first-class metric. |
| Skilled typing runs as two loops: an outer loop (language → words) and an inner loop (words → keystrokes). The inner loop runs without conscious access to key positions; novices have to build it. | Logan & Crump 2009/2011 (approximate, from memory; see [UvA 2015 longitudinal study](https://pure.uva.nl/ws/files/29156171/23.25.PMS.pdf)) | Beginners drill the inner loop (letters, bigrams, short words); once it is automatic, practice shifts to whole words and sentences so the outer loop can run ahead. |
| Young children (5–7) can learn correct fingering on home row within weeks but gain little speed; most sources put systematic instruction at 7–9 and full touch typing from ~10. Sessions of 5–15 min, accuracy over speed, short and regular. | [Gillespie 2005](https://vtext.valdosta.edu/items/a2c304a0-25d5-4920-b70a-05591eaa68d3); [ERIC ED313002](https://files.eric.ed.gov/fulltext/ED313002.pdf); [Ratatype age guide](https://www.ratatype.co.uk/typing-tips/0406-z-iakogo-viku-navcati-ditinu-drukuvati-i-iak-ne-vidbiti-bazannia/) (vendor) | Kids mode: hard 5-minute cap, home row only for a long time, no speed targets, fingering and eyes-off as the only goals. |
| Spacing effect in motor learning: short frequent sessions beat long rare ones. | General motor-learning literature (approximate; not re-verified here) | Daily 2–3 minute lessons are the unit; streaks reward frequency, not duration. |

Two cautions. The "accuracy first" advice is well supported, but the "speed-accuracy tradeoff" is weaker than typing folklore suggests: fast typists are both faster and more accurate, so the product should not slow people down artificially for long. And the kids-pedagogy evidence is thin and old; treat it as a starting point and validate on real children.

## Teaching principles (each a testable rule)

Every rule below names what the engine does and the proxy metric that would show it working. If a proxy does not move in real logs, the rule is wrong, not the learner.

| # | Rule | Engine behaviour | Proxy metric |
| --- | --- | --- | --- |
| P1 | Eyes-off before speed | On-screen keyboard shown for new keys, faded as per-key accuracy rises; prompt to cover hands when a lesson is passed with the keyboard hidden | Share of lessons completed with keyboard hidden; accuracy delta hidden vs shown |
| P2 | Consistent mapping over canonical mapping | Beginners get the standard fingering; adults in "improve" mode keep their own mapping unless a key shows high latency variance (a sign of inconsistent fingering) | Per-key inter-key-interval variance falls over time |
| P3 | Accuracy gates progress | The next key unlocks when every unlocked key is ≥97% accurate over its last N occurrences (100 adults, 200 kids) and not slow; never on speed alone (see Unlock rule) | Error rate on newly unlocked keys stays <5% in the first 200 keystrokes |
| P4 | Train bigrams, not only keys | The model keeps per-bigram error and latency; weak bigrams are over-sampled in generated words, with alternating-hand/finger pairs preferred once keys are known | Bigram latency distribution tightens; alternating-hand bigrams get faster than same-finger ones |
| P5 | Real words as early as possible | Generator emits real frequency-ranked words constrained to the unlocked set; pseudo-words only when the set is too small (<8 letters) | Transfer: free-text WPM tracks drill WPM within 15% |
| P6 | Short, frequent sessions | Lesson = 2–3 min hard cap (≤ 2 min in kids mode); streak counts days with ≥1 lesson, not minutes | Retention curve by session frequency |
| P7 | Speed bursts to break plateaus | Once accuracy is stable, 1 in 4 lessons sets a target 10–15% above the rolling WPM, errors tolerated, then returns to accuracy mode | Rolling WPM rises after burst lessons without accuracy regressing |
| P8 | Volume on real text matters | "Read & type" mode: paragraphs from public-domain books in the learner's language, no weak-unit constraints; normalised to the unlocked characters until the alphabet and the capitals and punctuation tracks are unlocked (see Lesson types); counts toward total characters typed | Total characters typed correlates with WPM gains (per Pinet 2022) |
| P9 | Immediate, specific feedback | Each lesson ends with the three weakest keys/bigrams and one concrete instruction ("the ring finger is hitting S late"), not a score alone | Weakest items improve faster than average items |
| P10 | Errors are costly; don't train backspace reflexes | Early lessons ignore errors and move on (no backspace); later lessons allow correction and count its cost | Keystrokes-per-character approaches 1.0 |

## Stack and architecture

Three parts, each independently replaceable.

| Part | Choice | Why |
| --- | --- | --- |
| `engine/` | TypeScript, zero DOM deps; logger, model, generator, scheduler, simulated learner | Must run in the browser; keeping the simulator beside it avoids a second implementation of the generator in Python drifting from the real one |
| `web/` | React 18 + TypeScript + Vite; TanStack Router (hash history, since GitHub Pages has no SPA fallback); Zustand for profile/session state; IndexedDB via `idb`; i18n via plain JSON in `web/src/i18n/` + a tiny `t()` | Boring and well-trodden, so agents and future contributors need no onboarding; scales to many screens without a framework rewrite; no SSR because there is nothing to render server-side |
| `pipeline/` | Python 3.15 (strict ruff, basedpyright and pytest baseline), `uv`, `pytest`; scripts for frequency lists, graded word lists, LLM sentence generation + filtering, corpus chunking, log analysis | Data wrangling and LLM calls are more natural in Python; outputs are static JSON consumed by `web/` |
| `api/` (later, optional) | FastAPI + SQLite, one endpoint pair: `PUT /blob/{id}` and `GET /blob/{id}`, blob encrypted client-side | Smallest possible surface; can be hosted on existing infrastructure or not at all |

Boundaries: `web/` imports `engine/`; `engine/` imports nothing; `pipeline/` writes `data/` and never runs at request time; `api/` knows nothing about typing, only blobs. Every data file in `data/` has one schema source: pydantic models in `pipeline/` (`extra="forbid"`), exported as JSON Schema to `data/schema/`, from which the TypeScript types are generated. CI fails when the exported schemas or generated types are stale, and both the Python writer and the TypeScript reader validate against them.

Deploy: GitHub Actions builds `web/` and publishes to Pages on push to `main`. `pipeline/` runs by hand (or by manual workflow dispatch) and its output lands in a PR so content changes are reviewable; there is no schedule, since the sources rarely change. LLM steps never run in CI (see Kids sentences).

## Learner model and adaptivity

The model is a small per-profile state, updated after every keystroke, that drives both unlocking and content sampling. It must stay simple enough to simulate.

**Logged per keystroke:** `KeyboardEvent.code`, resolved character, expected character, keydown and keyup timestamps (gives rollover), lesson id, position in word, keyboard-visible flag. Dead keys (`key === "Dead"`) and composition events are folded into one logged character with its keystroke sequence.

**Units are characters, keystrokes are physical keys.** The model keeps state per character and per character bigram; an accented letter is its own unit, whatever keystrokes the layout needs for it. The logger records `KeyboardEvent.code` for each keystroke, so per-key fingering and latency stay available. A profile's state belongs to one layout; switching layout starts a new curriculum for that profile (open question below).

**State per unit (key and bigram):**

- `err`: exponentially weighted error rate, half-life ~200 occurrences of that unit (drives sampling priority)
- `recent`: outcomes of the last N occurrences (ring buffer; N = 100 adults, 200 kids), drives unlocking
- `lat`: EWMA of inter-key interval (ms), same half-life, and its variance
- `n`: occurrence count
- `last_seen`: lesson index, for spaced revisiting

**Derived:**

- `confidence(unit) = (1 − err) × clamp(target_lat / lat, 0, 1)`, where `target_lat` is a per-level speed target (slow for beginners)
- `priority(unit) = (1 − confidence) × recency_boost(last_seen)`; the generator samples weak and stale units proportionally to priority
- Rollover rate and keystrokes-per-character as session-level progress signals, shown but not used for gating

**Unlock rule (P3):** the next key in the curriculum order unlocks when every unlocked key has an error rate below 3% over its last N occurrences (`recent`; N = 100 adults, 200 kids) and, secondarily, `lat < 1.5 × target_lat`. Accuracy is the gate; latency only holds back a key that is accurate but very slow. No unlock on speed alone. A key that never passes keeps being drilled and blocks the next unlock; there is no forced unlock until real logs show learners stalling (open question below).

**Curriculum order:** home row first (per layout), then the most frequent remaining letters for the language, so French and English profiles diverge after the home row. Capitals, punctuation and digits are separate tracks unlocked after the full alphabet.

**Adult "improve" entry:** a 60-second baseline on real text seeds `err` and `lat` for all keys at once; the curriculum is marked fully unlocked and the generator works from priorities only.

**Simulated learner:** a stochastic model with hidden per-key skill that improves with exposure and decays with time. The generator is tuned against it (minimise sessions to a target WPM at ≥97% accuracy), then checked against real logs. This is the hook for agent-driven iteration. Tuning against a model we wrote ourselves is circular, so its latency and error distributions should be fitted to public data (open question below).

## Lesson generator

The generator is a pure TypeScript function `(profile state, language data, layout, lesson type, seed) → text`, with no DOM dependency, so it runs identically in the browser, in tests and under the simulator. Content it consumes is produced offline by the Python pipeline.

**Content sources, shipped as static JSON per language:**

- Word list with frequency rank (~20k words), filtered to letters only, accents kept for French. Candidates: SUBTLEX-FR / Lexique for French, SUBTLEX-US or wordfreq for English (check licences before shipping).
- Kids list: a graded word list (Dolch/Fry for English; Manulex CP–CM2 bands for French if its licence permits redistribution), ~2k words, screened once by an adult.
- Kids sentences: generated once, offline, by `pipeline/`, not sourced. Old public-domain readers (McGuffey, Boscher, *Le Tour de la France par deux enfants*) have dated vocabulary and period attitudes, and found text almost never fits the unlocked-key and weak-bigram constraints. Instead, an LLM generates a few thousand short modern sentences per language under a hard rule — every word in the target band's list, length under a per-band cap (≈6 words for the youngest) — then one human pass, shipped CC0 with the generator script committed. The run happens on a developer machine, never in CI; its `(prompt, model)` cache and the reviewed output are committed, so CI only validates them and a rerun is reproducible without a model key (ADR 0003). Standard readability formulas (Flesch-Kincaid, Spache, Dale-Chall, Kandel-Moles, LIX, Mesnager) are too noisy on 5–10 word sentences; the all-words-known rule is Spache/Mesnager with the dial at 100%. Spot-check a sample against real children before trusting it.
- Adult "read & type" corpus: public-domain text is fine here since the goal is volume, not vocabulary control — Project Gutenberg for English, Wikisource / Gutenberg FR for French, chunked to ~250 characters. Add Wikipedia (CC BY-SA, attribution in footer) for modern prose. Use Flesch-Kincaid / LIX only as a sanity check on chunks.

**Lesson types** (one per 2–3 minute session, chosen by the scheduler):

1. Key intro: the new key alone, then in bigrams with home-row keys, then in 3–5 real words that contain it. Keyboard shown.
2. Weak-unit drill: real words sampled so that high-priority keys/bigrams appear 3–5× their natural frequency. Pseudo-words only when fewer than 8 letters are unlocked.
3. Alternation drill: words rich in alternating-hand and alternating-finger bigrams, to build rollover (P4).
4. Speed burst: known-good words, target WPM +10–15%, errors not penalised (P7).
5. Read & type: a paragraph of real text, no weak-unit constraints, progress counted by characters (P8). Until the alphabet and the capitals and punctuation tracks are unlocked, chunks are normalised to what is unlocked (lowercased, punctuation and digits dropped, chunks with a locked letter skipped), so the "only unlocked characters" rule holds for every lesson type.
6. Capitals / punctuation / digits tracks, unlocked after the alphabet.

**Constraints the generator enforces:** only unlocked characters; no word repeated within a lesson; lesson length chosen from the learner's rolling WPM so it lands in the mode's target (2–3 minutes adults, ≤ 2 minutes kids); French and English never mixed in one lesson.

**Scheduler:** per session pick the type by rotation with overrides — key intro whenever an unlock just happened, speed burst at most 1 in 4, read & type offered whenever the learner has ≥20 letters unlocked.

## Kids vs adults

One engine, two modes chosen at profile creation; the differences are in pacing, content and what counts as a win.

|  | Kids (≈7–11) | Adults / older kids |
| --- | --- | --- |
| Entry | Home row from zero, no baseline test | 60 s baseline on real text, then "improve" or "relearn" |
| Session cap | 5 min, lesson ≤ 2 min | 3 min lessons, no daily cap |
| Speed targets | None shown; speed bursts disabled | Shown; bursts enabled once accuracy is stable |
| Unlock pace | Slower: 97% accuracy over 200 occurrences | 97% over 100 occurrences |
| Content | Screened 2k-word list, short LLM-generated sentences inside that list, reviewed by an adult | Full list; read & type from novels, Wikipedia-style prose |
| Feedback | One thing to fix, said in plain words, plus a visual (finger lights up) | Weakest three units with numbers |
| Reward | Streak, unlocked-key "collection", a short animation at lesson end | Streak and charts only |
| Fingering | Enforced visually (finger highlight on every key) until the alphabet is unlocked | Suggested, not enforced (P2) |

What not to do for kids: leaderboards, timers on screen, error sounds, or anything that makes a 7-year-old rush. Reading ability is the real gate; the kids word list must stay inside the vocabulary a Swiss primary-school child can read in each language.

## Layouts and languages

Language and physical layout are independent axes: a Swiss French speaker types French on QWERTZ fr-CH, a French one on AZERTY, an English speaker on QWERTY US or UK. Each needs its own finger map and its own "home row first" curriculum.

**v1 layouts:** fr-CH (QWERTZ), fr-FR (AZERTY), en-US, en-GB. Each is a data file: physical key → character(s) per modifier, finger, row, hand. Dvorak/Colemak/BÉPO are later data files, not code changes.

**Detection:** browsers do not expose the OS layout reliably. Where `navigator.keyboard.getLayoutMap()` exists (Chromium, including Chromebooks), read the `code` → `key` map from it. Elsewhere use a short calibration drill: ask for a few characters that differ between candidate layouts (`z`/`y`, `a`/`q`, `é`, `@`) and compare `KeyboardEvent.code` (physical) with `KeyboardEvent.key` (character). Fall back to a manual picker; remember the choice per profile.

**Accented characters** are a real curriculum item in French: `é è à ç` are single keys on fr-CH and AZERTY but dead-key or modifier combos elsewhere, and capital `É` has no direct key on fr-CH. Treat each accented letter as its own unit in the model, with the layout-specific keystroke sequence it requires.

**Per-language data:** frequency word list, kids list, text corpus and the letter-frequency order that drives the curriculum after the home row, all generated into `data/lang/`. UI strings are hand-written in `web/src/i18n/`. UI language and practice language are separate settings.

**Known hard cases:** Shift and AltGr as keys in their own right (right-hand Shift for left-hand capitals is a fingering rule worth teaching); `KeyboardEvent.code` is unavailable on some mobile browsers, so mobile with a hardware keyboard is best-effort and touch screens are out of scope.

## Competitor notes

From use and public descriptions, not re-verified for this document; worth a one-hour hands-on pass before building.

| Site | Does well | Gap this project fills |
| --- | --- | --- |
| Keybr | Adaptive per-key confidence, progressive unlock, clean UI, several layouts | Pseudo-words throughout (weak transfer); adult-only; no kids mode, no structured French curriculum |
| TypingClub | Large structured curriculum, kids-friendly, French available, school accounts | Fixed lesson sequence, not adaptive to the learner's weak units; account-based; ads/premium |
| Typing.com | Free, games, teacher dashboard | Same fixed-curriculum limitation; account-based; ads |
| Monkeytype | Excellent test engine, open source, many languages and layouts, rich stats | Measurement, not teaching: no curriculum, no adaptivity, no kids mode |
| Ratatype | Simple course, certificates, multiple languages | Fixed course; little adaptivity |

The combination nobody offers: adaptive weak-unit drilling (Keybr) + real words and real text (TypingClub/Monkeytype) + kids and adult modes + fr-CH/AZERTY/QWERTY as first-class layouts + no account. Monkeytype's open-source test engine and language/layout data files are worth studying before writing our own. Monkeytype is GPL-3.0 and keybr's source is AGPL: study them, copy nothing from either (ADR 0002).

## Tools vs research: where they diverge

Most tools encode the folklore (ten fingers, home row, drills, speed); the strongest findings cut against each in turn.

| Research finding | What tools do today | Gap |
| --- | --- | --- |
| Consistency of mapping predicts speed, finger count does not (Feit 2016) | All enforce canonical fingering from lesson 1; TypingClub and Typing.com show finger diagrams on every lesson | None measures mapping consistency (per-key latency variance) or lets a competent adult keep their own mapping and fix only inconsistencies |
| Errors and their correction cost dominate; different-hand/finger bigrams predict speed; fast typists roll over 40–70% of keystrokes (Dhakal 2018) | Keybr gates unlocks on per-key speed through a low-pass filter; Monkeytype optimises raw WPM; TypingClub rewards speed with stars | No bigram model, no hand-alternation training, no rollover signal, accuracy secondary to speed |
| Accumulated volume on real text predicts skill; drills do not (Pinet 2022) | Keybr: pseudo-words throughout; TypingClub: fixed drills; Monkeytype: random-word tests; TypeLit: whole public-domain books, no adaptivity | Targeted weak-unit practice and sheer exposure never coexist in one product |
| Skilled typing = inner loop (letter → key) + outer loop (language → words); novices build the inner loop first (Logan & Crump) | Keybr stays in the inner loop forever; TypeLit assumes it is already built | No tool transitions a learner from drills to real language as the inner loop automates |
| Kids: short sessions, no speed pressure, fingering as the only goal | TypingClub does this reasonably, behind accounts and premium gates; Keybr and Monkeytype ignore kids | No account-free kids mode |

Where tools are ahead of the papers: Keybr's per-key confidence with decay is a sound adaptive core, and Monkeytype's open-source engine plus layout/language data files are better engineered than anything in a paper. Both are worth learning from; their licences rule out copying.

## Open questions to validate

- [ ] Does weak-unit drilling (P4) move free-text WPM for adults, or only drill WPM? Pinet 2022 suggests volume may dominate; measure both from day one.
- [ ] Unlock thresholds (97% / 100 occurrences) are guesses. Tune against the simulator, then watch real unlock-to-regression rates.
- [ ] How strictly to enforce fingering for adults who already type 50+ WPM with their own mapping (P2). Default is "don't"; confirm it doesn't cap them.
- [ ] Is 2 minutes too long for a 7-year-old? Watch the first two weeks of real use.
- [ ] Word-list licences (SUBTLEX, Lexique, wordfreq, Manulex) for redistribution in an open-source repo. Blocks the word-list pipeline; record each in `data/LICENSES.md` first.
- [ ] A key that never reaches the unlock threshold blocks progress. Watch for stalls in real logs before adding a forced unlock or a skip.
- [ ] Fit the simulated learner's per-key and per-bigram latency and error distributions to the Dhakal 2018 dataset (check its licence for derived parameters), and set `target_lat` from it.
- [ ] Keystroke log retention in IndexedDB: a 3-minute lesson logs ~600 events. Keep raw events for N days, then aggregate into unit state.
- [ ] Whether a profile should carry its model across a layout switch, or start a new curriculum per layout (current default).
- [ ] Whether a profile export/import is enough, or whether people ask for sync soon enough to justify building the blob API.
- [ ] Whether anonymous, opt-in, aggregated keystroke stats are worth collecting to tune the generator, given the no-backend constraint (a static site could post to a free form endpoint, but that reintroduces liability).

## References

- Feit, A. M., Weir, D., Oulasvirta, A. (2016). How We Type: Movement Strategies and Performance in Everyday Typing. CHI '16. [Project page and dataset](https://userinterfaces.aalto.fi/how-we-type/) · [PDF](https://userinterfaces.aalto.fi/how-we-type/resources/HowWeType_CHI16.pdf)
- Dhakal, V., Feit, A. M., Kristensson, P. O., Oulasvirta, A. (2018). Observations on Typing from 136 Million Keystrokes. CHI '18. [Project page and dataset](https://userinterfaces.aalto.fi/136Mkeystrokes/) · [PDF](https://www.pokristensson.com/pubs/DhakalEtAlCHI2018.pdf) · [Cambridge summary](https://www.cam.ac.uk/research/news/what-makes-a-faster-typist)
- Pinet, S., Zielinski, C., Alario, F.-X., Longcamp, M. (2022). Typing expertise in a large student population. Cognitive Research: Principles and Implications 7:77. [DOI](https://doi.org/10.1186/s41235-022-00424-3)
- Tracing the Development of Typewriting Skills in an Adaptive E-Learning Environment (2015). Perceptual and Motor Skills 121(3). [PDF](https://pure.uva.nl/ws/files/29156171/23.25.PMS.pdf) — longitudinal inner/outer-loop analysis of an online typing course
- Logan, G. D., Crump, M. J. C. (2009, 2011). Hierarchical control of cognitive processes: the case for skilled typewriting. Cited from memory; verify before relying on specifics.
- Gillespie, C. (2005). Touch Typing for First Graders. Valdosta State thesis. [Record](https://vtext.valdosta.edu/items/a2c304a0-25d5-4920-b70a-05591eaa68d3)
- Comparing Children's Typing Skills Using the Dvorak and QWERTY Keyboards (ERIC ED313002). [PDF](https://files.eric.ed.gov/fulltext/ED313002.pdf)
- Ratatype, age guide for children (vendor content, used only for the age bands). [Page](https://www.ratatype.co.uk/typing-tips/0406-z-iakogo-viku-navcati-ditinu-drukuvati-i-iak-ne-vidbiti-bazannia/)

Not yet consulted and worth reading in the research phase: Salthouse (1986) review of transcription typing; Yechiam et al. (2003) on training emphasis and plateaus; the spacing-effect literature in motor learning; Monkeytype's source for layout and language data formats.
