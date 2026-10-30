# LearnPy live safety test — 2026-10-30

## Result

One verified resource-handling defect. Do not treat the prior low-risk
assessment as clearance for broader testing until it is fixed and retested.
No evidence of arbitrary JavaScript/Python execution or data access in the
performed checks. This is a bounded test, not a formal or exhaustive audit.

## Verified defect

The engine limits source to 4000 characters, 20 lines and 160 tokens, but does
not bound intermediate strings produced by assignment/concatenation. This
3195-character, 20-line, 116-token program is within those limits:

```js
const source = [
  's = "' + 'x'.repeat(3000) + '"',
  ...Array(18).fill('s = s + s'),
  'print(s)'
].join('\n');
```

The root planner independently reproduced an uncaught engine
`RangeError: Invalid string length` in a Node child with a 64 MB heap limit
and five-second process timeout. The exception was caught by the test harness,
not by the engine. Browser auto-checking has no catch boundary. The live
browser was deliberately not subjected to resource exhaustion; its exact
failure/memory behavior is unverified. Stale output or tab instability is a
plausible consequence, not a demonstrated browser result.

Remediation needs bounded intermediate values before allocation/assignment,
an error boundary for unexpected engine failures, and regression tests. A
separate source-size guard before syntax highlighting is also needed: the
textarea has no maximum length and highlighting runs before engine validation.
Large-paste behavior is a static concern and was not stress-tested.

## Passed checks

- Live index.html, app.js, engine.js and style.css match the tested source.
- The directory URL and HTML file return restrictive CSP, including
  `connect-src 'none'`, `script-src 'self'`, and no unsafe-eval/WASM permission.
- Evidence and engine test files return 404.
- Existing Node exercise/negative/limit tests and JavaScript syntax checks pass.
- 20,000 seeded short malformed inputs produced no exceptions in the root
  planner's separate test. This corpus does not cover resource growth.
- Fifteen injection/global-access inputs produced zero accesses to a global
  getter canary in that separate test.
- In the live browser, an HTML image/event-shaped string remained text:
  zero image nodes and no DOM canary mutation. A typed DOM command, loop and
  fetch command each received the unsupported-subset message.
- All ten lessons completed in the current live browser, ending with the
  completion marker. No automatic advancement while typing was required.

No source fixes or deployments were made during this test. Further
resource-exhaustion testing stopped after the first verified defect, as
required by the studio's security/architecture failure rule.

## Local repair and bounded retest — 2026-10-31

The local source now checks string lengths before concatenating, checks
assignment/resolved values, limits computed numbers and counts output before
storing it. The editor has maxlength plus a source-length guard before syntax
highlighting or draft retention. Unexpected engine failures produce recoverable
feedback and hide stale completion/output. Oversized text stays visible through
a plain-text CSS fallback when its highlight overlay is cleared.

The planner reran both Node suites and JS syntax checks successfully, inspected
the actual changes, and passed `git -c core.fsmonitor=false diff --check`.
The original payload returns a string-limit error in a child capped at 64 MB
with a five-second timeout. Boundary and UI regression tests cover recovery and
all ten lessons through the real app code in a minimal DOM VM.

Safari rendered the updated local page, but browser interaction verification
was blocked by unavailable browser-control services. Browser paste behavior,
the visible oversized-input fallback, browser error recovery and full lesson
replay are (unverified). An independent Claude post-mortem could not run because
its CLI is not logged in. Both checks remain before publishing. No new live
stress test or deployment was performed; production still has the original defect.
Detailed implementation and evidence: `docs/PLAN-learnpy-resource-fix.md`.
