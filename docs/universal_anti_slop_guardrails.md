# Anti-Slop Guardrails (universal)

Portable across all projects and models. Applies to any writing, design, or front-end output. Project rules override where they conflict; nothing else does.

## 1. Prose

**Never emit:** delve · seamless(ly) · game-changer · unlock potential · testament to · elevate · leverage (verb) · robust · cutting-edge · state-of-the-art · revolutionary · empower · journey · dive in · effortless · supercharge · best-in-class · world-class · harness the power of · take it to the next level · transform your workflow · at the end of the day · in today's fast-paced world · we're excited to · passionate about · crafted with care.

**Never use these shapes:**
- Preamble. Do not describe what you are about to say. Say it.
- "It's not just X — it's Y." Say what it is.
- Rule-of-three adjective stacks ("fast, simple, and beautiful").
- Rhetorical questions as headings.
- Restating the question before answering it.
- Closing with a summary of what was just read, or an unsolicited "let me know if…".
- Hedges that carry no information: helps you, designed to, aims to, can potentially.
- Exclamation marks. Emoji as decoration or as bullet markers.
- More than one em-dash aside per paragraph.

**Always:** concrete nouns, real numbers, active voice, short sentences. One specific detail outperforms three adjectives. If a sentence survives deletion without loss, delete it. Wit is understatement, never a joke. State uncertainty plainly instead of hedging everywhere.

**Never assert a fact you did not verify.** Check the repo, the file, the log. If it can't be verified, label it an estimate and state the assumption inline.

## 2. Visual design

**Banned:** purple/indigo/violet as brand color · soft blue-grey "AI SaaS" palettes · beige · gradient backgrounds and mesh/aurora blobs · `box-shadow` for elevation · glassmorphism and `backdrop-filter` panels · glow and colored shadows · generic vector illustration (isometric people, blobs, undraw figures, abstract network-node graphics) · emoji as icons · device mockup frames with perspective tilt · testimonial carousels · logo clouds · icon-per-feature three-column grids · full-width "book a call" bars · animated counters that loop.

**Defaults:**
- One accent hue. On ≤3% of any viewport. Everything else is surface and text.
- High contrast: near-black text on near-white, or the inverse. Verify 4.5:1 for text, 3:1 for UI borders — compute it, don't guess.
- Elevation is a 1px border, never a blur.
- Two type families maximum: one expressive display face, one highly legible sans for body. Self-host both.
- One border-radius value site-wide (plus pills, if needed).
- All spacing on an 8px scale.
- Body copy left-aligned, `max-width: 68ch`. Never centered.
- Real photography or real product screenshots. If neither exists, use type, rules, and whitespace. Illustration is not the fallback.
- Whitespace is a design decision. An empty area beats a filled one.

**Motion:** animate `transform` and `opacity` only. Nothing over ~500ms. Nothing loops. Full `prefers-reduced-motion` handling is required, not optional.

## 3. Generated imagery

Never generate: product screenshots, UI, readable text, logos, or real people's faces. Ambient and editorial plates only. Photographic prompts must specify a real camera/lens/aperture, natural directional light, matte finish, and a negative list including `text, logo, ui, illustration, 3d render, cartoon, lens flare, hdr, oversaturated, purple, neon, glow, plastic sheen`. Record the prompt and date alongside the asset.

## 4. Front-end engineering

- Zero third-party network requests unless explicitly justified. Self-host fonts and assets. No analytics by default.
- Semantic HTML with real landmarks and real form controls. Divs are not buttons.
- Visible `:focus-visible` ring on everything interactive. Keyboard-reachable and keyboard-escapable.
- Alt text describes content; decorative images get `alt=""`.
- Works with JS disabled, or degrades honestly.
- `width`/`height` on every image. CLS 0.
- Set a byte budget before writing code. Cut the feature, not the budget.
- Touch targets ≥44px. Respect safe-area insets.

## 5. Scope

Build what was asked. No unrequested features, no speculative abstractions, no adjacent cleanup bundled in. When the requested thing is done, stop. If part of it is blocked, finish everything else and say exactly what was left and why.

## 6. Self-audit before reporting done

Run it; report real output, not an assumption that it passed.

```bash
grep -rniE "delve|seamless|game.?chang|unlock(ing)?( the)? potential|testament to|elevate|leverage|robust|cutting.edge|revolutioniz|empower|journey|dive in|effortless|supercharge|best.in.class|world.class|in today's" .
grep -rn "gradient\|box-shadow\|backdrop-filter\|!important" .
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" .
```

Then: every number traces to something real · one accent hue in the stylesheet · no section opens with preamble · contrast ratios computed, not eyeballed · tested at 375/768/1440, reduced-motion on and off, JS off.

## 7. Reporting

Three bullets or fewer, or two sentences. What changed, what was verified. No process narration, no recap of what the reader watched happen, no closing offer unless a real decision is open.
