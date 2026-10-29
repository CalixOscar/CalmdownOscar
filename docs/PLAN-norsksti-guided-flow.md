# Norsksti: a guided classroom course that also works alone

Status: pre-mortem complete; dialogue Settled — 2026-10-25. Pilot implementation authorised by the founder in this session: “get Codex to build it”. Deployment is not authorised. This revision changes documents only; the pilot is not built.
Date: 2026-10-25 (Asia/Manila).
Intent: [INTENT-002](intent/INTENT-002-norsksti-guided-flow.md).
Review: [dialogue](dialogue/norsksti-guided-flow.md), Claude pre-mortem and Codex revision.
Implementation branch: `codex/norsksti-guided-flow`, to be created in `.sites-norsksti` from current `ui/pdf-first` HEAD.

## 1. System Architecture Overview

### Evidence and product direction

Outer repository: `/Users/calmdownoscar/Documents/Projects/CalmdownOscar`, baseline `63ceae7bfc4e99788f5dfdfc2f771a89ff7b5f4c`, branch `docs/norsksti-guided-flow`; untracked revision brief is existing work. Course source: nested `.sites-norsksti`, clean at `c2523b9c78c97f774b101cfca071b2b70bbeca45`, branch `ui/pdf-first`. Baselines detect drift; never reset newer work. Production-source parity and Unli Rice memory are (unverified); no Unli Rice tools are available. Implementation is local only; retain `.openai/hosting.json` and use the existing Sites helper for later separately authorised publication.

Verified against source on this date: 10 courses, 170 worksheet pages, 958 exercises, 791 keyed. Course 1 has 13 sections/58 exercises, including 53 keyed; lesson has 12 sections/57 exercises, homework one section/one open response (`courses.json`, `course-structure.json`). `course-app.tsx` currently shows worksheet + page exercises, loses component-local drafts on navigation, overwrites attempts with Fill answer, and writes progress wholesale. `progress.ts` v1 `saved` means an explicitly saved open response awaiting self-review. Classroom releases, separate lesson/homework approval, reports, shared answers, whiteboards, backups and offline support already exist.

One meaningful task per stage: understand → try → feedback → Continue. A **set** keeps related short items together, each with Check and feedback, one Continue at the end. No screen per blank or sentence. Course 1 lesson budget to test: roughly **25–35 teaching/activity screens**, excluding the final summary; record actual screen count and pilot click burden. Natural scrolling supports large text and keyboards. Preserve features through contextual tools and a compact menu. Avoid a generic slide deck or decorative checkpoints.

### Derived flow, overrides and offline behavior

`lib/lesson-flow.ts` is pure: course data + part structure + optional validated overrides → ordered steps. All courses use the guided renderer immediately. Preserve source part assignment and section order, including Course 2's opening prior-course homework. Default: one `teach` per section displaying its worksheet, followed by activities grouped by worksheet task prefix (e.g. `6b`, `6c`, `6d`), otherwise by section. Preserve item order; open/writing responses are individual `item` steps; keyed items default to task `set` (singleton may be `item`). Course 1 overrides can separate comprehension items when context warrants it. Never split OCR paragraphs or infer teaching explanations.

Only kinds: `teach`, `set`, `item`, `checkpoint`. Stable IDs derive from section/exercise IDs, not screen indices. Each original section has exactly one completion-bearing teaching reference; each exercise appears exactly once in its original part. Sets retain independent item feedback/completion. Checkpoints add no grading requirements. Course 10's empty lesson is a checkpoint carrying the existing final-review briefing, never invented lesson exercises or automatic approval.

`public/lesson-flow.json` is a versioned **override file**, not a duplicate curriculum/answer key. Contract:

- `version: 1`, `contentRevision`, `lang: "nb"`, `dir: "ltr"`, `policy: { review: "teacher-approval" }`, optional support language `en`.
- `contentRevision` is a deterministic fingerprint of parsed `courses.json` **and** `course-structure.json`, computed by the same pure helper for authoring/tests/runtime. It is independent of shared answer revision.
- Overrides keyed by stable section IDs: goal (1–2 sentences), optional in-class cue, editorial status `draft — teacher to approve`, optional ordered activity groups with stable IDs/kinds/exercise IDs and source reference IDs. Split/merge/reorder only within a section, never move work across parts or duplicate source text/keys.
- Course 1 lesson/homework overrides only. Codex drafts short, source-grounded goals/cues for teacher approval. Page 4: worksheet/goal, personal responses, comprehension pair with worksheet reference. Page 7: personal response plus sets `6b`, `6c`, `6d`. Page 9 number drill stays grouped. Literal string answer `"null"` (zero) remains keyed; JSON null alone denotes open work.

Missing/malformed/stale/invalid-ID overrides are ignored, using derivation without resetting progress. An optional override fetch must not block base content. Legacy page renderer is only the error fallback if base derivation fails; preserve progress/drafts. Validate derived and overridden coverage for all courses. Add the override file to service-worker shell precache and network-first content handling, bump shell version through the existing pattern, test native root/proxy subpath/offline refresh.

Teaching is existing `SourcePage`: worksheet image, enlarge, text view and honest unavailable state. Extract for reuse, do not retype Anne/Pablo. Activities open that same source reference in a wide side panel or narrow existing `Modal`, returning focus. New pure modules accept data/locale/references as arguments, with no hard-coded course count, `nb` normalisation or worksheet paths; existing app adapters retain Norsksti-specific details. Reuse bilingual primitives, Modal and styles.

### Answer, state and navigation contracts

- Check gives in-place feedback, never auto-advances. Continue is available after an attempt even if wrong/unreviewed; unfinished items remain unfinished in the summary. Outline permits skipping. No correctness wall, separate deferral ceremony, fuzzy matching or AI marking.
- Show answer displays the effective key **beside** the attempt, recording nothing and overwriting nothing. Separate Use this answer commits `correct, filled: true`. Retain last learner attempt locally and show it in summary; no new report field (D6 open). Distinguish shown answers and self-review from mastery/approval. Shared alternatives/explanations remain authoritative; pending/offline key refresh never erases drafts.
- Only explicit result actions change v1 responses: Check (including incorrect), Save open response (`saved`), self-review (`reviewed`), Use this answer (`correct, filled`). Draft edits never write `saved`, downgrade completion or modify committed responses. Changed stage/summary text says “Changed — not checked; your checked answer still counts”. Readiness/reports count committed results only; new drafts earn nothing. Backups include committed open `saved` responses, not session drafts/attempts/cursors/preferences; disclose this boundary.
- `lib/lesson-session.ts`: separate versioned browser-local key isolated by learner ID; cursors per course/part, first-start mode choice, drafts and last attempts per exercise with write timestamps. Bound each text to 20,000 characters, maps to known IDs/counts; validate removed steps/identity/malformed data. No tokens/grants/authority. Persist edits and flush cursor before navigation. Saved indicators require successful storage; on failure retain in memory with persistent warning and existing backup actions, never promise draft recovery after reload.
- Cross-tab progress: validate same-learner `PROGRESS_KEY` storage events, merge responses per exercise by newer `updatedAt`, read IDs as union. Merge current stored snapshot before normal writes, preserving unrelated answers; no echo loops; deterministic ties converge. Preserve existing `completedCourses`/grant semantics, no new approval merge. Player only adds read IDs; legacy explicit un-read remains a removal path (concurrent union can restore it; v1 has no read tombstones). Import is intentional replacement, not ordinary merge: clear matching drafts/attempts/cursors, recompute resume, never merge pre-import memory back over it.
- Session cross-tab changes: last write per exercise wins, quiet “Updated in another tab” notice, no version-choice modal. Invalid/other-learner events cannot reset work/grants. Test interleaved writes, ties and import separately. Browser-local reconciliation is not an atomic transaction system.
- Resume: valid available saved cursor, otherwise first unfinished required step in first available unfinished part; all available work complete → summary. Entry/resume/Outline/mutations recheck releases/batch gates, including grant changes mid-lesson. Modes/cursors grant no permission.
- Leaving a **displayed** teaching step forward by Continue or Outline records its read ID once. Backward moves, reference viewing and skipped-never-displayed pages do not. Summary lists unread/unfinished work with Open links, changed drafts, shown/self-reviewed work and last attempts. Export only under original readiness; downloading is not sending, practice completion is not approval. Keep separate lesson/homework approval and existing batch gating.

### Classroom presentation and feature inventory

First start of a part asks “With your teacher right now?” → In class / On my own; remember per device/part, switchable on stage. Same curriculum/permissions, including teacher approval when studying alone. Stable visible labels (e.g. `4 · 2/5`) agree between stage and Outline; any step in an available part is jumpable. Labels remain stable for unchanged content/overrides, not across editorial revisions. Cues include a solo alternative where needed; no live sync.

Admin preview and explicit teacher presentation evaluate demo answers only in memory, with “Preview — nothing is saved”. No draft/cursor/preference/read/response/submission persistence; demo values cannot leak into practice on exit. In-class **learner practice saves** normally. Only existing authenticated admin preview sees unreleased parts; presentation adds no bypass. Fullscreen is reversible with normal layout if denied/unsupported.

Retain and verify entry points: PDFs/offline downloads (course tools), worksheet/enlarge/text (teaching/reference), English toggle (header), Tavle/class chooser/gallery/snapshots (existing whiteboard/course tools), reports/backups/restore/approval codes (My progress/summary), resources/install/help/search/course map (menu/header), shared answers/classroom/Drive administration (Admin). Compact layout cannot remove features. No backend/auth changes.

### Decisions and deferred work

D1 yes: continue after wrong answers, item unfinished. D2 Codex drafts Course 1 goals/cues marked teacher-to-approve. D3 teacher/solo pilot arrangements, D4 rights confirmation, D5 whether to pursue a template, D6 report attempts remain open for the founder; none blocks pilot code. Teacher alternatives pass on Course 1's **53 keyed items** using existing Shared answers editor and approval of goals/cues precede learner pilot use. Rights remain unverified and block any template sale, not pilot code.

Defer template extraction/sale until teacher and solo-beginner feedback. Keep only five seams now: derived flow + stable-ID overrides; four step kinds; pure data-driven modules; manifest language/direction/review policy; physical separation of source material (`public/pdfs`, `public/worksheets`, `courses.json`) from engine/authored overrides. Only current `nb`/`ltr`/teacher approval implemented; declaration of policy is no self-paced bypass. No engine extraction, RTL rollout, editor, content kit, extra activities, marketing or monetisation infrastructure. Course 2–10 **override authoring** stays blocked on real pilot evidence; their derived flow is included now.

## 2. Modular Ticket Breakdown

All paths relative to `.sites-norsksti`. Execute sequentially, each ticket one build step; boxes remain unchecked until implementation verification.

- [ ] **Ticket 1 — flow derivation, overrides and offline content (build).** Allowed: new `lib/lesson-flow.ts`, `public/lesson-flow.json`, `tests/lesson-flow.test.mjs`; existing `public/sw.js`, `tests/service-worker.test.mjs`. Pure flow/contracts, Course 1 draft overrides, all-course coverage/cache tests. No UI changes.
- [ ] **Ticket 2 — session drafts and cross-tab progress (build).** Depends on 1. Allowed: new `lib/lesson-session.ts`, `tests/lesson-session.test.mjs`; existing `lib/progress.ts`, `tests/progress.test.mjs`, `components/course-app.tsx` (state/storage plumbing only). Bounded session, progress merge/listeners and import reset.
- [ ] **Ticket 3a — all-course player and review boundary (build).** Depends on 1–2. Allowed: existing `components/course-app.tsx`, `app/globals.css`, `app/student-classroom.css`; new `components/lesson-player.tsx`, `components/lesson-exercise.tsx`, `components/source-page.tsx`. Sets/items, reference, answer actions, drafts, summary/tools/fallback. Preview writes already suppressed here.
- [ ] **Ticket 3b — in-class presentation (build).** Depends on 3a. Allowed: `components/course-app.tsx`, `components/lesson-player.tsx`, `components/lesson-exercise.tsx`, `lib/lesson-flow.ts`, `lib/lesson-session.ts`, `tests/lesson-flow.test.mjs`, `tests/lesson-session.test.mjs`, `app/globals.css`, `app/student-classroom.css`. Stable labels/Outline, first-start choice, cues, fullscreen/presentation and no-write verification.

Only these four pilot tickets are runnable. Course 2–10 editorial authoring, template work and deployment wait for their decisions/feedback. No parallel builders against shared files.

## 3. Ticket Requirements

**Ticket 1.** Input: course/part payloads. Acceptance: all-course derived and override coverage, every original read/exercise ID exactly once in its original part; no duplicate/cross-part/invalid refs. Report Course 1 screen count against 25–35 budget without padding checkpoints, group p7/p9, preserve personal/writing items. Goals/cues are short drafts only, no duplicate keys. Tests cover missing/stale/malformed overrides, invalid groups/refs/revision, string `"null"`, Course 2 mapping/Course 10 briefing and worker precache/network/offline at root/subpath. Verify targeted tests then common commands below.

**Ticket 2.** Input: stable IDs, learner identity, progress v1/storage adapter. Acceptance: drafts/last attempts round-trip without changing completion/exports; edited correct answer still counts until explicit recheck; bounds/unknown IDs/corrupt/other-learner state cannot damage progress/grants. Tests cover removed/locked cursor, first unfinished/all-complete, import reset, blocked/quota storage, same/distinct exercise writes, read union/ties/no loops. Existing report/backup fixtures stay compatible. Verify session/progress/classroom tests and common commands.

**Ticket 3a.** Input: flow/session/effective answer overrides/permission/tool handlers. Acceptance: all-course renderer, Course 1 lesson/homework journey, Check per set item, wrong-answer Continue without completion, Show without overwrite, explicit filled commit, local last attempt, self-review distinct from approval, changed-draft summary, read-on-forward-leave, summary Open links, locks/resume and safe legacy fallback. Entire feature inventory reachable. Browser journey: first run/success/empty/wrong/saved-unreviewed/show/use/changed-checked-draft; Back/jump/refresh/close/reopen/import; slow/offline key load/missing worksheet/failed storage; denied/revoked release; Course 2 homework and Course 10 briefing. Check keyboard/visible focus, heading focus after transitions, screen-reader feedback, narrow reference focus return, 320px/large text/mobile keyboard/reduced motion. Run common commands before 3b; unchecked states `(unverified)`.

**Ticket 3b.** Input: working player/draft cues. Acceptance: stage/Outline labels agree, remembered first-start choice/switch, teacher can direct/jump by label, cues fit solo/classroom, fullscreen exits/restores focus or degrades if denied. Compare progress/session/classroom storage before/after preview/presentation Check/Save/self-review/Use/Continue/Outline/part changes: no writes, no demo leakage on exit. Learner In class still saves. Repeat affected browser journeys and common commands; report actual screen count, unverified states. Human teacher/solo pilot and independent post-mortem still precede release-readiness claims.

**Common commands (required for each ticket, from nested checkout):**

```sh
node --test tests/*.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run build
npm run lint
git diff --check
```

Revision-time baseline, 2026-10-25: tests **174 passed, 0 failed**; TypeScript exit **0**; production build exit **0**, PWA shell 14 assets; lint exit **1**, **14 errors and 10 warnings**, existing whiteboard code and other warnings. These are baseline checks, not pilot verification. Build reports unknown static route classification; browser journeys remain `(unverified)`. Nested tree stayed clean. Lint repair is outside this handoff: report baseline/new diagnostics, do not disable rules or edit unlisted files, do not claim clean lint. If baseline lint or a hook blocks a required ticket commit, stop and report rather than waive it.

## 4. Builder Context Payload — single end-to-end handoff

```markdown
# BUILDER_CONTEXT
Role: builder
Plan: /Users/calmdownoscar/Documents/Projects/CalmdownOscar/docs/PLAN-norsksti-guided-flow.md
Scope: Tickets 1, 2, 3a, 3b in order, one build step each; pilot code authorised, no deployment.
Repository: /Users/calmdownoscar/Documents/Projects/CalmdownOscar/.sites-norsksti
Baseline: c2523b9c78c97f774b101cfca071b2b70bbeca45, clean, ui/pdf-first at revision time. Verify drift first; never reset newer work.
Branch: create codex/norsksti-guided-flow from current ui/pdf-first HEAD in nested checkout, work only there. No outer files/branch edits. Stop on incompatible drift.
Read outer AGENTS.md, applicable instructions, full plan, INTENT-002 and settled dialogue. No subagents/nested codex run.
Changes already in tree: none in nested checkout at revision time; outer untracked revision brief is unrelated, preserve it.

Goal: task-sized teaching stages, classroom-led and understandable alone; retain tools and approval rules. All courses derive guided flow now; Course 1 alone gets authored overrides pending pilot feedback.
Contracts: pure lesson-flow consumes courses + structure + optional version-1 JSON overrides. Kinds teach/set/item/checkpoint; stable source IDs, one read reference per section/exercise reference per original item in original part. Default groups by task prefix, otherwise section; open/writing individual, keyed task sets. Overrides may group/reorder within section only. SourcePage is teaching/reference; goals 1–2 sentences/cues are source-grounded teacher-approval drafts, no source dialogue/keys copied. Manifest lang=nb, dir=ltr, policy.review=teacher-approval, contentRevision fingerprints both parsed base payloads with one pure helper. Missing/invalid/stale overrides fall back to derivation; base derivation failure alone invokes legacy renderer without work reset. Pure modules take data/locale/references, no hard-coded 10/nb/page paths. Licensed source stays separate.
State: v1 progress/grants/reports unchanged. Separate bounded learner-scoped versioned session holds drafts/last attempts/cursors/per-part mode, each text <=20,000 chars, known IDs/counts, no tokens. Draft edits never alter committed responses. Explicit Check/open Save/self-review/Use commit existing statuses; changed draft says checked answer still counts. Show answer never writes/overwrites; Use records correct, filled=true, retains local attempt. Report/backup excludes session-only state; disclose it. Storage warning persists; no false reload-recovery claim. Import replaces work and clears matching session before resume; isolate identity changes.
Cross-tab: same-learner progress events, per-exercise newer updatedAt, union reads, convergent ties, merge stored snapshot before ordinary writes, no echo loops. Preserve completedCourses/grants semantics. Legacy explicit unread is only removal; concurrent union may restore it. Session last write per exercise + quiet notice. Import must not resurrect pre-import state.
Navigation: Continue after wrong/unreviewed attempt, unfinished stays unfinished; Outline permits skip. Read only when leaving displayed teach forward (Continue/Outline), never skipped/reference pages/backward moves. Summary Open links, unread/unfinished/changed/shown/self-reviewed work and last attempts. Export only under original readiness; download != sending, completion != approval. Check partAvailable on entry/resume/jumps/mutations/grant changes. Course 2 homework/Course 10 empty-lesson briefing unchanged.
Preview: admin preview/teacher presentation evaluate in memory, nothing-saved bar, no session/mode/cursor/read/response/submission writes or demo leakage. In-class learner practice saves. Only existing authenticated admin preview sees unreleased parts; no presentation bypass.

Ticket 1 allowed files: lib/lesson-flow.ts; public/lesson-flow.json; tests/lesson-flow.test.mjs; public/sw.js; tests/service-worker.test.mjs.
Build derivation/override schema/Course 1 draft content plus worker shell/network-first cache/version. Tests: all-course exact coverage, duplicate/invalid/cross-part refs, missing/stale/malformed overrides/revision/groups, literal string "null", Course 2/10, native-root/proxy-subpath cache/offline/network refresh. Report Course 1 lesson screen count vs ~25–35 target, p7/p9 grouped, personal/writing items individual, no padding. No UI changes. Run targeted then common checks.
Ticket 2 allowed files: lib/lesson-session.ts; tests/lesson-session.test.mjs; lib/progress.ts; tests/progress.test.mjs; components/course-app.tsx (state/storage only).
Build bounded session/resume/import/identity plus progress merge/listeners. Tests: drafts never change completion/exports, competing same/distinct items, read union/ties/no loops, import, corrupt/oversized/unknown-ID/other-learner data, locks/removed cursors/all-complete, blocked/quota storage. Existing backup/report fixtures compatible. Run targeted then common checks.
Ticket 3a allowed files: components/course-app.tsx; components/lesson-player.tsx; components/lesson-exercise.tsx; components/source-page.tsx; app/globals.css; app/student-classroom.css.
Build all-course player/sets/items, wide reference/narrow Modal, show-before-overwrite/explicit fill/self-review, local drafts/attempts, summary/export, Resume/Start, tools/fallback/preview guards. Reuse bilingual/Modal/styles and SourcePage/ExerciseCard extraction. Retain PDF/offline, English toggle, Tavle/chooser/gallery/snapshots, reports/backups/codes, resources/install/help/search/map, Admin/shared answers/classroom/Drive. Run common checks and browser Course 1 lesson/homework success/empty/wrong/save-review/show-use/changed draft, back/jump/reload/reopen/import, slow/offline/missing-media/storage-failure, locked/revoked, Course 2/10. Check keyboard/focus/announcements/320px/large text/mobile keyboard/reduced motion/reference focus return; label unchecked states unverified.
Ticket 3b allowed files: components/course-app.tsx; components/lesson-player.tsx; components/lesson-exercise.tsx; lib/lesson-flow.ts; lib/lesson-session.ts; tests/lesson-flow.test.mjs; tests/lesson-session.test.mjs; app/globals.css; app/student-classroom.css.
Build stable page-step labels + Outline jump, per-part first-start In class/On my own question/remember/switch, short draft cues, reversible fullscreen/presentation. No live sync. Compare progress/session/classroom storage before/after all preview/presentation actions, including navigation and mode: nothing changes. No demo work on return to practice; normal learner practice saves. Test denied fullscreen; run common checks and affected browser journeys.

Verify with (nested checkout, required each ticket):
node --test tests/*.test.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run build
npm run lint
git diff --check
Baseline: 174 tests pass, TypeScript/build pass; lint fails 14 errors/10 warnings. Report baseline/new diagnostics; no unlisted lint fixes/disabling rules or clean-lint claim. If lint/hook blocks required commit, stop and report.
Inspect git diff, then commit each ticket on that branch with a descriptive message (never --no-verify). This explicit handoff authorises ticket commits; do not edit outer planner/memory docs.
No deploy, no Sites publish, no new dependencies, no API/server/schema changes. Only specified separate override/session formats are new; existing v1 schemas stay unchanged. No AI/fuzzy marking, generated audio, template extraction, marketing or monetisation infrastructure.
D1 yes. D2 Codex drafts marked teacher-to-approve. D3 pilot arrangements/D4 rights/D5 template/D6 report attempts open; none blocks pilot code. Teacher alternatives pass on Course 1's 53 keyed items and goals/cues approval precede learner pilot use. Rights block any template sale. Course 2–10 override authoring blocked on real teacher/solo feedback. Production parity, human/device journeys unverified; no release claim.
Stop and report if anything the plan didn't foresee blocks you, including unlisted files or architecture changes; no improvisation, re-planning, scope expansion or hook waivers. Report files, ticket commits, actual commands/exit codes/counts, browser evidence, actual screen count, deviations/blockers. Human pilot and independent post-mortem still required before release readiness.
```
