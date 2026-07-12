/* ====== BOSQUE MEDITERRÁNEO — interacciones · Laura Llavador ====== */
(function(){
  "use strict";
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- intro ---- */
  window.addEventListener('load', function(){ document.body.classList.add('loaded'); });
  setTimeout(function(){ document.body.classList.add('loaded'); }, 1200); // fallback

  /* ---- scroll progress ---- */
  var progress = document.querySelector('.progress i');
  function onScroll(){
    if(progress){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ')';
    }
    if(nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  /* ---- Valencia clock ---- */
  var clock = document.getElementById('clock');
  function tick(){
    if(!clock) return;
    try{
      clock.textContent = new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Madrid'}).format(new Date());
    }catch(e){
      var d = new Date(); clock.textContent = ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);
    }
  }
  tick(); setInterval(tick, 30000);

  /* ---- theme: light por defecto, salvo que el usuario elija dark explícitamente ---- */
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var themeToggles = document.querySelectorAll('.theme-toggle');
  var THEME_BG = { light:'#F7F2E7', dark:'#0B110D' };
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    if(themeMeta) themeMeta.content = THEME_BG[t];
    themeToggles.forEach(function(b){ b.setAttribute('aria-checked', t === 'dark' ? 'true' : 'false'); });
  }
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
  themeToggles.forEach(function(btn){
    btn.addEventListener('click', function(){
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try{
        if(next === 'light') localStorage.removeItem('theme');
        else localStorage.setItem('theme', next);
      }catch(e){}
    });
  });

  /* ---- nav state ---- */
  var nav = document.getElementById('nav');
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---- mobile menu ---- */
  var burger = document.getElementById('burger');
  if(burger){
    burger.addEventListener('click', function(){
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open);
    });
    document.querySelectorAll('.mmenu a').forEach(function(a){
      a.addEventListener('click', function(){
        document.body.classList.remove('menu-open');
        burger.setAttribute('aria-expanded','false');
      });
    });
  }

  /* ---- stagger delays ---- */
  document.querySelectorAll('[data-stagger]').forEach(function(parent){
    var kids = parent.querySelectorAll(':scope > .reveal');
    kids.forEach(function(k,i){ k.style.transitionDelay = Math.min(i*80, 560) + 'ms'; });
  });

  /* ---- scroll reveals (incluye .bar-row para las barras) ---- */
  var revealEls = document.querySelectorAll('.reveal, .bar-row');
  if(reduce || !('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }else{
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:.14, rootMargin:'0px 0px -6% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* ---- counters ---- */
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    if(reduce){ el.textContent = target; return; }
    var dur = 1500, t0 = null;
    function step(t){
      if(!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if('IntersectionObserver' in window && !reduce){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
      });
    }, {threshold:.6});
    counters.forEach(function(c){ cio.observe(c); });
  }else{
    counters.forEach(function(c){ c.textContent = c.getAttribute('data-count'); });
  }

  /* ---- magnetic buttons ---- */
  if(fine && !reduce){
    document.querySelectorAll('.magnetic').forEach(function(el){
      el.style.transition = 'transform .35s cubic-bezier(.22,1,.36,1)';
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) * .28;
        var y = (e.clientY - r.top - r.height/2) * .28;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
    });
  }

  /* ---- custom cursor ---- */
  if(fine && !reduce){
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if(dot && ring){
      var mx = -100, my = -100, rx = -100, ry = -100;
      document.addEventListener('mousemove', function(e){
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      }, {passive:true});
      (function loop(){
        rx += (mx - rx) * .16; ry += (my - ry) * .16;
        ring.style.left = rx.toFixed(1) + 'px'; ring.style.top = ry.toFixed(1) + 'px';
        requestAnimationFrame(loop);
      })();
      document.querySelectorAll('a, button, .card, .tool, .chip, .step, .token').forEach(function(el){
        el.addEventListener('mouseenter', function(){ ring.classList.add('grow'); });
        el.addEventListener('mouseleave', function(){ ring.classList.remove('grow'); });
      });
    }
  }

  /* ---- hero blob parallax ---- */
  if(fine && !reduce){
    var hero = document.getElementById('hero');
    if(hero){
      var blobs = hero.querySelectorAll('.blob');
      var speeds = [26, 38, 52];
      hero.addEventListener('mousemove', function(e){
        var nx = e.clientX / window.innerWidth - .5;
        var ny = e.clientY / window.innerHeight - .5;
        blobs.forEach(function(b,i){
          b.style.setProperty('--px', (nx * (speeds[i] || 30)).toFixed(1));
          b.style.setProperty('--py', (ny * (speeds[i] || 30)).toFixed(1));
        });
      }, {passive:true});
    }
  }
})();
