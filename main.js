(function () {
  'use strict';

  /* Menu mobile */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('menu-principale');

  function setMenu(open, returnFocus) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    if (!open && returnFocus) toggle.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) setMenu(false);
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function () { setMenu(false); });
  }

  /* FAQ */
  document.querySelectorAll('.faq__question').forEach(function (button) {
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    panel.dataset.collapsed = String(button.getAttribute('aria-expanded') !== 'true');
    button.addEventListener('click', function () {
      var open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      panel.dataset.collapsed = String(open);
    });
  });

  /* Modulo di contatto */
  var form = document.querySelector('.contact-form');
  if (form) {
    var status = form.querySelector('.contact-form__status');
    var submit = form.querySelector('[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var endpoint = form.dataset.endpoint;
      if (!endpoint) {
        status.textContent = 'Il modulo è in fase di attivazione: il messaggio non è stato inviato. Per ora puoi scrivermi su Instagram, @radica.yoga.';
        return;
      }
      submit.disabled = true;
      status.textContent = 'Invio in corso…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (response) {
          if (!response.ok) throw new Error('invio non riuscito');
          form.reset();
          status.textContent = 'Grazie, ho ricevuto il tuo messaggio. Ti rispondo appena posso.';
        })
        .catch(function () {
          status.textContent = 'Il messaggio non è partito. Riprova tra poco oppure scrivimi su Instagram, @radica.yoga.';
        })
        .finally(function () { submit.disabled = false; });
    });
  }

  /* Come funziona: la linea si disegna allo scorrimento */
  var wrap = document.querySelector('.timeline-wrap');
  if (wrap) {
    var steps = Array.prototype.slice.call(wrap.querySelectorAll('.timeline__step'));
    var last = steps[steps.length - 1];
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ticking = false;

    var paint = function (p) {
      wrap.style.setProperty('--p', p.toFixed(4));
      var current = -1;
      steps.forEach(function (step, i) {
        var active = i === 0 ? p > 0.001 : p >= i / (steps.length - 1) - 0.004;
        step.classList.toggle('is-active', active);
        if (active) current = i;
      });
      steps.forEach(function (step, i) { step.classList.toggle('is-current', i === current); });
    };

    var update = function () {
      ticking = false;
      var r = wrap.getBoundingClientRect();
      var vh = window.innerHeight;
      var start = vh * 0.8;
      var end = vh * 0.55;
      paint(Math.min(1, Math.max(0, (start - r.top) / (r.height + start - end))));
    };

    var measure = function () {
      wrap.style.setProperty('--line-bottom', (last.offsetHeight - 24) + 'px');
      if (reduced) paint(1); else update();
    };

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    if (!reduced) {
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
      }, { passive: true });
    }
  }

  /* Reveal */
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  items.forEach(function (el) { observer.observe(el); });
})();
