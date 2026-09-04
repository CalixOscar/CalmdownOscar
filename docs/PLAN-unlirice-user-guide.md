# PLAN — Unli Rice user guide

**Intent:** `docs/intent/INTENT-001-unlirice-user-guide.md`
**Stage:** 2 (Claude). Not yet pre-mortemed by Codex; not settled.
**Branch:** `docs/unlirice-user-guide`, off `main`. Named here at step 0, before any tool is
pointed at the repo, because the last plan that put this instruction after dispatch had it
ignored (see the guardrails, "A plan's own Handoff does not bind anything").

## Decisions on the intent's open questions

1. **URL: `/unlirice/guide/`.** Sibling of the positioning page, obvious in a sitemap,
   leaves `/unlirice/docs/` free if developer docs ever land.
2. **One page, with a sticky in-page contents list.** Several pages would need navigation
   the site does not have, and the guide's value is that one Cmd-F finds anything. "Easy to
   read" is bought with a contents rail, short sections and plain sentences — not with
   fragmentation.
3. **The MCP tool table is hand-written and carries a `Verified against <commit> on <date>`
   line directly above it.** Generating it means a build step this static site does not
   have, for fourteen rows that change rarely. The dated line is the honest version of the
   trade: a reader can tell how old the claim is. Generation is a real option later and is
   noted as out of scope, not rejected.
4. **No new screenshots in v1.** Reuse `assets/screens/unlirice-automation.webp` if it fits
   a section; otherwise ship text-only. Screenshots age faster than prose and capturing a
   good set is its own task.
5. **Troubleshooting names the symptom and the check, never the post-mortem.** "Notes I
   expected are missing" gets: the app logs which log it opened, here is how to see it, here
   is what a stranded-corpus banner means. The 2026-07/08 fork story stays in the vault.

## Architecture

Static HTML, no framework, no build step. One new directory, one new file, matching
`unlirice/index.html` exactly for doctype, head, font loading, CSS approach, header and
footer. **Read that file first and copy its shell**; do not introduce a stylesheet, a CSS
framework, or a component pattern the site does not already use.

Guide-specific CSS (the contents rail, the tool table) goes in a `<style>` block in this
page's head, not into any shared stylesheet — nothing else on the site needs it.

No JavaScript beyond, at most, scroll-spy for the contents rail. If that costs more than a
few lines, ship without it: the rail works as plain anchors.

## Files

| File | Action |
| --- | --- |
| `unlirice/guide/index.html` | **New.** The guide. |
| `unlirice/index.html` | **Edit.** One link to the guide, in the existing layout. No restructuring. |
| `sitemap.xml` | **Edit.** Add `/unlirice/guide/`. |
| `assets/` | Untouched unless reusing the existing webp. |

Nothing else. If the build wants to touch a fourth file, that is a plan change — escalate.

## Section outline

Nine sections. Each is short; the guide is comprehensive by covering everything once, not by
covering anything at length.

1. **What Unli Rice is, in four sentences.** A local append-only note log that every AI agent
   you connect can read and write over MCP. It runs on your Mac, the notes are yours, and
   nothing leaves the machine unless you move it.
2. **Set it up.** Install, first run, and the Connect screen. The critical mechanic: the app
   **copies an MCP configuration snippet** for your agent and you paste it into that agent's
   own config. **The app never reads or modifies your agent's config files** — say this
   plainly, it is the privacy claim in miniature. Then the trap: *MCP servers attach when a
   session starts, so an agent that was already running will not see Unli Rice until it is
   restarted.* This single sentence prevents the most likely first-run failure.
3. **How to think about a note.** Title, body, tags, `[[wiki links]]`, and `source` — who
   wrote it. Why `source` matters: it is the only thing that makes multi-agent history
   attributable, and agents are asked to use their own name consistently.
4. **Nothing deletes.** The log is append-only. `append_to_note` never replaces. Archiving
   hides a note from listings and is reversible; it is the closest thing to delete that
   exists, and there is no permanent one. Every note carries an immutable event history you
   can open. Frame this as the feature it is: you can trust what the log says happened.
5. **The three layers.** `raw/` files, ingest index entries (`Session:` / `Doc:` notes — a
   machine description of a file, *not* a conclusion), and wiki hubs (`Wiki: <topic>`, the
   only layer with judgement in it). Tell the reader to start at `Wiki: index`.
6. **The panes.** One short paragraph each, no exhaustive option lists: Home and notes,
   Repos and the branch graph, To-Do, Trust Center, Notices, Profiles, House Rules,
   Automation. **The To-Do paragraph is the one that must be right:** nothing in it is
   stored and nothing can be ticked off — every item is computed from the state that makes
   it true, so it disappears when the work is actually done. It reads each project's
   `memory.md` for a declared next step and falls back to the last published repo snapshot
   when it cannot. That is why an item can say "as of the last snapshot".
7. **The iPhone app.** Unli Rice Capture: capture audio, transcribe, type a note; it mirrors
   your repos and to-do list read-only. It is a satellite, not a second brain — the Mac holds
   the log, the phone syncs a shard.
8. **Your data.** Where the log lives, what a recovery snapshot is and how to make one, what
   the janitor may and may not do (it can add a tag or raise a flag, and nothing else — it
   cannot archive, retitle, merge, or resolve), and that a flag is a proposal for a human,
   never an applied change.
9. **When something looks wrong.** Four symptoms, four checks: agent does not appear
   (restart its session); notes I expected are missing (confirm which log the app opened —
   it reports this, and a stranded-corpus banner means what it says); the to-do list looks
   stale (publish a fresh repo snapshot); nothing is being ingested (routines and folder
   access). Then the tool reference table, with its `Verified against` line.

## Writing rules for this page

- Second person, present tense, short sentences. No exclamation points.
- **State the surprising behaviour before the reassurance**, not after. "Nothing deletes" is
  the headline; "and here is why that is good" follows it.
- Every behavioural claim is checked against the running app or the source before it is
  written. If it cannot be checked, it does not go on the page.
- No superlatives, no "simply", no "just", no "powerful", no invented user quotes.
- `docs/universal_anti_slop_guardrails.md` and `docs/brand_skill.md` bind. Read them; do not
  restate them here.

## Test criteria

Traceable to the intent's "what solved looks like":

1. A reader who has never seen the app can connect an agent from section 2 alone, including
   knowing to restart the agent's session.
2. Sections 4, 6 and 8 each state their counter-intuitive rule explicitly: nothing deletes;
   the to-do list cannot be ticked; the janitor cannot change anything.
3. Every one of the 14 MCP tools appears in the reference table.
4. The page loads with no network request to any origin the rest of the site does not
   already use. Check the network panel, do not assume.
5. `/unlirice/guide/` is in `sitemap.xml` and reachable by a link from `/unlirice/`.
6. No claim about App Store status, version, or release timing appears anywhere.
7. The page renders correctly at 375px wide.

## Edge cases and gotchas

- **The tool table will drift.** Accepted, mitigated by the dated line. Anyone editing the
  MCP surface should update it; that expectation belongs in the Unli Rice repo's own notes,
  not on the page.
- **Do not describe the four-event-stores incident.** Section 9 gives the reader the check,
  not the history.
- **`unlirice/index.html` is 27KB.** Read it before editing; add one link and change nothing
  else. A "while I'm here" tidy-up of that page is out of scope.
- **Trust Center wording is a privacy claim.** MCP activity records client name, version,
  timestamp, tool name and success — and never tool arguments or note content. If section 8
  paraphrases this, it paraphrases it exactly.

## Out of scope, named so it is a decision

Generating the tool table from source; new screenshots; a search box; developer docs; any
change to the positioning page beyond one link; anything about Unli Disk.

## Next

Codex pre-mortem against this plan, then Claude adjusts, then the swarm builds. Not settled
until the stage-4 pass has run.
