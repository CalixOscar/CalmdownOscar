(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.LearnPyEngine = factory();
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  var LIMITS = Object.freeze({ source: 4000, tokens: 160, lines: 20, string: 4000, number: 1000000, output: 2000 });
  var IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;
  var RESERVED = Object.freeze({ and: true, as: true, assert: true, async: true, await: true, break: true, case: true, class: true, continue: true, def: true, del: true, elif: true, else: true, except: true, finally: true, for: true, from: true, global: true, if: true, import: true, in: true, is: true, lambda: true, match: true, nonlocal: true, not: true, or: true, pass: true, raise: true, return: true, try: true, while: true, with: true, yield: true, False: true, None: true, True: true, print: true });

  function failure(message, kind) { return { ok: false, kind: kind || 'error', message: message }; }
  function success(value) { return { ok: true, value: value }; }

  function boundedValue(value) {
    if (typeof value === 'string' && value.length > LIMITS.string) return failure('That string is too large for this demo.', 'limit');
    if (typeof value === 'number' && (!Number.isFinite(value) || Math.abs(value) > LIMITS.number)) return failure('That number is too large for this demo.', 'limit');
    return success(value);
  }

  function lex(source) {
    if (typeof source !== 'string') return failure('Please enter code as text.', 'input');
    if (source.length > LIMITS.source) return failure('This demo has a small code-size limit.', 'limit');
    if (source.split('\n').length > LIMITS.lines) return failure('This demo allows only a few lines at a time.', 'limit');
    var tokens = [], i = 0;
    while (i < source.length) {
      var ch = source[i];
      if (ch === ' ' || ch === '\t' || ch === '\r') { i++; continue; }
      if (ch === '\n') { tokens.push({ type: 'newline', value: ch }); i++; continue; }
      if (ch === '"' || ch === "'") {
        var quote = ch, start = i++ , value = '';
        while (i < source.length && source[i] !== quote && source[i] !== '\n') {
          if (source[i] === '\\') return failure('This demo does not use escape characters in strings.', 'syntax');
          value += source[i++];
        }
        if (i >= source.length || source[i] !== quote) return failure('This string needs a closing quote.', 'syntax');
        i++;
        tokens.push({ type: 'string', value: value, start: start });
      } else if (/[0-9]/.test(ch)) {
        var digits = '';
        while (i < source.length && /[0-9]/.test(source[i])) digits += source[i++];
        if (digits.length > 1 && digits[0] === '0') return failure('This demo uses decimal numbers without leading zeroes.', 'syntax');
        var number = Number(digits);
        if (number > LIMITS.number) return failure('That number is too large for this demo.', 'limit');
        tokens.push({ type: 'number', value: number });
      } else if (/[A-Za-z_]/.test(ch)) {
        var word = '';
        while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) word += source[i++];
        tokens.push({ type: RESERVED[word] ? 'keyword' : 'identifier', value: word });
      } else if (ch === '=' && source[i + 1] === '=') return failure('This demo uses simple assignments, not ==.', 'unsupported');
      else if ('=+>()'.indexOf(ch) >= 0) { tokens.push({ type: 'operator', value: ch }); i++; }
      else return failure('This demo only understands a few Python commands.', 'unsupported');
      if (tokens.length > LIMITS.tokens) return failure('That code has too many pieces for this demo.', 'limit');
    }
    return success(tokens);
  }

  function Parser(tokens) { this.tokens = tokens; this.i = 0; }
  Parser.prototype.peek = function () { return this.tokens[this.i]; };
  Parser.prototype.take = function () { return this.tokens[this.i++]; };
  Parser.prototype.accept = function (value) { if (this.peek() && this.peek().type === 'operator' && this.peek().value === value) return this.take(); return null; };
  Parser.prototype.expect = function (value) { return this.accept(value) ? true : false; };
  Parser.prototype.value = function () {
    var token = this.take();
    if (!token) return null;
    if (token.type === 'string' || token.type === 'number') return { type: token.type, value: token.value };
    if (token.type === 'identifier' && IDENTIFIER.test(token.value)) return { type: 'name', value: token.value };
    return null;
  };
  Parser.prototype.expression = function () {
    var left = this.value();
    if (!left) return null;
    var op = this.peek();
    if (op && op.type === 'operator' && (op.value === '+' || op.value === '>')) {
      this.take();
      var right = this.value();
      if (!right) return null;
      return { type: 'binary', op: op.value, left: left, right: right };
    }
    return left;
  };
  Parser.prototype.line = function () {
    var first = this.take();
    if (!first) return null;
    if (first.type !== 'identifier' && first.type !== 'keyword') return null;
    if (first.value === 'print') {
      if (!this.expect('(')) return null;
      var expression = this.expression();
      if (!expression || !this.expect(')')) return null;
      return { type: 'print', expression: expression };
    }
    if (first.type !== 'identifier' || !IDENTIFIER.test(first.value) || !this.expect('=')) return null;
    var value = this.expression();
    return value ? { type: 'assign', name: first.value, expression: value } : null;
  };

  function parse(source) {
    var scanned = lex(source);
    if (!scanned.ok) return scanned;
    var parser = new Parser(scanned.value), program = [], lines = 0;
    while (parser.i < parser.tokens.length) {
      if (parser.peek().type === 'newline') { parser.take(); continue; }
      var statement = parser.line();
      if (!statement) return failure('This demo only understands a few Python commands.', 'unsupported');
      if (parser.peek() && parser.peek().type !== 'newline') return failure('This demo only understands a few Python commands.', 'unsupported');
      program.push(statement); lines++;
      if (parser.peek()) parser.take();
    }
    return success(program);
  }

  function run(source) {
    var parsed = parse(source);
    if (!parsed.ok) return parsed;
    var names = Object.create(null), output = [], outputLength = 0;
    function resolveValue(node) {
      if (node.type === 'string' || node.type === 'number') return boundedValue(node.value);
      if (node.type === 'name') return Object.prototype.hasOwnProperty.call(names, node.value) ? boundedValue(names[node.value]) : failure('That name has not been stored yet.', 'runtime');
      var left = resolveValue(node.left), right = resolveValue(node.right);
      if (!left.ok || !right.ok) return left.ok ? right : left;
      if (node.op === '+') {
        if (typeof left.value === 'number' && typeof right.value === 'number') return boundedValue(left.value + right.value);
        if (typeof left.value === 'string' && typeof right.value === 'string') {
          // Check before allocating the concatenation, even if it is never printed.
          if (left.value.length > LIMITS.string - right.value.length) return failure('That string is too large for this demo.', 'limit');
          return boundedValue(left.value + right.value);
        }
        return failure('Use + with two numbers or two strings in this demo.', 'runtime');
      }
      if (node.op === '>') {
        if (typeof left.value !== 'number' || typeof right.value !== 'number') return failure('Use > with two numbers in this demo.', 'runtime');
        return success(left.value > right.value);
      }
      return failure('This operation is not part of the demo.', 'unsupported');
    }
    for (var i = 0; i < parsed.value.length; i++) {
      var statement = parsed.value[i];
      if (statement.type === 'assign') {
        var assigned = resolveValue(statement.expression);
        if (!assigned.ok) return assigned;
        assigned = boundedValue(assigned.value);
        if (!assigned.ok) return assigned;
        names[statement.name] = assigned.value;
      } else {
        var printed = resolveValue(statement.expression);
        if (!printed.ok) return printed;
        var text = typeof printed.value === 'boolean' ? (printed.value ? 'True' : 'False') : String(printed.value);
        var separatorLength = output.length ? 1 : 0;
        if (text.length > LIMITS.output - outputLength - separatorLength) return failure('That output is too large for this demo.', 'limit');
        outputLength += text.length + separatorLength;
        output.push(text);
      }
    }
    return success({ output: output, statements: parsed.value });
  }

  function isPrint(statement) { return statement && statement.type === 'print'; }
  function isAssign(statement, name, valueType) { return statement && statement.type === 'assign' && statement.name === name && statement.expression.type === valueType; }
  function isLiteral(node, type, value) { return node && node.type === type && (arguments.length < 3 || node.value === value); }
  function isName(node, name) { return isLiteral(node, 'name', name); }
  function isBinary(node, op) { return node && node.type === 'binary' && node.op === op; }
  function prints(statements) { return statements.filter(isPrint); }

  var EXERCISES = Object.freeze([
    { title: 'Change the message', starter: 'print("Hello, world!")', hint: 'Change the words inside the quotes.', pass: function (r) { var s = r.statements; return s.length === 1 && isPrint(s[0]) && isLiteral(s[0].expression, 'string') && s[0].expression.value !== 'Hello, world!'; } },
    { title: 'Add an output line', starter: 'print("Hello")\nprint("")', hint: 'Put a nonempty message in the second print.', pass: function (r) { var p = prints(r.statements); return r.statements.length === 2 && p.length === 2 && isLiteral(p[0].expression, 'string', 'Hello') && isLiteral(p[1].expression, 'string') && p[1].expression.value.length > 0; } },
    { title: 'Close the message', starter: 'print("A message)', hint: 'Add the missing closing quote. Both quote styles work.', pass: function (r) { return r.statements.length === 1 && isPrint(r.statements[0]) && isLiteral(r.statements[0].expression, 'string', 'A message'); } },
    { title: 'Change the number', starter: 'print(7)', hint: 'Change 7 to another whole number.', pass: function (r) { return r.statements.length === 1 && isPrint(r.statements[0]) && isLiteral(r.statements[0].expression, 'number') && r.statements[0].expression.value !== 7; } },
    { title: 'Change an addition operand', starter: 'print(2 + 3)', hint: 'Change either number in the addition.', pass: function (r) { var e = r.statements.length === 1 && isPrint(r.statements[0]) ? r.statements[0].expression : null; return isBinary(e, '+') && isLiteral(e.left, 'number') && isLiteral(e.right, 'number') && (e.left.value !== 2 || e.right.value !== 3) && e.left.value + e.right.value !== 5; } },
    { title: 'Store and print a name', starter: 'name = "Sam"\nprint(name)', hint: 'Change Sam, then print the stored name.', pass: function (r) { var s = r.statements; return s.length === 2 && isAssign(s[0], 'name', 'string') && s[0].expression.value !== 'Sam' && isPrint(s[1]) && isName(s[1].expression, 'name') && r.output[0] === s[0].expression.value; } },
    { title: 'Combine a greeting', starter: 'name = "Sam"\nprint("Hello, " + name)', hint: 'Change Sam and keep the name in the greeting.', pass: function (r) { var s = r.statements, e = s[1] && s[1].expression; return s.length === 2 && isAssign(s[0], 'name', 'string') && s[0].expression.value !== 'Sam' && isPrint(s[1]) && isBinary(e, '+') && isLiteral(e.left, 'string', 'Hello, ') && isName(e.right, 'name') && r.output[0] === 'Hello, ' + s[0].expression.value; } },
    { title: 'Count one more', starter: 'count = 3\nprint(count + 1)', hint: 'Change 3. The output should be one more than it.', pass: function (r) { var s = r.statements, e = s[1] && s[1].expression; return s.length === 2 && isAssign(s[0], 'count', 'number') && s[0].expression.value !== 3 && isPrint(s[1]) && isBinary(e, '+') && isName(e.left, 'count') && isLiteral(e.right, 'number', 1) && r.output[0] === String(s[0].expression.value + 1); } },
    { title: 'Make the comparison false', starter: 'print(3 > 2)', hint: 'Change the numbers so the comparison prints False.', pass: function (r) { var e = r.statements.length === 1 && isPrint(r.statements[0]) ? r.statements[0].expression : null; return isBinary(e, '>') && isLiteral(e.left, 'number') && isLiteral(e.right, 'number') && (e.left.value !== 3 || e.right.value !== 2) && r.output[0] === 'False'; } },
    { title: 'Personalize two lines', starter: 'name = "Sam"\ncount = 3\nprint("Hello, " + name)\nprint(count + 1)', hint: 'Change both Sam and 3. The output should greet the name, then show count plus one.', pass: function (r) { var s = r.statements, greeting = s[2] && s[2].expression, total = s[3] && s[3].expression; return s.length === 4 && isAssign(s[0], 'name', 'string') && isAssign(s[1], 'count', 'number') && s[0].expression.value !== 'Sam' && s[1].expression.value !== 3 && isPrint(s[2]) && isBinary(greeting, '+') && isLiteral(greeting.left, 'string', 'Hello, ') && isName(greeting.right, 'name') && isPrint(s[3]) && isBinary(total, '+') && isName(total.left, 'count') && isLiteral(total.right, 'number', 1) && r.output[0] === 'Hello, ' + s[0].expression.value && r.output[1] === String(s[1].expression.value + 1); } }
  ]);

  function checkExercise(index, source) {
    var exercise = EXERCISES[index];
    if (!exercise) return failure('That exercise does not exist.', 'input');
    var result = run(source);
    if (!result.ok) return result;
    result.value.complete = exercise.pass(result.value);
    return success(result.value);
  }

  return { LIMITS: LIMITS, EXERCISES: EXERCISES, lex: lex, parse: parse, run: run, checkExercise: checkExercise };
}));
