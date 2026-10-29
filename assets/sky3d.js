// Aurora header (Apps, How I work; on home only when assets/aurora-gl.js cannot run): the photo as a 3D scene. The photo is split into two layers (assets/aurora-sky.jpg,
// the sky with the trees painted out, and assets/aurora-trees.webp, the trees cut out) set apart in CSS 3D.
// The view turns with the mouse, or on phones with the gyro and a sideways drag (drifting on its own
// until then), and scrolling moves in, so the branches slide across the aurora.
// Skipped for reduced motion; the flat photo in the CSS stays.
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sky = document.querySelector('.sky');
  if (!sky || !window.CSS || !CSS.supports('transform-style', 'preserve-3d')) return;

  var here = document.currentScript && document.currentScript.src;   // images sit beside this script
  function asset(name){ return here ? new URL(name, here).href : 'assets/' + name; }

  var TURN = 8;      // degrees the view turns at the edge of the window
  var DOLLY = 140;   // px the camera moves in over the header's height

  var scene = document.createElement('div');
  scene.className = 'sky-scene';
  scene.innerHTML = '<div class="sky-far"></div><div class="sky-near"></div>';

  function load(src){ return new Promise(function(ok, fail){ var i = new Image(); i.onload = ok; i.onerror = fail; i.src = src; }); }

  // Where the viewer is looking: the mouse when there is one, a slow drift otherwise. On phones the
  // gyro steers: turning the phone left or right pans, tipping it tilts, measured from however it is
  // being held so any grip is "straight ahead". A sideways drag across the header also looks around.
  var target = [0, 0], look = [0, 0], lastInput = -1e9, snappy = false;
  function clamp(v){ return Math.max(-1, Math.min(1, v)); }
  function wrap(d){ return ((d + 540) % 360) - 180; }
  window.addEventListener('pointermove', function(e){
    if (e.pointerType !== 'mouse') return;
    target[0] = e.clientX / window.innerWidth * 2 - 1;
    target[1] = e.clientY / window.innerHeight * 2 - 1;
    lastInput = performance.now(); snappy = false;
  }, { passive: true });

  var rest = null, dragging = false, gyro = false;
  window.addEventListener('deviceorientation', function(e){
    if (e.gamma == null || e.beta == null) return;
    if (!gyro){ gyro = true; if (ask) ask.remove(); }
    if (dragging) return;
    var angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
    var x = e.gamma, y = e.beta, yaw = e.alpha || 0;   // portrait: side tilt, front-back tilt, turn
    if (angle === 90){ x = e.beta; y = -e.gamma; }     // landscape, either way round
    else if (angle === -90 || angle === 270){ x = -e.beta; y = e.gamma; }
    if (!rest) rest = [x, y, yaw];
    rest[0] += (x - rest[0]) * 0.004; rest[1] += (y - rest[1]) * 0.004;   // let a new grip become the centre
    rest[2] = (rest[2] + wrap(yaw - rest[2]) * 0.004 + 360) % 360;
    // turning left raises alpha and should look left
    target[0] = clamp((x - rest[0]) / 12 - wrap(yaw - rest[2]) / 20);
    target[1] = clamp((y - rest[1]) / 12);
    lastInput = performance.now(); snappy = true;
  }, { passive: true });

  var intro = sky.parentElement, from = null;
  intro.style.touchAction = 'pan-y';
  intro.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'mouse') return;
    from = { x: e.clientX, look: look[0] }; dragging = true;
  });
  intro.addEventListener('pointermove', function(e){
    if (!from || e.pointerType === 'mouse') return;
    target[0] = clamp(from.look - (e.clientX - from.x) / (window.innerWidth * 0.5));
    lastInput = performance.now(); snappy = false;
  }, { passive: true });
  function release(){ from = null; dragging = false; rest = null; }
  intro.addEventListener('pointerup', release);
  intro.addEventListener('pointercancel', release);

  // iPhone only shares the gyro once the visitor allows it, and Safari only asks in answer to a tap.
  // If no readings have arrived shortly after load, offer a button that asks.
  var DOE = window.DeviceOrientationEvent, ask = null;
  if (DOE && typeof DOE.requestPermission === 'function' && matchMedia('(pointer: coarse)').matches){
    setTimeout(function(){
      if (gyro) return;
      ask = document.createElement('button');
      ask.type = 'button'; ask.className = 'sky-gyro';
      ask.textContent = 'Move your phone to look around';
      ask.addEventListener('click', function(){
        DOE.requestPermission().then(function(){ ask.remove(); }, function(){ ask.remove(); });
      });
      intro.appendChild(ask);
    }, 800);
  }

  var visible = true, running = false, prev = 0;
  function frame(t){
    if (!visible || document.hidden){ running = false; return; }
    var dt = Math.min(64, t - (prev || t)); prev = t;
    if (t - lastInput > 4000){
      var s = t / 1000;
      target[0] = Math.sin(s * 0.23) * 0.8;
      target[1] = Math.sin(s * 0.15 + 1) * 0.5;
    }
    var k = 1 - Math.pow(snappy ? 0.8 : 0.95, dt / 16.7);   // the gyro is already smooth, so follow it closely
    look[0] += (target[0] - look[0]) * k;
    look[1] += (target[1] - look[1]) * k;
    var r = sky.getBoundingClientRect();
    var dolly = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
    scene.style.transform = 'translateZ(' + (dolly * DOLLY).toFixed(1) + 'px) rotateX(' + (look[1] * TURN * 0.6).toFixed(3) + 'deg) rotateY(' + (-look[0] * TURN).toFixed(3) + 'deg)';
    requestAnimationFrame(frame);
  }
  function start(){ if (!running && visible && !document.hidden){ running = true; prev = 0; requestAnimationFrame(frame); } }

  Promise.all([load(asset('aurora-sky.jpg')), load(asset('aurora-trees.webp'))]).then(function(){
    sky.appendChild(scene);
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ visible = es[0].isIntersecting; start(); }).observe(sky);
    }
    document.addEventListener('visibilitychange', start);
    start();
    requestAnimationFrame(function(){ sky.classList.add('live'); });
  }).catch(function(){});
})();
