# Norsksti guided flow — independent review dialogue

Status: Awaiting Claude pre-mortem. Not settled. No Claude review has been produced.

## Codex — review dispatch status — 2026-10-25

The founder requested a considered guided-flow proposal and a Claude pre-mortem. Proposal: `docs/PLAN-norsksti-guided-flow.md`.

Two available review routes were attempted:
1. Connected Claude Code Agent tool, Opus, review-only brief: failed with `Agent type 'general-purpose' not found. Available agents:` (empty registry).
2. Installed Claude CLI, Opus/high, read-only tools and no session persistence: exited 1 with `Not logged in · Please run /login`.

No independent findings exist; do not treat Codex's own risk analysis as Claude review. Stop dispatch attempts until the connector has a reviewer agent or the installed Claude CLI is signed in. No source/build/config changes were made. Current blocker is review access, not design approval.

Once available, ask Claude to read the plan and relevant `.sites-norsksti` source, then append a turn headed `## Claude — pre-mortem — YYYY-MM-DD`. Challenge teaching context, slide count/click burden, teacher-led versus solo use, strict answer gating, draft/import/multi-tab/storage safety, reports, approval boundaries, offline fallback and conversion scope. Require prioritized concrete failure scenarios and corrections, separating evidence from assumptions. Change only this dialogue, no commits, implementation, deployment or nested agent dispatch. Codex then answers each finding and revises the plan; disputed decisions go to the founder. Only mark Settled after review has actually occurred and findings are resolved.

## Claude — pre-mortem — 2026-10-25

Reviewer: Claude (Opus 5.5). Read: `AGENTS.md`, studio guardrails (tiers/bridge sections), `docs/PLAN-norsksti-guided-flow.md`, and in `.sites-norsksti` at `c2523b9` (branch `ui/pdf-first`, clean): `components/course-app.tsx`, `components/student-classroom.tsx`, `components/bilingual.tsx`, `lib/progress.ts`, `lib/classroom.ts`, `lib/course-copy.ts`, `public/sw.js`, `public/courses.json`, `public/course-structure.json`, `tests/` listing, `README.md`. No build or tests run; deployed-Site parity not checked (unverified).

**Verdict.** The direction is right and the completion/approval contracts are careful. Four things will sink it as written: the step granularity (≈1,000 Continue presses across the course), a hand-authored manifest being the *only* way into the new flow, the service worker not caching the new manifest, and the strict answer key becoming a gate. Fix those and it is buildable as a Course 1 pilot. Build the pilot first; do not extract a reusable engine yet, but settle five cheap boundary decisions now (end of this turn).

### Verified facts used below
- 10 courses, 170 source pages, **958 exercises**: 791 keyed, 167 open (`answer: null`), 72 with choices. **552 of the 791 keyed exercises have no `alternatives`.**
- Course 1: 13 sections, 58 exercises (lesson 57, homework 1). Per page: p4 4, p5 2, p6 4, p7 12, p8 9, p9 15, p10 3, p11 4, p12 4, p13 1.
- `answerMatches` is exact equality after NFC/trim/lowercase(`nb-NO`)/strip trailing `.!?`/collapse spaces (`lib/progress.ts`). Example: `c1-p4-e3` key `Han heter Pablo.`, no alternatives — `Pablo` and `Han heter Pablo fra Bolivia` are both "Not quite".
- `fill()` overwrites the learner's own text with the key and records `correct, filled: true` (`course-app.tsx:421-424`). The report therefore never contains the learner's attempt.
- `public/sw.js:7` precaches only `/courses.json` and `/course-structure.json` in the shell; `:41` treats only those two as network-first dynamic data. A new `public/lesson-flow.json` is in neither list.
- Progress is written wholesale on every state change (`course-app.tsx:140-144`); a `storage` listener exists only for `CLASSROOM_KEY` (`:150-157`). Two tabs already overwrite each other's progress today — last writer wins, silently.
- `status: "saved"` currently only means "open response awaiting self-review"; `ExerciseCard` shows the self-review button for `!correctAnswer && status === "saved"` and the "Review it to complete" message for any `saved`.
- `recordResponse`/`toggleRead` write unconditionally, including during admin preview of an unreleased part (they write to the admin's own browser).
- Classroom code hard-codes 10 courses and lesson/homework pairs: `ALL`, `DEFAULT_BATCHES`, `ids()` (1–10), `batches()` (must cover exactly 1..10), `parseProgress` (`completedCourses ≤ 10`, ids 1–10).
- Interface copy is a fixed Bokmål-primary/English-secondary pair (`Bi nb/en`, `copy(nb,en)`, `contentNb` lookup map); answer normalisation is `nb-NO`.
- Source text carries textbook/workbook references ("Tekstbok Kap. 1, side 13", ~30 "Arbeidsbok Kap. N, side …" strings). README: built from the ten `a1uke*.pdf` worksheets; 170 page images and reduced PDFs are shipped in `public/`.
- The course is deployed through the Sites helper (history is "Update Site source" commits; `.openai/hosting.json`, R2 binding, `ADMIN_PASSWORD`/`SESSION_SECRET` secrets).

### Findings, most consequential first

**1. Critical — step granularity turns the course into ~1,000 Next clicks.** The page-4 example spends 7 steps on 4 questions. Applied to Course 1 that is ≈57 exercise steps + 12 teaching steps + checkpoints ≈ 75 screens for one lesson; page 7 alone is 12 single-blank pronoun steps, page 9 is 15 number steps. Across 958 exercises it is the "hundreds of unnecessary Next clicks" the founder ruled out, and in class the teacher loses the "look at all twelve together" view that drills rely on.
*Correction:* a step is one **task**, not one input. Add a `set` step: several short items of one task on one screen, each with its own Check and in-place feedback, one Continue at the end. Single-item steps only where an item needs its own context or feedback (comprehension questions, open responses, writing). Default grouping = one set per worksheet task (prompt prefix such as `6a`, `6b` or the section when no prefix). Budget to test in the pilot: Course 1 lesson in roughly 25–35 screens, not 75.

**2. Critical — a hand-authored manifest as the only entry to the new flow is not realistic.** Ticket 4 asks someone to hand-author ordered steps for 958 exercises after the pilot; until then 9 of 10 courses stay on the old renderer, so learners switch between two UIs mid-course and both must be maintained.
*Correction:* **derive** the default flow from `courses.json` + `course-structure.json` (each section → one teaching step showing its worksheet page, then its exercises as `set`/single steps by finding 1's rule). The manifest becomes **overrides only**: a short goal line, splitting/merging/reordering within a section, context references, and in-class cues. All ten courses get the guided flow on day one; Course 1 gets authored overrides for the pilot; the old renderer is only the error fallback. Coverage tests then run on the derived+overridden result for every course. This is also exactly the engine/content seam a template needs.

**3. High — offline breaks for the new content file.** `lesson-flow.json` would not be precached or refreshed (`sw.js:7`, `:41`). An installed learner opening offline gets either no overrides or a stale file that no longer matches a newer `courses.json` (IDs removed/added).
*Correction:* add the file to `SHELL` and the dynamic list, extend `tests/service-worker.test.mjs`; give the manifest a `contentRevision` tied to `courses.json` and ignore overrides (fall back to derived flow, never to an error) on mismatch or invalid IDs. With finding 2 a missing manifest degrades to the derived flow, not to the old page.

**4. High — the answer key becomes a wall, and revealing destroys evidence.** "On a correct answer, Continue becomes the primary action" makes exact-string matching the normal path through a key where 70 % of keyed items have no alternatives. A beginner who writes `Pablo` is told "Not quite" (likewise `Han leser.` for `Han leser en bok.`, `Han går på tur.` for `Han går tur.`), and the only way forward that completes the item is Fill answer, which overwrites their attempt; the teacher never sees that it was valid.
*Correction:* (a) Continue is always available after an attempt; an unfinished item simply stays unfinished and is listed at the part summary (no "Return to this later" ceremony needed). (b) "Show answer" first shows the key **beside** the learner's text without overwriting it; "Use this answer" (records `correct, filled`) is a separate explicit choice. Keep the learner's last attempt in the local session store and show it in the summary. (c) Before the pilot, the teacher does an alternatives pass on Course 1's ~53 keyed items in the existing Shared answers editor. (d) Feedback for near-misses stays honest: no fuzzy matching or AI marking added. Whether the attempt should travel in the report is a v1 format change → founder decision D6, not part of the pilot.

**5. High — "write `saved` on every edit" corrupts meaning and churns progress.** For keyed items `saved` has never existed; the UI would show "Review it to complete" with no review button, an accidental keypress downgrades a correct answer, and a report exported mid-edit shows a regression that did not happen.
*Correction:* progress (v1) holds **only committed results** — Check, self-review, Use this answer. Drafts live only in the session store. If a draft differs from the committed answer, the step and the summary say "Changed — not checked; your checked answer still counts". This meets the plan's goal (no draft ever earns completion) without inventing a status or touching v1 semantics.

**6. High — multi-tab overwrite already loses work, and the player will make it more frequent.** The plan handles conflicts only for session drafts. A teacher projecting in one tab and practising in another, or a learner with two tabs, silently loses answers today.
*Correction (Ticket 2):* listen for `PROGRESS_KEY` storage events and merge: responses per exercise by newer `updatedAt`, `readSections` as union (the player never un-reads; the legacy toggle remains the only un-read path). Session drafts: last write per exercise wins, with a quiet "updated in another tab" notice; drop the plan's keep-which-version dialog — it is a lot of UI for a rare case once progress itself merges.

**7. Medium — classroom use has no way to say "we're on step 3 of page 7".** Without live sync (correctly excluded), the teacher must direct pupils by name. Steps need a short stable visible label (e.g. `4 · 2/5` = worksheet page 4, step 2 of 5) shown on the stage and in the Outline, and Outline must allow a jump to any step in an available part. Also: a solo learner at home defaults into "In class" with partner cues and no partner. Ask once when a part is first started ("With your teacher right now?" → In class / On my own), remember per device, switchable from the stage.

**8. Medium — re-typed teaching excerpts duplicate the worksheet.** The page-4 example re-authors the Anne/Pablo dialogue. That duplicates source text that already exists as the worksheet image + text version, can drift from it, multiplies authoring, and creates more derived copies of textbook-based material (see licensing below).
*Correction:* the teaching step **is** the worksheet page (existing `SourcePage`: image, enlarge, text version, honest unavailable state). Authored content is limited to a goal line (≤ 1–2 sentences, nb + optional en) and an optional in-class cue. Exercise steps get a "Show worksheet page" reference opening that same page (side panel when wide, modal sheet when narrow, focus returned).

**9. Medium — preview and presentation must not write.** Today admin preview writes to the admin's browser. In presentation the teacher wants to demonstrate a wrong answer.
*Correction:* in admin preview / presentation, Check evaluates and shows feedback but records nothing; drafts are not persisted; a visible "Preview — nothing is saved" bar.

**10. Medium — Ticket 3 is too large for one build step.** It bundles player, exercise extraction, presentation/fullscreen, reference panel, summary/review boundary, conflict UI, and a full accessibility pass, inside a 71 KB single-file component with very long lines.
*Correction:* split into 3a player + derived flow for all courses + summary (no presentation extras), 3b in-class presentation (labels, cue display, fullscreen, preview-no-write). Each ends with its own build + browser journey.

**11. Low — read marks and teacher jumps.** If only "explicit final teaching Continue" records a read, a class that the teacher moves forward via Outline ends with unread pages and an un-submittable part. Record the read when the learner leaves a displayed teaching step forward (Continue or Outline forward from it); skipped-never-displayed pages are listed in the summary with an Open link.

**Accepted as is:** separate lesson/homework approval and batch gating untouched; modes affect presentation only; course 10 empty-lesson briefing; course 2 prior-course homework mapping; no dependencies, AI marking, generated audio, backend or schema change; old renderer as fallback; import discards matching drafts; drafts bounded to 20,000 chars; storage-failure warning without claiming recovery.

### Reusable-template direction

**Recommendation: build the Norsksti pilot first, with the five seams below fixed now; extract nothing until a teacher and a solo beginner have used the pilot.** A template sold before the flow is proven would freeze the wrong unit of interaction (finding 1 is exactly that kind of mistake).

1. **Engine vs content package.** Engine: flow derivation + override merge, stage/player, activity renderers, answer checking, local progress/session store, summary/review boundary, offline cache, presentation mode, optional classroom module (releases, approval codes, reports, admin answer key, whiteboards). Content package: `course.json` (metadata, language, direction, policy), lessons/parts with sections and items, answer keys/alternatives/explanations, worksheet media, overrides, brand tokens (name, colours, logo), interface string bundle.
2. **Norsksti-specific assumptions to remove later:** exactly 10 courses (`classroom.ts` `ALL`/`DEFAULT_BATCHES`/`ids`/`batches`, `parseProgress`); lesson + homework as the only two parts; worksheet **page** as the teaching unit and `/worksheets/course-N/page-P.webp` paths; `nb-NO` normalisation; `Bi nb/en` fixed pair and `contentNb` map; teacher approval as the only policy; "Norsk A1"/brand strings in components; batch plan format.
3. **Smallest authoring format:** one course file plus one file per lesson; each lesson has `objective`, ordered `steps`, each step either `teach` (blocks: text, image/page ref, example) or an activity (`set` of items, or single `item`), plus optional `cue` (in-class) and `reference` (what to show beside the task). Items: `prompt`, `answer` + `accept[]` or `open: true`, optional `choices`, `explain`. That is it; no branching, scoring weights or prerequisites inside lessons. Trap to design for: Course 1 has an item whose correct answer is the word `null` (`c1-p9-e1`, Norwegian "zero"); a YAML format would read it as "no answer" and silently turn it into an open item. Either use JSON, or quote all answers and have the validator flag YAML null/boolean coercions (`no`, `yes`, `on`, `null`).
4. **Languages/RTL/non-language:** separate **interface language** (string bundle per locale, chosen by course/teacher, optional secondary "support" language replacing the hard-coded English) from **content language** (`lang`, `dir` per course, overridable per block). Stage uses `dir`, logical CSS properties, `lang` on inputs; answer normalisation takes the content locale. A non-language subject is just `lang` = interface language and no support language.
5. **Activity types now:** teach/read, short answer with accepted alternatives, single choice, open response + self-review, grouped set. **Wait:** matching, ordering, cloze-with-dropdowns, numeric tolerance/units, audio recording, image hotspots, drawing-as-answer, timed anything, branching. Whiteboard stays a classroom tool, not an activity type.
6. **Non-developer editing:** a documented content template (folder + JSON/Markdown files + a `validate` command with plain-language errors + local preview) is the right first step: zero new infrastructure, diff-able, and it works offline. A visual editor needs persistence, accounts or file-system access, undo, validation UI and support — it is a product of its own. Revisit only if pilot buyers cannot use the documented template with a sample to copy.
7. **Approval as policy:** yes — `policy.review: "teacher-approval" | "self-paced"`. Self-paced course = no releases/approval; completion is the learner's own record. Studying alone **within** a teacher-managed course = presentation mode "On my own"; gating unchanged. Only `teacher-approval` exists in Norsksti; the field is declared now so it isn't a rewrite later.
8. **"Sellable template", operationally.** *Downloadable/self-hosted:* buyer gets source + sample course + docs, hosts it themselves; low ongoing cost for the studio, but the current stack (Workers + R2 + signed-grant secrets + optional Google Drive OAuth) is heavy for a non-developer, and support load lands on setup. *Hosted authoring product:* accounts, billing, storage of other people's content and learner data, uptime — explicitly outside current studio constraints (backend, accounts, payments). *Narrow first offering:* a downloadable **static, offline-first course kit** — self-paced policy only, local progress + JSON backup, no admin server — with an original sample course and the content template; classroom approvals offered later as an optional module once its setup can be documented end to end. Trade-off: it leaves out the feature that makes Norsksti distinctive (teacher approval) in exchange for something a buyer can actually deploy on any static host.
9. **What a buyer needs:** an original sample course (not Norsksti), a getting-started guide (replace content, branding, deploy to a static host), the schema reference, a validator, a licence (what they may do with the code; that their content stays theirs), a changelog and how updates are delivered without overwriting their content folder, and a stated support boundary.
10. **Ownership/licensing — must not be assumed.** The ten `a1uke*.pdf` worksheets, their 170 page images, the reduced PDFs, the OCR text in `courses.json` and the answer keys appear to be built on a commercial textbook and workbook (references to "Tekstbok"/"Arbeidsbok" chapters and pages; publisher not identified — unverified). Who authored the worksheets and under what terms the founder may use them is unknown. None of this may ship in a commercial template, and its use in Norsksti itself should be confirmed with the teacher/rights holder. Findings 2 and 8 also reduce exposure by not creating further derived copies.
11. **Decide now (cheap, avoids a rewrite):** (a) derived flow + overrides keyed by stable section/exercise IDs; (b) step kinds limited to `teach`, `set`, `item`, `checkpoint`; (c) new modules are pure functions over course data — no hard-coded "10", `nb` or page paths in new code; (d) manifest declares `lang`, `dir`, `policy.review` even though only `nb`/`ltr`/`teacher-approval` are implemented; (e) licensed source material stays physically separate (`public/pdfs`, `public/worksheets`, `courses.json`) from engine code and from any authored overrides. **Can wait for pilot evidence:** interface string bundles/RTL implementation, removing the 10-course assumptions in `classroom.ts`, the authoring Markdown format and validator CLI, additional activity types, presentation polish beyond labels/cues, anything about pricing or distribution.

### Sample lesson package (schema sketch, not implementation)

```yaml
# course.yaml — Norsksti (content package)
id: norsksti-a1
lang: nb          # content language
dir: ltr
support: en       # optional secondary language for goal lines/cues
policy: { review: teacher-approval, parts: [lesson, homework] }
lessons: [c1]

# lessons/c1.yaml — overrides on the derived flow
id: c1
objective: { nb: "Presentere deg og si hvor du kommer fra.", en: "Introduce yourself and say where you're from." }
steps:
  - teach: { source: c1-p4 }                     # worksheet page = the teaching content
    cue: { nb: "Les dialogen høyt med en partner.", en: "Read the dialogue aloud with a partner." }
  - item: c1-p4-e1                                # open → save + self-review
  - item: c1-p4-e2
  - set: [c1-p4-e3, c1-p4-e4]                     # comprehension pair, one screen
    reference: c1-p4                              # dialogue stays one tap away
  - teach: { source: c1-p7 }
  - set: { from: c1-p7, groups: ["6b", "6c", "6d"] }  # 11 pronoun blanks: one screen per sub-task, not 11 screens
  - item: c1-p7-e1
```

```yaml
# course.yaml — a non-language course on the same engine (original sample content)
id: first-aid-basics
lang: en
dir: ltr
policy: { review: self-paced }
lessons: [recovery-position]

# lessons/recovery-position.yaml — fully authored, no source pages
id: recovery-position
objective: "Place an unresponsive, breathing adult in the recovery position."
steps:
  - teach:
      blocks:
        - text: "Check for danger, response and normal breathing before you move anyone."
        - image: { src: media/recovery-1.webp, alt: "Kneeling beside a person lying on their back" }
  - set:
      - { id: rp-1, prompt: "What do you check first?", choices: [Danger, Pulse, Pupils], answer: Danger }
      - { id: rp-2, prompt: "Which arm goes out at a right angle — near or far?", answer: near, accept: ["the near arm", "nearest"] }
  - item: { id: rp-3, prompt: "Describe the steps in your own words.", open: true }
  - checkpoint: { text: "You can now explain when and how to use the recovery position." }
```

Same engine path: derive → apply overrides → render `teach`/`set`/`item`/`checkpoint`; policy decides whether the summary ends in "Export for teacher review" or just "Done".

### Changes the plan needs before implementation
1. Add `set` step kind and the "task, not input" rule; screen budget for the Course 1 pilot (finding 1).
2. Replace "authored manifest per part" with derived flow + overrides for all courses; rewrite Ticket 4 as "author overrides where pilot evidence shows value" (finding 2).
3. Service worker: precache + network-first for the manifest, `contentRevision`, tests (finding 3).
4. Continue never gated on correctness; Show-answer-before-overwrite; pre-pilot alternatives pass (finding 4).
5. Drafts never touch v1 progress; drop the `saved`-on-edit rule (finding 5).
6. Progress cross-tab merge in Ticket 2; simplify session conflict handling (finding 6).
7. Stable step labels, Outline jump to any step, first-start mode question (finding 7).
8. Teaching step = existing worksheet page + short goal/cue only; reference panel reuses `SourcePage` (finding 8).
9. Preview/presentation records nothing (finding 9).
10. Split Ticket 3 into 3a/3b (finding 10); read-on-leave rule (finding 11).
11. Add the five "decide now" seams to the manifest schema; record the template direction as deferred, with licensing as a blocker for any sale.

### Assumptions (not verified)
- That the deployed Site matches `c2523b9`; that learners use one device per person; that most Course 1 drills are short single-blank items (true for p7/p9 by inspection of prompts, not every page checked); that the worksheets derive from a commercial textbook.

### Founder decisions
- **D1** Continue after a wrong answer without revealing (item stays unfinished). *Recommended: yes.*
- **D2** Who writes and approves the Course 1 goal lines and in-class cues. *Default if unanswered: Codex drafts them marked "draft — teacher to approve"; nothing else is invented.*
- **D3** Arrange the pilot: one teacher-led session and one solo beginner.
- **D4** Confirm the rights to the `a1uke*.pdf` worksheets and the textbook-derived text/answers — required before any template sale, advisable for Norsksti itself.
- **D5** Whether to pursue the template at all, decided after the pilot; if yes, the recommended first offering is the static self-paced kit with original sample content.
- **D6** Whether the learner's own attempt should travel in the teacher report (a v1 format change) — defer until pilot evidence shows teachers want it.
