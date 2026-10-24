# Norsksti: a guided classroom course that also works alone

Status: proposed design; independent pre-mortem requested. No implementation or publication authorized by this plan.
Date: 2026-10-25 (Asia/Manila).
Intent: founder's request on this date: retain the features, replace the text-heavy page experience with a flow where one task/slide is finished before the next appears; classroom-led first, usable for self-study.
Implementation branch: `codex/norsksti-guided-flow` (not created).

## 1. System Architecture Overview

### Evidence and limits

The studio repository is `/Users/calmdownoscar/Documents/Projects/CalmdownOscar`, baseline `07869dacbe06976fa1ea000ab87cf17238b58a8a`. Actual course source is its nested checkout `.sites-norsksti`, baseline `c2523b9c78c97f774b101cfca071b2b70bbeca45`, clean when inspected. The outer tree already contains unrelated untracked hiring post-mortems and `image0.jpeg`; preserve them. Site identity is retained in the course's `.openai/hosting.json`.

Verified in source:
- `components/course-app.tsx` already pages through sections. Each page simultaneously renders a worksheet, its read toggle, every exercise, progress/navigation and submission information. The problem is activity density and teaching sequence, not absence of pagination.
- `public/courses.json` contains original page text and exercises with stable IDs. Course 1 page 4 contains a short Anne/Pablo dialogue, two personal questions and two comprehension questions. Page 7 contains twelve pronoun exercises. Flattening either page into equally sized text chunks would lose teaching context.
- `public/course-structure.json` separates lesson/homework by source section ID. Later PDFs include homework reviewing earlier courses; course 10 has no lesson pages and a final-review briefing. Preserve this mapping.
- `lib/progress.ts` stores v1 read-section IDs and response values/statuses. `ExerciseCard` holds unchecked typing in component state; navigating away can lose it. Revealing a keyed answer records `correct` with `filled: true`. Existing completion includes `correct` and `reviewed`.
- `lib/classroom.ts`, `components/student-classroom.tsx` and the existing APIs own releases, approval codes and downloaded review reports. Practice completion and teacher approval are different. `partAvailable` also checks earlier batches; choosing self-study must not bypass it.
- Original PDFs, worksheet images/text fallback, offline caching, optional English, shared answer overrides, whiteboards, reports/backups and classroom administration already exist.

Live appearance/production-source parity is unverified. The public host could not be retrieved with the web reader. No build or journey tests were run: this is a planning task. Unli Rice memory tools were unavailable in this session; prior memory is unverified. Before implementation, verify current source against the deployed Sites version using its existing project identity, and follow its source helper workflow. Do not overwrite a newer remote checkout.

### Product direction

Make the active lesson a quiet teaching stage: one purpose, one piece of content or activity, one main action. Keep the current feature set reachable through contextual tools and a compact course menu. The first screen offers Resume/Start and the current lesson/homework status; the full course map is secondary.

The rhythm is **understand → try → feedback → continue**. A slide is a meaningful teaching unit, not a fixed-height box or arbitrary paragraph. Longer dialogue can remain together when comprehension requires it. Avoid a ceremonial Next click between every sentence. Desktop and phone use the same semantic flow with natural vertical scrolling when content, keyboard or larger text requires it.

Example from Course 1, page 4:
1. A short goal: introduce yourself and say where you come from.
2. Anne/Pablo dialogue, preserving speaker order and the relevant Norwegian phrases; optional English uses existing preferences.
3. “Hva heter du?” One response, then save/self-review feedback and Continue.
4. “Hvor kommer du fra?” Same pattern.
5. “Hva heter han fra Bolivia?” Keep the dialogue available beside/above the question or in a clearly named reference panel; check one answer, read feedback, Continue.
6. “Hvor kommer Anne fra?” Same pattern.
7. A concise section checkpoint, then the next section. Reference/summary slides must earn their place; omit a checkpoint that only repeats a completion badge.

Reading-only alphabet material needs an authored short explanation and an explicit “Ready to practise/Continue”, not a fabricated quiz. Existing pronunciation/audio references get an honest teacher-led/reading alternative where audio is unavailable; no invented recording or pronunciation scoring.

### Teaching and study use

One curriculum, two presentation choices: **In class** and **On my own**. These affect prompts and layout only, never identity, permissions, releases or approvals. Default to In class; choice is explicit and reversible.

- In class: readable stage, short “discuss/say this with a partner” cues where editorially justified; teacher can open Outline and jump to an available step. Presentation preview is clearly labelled and never writes a pupil's completion or reveals private answers. Reuse existing authenticated admin preview; do not add a public teacher bypass. No live broadcast/synchronization system.
- On my own: short instructions, examples and self-review cues make the same activity understandable without the teacher beside the learner. Open responses are saved/self-reviewed, not claimed to be correct. Oral practice offers a solo alternative. Teacher approval is still required under the existing course policy; say this before a learner starts and at the review boundary.
- Both: Back, Outline, worksheet/PDF and Help remain reachable. Outline may jump within currently available parts; jumps never mark skipped work complete. Unfinished steps are listed at review. The default forward path guides one step at a time without trapping learners behind exact-string matching.

### Navigation and completion contracts

- A keyed exercise: Check shows feedback in place. On a correct answer, Continue becomes the primary action. Never auto-advance while feedback is being read. Wrong answers allow retry, approved explanation/reveal, or “Return to this later”. Deferral navigates but does not complete the exercise or make the part ready for review.
- An open response: Save requires nonempty text, then explicit self-review using existing semantics. Continue after review; do not label the work teacher-approved. Do not add AI marking.
- Revealing an answer retains `filled: true` and existing compatible completion semantics; label it “Answer shown” rather than implying unaided mastery. Do not silently alter historic progress or grading. Review UI visibly distinguishes shown answers and self-reviewed work.
- Read-only sections: explicit Continue records the section as read. For sections with exercises, mark the section read only when the learner explicitly continues past the source teaching content; navigation/outline jumps alone never write read progress.
- Back preserves answers, feedback state where valid and current drafts. Editing a completed answer invalidates the active completion until it is checked/reviewed again; reports/readiness cannot count a stale correct answer after the learner has edited it. A draft is never a checked answer.
- Ending a part shows completed work, unfinished/changed drafts, shown answers and self-review, plus the existing export-for-teacher-review action only when all original completion requirements are satisfied. Explain that downloading is not sending. Keep separate lesson/homework approval and existing batch gating.
- Finishing a slide never approves a course. Admin preview never writes learner progress.

### Content and state boundaries

Introduce an explicit, authored flow manifest rather than runtime splitting of OCR text. New component/manifest are justified because the current page/exercise-list renderer cannot express teaching sequences without coupling all activities to a page.

Proposed modules in the course checkout:
- `public/lesson-flow.json`: versioned content manifest. Each course/part has ordered steps with stable string IDs, source section ID, kind (`teach`, `exercise`, `checkpoint`, `briefing`), short Bokmål content/optional English, and exercise ID for exercise steps. Use structured text blocks, not arbitrary executable HTML. Keep existing source IDs and exercise payloads authoritative. No duplicated answer keys.
- `lib/lesson-flow.ts`: validate manifest and build permitted sequence from existing course structures; derive completion/resume from existing progress plus draft state. Every source section in its original part and every exercise appears exactly once as a required completion-bearing reference. Extra editorial steps must not add hidden approval requirements. A section may have several teaching steps, but only its explicit final teaching Continue records the existing read ID. Empty course-10 lesson produces the existing briefing contract, not accidental automatic approval.
- `components/lesson-player.tsx`: stage, navigation, feedback and contextual reference/tools; use existing bilingual primitives, Modal and design styles. Refactor reusable exercise UI from `course-app.tsx` without changing answer matching/override semantics.
- `lib/lesson-session.ts`: separate bounded, versioned browser-local session key for course/part/step cursor, presentation choice and drafts keyed by original exercise ID. Validate IDs against current content, learner identity and maximum lengths/counts. Never store auth tokens here. It grants no authority.

Keep v1 progress, grant and report schemas compatible. Draft edits must immediately remove stale completion by writing a compatible `saved` response for that exercise while preserving the draft separately; only an explicit check/review writes `correct`/`reviewed`. Do not overwrite a saved checked response merely by opening its editor. Draft text is persisted on edits; cursor writes may be debounced but must flush before navigation. A successful save indicator requires successful storage; on storage failure retain in memory and show a persistent warning plus existing backup/recovery actions, never claim reload recovery. Progress backups carry committed `saved` drafts, but not cursors/presentation preferences; disclose that boundary. On successful import, discard matching local draft/session cache and recompute resume so stale drafts cannot overwrite imported work. On learner identity change clear/isolate session state. Across tabs refresh from storage; if an active dirty draft conflicts, retain it and ask which version to keep instead of silently overwriting either.

Resume: prefer a valid saved cursor within an available part; otherwise first unfinished required step in the first available unfinished part. If all available work is complete, open the part summary. Invalid/missing manifest entry falls back to the existing page renderer for that course/part without changing progress. A content revision that removes a cursor recomputes it from existing IDs. No remote student data, schema migration, new dependency or server/API change is required by this design.

### Delivery boundary

First produce a complete Course 1 lesson/homework pilot, test it with the teacher and a solo beginner, then author courses 2–10 using the same contract. Keep the original renderer for unconverted parts and recovery. Do not publish a partial rollout as a finished course redesign. Source feature parity is mandatory; a compact menu is not permission to remove a feature. No implementation, deployment or App Store work in this planning task.

## 2. Modular Ticket Breakdown

- [ ] **Ticket 1 — planner: author and validate the pilot content.** Files: new `public/lesson-flow.json`, new `lib/lesson-flow.ts`, new `tests/lesson-flow.test.mjs` in `.sites-norsksti`. Define the manifest and Course 1 lesson/homework teaching units. Inventory every existing feature and its intended entry point. Verify with the manifest coverage tests following existing `tests/load-typescript.mjs` conventions. Depends on settled review; no runtime changes yet.
- [ ] **Ticket 2 — build: add safe lesson session state.** Files: new `lib/lesson-session.ts`, new `tests/lesson-session.test.mjs`, `lib/progress.ts` only if required for compatible helpers. Depends on Ticket 1 contracts. Preserve v1 import/export and identity semantics. Verify targeted state/progress tests.
- [ ] **Ticket 3 — build: deliver the Course 1 player and entry points.** Files: `components/course-app.tsx`, new `components/lesson-player.tsx`, a bounded extracted exercise component if needed, `app/globals.css`, `app/student-classroom.css`; optional dedicated player CSS imported from the player. Integrate Ticket 1/2, existing tools, reference fallback and review boundary. Depends on both. Verify the complete existing suite, typecheck, build and browser journeys.
- [ ] **Ticket 4 — planner: validate teaching flow, then extend content.** Files: `public/lesson-flow.json`, coverage tests, existing `app/user_guide/page.tsx` if present (verify actual guide path before handoff). Teacher and solo learner first exercise the pilot. Amend editorial sequence based on observations, then author all remaining parts without changing their source assignment/approval policy. Depends on Ticket 3 and real pilot feedback; blocked until that feedback exists.
- [ ] **Ticket 5 — planner: integrated verification and independent post-mortem.** Record actual results and remaining limitations in this plan/dialogue. Review diff against preserved feature inventory; no source changes beyond fixes explicitly handed back through scoped tickets. Deployment is separate from this design request.

Tickets are sequential because content, state and UI share contracts. Do not dispatch parallel builders against shared files. Verify actual guide/style paths before a builder handoff and list exact allowed paths there.

## 3. Ticket Requirements

### Ticket 1
Input: courses, source structures and source PDF/text references. Output: authored Course 1 sequence and pure validation/lookup/completion contracts. Preserve original reading order unless teacher explicitly approves a different teaching order. Each exercise's context must be available without leaving and losing its draft. Missing media gets an honest fallback. Acceptance: all Course 1 lesson/homework sections and exercise IDs covered, no duplicates/cross-part references, valid stable IDs; fixtures reject invalid IDs and omissions. Teacher must approve new explanations before full rollout. All content checks are planned, not passed.

### Ticket 2
Input: stable manifest IDs, current learner identity, v1 progress and storage. Output: validated session load/save, draft handling, deterministic resume, import reset and conflict behavior. Bound draft values to the existing 20,000-character response limit and counts to known exercises. Edge cases: blocked storage, malformed JSON, removed step, locked part, old completed work, import, changed learner, interrupted editing, competing tabs. Acceptance: unit checks prove drafts never award completion, edited correct answers no longer count, existing backup fixtures remain readable, corrupt session cache does not reset valid progress/grants, locks cannot be bypassed by cursor or mode. Cursor recovery may fail gracefully; student work must not silently disappear.

### Ticket 3
Input: validated pilot manifest/session helpers and current answer overrides/permissions. Output: functioning player, compact home/outline/tools and fallback for all other courses. Main action hierarchy: answer input/Check, then feedback/Continue; no overlapping duplicate submit panels. On narrow screens a reference opens accessibly and returns focus to its trigger; on wide screens relevant dialogue may remain visible. Explicitly retain PDFs, worksheet images/text fallback, offline/save controls, optional English, whiteboards, reports/backups, help and admin access. Pending shared answers or offline state must not erase a draft; existing cached-answer behavior remains identifiable. Existing release checks apply at entry, outline and resume, including grant updates during a lesson. Fullscreen/presentation is reversible and keyboard accessible. Do not add timers, streaks or swipe-only navigation.

Acceptance: Course 1 can be completed independently and navigated by a teacher without scrolling through a list of exercises. Reading, response status, fill provenance, reports and approvals retain their contracts. Keyboard/visible focus, heading focus after transitions, labelled step counts, screen-reader feedback, reduced motion, large text, 320px layout and mobile keyboard tested in a running build. Back, jump, refresh, close/reopen, wrong answer, self-review, reveal, deferred tasks, blocked storage, no network, image failure and locked course exercised. Teacher preview cannot mutate pupil state. Required commands, adapted to the checkout's documented runtime: `node --test tests/*.test.mjs`, `npx tsc --noEmit`, `npm run build`; inspect `git diff --check` and source diff. Browser evidence must supplement commands; untested states marked `(unverified)`.

### Ticket 4
Input: pilot observation by teacher and solo beginner. Output: evidence of comprehension and all ten course manifests/guide updates. Measure whether each can explain the next action, recover after interruption, locate a worksheet and distinguish practice completion from approval without coaching. Check that the teacher can return to an earlier example and lead discussion without recording fake pupil answers. Record click burden: combine adjacent teaching beats if the slide count adds no learning value. Coverage tests require all courses/parts, including Course 2 opening prior-course homework and Course 10 empty-lesson briefing. No audio invented or unavailable workbook exercise silently required. Full conversion remains blocked until pilot feedback; authoring is educational work, not automatic text splitting.

### Ticket 5
Input: full diff, feature inventory and verification artifacts. Output: reviewed implementation, actual checks and independent Claude post-mortem appended to the dialogue. Accept only when every retained feature has a reachable entry point and relevant journeys are verified. No live publication merely to demonstrate the plan. Any new dependency, API, persistence format incompatibility or policy change is an architecture conflict: stop, return evidence to the planner and reopen review.

## 4. Builder Context Payload

```markdown
# BUILDER_CONTEXT
Planning only as of 2026-10-25. Do not implement until the founder explicitly requests implementation and the independent pre-mortem is settled.
Repository: /Users/calmdownoscar/Documents/Projects/CalmdownOscar; actual nested course checkout: .sites-norsksti.
Outer baseline 07869dacbe06976fa1ea000ab87cf17238b58a8a; course baseline c2523b9c78c97f774b101cfca071b2b70bbeca45. Preserve newer work; baseline is not reset authorization. Outer unrelated untracked hiring docs/image0.jpeg must remain untouched.
Plan: docs/PLAN-norsksti-guided-flow.md in outer repo; dialogue: docs/dialogue/norsksti-guided-flow.md. Read this full plan and current project AGENTS.md/guardrails before implementation. Branch codex/norsksti-guided-flow is proposed, not created. Verify Sites deployed source parity before changing the course.
Goal: preserve Norsksti features while teaching one meaningful activity at a time; classroom-led first, also understandable alone. Teach → try → feedback → explicit Continue. Back/Outline/reference remain available; jumps never mark work complete. Modes affect presentation only.
Architecture: authored versioned public/lesson-flow.json references original course/section/exercise IDs; lib/lesson-flow.ts validates coverage and derives sequence. Existing courses.json/course-structure.json own source assignment; shared answer overrides remain authoritative. No runtime paragraph splitting or duplicated answer keys. New lesson-player component reuses bilingual/modal/exercise patterns. Keep legacy renderer as fallback and for unconverted parts.
State: existing v1 progress/grants/reports retained. Separate bounded local lesson-session key holds cursor/presentation/drafts and no tokens. Draft editing invalidates stale completion with compatible saved status; check/review alone awards completion. Persist edits; handle import reset, identity change, storage failure and multi-tab conflicts explicitly. Cursor never grants access. Filled answers retain provenance; self-review is not teacher approval. Existing batch/part permissions unchanged. Exported review file is not an online submission.
No dependencies, AI marking, generated audio, backend/auth changes, grading-policy change, live classroom synchronization, publication or commits in this design request.
Ticket order: 1 authored Course 1 manifest/validation (planner), 2 safe local session state (build), 3 pilot player integration (build), 4 teacher/solo feedback then remaining courses (planner; blocked on actual feedback), 5 verification/independent post-mortem (planner). No builder dispatched yet.
Next prerequisite: settle review. Next runnable implementation scope after explicit authorization: Ticket 1 only. Allowed files public/lesson-flow.json, lib/lesson-flow.ts, tests/lesson-flow.test.mjs within nested course checkout. Input existing courses/structure/source material; output Course 1 lesson+homework authored sequence and validation helpers. Every original section/exercise covered exactly once in its original part; stable IDs; contextual dialogue available; reject omissions, duplicate and cross-part references. Missing media stays honestly unavailable. Verify with node --test tests/lesson-flow.test.mjs following existing loader conventions and git diff --check. Teacher approves new educational explanations before full rollout. Do not change runtime UI/state in Ticket 1.
All subsequent builder steps require their own exact allowed-file handoff from this plan. Required final validation: existing node test suite, TypeScript check, real build, diff review and running browser journeys for keyboard/mobile, interruptions/drafts, offline/storage failure, context, grading provenance and locked access. Record actual results only; mark unchecked conditions unverified. No build/test performed during planning.
Architecture conflicts/new files outside handoff: stop with file/line evidence, return to planner; no silent redesign. Builder reports changes, checks actually run, deviations and blockers; does not commit, deploy, update planner docs or decide teaching content.
```
