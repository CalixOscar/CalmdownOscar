// calmdownoscar — media motion, after koto.com: intro words rise, media opens as it enters,
// devices drift at different depths, the case in view takes focus, and cues point at the detail
// that matters. Does nothing for reduced motion or without IntersectionObserver.
(function(){
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  root.classList.add('motion'); // usually already set by the inline head check

  // 1. Split intro lines into words (text only; the words stay readable in order).
  document.querySelectorAll('.lede').forEach(function(el){
    if (el.children.length){ el.classList.add('words-ready'); return; }
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function(w, i){
      var s = document.createElement('span');
      s.className = 'w'; s.style.setProperty('--i', i); s.textContent = w;
      el.append(s, i < words.length - 1 ? ' ' : '');
    });
    el.classList.add('words-ready');
  });

  // Stagger indexes for pins, pin keys and data lanes.
  document.querySelectorAll('.shot').forEach(function(shot){
    shot.querySelectorAll('.pin').forEach(function(p, i){ p.style.setProperty('--i', i); });
  });
  document.querySelectorAll('.pin-key li').forEach(function(li, i){ li.style.setProperty('--i', i); });
  document.querySelectorAll('.lanes .lane').forEach(function(lane, i){
    lane.querySelectorAll('.flow, .dot').forEach(function(el, j){
      el.style.setProperty('--i', i);
      if (el.classList.contains('dot') && j > 1) el.style.setProperty('--d', '.85s'); // far end lands after the line
    });
  });

  // 2 & 5. Reveal once on entry.
  var reveal = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      reveal.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.stage, .shot, .pin-key, .lanes, .history-shots').forEach(function(el){ reveal.observe(el); });

  // 4. Focus: the case crossing the middle of the screen.
  var cases = document.querySelectorAll('.case:not(.about)');
  var focus = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ e.target.classList.toggle('is-active', e.isIntersecting); });
    root.classList.toggle('has-focus', !!document.querySelector('.case.is-active'));
  }, { rootMargin: '-45% 0px -45% 0px' });
  cases.forEach(function(c){ focus.observe(c); });

  // 3. Depth: within a stage, each device drifts at its own rate while the stage crosses the screen.
  var DEPTH = { a1: 14, a2: -34, a3: 22 };
  var live = new Set();
  var watch = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ e.isIntersecting ? live.add(e.target) : live.delete(e.target); });
    tick();
  });
  document.querySelectorAll('.stage:not(.fill)').forEach(function(s){ if (s.querySelectorAll('img').length > 1) watch.observe(s); });
  var queued = false;
  function tick(){
    if (queued) return; queued = true;
    requestAnimationFrame(function(){
      queued = false;
      var vh = window.innerHeight;
      live.forEach(function(stage){
        var r = stage.getBoundingClientRect();
        var p = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / vh)); // -1 above … 1 below
        stage.querySelectorAll('img').forEach(function(img){
          var d = DEPTH[img.classList.contains('a1') ? 'a1' : img.classList.contains('a2') ? 'a2' : 'a3'];
          img.style.translate = '0 ' + (p * d).toFixed(1) + 'px';
        });
      });
    });
  }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);
})();
