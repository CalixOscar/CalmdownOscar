// Home headline: a toddler crawls in along the bottom of the aurora, stands, jumps up to snatch the
// full stop after "Mac", lands and runs off with it.
// Artwork: assets/toddler/ (generated illustration and clips, cut into looping strips: crawl 8 frames, run 7).
// The stop stays in the text for screen readers; only its glyph is hidden once taken.
// Skipped for reduced motion, and the sentence keeps its full stop.
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('animate' in Element.prototype)) return;
  var h1 = document.querySelector('.hero-line');
  var intro = h1 && h1.closest('.intro');
  if (!intro) return;

  var CRAWL = { frames: 8, w: 227, h: 160, grab: 6, hand: 0.09 };   // grab frame: leading hand flat on the ground
  var RUN = { frames: 7, w: 120, h: 180, fistX: 0.84, fistY: 0.44 };   // the stop is clutched in front of his chest

  function splitStop(){
    // motion.js wraps the words in .w spans; the period ends the last one.
    var words = h1.querySelectorAll('.w');
    var host = words.length ? words[words.length - 1] : h1;
    var text = host.lastChild;
    if (!text || text.nodeType !== 3 || !/\.$/.test(text.nodeValue)) return null;
    text.nodeValue = text.nodeValue.slice(0, -1);
    var stop = document.createElement('span');
    stop.className = 'stop';
    stop.textContent = '.';
    var probe = document.createElement('i');
    probe.className = 'baseline-probe';
    stop.appendChild(probe);
    host.appendChild(stop);
    return stop;
  }

  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  function load(src){ return new Promise(function(ok, fail){ var i = new Image(); i.onload = ok; i.onerror = fail; i.src = src; }); }

  async function run(){
    var stop = splitStop();
    if (!stop) return;
    var fs = parseFloat(getComputedStyle(h1).fontSize);

    var lane = document.createElement('div');
    lane.className = 'toddler-lane';
    lane.setAttribute('aria-hidden', 'true');
    lane.innerHTML = '<div class="toddler crawl"></div><div class="toddler runner"><div class="kid"><span class="loot"></span></div></div>';
    intro.appendChild(lane);
    var crawl = lane.children[0], runner = lane.children[1], loot = runner.querySelector('.loot');

    // sizes in CSS px
    var cH = fs * 0.78, cW = cH * CRAWL.w / CRAWL.h;
    var rH = fs * 1.05, rW = rH * RUN.w / RUN.h;
    crawl.style.cssText = 'width:' + cW + 'px;height:' + cH + 'px;background-size:' + (cW * CRAWL.frames) + 'px ' + cH + 'px';
    crawl.style.setProperty('--strip', -(cW * CRAWL.frames) + 'px');
    runner.style.cssText = 'width:' + rW + 'px;height:' + rH + 'px';
    var kid = runner.querySelector('.kid');
    kid.style.backgroundSize = (rW * RUN.frames) + 'px ' + rH + 'px';
    kid.style.setProperty('--strip', -(rW * RUN.frames) + 'px');
    var dot = fs * 0.12;
    loot.style.cssText = 'width:' + dot + 'px;height:' + dot + 'px;left:' + (rW * RUN.fistX - dot / 2) + 'px;top:' + (rH * RUN.fistY - dot / 2) + 'px';

    var L = lane.getBoundingClientRect();
    var s = stop.getBoundingClientRect(), base = stop.querySelector('.baseline-probe').getBoundingClientRect();
    var dotX = (s.left + s.width / 2) - L.left;
    var dotY = base.bottom - L.top - fs * 0.07;               // centre of the full stop, just above the baseline
    var ground = L.height - Math.max(14, fs * 0.2);           // the bottom of the aurora
    var cy = ground - cH, ry = ground - rH;
    var hop = Math.max(rW * 0.7, fs * 0.5);                   // sideways travel up to the dot, and again down
    var peakX = dotX - rW * RUN.fistX, peakY = dotY - rH * RUN.fistY;   // fist on the dot
    var upX = peakX - hop;                                    // where he stands and jumps from
    var stopAt = upX - cW * 0.35;                              // crawls just past the dot (he crawls leftward)
    var from = L.width + 8;
    var speed = Math.max(110, fs * 2.6);                      // px per second
    var rise = Math.max(0, ry - peakY);
    var up = Math.min(620, 300 + rise * 0.6);                 // a higher jump takes a little longer

    function at(x, y, extra){ return 'translate(' + x + 'px,' + y + 'px)' + (extra || ''); }
    function slide(el, a, b, y, pxPerSec, easing){
      return el.animate(
        [{ transform: at(a, y) }, { transform: at(b, y) }],
        { duration: Math.abs(b - a) / pxPerSec * 1000, easing: easing || 'linear', fill: 'forwards' }
      ).finished;
    }

    // crawl in along the bottom of the header
    crawl.style.transform = at(from, cy);
    crawl.classList.add('go');
    await slide(crawl, from, stopAt, cy, speed * 0.64, 'cubic-bezier(.3,0,.6,1)');   // an unhurried crawl
    crawl.classList.remove('go');
    await wait(380);                                          // spots the dot

    // stand up, facing it
    runner.style.transform = at(upX, ry);
    crawl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
    await runner.animate([
      { opacity: 0, transform: at(upX, ry + rH * 0.12, ' scaleY(.86)') },
      { opacity: 1, transform: at(upX, ry - rH * 0.06), offset: 0.6 },
      { opacity: 1, transform: at(upX, ry) }
    ], { duration: 340, easing: 'ease-out', fill: 'forwards' }).finished;
    await wait(260);

    // crouch, then jump up to the dot
    await runner.animate([{ transform: at(upX, ry) }, { transform: at(upX, ry, ' scale(1.06,.84)') }],
      { duration: 160, easing: 'ease-in', fill: 'forwards' }).finished;
    await runner.animate([
      { transform: at(upX, ry, ' scale(1.06,.84)') },
      { transform: at(upX + hop * 0.3, ry - rise * 0.4, ' rotate(-6deg) scale(.94,1.1)'), offset: 0.3, easing: 'cubic-bezier(.2,.6,.4,1)' },
      { transform: at(peakX, peakY) }
    ], { duration: up, easing: 'cubic-bezier(.25,.8,.4,1)', fill: 'forwards' }).finished;

    // grab: the stop leaves the sentence and is in his fist
    stop.classList.add('taken');
    loot.style.opacity = 1;
    loot.animate([{ transform: 'scale(1.5)' }, { transform: 'none' }], { duration: 160, easing: 'ease-out' });
    await wait(90);

    // drop back down, land, and run
    var landX = peakX + hop;
    await runner.animate([
      { transform: at(peakX, peakY) },
      { transform: at(landX, ry, ' rotate(4deg)') }
    ], { duration: up * 0.85, easing: 'cubic-bezier(.55,0,.9,.6)', fill: 'forwards' }).finished;
    await runner.animate([
      { transform: at(landX, ry, ' scale(1.08,.82)') },
      { transform: at(landX, ry) }
    ], { duration: 200, easing: 'ease-out', fill: 'forwards' }).finished;

    runner.classList.add('go');
    await slide(runner, landX, L.width + 12, ry, speed * 2.1, 'cubic-bezier(.4,0,1,1)');
    lane.remove();
  }

  function whenReady(){
    var risen = h1.getAnimations ? h1.getAnimations({ subtree: true }).map(function(a){ return a.finished; }) : [];
    var fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    var art = [load('assets/toddler/toddler-crawl.webp'), load('assets/toddler/toddler-run.webp')];
    return Promise.all(risen.concat(fonts, art));
  }

  // Start once the headline is on screen, has finished rising, and the artwork has loaded.
  var io = new IntersectionObserver(function(entries){
    if (!entries[0].isIntersecting) return;
    io.disconnect();
    whenReady().then(function(){ return wait(450); }).then(run, function(){ /* artwork failed: leave the stop alone */ });
  }, { threshold: 0.6 });
  io.observe(h1);
})();
