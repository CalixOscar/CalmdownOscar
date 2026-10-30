(function () {
  'use strict';
  var engine = window.LearnPyEngine;
  var index = 0;
  var drafts = engine.EXERCISES.map(function (exercise) { return exercise.starter; });
  var completed = Object.create(null);
  var debounceId = null;
  var code = document.getElementById('code');
  var highlight = document.getElementById('highlight');
  var lineNumbers = document.getElementById('line-numbers');
  var output = document.getElementById('output');
  var liveStatus = document.getElementById('live-status');
  var lessonHint = document.getElementById('lesson-hint');
  var lessonGoal = document.getElementById('lesson-goal');
  var helpButton = document.getElementById('help-button');
  var helpPanel = document.getElementById('help-panel');
  var previous = document.getElementById('previous');
  var next = document.getElementById('next');
  var completeMark = document.getElementById('complete-mark');
  code.maxLength = engine.LIMITS.source;

  function sourceWithinLimit(source) {
    if (source.length <= engine.LIMITS.source) { code.classList.remove('is-plain'); return true; }
    code.classList.add('is-plain');
    clearTimeout(debounceId);
    debounceId = null;
    highlight.replaceChildren();
    lineNumbers.textContent = '';
    next.hidden = true;
    completeMark.hidden = true;
    var result = { ok: false, kind: 'limit', message: 'This demo has a small code-size limit.' };
    renderResult(result);
    announce(result.message);
    return false;
  }

  function highlightCode(source) {
    if (!sourceWithinLimit(source)) return false;
    var pattern = /("[^\n]*?"|'[^\n]*?'|\bprint\b|\b(?:name|count)\b|\b\d+\b|[=+>()])/g;
    var fragment = document.createDocumentFragment(), cursor = 0, match;
    while ((match = pattern.exec(source)) !== null) {
      if (match.index > cursor) fragment.appendChild(document.createTextNode(source.slice(cursor, match.index)));
      var token = match[0], span = document.createElement('span');
      span.className = /^("|')/.test(token) ? 'tok-string' : /^print$/.test(token) ? 'tok-keyword' : /^(name|count)$/.test(token) ? 'tok-name' : /^\d+$/.test(token) ? 'tok-number' : 'tok-op';
      span.textContent = token;
      fragment.appendChild(span);
      cursor = match.index + token.length;
    }
    if (cursor < source.length) fragment.appendChild(document.createTextNode(source.slice(cursor)));
    if (!source) fragment.appendChild(document.createTextNode(' '));
    highlight.replaceChildren(fragment);
    lineNumbers.textContent = Array.from({ length: source.split('\n').length }, function (_, line) { return line + 1; }).join('\n');
    return true;
  }

  function announce(message) { liveStatus.textContent = message; }

  function renderResult(result) {
    if (result.ok) {
      output.textContent = result.value.output.length ? result.value.output.join('\n') : '(no output)';
      output.classList.remove('is-error');
      return result.value.complete === true;
    }
    output.textContent = result.message;
    output.classList.add('is-error');
    return false;
  }

  function currentResult() {
    try {
      return engine.checkExercise(index, drafts[index]);
    } catch (_) {
      return { ok: false, kind: 'error', message: 'This demo could not check that code. Edit it to try again.' };
    }
  }

  function refreshLesson() {
    clearTimeout(debounceId);
    code.value = drafts[index];
    if (!highlightCode(code.value)) return;
    lessonHint.textContent = engine.EXERCISES[index].hint;
    lessonGoal.textContent = engine.EXERCISES[index].title;
    previous.disabled = index === 0;
    var result = currentResult();
    var ready = result.ok && result.value.complete === true && completed[index] === true;
    renderResult(result);
    next.hidden = !ready || index === engine.EXERCISES.length - 1;
    completeMark.hidden = !ready || index !== engine.EXERCISES.length - 1;
    announce(result.ok ? 'Output updated.' : result.message);
  }

  function checkDraft() {
    debounceId = null;
    var result = currentResult(), ready = renderResult(result);
    if (ready) {
      completed[index] = true;
      next.hidden = index === engine.EXERCISES.length - 1;
      completeMark.hidden = index !== engine.EXERCISES.length - 1;
      announce(index === engine.EXERCISES.length - 1 ? 'You completed the demo.' : 'Lesson complete. Next lesson is available.');
    } else {
      next.hidden = true;
      completeMark.hidden = true;
      announce(result.ok ? 'Output updated. The lesson is not complete yet.' : result.message);
    }
  }

  function scheduleCheck() {
    clearTimeout(debounceId);
    next.hidden = true;
    completeMark.hidden = true;
    debounceId = setTimeout(checkDraft, 300);
  }

  code.addEventListener('input', function () {
    // maxlength helps normal typing/paste; the explicit guard also covers assigned values.
    if (!sourceWithinLimit(code.value)) return;
    drafts[index] = code.value;
    highlightCode(code.value);
    scheduleCheck();
  });
  code.addEventListener('scroll', function () { highlight.scrollTop = code.scrollTop; highlight.scrollLeft = code.scrollLeft; lineNumbers.scrollTop = code.scrollTop; });
  helpButton.addEventListener('click', function () { helpPanel.hidden = !helpPanel.hidden; helpButton.setAttribute('aria-expanded', String(!helpPanel.hidden)); });
  previous.addEventListener('click', function () {
    if (index === 0) return;
    index--;
    helpPanel.hidden = true;
    helpButton.setAttribute('aria-expanded', 'false');
    refreshLesson();
    code.focus();
  });
  next.addEventListener('click', function () {
    if (next.hidden || !completed[index] || index >= engine.EXERCISES.length - 1) return;
    index++;
    refreshLesson();
    code.focus();
  });
  refreshLesson();
}());
