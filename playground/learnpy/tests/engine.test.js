const assert = require('node:assert/strict');
const engine = require('../engine.js');

function run(index, source) { const result = engine.checkExercise(index, source); assert.equal(result.ok, true, result.message); return result.value.output; }
function check(index, source) { const result = engine.checkExercise(index, source); assert.equal(result.ok, true, result.message); return result.value; }

assert.deepEqual(run(0, 'print("Good morning")'), ['Good morning']);
assert.deepEqual(run(0, "print('Bonjour')"), ['Bonjour']);
assert.deepEqual(run(1, 'print("Hello")\nprint("second")'), ['Hello', 'second']);
assert.deepEqual(run(2, 'print("A message")'), ['A message']);
assert.deepEqual(run(3, 'print(42)'), ['42']);
assert.deepEqual(run(4, 'print(4 + 3)'), ['7']);
assert.deepEqual(run(5, 'name = "Mina"\nprint(name)'), ['Mina']);
assert.deepEqual(run(6, "name='Lee'\nprint('Hello, ' + name)"), ['Hello, Lee']);
assert.deepEqual(run(7, 'count = 8\nprint(count + 1)'), ['9']);
assert.deepEqual(run(8, 'print(2 > 9)'), ['False']);
assert.deepEqual(run(9, 'name = "Jo"\ncount = 8\nprint("Hello, " + name)\nprint(count + 1)'), ['Hello, Jo', '9']);
assert.equal(check(0, 'print("Hello, world!")').complete, false);
assert.deepEqual(check(0, 'print("Still learning")').output, ['Still learning']);
assert.equal(check(9, 'name = "Jo"\ncount = 8\nprint("Hello, " + name)\nprint(count)').complete, false);
assert.equal(check(9, 'name = "Jo"\ncount = 8\nprint("Hello, " + name)\nprint(count + 1)').complete, true);
assert.equal(check(0, 'print(1)').complete, false);
assert.equal(check(1, 'print("Hello")\nprint(1)').complete, false);
assert.equal(check(2, 'print("A message")\nprint("extra")').complete, false);
assert.equal(check(3, 'print("8")').complete, false);
assert.equal(check(4, 'print("changed" + "value")').complete, false);
assert.equal(check(4, 'print(1 + 4)').complete, false);
assert.equal(check(3, 'print(7)').complete, false);
assert.equal(check(5, 'name = "Mina"\nprint("Mina")').complete, false);
assert.equal(check(6, 'name = "Lee"\nprint("Hello, Lee")').complete, false);
assert.equal(check(7, 'count = 8\nprint(9)').complete, false);
assert.equal(check(8, 'print(3 > 2)').complete, false);
assert.equal(check(9, 'name = "Jo"\ncount = 8\nprint("Hello, Jo")\nprint(9)').complete, false);

assert.equal(engine.run('print("missing)').ok, false);
assert.match(engine.run('print("missing)').message, /closing quote/);
assert.equal(engine.run('import os').kind, 'unsupported');
assert.equal(engine.run('print(window.token)').kind, 'unsupported');
assert.equal(engine.run('print("<img src=x onerror=alert(1)>")').value.output[0], '<img src=x onerror=alert(1)>');
assert.equal(engine.run('print(1 + 2 + 3)').ok, false);
assert.equal(engine.run('print(999999999)').kind, 'limit');
assert.equal(engine.run('print("' + 'a'.repeat(engine.LIMITS.source) + '")').kind, 'limit');
assert.equal(engine.run(Array(engine.LIMITS.lines + 2).fill('print(1)').join('\n')).kind, 'limit');
assert.equal(engine.run(Array(engine.LIMITS.tokens + 2).fill('x=1').join('\n')).kind, 'limit');
assert.equal(engine.run('print(1 / 0)').kind, 'unsupported');
assert.equal(engine.run('value = print').kind, 'unsupported');
assert.equal(engine.run('print = 1').kind, 'unsupported');
assert.equal(engine.run('print("ok" + )').kind, 'unsupported');
assert.equal(engine.run('if = 1').kind, 'unsupported');
assert.equal(engine.run('print(if)').kind, 'unsupported');
assert.equal(engine.run('print(01)').kind, 'syntax');

// Intermediate values are bounded even when nothing is printed.
assert.equal(Object.isFrozen(engine.LIMITS), true);
assert.equal(engine.LIMITS.string, 4000);
const atStringLimit = 's = "' + 'x'.repeat(1000) + '"\ns = s + s\ns = s + s';
assert.equal(engine.run(atStringLimit).ok, true);
assert.equal(engine.run(atStringLimit + '\nt = s').ok, true);
assert.equal(engine.run(atStringLimit + '\ns = s + ""').ok, true);
assert.equal(engine.run(atStringLimit + '\ns = s + "x"').kind, 'limit');
assert.equal(engine.run(atStringLimit + '\ns = "x" + s').kind, 'limit');
assert.equal(engine.run(atStringLimit + '\ns = s + s').kind, 'limit');
assert.equal(engine.run('s = "' + 'x'.repeat(3000) + '"').ok, true);
assert.equal(engine.run('n = 999999 + 1\nprint(n)').value.output[0], '1000000');
assert.equal(engine.run('print(1000000 + 0)').value.output[0], '1000000');
assert.equal(engine.run('n = 1000000\nn = n + 1').kind, 'limit');
assert.equal(engine.run('print(1000000 + 1)').kind, 'limit');

const exactOutput = 'print("' + 'x'.repeat(1000) + '")\nprint("' + 'y'.repeat(999) + '")';
assert.equal(engine.run(exactOutput).value.output.join('\n').length, engine.LIMITS.output);
const excessOutput = exactOutput.replace('y'.repeat(999), 'y'.repeat(1000));
assert.equal(engine.run(excessOutput).kind, 'limit');
assert.equal('value' in engine.run(excessOutput), false, 'Failures must not return partial output');
assert.equal(engine.run('print("' + 'x'.repeat(2000) + '")').ok, true);
assert.equal(engine.run('print("' + 'x'.repeat(2000) + '")\nprint("")').kind, 'limit');

// The exact reported reproduction must fail safely inside a bounded child process.
const { spawnSync } = require('node:child_process');
const growthCheck = spawnSync(process.execPath, ['--max-old-space-size=64', '-e', `
  const assert = require('node:assert/strict');
  const engine = require(process.argv[1]);
  const source = ['s = "' + 'x'.repeat(3000) + '"', ...Array(18).fill('s = s + s'), 'print(s)'].join('\\n');
  assert.equal(source.length, 3195);
  assert.equal(source.split('\\n').length, 20);
  assert.equal(engine.lex(source).value.length, 116);
  const result = engine.run(source);
  assert.equal(result.kind, 'limit');
  assert.match(result.message, /string/);
  assert.equal('value' in result, false);
  assert.equal(engine.run('print("still works")').value.output[0], 'still works');
`, require.resolve('../engine.js')], { timeout: 5000, encoding: 'utf8' });
assert.ifError(growthCheck.error);
assert.equal(growthCheck.signal, null, growthCheck.stderr);
assert.equal(growthCheck.status, 0, growthCheck.stderr);
console.log('LearnPy engine tests passed: ten exercises, alternates, negative cases, value/output boundaries, and bounded growth regression.');
