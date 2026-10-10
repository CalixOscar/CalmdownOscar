// calmdownoscar — shared page behaviour: the mobile menu, and the home page idea field.
(function(){
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
