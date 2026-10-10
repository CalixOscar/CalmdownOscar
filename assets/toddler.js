// Home headline: a toddler crawls in, steals the full stop after "Mac", stands up and runs off with it.
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
    var ground = base.bottom - L.top + fs * 0.02;            // knees and feet just on the baseline
    var dotX = (s.left + s.width / 2) - L.left;
    var cy = ground - cH, ry = ground - rH;
    var atDot = dotX - cW * CRAWL.hand;                       // leading hand over the full stop
    var from = L.width + 8;
    var speed = Math.max(110, fs * 2.6);                      // px per second

    function slide(el, a, b, y, pxPerSec, easing){
      return el.animate(
        [{ transform: 'translate(' + a + 'px,' + y + 'px)' }, { transform: 'translate(' + b + 'px,' + y + 'px)' }],
        { duration: Math.abs(b - a) / pxPerSec * 1000, easing: easing || 'linear', fill: 'forwards' }
      ).finished;
    }

    // crawl in
    crawl.style.transform = 'translate(' + from + 'px,' + cy + 'px)';
    crawl.classList.add('go');
    await slide(crawl, from, atDot, cy, speed * 0.7, 'cubic-bezier(.3,0,.6,1)');   // an unhurried crawl

    // reach: hold the frame with the hand on the dot
    crawl.classList.remove('go');
    crawl.style.backgroundPosition = -(cW * CRAWL.grab) + 'px 0';
    await wait(260);

    // grab: the stop lifts away
    await stop.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-.12em)', opacity: 0 }], { duration: 180, fill: 'forwards' }).finished;
    stop.classList.add('taken');
    await wait(220);

    // stand up, holding it
    var rx = dotX - rW * 0.2;               // just past the "c", fist forward
    runner.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
    crawl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' });
    await runner.animate([
      { opacity: 0, transform: 'translate(' + rx + 'px,' + (ry + rH * 0.12) + 'px) scaleY(.86)' },
      { opacity: 1, transform: 'translate(' + rx + 'px,' + (ry - rH * 0.06) + 'px)', offset: 0.6 },
      { opacity: 1, transform: 'translate(' + rx + 'px,' + ry + 'px)' }
    ], { duration: 340, easing: 'ease-out', fill: 'forwards' }).finished;
    await wait(140);

    // and run
    runner.classList.add('go');
    await slide(runner, rx, L.width + 12, ry, speed * 2.1, 'cubic-bezier(.4,0,1,1)');
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
