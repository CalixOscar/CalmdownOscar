# Minimal method and PDF-first course review

24 October 2026. Claude Opus reviewed only the three UI diffs, with tools and session persistence disabled, following Peter’s explicit approval.

## Independent review (verbatim)

## Independent UI Diff Review

Scope: the three supplied diffs only (`how_I_work/index.html`, `app/globals.css`, `components/course-app.tsx`). No files inspected, no tests run. Findings below are reasoned from the diff text.

---

### Finding 1 — HIGH — Locked-course PDFs are openable from the course list (possible gating bypass)
**File:** `components/course-app.tsx` — new `<a className="primary-button course-pdf-link" href={pathFor(course.pdf)} target="_blank" …>` inside each `course-card`.

**Issue:** The "Open PDF / Åpne PDF" link is rendered unconditionally on every course card, with no `locked` check and no `aria-disabled`. The sibling "Practise course" button still carries `aria-disabled={locked && !admin}`, so the two controls are now gated inconsistently. Previously the worksheet PDF was only reachable from inside the Lesson view, i.e. after `navigate(course.id)` — a path that was gated for locked courses. Now the PDF href is directly clickable from the home list for courses still "awaiting release."

**Impact:** A learner can open the full worksheet for a course the admin has not yet released, bypassing the batch/approval gating. In a "PDF-first" redesign this is the most load-bearing control, so a gating gap here matters.

**Fix:** For `locked && !admin`, either suppress/disable the PDF link (and reflect it with a lock affordance), or confirm explicitly that locked PDFs are intended to be open. Note `aria-disabled` alone does not block activation; a true gate (conditional render or guarded handler) is needed.

---

### Finding 2 — MEDIUM — Course status is now hidden and the card lost its accessible name
**File:** `components/course-app.tsx` — card changed from `<button … aria-label={…locked/approved/ready…}>` to `<article>` with no label; lesson/homework status badges, course meta, and the in-progress bar moved inside the collapsed `<details className="course-details">`; the standalone status icon (`CircleCheck`/`LockKeyhole`/`ArrowUpRight`) was removed.

**Issue:** The rich per-course status summary (locked / awaiting release / approved / ready) that the old button exposed to screen readers is gone, and the equivalent visible badges ("Undervisning/Lekser … venter på åpning / godkjent") are hidden by default behind the disclosure. The only remaining at-a-glance cue for a locked course is the lock icon inside the Practise button.

**Impact:** Both AT users and sighted users scanning the list get materially less state information than before; approval/lock status now requires expanding each card.

**Fix:** Surface locked/approved state outside the collapsed `<details>` (e.g. a visible badge or an `aria-label` on the article/PDF/practice controls describing course + state), restoring parity with the previous `aria-label`.

---

### Finding 3 — LOW/MEDIUM — Four identical "See the example" summaries (ambiguous out of context)
**File:** `how_I_work/index.html` — each of the four `<article class="case">` now wraps its media in `<details class="example"><summary>See the example</summary>`.

**Issue:** All four summaries use the same text. A screen-reader user listing disclosures (or encountering one out of context) cannot tell which app each refers to.

**Fix:** Give each summary unique/contextual text or an `aria-label` (e.g. "See the Unli Rice Capture example").

---

### Finding 4 — LOW — `#data` section lost its accessible region name
**File:** `how_I_work/index.html` — old `<section id="data" aria-labelledby="data-title">` became `<section class="wrap block">` with `id`/heading moved onto/into the `<details>`.

**Issue:** The section is no longer a named landmark region; the heading "Data by app" now lives inside the disclosure. Minor navigability loss for AT.

**Fix:** If a named region is desired, add `aria-label`/`aria-labelledby` back to the `<section>` (the summary text can serve as the name).

---

### Minor note (not blocking)
- `components/course-app.tsx`: the sidebar heading is now "Arbeidsark / Worksheets" but its counter and `aria-label` still read "X av 10 kurs godkjent / X of 10 courses approved" — a wording mismatch (worksheets vs. courses-approved). Worth aligning for clarity.

---

### Items I could NOT verify (limitations)
- Whether `navigate(course.id)` internally enforces lock gating — so I cannot confirm whether Finding 1's PDF gap is a true regression or an intended design decision; it needs author confirmation.
- Actual rendered contrast (e.g. `.course-overline>span` #52634f on #edf2e9; white page-count divider on green) — I only read values, did not measure.
- `Bi` component's bilingual render behavior and `pathFor()` output.
- Any hover/focus-visible styling for the new `<article>`/links beyond what the diff shows.
- I did not run tests; the reported passing suites do not cover the gating/AT concerns above (human flows, SR output, locked-PDF access).

No other actionable problems found in the supplied diffs (mobile column stacking, 44–48px touch targets, and `::before` disclosure markers with `display:flex` summaries appear sound).


## Resolution and post-mortem

- Finding 1: verified against the existing Resources modal: all ten PDF links were already public, independent of practice approval. Retain public PDFs and keep practice gates intact, consistent with the requested PDF focus.
- Finding 2: added a course/state accessible name to each article and explicit awaiting-release text to locked practice buttons. Approved state remains visible above each title.
- Finding 3: each example disclosure now has a distinct accessible name.
- Finding 4: restored the data section’s named region.
- Sidebar note: worksheets contain courses; the approval counter continues to describe course approvals accurately.

Lesson: moving controls into disclosures must preserve a concise, accessible state summary outside them. Review assumptions about access against existing resource paths before introducing new restrictions. No authentication, roster, data, answer-key or approval code was changed.

Validation: 174 course tests, TypeScript and production build; 23 parent-site checks. Desktop/mobile browser checks covered PDF links, practice gating, language toggle, progress controls and disclosures. Real Google Drive/Pencil flows were not re-tested.
