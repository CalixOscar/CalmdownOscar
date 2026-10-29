// Home aurora header, moving (docs/PLAN-aurora-motion.md). Draws the header photo in WebGL2 from its two
// layers (assets/aurora-sky.jpg, the sky with the trees painted out, and assets/aurora-trees.webp, the trees
// cut out). A fold travels sideways through the aurora curtain and its rays lean with it; the trees are never
// moved. Mouse, gyro and drag still look around (2D parallax), and scrolling moves in.
// Skipped for reduced motion: the flat photo in the CSS stays. Without WebGL2, or if anything here fails,
// it hands over to sky3d.js, the still CSS 3D version used on the other aurora pages.
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sky = document.querySelector('.sky');
  if (!sky) return;

  var here = document.currentScript && document.currentScript.src;   // images sit beside this script
  function asset(name){ return here ? new URL(name, here).href : 'assets/' + name; }
  var failed = false;
  function fallback(){
    if (failed) return;
    failed = true;
    if (ask) ask.remove();   // sky3d.js offers its own
    var s = document.createElement('script');
    s.src = asset('sky3d.js');
    document.head.appendChild(s);
  }

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;z-index:0;opacity:0;transition:opacity 1s ease';
  var gl = canvas.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: false });
  if (!gl){ fallback(); return; }

  var VERT = '#version 300 es\n' +
    // one big triangle covers the screen: (-1,-1) (3,-1) (-1,3)
    'void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }';

  var FRAG = '#version 300 es\n' +
    'precision highp float;\nprecision highp sampler2D;\n' +
    'uniform sampler2D uSky, uTrees;\n' +
    'uniform vec2 uRes, uLook;\n' +                  // canvas size in pixels, where the viewer looks (-1..1)
    'uniform float uTime, uAmp, uAspect, uDolly;\n' + // seconds, motion on/off, image width/height, scroll move-in (0..1)
    'out vec4 o;\n' +
    'const vec2 CORONA = vec2(0.54, 0.24);\n' +      // where the rays meet, in image uv (top-left origin)
    'float hash(vec2 p){ vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }\n' +
    'float vnoise(vec2 p){\n' +
    '  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);\n' +
    '  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);\n' +
    '}\n' +
    'float fbm(vec2 p){\n' +
    '  float s = 0.0, a = 0.5;\n' +
    '  for (int i = 0; i < 4; i++){ s += a * vnoise(p); p = p * 2.03 + vec2(17.1, 9.7); a *= 0.5; }\n' +
    '  return s;\n' +
    '}\n' +
    // screen position (0..1, top-left) to image uv: cover-fit at 50% 46%, zoomed in about the middle of what is visible
    'vec2 place(vec2 p, float zoom, vec2 shift){\n' +
    '  float ca = uRes.x / uRes.y;\n' +
    '  vec2 vis = ca > uAspect ? vec2(1.0, uAspect / ca) : vec2(ca / uAspect, 1.0);\n' +
    '  vec2 mid = (1.0 - vis) * vec2(0.5, 0.46) + 0.5 * vis;\n' +
    '  return mid + (p - 0.5) * vis / zoom + shift;\n' +
    '}\n' +
    'void main(){\n' +
    '  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uRes;\n' +
    '  vec2 sUv = place(p, 1.08 * (1.0 + 0.02 * uDolly), uLook * 0.012);\n' +   // 8% overscan so shifts never show an edge
    '  vec2 tUv = place(p, 1.08 * (1.0 + 0.06 * uDolly), uLook * 0.03);\n' +    // trees shift and zoom more: nearer
    // where the aurora is: bright and coloured, from a blurred copy so single stars and dark sky stay put
    '  vec3 b = textureLod(uSky, sUv, 4.5).rgb;\n' +
    '  float mx = max(b.r, max(b.g, b.b)), mn = min(b.r, min(b.g, b.b));\n' +
    '  float mask = smoothstep(0.06, 0.35, dot(b, vec3(0.299, 0.587, 0.114))) * smoothstep(0.05, 0.25, (mx - mn) / max(mx, 0.001));\n' +
    // rays run outward from the corona; curtains sway sideways across them (isotropic units: x scaled by aspect)
    '  vec2 asp = vec2(uAspect, 1.0);\n' +
    '  vec2 q = (sUv - CORONA) * asp;\n' +
    '  float dist = length(q);\n' +
    '  vec2 dir = q / max(dist, 1e-4);\n' +
    '  vec2 side = vec2(-dir.y, dir.x);\n' +
    '  float ang = atan(q.x, q.y);\n' +
    // straight above the corona the angle wraps from +pi to -pi; keep that line still so no seam shows
    '  float k = uAmp * mask * smoothstep(0.05, 0.2, dist) * smoothstep(-0.97, -0.75, cos(ang));\n' +
    // A curtain, not light shafts: a fold travels sideways through it and bends along its length, and the
    // rays all lean together as it passes. Whole numbers of waves round the corona, so the sines meet up.
    '  float drift = (fbm(vec2(ang * 1.5, uTime * 0.04)) - 0.5) * 2.0;\n' +
    '  float w = ang * 4.0 - uTime * 0.45 + dist * 2.2 + drift;\n' +
    '  float fold = sin(w) + 0.4 * sin(w * 2.0 + 1.7 - uTime * 0.2);\n' +
    '  vec3 c = texture(uSky, sUv + side * (fold * 0.022 * k) / asp).rgb;\n' +
    // rays: fixed streaks in the curtain that bend with the fold; nothing runs down them
    '  float r = fbm(vec2((ang + fold * 0.05 * k) * 26.0, dist * 1.2));\n' +
    '  float clumps = smoothstep(0.35, 0.7, fbm(vec2(ang * 5.0 - uTime * 0.03, dist * 0.8 + 3.0)));\n' +   // rays bunch, not an even fan
    '  float rays = smoothstep(0.3, 0.85, r) * clumps;\n' +
    // a broad band of brightness sweeps across the curtain, and the rays light up most inside it
    '  float surge = smoothstep(0.2, 1.0, 0.5 + 0.5 * sin(ang * 2.0 - uTime * 0.3 + drift));\n' +
    '  c *= 1.0 + k * (rays * (0.15 + 0.35 * surge) + surge * 0.14 - 0.08);\n' +
    '  vec4 t = texture(uTrees, tUv);\n' +                                     // premultiplied, never displaced
    '  o = vec4(c * (1.0 - t.a) + t.rgb, 1.0);\n' +
    '}';

  function shader(type, src){
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  var vs = shader(gl.VERTEX_SHADER, VERT), fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs){ fallback(); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)){ fallback(); return; }
  gl.useProgram(prog);
  var U = {};
  ['uSky', 'uTrees', 'uRes', 'uLook', 'uTime', 'uAmp', 'uAspect', 'uDolly'].forEach(function(n){ U[n] = gl.getUniformLocation(prog, n); });

  function load(src){ return new Promise(function(ok, fail){ var i = new Image(); i.onload = function(){ ok(i); }; i.onerror = fail; i.src = src; }); }
  function texture(unit, img, premultiply){
    var t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply);   // premultiplied trees keep clean edges in the mips
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

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
      if (gyro || failed) return;
      ask = document.createElement('button');
      ask.type = 'button'; ask.className = 'sky-gyro';
      ask.textContent = 'Move your phone to look around';
      ask.addEventListener('click', function(){
        DOE.requestPermission().then(function(){ ask.remove(); }, function(){ ask.remove(); });
      });
      intro.appendChild(ask);
    }, 800);
  }

  // Canvas size follows the header, at most 1.5 device pixels per CSS pixel.
  var aspect = 0.75;   // image width / height (1500 x 2000)
  function size(){
    var d = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.max(1, Math.round(sky.clientWidth * d)), h = Math.max(1, Math.round(sky.clientHeight * d));
    if (w === canvas.width && h === canvas.height) return false;
    canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
    return true;
  }

  var clock = 0;
  function draw(){
    var r = sky.getBoundingClientRect();
    var dolly = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uLook, look[0], look[1]);
    gl.uniform1f(U.uTime, clock);
    gl.uniform1f(U.uAmp, 1);
    gl.uniform1f(U.uAspect, aspect);
    gl.uniform1f(U.uDolly, dolly);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  var visible = true, running = false, prev = 0;
  function frame(t){
    if (!visible || document.hidden){ running = false; return; }
    var dt = Math.min(64, t - (prev || t)); prev = t;
    clock += dt / 1000;   // our own clock, so pausing off-screen does not make the aurora jump
    if (t - lastInput > 4000){
      var s = t / 1000;
      target[0] = Math.sin(s * 0.23) * 0.35;   // gentler than the live header: the aurora carries the motion now
      target[1] = Math.sin(s * 0.15 + 1) * 0.2;
    }
    var k = 1 - Math.pow(snappy ? 0.8 : 0.95, dt / 16.7);   // the gyro is already smooth, so follow it closely
    look[0] += (target[0] - look[0]) * k;
    look[1] += (target[1] - look[1]) * k;
    size();
    draw();
    requestAnimationFrame(frame);
  }
  function start(){ if (!running && visible && !document.hidden){ running = true; prev = 0; requestAnimationFrame(frame); } }

  Promise.all([load(asset('aurora-sky.jpg')), load(asset('aurora-trees.webp'))]).then(function(imgs){
    texture(0, imgs[0], false); texture(1, imgs[1], true);
    gl.uniform1i(U.uSky, 0); gl.uniform1i(U.uTrees, 1);
    aspect = imgs[0].naturalWidth / imgs[0].naturalHeight;
    size(); draw();
    if (gl.getError() !== gl.NO_ERROR){ fallback(); return; }
    sky.insertBefore(canvas, sky.firstChild);    // under the ::after gradient (z-index 1)
    window.addEventListener('resize', function(){ if (size()) draw(); });
    canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); visible = false; canvas.remove(); fallback(); });
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ visible = es[0].isIntersecting; start(); }).observe(sky);
    }
    document.addEventListener('visibilitychange', start);
    start();
    requestAnimationFrame(function(){ sky.classList.add('live'); canvas.style.opacity = '1'; });
  }).catch(fallback);
})();
