# PLAN — PyLearn Quiz at /pyQuiz/

**Date:** 2026-11-07
**Intent:** `docs/intent/INTENT-004-pyquiz.md`
**Status:** Draft, awaiting Codex pre-mortem (`docs/dialogue/pyquiz.md`).
**Tier:** 2, light (founder's choice in session): plan → Codex pre-mortem → revise →
build in-house → deploy → Codex post-mortem.
**Branch:** `feat/pyquiz` in worktree `.worktrees/pyquiz`, from `main` at `17fb2cc`.

## What ships

A static, installable, offline multiple-choice Python quiz at
`https://www.calmdownoscar.com/pyQuiz/`, copying the architecture of `/biancaexam/`
(one self-contained `index.html` with inline CSS/JS, `sw.js`, `manifest.webmanifest`,
PNG icons). A try-out with 52 cards was already published privately and tried.

Plus a new section on `/playground/` with short text, a link and a real screenshot.

## Decisions

- **No code execution.** Every card is fixed text. This removes the isolation problem
  that halted LearnPy's runtime work. Python snippets are shown as escaped text only.
- **Answers verified at authoring time.** `docs/pyquiz/cards.py` holds the cards and
  runs each code card with real `python3` (`exec` in a fresh namespace, stdout
  captured). Build fails if an answer differs from real stdout / exception name, if
  a wrong option equals the real result, or if options repeat. Output: `cards.json`,
  embedded into `pyQuiz/index.html` by `docs/pyquiz/build.py`. Sources live under
  `docs/`, which `.vercelignore` keeps off the site. Authoring Python is 3.9 locally;
  cards avoid features whose output differs between 3.9 and current Python.
- **Deck:** ~110 cards. Existing 9 topics (print & variables, strings, numbers,
  lists, dictionaries, if/booleans, loops, functions, errors) get more cards; new
  topics: tuples & sets, looping over dicts/enumerate/zip, files & `with`.
  File cards are concept or "what happens" questions only; no snippet touches the
  filesystem when verified (the verifier refuses `open(` in runnable code).
- **Mechanics, as in Bianca's quiz:** smart round of 10 (weak → new → known), topic
  rounds, weak-card round, 20-card mock test, missed cards return 3 cards later,
  retry-missed at the end. Progress in `localStorage` under one key, read/write
  wrapped in try/catch; works without it. Reset needs a second tap (no `confirm()`).
- **50:50 helper:** saved on/off toggle on the home screen, default off (same as
  Bianca's `mem.help`). When on, two wrong options hide on each question. A card
  answered with help earns less XP and is not marked "known".
- **Counters:** an in-round run counter and XP stay (Bianca has them). No daily
  streaks, reminders, notifications or anything that rewards coming back on a
  schedule, per the studio "no engagement bait" rule. Reviewer: challenge this.
- **Fonts:** system stacks only. The root CSP (`font-src 'self'`) blocks Google Fonts
  and the web overlay says system or self-hosted fonts.
- **CSP/headers:** `/pyQuiz/` falls under the existing root rule
  `/((?!playground|hobbies|norsksti2).*)`, which allows inline script/style and
  `'self'` only. No change needed. `noindex` meta, as Bianca.
- **Routing:** folder `pyQuiz/` (Vercel paths are case-sensitive). Redirects
  `/pyQuiz` → `/pyQuiz/`, `/pyquiz` and `/pyquiz/` → `/pyQuiz/` (non-permanent).
- **Service worker:** `VERSION` constant, precache `/pyQuiz/`, manifest and icons on
  install; delete old caches on activate; cache-first with background refresh for
  same-origin GETs under `/pyQuiz/`; navigations map to `/pyQuiz/`. Registered with
  scope `/pyQuiz/`. Same pattern as Bianca's `sw.js`.
- **Icons:** 192, 512, maskable 512, apple-touch 180, generated locally (PIL) from a
  simple `>>>` mark. No third-party assets.
- **Playground:** one section in the existing `split` pattern after Norsksti: label,
  name, two sentences, link, and a JPEG screenshot (`playground/pyquiz.jpg`, < 80 KB,
  real capture of the deployed page, width/height attributes, alt text). The
  playground intro sentence and meta description mention it. LearnPy is not linked.

## Steps

- [ ] **build:** extend `docs/pyquiz/cards.py` to ~110 cards across 12 topics; verifier passes.
- [ ] **build:** `pyQuiz/` files (index.html from template + 50:50 toggle, sw.js,
  manifest, icons), `docs/pyquiz/build.py`, redirects in `vercel.json`.
- [ ] **planner:** review diffs; run verifier and build; serve locally; headless
  Chrome check: page renders, service worker activates, reload works with the
  network set offline, manifest parses, 50:50 hides two wrong options, no console errors.
- [ ] **build-light:** playground section, screenshot, intro/meta copy.
- [ ] **planner:** merge to `main`, push (founder asked in session to put it live),
  check live URLs, redirects, headers and the offline reload on the live site.
- [ ] **planner:** Codex post-mortem in `docs/dialogue/pyquiz.md`.

## Risks

- Stale service worker after updates: bump `VERSION` each content change; refresh on
  reload brings the new page the visit after.
- iOS evicts storage of uninstalled sites after inactivity: progress is a convenience,
  stated nowhere as guaranteed.
- A card whose explanation is wrong while its answer is right: answers are machine
  checked, explanations are not. Reviewer: spot-check.
