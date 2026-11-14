/* Maquetas · web de Quick Robot · scripts compartidos por Aprende y Para talleres.
   Escritos para Chrome, Edge, Firefox y Safari 14 o más nuevo (docs/24 §5):
   - sin ?. ni ??, sin Array.prototype.at, structuredClone, Object.hasOwn ni regex con lookbehind;
   - requestIdleCallback con reemplazo (Safari no lo tiene);
   - matchMedia con addListener si no hay addEventListener (Safari 13 y anteriores);
   - nada de innerHTML con datos: todo se arma con nodos de texto.
   Deja sus utilidades en window.QRM para los scripts de cada sección (_aprende.js, _talleres.js).
   En la web real cada parte vive en su componente y arranca en astro:page-load (docs/07 §1). */
(function () {
  'use strict';

  /* ---------- utilidades ---------- */
  var ric = (typeof window.requestIdleCallback === 'function')
    ? window.requestIdleCallback.bind(window)
    : function (cb) { return setTimeout(function () { cb({ didTimeout: false, timeRemaining: function () { return 0; } }); }, 1); };
  function onMedia(query, fn) {
    var mq = window.matchMedia(query);
    if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn);
    return mq;
  }
  /* número escrito con punto o coma decimal; NaN si no es número */
  function num(v) { var n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return isFinite(n) ? n : NaN; }
  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') e.textContent = attrs[k];
      else if (k === 'cls') e.className = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  /* pesos con centavos y comas de miles: 1234.5 → $1,234.50 */
  function money(n) { return (n < 0 ? '−$' : '$') + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  window.QRM = { ric: ric, onMedia: onMedia, num: num, norm: norm, el: el, $: $, $$: $$, money: money };

  /* ---------- header y notas de maqueta ---------- */
  var h = document.getElementById('siteH');
  function onScroll() { if (h) h.classList.toggle('line', window.pageYOffset > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $$('.mk-note button').forEach(function (b) { b.addEventListener('click', function () { b.parentNode.parentNode.removeChild(b.parentNode); }); });

  /* ---------- copiar (bloques de código) ---------- */
  $$('.copy').forEach(function (b) {
    b.addEventListener('click', function () {
      var pre = b.parentNode.querySelector('pre');
      var text = pre ? pre.textContent : '';
      function done() { b.textContent = 'Copiado'; setTimeout(function () { b.textContent = 'Copiar'; }, 1600); }
      function legacy() {
        var r = document.createRange(); r.selectNodeContents(pre);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        try { document.execCommand('copy'); done(); } catch (e) { /* queda seleccionado para copiar a mano */ }
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, legacy); else legacy();
    });
  });

  /* ---------- tablas que siguen a la derecha ---------- */
  function more(w) { w.classList.toggle('more', w.scrollLeft + w.clientWidth < w.scrollWidth - 2); }
  $$('.tbl-wrap').forEach(function (w) { more(w); w.addEventListener('scroll', function () { more(w); }, { passive: true }); });
  window.addEventListener('resize', function () { $$('.tbl-wrap').forEach(more); });
})();
