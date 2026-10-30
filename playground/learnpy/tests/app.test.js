const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const engine = require('../engine.js');
const appSource = fs.readFileSync(require.resolve('../app.js'), 'utf8');

// Execute the actual app against a minimal DOM and deterministic debounce timers.
// This checks application flow; it does not emulate native browser paste or layout.
function createApp(failInitially = false) {
  let shouldThrow = failInitially, fragmentCount = 0, nextTimer = 0;
  const timers = new Map(), calls = [];
  function element() {
    const classes = new Set(), events = {};
    return {
      value: '', textContent: '', hidden: true, disabled: false, children: [], attributes: {},
      classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
      addEventListener: (name, handler) => { events[name] = handler; },
      dispatch: (name) => events[name](),
      appendChild(child) { this.children.push(child); },
      replaceChildren(...children) { this.children = children; this.textContent = ''; },
      setAttribute(name, value) { this.attributes[name] = value; },
      focus() { this.focused = true; }
    };
  }
  const ids = ['code', 'highlight', 'line-numbers', 'output', 'live-status', 'lesson-hint', 'lesson-goal', 'help-button', 'help-panel', 'previous', 'next', 'complete-mark'];
  const nodes = Object.fromEntries(ids.map(id => [id, element()]));
  const wrappedEngine = {
    ...engine,
    checkExercise(index, source) {
      calls.push({ index, source });
      if (shouldThrow) throw new RangeError('private exception detail');
      return engine.checkExercise(index, source);
    }
  };
  const context = vm.createContext({
    window: { LearnPyEngine: wrappedEngine },
    document: {
      getElementById: id => nodes[id],
      createDocumentFragment() { fragmentCount++; return element(); },
      createElement: () => element(),
      createTextNode: text => ({ textContent: text })
    },
    setTimeout(handler, delay) { assert.equal(delay, 300); const id = ++nextTimer; timers.set(id, handler); return id; },
    clearTimeout: id => timers.delete(id)
  });
  vm.runInContext(appSource, context, { timeout: 1000 });
  return {
    nodes, calls,
    input(source) { nodes.code.value = source; nodes.code.dispatch('input'); },
    flush() { const pending = [...timers.values()]; timers.clear(); pending.forEach(handler => handler()); },
    click(id) { nodes[id].dispatch('click'); },
    fail(value) { shouldThrow = value; },
    get pending() { return timers.size; },
    get fragments() { return fragmentCount; }
  };
}

const app = createApp();
assert.equal(app.nodes.code.maxLength, engine.LIMITS.source);
assert.match(fs.readFileSync(require.resolve('../index.html'), 'utf8'), /<textarea[^>]*maxlength="4000"/);
app.input('print("First success")');
assert.equal(app.nodes.next.hidden, true);
assert.equal(app.pending, 1);
app.flush();
assert.equal(app.nodes.next.hidden, false);
assert.equal(app.nodes.output.textContent, 'First success');

// A programmatic oversized input bypasses maxlength. Reject it before any
// highlighter work, stored draft update or engine call, and cancel pending work.
app.input('print("pending success")');
const callsBeforeOversize = app.calls.length, fragmentsBeforeOversize = app.fragments;
const oversized = 'print("prefix must never execute")' + '\n'.repeat(engine.LIMITS.source + 1);
app.input(oversized);
assert.equal(app.nodes.code.value, oversized, 'Keep editor input available for correction');
assert.equal(app.nodes.code.classList.contains('is-plain'), true, 'Oversized text stays visible without highlighting');
assert.equal(app.fragments, fragmentsBeforeOversize);
assert.equal(app.nodes.highlight.children.length, 0);
assert.equal(app.nodes['line-numbers'].textContent, '');
assert.equal(app.pending, 0);
assert.equal(app.nodes.next.hidden, true);
assert.equal(app.nodes['complete-mark'].hidden, true);
assert.match(app.nodes.output.textContent, /code-size limit/);
assert.equal(app.nodes['live-status'].textContent, app.nodes.output.textContent);
assert.equal(app.nodes.output.classList.contains('is-error'), true);
app.flush();
assert.equal(app.calls.length, callsBeforeOversize, 'Do not run a prefix or previous queued check');
app.click('next');
assert.equal(app.nodes['lesson-goal'].textContent, engine.EXERCISES[0].title);

app.input('print("Recovered")');
assert.equal(app.nodes.code.classList.contains('is-plain'), false);
app.flush();
assert.equal(app.nodes.output.textContent, 'Recovered');
assert.equal(app.nodes.output.classList.contains('is-error'), false);
assert.equal(app.nodes.next.hidden, false);
app.click('next');
app.click('previous');
assert.equal(app.nodes.code.value, 'print("Recovered")', 'Retain a valid draft after recovery');

// Exact source boundary still reaches the engine; over-boundary input does not.
const exactSource = 'print("at limit")' + ' '.repeat(engine.LIMITS.source - 'print("at limit")'.length);
app.input(exactSource);
app.flush();
assert.equal(app.nodes.output.textContent, 'at limit');
assert.equal(app.calls.at(-1).source.length, engine.LIMITS.source);
const callsAtLimit = app.calls.length;
app.input(exactSource + ' ');
app.flush();
assert.equal(app.calls.length, callsAtLimit);

// Both debounced checks and refresh/navigation recover from unexpected errors.
app.fail(true);
app.input('print("throw now")');
app.flush();
assert.match(app.nodes.output.textContent, /could not check/);
assert.doesNotMatch(app.nodes.output.textContent, /private|RangeError/);
assert.equal(app.nodes.next.hidden, true);
assert.equal(app.nodes['complete-mark'].hidden, true);
app.fail(false);
app.input('print("works again")');
app.flush();
assert.equal(app.nodes.next.hidden, false);
app.fail(true);
app.click('next');
assert.match(app.nodes.output.textContent, /could not check/);
assert.equal(app.nodes.next.hidden, true);
app.fail(false);
app.input('print("Hello")\nprint("another line")');
app.flush();
assert.equal(app.nodes.output.textContent, 'Hello\nanother line');
assert.equal(app.nodes.next.hidden, false);
const initialFailure = createApp(true);
assert.match(initialFailure.nodes.output.textContent, /could not check/);
assert.equal(initialFailure.nodes.next.hidden, true);
initialFailure.fail(false);
initialFailure.input('print("recovered initialization")');
initialFailure.flush();
assert.equal(initialFailure.nodes.next.hidden, false);

// Complete all ten lessons through real input/debounce/navigation, without
// advancing automatically, then revisit a draft and simulate a reload.
const journey = createApp();
const solutions = [
  'print("Good morning")',
  'print("Hello")\nprint("second")',
  'print("A message")',
  'print(42)',
  'print(4 + 3)',
  'name = "Mina"\nprint(name)',
  'name = "Lee"\nprint("Hello, " + name)',
  'count = 8\nprint(count + 1)',
  'print(2 > 9)',
  'name = "Jo"\ncount = 8\nprint("Hello, " + name)\nprint(count + 1)'
];
solutions.forEach((source, index) => {
  journey.input(source);
  journey.flush();
  assert.equal(journey.nodes['lesson-goal'].textContent, engine.EXERCISES[index].title);
  assert.equal(journey.nodes.output.textContent, engine.run(source).value.output.join('\n'));
  assert.equal(journey.nodes.next.hidden, index === solutions.length - 1);
  assert.equal(journey.nodes['complete-mark'].hidden, index !== solutions.length - 1);
  if (index < solutions.length - 1) journey.click('next');
});
journey.click('previous');
assert.equal(journey.nodes.code.value, solutions[8]);
journey.input('print("missing)');
journey.flush();
assert.match(journey.nodes.output.textContent, /closing quote/);
assert.equal(journey.nodes.next.hidden, true);
assert.equal(journey.nodes['complete-mark'].hidden, true);
journey.input(solutions[8]);
journey.flush();
assert.equal(journey.nodes.next.hidden, false);
assert.equal(createApp().nodes.code.value, engine.EXERCISES[0].starter);
console.log('LearnPy app tests passed: oversized-input rejection, debounce cancellation, failure recovery, boundaries, and ten-lesson journey.');
