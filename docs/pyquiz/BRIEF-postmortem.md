# Brief — Codex post-mortem of the shipped PyLearn Quiz

You are the independent reviewer. Review only.

## Context
The plan `docs/PLAN-pyquiz.md` was settled after your pre-mortem (`docs/dialogue/pyquiz.md`, your 11 findings plus Claude's response). It has been built and deployed to https://www.calmdownoscar.com/pyQuiz/. The shipped change is `git diff 17fb2cc..HEAD` (pyQuiz/, docs/pyquiz/, vercel.json, biancaexam/sw.js, playground/index.html, playground/pyquiz.jpg).

Claude's verification (re-check what you can locally; do not trust it): card verifier 114 cards / 99 executed / 0 problems; headless Chrome 16/16 against the live site, including service worker activation, cache contents, "Ready to use offline", 50:50 hiding two wrong options and saving, and an offline reload plus round; a local run with the server killed before the reload also passed; live redirects for /pyQuiz, /pyquiz, /pyquiz/ return 307 to /pyQuiz/; docs/ returns 404 live.

## Write
Append exactly one section to `docs/dialogue/pyquiz.md`, headed `## Codex — post-mortem — 2026-11-07`:
1. For each of your 11 pre-mortem findings: resolved / partly resolved / not resolved, with file:line evidence from the shipped code.
2. New defects in the shipped code, ordered by severity, each with a concrete failure scenario, evidence and a recommended fix. Read `pyQuiz/sw.js`, `docs/pyquiz/template.html`, `docs/pyquiz/build.py`, `docs/pyquiz/cards.py` (spot-check at least 15 of the newer card explanations for misleading rules), and the playground section.
3. What remains unverified (e.g., real iPhone install), as a short list.
Separate verified facts from assumptions. You may run `python3 -I docs/pyquiz/build.py` and `node --check`.

## Do not
- Change any file other than `docs/dialogue/pyquiz.md` (running build.py rewrites pyQuiz/index.html identically; if it differs, report that, and restore it with `git checkout pyQuiz/index.html`).
- Commit, push, deploy, install anything, open network connections, or dispatch agents.
