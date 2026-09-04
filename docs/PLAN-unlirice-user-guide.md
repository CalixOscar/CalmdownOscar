# PLAN — Unli Rice user guide

**Intent:** `docs/intent/INTENT-001-unlirice-user-guide.md`
**Stage:** 2 (Claude). Not yet pre-mortemed by Codex; not settled.
**Branch:** `docs/unlirice-user-guide`, off `main`. Named here at step 0, before any tool is
pointed at the repo, because the last plan that put this instruction after dispatch had it
ignored (see the guardrails, "A plan's own Handoff does not bind anything").

## Decisions on the intent's open questions

1. **URL: `/unlirice/user_guide.html`.** *Revised during the build, 2026-09-04.* The plan
   originally said `/unlirice/guide/`, chosen in the abstract. The site already has this
   convention and it was missed at stage 2: ClearSpace and UnliDisk both ship
   `apps/<name>/user_guide.html`, and both sit in `sitemap.xml` at priority `0.6`. Matching
   an existing convention beats a fresh one, and the plan's own constraint said to match what
   the site already does. Being one level shallower also means the guide's relative paths are
   identical to its sibling `index.html` rather than a level deeper — one fewer thing to get
   wrong.
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
| `unlirice/user_guide.html` | **New.** The guide. |
| `unlirice/index.html` | **Edit.** One link to the guide, in the existing layout. No restructuring. |
| `sitemap.xml` | **Edit.** Add `/unlirice/user_guide.html` at priority 0.6, beside the `/unlirice/` entry. |
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
5. `/unlirice/user_guide.html` is in `sitemap.xml` and reachable by a link from `/unlirice/`.
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

## Status

**Built by Claude Code on 2026-09-04, at the founder's explicit instruction** ("swarm is
busy, do it yourself"). The Codex pre-mortem and the stage-4 adjustment pass were skipped by
the same decision. One plan decision changed during the build — the URL, above — because the
repo contradicted it.

Verified after the build: page and product-page link render; `sitemap.xml` parses; all 14 MCP
tools present in the reference table; every relative path resolves; the page makes three
network requests, all same-origin (document, app icon, self-hosted font) and none
third-party; no horizontal overflow at 375px, with the tool table scrolling inside its own
container.

## Stage 3 — brief for Codex (refreshed 2026-09-04, supersedes the first version)

Live at `https://www.calmdownoscar.com/unlirice/user_guide.html`. Source at
`unlirice/user_guide.html` on `main`. Merged as PR #1 and #2.

**This is not a pre-mortem.** The page is built and shipped, so there is no design left to
break on paper. Your job is the same in character — falsify it, produce concrete objections,
do not re-plan and do not rewrite the page — but the target is the live artifact.

**Ground truth is `~/Documents/Projects/Unli Rice/Sources/`.** Not this plan, not the page,
and not that repo's `AGENTS.md` or `PROJECT_NOTES.md` — see the failure mode below for why
that distinction has already cost four corrections.

### 1. The primary question: does this serve both audiences?

**The founder's stated goal is that Unli Rice is usable by a brand-new hobby developer and
by a senior developer. The founder is the former and reports that the app currently leans
towards the latter.** That judgement is the most important thing for this pass to test,
because everyone else who has looked at this — including whatever wrote the page — was
already fluent.

The guide gives you concrete evidence to start from. **"MCP" appears four times and is never
once expanded.** `mcpServers`, `corpus`, `shard`, `memory.md`, `repository snapshot`,
`remote`, `stack defaults` and `event log` are all used as though known. Section 7 (The
panes) describes a repositories pane and a branch graph, and Section 10 tells a stuck reader
to "publish a new repository snapshot" without saying what that is or how.

Work the beginner path literally and report where it breaks:

- Read Section 2 as somebody who has installed a Mac app and used Claude in a browser, and
  has never edited a JSON config file. Where do they stop? Is "paste the block into that
  tool's own configuration file" an instruction or an assumption?
- Which sections are *only* meaningful if you use git daily? Say whether the guide should
  explain them, signpost them as optional, or whether this is not a guide problem at all.
- Is anything actively discouraging — a passage that tells a beginner this product is not
  for them?

**Then say honestly whether the lean is fixable in the guide.** The panes are derived from
git state; a to-do list computed from unpushed commits is senior-developer-shaped by
construction, and no amount of rewriting changes that. If your conclusion is that the lean
is in the product rather than the documentation, say so plainly and name what you saw. That
is a more useful finding than a list of words to define, and it belongs in a new intent doc
rather than in an edit to this page.

### 2. Resolved — do not re-raise

- **The delete claim.** The first brief asked whether "there is no permanent delete tool" was
  misleading. It was, the founder said so, and it is fixed. Section 5 is now "What can and
  cannot delete" and splits agents (cannot express deletion; the tool catalog is built from
  `NoteService` and `TrashService` sits outside it) from the founder (can purge by hand,
  never on a schedule, with every event written out and the log backed up first). Verify the
  new description against `Trash.swift` — but the old objection is spent.
- **Three claims corrected on 2026-09-04** in the self-audit, listed below. Check the
  replacements, not the originals.

### 3. Claims to verify, each against a named file

Sections 1–4 and 6–11 were checked once already. Re-check anyway; one pass found four errors.

1. **Section 2, two connection paths** — the config block and the folder at
   `~/Documents/Unli Rice/`. `ConnectView.swift`, `MCPTarget.swift`. Tool list complete and
   correctly named?
2. **"Unli Rice never opens or edits that file."** Confirm nothing writes a client config.
3. **Section 3 is new and has never been reviewed.** House rules presets and their names
   (`HouseRulesPreset.swift`), the claim that choosing a preset never writes to the note
   store, the labelled token estimate, the four profile templates and their fields
   (`ProfileTemplate.swift`, `ProfileBuilder.swift`), and the seed notes — one-time, only on
   an empty log, tagged `guide`, and the janitor's minimum-tag-use reason for them
   (`Onboarding.swift`).
4. **Section 3's identity claim.** "No personal information about anybody ships with the
   app." Grep the whole app, not just `Sources/` — bundles, plists, assets, presets. If
   anything personal ships anywhere, that sentence has to come down immediately.
5. **Section 8, corrected.** Capture's to-do mirror is read-only for items but writes a
   stamped note to `Repo: <project>` (`TodoView.save`). Is the new wording right, and is
   there any *other* write path from the phone the page does not mention?
6. **Section 9**, snapshot and restore semantics — `VaultSnapshot.swift`.
7. **Section 7**, the to-do derivation and the "as of the last snapshot" label —
   `StudioTodo.swift`.
8. **Section 7**, Trust Center field list — `ConnectionActivity.swift`. Privacy claim: exact
   or removed.
9. **The janitor may add a tag or raise a flag and nothing else.**
10. **All 14 tool descriptions** against the schemas the server serves today.

### 4. The failure mode to hunt

Every error found so far has the same shape: **a claim sourced from a document rather than
from code, then stated on the page as fact.** Four instances, all in one short page — the
delete claim, "nothing is destroyed", "nothing reads these by default" (taken from
`AGENTS.md`), and the read-only phone. Assume there are more and that they will look exactly
as confident as everything around them. A sentence that reads as settled is not evidence
that it was checked.

### 5. Output

A list of concrete objections. Each names the section, what is wrong, and the file and line
that settles it. An objection you cannot back with a file is a note, not an objection.

Order them by what would embarrass the founder most if a stranger found it first, not by how
easy they are to fix. The two-audience question in §1 is the one to spend the most time on;
it is also the only part of this brief where I cannot give you the answer to check against,
which is exactly why it is being asked of you.
