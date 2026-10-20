// The home page's toddler drops by the other aurora headers. Set by data-toddler on the .intro:
//   peek — he pops up from behind the bottom of the aurora, has a good laugh, and ducks back down.
//   nap  — he runs in dangling his teddy, lies down with it and stays asleep for as long as the page is open.
//   hide — (404) he crawls across the aurora and out of sight, then peeks back up: the page is hiding with him.
// Artwork: assets/toddler/ (generated to match the home page sprites). Purely decorative, so the lane is
// aria-hidden. Reduced motion skips the peek and shows the nap already asleep, without the Zzz.
(function(){
  var intro = document.querySelector('.intro[data-toddler]');
  var h1 = intro && intro.querySelector('h1');
  if (!h1 || !('animate' in Element.prototype)) return;
  var scene = intro.getAttribute('data-toddler');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still && scene !== 'nap') return;
  var ART = document.currentScript.src.replace(/[^\/]*$/, '') + 'toddler/';

  var RUN = { frames: 7, w: 120, h: 180, fistX: 0.84, fistY: 0.44, stand: 3 };   // frame 3: both feet down
  var CRAWL = { src: 'toddler-crawl.webp', frames: 8, w: 227, h: 160 };   // the home page's crawl strip
  var PEEK = { src: 'toddler-peek.webp' };
  var NAP = { src: 'toddler-nap.webp', headX: 0.24, headY: 0.05 };   // where the Zzz rise from
  var TEDDY = { src: 'teddy.webp', pawX: 0.22, pawY: 0.04 };         // the paw he holds it by

  // He's drawn at the size he runs on the home page, whose headline is clamp(44px, 1.2rem + 6vw, 112px).
  function kidSize(){ return Math.max(44, Math.min(112, 19.2 + window.innerWidth * 0.06)) * 1.05; }

  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function load(src){ return new Promise(function(ok, fail){ var i = new Image(); i.onload = function(){ ok(i); }; i.onerror = fail; i.src = ART + src; }); }
  function at(x, y, extra){ return 'translate(' + x + 'px,' + y + 'px)' + (extra || ''); }
  function art(img, cls, h){
    var el = document.createElement('img');
    el.src = img.src; el.alt = ''; el.className = 'toddler ' + cls;
    el.style.height = h + 'px'; el.style.width = (h * img.naturalWidth / img.naturalHeight) + 'px';
    return el;
  }

  function lane(){
    var l = document.createElement('div');
    l.className = 'toddler-lane';
    l.setAttribute('aria-hidden', 'true');
    intro.appendChild(l);
    return l;
  }

  // ---- Apps: peek, laugh, hide ----
  async function peek(img){
    var l = lane(), L = l.getBoundingClientRect();
    var h = Math.max(51, kidSize() * 0.76);
    var el = art(img, 'peek', h), w = parseFloat(el.style.width);
    var x = Math.min(L.width - w - 16, L.width * (L.width < 700 ? 0.7 : 0.76) - w / 2);
    var hidden = L.height + 2, up = L.height - h;          // the bottom edge of the aurora is his ledge
    el.style.transform = at(x, hidden);
    l.appendChild(el);

    await el.animate([
      { transform: at(x, hidden) },
      { transform: at(x, up - h * 0.06), offset: 0.7 },
      { transform: at(x, up) }
    ], { duration: 720, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }).finished;
    await wait(220);
    // the giggle: little shakes and hops
    await el.animate([
      { transform: at(x, up) },
      { transform: at(x, up - h * 0.05, ' rotate(-5deg)') },
      { transform: at(x, up, ' rotate(4deg)') },
      { transform: at(x, up - h * 0.05, ' rotate(-4deg)') },
      { transform: at(x, up, ' rotate(5deg)') },
      { transform: at(x, up - h * 0.04, ' rotate(-3deg)') },
      { transform: at(x, up) }
    ], { duration: 1500, easing: 'ease-in-out', iterations: 1, fill: 'forwards' }).finished;
    await wait(700);
    await el.animate([{ transform: at(x, up) }, { transform: at(x, hidden) }],
      { duration: 380, easing: 'cubic-bezier(.5,0,.9,.5)', fill: 'forwards' }).finished;
    l.remove();
  }

  // ---- 404: crawl across and out of sight, then peek back up ----
  async function hide(peekImg){
    var l = lane(), L = l.getBoundingClientRect();
    var fs = kidSize() / 1.05;                                 // the home headline's font size
    var cH = fs * 0.78, cW = cH * CRAWL.w / CRAWL.h;           // crawling, at the size he crawls on the home page
    var cy = L.height - Math.max(14, fs * 0.2) - cH;
    var crawl = document.createElement('div');
    crawl.className = 'toddler crawl';
    crawl.style.cssText = 'width:' + cW + 'px;height:' + cH + 'px;background-size:' + (cW * CRAWL.frames) + 'px ' + cH + 'px';
    crawl.style.setProperty('--strip', -(cW * CRAWL.frames) + 'px');
    l.appendChild(crawl);

    var from = L.width + 8, mid = L.width * 0.42, out = -cW - 8;
    var speed = Math.max(180, fs * 4.4);                       // px per second, brisker than the home crawl
    crawl.classList.add('go');
    await crawl.animate([{ transform: at(from, cy) }, { transform: at(mid, cy) }],
      { duration: (from - mid) / speed * 1000, easing: 'cubic-bezier(.3,0,.6,1)', fill: 'forwards' }).finished;
    crawl.classList.remove('go');
    await wait(700);                                           // has a look round for the page
    crawl.classList.add('go');
    await crawl.animate([{ transform: at(mid, cy) }, { transform: at(out, cy) }],
      { duration: (mid - out) / speed * 1000, easing: 'cubic-bezier(.4,0,.8,1)', fill: 'forwards' }).finished;
    l.remove();
    await wait(800);
    await peek(peekImg);
  }

  // ---- How I work: run in with the teddy, lie down, sleep ----
  async function nap(sleeper, teddy){
    var l = lane(), L = l.getBoundingClientRect();
    var rH = kidSize(), rW = rH * RUN.w / RUN.h;
    var ground = L.height - Math.max(14, rH * 0.18);
    // asleep: a slow breath, and Zzz drifting up from his head (in the wrapper, so the breath doesn't squash them)
    var nH = rH * 0.62, body = art(sleeper, '', nH), nW = parseFloat(body.style.width);
    body.className = 'body';
    var holder = document.createElement('div');
    holder.className = 'toddler nap';
    holder.style.cssText = 'width:' + nW + 'px;height:' + nH + 'px';
    holder.appendChild(body);
    var spot = Math.min(L.width - nW - 16, L.width * (L.width < 700 ? 0.55 : 0.68));   // where he lies down
    var ny = ground - nH;
    function settle(){
      holder.style.transform = at(spot, ny);
      if (still) return;
      body.animate([{ scale: '1 1' }, { scale: '1 1.025' }], { duration: 1900, easing: 'ease-in-out', direction: 'alternate', iterations: Infinity });
      for (var i = 0; i < 3; i++){
        var z = document.createElement('span');
        z.className = 'zz'; z.textContent = 'z'; z.style.setProperty('--i', i);
        z.style.fontSize = Math.max(12, rH * 0.2) + 'px';
        z.style.left = (nW * NAP.headX) + 'px'; z.style.top = (nH * NAP.headY - rH * 0.25) + 'px';
        holder.appendChild(z);
      }
    }

    if (still){ l.appendChild(holder); settle(); return; }

    // the runner from the home page, teddy dangling from his fist
    var runner = document.createElement('div');
    runner.className = 'toddler runner';
    runner.style.cssText = 'width:' + rW + 'px;height:' + rH + 'px';
    runner.innerHTML = '<div class="kid"></div>';
    var kid = runner.firstChild;
    kid.style.backgroundSize = (rW * RUN.frames) + 'px ' + rH + 'px';
    kid.style.setProperty('--strip', -(rW * RUN.frames) + 'px');
    var tH = rH * 0.38, tW = tH * teddy.naturalWidth / teddy.naturalHeight;
    var bear = document.createElement('img');
    bear.src = teddy.src; bear.alt = ''; bear.className = 'teddy';
    bear.style.cssText = 'width:' + tW + 'px;height:' + tH + 'px;left:' + (rW * RUN.fistX - tW * TEDDY.pawX) + 'px;top:' + (rH * RUN.fistY - tH * TEDDY.pawY) + 'px';
    runner.appendChild(bear);
    l.appendChild(runner);

    var ry = ground - rH, from = -rW - tW, stop = spot + nW * 0.3 - rW / 2;
    var speed = Math.max(280, rH * 5.2);                      // px per second, as fast as he runs on the home page
    runner.classList.add('go');
    await runner.animate([{ transform: at(from, ry) }, { transform: at(stop, ry) }],
      { duration: (stop - from) / speed * 1000, easing: 'cubic-bezier(.2,.6,.5,1)', fill: 'forwards' }).finished;

    // stop, a big yawn-and-stretch, then down he goes
    runner.classList.remove('go');
    runner.style.opacity = 1;
    kid.style.backgroundPosition = -(rW * RUN.stand) + 'px 0';
    bear.style.animation = 'none';
    await wait(300);
    await runner.animate([
      { transform: at(stop, ry) },
      { transform: at(stop, ry, ' scale(.96,1.07)'), offset: 0.45 },
      { transform: at(stop, ry, ' scale(.96,1.07)'), offset: 0.7 },
      { transform: at(stop, ry) }
    ], { duration: 1100, easing: 'ease-in-out', fill: 'forwards' }).finished;
    await wait(200);
    runner.animate([
      { transform: at(stop, ry), opacity: 1 },
      { transform: at(stop, ry + rH * 0.25, ' scale(1,.7)'), opacity: 0 }
    ], { duration: 420, easing: 'ease-in', fill: 'forwards' });
    l.appendChild(holder);
    holder.style.transform = at(spot, ny);
    await holder.animate([
      { opacity: 0, transform: at(spot, ny - nH * 0.15) },
      { opacity: 1, transform: at(spot, ny) }
    ], { duration: 420, delay: 180, easing: 'ease-out', fill: 'backwards' }).finished;
    runner.remove();
    settle();
  }

  function whenReady(){
    var risen = h1.getAnimations ? h1.getAnimations({ subtree: true }).map(function(a){ return a.finished; }) : [];
    var fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    var art = scene === 'peek' ? [load(PEEK.src)]
      : scene === 'hide' ? [load(PEEK.src), load(CRAWL.src)]
      : [load(NAP.src), load(TEDDY.src), load('toddler-run.webp')];
    return Promise.all(art.concat(risen, fonts));
  }

  var io = new IntersectionObserver(function(entries){
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    whenReady().then(function(r){
      return wait(still ? 0 : 600).then(function(){ return scene === 'peek' ? peek(r[0]) : scene === 'hide' ? hide(r[0]) : nap(r[0], r[1]); });
    }, function(){ /* artwork failed: no visit today */ });
  }, { threshold: 0.6 });
  io.observe(h1);
})();
