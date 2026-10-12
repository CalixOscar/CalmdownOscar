// Home header: the aurora photo as a 3D scene. The photo is split into two layers (assets/aurora-sky.jpg,
// the sky with the trees painted out, and assets/aurora-trees.webp, the trees cut out) set apart in CSS 3D.
// The view turns with the mouse (or drifts on its own on touch screens) and scrolling moves in, so the
// branches slide across the aurora. Skipped for reduced motion; the flat photo in the CSS stays.
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sky = document.querySelector('.sky');
  if (!sky || !window.CSS || !CSS.supports('transform-style', 'preserve-3d')) return;

  var TURN = 8;      // degrees the view turns at the edge of the window
  var DOLLY = 140;   // px the camera moves in over the header's height

  var scene = document.createElement('div');
  scene.className = 'sky-scene';
  scene.innerHTML = '<div class="sky-far"></div><div class="sky-near"></div>';

  function load(src){ return new Promise(function(ok, fail){ var i = new Image(); i.onload = ok; i.onerror = fail; i.src = src; }); }

  // Where the viewer is looking: the mouse when there is one, a slow drift otherwise.
  var target = [0, 0], look = [0, 0], lastInput = -1e9;
  window.addEventListener('pointermove', function(e){
    if (e.pointerType !== 'mouse') return;
    target[0] = e.clientX / window.innerWidth * 2 - 1;
    target[1] = e.clientY / window.innerHeight * 2 - 1;
    lastInput = performance.now();
  }, { passive: true });
  window.addEventListener('deviceorientation', function(e){
    if (e.gamma == null || e.beta == null) return;
    target[0] = Math.max(-1, Math.min(1, e.gamma / 20));
    target[1] = Math.max(-1, Math.min(1, (e.beta - 50) / 20));
    lastInput = performance.now();
  }, { passive: true });

  var visible = true, running = false, prev = 0;
  function frame(t){
    if (!visible || document.hidden){ running = false; return; }
    var dt = Math.min(64, t - (prev || t)); prev = t;
    if (t - lastInput > 4000){
      var s = t / 1000;
      target[0] = Math.sin(s * 0.23) * 0.8;
      target[1] = Math.sin(s * 0.15 + 1) * 0.5;
    }
    var k = 1 - Math.pow(0.95, dt / 16.7);
    look[0] += (target[0] - look[0]) * k;
    look[1] += (target[1] - look[1]) * k;
    var r = sky.getBoundingClientRect();
    var dolly = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
    scene.style.transform = 'translateZ(' + (dolly * DOLLY).toFixed(1) + 'px) rotateX(' + (look[1] * TURN * 0.6).toFixed(3) + 'deg) rotateY(' + (-look[0] * TURN).toFixed(3) + 'deg)';
    requestAnimationFrame(frame);
  }
  function start(){ if (!running && visible && !document.hidden){ running = true; prev = 0; requestAnimationFrame(frame); } }

  Promise.all([load('assets/aurora-sky.jpg'), load('assets/aurora-trees.webp')]).then(function(){
    sky.appendChild(scene);
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ visible = es[0].isIntersecting; start(); }).observe(sky);
    }
    document.addEventListener('visibilitychange', start);
    start();
    requestAnimationFrame(function(){ sky.classList.add('live'); });
  }).catch(function(){});
})();
