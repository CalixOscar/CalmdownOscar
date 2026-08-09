# Antigravity prompt — propagate dark theme to remaining pages

Copy everything below the line into Antigravity. Written 2026-08-09, against commit `4c961fd`.

---

## TASK

Repo: `~/Documents/Projects/CalmdownOscar` (static HTML site, no build step, no framework).

`index.html` has already been converted from a light theme to a dark navy theme. Your job is to apply the **same** dark theme to 18 other pages listed below. This is a mechanical colour-value migration. Do not redesign anything.

Work only inside `~/Documents/Projects/CalmdownOscar`. Do not create files or folders outside it.

## THE ONE HARD RULE

**You may only change colour *values*. You may not touch a single CSS selector.**

Specifically, you are allowed to:
- Change values inside the `:root{ }` block.
- Replace the exact literal strings listed in the "Literal replacements" table below, wherever they appear.
- Change the `<meta name="theme-color">` value.

You are **forbidden** to:
- Add, delete, rename, or modify any CSS selector.
- Add any new CSS rule.
- Add a descendant selector of any kind (e.g. `.card img`, `.section p`).
- Change any layout, spacing, font, `border-radius`, `width`, `height`, or `object-fit` property.
- Touch any HTML markup, text, link, or image.

This rule is not stylistic. On 2026-08-03 an over-broad descendant selector added during a styling pass broke image sizing across the entire site and required manual cleanup. Restricting yourself to values inside `:root{}` plus a fixed list of literals makes that class of bug structurally impossible. If you think a task requires a new selector, **stop and report it instead of writing it.**

## FILES TO CHANGE — exactly these 18

```
aboutme/index.html
apps/index.html
how_I_work/index.html
the_studio/index.html
unlirice/index.html
clearspace/work_in_progress/index.html
apps/clearspace/index.html
apps/clearspace/privacy.html
apps/clearspace/support.html
apps/clearspace/user_guide.html
apps/unlidisk/index.html
apps/unlidisk/privacy.html
apps/unlidisk/support.html
apps/unlidisk/user_guide.html
unlidisk/index.html
unlidisk/privacy.html
unlidisk/support.html
unlidisk/user_guide.html
```

## FILES TO LEAVE ALONE — do not open these to edit

| File | Why |
|---|---|
| `index.html` | Already converted. It is your reference for correct values. |
| `playground/index.html` | Already dark, by a different mechanism. Uses a blue accent on purpose. |
| `hobbies/index.html` | Already dark, same mechanism as playground. Blue accent on purpose. |
| `theme-preview.html` | Dev scratch file. Not in `sitemap.xml`, no inbound links, has its own unrelated palette. |
| `apps/wedding-concierge/index.html` | No `:root` token system at all. Different fonts (Bricolage Grotesque / Instrument Sans via Google Fonts). Separate mini-site design. Needs a decision, not a find/replace. |
| `apps/paper-plane-simulator/index.html` | Same as above. |

## STEP 1 — the `:root` token block

In each of the 18 files, find the token block. On 8 of them it looks exactly like this:

```css
    --bg:      #EEF2F6;
    --panel:   rgba(255,255,255,0.4);
    --edge:    rgba(32,43,54,.12);
    --edge-hi: rgba(59,110,165,.4);
    --accent:  #3B6EA5;
    --ink:     #202B36;
    --muted:   #62717C;
```

Replace those **values** with:

```css
    --bg:      #141B22;
    --panel:   rgba(255,255,255,.05);
    --edge:    rgba(255,255,255,.09);
    --edge-hi: rgba(133,182,255,.4);
    --accent:  #85B6FF;
    --ink:     #E8EEF4;
    --muted:   #8FA0AE;
```

If the file also has `--progress:#A9782F;`, change it to `--progress:#B88233;`.

**The accent is BLUE (`#85B6FF`), not orange.** Orange is reserved for `index.html` only — it is the one page that gets any hint of it. `#85B6FF` is the same dark-mode accent already used by `playground/` and `hobbies/`, so these 18 pages will match those two. Do not use `#E4471D` anywhere in these files.

These are not arbitrary — every value is measured. Contrast ratios against `#141B22`: `--ink` 14.9:1, `--muted` 6.5:1, `--accent` 8.38:1, `--progress` 5.19:1. Two of the old values fail AA and must not be kept: the old blue `#3B6EA5` is only 3.27:1 on this background, and the old amber `#A9782F` is 4.48:1 while rendering real small text (the "Awaiting Review" status).

Some files have extra page-specific tokens near the block (for example `aboutme/index.html` has `--night`, `--tank`, `--pacifier`). **Leave those alone.** Only change the seven names listed above, plus `--progress` if present.

## STEP 2 — `theme-color` meta

Change `<meta name="theme-color" content="#EEF2F6">` to `<meta name="theme-color" content="#141B22">`.

## STEP 3 — literal replacements

Replace these exact strings wherever they appear in the 18 files. The alpha value varies per page — **preserve whatever alpha is already there**, change only the colour channels.

| Find | Replace with | What it is |
|---|---|---|
| `rgba(238,242,246,` | `rgba(20,27,34,` | Light page-colour used in topbar / scrim backgrounds. `#EEF2F6` = `rgb(238,242,246)`; `#141B22` = `rgb(20,27,34)`. |
| `rgba(59,110,165,` | `rgba(133,182,255,` | Old blue accent in rgba form (glow/pulse keyframes). New blue `#85B6FF` = `rgb(133,182,255)`. |
| `rgba(169,120,47,` | `rgba(184,130,51,` | Old amber in rgba form. Matches the new `--progress`. |

Note the spacing varies — some files write `rgba(238, 242, 246,` with spaces. Match both forms.

## STEP 4 — the judgment cases: FLAG, DO NOT GUESS

Each file contains some number of `rgba(32,43,54,...)` values. That is the old *dark ink* colour used at low opacity on a *light* background — for borders, subtle fills, and shadows. On a dark background these become invisible or wrong, but the correct replacement differs by purpose, so there is no safe blanket rule.

Counts per file:

```
aboutme/index.html                        2     apps/unlidisk/privacy.html      2
apps/index.html                          16     apps/unlidisk/support.html      2
how_I_work/index.html                     6     apps/unlidisk/user_guide.html   2
the_studio/index.html                     2     unlidisk/index.html             8
unlirice/index.html                       7     unlidisk/privacy.html           2
clearspace/work_in_progress/index.html    9     unlidisk/support.html           2
apps/clearspace/index.html                3     unlidisk/user_guide.html        2
apps/clearspace/privacy.html              2     apps/clearspace/user_guide.html 2
apps/unlidisk/index.html                  8     unlidisk/support.html           2
```

Apply this rule, which mirrors what was already done on `index.html`:

- If it is a **border** colour → replace with `rgba(255,255,255,.09)`.
- If it is a **subtle background fill** (a panel, a well, an inline `<code>` background) → replace with `rgba(255,255,255,.05)`.
- If it is a **`box-shadow`** → delete the whole `box-shadow` declaration's colour is not enough; instead **flag it and leave it**. Shadows do essentially nothing on a dark background and removing them changes visual weight. That is a design call, not a mechanical one.

**Anything you are not confident about: leave it unchanged and write it into your report.** A page that is 95% converted with 3 flagged lines is a good outcome. A page where you guessed and got it subtly wrong is not — it will not be obvious in a screenshot and it will ship.

## STEP 5 — verify every single file

After each file, before moving to the next:

1. Open it in a browser at **375px** and at **1440px**.
2. Confirm: no element still has a light background sitting inside the dark page.
3. Confirm: all body text is readable — nothing dark-on-dark.
4. Confirm: no horizontal scrollbar appears at 375px.
5. Confirm: browser console has zero errors.
6. Confirm: **every image still renders at its original size.** This is the specific regression that happened last time. Compare against `git stash` / `git diff` if unsure.

If any check fails, fix it within the hard rule above, or revert that file and flag it.

## GOTCHAS — read these, they will each cost you time

- **`unlidisk/` and `apps/unlidisk/` are two different directory trees with near-identical files.** They are NOT symlinks and their contents genuinely differ. Both are in the list. Edit both. Same for the two ClearSpace locations.
- **`clearspace/work_in_progress/index.html` writes `:root {` with a space** before the brace. A grep for `:root{` will silently skip this file. It is in the list and it does need changing.
- **Do not add a Google Fonts link to anything.** Zero third-party network requests is a hard project rule (see `AGENTS.md`). Three pages currently violate this and are being handled separately — do not copy their pattern.
- **Do not introduce orange anywhere.** `index.html` is the only page on the site that carries the orange accent. These 18 pages use the blue `#85B6FF`, matching `playground/` and `hobbies/`. If you find yourself typing `#E4471D` or `rgba(228,71,29,`, you are in the wrong file.
- **`hobbies/index.html` is finished — do not touch it at all,** not even to "align" it with the others. It is already dark and already correct.
- The site uses `env(safe-area-inset-*)` for iOS notch support. Do not remove or alter those.

## WHEN DONE

1. Run these and paste the real output into your report:
   ```bash
   grep -rn "#EEF2F6\|#202B36\|#3B6EA5\|#62717C" --include="*.html" . | grep -v node_modules | grep -v theme-preview
   grep -rn "rgba(32, *43, *54" --include="*.html" . | grep -v node_modules | grep -v theme-preview
   ```
   The first should return nothing for the 18 files. The second will return your flagged lines — that is expected.
2. Commit with a message describing what changed and listing what you flagged. Do **not** push.
3. Report: files changed, every line you flagged and why, and anything you were unsure about.

## STOP CONDITIONS

Stop and report instead of continuing if:
- A fix seems to require a new CSS selector.
- A page looks structurally broken after the value swap.
- You have tried to fix the same issue twice without success. Do not attempt a third variation — write down what you tried and hand it back.
