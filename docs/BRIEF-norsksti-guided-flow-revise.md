# Brief — planner revision (stage 4), Norsksti guided flow

**This is a planning revision, not a build.** "Implement" below means: revise the plan documents. Do not touch any source code, config or the nested `.sites-norsksti` checkout. No commits, no deployment, no nested `codex` run, no subagents.

You (Codex) are the planner for `docs/PLAN-norsksti-guided-flow.md`. Claude has appended its pre-mortem to `docs/dialogue/norsksti-guided-flow.md` under `## Claude — pre-mortem — 2026-10-25`. Read the full plan, the full dialogue, `AGENTS.md`, and re-check any claim you dispute against `.sites-norsksti` source (read-only).

## Files you may change (only these)
1. `docs/dialogue/norsksti-guided-flow.md` — **append** one turn headed `## Codex — revision — 2026-10-25`. Do not edit earlier turns (yours or Claude's).
2. `docs/PLAN-norsksti-guided-flow.md` — revise in place.
3. New `docs/intent/INTENT-002-norsksti-guided-flow.md` — short intent record of the founder's request (the repo hook warns the plan has none; model it on `docs/intent/INTENT-001-unlirice-user-guide.md`).

## What the dialogue turn must contain
- For each of Claude's findings 1–11 and each item of "Changes the plan needs": **accepted / accepted with change / declined**, with one-line reason. Decline only with source evidence.
- Founder decisions D1–D6: the founder told Claude to "keep going until done", so adopt these defaults unless you have evidence against them: D1 yes (Continue after wrong answer; item stays unfinished). D2 Codex drafts Course 1 goal lines/cues marked as drafts for teacher approval. D3, D4, D5, D6 remain open for the founder and do **not** block building the pilot code; D4 (rights) blocks any template sale, not the pilot.
- Template direction: record it as deferred until the pilot; keep only the "decide now" seams (derived flow + overrides keyed by stable IDs; step kinds teach/set/item/checkpoint; pure modules without hard-coded 10/nb/page paths; manifest declares lang/dir/policy.review; licensed material kept separate).
- If no finding remains disputed, mark the dialogue status line at the top as `Status: Settled — 2026-10-25` (you are the planner; this is your call). If something stays disputed, leave it unsettled and say exactly what is disputed.

## What the revised plan must contain
- Status header updated (pre-mortem done; implementation of the pilot authorised by the founder in this session — "get Codex to build it"; deployment still **not** authorised).
- The revised architecture reflecting the accepted findings.
- A ticket list for the **pilot only**, sized so each ticket is one build step: Ticket 1 flow derivation + override schema + Course 1 overrides + service-worker caching + tests; Ticket 2 session/draft store + cross-tab progress merge + tests; Ticket 3a player for all courses (derived flow) with sets/items, show-answer-before-overwrite, summary/review boundary, reference panel; Ticket 3b in-class presentation (stable step labels, Outline jump, first-start mode question, cues, preview/presentation records nothing). Course 2–10 override authoring stays blocked on real pilot feedback.
- A single **builder handoff** section that a Codex build run can execute end to end for Tickets 1, 2, 3a, 3b in order, in the nested checkout `.sites-norsksti` on a new branch `codex/norsksti-guided-flow` created from its current `ui/pdf-first` HEAD: exact allowed files per ticket, acceptance checks per ticket, required commands (`node --test tests/*.test.mjs`, `node node_modules/typescript/bin/tsc --noEmit --incremental false`, `npm run build`, `npm run lint`, `git diff --check`), "commit each ticket on that branch with a descriptive message (never `--no-verify`)", "no deploy, no Sites publish, no new dependencies, no API/server/schema changes", and "stop and report if anything the plan didn't foresee blocks you".
- Keep it compact. No marketing, no monetisation infrastructure.

Finish with a short final message listing what you changed. Run no build or tests (nothing to build).
