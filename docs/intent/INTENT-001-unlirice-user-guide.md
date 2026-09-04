# INTENT-001 — Unli Rice user guide on calmdownoscar.com

**Date:** 2026-09-04
**Author:** Founder, direct to Claude Code. No Spark discovery interview ran — this intent
was stated in one sentence, so the "Open questions" section below is longer than usual and
the plan carries the burden of resolving it.
**Status:** draft
**Plan:** docs/PLAN-unlirice-user-guide.md

## The problem

Unli Rice has a page at `calmdownoscar.com/unlirice`, but it is a positioning page: it
explains what the product *is* — one append-only log, every agent, per-device sync shards,
local privacy, open source — and never once tells anyone how to use it. Its headings are
Platform, Data model, Local privacy, Multi-agent, Open source.

There is no user guide anywhere. Not on the site, not in the repo. Everything a person
would need to actually operate the app is currently either in source comments, in
`PROJECT_NOTES.md`, in the vault guardrails, or in the founder's head. The app ships on the
Mac App Store with an iOS satellite, so the people who need this are not all the founder.

## Who hits it, and when

Someone installs Unli Rice, opens it, and sees an empty note list and a Connect screen. They
have to work out, unaided: that they must copy an MCP config snippet into their agent's own
config; that the agent will not appear until that agent's session is restarted; that nothing
can be deleted, only archived; that the to-do pane computes itself and cannot be ticked off;
and that `Wiki: index` is the note to read first. Every one of those is a real behaviour that
surprises people, and none of them is written down for a user.

The founder hits a version of it too — this session established several of these facts by
reading Swift source, which is not a supportable answer for a shipped app.

## What "solved" looks like

A person who has just installed Unli Rice can, without asking anyone:

- Connect their first agent and confirm it worked.
- Explain what a note is, why nothing deletes, and what `source` attribution is for.
- Tell the difference between a raw file, an ingest index entry, and a wiki hub.
- Understand why the to-do list has no checkboxes.
- Find out which event log the app is actually open on when something looks missing.
- Look up any of the 14 MCP tools and know what it does and what it refuses to do.

Observable test: hand the page to someone who has never seen the app and watch them connect
an agent and create a note without asking a question.

## Scope boundaries — explicitly NOT this

- **Not a rewrite of `/unlirice`.** That page keeps its job. The guide is a new page that it
  links to.
- **Not marketing copy, and not a changelog or roadmap.** No feature teasing, no dates.
- **Not developer or contributor documentation.** Building from source, the Swift package
  layout, and the janitor's internals stay in the repo.
- **Not a second home for the studio guardrails.** The five-stage pipeline, note hygiene and
  the memory.md contract are vault concerns. If the guide needs one, it links; it never
  restates. A copy here is a copy that drifts.
- **No App Store status claims, review states, version numbers or build numbers.** They go
  stale on the page faster than anywhere else and nothing on the site can verify them.
- **Not the Unli Disk relationship.** Separate product, separate page.
- **No new site chrome, nav system, search, or design system work.** Match what the site
  already does.

## Constraints that are already fixed

- Static site, no framework. Whatever `unlirice/index.html` already does for markup, CSS and
  fonts is what this does. `docs/universal_anti_slop_guardrails.md` and `docs/brand_skill.md`
  in this repo bind the writing; `_AI Context/02_Style_Voice_and_UI_Personality.md` binds the
  voice.
- Local-first and private is a product claim the guide must not undercut: no analytics, no
  embedded third-party scripts, no fonts or assets fetched from anywhere the site does not
  already fetch from.
- Every behavioural claim must be true of the shipped app and checked against the source or
  the running app, not against a note. Notes in this studio go stale; that is documented.
- The app never reads or modifies an agent's config files — it copies a snippet the user
  pastes. The guide must describe it that way, because the distinction is the privacy claim.

## Open questions for stage 2

1. **URL.** `/unlirice/guide/` or `/unlirice/docs/`? Affects `sitemap.xml` and the link from
   the positioning page.
2. **One page or several?** "Comprehensive but easy to read" pulls both ways. One long page
   with an in-page contents list is likely right, but the plan has to decide and justify it.
3. **How does the MCP tool reference stay honest?** There are 14 tools. A hand-written table
   on a website is a thing that drifts from `Sources/UnliRiceCore/MCP` silently. Options:
   accept the drift with a "verified on" date, or generate the table. The plan decides.
4. **Screenshots?** The site has `assets/screens/unlirice-automation.webp` already. Capturing
   more is real work and they age. Decide how many, or none.
5. **How much of the four-event-stores failure belongs in a user guide?** "Which log am I
   actually on" is a genuine user-facing troubleshooting question, but the full post-mortem
   is not. Draw the line.

## Feasibility notes from discovery

No discovery ran. What is established, from reading the repo on 2026-09-04: the app's
user-facing surface is roughly twenty panes (Home, Connect, Repos and branch graph, To-Do,
Trust Center, Notices, Profiles, House Rules, Automation, Map, note graph, retrospective)
plus the iOS Capture app (audio capture, transcription, typed notes, a read-only repos and
to-do mirror). Fourteen MCP tools are exposed. That is a lot of surface for one page, which
is why open question 2 is not rhetorical.
