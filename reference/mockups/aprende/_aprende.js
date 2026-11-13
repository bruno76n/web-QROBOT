/* Aprende · scripts de las maquetas.
   Escritos para Chrome, Edge, Firefox y Safari 14 o más nuevo (docs/24 §5):
   - sin ?. ni ??, sin Array.prototype.at, structuredClone, Object.hasOwn ni regex con lookbehind;
   - requestIdleCallback y AbortSignal.timeout con reemplazo (Safari no tiene el primero; el segundo llega en Safari 16);
   - matchMedia con addListener si no hay addEventListener (Safari 13 y anteriores);
   - nada de innerHTML con datos: todo se arma con nodos de texto.
   En la web real cada parte vive en su componente y arranca en astro:page-load (docs/07 §1). */
(function () {
  'use strict';

  /* ---------- compatibilidad ---------- */
  var ric = (typeof window.requestIdleCallback === 'function')
    ? window.requestIdleCallback.bind(window)
    : function (cb) { return setTimeout(function () { cb({ didTimeout: false, timeRemaining: function () { return 0; } }); }, 1); };
  function onMedia(query, fn) {
    var mq = window.matchMedia(query);
    if (mq.addEventListener) mq.addEventListener('change', fn); else mq.addListener(fn);
    return mq;
  }
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
  var D = window.APRENDE || {};

  /* ---------- header y notas ---------- */
  var h = document.getElementById('siteH');
  function onScroll() { if (h) h.classList.toggle('line', window.pageYOffset > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $$('.mk-note button').forEach(function (b) { b.addEventListener('click', function () { b.parentNode.parentNode.removeChild(b.parentNode); }); });

  /* ---------- copiar ---------- */
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

  /* ---------- índice de la página en celular: cerrar al tocar una liga ---------- */
  $$('.ap-toc-m a').forEach(function (a) { a.addEventListener('click', function () { a.closest('details').open = false; }); });

  /* ---------- chips que filtran la lista de páginas del tema ---------- */
  $$('[data-chips="pages"]').forEach(function (box) {
    var list = document.getElementById(box.getAttribute('aria-controls'));
    var cnt = document.getElementById(box.getAttribute('data-count'));
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var id = b.getAttribute('data-id'), n = 0;
      $$('li', list).forEach(function (li) {
        var show = id === 'todas' || (' ' + li.getAttribute('data-filters') + ' ').indexOf(' ' + id + ' ') > -1;
        li.hidden = !show; if (show) n++;
      });
      if (cnt) cnt.textContent = n === 1 ? '1 respuesta' : n + ' respuestas';
    });
  });

  /* ---------- tabla de filamentos ---------- */
  var ft = document.getElementById('ft');
  if (ft) {
    var state = { chip: 'todos', open: false, ams: false, brass: false };
    var rows = $$('tbody tr', ft);
    var out = document.getElementById('ft-n'), none = document.getElementById('ft-none');
    function apply() {
      var n = 0;
      rows.forEach(function (r) {
        var f = ' ' + r.getAttribute('data-filters') + ' ';
        var ok = (state.chip === 'todos' || f.indexOf(' ' + state.chip + ' ') > -1)
          && !(state.open && r.getAttribute('data-printer') === 'enclosed')
          && !(state.ams && r.getAttribute('data-ams') === 'no')
          && !(state.brass && r.getAttribute('data-hardened') === 'yes');
        r.hidden = !ok; if (ok) n++;
      });
      out.textContent = n === 1 ? '1 material' : n + ' materiales';
      none.hidden = n > 0;
    }
    $('#ft-chips').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('#ft-chips button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      state.chip = b.getAttribute('data-id'); apply();
    });
    $$('[data-tgl]', ft.closest('.dt')).forEach(function (c) { c.addEventListener('change', function () { state[c.getAttribute('data-tgl')] = c.checked; apply(); }); });
    apply();
  }

  /* ---------- impresoras y ¿Cabe mi pieza? ---------- */
  var pt = document.getElementById('pt');
  if (pt) {
    var ps = { size: 'todas', brand: '', enclosed: false, unit: 'cm', sortBy: 'brand' };
    var prows = $$('tbody tr', pt), body = $('tbody', pt);
    var margin = Number(pt.getAttribute('data-margin')) || 5;
    var inW = document.getElementById('fit-w'), inD = document.getElementById('fit-d'), inH = document.getElementById('fit-h');
    var fitOut = document.getElementById('fit-out'), pn = document.getElementById('pt-n');
    /* misma regla que src/lib/learn/fit.ts (docs/21 §6.2) */
    function fits(piece, pr) {
      var W = pr[0] - 2 * margin, Dd = pr[1] - 2 * margin, H = pr[2];
      var a = piece[0], b = piece[1], c = piece[2];
      function base(x, y) { return (x <= W && y <= Dd) || (y <= W && x <= Dd); }
      if (c <= H && base(a, b)) return 'upright';
      if ((b <= H && base(a, c)) || (a <= H && base(b, c))) return 'lying';
      return 'no';
    }
    function piece() {
      var f = ps.unit === 'cm' ? 10 : 1;
      var v = [num(inW.value) * f, num(inD.value) * f, num(inH.value) * f];
      return v.every(function (x) { return x > 0; }) ? v : null;
    }
    function applyP() {
      var p = piece(), shown = 0, ok = 0;
      prows.forEach(function (r) {
        var vis = (ps.size === 'todas' || r.getAttribute('data-size') === ps.size)
          && (!ps.brand || r.getAttribute('data-brand') === ps.brand)
          && (!ps.enclosed || r.getAttribute('data-enclosed') === '1');
        r.hidden = !vis; if (vis) shown++;
        var cell = $('.fitcell', r); while (cell.firstChild) cell.removeChild(cell.firstChild);
        r.classList.remove('nofit');
        if (!p) { cell.appendChild(document.createTextNode('—')); return; }
        var res = fits(p, [Number(r.getAttribute('data-w')), Number(r.getAttribute('data-d')), Number(r.getAttribute('data-h'))]);
        if (res === 'upright') cell.appendChild(el('span', { cls: 'tag g', text: 'Cabe de pie' }));
        else if (res === 'lying') cell.appendChild(el('span', { cls: 'tag p', text: 'Cabe acostada' }));
        else { cell.appendChild(el('span', { cls: 'tag', text: 'No cabe' })); r.classList.add('nofit'); }
        if (vis && res !== 'no') ok++;
      });
      pn.textContent = shown === 1 ? '1 impresora' : shown + ' impresoras';
      if (!p) fitOut.textContent = 'Escribe las tres medidas.';
      else if (ok === 0) fitOut.textContent = 'No cabe en ninguna: se divide en partes.';
      else fitOut.textContent = 'Cabe en ' + ok + ' de ' + shown + ' impresoras.';
    }
    [inW, inD, inH].forEach(function (i) { i.addEventListener('input', applyP); });
    $$('#fit-unit button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('#fit-unit button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var from = ps.unit; ps.unit = b.getAttribute('data-u');
        if (from !== ps.unit) [inW, inD, inH].forEach(function (i) {
          var v = num(i.value); if (!(v > 0)) return;
          i.value = String(Math.round((ps.unit === 'cm' ? v / 10 : v * 10) * 10) / 10);
        });
        applyP();
      });
    });
    $('#pt-chips').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('#pt-chips button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      ps.size = b.getAttribute('data-id'); applyP();
    });
    document.getElementById('pt-brand').addEventListener('change', function (e) { ps.brand = e.target.value; applyP(); });
    document.getElementById('pt-enc').addEventListener('change', function (e) { ps.enclosed = e.target.checked; applyP(); });
    document.getElementById('pt-sort').addEventListener('click', function (e) {
      ps.sortBy = ps.sortBy === 'brand' ? 'volume' : 'brand';
      e.currentTarget.textContent = ps.sortBy === 'brand' ? 'Ordenar por tamaño' : 'Ordenar por marca';
      prows.slice().sort(function (a, b) {
        return ps.sortBy === 'volume' ? Number(b.getAttribute('data-l')) - Number(a.getAttribute('data-l')) : Number(a.getAttribute('data-i')) - Number(b.getAttribute('data-i'));
      }).forEach(function (r) { body.appendChild(r); });
    });
    applyP();
  }

  /* ---------- calendario de mantenimiento ---------- */
  var cal = document.getElementById('cal');
  if (cal) $('#cal-chips').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    $$('#cal-chips button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    var id = b.getAttribute('data-id');
    $$('section', cal).forEach(function (s) { s.hidden = !(id === 'todas' || s.getAttribute('data-f') === id); });
  });

  /* ---------- calculadora de costo (misma fórmula que src/lib/learn/cost.ts) ---------- */
  var cf = document.getElementById('calc-f');
  if (cf) {
    var money = function (n) { return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
    function v(id) { var n = num(document.getElementById(id).value); return isFinite(n) && n >= 0 ? n : 0; }
    function calc() {
      var perGram = v('c-roll') / Math.max(v('c-rollg'), 1);
      var M = v('c-g') * perGram * (1 + v('c-purge') / 100);
      var L = v('c-h') * (v('c-w') / 1000) * v('c-kwh');
      var Q = v('c-h') * (v('c-printer') / Math.max(v('c-life'), 1) + v('c-maint'));
      var E = v('c-extra');
      var sub = M + L + Q + E;
      var fail = Math.min(v('c-fail'), 90);
      var total = sub / (1 - fail / 100);
      [['r-m', M], ['r-l', L], ['r-q', Q], ['r-e', E], ['r-s', sub], ['r-t', total], ['r-tb', total]].forEach(function (p) {
        var e = document.getElementById(p[0]); if (e) e.textContent = money(p[1]);
      });
    }
    cf.addEventListener('input', function () { ric(calc); });
    calc();
  }

  /* ---------- buscador ---------- */
  var SYN = D.synonyms || {}, STOP = D.stopWords || [];
  var DOCS = (D.docs || []).map(function (d) {
    return { d: d, t: norm(d.title).split(/[^a-z0-9ñ+-]+/).filter(Boolean), g: norm((d.tags || []).join(' ')).split(/[^a-z0-9ñ+-]+/).filter(Boolean), x: norm(d.text || '').split(/[^a-z0-9ñ+-]+/).filter(Boolean) };
  });
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  function match(q, w) {
    if (w === q || w.indexOf(q) === 0) return true;
    if (q.length >= 4) return lev(q, w) <= (q.length >= 8 ? 2 : 1);
    return false;
  }
  function terms(q) {
    var n = norm(q).trim(), out = n.split(/[^a-z0-9ñ+-]+/).filter(function (w) { return w && STOP.indexOf(w) < 0; });
    Object.keys(SYN).forEach(function (k) {
      if ((' ' + n + ' ').indexOf(' ' + norm(k) + ' ') > -1) SYN[k].forEach(function (s) { out.push.apply(out, norm(s).split(/\s+/)); });
    });
    return { all: out, base: n.split(/[^a-z0-9ñ+-]+/).filter(function (w) { return w && STOP.indexOf(w) < 0; }) };
  }
  function search(q, topic) {
    var t = terms(q); if (!t.base.length) return [];
    var res = [];
    DOCS.forEach(function (o) {
      if (topic && o.d.topic !== topic) return;
      var score = 0, hits = [], all = true;
      t.base.forEach(function (w) {
        var s = 0;
        if (o.t.some(function (x) { return match(w, x); })) s = 6; else if (o.g.some(function (x) { return match(w, x); })) s = 4; else if (o.x.some(function (x) { return match(w, x); })) s = 2;
        if (!s) all = false; score += s; if (s) hits.push(w);
      });
      t.all.slice(t.base.length).forEach(function (w) {
        if (o.t.some(function (x) { return match(w, x); }) || o.g.some(function (x) { return match(w, x); })) { score += 3; hits.push(w); }
      });
      if (score > 0 && (all || hits.length > t.base.length - 1)) res.push({ d: o.d, s: score + (all ? 5 : 0) + (o.d.type === 'page' ? 1 : 0), w: hits });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return res;
  }
  function marked(text, words) {
    var frag = document.createDocumentFragment();
    String(text).split(/(\s+)/).forEach(function (part) {
      var n = norm(part).replace(/[^a-z0-9ñ+-]/g, '');
      if (n && words.some(function (w) { return match(w, n); })) frag.appendChild(el('mark', { text: part }));
      else frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }
  var KIND = { page: 'Página', faq: 'Pregunta', term: 'Término', printer: 'Impresora' };
  function emptyState(q) {
    var wa = 'https://wa.me/' + (D.whatsapp || '') + '?text=' + encodeURIComponent('Hola, busqué «' + q + '» en Aprende y no encontré la respuesta.');
    return el('div', { cls: 'q-empty' }, [
      el('img', { src: D.q404 || '', alt: '' }),
      el('div', null, [el('b', { text: '404: no encontramos «' + q + '».' }), el('span', { cls: 'small mute', text: 'Prueba con otras palabras o pregúntanos.' }),
        el('div', null, [el('a', { cls: 'btn wa sm', href: wa, target: '_blank', rel: 'noopener', text: '¿Lo preguntamos por ti?' })])])
    ]);
  }
  function renderList(listEl, items, q) {
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    items.slice(0, 8).forEach(function (r, i) {
      var a = el('a', { href: r.d.url, id: listEl.id + '-o' + i }, [
        el('span', { cls: 'sp-t' }, [marked(r.d.title, r.w)]),
        el('span', { cls: 'sp-x' }, [marked(r.d.text || '', r.w)]),
        el('span', { cls: 'sp-k', text: KIND[r.d.type] + ' · ' + r.d.topicLabel })
      ]);
      listEl.appendChild(el('li', { cls: 'sp-item', role: 'option', 'aria-selected': 'false' }, [a]));
    });
  }
  function lockScroll(on) {
    var root = document.documentElement;
    if (on) { root.classList.add('lock'); } else { root.classList.remove('lock'); }
  }
  $$('[data-search]').forEach(function (box) {
    var input = $('input', box), panel = $('.sp', box), list = $('.sp-list', panel), nEl = $('.sp-n', panel), chips = $('.sp-chips', panel);
    var close = $('.sf-close', box), topic = '', active = -1, timer = 0, last = '';
    var phone = window.matchMedia('(max-width: 760px)');
    function open(o) {
      panel.hidden = !o; input.setAttribute('aria-expanded', String(o));
      var sheet = o && phone.matches; box.classList.toggle('open', sheet); lockScroll(sheet);
    }
    function run() {
      var q = input.value.trim();
      if (q.length < 2) { open(false); return; }
      var all = search(q, ''), res = topic ? all.filter(function (r) { return r.d.topic === topic; }) : all;
      while (chips.firstChild) chips.removeChild(chips.firstChild);
      var counts = {}; all.forEach(function (r) { counts[r.d.topic] = (counts[r.d.topic] || 0) + 1; });
      [['', 'Todo', all.length]].concat((D.topics || []).filter(function (tp) { return counts[tp.id]; }).map(function (tp) { return [tp.id, tp.label, counts[tp.id]]; })).forEach(function (c) {
        var b = el('button', { type: 'button', 'aria-pressed': String(c[0] === topic) }, [c[1], el('span', { text: String(c[2]) })]);
        b.addEventListener('click', function () { topic = c[0]; run(); input.focus(); });
        chips.appendChild(b);
      });
      chips.hidden = all.length === 0;
      renderList(list, res, q); active = -1;
      var old = $('.q-empty', panel); if (old) old.parentNode.removeChild(old);
      if (!res.length) panel.appendChild(emptyState(q));
      nEl.textContent = res.length ? (res.length === 1 ? '1 resultado' : res.length + ' resultados') : 'Sin resultados';
      if (res.length > 8) list.appendChild(el('li', { cls: 'sp-item sp-more' }, [el('a', { href: 'buscar.html?q=' + encodeURIComponent(q) + (topic ? '&tema=' + topic : '') }, [el('span', { cls: 'sp-t', text: 'Ver los ' + res.length + ' resultados →' })])]));
      open(true); last = q;
    }
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 150); });
    input.addEventListener('focus', function () { if (input.value.trim().length >= 2) run(); });
    input.addEventListener('keydown', function (e) {
      var opts = $$('.sp-item:not(.sp-more)', list).concat($$('.sp-more', list));
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!opts.length) return; e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
        opts.forEach(function (o, i) { o.setAttribute('aria-selected', String(i === active)); });
        input.setAttribute('aria-activedescendant', $('a', opts[active]).id);
        opts[active].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && active > -1 && opts[active]) { e.preventDefault(); window.location.href = $('a', opts[active]).getAttribute('href'); }
      else if (e.key === 'Escape') { open(false); input.blur(); }
    });
    if (close) close.addEventListener('click', function () { open(false); });
    document.addEventListener('click', function (e) { if (!box.contains(e.target) && !phone.matches) open(false); });
    onMedia('(max-width: 760px)', function () { if (!panel.hidden) open(true); });
    $$('[data-q]').forEach(function (b) { b.addEventListener('click', function () { input.value = b.getAttribute('data-q'); input.focus(); run(); }); });
  });
  /* ⌘K / Ctrl+K y «/» enfocan el buscador */
  document.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) || (e.key === '/' && !typing)) {
      var i = $('[data-search] input'); if (i) { e.preventDefault(); i.focus(); }
    }
  });

  /* ---------- página de resultados (sin JavaScript en la web real; aquí se simula con ?q=) ---------- */
  var resList = document.getElementById('res');
  if (resList) {
    var params = new URLSearchParams(window.location.search), q = params.get('q') || 'petj';
    var qi = $('#res-q'); if (qi) qi.value = q;
    var r = search(q, params.get('tema') || '');
    document.getElementById('res-n').textContent = r.length ? (r.length === 1 ? '1 resultado para «' + q + '»' : r.length + ' resultados para «' + q + '»') : '';
    if (!r.length) { document.getElementById('res-empty').hidden = false; document.getElementById('res-eq').textContent = '404: no encontramos «' + q + '».';
      document.getElementById('res-wa').href = 'https://wa.me/' + (D.whatsapp || '') + '?text=' + encodeURIComponent('Hola, busqué «' + q + '» en Aprende y no encontré la respuesta.'); }
    r.slice(0, 20).forEach(function (x) {
      resList.appendChild(el('li', null, [el('a', { href: x.d.url }, [
        el('span', { cls: 'k', text: KIND[x.d.type] + ' · ' + x.d.topicLabel }),
        el('span', { cls: 't' }, [marked(x.d.title, x.w)]),
        el('span', { cls: 'x' }, [marked(x.d.text || '', x.w)])
      ])]));
    });
  }
})();
