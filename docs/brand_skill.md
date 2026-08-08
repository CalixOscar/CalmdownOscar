---
name: calmdownoscar-web
description: Enforce calmdownoscar's design system, anti-slop copy rules, and static-site constraints on any HTML/CSS/JS work for calmdownoscar.com. Use whenever writing, editing, or reviewing markup, styles, or user-facing copy for this site — including small edits. Also use when asked to "make it look better", add a section, or write page copy.
---

# calmdownoscar — web build skill

You are building a static site for a one-person iOS/macOS studio. The reader is a senior engineer or hiring manager who has seen a thousand landing pages this year. Every default they expect is a default you should question.

Load the full spec at `docs/calmdownoscar_spec.md` before structural work. This skill is the enforcement layer; the spec is the source of truth for exact values and copy.

## Operating rule

Write the on-brand version first. Do not produce a conventional draft and then clean it. If you catch yourself reaching for a gradient, a card shadow, a three-column icon grid, or the word "seamless", stop and pick the constrained option instead.

If a request conflicts with a hard rule below, say so in one sentence, propose the nearest compliant alternative, and build that. Do not silently comply and do not refuse the whole task.

---

## Hard rules — copy

**Banned words and phrases.** Never emit these in user-facing copy:

`delve` · `seamless(ly)` · `game-changer` · `unlock(ing) potential` · `testament to` · `elevate` · `leverage` (as a verb) · `robust` · `cutting-edge` · `state-of-the-art` · `revolutionary` · `empower` · `journey` · `dive in` · `at the end of the day` · `in today's fast-paced world` · `it's not just X, it's Y` · `we're excited to` · `passionate about` · `crafted with care` · `harness the power of` · `take it to the next level` · `best-in-class` · `world-class` · `transform your workflow` · `supercharge` · `effortless`

**Banned structures.**
- Preamble. Never open a section by describing what the section is about. Open with the claim.
- The "not just X — it's Y" construction. Say what it is.
- Rule-of-three adjective stacks ("fast, simple, and beautiful").
- Rhetorical questions as headings ("Why does this matter?").
- Em-dash-driven dramatic pauses stacked more than once per paragraph.
- Sentences that begin "In a world where" or "Whether you're a…, or a…".
- Hedged claims that mean nothing: "helps you", "designed to", "aims to".
- Exclamation marks. Zero, site-wide.
- Emoji. Zero, site-wide, including in code comments and commit messages for this repo.

**Required voice.** Direct, grounded, concise, calm, with dry confidence. Concrete nouns and real numbers over adjectives. A specific number ("40,000-photo library", "64-bit perceptual hash", "30-day undo window") always beats a superlative. Wit shows up as understatement, never as a joke.

**Factual discipline.** Every technical claim in copy must be verifiable in this repo or in the linked app's repo. If it cannot be verified, either cut it or mark it explicitly as an estimate with its assumptions stated inline. Never state App Store status from memory — it changes and it has been wrong here before.

---

## Hard rules — visual

**Banned CSS.**
- `linear-gradient` / `radial-gradient` — one exception: the 64px edge scrim on the horizontal scroller.
- `box-shadow` — no exceptions. Elevation is a 1px border.
- `filter: blur()` / `backdrop-filter` — one exception: the sticky topbar.
- `text-shadow`, `opacity` on text below `.6`, decorative `transform: rotate()`.
- Any `border-radius` other than the two tokens (`6px`, `999px`).
- Colored shadows, glows, "aurora" blobs, mesh gradients, noise overlays.
- Animating anything other than `transform` and `opacity`.
- `!important`, except in the reduced-motion reset.

**Banned patterns.** Purple/indigo/violet as brand color. Soft blue-grey "AI SaaS" palettes. Beige. Floating glass cards. Generic stock vector or cartoon SVG illustration — including isometric people, blob shapes, undraw-style figures, and abstract "network node" graphics. Device mockup frames with perspective tilt. Testimonial carousels. Logo clouds. Icon-per-feature three-column grids. Full-width "book a call" bars. Cookie banners.

**Required.**
- One accent hue, `--accent` / `--accent-ink`, on ≤3% of any viewport.
- Two type families only: Fraunces (display, ≥24px) and Inter (text, ≤32px). Both self-hosted.
- All spacing a multiple of 8px.
- Left-aligned body copy, `max-width: 68ch`. Never centered.
- Real photography or real product screenshots. If neither exists, use type and rules — whitespace is a legitimate answer, illustration is not.
- Every color pair drawn from the verified list in the spec. Do not invent pairs; if you need a new one, compute the contrast ratio and state it.

---

## Hard rules — engineering

- Static HTML, CSS, and vanilla JS. No framework, no build step, no npm dependency in the shipped page.
- **Zero third-party network requests.** No CDN, no Google Fonts, no analytics, no embeds that phone home. Self-host everything.
- Progressive enhancement: the page reads and the interactive tool works (as plain radio groups) with JS disabled.
- Accessibility is a build requirement, not a pass: semantic landmarks, real form controls, `:focus-visible` rings, keyboard-reachable and keyboard-escapable scrollers, alt text that describes content, full `prefers-reduced-motion` handling.
- Budgets: CSS ≤24KB, JS ≤12KB, CLS 0, LCP <1.5s. If a feature does not fit the budget, the feature is what changes.
- Touch targets ≥44px. Respect `env(safe-area-inset-*)` — the site already does this and it must not regress.

---

## Self-audit before reporting done

Run these. Report actual output, not an assumption that they passed.

```bash
grep -rniE "delve|seamless|game.?chang|unlock(ing)?( the)? potential|testament to|elevate|leverage|robust|cutting.edge|revolutioniz|empower|journey|dive in|effortless|supercharge|best.in.class|in today's" *.html */index.html
grep -rn "gradient\|box-shadow\|backdrop-filter\|!important" *.html */index.html
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" *.html */index.html
grep -rono "#[0-9A-Fa-f]\{6\}" *.html */index.html | sort -u -t: -k2 | wc -l
```

Then confirm by inspection:

- [ ] Only sanctioned exceptions appear in the CSS grep (scroller scrim, topbar blur, reduced-motion reset).
- [ ] Hex count is within the token set. Every extra hex is justified or removed.
- [ ] No sentence opens with preamble. Read the first line of every section aloud.
- [ ] Every number on the page traces to something real.
- [ ] Tested at 375 / 768 / 1440px, reduced-motion on and off, JS off.
- [ ] Network panel shows requests to one origin.

## Reporting

Three bullets or fewer. State what changed and what you verified. Do not narrate the process, do not list files the user watched you edit, and do not close with an offer to do more unless there is a genuine open decision.
