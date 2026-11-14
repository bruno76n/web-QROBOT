/* Para talleres · scripts de las maquetas, sobre ../_base.js (utilidades, header y calculadora son compartidos).
   Mismas reglas de navegadores que _base.js (docs/24 §5): ES2017, sin ?. ni ??, sin innerHTML con datos.
   En la web real cada parte vive en su componente y arranca en astro:page-load (docs/07 §1). */
(function () {
  'use strict';

  var Q = window.QRM, $ = Q.$, $$ = Q.$$, onMedia = Q.onMedia;
  /* pesos sin centavos: 1490 → $1,490 */
  function pesos(n) { return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- menú de la barra del producto en celular: se cierra al tocar una liga ---------- */
  $$('.pmenu a').forEach(function (a) { a.addEventListener('click', function () { a.closest('details').open = false; }); });

  /* ---------- recorrido: pestañas en escritorio (siempre una abierta), acordeón en celular y tableta ---------- */
  var tour = $('[data-tour]');
  if (tour) {
    var wide = window.matchMedia('(min-width: 1100px)');
    var items = $$('.t-item', tour);
    var show = function (btn, open) {
      btn.setAttribute('aria-expanded', String(open));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
    };
    var openOnly = function (btn) { items.forEach(function (b) { show(b, b === btn); }); };
    items.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        if (wide.matches) openOnly(btn);
        else if (isOpen) show(btn, false);
        else openOnly(btn);
      });
      /* flechas arriba y abajo entre las pestañas */
      btn.addEventListener('keydown', function (e) {
        var i = items.indexOf(btn), to = null;
        if (e.key === 'ArrowDown') to = items[(i + 1) % items.length];
        if (e.key === 'ArrowUp') to = items[(i - 1 + items.length) % items.length];
        if (to) { e.preventDefault(); to.focus(); }
      });
    });
    /* al pasar a escritorio siempre queda una abierta */
    onMedia('(min-width: 1100px)', function () {
      if (wide.matches && !items.some(function (b) { return b.getAttribute('aria-expanded') === 'true'; })) openOnly(items[0]);
    });
  }

  /* ---------- planes: mensual o anual (misma lógica que src/lib/system/plans.ts) ---------- */
  var PLANS = window.PLANES || [];
  var period = 'monthly';
  function paintPrices() {
    $$('[data-plan-price]').forEach(function (el) {
      var p = PLANS.filter(function (x) { return x.id === el.getAttribute('data-plan-price'); })[0];
      var amt = el.querySelector('b'), per = el.querySelector('span'), yr = el.parentNode.querySelector('.price-yr');
      if (p.monthly === 0) { amt.textContent = '$0'; per.textContent = 'siempre'; if (yr) yr.textContent = ''; return; }
      if (period === 'monthly') { amt.textContent = pesos(p.monthly); per.textContent = 'al mes'; if (yr) yr.textContent = 'o ' + pesos(p.yearly) + ' al año'; }
      else { amt.textContent = pesos(p.yearly); per.textContent = 'al año'; if (yr) yr.textContent = 'Equivale a ' + pesos(p.yearly / 12) + ' al mes'; }
    });
  }
  $$('[data-period]').forEach(function (b) {
    b.addEventListener('click', function () {
      period = b.getAttribute('data-period');
      $$('[data-period]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      paintPrices(); finder();
    });
  });
  if (PLANS.length) paintPrices();

  /* ---------- ¿qué plan te toca? ---------- */
  /* plan que alcanza para el taller: el más barato cuyos límites cubren impresoras, personas y ventas y pedidos */
  function recommend(printers, people, orders) {
    var fits = PLANS.filter(function (p) {
      return (p.printers === null || printers <= p.printers) && people <= p.people && (p.orders === null || orders <= p.orders);
    });
    return fits.length ? fits[0] : PLANS[PLANS.length - 1];
  }
  var f = $('[data-finder]');
  function finder() {
    if (!f) return;
    var val = function (n) { return Number(f.querySelector('input[name="' + n + '"]').value); };
    var pr = val('printers'), pe = val('people'), or = val('orders');
    $$('input[type="range"]', f).forEach(function (i) {
      var max = Number(i.max), min = Number(i.min), v = Number(i.value);
      i.style.setProperty('--p', ((v - min) / (max - min) * 100) + '%');
      var o = f.querySelector('output[for="' + i.id + '"]');
      o.textContent = (v >= max ? v + ' o más' : String(v));
    });
    var p = recommend(pr, pe, or), free = PLANS[0];
    $('[data-f-name]').textContent = p.name;
    $('[data-f-amt]').textContent = p.monthly === 0 ? '$0, siempre' : (period === 'monthly' ? pesos(p.monthly) + ' al mes' : pesos(p.yearly) + ' al año');
    var why = $('[data-f-why]');
    while (why.firstChild) why.removeChild(why.firstChild);
    var lines = [];
    if (p.id === 'free') lines.push('Hasta ' + free.printers + ' impresoras, ' + free.people + ' persona y ' + free.orders + ' ventas y pedidos al mes');
    if (pr > free.printers) lines.push('Con ' + pr + (pr >= 20 ? ' o más' : '') + ' impresoras pagas lo mismo que con 1');
    if (pe > 2) lines.push('Más de 2 personas: roles para que cada quien vea lo suyo');
    else if (pe > free.people) lines.push('2 personas en la misma cuenta');
    if (or > free.orders) lines.push('Más de ' + free.orders + ' ventas y pedidos al mes');
    if (pe > PLANS[PLANS.length - 1].people) lines.push('Para más de ' + PLANS[PLANS.length - 1].people + ' personas, escríbenos por WhatsApp');
    lines.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; why.appendChild(li); });
    var cta = $('[data-f-cta]');
    cta.firstChild.nodeValue = p.id === 'free' ? 'Empezar gratis ' : 'Probar 14 días gratis ';
  }
  if (f) { f.addEventListener('input', finder); finder(); }

  /* ---------- descargar: el botón principal según el equipo (en la web lo decide el servidor) ---------- */
  var dl = $('[data-dl-main]');
  if (dl) {
    var ua = navigator.userAgent;
    var os = /iPhone|iPad|iPod|Android/.test(ua) ? 'mobile' : /Windows/.test(ua) ? 'windows' : /Macintosh|Mac OS X/.test(ua) ? 'mac' : 'other';
    var row = $('.plats li[data-os="' + os + '"]');
    var main = { mac: 'Descargar para Mac', windows: 'Descargar para Windows', mobile: 'Abrir en el navegador', other: 'Abrir en el navegador' }[os];
    dl.firstChild.nodeValue = main + ' ';
    if (os === 'mobile' || os === 'other') $('[data-dl-alt]').hidden = true;
    if (row) { row.classList.add('on'); var rec = row.querySelector('.rec'); if (rec) rec.hidden = false; }
    var req = $('[data-dl-req="' + os + '"]'); if (req) req.hidden = false;
  }
})();
