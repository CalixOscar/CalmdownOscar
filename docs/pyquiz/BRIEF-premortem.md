# Brief — Codex pre-mortem of the PyLearn Quiz plan

You are the independent reviewer. This is a review only.

## Read
- `docs/PLAN-pyquiz.md` and `docs/intent/INTENT-004-pyquiz.md`
- `docs/pyquiz/cards.py` and `docs/pyquiz/template.html` (the try-out the founder already used)
- `biancaexam/index.html`, `biancaexam/sw.js`, `biancaexam/manifest.webmanifest` (the pattern being copied)
- `vercel.json` (redirects and CSP; note `/pyQuiz/` falls under the root rule) and `.vercelignore`
- `playground/index.html` (where the new section goes)
- `AGENTS.md` (studio rules, especially "no engagement bait")

You may run `python3 -I docs/pyquiz/cards.py /dev/null` to see the verifier work.

## Write
Append exactly one section to `docs/dialogue/pyquiz.md`, headed
`## Codex — pre-mortem — 2026-11-07`. In it:
1. A one-paragraph verdict.
2. Findings ordered most consequential first. Each: severity (critical/high/medium/low),
   a concrete failure scenario (what a user or deploy would actually hit), the evidence
   (file:line or command output), and the correction you recommend.
   Cover at least: service worker update/staleness and scope with the `/pyQuiz/`
   capital-letter path and the redirects; offline first load vs later loads; iOS
   home-screen install; CSP fit; whether the in-round run counter/XP violates the
   "no engagement bait" rule; the answer verifier's blind spots (3.9 vs current
   Python, `exec` namespace, prints-before-error cards); 50:50 semantics; any card
   in `cards.py` whose explanation is wrong or misleading; localStorage failure;
   accessibility of the option buttons and feedback.
3. Separate verified facts from assumptions.

## Do not
- Change any file other than `docs/dialogue/pyquiz.md`. No code, no plan edits.
- Commit, push, deploy, install anything, or open network connections.
- Dispatch other agents.
