# Plan — calmdownoscar.com landing page

Owner: Claude (plan) → Antigravity swarm (build) → Claude (review)
Written 2026-09-03. Scope is `index.html` only, plus the shared nav partial pattern
that other pages copy.

## Why

The page today is: nav → two lines of hero → eight long case studies → footer.
Measured on the current build:

- The hero never says what Peter builds. Above the fold a visitor gets
  "Built at night, while Oscar sleeps." and an architecture sentence. Not
  iPhone/iPad/Mac, not photos/storage/notes/weddings, not that five apps ship today.
- There is no way to see the catalogue. The first case study starts 177px down and
  the page runs 12.6 screens on desktop, 16 on mobile. Nothing lets you see eight
  apps at once or jump to one.
- **4 of 6 nav links are unreachable on mobile.** At 375px the nav scrolls
  horizontally inside a 171px box with no affordance; Playground, About Me, Hobbies
  and Contact are simply off-screen. This is the most serious defect on the page.
- `#about` does not exist, but seven pages under `apps/` link to `/#about`.
- Some copy overstates: "instant 0ms previews" is not a claim that can be true.

The case studies themselves are the strongest thing on the site — specific, honest,
full of real decisions and abandoned approaches. **They stay.** Everything below is
about getting a visitor to them, not replacing them.

## Build

### 1. Hero — say the plain thing first
Keep `Built at night, while Oscar sleeps.` as the H1; it is the studio's name story
and it earns its place. Add one plain sentence directly beneath, before the
architecture line:

> I'm Peter. I build small iPhone, iPad and Mac apps — for photos, storage, notes
> and wedding planning — and I ship them on my own.

Then the existing on-device/relay line as a third, quieter tier. Add two links:
one to `#apps`, one to `mailto:peter@calmdownoscar.com`.

### 2. App index — the missing middle
A compact responsive grid directly under the hero, above `Apps & Case Studies`.
One tile per app, eight total, each linking to its own case study anchor further
down the page (`#wedding-concierge`, `#unli-rice`, `#unli-rice-capture`,
`#clearspace`, `#unlidisk`, `#opengrail`, `#shuttlevision`, `#kitchenvision`).

Each tile: existing icon from `assets/`, app name, one short line, platform pills,
and a status dot reusing the existing `.dot` classes — five are live on the App
Store and that is the studio's credibility, currently buried nine screens down.
Grid: 4 columns ≥1024px, 2 columns ≥600px, 1 column below. Icons already exist;
do not generate new art.

### 3. `#about` section
Add before the footer, with `id="about"` so the seven inbound links land. Short —
three or four sentences from the existing About Me page, not a rewrite. Include the
evidence links the audit asked for:
- Apple developer page: `https://apps.apple.com/developer/id1832327005`
- GitHub: `https://github.com/CalixOscar`
- `mailto:peter@calmdownoscar.com`

### 4. Mobile nav — the actual bug
At <768px the six links must all be reachable. Preferred: a single-column disclosure
panel toggled by a button, `aria-expanded` maintained, closing on Escape and on
selection. A wrapping two-row nav is acceptable if simpler. No horizontal scroll.
Whatever ships must be keyboard-operable and must not depend on hover.

### 5. Copy honesty
- `index.html` "instant 0ms previews" → describe the real behaviour, e.g. "previews
  that open from a prebuilt thumbnail cache".
- Sweep the page for other absolutes (guaranteed windows, "zero", "never") and make
  each one either measured-with-conditions or plain.
- Do not touch the case-study bodies otherwise.

## Constraints — non-negotiable

- **Static HTML with inline `<style>`/`<script>` in `index.html`.** No framework, no
  build step, no bundler. The site is served straight off Vercel as files.
- **CSP is `default-src 'self'`.** No Google Fonts, no CDN, no external script, font,
  image or stylesheet. Anything off-origin is blocked in production and will look
  fine locally while being broken live. Inter is already self-hosted at
  `assets/fonts/Inter-Variable.woff2`.
- **No trackers, no analytics.** Studio rail, not a preference.
- Preserve the existing `<title>`, `<meta name="description">`, `og:*` tags and
  `<link rel="canonical" href="https://www.calmdownoscar.com/">`.
- Preserve every existing case-study `id`, all App Store links, and the `.reveal`
  scroll-animation hooks.
- Respect `prefers-reduced-motion` for anything new that animates.
- Voice: calm, concierge, short. No hype, no emoji, no exclamation marks.
- Do not create files outside this repo. Do not touch `opengrail/`.

## Definition of done

1. At 1280px and at 375px, the fold states what Peter builds without scrolling.
2. All eight apps are visible in one grid without scrolling past the hero on desktop.
3. All six nav links reachable at 375px with no horizontal scrolling.
4. `/#about` scrolls to a real section.
5. `python3 -c "import re,sys; ..."` — no off-origin `src`/`href` anywhere in
   `index.html` except `apps.apple.com`, `github.com` and `mailto:`.
6. No console errors; no horizontal document overflow at 375px.
7. Case-study text unchanged except the overstated-copy edits in §5.
