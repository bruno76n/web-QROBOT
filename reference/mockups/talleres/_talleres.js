/* Para talleres · scripts de las maquetas, sobre ../_base.js (utilidades y header son compartidos).
   Mismas reglas de navegadores que _base.js (docs/24 §5): ES2017, sin ?. ni ??, sin innerHTML con datos.
   Las pantallas del sistema no llevan script: son ilustraciones.
   En la web real cada parte vive en su componente y arranca en astro:page-load (docs/07 §1). */
(function () {
  'use strict';

  var Q = window.QRM, $ = Q.$, $$ = Q.$$;
  /* pesos sin centavos: 1490 → $1,490 */
  function pesos(n) { return '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- menú de la barra del producto en celular: se cierra al tocar una liga ---------- */
  $$('.pmenu a').forEach(function (a) { a.addEventListener('click', function () { a.closest('details').open = false; }); });

  /* ---------- planes: mensual o anual (misma lógica que src/lib/system/plans.ts) ---------- */
  var PLANS = window.PLANES || [];
  function paint(period) {
    $$('[data-plan-price]').forEach(function (el) {
      var p = PLANS.filter(function (x) { return x.id === el.getAttribute('data-plan-price'); })[0];
      if (!p || p.monthly === 0) return;
      var amt = el.querySelector('b'), per = el.querySelector('span'), yr = el.parentNode.querySelector('.price-yr');
      if (period === 'monthly') { amt.textContent = pesos(p.monthly); per.textContent = 'al mes'; yr.textContent = 'o ' + pesos(p.yearly) + ' al año'; }
      else { amt.textContent = pesos(p.yearly); per.textContent = 'al año'; yr.textContent = 'Equivale a ' + pesos(p.yearly / 12) + ' al mes'; }
    });
  }
  $$('[data-period]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-period]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      paint(b.getAttribute('data-period'));
    });
  });

  /* ---------- descargar: el botón principal según el equipo (en la web lo decide el servidor) ---------- */
  var dl = $('[data-dl-main]');
  if (dl) {
    var ua = navigator.userAgent;
    var os = /iPhone|iPad|iPod|Android/.test(ua) ? 'mobile' : /Windows/.test(ua) ? 'windows' : /Macintosh|Mac OS X/.test(ua) ? 'mac' : 'other';
    var main = { mac: 'Descargar para Mac', windows: 'Descargar para Windows', mobile: 'Abrir en el navegador', other: 'Abrir en el navegador' }[os];
    dl.firstChild.nodeValue = main + ' ';
    dl.setAttribute('href', '#' + (os === 'mobile' ? 'other' : os));
    if (os === 'mobile' || os === 'other') $('[data-dl-alt]').hidden = true;
    var row = $('.plats li[data-os="' + os + '"]');
    if (row) { row.classList.add('on'); var rec = row.querySelector('.rec'); if (rec) rec.hidden = false; }
    var req = $('[data-dl-req="' + os + '"]'); if (req) req.hidden = false;
  }
})();
