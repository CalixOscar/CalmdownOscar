# calmdownoscar.com — Homepage Specification

**Version:** 1.0 · 2026-08-09
**Scope:** `index.html` homepage rebuild. Nav, footer, and tokens are site-wide and propagate to all pages.
**Audience:** Technical hiring managers, senior engineers, and App Store visitors — in that order.
**Success:** A reader who scrolls once can name three engineering decisions I made and why. Then they leave. That is the goal, not dwell time.

---

## 0. Constraints inherited from studio rails

Non-negotiable, from `AGENTS.md`. These override any design preference below.

- Static HTML/CSS/JS. No build step, no framework, no backend.
- Zero third-party requests. Self-hosted fonts, self-hosted assets, no analytics, no CDN.
- No engagement patterns. No popups, no newsletter modal, no sticky "book a call" bar.
- Studio name is lowercase `calmdownoscar`, always.
- Voice: concierge, not salesperson.

---

## 1. Design tokens

Verified contrast ratios in parentheses. Reject any pair not listed here.

### 1.1 Color

```css
:root{
  /* surfaces */
  --paper:      #FAFAF7;  /* light surface — neutral off-white, not beige */
  --paper-sunk: #F1F1EC;  /* inset wells, tool background */
  --slate:      #0E1116;  /* dark surface — showcase + footer */
  --slate-lift: #171B21;  /* card on slate */

  /* text */
  --ink:        #12151A;  /* on paper (17.5:1) */
  --muted:      #5A6470;  /* on paper (5.8:1) */
  --ink-invert: #EDEEEA;  /* on slate (16.2:1) */
  --muted-inv:  #9AA3AC;  /* on slate (7.4:1) */

  /* accent — ONE hue, two tokens for contrast compliance */
  --accent:     #E4471D;  /* graphics, rules, large display, text on slate (4.7:1) */
  --accent-ink: #C43A12;  /* accent-colored body/small text on paper (5.1:1) */

  /* structure */
  --edge:       rgba(18,21,26,.14);
  --edge-inv:   rgba(237,238,234,.16);
  --focus:      var(--accent);
}
```

**Rules**
- One accent hue, site-wide. `--accent` never appears on more than ~3% of any viewport.
- `--accent` is forbidden for body copy on paper (3.85:1, fails AA). Use `--accent-ink`.
- No gradient anywhere except one permitted use: the 64px horizontal scrim at the edges of the horizontal scroller (§5.3), fading `--slate` to transparent.
- No colored shadows. No glow. Elevation is expressed with a 1px border, never a blur.

*Decision note: accent moves from the current soft slate-blue `#3B6EA5` to signal orange, because the blue reads as default-AI and disappears against the page. Approved conservative fallback if the orange is rejected: `#0B4F9E` (7.7:1 on paper) — deeper, still directional.*

### 1.2 Type

Two families. Both self-hosted, both SIL OFL, both variable, both subset to `latin` + the arrows used.

| Role | Family | Axes used | Where |
|---|---|---|---|
| Display | **Fraunces** Variable | `opsz 96`, `wght 300–700`, `SOFT 0`, `WONK 1` | h1, section numbers, footer wordmark, metric values |
| Text | **Inter** Variable *(already in repo)* | `wght 400–650` | everything else |

Fraunces at `opsz 96 / WONK 1` gives editorial contrast and a slight quirk at display size without becoming decorative. Never set Fraunces below 24px. Never set Inter above 32px.

```css
--step--1: clamp(13px, 0.80rem + 0.1vw, 14px);   /* meta, pills, captions */
--step-0:  clamp(16px, 0.95rem + 0.2vw, 17px);   /* body */
--step-1:  clamp(19px, 1.05rem + 0.5vw, 22px);   /* lede */
--step-2:  clamp(26px, 1.30rem + 1.4vw, 38px);   /* section heads (Fraunces) */
--step-3:  clamp(40px, 1.60rem + 5.0vw, 96px);   /* h1 (Fraunces) */
--step-4:  clamp(56px, 2.00rem + 9.0vw, 168px);  /* footer wordmark (Fraunces) */
```

- Display tracking: `-0.03em` at `--step-3` and above, `-0.02em` at `--step-2`.
- Body: `line-height 1.6`, `max-width 68ch`. Lede: `line-height 1.35`, `max-width 46ch`.
- Body weight 400. There is no 300-weight body text anywhere.
- Numerals in metric tiles: `font-variant-numeric: tabular-nums`.

### 1.3 Space, radius, motion

```css
--gap: 8px;              /* all spacing is a multiple: 8 16 24 40 64 104 168 */
--radius: 6px;           /* cards, tiles, inputs — one value, no exceptions */
--radius-pill: 999px;    /* platform pills only */
--rule: 1px solid var(--edge);
--ease: cubic-bezier(.2,.7,.3,1);
--fast: 140ms; --base: 240ms; --slow: 520ms;
```

- Animate `transform` and `opacity` only. Never `top`, `height`, `box-shadow`, or `filter`.
- Nothing animates longer than 520ms. Nothing loops. Nothing autoplays with sound.
- Everything in §7 is disabled under `prefers-reduced-motion: reduce`.

### 1.4 Layout

- Container: `max-width: 1180px`, gutter `max(24px, safe-area-inset)`.
- Text column inside container: `max-width: 68ch`, left-aligned. Never center body copy.
- Baseline grid: 8px. Section rhythm: `padding: 104px 0` desktop, `64px 0` mobile.
- Breakpoints: `640px`, `900px`, `1180px`. Three, no more.

---

## 2. Component inventory

Build these six. Anything not on this list needs a reason.

1. **Bordered card** — `1px solid var(--edge)`, `--radius`, `24px` padding, transparent background on paper / `--slate-lift` on slate. Hover: border → `--accent`, `transform: translateY(-2px)`. No shadow, ever.
2. **Metric tile** — a card variant. Fraunces value at `--step-2`, Inter label at `--step--1` uppercase `letter-spacing .06em` in `--muted`, optional 1-line footnote.
3. **Segmented control** — `1px` outer border, inner sliding thumb (`transform: translateX`, `--fast`). Real `<input type="radio">` inside `<fieldset>`; the visual thumb is a sibling element. Keyboard: arrow keys move selection natively.
4. **Text link** — the default interactive element. `color: inherit`, `border-bottom: 1px solid var(--edge)`; on hover/focus the border becomes `--accent` and a `↗`/`→` glyph translates 3px. Reserve real buttons for the tool's controls only.
5. **Pill** — platform/tech metadata. `--step--1`, `--muted`, `1px` border, `--radius-pill`, `4px 10px`. Never colored, never filled.
6. **Section header** — `<h2>` in Fraunces `--step-2`, preceded by a monospaced-feel index (`01 —`) in Inter `--step--1` `--accent-ink`, followed by a full-bleed `--rule`.

**Forbidden components:** hero gradient orbs, glassmorphic panels, testimonial carousels, logo clouds, animated counters that never stop, chat bubbles, "trusted by" strips, badge grids, cookie banners (nothing to consent to — there are no cookies).

---

## 3. Page map

```
S0  Topbar             sticky, 64px
S1  Hero               100vh, parallax
S2  Cold Start tool    interactive, paper-sunk
S3  Decisions          dark, horizontal scroll
S4  Apps               five case studies, paper
S5  Footer             dark, full-bleed
```

---

## 4. S1 — Hero

**Layout.** `min-height: 100svh` (`svh`, not `vh` — mobile URL bar). Content anchored to the lower third, not vertically centered. Left-aligned in the text column. Existing `assets/oscar-crawl.mp4` stays as the background plate at `opacity .18`, `filter: grayscale(1)`, with `--paper` scrim above it.

**Copy — exact.**

> **Eyebrow** (Inter, `--step--1`, `--muted`, `letter-spacing .08em`, uppercase)
> `INDEPENDENT APP STUDIO — EST. 2025`
>
> **H1** (Fraunces, `--step-3`, three lines, `--ink`; the period in line 3 set in `--accent`)
> `One person.`
> `Five apps.`
> `No key in the binary.`
>
> **Lede** (Inter, `--step-1`, `--muted`, max 46ch)
> `iOS and macOS, built between naps. On-device when the data is yours, relayed through a server when it isn't.`
>
> **Links** (text links, 24px apart, no buttons)
> `The decisions →`  (anchor to S3)
> `peter@calmdownoscar.com ↗`

No "welcome", no "hi, I'm", no explanation of what a studio is. The first sentence a visitor reads is a claim, not an introduction.

**Parallax.** Background video translates at `0.18×` scroll delta, hero text at `0.06×`, both via one `rAF` loop with lerp (`t = 0.12`) writing `transform: translate3d()`. Reuse the existing scrub loop in `index.html` rather than adding a second listener. Cap total translation at 120px. Kill entirely under reduced-motion and below 640px.

**Scroll affordance.** A 1px vertical rule, 40px tall, at the bottom-left of the text column, with a 12px `--accent` segment that travels its length on a 2.4s ease loop. This is the only looping animation on the page and it is 1px wide.

---

## 5. S2 — Cold Start (the interactive tool)

**Why this tool.** It is the studio's actual thesis, expressed as arithmetic instead of a claim. It also explains why Unli Rice exists without pitching it.

**Layout.** Full-container width, `--paper-sunk` background, `1px` top and bottom rules, `64px` internal padding. Two columns at ≥900px: controls left (`5fr`), results right (`7fr`). Stacked below.

**Copy — exact.**

> **Section index / head**
> `02 — TRY IT`
> `Cold start, priced.`
>
> **Lede**
> `Every AI coding session that begins from zero re-reads your project before it does anything useful. Three questions, and you get the weekly bill.`

**Step 1 — segmented control.** Label: `Sessions per week`. Options: `5` · `15` · `30` · `50+`. Default `15`.
**Step 2 — segmented control.** Label: `Project size`. Options: `Small` · `Medium` · `Large`. Sublabels beneath, `--step--1`, `--muted`: `~8k` · `~25k` · `~60k tokens of context`. Default `Medium`.
**Step 3 — two-state toggle.** Label: `Persistent memory`. Options: `Off` · `On`. Default `Off`.

**Results — three metric tiles, updating on every change.**

| Tile | Value | Label | Footnote |
|---|---|---|---|
| 1 | `1.5M` | TOKENS RE-READ / WEEK | `sessions × context` |
| 2 | `3h 20m` | SPENT RE-EXPLAINING | `at 90s of preamble per session` |
| 3 | `—` / `82%` | AVOIDED WITH MEMORY ON | `retrieval replaces re-reading` |

**Math (implement exactly).**
```
ctx        = {small: 8000, medium: 25000, large: 60000}[size]
sessions   = {5,15,30,50}[step1]
tokens     = sessions * ctx                       // memory OFF
tokens     = sessions * (ctx * 0.18 + 1200)       // memory ON — targeted retrieval + index
minutes    = sessions * 1.5                       // memory OFF
minutes    = sessions * 0.35                      // memory ON
avoided    = memoryOn ? round((1 - on/off) * 100) : null
```

**Honesty line, directly under the tiles, `--step--1`, `--muted` — required, do not cut:**
> `Arithmetic, not a benchmark. 90s of preamble per session and an 82% retrieval hit rate are my own figures from four agents on this studio's projects, not measured across anyone else's. The point is the shape of the number.`

Then one text link: `Unli Rice is what I built for this →` pointing to `/unlirice/`. One link. No card, no badge, no CTA block.

**Micro-interactions.**
- Thumb slides `--fast` on `transform`. No colour fade.
- Metric values count from previous → next over 240ms with `tabular-nums` so width never jumps. Under reduced-motion, values swap instantly.
- Tile 3 renders an em-dash when memory is Off, and the whole tile's border goes `--accent` when On. That border is the only state colour in the tool.
- Everything is computed client-side in <40 lines. No fetch, no storage, no query params.

**Accessibility.** `<fieldset>`/`<legend>` per step. Results wrapper is `aria-live="polite"` and announces a single composed sentence, not three fragments. The tool is fully usable by keyboard and degrades to three visible radio groups with no JS.

---

## 6. S3 — Decisions (dark horizontal showcase)

**Layout.** Full-bleed `--slate`, `104px` vertical padding. Heading and lede in the container; the scroller itself breaks out to full viewport width and starts flush with the container's left gutter. `overflow-x: auto`, `scroll-snap-type: x proximity`, cards `min-width: 340px` / `max-width: 420px`, `24px` gap, `--radius`. 64px gradient scrim at both edges. Custom 2px scrollbar track in `--edge-inv`.

**Copy — exact.**

> `03 — ENGINEERING`
> `The parts that don't demo well.`
> `Six decisions where the interesting work was choosing the constraint, not writing the code.`

**Cards — exact copy.** Each: index (`--accent`, Fraunces), title (Inter 650, `--ink-invert`), body (Inter, `--muted-inv`, 3 lines max), footer meta pill with the app name.

1. **`01` · No key in the binary** — `Cloud calls route through a stateless Vercel relay that holds the API key and rate-limits server-side. Nothing shipped to a device can leak a credential, because nothing shipped to a device has one.` — *Wedding Concierge*
2. **`02` · Classical signal beat the model** — `Duplicate detection is a 64-bit perceptual hash, a Vision feature-print distance check, and a Laplacian blur score. An on-device VLM refinement pass was built, measured, and cut — slower, barely better.` — *ClearSpace*
3. **`03` · The delete button routes to Trash** — `Skip the period filter and one tap can queue 30,000+ photos. So deletion goes through iOS Recently Deleted and macOS Trash — a 30-day undo window on exactly the mistake the UI makes easy.` — *ClearSpace · Unli Disk*
4. **`04` · One state model, not two** — `The assistant reads and writes the same state the UI renders. The common failure in AI apps is the model's understanding quietly drifting from what's on screen; there is no second store to drift from.` — *Wedding Concierge*
5. **`05` · Four agents, one ground truth** — `Gemini, Claude, Codex, and Antigravity reach a single vault over MCP. It encodes guardrails and evaluation rules, not just notes — so one agent can't overwrite a constraint another one set.` — *Unli Rice*
6. **`06` · Shared engine, not a fork** — `The photo-audit code lives in Packages/UnliDiskPhotos and is consumed by both apps. Two products, one implementation, one place a bug gets fixed.` — *Unli Disk · ClearSpace*

**Micro-interactions.**
- Card hover/focus: border → `--accent`, `translateY(-2px)`, `--base`.
- Native trackpad and touch scrolling only — no drag-to-scroll JS, no momentum simulation.
- `←`/`→` scroll by one card width when the scroller has focus. Scroller gets `tabindex="0"` and `role="region"` with an `aria-label`, so it is reachable and escapable by keyboard.
- A 2px `--accent` progress rule under the scroller tracks `scrollLeft / scrollWidth`. On a passive listener, transform-only.
- Under reduced-motion, snap becomes `none` and hover translation is removed.

---

## 7. S4 — Apps

Keep the existing three-step case-study structure — it is the strongest content on the current site. Restyle only.

**Copy — exact section head.**
> `04 — SHIPPED`
> `Five apps, and how each one actually works.`
> `What runs on-device, what talks to a server, and why it's split that way.`

**Per-app block.** Bordered card, full container width, `40px` padding, stacked `64px` apart.

- **Row 1:** app icon (56px, `--radius`), name in Fraunces `--step-2`, status pill, platform/tech pills.
- **Row 2:** one-sentence positioning line, `--step-1`, `--muted`, max 46ch.
- **Row 3:** three columns at ≥900px (`01 · 02 · 03` steps), separated by 1px vertical rules, stacked with horizontal rules below 900px. Step index in `--accent-ink`.
- **Row 4:** real screenshot from `assets/`, `--radius`, `1px solid var(--edge)`, no shadow, no device frame mockup, no perspective transform.
- **Row 5:** text links only — store link, product page, privacy policy.

**Status pills — verified as of 2026-08-09, re-check before publish:**
Wedding Concierge `Mac App Store · iOS awaiting review` · Unli Rice `Mac App Store · Open source` · ClearSpace `Awaiting App Store review` · Unli Disk `Awaiting App Store review` · Architecturally `Draft`.

Existing per-app case-study copy carries over verbatim. It is accurate and already fact-checked (commit `9e369d8`) — do not rewrite it during the visual pass.

---

## 8. S5 — Footer

Full-bleed `--slate`, `104px 0 40px`.

- **Row 1:** the wordmark `calmdownoscar` in Fraunces at `--step-4`, `--ink-invert`, tracking `-.04em`, clipped to the container so it optically bleeds off the right edge at narrow widths. The final `r` is set in `--accent`. This is the page's last statement; it takes the space.
- **Row 2:** three columns of text links — **Apps** (five apps) · **Studio** (How I Work, The Studio, About Me, Playground, Hobbies) · **Direct** (email, GitHub, Mac App Store).
- **Row 3:** `1px` rule, then `© 2026 calmdownoscar · est. 2025` left, `No trackers. No analytics. No cookies.` right, both `--step--1` `--muted-inv`.

That last line is a factual claim about this site. Verify it stays true.

---

## 9. Motion & accessibility contract

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{
    animation-duration:.01ms !important; animation-iteration-count:1 !important;
    transition-duration:.01ms !important; scroll-behavior:auto !important;
  }
}
```
Plus, in JS: parallax loop is never started, count-up is skipped, `scroll-snap-type` is set to `none`.

- Every interactive element has a visible `:focus-visible` ring: `outline: 2px solid var(--focus); outline-offset: 3px`.
- Tab order follows DOM order. The horizontal scroller is not a keyboard trap.
- All imagery has real alt text describing content, not filenames. Decorative plates get `alt=""`.
- Contrast: 4.5:1 minimum for text, 3:1 for UI borders and large display. Pairs are listed in §1.1; do not invent new ones.
- The page is fully readable and the tool fully usable with JS disabled.

---

## 10. Performance budget

| Metric | Budget |
|---|---|
| Third-party requests | **0** |
| HTML (uncompressed) | ≤ 60 KB |
| CSS | ≤ 24 KB |
| JS | ≤ 12 KB, no dependencies |
| Fonts | ≤ 2 files, ≤ 45 KB each, subset, `font-display: swap` |
| Images | AVIF with WebP fallback, `width`/`height` on every tag, `loading="lazy"` below the fold |
| Hero video | ≤ 1.2 MB, `preload="metadata"`, `poster` set |
| CLS | 0 |
| LCP (4G, mid-tier Android) | < 1.5 s |

---

## 11. Build order

1. Token layer in `:root` — replace the current `--bg/--accent/--ink` block. Site-wide, so smoke-test all 9 pages after.
2. Subset and self-host Fraunces into `assets/fonts/`. Add `@font-face`. Ship nothing until it is local.
3. S5 footer + S0 topbar (site-wide, highest leverage).
4. S1 hero, reusing the existing scrub loop.
5. S4 apps restyle — content unchanged.
6. S3 dark scroller.
7. S2 tool last; it is the only new logic.
8. Propagate tokens/nav/footer to `apps/`, `how_I_work/`, `the_studio/`, `aboutme/`, `hobbies/`, `playground/`, `unlirice/`, `apps/unlidisk/`, `clearspace/work_in_progress/`.

---

## 12. Definition of done

- [ ] `grep -rniE "delve|seamless|game.?chang|unlock(ing)? (the )?potential|testament to|elevate|leverage|robust|cutting.edge|revolutioniz|empower|journey|dive in|in today's" *.html */index.html` returns nothing.
- [ ] `grep -rn "gradient\|box-shadow\|backdrop-filter" *.html */index.html` returns only the two sanctioned uses (scroller edge scrim, topbar blur).
- [ ] No emoji in any HTML file.
- [ ] One accent hue in the stylesheet. Count the hexes.
- [ ] Every status claim in §7 re-verified against App Store Connect on the day of publish.
- [ ] Lighthouse ≥ 98 across all four categories, mobile profile.
- [ ] Tested at 375px, 768px, 1440px; light and dark OS setting; reduced-motion on and off; JS disabled.
- [ ] Zero network requests to any origin other than `calmdownoscar.com`. Check the network panel, don't assume.
