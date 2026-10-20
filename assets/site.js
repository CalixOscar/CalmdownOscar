// calmdownoscar — shared page behaviour: the visitor's cookie settings, the mobile menu, pinned media
// that's taller than the screen, and the home page idea field.
(function(){
  // Cookie settings (/cookies/), kept in this browser only. Visitor statistics are Vercel Web Analytics,
  // served from this domain and cookieless; they count unless the visitor switched them off or the browser
  // sends Global Privacy Control or Do Not Track. Embeds from other companies wait for a click unless the
  // visitor allowed them: any button marked data-consent-load is pressed for them.
  var CHOICES = 'cdo-choices-v1';
  var signal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  function choices(){
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(CHOICES)); } catch (e) {}
    saved = saved || {};
    return { stats: typeof saved.stats === 'boolean' ? saved.stats : !signal, embeds: saved.embeds === true, savedOn: saved.on || null };
  }
  window.cdoChoices = {
    get: choices,
    signal: signal,
    set: function(c){
      try { localStorage.setItem(CHOICES, JSON.stringify({ stats: !!c.stats, embeds: !!c.embeds, on: new Date().toISOString().slice(0, 10) })); return true; }
      catch (e) { return false; }
    }
  };
  var chosen = choices();
  if (chosen.stats && location.protocol === 'https:'){
    window.va = window.va || function(){ (window.vaq = window.vaq || []).push(arguments); };
    var va = document.createElement('script');
    va.defer = true;
    va.src = '/_vercel/insights/script.js';
    document.head.appendChild(va);
  }
  if (chosen.embeds) document.querySelectorAll('[data-consent-load]').forEach(function(b){ b.click(); });


  // Pinned media (.case.hold) sticks just under the top bar. One taller than the screen would never
  // show its bottom, so it pins by its bottom edge instead: it scrolls until it's all in view, then holds.
  var pins = document.querySelectorAll('.case.hold .case-media > :first-child');
  if (pins.length){
    var fit = function(){
      pins.forEach(function(el){
        el.style.top = '';
        if (getComputedStyle(el).position !== 'sticky') return;
        var top = parseFloat(getComputedStyle(el).top), room = window.innerHeight - 24;
        if (top + el.offsetHeight > room) el.style.top = (room - el.offsetHeight) + 'px';
      });
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('load', fit);   // once the screenshots have their real heights
  }

  // Mobile menu disclosure
  var top = document.querySelector('.top');
  var toggle = top && top.querySelector('.nav-toggle');
  if (toggle){
    var close = function(){
      if (!top.classList.contains('open')) return;
      top.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function(e){
      e.stopPropagation();
      var open = !top.classList.contains('open');
      top.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && top.classList.contains('open')){ close(); toggle.focus(); } });
    document.addEventListener('click', function(e){ if (!top.contains(e.target)) close(); });
    top.querySelectorAll('.nav a').forEach(function(a){ a.addEventListener('click', close); });
    window.addEventListener('resize', function(){ if (window.innerWidth >= 768) close(); });
  }

  // Idea field: save the first answer as an idea-clinic draft (this browser only),
  // then continue in the clinic. An empty submit just opens the clinic. Nothing goes in the URL.
  var form = document.getElementById('idea-start');
  if (form){
    var input = document.getElementById('idea-start-input');
    var note = document.getElementById('idea-start-note');
    var KEY = 'idea-clinic-draft-v3';
    var draft = null;
    try { draft = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (draft && draft.answers && draft.answers.idea && note){
      var link = document.createElement('a');
      link.href = '/idea-clinic/#continue';
      link.textContent = 'Continue your unfinished idea';
      note.textContent = '';
      note.append(link, ', or type a new one to start over.');
    }
    form.addEventListener('submit', function(e){
      var idea = input.value.trim();
      e.preventDefault();
      if (!idea){ location.href = '/idea-clinic/'; return; }
      try {
        localStorage.setItem(KEY, JSON.stringify({ answers:{ idea:idea }, unsure:{}, path:['idea','similar'], view:'interview' }));
        location.href = '/idea-clinic/#continue';
      } catch (err){ location.href = '/idea-clinic/'; }
    });
  }
})();
