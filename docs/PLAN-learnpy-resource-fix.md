# LearnPy resource-handling repair

Date: 2026-10-31
Scope: localized repair of the defect in `TEST-learnpy-safety-2026-10-30.md`.
Implementation branch: `docs/norsksti-guided-flow`. Publication branch: `fix/learnpy-resource-limits`, based on current `origin/main` (3a3a10d). Preserve all existing dirty and untracked work.
This continues the limited simulated web demo; no runtime, backend, dependency,
storage, deployment or expanded language support is authorized by this repair.

## Implementation contract

- [x] **build:** In `playground/learnpy/engine.js`, add a frozen string-value
  limit of 4000 UTF-16 code units. Validate literals/resolved values and assignment
  values; check operand lengths BEFORE concatenation. Enforce the existing
  numeric limit on computed sums too. Count total printed length, including
  separators, before pushing/joining output. Return ordinary `kind: limit`
  failures without partial results. Source, token and line bounds remain intact.
- [x] **build:** In `app.js` and `index.html`, set textarea maxlength to the
  source limit. Also explicitly check source length before syntax highlighting,
  splitting lines, retaining a draft or scheduling evaluation (maxlength alone
  does not cover programmatic assignment). On oversized input, preserve the
  editor text for correction but discard any oversized stored draft, clear
  highlighting and old output, cancel pending evaluation, hide completion and
  announce the size error immediately. Never execute a truncated prefix. A
  subsequent valid edit must recover normally. Guard both initial/navigation
  and debounced engine checks with a catch boundary, returning a generic
  recoverable error with no exception details or stale success/output.
- [x] **build:** Extend engine tests and add dependency-free UI VM regression
  tests under `playground/learnpy/tests/`. Cover exact/over string and numeric
  bounds, assignment-only growth, the reported 20-line doubling payload in a
  Node child capped at 64 MB/5 seconds, output separator accounting, oversized
  programmatic input bypassing maxlength, early highlighter rejection,
  unexpected engine failure and recovery, and all ten lessons/navigation.
- [x] **planner:** Read the actual diff, rerun Node tests and syntax checks,
  inspect a running local browser when available, record evidence and limits.
  Keep historical test findings intact and append a dated repair record.

Verification: `node playground/learnpy/tests/engine.test.js`,
`node playground/learnpy/tests/app.test.js`, `node --check` on changed JS,
and `git diff --check`. Untracked LearnPy files need explicit comparison to a
pre-edit snapshot because normal git diff does not show their contents.

Review refinement: **planner** adds a two-line plain-text fallback in `app.js`
and `style.css`, with a regression assertion. The normal textarea is transparent
under the syntax overlay; rejected oversized text must remain visible for correction
when that overlay is cleared. This extends the repair's file scope to `style.css`.

## Risk boundaries

The hard value/source/statement bounds prevent the known allocation path;
catching an exception alone cannot recover an exhausted browser process.
The input guard bounds application processing after input arrives, not the
browser/OS cost of receiving clipboard contents. No unlimited hostile live
stress tests. No claim of exhaustive security or full Python compatibility.
The published site remains unchanged until a separate authorized deployment.

## Verification record — 2026-10-31

Planner independently inspected before/after app, engine and HTML diffs and
read the tests. Both Node suites pass; syntax checks on all four JS files pass;
`git -c core.fsmonitor=false diff --check` passes. The exact 3195-character,
20-line, 116-token payload returns `kind: limit` in the 64 MB child within its
five-second timeout, then a normal print still works. Tests include exact/over
string, numeric and output bounds; oversized source and pending timer
cancellation; synthetic unexpected engine errors and subsequent recovery;
all ten lessons, explicit navigation, draft retention and reload reset.

Safari loaded and rendered the local revised page. Native editing could not
be verified: accessibility actions did not update the textarea and the next
coordinate action returned `noWindowsAvailable`. The browser host also returned
`The browser access host is unavailable`. Browser growth rejection, native paste,
plain-text fallback appearance and full browser lesson replay remain (unverified).
VM tests do not substitute for those checks.

Independent Claude post-mortem attempted with the local CLI; it exited before
review with `Not logged in · Please run /login`. Independent review is pending;
no review verdict is claimed. This is a publication gate, along with the browser
retest. No commit, upload or deployment occurred. Historical live findings remain
applicable to the unchanged production deployment.

## Publication instruction — 2026-10-31

The founder explicitly requested: "Push the fix to make vercel deploy" after
the outstanding checks were disclosed. This authorizes the push and deployment.
Use an isolated checkout from the latest main: the current production demo was
published manually and its files were not yet in Git. Include the four demo
files, two regression suites, repair/test notes, strict LearnPy CSP and upload
exclusions. Preserve all existing main routes, assets and unrelated edits.

Both suites and syntax/diff checks pass again in the isolated checkout.
The independent Claude CLI review was retried outside the filesystem sandbox;
it authenticated but returned the five-hour usage limit before a review.
Independent Claude review and native browser interaction remain (unverified).
Publishing this bounded repair follows the founder's explicit instruction with
those limitations disclosed; no claim of complete security clearance is made.
