# Plan — site-wide accuracy & consistency pass

Origin: second external audit at `d6b08b1`. Every item below was re-verified against the
working tree before this plan was written; line numbers are from `d6b08b1`. If a line
number has drifted, match on the quoted text, not the number.

**Scope rule:** work only inside `/Users/calmdownoscar/Documents/Projects/CalmdownOscar`.
Do not touch `opengrail/graph.json`, `opengrail/assets/*`, or `opengrail/artifacts/*` —
see "Explicitly out of scope" at the bottom.

**Voice rule:** studio voice is calm, plain, specific. No hype, no marketing adjectives,
no emoji. Where a claim is being corrected, the replacement must be *narrower and true*,
not vaguer. Do not invent capabilities to fill the gap.

**Housekeeping:** this plan file was written to the repo root by the dispatch bridge.
As your last action, `git mv`/move it to `docs/PLAN-consistency-pass.md` so it does not
sit loose at the top level.

---

## 1. Playground privacy claim contradicts the code

`playground/index.html:336` currently says the model "runs in your browser — your prompts
and its replies stay on your device," then separates out "the search terms." But
`playground/index.html:621` sets `let searchQuery = text;` — `text` is the user's message
verbatim — and line ~637 does
`fetch('/api/search?type=image&q=' + encodeURIComponent(searchQuery))`. On follow-ups it
sends the previous user message concatenated with the current one. So the prompt itself
leaves the device; the current wording denies that.

Replace the disclosure sentence with wording that says so plainly. Suggested:

> Requirement: WebGPU support and unified memory (M1+ iPad/Mac or desktop GPU recommended).
> The model downloads once and runs in your browser, so inference happens on your device.
> Your messages do not stay there: each one is also used as a search query, sent through
> this site's server to Serper to fetch the pictures and clips beside it, and the media
> loads from whoever hosts it.

Keep the existing element, styling and green colour. Do not change the fetch logic.

## 2. "Instant 0ms" is not a defensible claim

Remove the `0ms` figure in all four places. Describe the actual behaviour (local frame-0
decode, no loading spinner) instead of asserting zero latency.

- `apps/clearspace/index.html:162` — "Instant 0ms media previews"
- `apps/clearspace/user_guide.html:251` — "instant 0ms media previews and zero loading flicker"
- `apps/unlidisk/index.html:471` — "instant 0ms media previews"
- `apps/unlidisk/user_guide.html:152` — "<strong>Instant 0ms Previews</strong>: Zero-delay viewing with frame-0 local decodes…"

Use phrasing like "previews open immediately from a local frame-0 decode, with no loading
spinner." Keep each sentence's surrounding structure intact.

> **Correction, 2026-09-04:** the replacement phrasing above was itself wrong and has been
> undone. Neither app does a frame-0 decode. Both open a preview with a *synchronous,
> network-disabled `.fastFormat` `PHImageManager.requestImage`* — the poster still Photos
> has already cached on the device (`Sources/UnliDiskiOS/PhotoDetailScreen.swift` init,
> `Sources/UnliDisk/Views/PhotoDetailViewer.swift` `fastOptions`). The live copy now says
> "the still Photos has already cached on the device". Do not reintroduce "frame-0".

Leave `index.html:76` (`--fast: 140ms`) and `index.html:1422`
(`transitionDelay = '0ms'`) alone — those are CSS, not claims.

## 3. The 30-day recovery guarantee is wrong for Finder Trash

macOS Finder Trash holds items until the user empties it. The 30-day auto-removal is an
opt-in Finder setting ("Remove items from the Trash after 30 days"), off by default.
Apple Photos "Recently Deleted" is the one that holds items for *up to* 30 days. The
current copy merges the two and calls it a guarantee.

Fix all three, describing each destination separately:

- `apps/unlidisk/index.html:494` — "Deletions move files safely to macOS Finder Trash or Apple Photos Recently Deleted — full 30-day recovery window."
- `apps/unlidisk/support.html:158` — "…Nothing is permanently erased immediately, so you always have 30 days to recover items."
- `apps/unlidisk/user_guide.html:162` — "…guaranteeing a full 30-day recovery window."

Correct shape: files go to Finder Trash and stay there until the Trash is emptied; photos
go to Photos' Recently Deleted, where they remain for up to 30 days. Drop the words
"guarantee"/"guaranteeing" and "always."

Do **not** change the ClearSpace pages — `apps/clearspace/support.html:160` and
`apps/clearspace/user_guide.html:273` already describe Photos' Recently Deleted correctly
and only that. `index.html:961` ("up to a 30-day window in Recently Deleted") is also
already correct.

## 4. Unli Rice Capture is shipped, but its product page still says it isn't

`index.html:894-915` presents Unli Rice Capture as a shipped card with a live App Store
link (`https://apps.apple.com/app/unli-rice-capture/id6800863948`). The product page
contradicts it:

- `unlirice/index.html:409` — "Unli Rice today is Mac-only — the log lives on one machine. The next piece closes the one real gap: capturing a thought when you're not at the Mac."
- `unlirice/index.html:425` — the "iOS Capture — satellite note-taker" step carries `<span class="step-tag">In development</span>`
- `unlirice/index.html:443` — the "Sync — per-device shards" step carries the same tag

Update the lede so it no longer says Mac-only-with-a-gap, and describes Unli Rice as a Mac
app with a shipped iOS capture companion. Change the iOS Capture step tag from
"In development" to a shipped label matching the tags already used elsewhere on the page —
read the surrounding markup and reuse the existing convention rather than inventing one —
and link it to the App Store URL above.

**Judgement call on the Sync step (443):** only relabel it if the shipped Capture app
actually performs the sync described. If sync is genuinely still unbuilt, leave that tag
as "In development" and make the lede's wording consistent with a shipped Capture and an
unshipped sync. Check `unlirice/index.html:474` and the step body text before deciding.
If you cannot determine this from the repo, leave 443 unchanged and note it in Handoff.

## 5. Homepage privacy line is too vague to be meaningful

`index.html:649`:

> On-device when the data is yours, relayed through a server when it isn't.

This reads as a privacy guarantee but does not survive contact with the products — several
apps do send personal data to cloud models. Replace it with a line that promises only what
is actually true: that each app states plainly what stays on the device and what leaves.
Keep it to one sentence, same `hero-sub` class, same register as the `hero-intro` above it.

## 6. Homepage OpenGrail claim is falsified by the shipped data

`index.html`, the OpenGrail card, step "02 · Sourcing rule" (~line 1086) claims each origin
pin is an editorial decision plus a Wikidata lookup, and that "the review catches that
class of error before it ships."

The shipped `opengrail/graph.json` disproves it. Verified: 127 of 695 nodes share the
origin `Jerusalem, Southern Levant`, 80 share `Varanasi (Kashi), Uttar Pradesh, India`, and
39 share `London, England, UK`. The `quakers` node is pinned to "Jerusalem, Southern Levant"
at 32.6115, 35.3414 — not Jerusalem's real coordinates — while its own summary places it in
17th-century Protestant England with `originYear: 1650`. These are cluster centroids with
jitter, not resolved coordinates.

Rewrite step 02 so it describes the sourcing rule as the intended standard the corpus is
being brought up to, and states plainly that a generated first pass left many origins
pinned to cluster centroids that are still being corrected. Do not claim the review
currently catches these — it demonstrably does not. Keep the Petra/Tiberias anecdote only
if the rewritten paragraph no longer implies the problem is solved.

Change only this repo's `index.html`. Do not touch anything under `opengrail/`.

## 7. Mobile navigation is homepage-only

`index.html` has a proper disclosure menu: a `.nav-toggle` button
(`index.html:626-628`, styled at `index.html:159-193`) driving `#main-nav` under a
`@media (max-width:767px)` query, with the JS at `index.html:1438-1470` handling toggle,
Escape-to-close, outside-click-to-close and `aria-expanded`.

Every other page instead uses a horizontally scrolling nav with its scrollbar hidden —
e.g. `aboutme/index.html:109`:
`nav{ display:flex; … overflow-x:auto; scrollbar-width:none; }` plus
`nav::-webkit-scrollbar{ display:none; }`. At 375px the links overflow the visible strip
with no visible affordance, so several destinations are effectively undiscoverable.

Port the homepage pattern — CSS, the toggle button markup, and the JS — to each of these:

- `aboutme/index.html`
- `the_studio/index.html`
- `how_I_work/index.html`
- `hobbies/index.html`
- `playground/index.html`
- `unlirice/index.html`
- `kitchen_vision/index.html`
- `shuttle_vision/index.html`
- `apps/clearspace/index.html`
- `apps/unlidisk/index.html`

Requirements per page:
- Keep each page's own nav links, order and `aria-current="page"` marking exactly as they are.
- Give the `<nav>` the id the toggle's `aria-controls` points at; if a page already uses that
  id for something else, pick a unique one and keep button and nav consistent.
- These pages define their own CSS variables. If a page lacks `--fast`/`--ease` used by the
  homepage transition, either add them locally or inline equivalent durations — do not import
  the homepage's whole token block.
- Remove the now-dead `overflow-x:auto` / hidden-scrollbar rules from the mobile breakpoint
  so the two mechanisms don't fight.
- Above 767px the nav must look and behave exactly as it does today on that page.

Verify each page at 375px: toggle visible, all links reachable, Escape and outside-click
close, `aria-expanded` flips, and `document.documentElement.scrollWidth <= window.innerWidth`.

## 8. Hobbies loads TikTok's script automatically

`hobbies/index.html:390` injects `https://www.tiktok.com/embed.js` on load, and the CSP was
widened for it in `d6b08b1`. That runs third-party code and lets TikTok see every visitor,
which does not match the site's stated no-tracker position.

Convert it to click-to-load: render a static placeholder card in `#tiktokPanel` naming what
it is and that loading it contacts TikTok, with a button that injects the script on click.
Keep the existing `<blockquote class="tiktok-embed">` fallback link
(`hobbies/index.html:287-288`) visible in the un-loaded state so the profile is reachable
without running TikTok's code. Do not narrow the CSP — the embed still needs it once loaded.

---

## Verification before you report done

Run these and make sure they come back clean:

```
grep -rn "0ms" --include="*.html" apps/ | grep -v transitionDelay
grep -rn "guarantee\|guaranteeing\|always have 30 days" apps/unlidisk/
grep -rn "In development" unlirice/index.html
grep -c "nav-toggle" aboutme/index.html the_studio/index.html how_I_work/index.html hobbies/index.html playground/index.html unlirice/index.html kitchen_vision/index.html shuttle_vision/index.html apps/clearspace/index.html apps/unlidisk/index.html
git diff --stat
```

Load each edited page and confirm zero console errors and no horizontal document overflow
at 375px. Do not commit — leave the changes in the working tree for review.

## Explicitly out of scope — do not attempt

1. **OpenGrail's corpus.** `opengrail/` is vendored build output copied in from the separate
   `github.com/CalixOscar/OpenGrail` repo (see `git log -- opengrail/graph.json`: "deploy:
   update opengrail with…"). Edits to `graph.json`, `artifacts/` or `assets/` here are
   overwritten on the next deploy copy. The real defects — 438 of 1337 artifacts whose
   caption shares no wording with its source file, e.g. `aa-thelema-2.webp` captioned
   "Original A∴A∴ Equinox publication" but sourced from a photo of the cruise ship
   *Celebrity Equinox*, and `advent-christian-church-1.webp` captioned as a George Storrs
   portrait but sourced from *Imperial War Cabinet in 1917* — must be fixed upstream.
   Only item 6 above, which edits this repo's `index.html`, is in scope.
2. **App Store Connect fields.** ClearSpace's privacy URL, developer website and data
   declarations are changed in App Store Connect by the founder. Not a repo change.
3. Anything not listed in items 1–8.

## When you finish

Overwrite the Handoff section of `PROJECT_NOTES.md` using its fixed fields
(`**Status:**`, `**Task:**`, `**Files touched:**`, `**Next step:**`, `**Gotchas:**`,
`**Left by:**`), and append one dated entry to the Decisions Log recording the accuracy
pass and the finding that OpenGrail is vendored. Keep the Decisions Log entry under
~150 words and point at this plan file by path rather than restating it.
