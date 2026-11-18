/* Rodeo 419 Marketing — progressive enhancement.
   The site is complete without this file. It adds:
   - the mobile menu (button, Escape, focus kept inside while open)
   - scroll reveals (IntersectionObserver)
   - hero drift, featured-work sequence, and process line (one rAF scroll loop)
   - the "Photo guides" toggle in the preview bar
   Motion uses transform/opacity only and is skipped for prefers-reduced-motion.
   Nothing is stored in the browser. */
(function () {
  'use strict';
  window.r419 = true;
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* Mobile menu ----------------------------------------------------------- */
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-menu]');
  var header = document.querySelector('[data-header]');
  var label = document.querySelector('[data-menu-label]');
  var mq = window.matchMedia('(max-width: 899px)');
  if (toggle && menu) {
    toggle.hidden = false;
    var setOpen = function (open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
      doc.classList.toggle('menu-open', open);
      if (label) label.textContent = open ? 'Close' : 'Menu';
      if (open) {
        menu.style.setProperty('--nav-top', header.getBoundingClientRect().bottom + 'px');
        var first = menu.querySelector('a');
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { setOpen(false, true); return; }
      if (e.key === 'Tab') {
        // Keep focus within the toggle + menu while the menu covers the page.
        var items = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll('a')));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    var onMq = function () { if (!mq.matches) setOpen(false); };
    mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
  }

  /* Photo guides (preview only) ------------------------------------------- */
  var guides = document.querySelector('[data-guides-toggle]');
  if (guides && document.querySelector('.guides')) {
    guides.hidden = false;
    guides.addEventListener('click', function () {
      var on = guides.getAttribute('aria-pressed') !== 'true';
      guides.setAttribute('aria-pressed', String(on));
      doc.classList.toggle('show-guides', on);
    });
  }

  /* Reveals ---------------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduce.matches || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Scroll-linked motion ---------------------------------------------------- */
  var heroFrame = document.querySelector('[data-hero]');
  var heroDrift = document.querySelector('[data-hero-drift]');
  var features = Array.prototype.slice.call(document.querySelectorAll('[data-feature]'));
  var timelines = Array.prototype.slice.call(document.querySelectorAll('[data-timeline]'));

  function update() {
    var vh = window.innerHeight;

    // Hero: the image drifts inside its frame (never the text).
    if (heroFrame && heroDrift) {
      var r = heroFrame.getBoundingClientRect();
      if (r.bottom > 0) {
        var p = clamp(-r.top / r.height, 0, 1);
        heroDrift.style.setProperty('--drift', (p * 48).toFixed(1) + 'px');
      }
    }

    // Featured work: --enter as the panel arrives, then the phone rises,
    // then a slow --hold drift while the panel is pinned.
    features.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > vh + 50) return;
      var enter = clamp((vh - r.top) / (vh * 0.85), 0, 1);
      var phone = clamp((enter - 0.35) / 0.65, 0, 1);
      var range = Math.max(r.height - vh, 1);
      var hold = clamp(-r.top / range, 0, 1);
      el.style.setProperty('--enter', enter.toFixed(3));
      el.style.setProperty('--phone', phone.toFixed(3));
      el.style.setProperty('--hold', hold.toFixed(3));
    });

    // Process: the line grows as the section passes the middle of the screen
    // and each step lights up when the line reaches it.
    timelines.forEach(function (tl) {
      var r = tl.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var horizontal = window.matchMedia('(min-width: 1000px)').matches;
      var line = horizontal
        ? clamp((vh * 0.85 - r.top) / (vh * 0.55), 0, 1)
        : clamp((vh * 0.7 - r.top) / r.height, 0, 1);
      tl.style.setProperty('--line', line.toFixed(3));
      var steps = tl.querySelectorAll('[data-step]');
      steps.forEach(function (s, i) {
        var at = horizontal ? i / steps.length : (s.offsetTop) / r.height;
        s.classList.toggle('is-on', line > at + 0.02 || line >= 0.999);
      });
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }

  function start() {
    if (reduce.matches) {
      // Final composition, no scroll-linked movement.
      timelines.forEach(function (tl) { tl.querySelectorAll('[data-step]').forEach(function (s) { s.classList.add('is-on'); }); });
      return;
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
  start();
  var onReduce = function () {
    if (reduce.matches) {
      window.removeEventListener('scroll', onScroll);
      features.forEach(function (el) { ['--enter', '--phone', '--hold'].forEach(function (k) { el.style.removeProperty(k); }); });
      if (heroDrift) heroDrift.style.removeProperty('--drift');
      timelines.forEach(function (tl) { tl.style.removeProperty('--line'); tl.querySelectorAll('[data-step]').forEach(function (s) { s.classList.add('is-on'); }); });
      revealEls.forEach(function (el) { el.classList.add('is-in'); });
    } else { start(); }
  };
  reduce.addEventListener ? reduce.addEventListener('change', onReduce) : reduce.addListener(onReduce);
})();
