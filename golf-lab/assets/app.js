/* THE GOLF LAB — shared layout, illustrations and page logic. */
(function () {
  'use strict';
  var GL = window.GL;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('gl:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('gl:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  var lessonById = function (id) { return GL.lessons.filter(function (l) { return l.id === id; })[0]; };
  var catById = function (id) { return GL.categories.filter(function (c) { return c.id === id; })[0]; };

  /* ---------- icons (24px line icons) ---------- */
  var I = {
    flag: '<path d="M6 21V4"/><path d="M6 4l11 4-11 4"/><ellipse cx="9" cy="21" rx="6" ry="1.2"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/><path d="M9 8h7M9 12h5"/>',
    club: '<path d="M16 2.5L8.6 17.6"/><path d="M8.6 17.6c-.7 1.5-2.6 2.8-4.6 2.4-.9-.2-1-1.3-.2-1.7l4.8-.7"/><circle cx="17.5" cy="19.5" r="2"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>',
    ball: '<circle cx="12" cy="11" r="7"/><path d="M9 21h6M12 18v3"/><circle cx="10" cy="9" r=".6"/><circle cx="13" cy="8" r=".6"/><circle cx="12.5" cy="11.5" r=".6"/><circle cx="9.5" cy="12" r=".6"/>',
    chart: '<path d="M4 20h16"/><path d="M7 16v-5M12 16V6M17 16v-8"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 3M16 6h3a3 3 0 0 1-3 3"/><path d="M12 13v4M8.5 21h7M9.5 17h5v4h-5z"/>'
  };
  var icon = function (n, cls) {
    return '<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + I[n] + '</svg>';
  };
  GL.icon = icon;

  /* ---------- illustrations ---------- */
  var uid = 0;
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Side-on ball flight: ball → carry arc → roll to the flag. */
  function shotSVG(s, opts) {
    opts = opts || {};
    var id = 'sv' + (++uid);
    var W = 360, H = 170, gy = 128, bx = 34, hx = 318;
    var greenStart = { green: 0, fringe: 64, fairway: 110, rough: 150, bunker: 150 }[s.lie || 'fairway'];
    var land = bx + (s.air || 0) * (hx - bx);
    var peak = (s.h || 0) * 92;
    var out = '<svg class="shot-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.label || '擊球路線示意') + '">';
    out += '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d4d33"/><stop offset="1" stop-color="#063524"/></linearGradient>' +
      '<pattern id="' + id + 'p" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="11" height="22" fill="rgba(255,255,255,.05)"/></pattern></defs>';
    out += '<rect width="' + W + '" height="' + H + '" fill="url(#' + id + 's)"/>';
    // turf bands
    out += '<rect x="0" y="' + gy + '" width="' + W + '" height="' + (H - gy) + '" fill="#2f6b34"/>';
    if (s.lie === 'rough' || s.lie === 'bunker') out += '<rect x="0" y="' + gy + '" width="' + greenStart + '" height="' + (H - gy) + '" fill="#285c2c"/>';
    if (s.lie === 'bunker') out += '<path d="M6 ' + (gy + 1) + ' Q 34 ' + (gy + 22) + ' 86 ' + (gy + 1) + ' Z" fill="#e9dfc3"/>';
    if (s.hazard) out += '<path d="M' + (greenStart - 78) + ' ' + (gy + 1) + ' Q ' + (greenStart - 50) + ' ' + (gy + 20) + ' ' + (greenStart - 18) + ' ' + (gy + 1) + ' Z" fill="#e9dfc3"/>';
    out += '<rect x="' + greenStart + '" y="' + gy + '" width="' + (W - greenStart) + '" height="' + (H - gy) + '" fill="#5fa64a"/>';
    out += '<rect x="' + greenStart + '" y="' + gy + '" width="' + (W - greenStart) + '" height="' + (H - gy) + '" fill="url(#' + id + 'p)"/>';
    if (greenStart > 0) out += '<rect x="' + greenStart + '" y="' + gy + '" width="3" height="' + (H - gy) + '" fill="#7cbd5f"/>';
    // flag + hole
    out += '<ellipse cx="' + hx + '" cy="' + (gy + 3) + '" rx="7" ry="2.2" fill="#0b2a18"/>' +
      '<line x1="' + hx + '" y1="' + (gy + 2) + '" x2="' + hx + '" y2="' + (gy - 62) + '" stroke="#f6f1e3" stroke-width="1.6"/>' +
      '<path class="wave" d="M' + hx + ' ' + (gy - 62) + ' l20 7 l-20 7z" fill="#f2c75c"/>';
    // flight
    var stopX = hx - 9, mp;
    if (s.air > 0) {
      mp = 'M' + bx + ' ' + (gy - 4) + ' Q ' + ((bx + land) / 2) + ' ' + (gy - 4 - 2 * peak) + ' ' + land + ' ' + (gy - 4) + (land < stopX - 4 ? ' L' + stopX + ' ' + (gy - 4) : '');
      out += '<path class="flight" pathLength="1" d="M' + bx + ' ' + (gy - 4) + ' Q ' + ((bx + land) / 2) + ' ' + (gy - 4 - 2 * peak) + ' ' + land + ' ' + (gy - 4) + '" fill="none" stroke="#fbf8ef" stroke-width="1.8" stroke-linecap="round"/>';
      out += '<circle class="land" cx="' + land + '" cy="' + (gy - 3) + '" r="5" fill="none" stroke="#f2c75c" stroke-width="1.4"/>';
      if (land < stopX - 4) out += '<path class="roll" d="M' + land + ' ' + (gy - 4) + ' L' + stopX + ' ' + (gy - 4) + '" stroke="#fbf8ef" stroke-width="1.8" stroke-dasharray="1 6" stroke-linecap="round"/>';
    } else {
      var c = s.curve || 0;
      mp = 'M' + bx + ' ' + (gy - 4) + ' Q ' + ((bx + stopX) / 2) + ' ' + (gy - 4 - c * 60) + ' ' + stopX + ' ' + (gy - 4);
      out += '<path class="roll" d="M' + bx + ' ' + (gy - 4) + ' Q ' + ((bx + stopX) / 2) + ' ' + (gy - 4 - c * 60) + ' ' + stopX + ' ' + (gy - 4) + '" fill="none" stroke="#fbf8ef" stroke-width="1.8" stroke-dasharray="1 6" stroke-linecap="round"/>';
    }
    // the ball travels along the shot; it restarts each time the drawing scrolls into view
    if (opts.still || REDUCED) out += '<circle cx="' + bx + '" cy="' + (gy - 4) + '" r="4.2" fill="#ffffff"/>';
    else out += '<ellipse cx="' + bx + '" cy="' + (gy - 1) + '" rx="5" ry="1.6" fill="rgba(0,0,0,.25)"/>' +
      '<circle r="4.2" fill="#ffffff"><animateMotion dur="' + (s.air > 0 ? 2.2 : 1.9) + 's" begin="0s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".3 0 .3 1" path="' + mp + '"/></circle>';
    if (opts.tag) out += '<text x="' + (W - 14) + '" y="24" text-anchor="end" class="svg-tag">' + esc(opts.tag) + '</text>';
    return out + '</svg>';
  }
  GL.shotSVG = shotSVG;
  GL.esc = esc;
  GL.store = store;
  GL.lessonById = function (id) { return lessonById(id); };

  /* Toe-view of a club head showing its loft angle. */
  function loftSVG(club) {
    var W = 220, H = 170, gy = 140, fx = 92;
    var loft = club.loftShow, r = loft * Math.PI / 180;
    var dims = { driver: [74, 92], wood: [46, 70], hybrid: [44, 50], iron: [50, 16], wedge: [54, 15], putter: [26, 46] }[club.type];
    var fh = dims[0], d = dims[1];
    var tx = fx + Math.sin(r) * fh, ty = gy - Math.cos(r) * fh;
    var head;
    if (club.type === 'driver' || club.type === 'wood' || club.type === 'hybrid') {
      head = 'M' + fx + ' ' + gy + ' L' + tx + ' ' + ty + ' C ' + (tx + d * 0.45) + ' ' + (ty - fh * 0.12) + ' ' + (fx + d) + ' ' + (ty + fh * 0.1) + ' ' + (fx + d) + ' ' + (gy - fh * 0.35) +
        ' C ' + (fx + d) + ' ' + (gy - 4) + ' ' + (fx + d * 0.6) + ' ' + gy + ' ' + (fx + d * 0.35) + ' ' + gy + ' Z';
    } else {
      head = 'M' + fx + ' ' + gy + ' L' + tx + ' ' + ty + ' L' + (tx + d * 0.7) + ' ' + ty + ' L' + (fx + d) + ' ' + (gy - fh * 0.3) + ' Q ' + (fx + d) + ' ' + gy + ' ' + (fx + d - 6) + ' ' + gy + ' Z';
    }
    var hosel = { x: tx + (club.type === 'putter' ? d * 0.5 : d * 0.25), y: ty };
    var rr = 36;
    var arc = 'M' + fx + ' ' + (gy - rr) + ' A ' + rr + ' ' + rr + ' 0 0 1 ' + (fx + Math.sin(r) * rr) + ' ' + (gy - Math.cos(r) * rr);
    return '<svg class="loft-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(club.name) + ' loft ' + loft + '°">' +
      '<line x1="10" y1="' + gy + '" x2="' + (W - 10) + '" y2="' + gy + '" stroke="currentColor" stroke-opacity=".25"/>' +
      '<line x1="' + fx + '" y1="' + gy + '" x2="' + fx + '" y2="' + (gy - 100) + '" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="3 4"/>' +
      '<line x1="' + hosel.x + '" y1="' + hosel.y + '" x2="' + (hosel.x + 26) + '" y2="6" stroke="#9aa59f" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="' + head + '" fill="#1f3b2f" stroke="#0b2a1c" stroke-width="1"/>' +
      '<line x1="' + fx + '" y1="' + gy + '" x2="' + (fx + Math.sin(r) * (fh + 22)) + '" y2="' + (gy - Math.cos(r) * (fh + 22)) + '" stroke="#c8a24a" stroke-width="1.4"/>' +
      '<path d="' + arc + '" fill="none" stroke="#c8a24a" stroke-width="1.4"/>' +
      '<text x="' + (fx - 8) + '" y="' + (gy - 104) + '" text-anchor="end" class="svg-loft">' + loft + '°</text>' +
      '<circle cx="' + (fx - 15) + '" cy="' + (gy - 11) + '" r="11" fill="#fff" stroke="#d9d4c3"/>' +
      '</svg>';
  }

  /* Aerial view of a golf hole for the homepage hero. */
  function courseSVG() {
    var seed = 7;
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var trees = '';
    var clusters = [[90, 120, 9], [230, 60, 6], [380, 120, 5], [620, 70, 7], [760, 40, 4], [120, 360, 6], [60, 560, 6], [1150, 380, 8], [980, 520, 7], [820, 640, 6], [1120, 640, 6], [700, 560, 3], [1160, 90, 5]];
    clusters.forEach(function (c) {
      for (var i = 0; i < c[2]; i++) {
        var x = c[0] + (rnd() - 0.5) * 150, y = c[1] + (rnd() - 0.5) * 110, r = 16 + rnd() * 18;
        trees += '<ellipse cx="' + (x + r * 0.55) + '" cy="' + (y + r * 0.45) + '" rx="' + r + '" ry="' + r * 0.92 + '" fill="#0a1f0c" opacity=".45" filter="url(#hb)"/>' +
          '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#ht)"/>';
      }
    });
    return '<svg class="course-svg" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<defs>' +
      '<linearGradient id="hr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b4220"/><stop offset="1" stop-color="#2a5a27"/></linearGradient>' +
      '<radialGradient id="ht" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#3f7a2f"/><stop offset=".6" stop-color="#1f4a1c"/><stop offset="1" stop-color="#11300f"/></radialGradient>' +
      '<radialGradient id="hg" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#8cc163"/><stop offset="1" stop-color="#5f9a43"/></radialGradient>' +
      '<pattern id="hs" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><rect width="30" height="60" fill="rgba(255,255,255,.045)"/></pattern>' +
      '<filter id="hb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>' +
      '<radialGradient id="hv" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#04150b" stop-opacity=".55"/><stop offset=".6" stop-color="#04150b" stop-opacity=".25"/><stop offset="1" stop-color="#04150b" stop-opacity=".5"/></radialGradient>' +
      '</defs>' +
      '<rect width="1200" height="760" fill="url(#hr)"/>' +
      '<path d="M-60 820 C 220 660 180 500 470 430 S 850 300 960 150 L 1090 200 C 990 360 820 480 580 540 S 300 700 260 820 Z" fill="#4c8738"/>' +
      '<path d="M-60 820 C 220 660 180 500 470 430 S 850 300 960 150 L 1090 200 C 990 360 820 480 580 540 S 300 700 260 820 Z" fill="url(#hs)"/>' +
      '<ellipse cx="1018" cy="168" rx="112" ry="82" fill="#548f3c"/>' +
      '<ellipse cx="1018" cy="168" rx="98" ry="70" fill="url(#hg)"/>' +
      '<path d="M880 250 c 30 -30 80 -20 92 6 c 10 24 -40 40 -78 30 c -22 -6 -26 -24 -14 -36z" fill="#efe6cf"/>' +
      '<path d="M1110 110 c 30 -8 52 20 40 50 c -10 26 -36 30 -44 8 c -6 -18 -16 -50 4 -58z" fill="#efe6cf"/>' +
      '<path d="M560 330 c 40 -26 96 -18 104 10 c 6 22 -60 30 -98 22 c -20 -4 -22 -22 -6 -32z" fill="#efe6cf"/>' +
      '<path d="M300 560 c 20 -30 70 -36 84 -12 c 12 22 -30 44 -62 44 c -24 0 -32 -14 -22 -32z" fill="#efe6cf"/>' +
      trees +
      '<ellipse cx="1031" cy="172" rx="4" ry="2" fill="#0b2a18"/><line x1="1031" y1="172" x2="1031" y2="132" stroke="#fff" stroke-width="2"/><path class="wave" d="M1031 132 l16 6 l-16 6z" fill="#f2c75c"/>' +
      (REDUCED ? '<circle cx="1022" cy="176" r="5" fill="#fff"/>' :
        '<ellipse rx="0" ry="0" fill="rgba(0,0,0,.35)"><animate attributeName="rx" values="0;6;3;5" keyTimes="0;.05;.5;1" dur="2.8s" begin="1s" fill="freeze"/><animate attributeName="ry" values="0;3;1.5;2.5" keyTimes="0;.05;.5;1" dur="2.8s" begin="1s" fill="freeze"/>' +
        '<animateMotion path="M330 640 L 1022 178" dur="2.8s" begin="1s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".25 .1 .3 1"/></ellipse>' +
        '<circle r="0" fill="#fff"><animate attributeName="r" values="0;5;11;5" keyTimes="0;.05;.45;1" dur="2.8s" begin="1s" fill="freeze"/>' +
        '<animateMotion path="M330 640 Q 640 240 1022 176" dur="2.8s" begin="1s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines=".25 .1 .3 1"/></circle>') +
      '<rect width="1200" height="760" fill="url(#hv)"/>' +
      '</svg>';
  }

  /* Masters-style stat ring */
  function ringSVG(pct) {
    var r = 46, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, pct));
    return '<svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#efece3" stroke-width="20"/>' +
      '<circle cx="60" cy="60" r="' + r + '" class="arc" fill="none" stroke="#006747" stroke-width="20" stroke-dasharray="' + (c * v) + ' ' + c + '" transform="rotate(-90 60 60)"/></svg>';
  }


  /* ---------- scroll reveal ---------- */
  // Elements fade and rise in as they scroll into view; rings, bars, numbers and ball flights inside
  // start when their block is revealed.
  var REVEAL_SEL = ['.reveal', '.page-head > *', '.photo-card', '.tool', '.academy-card', '.lesson-card', '.cat-intro', '.lesson-head > *',
    '.lsec', '.pager', '.cta-band', '.club-card', '.gapping', '#clubTable', '.problem', '.wizard h2', '.opt', '.diag-main', '.also-item', '.q',
    '.principle', '.result-card', '.plan-card', '.timer-card', '.game-head', '#udCard', '.stats', '.upload-grid > *', '.paste', '.round-sec',
    '.stats-sec', '.insight-sec', '.official-sec', '.map-card', '.rules-bar', '.rule', '.rg-head', '.ref-card', '.terms-sec', '.etiquette li',
    '.contact-intro', '.contact-form', '.foot > *', '.pill-tabs:not(.round-tabs)'].join(',');
  var revealIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { revealEl(e.target); revealIO.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

  function revealEl(el) {
    el.classList.add('in');
    $$('svg', el).concat(el.tagName === 'svg' ? [el] : []).forEach(function (svg) { if (svg.setCurrentTime) svg.setCurrentTime(0); });
    if (!REDUCED) $$('.stat-v strong, .tile strong, .par-card strong, .half strong, .cc-stats dd, .topar, .mr-v strong, .dc-box strong', el).forEach(countUp);
  }
  function countUp(el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) return;
    var txt = node.nodeValue.trim(), m = /^([+-]?)(\d+(?:\.\d+)?)$/.exec(txt);
    if (!m) return;
    var target = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length, t0 = null;
    var step = function (t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
      node.nodeValue = m[1] + (target * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step); else node.nodeValue = txt;
    };
    requestAnimationFrame(step);
  }
  /* fresh = a new view (page load, new lesson, next question): animate even what is already on screen.
     Otherwise (live updates while typing or toggling) on-screen elements appear at once. */
  var booted = false;
  function reveal(root, fresh) {
    fresh = fresh || !booted;
    var vh = window.innerHeight || 800, seen = new Map();
    $$(REVEAL_SEL, root || document).forEach(function (el) {
      if (el.classList.contains('rv')) return;
      var i = seen.get(el.parentNode) || 0;
      seen.set(el.parentNode, i + 1);
      el.classList.add('rv');
      el.style.setProperty('--i', Math.min(i, 6));
      var r = el.getBoundingClientRect();
      if (!revealIO || REDUCED) return el.classList.add('in');
      if (!fresh && r.top < vh && r.bottom > 0) el.classList.add('in');
      else revealIO.observe(el);
    });
  }
  GL.reveal = reveal;

  /* ---------- layout ---------- */
  /* Menu: one beginner entry point, then three groups. Chinese first, English second. */
  var NAV_GROUPS = [
    { zh: '學習', en: 'Learn', items: [
      { href: 'learn.html', key: 'learn', zh: '技巧教學', en: 'Learn Golf' },
      { href: 'clubs.html', key: 'clubs', zh: '球桿選擇', en: 'Club Guide' },
      { href: 'rules.html', key: 'rules', zh: '高球規則', en: 'Rules' },
      { href: 'guide.html', key: 'guide', zh: '第一次指南', en: 'First Time' },
      { href: 'guide.html#outfit', key: 'outfit', zh: '穿搭指南', en: 'What to Wear' },
      { href: 'glossary.html', key: 'glossary', zh: '名詞小辭典', en: 'Glossary' }
    ] },
    { zh: '練習', en: 'Practice', items: [
      { href: 'practice.html', key: 'practice', zh: '練習計畫', en: 'Practice Plans' },
      { href: 'shot.html', key: 'shot', zh: '短桿選擇', en: 'Shot Selector' }
    ] },
    { zh: '分析', en: 'Analyse', items: [
      { href: 'fix.html', key: 'fix', zh: '擊球診斷', en: 'Fix My Shot' },
      { href: 'my-game.html', key: 'mygame', zh: '我的成績', en: 'My Game' }
    ] }
  ];
  var NAV = NAV_GROUPS.reduce(function (a, g) { return a.concat(g.items); }, []);

  // PAR/A wordmark: serif capitals with the tan slash from the logo
  function wordmark() { return '<span class="wordmark" aria-hidden="true">PAR<i class="sl"></i>A</span>'; }

  function renderChrome(page) {
    var h = $('#site-header');
    if (h) {
      h.className = 'site-header';
      h.innerHTML = '<div class="bar">' +
        '<a class="brand" href="index.html" aria-label="PAR/A 首頁">' + wordmark() + '</a>' +
        '<nav class="nav" id="nav" aria-label="Main">' +
        '<a class="nav-start" href="start.html"' + (page === 'start' ? ' aria-current="page"' : '') + '><span>新手入門</span><small>Start Here</small></a>' +
        NAV_GROUPS.map(function (g, i) {
          var on = g.items.some(function (n) { return n.key === page; });
          return '<div class="nav-group' + (on ? ' on' : '') + '"><button type="button" class="nav-g" aria-expanded="false" aria-controls="ng' + i + '"><span>' + g.zh + '</span><small>' + g.en + '</small>' + icon('arrow', 'chev') + '</button>' +
            '<div class="nav-menu" id="ng' + i + '">' + g.items.map(function (n) {
              return '<a href="' + n.href + '"' + (n.key === page ? ' aria-current="page"' : '') + '><span>' + n.zh + '</span><small>' + n.en + '</small></a>';
            }).join('') + '</div></div>';
        }).join('') +
        '<a class="nav-contact" href="index.html#contact"><span>聯絡我們</span><small>Contact Us</small></a></nav>' +
        '<a class="contact-cta" href="index.html#contact">聯絡我們</a>' +
        '<button class="nav-toggle" id="navToggle" aria-label="開啟選單" aria-expanded="false">' + icon('menu') + '</button>' +
        '</div>';
      $('#navToggle').addEventListener('click', function () {
        var open = h.classList.toggle('open');
        this.setAttribute('aria-expanded', open);
        this.innerHTML = icon(open ? 'close' : 'menu');
      });
      var groups = $$('.nav-group', h);
      var closeAll = function (except) { groups.forEach(function (g) { if (g !== except) { g.classList.remove('open'); $('.nav-g', g).setAttribute('aria-expanded', 'false'); } }); };
      groups.forEach(function (g) {
        var b = $('.nav-g', g);
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          var open = !g.classList.contains('open');
          closeAll(g);
          g.classList.toggle('open', open);
          b.setAttribute('aria-expanded', open);
        });
      });
      document.addEventListener('click', function (e) { if (!h.contains(e.target)) closeAll(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
    }
    var f = $('#site-footer');
    if (f) {
      var lefty = !!store.get('lefty', false);
      f.className = 'site-footer';
      f.innerHTML = '<div class="wrap foot">' +
        '<div><a class="brand light" href="index.html" aria-label="PAR/A 首頁">' + wordmark() + '</a><p class="brand-tag">The Golf Lab</p>' +
        '<p class="foot-note">PAR/A 是 Anne 一個人整理的小網站，寫給剛開始學高爾夫的人。內容有錯、或想看什麼教學，<a href="index.html#contact">歡迎寫信告訴我</a>。</p>' +
        '<button type="button" class="lefty-btn" id="leftyBtn" aria-pressed="' + lefty + '">左手球員模式：' + (lefty ? '開' : '關') + '</button></div>' +
        '<div class="foot-cols"><div class="foot-col"><h5>開始</h5><a href="start.html">新手入門<small>Start Here</small></a><a href="index.html#contact">聯絡我們<small>Contact Us</small></a></div>' +
        NAV_GROUPS.map(function (g) { return '<div class="foot-col"><h5>' + g.zh + '</h5>' + g.items.map(function (n) { return '<a href="' + n.href + '">' + n.zh + '<small>' + n.en + '</small></a>'; }).join('') + '</div>'; }).join('') + '</div>' +
        '</div><div class="wrap foot-base"><span>&copy; ' + new Date().getFullYear() + ' PAR/A</span><span>最後更新：2026 年 10 月</span></div>';
      $('#leftyBtn').addEventListener('click', function () {
        var on = !store.get('lefty', false);
        store.set('lefty', on);
        applyLefty();
        this.setAttribute('aria-pressed', on);
        this.textContent = '左手球員模式：' + (on ? '開' : '關');
      });
    }
    applyLefty();
  }

  /* Left-handed mode mirrors every diagram; the text keeps right-handed wording, with a reminder. */
  function applyLefty() {
    var on = !!store.get('lefty', false);
    document.documentElement.classList.toggle('lefty', on);
    var note = $('#leftyNote');
    if (on && !note) {
      note = document.createElement('div');
      note.id = 'leftyNote'; note.className = 'lefty-note';
      note.innerHTML = '<span>左手球員模式已開啟：圖示已左右對調。文字說明仍以右手為準，請把「左、右」對調閱讀。</span>';
      var hd = $('#site-header');
      if (hd && hd.parentNode) hd.parentNode.insertBefore(note, hd.nextSibling);
    } else if (!on && note) note.remove();
  }

  /* ---------- learning progress ---------- */
  var learned = function () { return store.get('learned', []); };
  var isLearned = function (id) { return learned().indexOf(id) > -1; };
  function setLearned(id, on) {
    var l = learned().filter(function (x) { return x !== id; });
    if (on) l.push(id);
    store.set('learned', l);
  }

  /* ---------- glossary terms ---------- */
  // Wrap the first mention of each glossary word inside `root` in a button that opens a short definition.
  function linkTerms(root) {
    if (!root || !GL.glossary) return;
    var pairs = [];
    GL.glossary.forEach(function (g, i) { (g.auto || []).forEach(function (w) { pairs.push([w, i]); }); });
    pairs.sort(function (a, b) { return b[0].length - a[0].length; });
    var used = {};
    pairs.forEach(function (p) {
      if (used[p[1]]) return;
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) { return n.parentNode.closest('a, button, h1, h2, h3, h4, h5, .term, script, style, svg, input, textarea, select, label, legend') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
      });
      var node;
      while ((node = walker.nextNode())) {
        var k = node.nodeValue.indexOf(p[0]);
        if (k < 0) continue;
        var after = node.splitText(k);
        after.splitText(p[0].length);
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'term'; b.setAttribute('data-term', p[1]); b.textContent = p[0];
        after.parentNode.replaceChild(b, after);
        used[p[1]] = true;
        break;
      }
    });
  }
  function termPopover() {
    var pop = document.createElement('div');
    pop.className = 'term-pop'; pop.setAttribute('role', 'dialog'); pop.hidden = true;
    document.body.appendChild(pop);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('.term');
      if (!b) { if (!pop.contains(e.target)) pop.hidden = true; return; }
      var g = GL.glossary[+b.getAttribute('data-term')];
      pop.innerHTML = '<strong>' + esc(g.zh) + '<span>' + esc(g.t) + '</span></strong><p>' + esc(g.d) + '</p><a href="glossary.html#' + encodeURIComponent(g.t) + '">名詞小辭典 ' + icon('arrow') + '</a>';
      pop.hidden = false;
      var r = b.getBoundingClientRect(), w = Math.min(300, window.innerWidth - 32);
      pop.style.width = w + 'px';
      pop.style.left = Math.max(16, Math.min(r.left + window.pageXOffset, window.innerWidth - w - 16)) + 'px';
      pop.style.top = (r.bottom + window.pageYOffset + 8) + 'px';
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') pop.hidden = true; });
  }

  /* ---------- search ---------- */
  function searchIndex() {
    var items = [];
    GL.lessons.forEach(function (l) {
      var c = catById(l.cat);
      items.push({ t: l.title, s: l.zh, k: c.name + ' ' + c.zh + ' ' + l.situation + ' ' + l.club.pick, type: '技巧教學 · ' + c.zh, url: 'learn.html#' + l.id });
    });
    GL.clubs.forEach(function (c) {
      items.push({ t: c.name, s: c.zh, k: c.best.join(' ') + ' loft 球桿', type: '球桿選擇', url: 'clubs.html#' + c.id });
    });
    GL.problems.forEach(function (p) {
      items.push({ t: p.title, s: p.desc, k: p.en + ' 診斷 問題', type: '擊球診斷', url: 'fix.html#' + p.id });
    });
    items.push({ t: '短桿選擇', s: '球在果嶺旁，回答 4 個問題告訴你怎麼打', k: 'Shot Selector 短桿 切球 選擇 推薦 chipping', type: '練習', url: 'shot.html' });
    GL.rules.forEach(function (r) {
      var a = GL.ruleAreas.filter(function (x) { return x.id === r.area; })[0];
      items.push({ t: r.q, s: a.zh + ' · ' + (r.pen === 0 ? '免罰' : r.pen === 'x' ? '規則說明' : '罰 ' + r.pen + ' 桿'), k: r.a + ' 規則 rules ' + a.name, type: '高球規則 · ' + a.zh, url: 'rules.html#' + r.area });
    });
    (GL.glossary || []).forEach(function (g) { items.push({ t: g.zh + '（' + g.t + '）', s: g.d, k: g.t + ' ' + (g.auto || []).join(' ') + ' 名詞 辭典', type: '名詞小辭典', url: 'glossary.html#' + encodeURIComponent(g.t) }); });
    items.push({ t: '新手入門', s: '依你的程度，給你 4 週學習路線', k: '新手 開始 入門 路線 start 第一次', type: '新手入門', url: 'start.html' });
    items.push({ t: '第一次去練習場', s: '要帶什麼、怎麼買球、練習順序', k: '練習場 第一次 新手 driving range', type: '第一次指南', url: 'guide.html#range' });
    items.push({ t: '第一次下場', s: '服裝、時間、要帶什麼、桿弟與球車', k: '下場 球場 第一次 服裝 預約', type: '第一次指南', url: 'guide.html#course' });
    items.push({ t: '穿搭指南', s: '第一次下場穿什麼、夏天冬天雨天怎麼穿', k: '穿搭 服裝 衣服 穿什麼 polo 球鞋 帽子 dress code 服裝規定', type: '第一次指南', url: 'guide.html#outfit' });
    items.push({ t: '計分卡怎麼填', s: '每洞記桿數，最多記雙倍標準桿', k: '計分 計分卡 撿球 雙倍標準桿 scorecard', type: '第一次指南', url: 'guide.html#score' });
    items.push({ t: '新手第一套球桿', s: '只需要 5–7 支', k: '買球桿 新手 套桿 第一套', type: '球桿選擇', url: 'clubs.html#starter' });
    items.push({ t: '我的成績', s: '輸入計分卡，看看桿數掉在哪裡', k: 'My Game 計分卡 成績 分析 scorecard 推桿 上果嶺 球道 stats 破百', type: '分析', url: 'my-game.html' });
    items.push({ t: '練習計畫', s: '練習場 30 / 60 分鐘、短桿 15 / 30 分鐘菜單', k: 'Practice 練習 計畫 菜單 練習場 up and down', type: '練習', url: 'practice.html' });
    return items;
  }

  function bindSearch(input, list) {
    var items = searchIndex();
    var run = function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { list.hidden = true; list.innerHTML = ''; return; }
      var hits = items.filter(function (i) { return (i.t + ' ' + i.s + ' ' + i.k).toLowerCase().indexOf(q) !== -1; }).slice(0, 7);
      list.hidden = false;
      list.innerHTML = hits.length ? hits.map(function (h) {
        return '<a href="' + h.url + '"><span class="r-type">' + esc(h.type) + '</span><strong>' + esc(h.t) + '</strong><span class="r-sub">' + esc(h.s) + '</span></a>';
      }).join('') : '<p class="r-empty">找不到「' + esc(input.value) + '」，試試「打厚」、「推桿」或「Hybrid」。</p>';
    };
    input.addEventListener('input', run);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var first = $('a', list); if (first) location.href = first.getAttribute('href'); }
      if (e.key === 'Escape') { input.value = ''; run(); }
    });
    document.addEventListener('click', function (e) { if (!list.contains(e.target) && e.target !== input) list.hidden = true; });
    input.addEventListener('focus', run);
    $$('[data-q]').forEach(function (b) {
      b.addEventListener('click', function () { input.value = b.getAttribute('data-q'); input.focus(); run(); });
    });
  }

  /* ---------- shared fragments ---------- */
  function lessonCard(l, step) {
    var c = catById(l.cat);
    return '<a class="lesson-card" href="learn.html#' + l.id + '">' +
      '<div class="lc-art">' + (step ? '<span class="lc-step">STEP ' + step + '</span>' : '') + (isLearned(l.id) ? '<span class="lc-done">' + icon('check') + '已學會</span>' : '') + lessonArt(l) + '</div>' +
      '<div class="lc-body"><span class="eyebrow">' + c.zh + '</span>' +
      '<h3>' + esc(l.zh) + '</h3><p>' + esc(l.title) + '</p>' +
      '<span class="lc-meta">' + icon('clock') + l.mins + ' min<span class="dot"></span>' + l.level + '<span class="go">' + icon('arrow') + '</span></span></div></a>';
  }


  /* Diagrams for the setup and swing lessons (same 360 × 170 frame as the ball-flight drawings). */
  function fundSVG(type, phase) {
    var id = 'fd' + (++uid);
    var T = function (x, y, t, a, cls) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (a || 'middle') + '" class="' + (cls || 'fd-t') + '">' + t + '</text>'; };
    var o = '<svg class="shot-svg fund-svg" viewBox="0 0 360 170" role="img" aria-label="' + esc(type) + ' 示意圖"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d4d33"/><stop offset="1" stop-color="#063524"/></linearGradient>' +
      '<marker id="' + id + 'a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#f2c75c"/></marker></defs>' +
      '<rect width="360" height="170" fill="url(#' + id + ')"/>';
    var P = function (cx, cy, r, deg) { var a = deg * Math.PI / 180; return [cx + Math.sin(a) * r, cy - Math.cos(a) * r]; };
    // Setup diagrams loop a short animation (CSS classes a-*, keyframes in style.css). Their resting
    // state is the finished pose, so the drawing is complete without motion.
    if (type === 'grip') {
      [[68, 15, 1, '弱 Weak', '1 個指節'], [180, -25, 2, '中性 Neutral', '2–3 個指節'], [292, -50, 4, '強 Strong', '4 個指節']].forEach(function (g, k) {
        var x = g[0], live = k === 1;
        if (live) o += '<rect x="' + (x - 54) + '" y="8" width="108" height="154" rx="14" fill="rgba(242,199,92,.10)" stroke="#f2c75c" stroke-opacity=".5"/>' + T(x, 24, '建議', 'middle', 'fd-t gold');
        o += '<rect x="' + (x - 8) + '" y="30" width="16" height="96" rx="7" fill="#2a2f2c"/>' +
          '<g class="' + (live ? 'a-hand' : '') + '"><ellipse cx="' + x + '" cy="80" rx="27" ry="33" fill="#f6f3ec" stroke="#d9d2bd"/>' +
          '<ellipse cx="' + (x - 5) + '" cy="104" rx="7" ry="13" fill="#ece6d8" stroke="#d9d2bd"/></g>';
        for (var n = 0; n < g[2]; n++) o += '<circle class="' + (live ? 'a-knuckle' : '') + '" style="animation-delay:' + (n * .18) + 's" cx="' + (x - 13 + n * 8.5) + '" cy="58" r="3.2" fill="' + (live ? '#f2c75c' : '#c9bfa8') + '"/>';
        var e = P(x, 96, 52, g[1]);
        o += '<line class="' + (live ? 'a-draw' : '') + '" pathLength="1" x1="' + x + '" y1="96" x2="' + e[0] + '" y2="' + e[1] + '" stroke="#f2c75c" stroke-width="2" marker-end="url(#' + id + 'a)"/>' +
          T(x, 140, g[3], 'middle', live ? 'fd-t gold' : 'fd-t') + T(x, 155, g[4], 'middle', 'fd-s');
      });
    } else if (type === 'stance') {
      o += '<rect y="112" width="360" height="58" fill="rgba(255,255,255,.04)"/>' +
        '<line x1="34" y1="72" x2="330" y2="72" stroke="#fbf8ef" stroke-width="1.2" stroke-dasharray="4 5" opacity=".6" marker-end="url(#' + id + 'a)"/>' + T(330, 62, '目標', 'end', 'fd-t gold') +
        '<g class="a-rfoot"><ellipse cx="138" cy="126" rx="11" ry="22" fill="#f6f3ec" opacity=".92"/></g>' +
        '<g class="a-lfoot"><ellipse cx="222" cy="126" rx="11" ry="22" fill="#f6f3ec" opacity=".92" transform="rotate(25 222 126)"/></g>' +
        T(138, 160, '右腳', 'middle', 'fd-s') + T(230, 160, '左腳 · 打開 20–30°', 'middle', 'fd-s');
      [[172, 'W', -1], [188, '7i', 1], [203, 'HY', -1], [216, 'DR', 1]].forEach(function (b) {
        o += '<circle cx="' + b[0] + '" cy="72" r="4.5" fill="#fff"/>' + T(b[0], b[2] < 0 ? 60 : 92, b[1], 'middle', 'fd-t gold');
      });
      o += '<circle class="a-ballpick" cx="172" cy="72" r="9" fill="none" stroke="#f2c75c" stroke-width="1.6"/>' +
        '<path class="a-late" d="M127 104 L127 98 L233 98 L233 104" fill="none" stroke="#fbf8ef" stroke-opacity=".5"/>' + '<g class="a-late">' + T(80, 102, '7 號鐵：與肩同寬', 'middle', 'fd-s') + '</g>' +
        T(340, 26, '球位：W 挖起桿在中間 → DR 一號木在左腳跟內側', 'end', 'fd-s');
    } else if (type === 'posture') {
      o += '<line x1="40" y1="154" x2="330" y2="154" stroke="#fbf8ef" stroke-opacity=".3"/>' +
        '<path class="a-legs-straight" d="M146 152 L143 122 L140 92" fill="none" stroke="#f6f3ec" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path class="a-legs-bent" d="M146 152 L152 124 L140 92" fill="none" stroke="#f6f3ec" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<line x1="136" y1="154" x2="166" y2="154" stroke="#f6f3ec" stroke-width="6" stroke-linecap="round"/>' +
        '<g class="a-hinge"><line x1="140" y1="92" x2="176" y2="40" stroke="#f6f3ec" stroke-width="8" stroke-linecap="round"/><circle cx="187" cy="27" r="10" fill="#f6f3ec"/></g>' +
        '<g class="a-arms"><line x1="176" y1="42" x2="178" y2="104" stroke="#e6e0d2" stroke-width="5" stroke-linecap="round"/>' +
        '<line x1="178" y1="104" x2="232" y2="150" stroke="#9aa59f" stroke-width="2.5" stroke-linecap="round"/></g><circle cx="240" cy="150" r="4.5" fill="#fff"/>' +
        '<g class="a-late"><line x1="176" y1="40" x2="176" y2="150" stroke="#f2c75c" stroke-dasharray="3 4" opacity=".8"/>' + T(184, 84, '手臂自然垂下', 'start', 'fd-s') +
        '<line x1="140" y1="92" x2="140" y2="52" stroke="#fbf8ef" stroke-dasharray="2 4" opacity=".6"/>' +
        '<path d="M140 68 A 24 24 0 0 1 153.8 72.3" fill="none" stroke="#f2c75c" stroke-width="1.6"/>' + T(132, 60, '前傾約 35°', 'end', 'fd-t gold') + '</g>' +
        T(126, 96, '從髖部前傾', 'end', 'fd-s') + T(144, 130, '膝蓋微彎', 'end', 'fd-s') + T(206, 60, '背部平直', 'start', 'fd-s');
    } else if (type === 'alignment') {
      for (var x = 54; x < 300; x += 26) o += '<line x1="' + x + '" y1="64" x2="' + x + '" y2="112" stroke="#fbf8ef" stroke-opacity=".12" stroke-width="5"/>';
      o += '<line class="a-draw1" pathLength="1" x1="70" y1="64" x2="318" y2="64" stroke="#fbf8ef" stroke-width="1.6"/>' +
        '<line class="a-draw2" pathLength="1" x1="40" y1="112" x2="300" y2="112" stroke="#f2c75c" stroke-width="1.6"/>' +
        '<line x1="318" y1="64" x2="318" y2="24" stroke="#fbf8ef" stroke-width="1.6"/><path class="wave" d="M318 24 l18 6 l-18 6z" fill="#f2c75c"/><ellipse cx="318" cy="65" rx="5" ry="2" fill="#0b2a18"/>' +
        '<circle cx="70" cy="64" r="4.5" fill="#fff"/><circle class="a-pulse" cx="114" cy="64" r="6" fill="none" stroke="#f2c75c" stroke-width="1.4"/>' + T(114, 50, '中間目標 · 1 公尺', 'middle', 'fd-s') +
        '<g class="a-feet"><ellipse cx="70" cy="120" rx="9" ry="5" fill="#f6f3ec" opacity=".9"/><ellipse cx="104" cy="120" rx="9" ry="5" fill="#f6f3ec" opacity=".9"/></g>' +
        T(250, 56, '目標線：球 → 旗桿', 'middle', 'fd-t') + '<g class="a-late">' + T(220, 138, '身體線：腳、髖、肩與目標線平行', 'middle', 'fd-t gold') + T(220, 155, '身體其實對準旗桿的左邊', 'middle', 'fd-s') + '</g>';
    } else if (type === 'swing') {
      var cx = 180, cy = 92, R = 64, at = function (deg, r) { return P(cx, cy, r || R, deg); };
      var hl = { back: [180, 330, 1, [1, 2, 3]], down: [330, 180, 0, [3, 4]], finish: [180, 45, 0, [4, 5]] }[phase];
      var a0 = at(330), a1 = at(45), h0 = at(hl[0]), h1 = at(hl[1]);
      var hand = { back: 330, down: 180, finish: 45 }[phase];
      var hp = at(hand, 30), ch = at(hand, R);
      o += '<line x1="40" y1="158" x2="320" y2="158" stroke="#fbf8ef" stroke-opacity=".25"/>' +
        '<path d="M' + a0[0] + ' ' + a0[1] + ' A ' + R + ' ' + R + ' 0 1 0 ' + a1[0] + ' ' + a1[1] + '" fill="none" stroke="#fbf8ef" stroke-opacity=".3" stroke-dasharray="3 5"/>' +
        '<path class="flight" pathLength="1" d="M' + h0[0] + ' ' + h0[1] + ' A ' + R + ' ' + R + ' 0 0 ' + hl[2] + ' ' + h1[0] + ' ' + h1[1] + '" fill="none" stroke="#f2c75c" stroke-width="2.4" marker-end="url(#' + id + 'a)"/>' +
        '<circle cx="' + cx + '" cy="48" r="9" fill="#f6f3ec"/><line x1="' + cx + '" y1="57" x2="' + cx + '" y2="108" stroke="#f6f3ec" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M' + (cx - 14) + ' 152 L' + cx + ' 108 L' + (cx + 14) + ' 152" fill="none" stroke="#f6f3ec" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<line x1="' + cx + '" y1="64" x2="' + hp[0] + '" y2="' + hp[1] + '" stroke="#e6e0d2" stroke-width="4.5" stroke-linecap="round"/>' +
        '<line x1="' + hp[0] + '" y1="' + hp[1] + '" x2="' + ch[0] + '" y2="' + ch[1] + '" stroke="#9aa59f" stroke-width="2.4" stroke-linecap="round"/>' +
        '<circle cx="' + cx + '" cy="' + (cy + R - 2) + '" r="4" fill="#fff"/>';
      var marks = { 1: [180, '1 準備'], 2: [240, '2 腰高 8 點'], 3: [330, '3 頂點'], 4: [180, '4 擊球'], 5: [45, '5 收桿'] };
      hl[3].forEach(function (m) {
        var p = at(marks[m][0], R + 16), left = p[0] < cx - 4, right = p[0] > cx + 4;
        var dot = at(marks[m][0]);
        o += '<circle cx="' + dot[0] + '" cy="' + dot[1] + '" r="4" fill="#f2c75c"/>' + (marks[m][0] === 180
          ? T(dot[0] + 12, dot[1] - 4, marks[m][1], 'start', 'fd-t gold')
          : T(p[0] + (left ? -4 : right ? 4 : 0), p[1] + 4, marks[m][1], left ? 'end' : right ? 'start' : 'middle', 'fd-t gold'));
      });
      if (phase === 'down') o += '<line x1="' + (cx + 4) + '" y1="112" x2="' + (cx + 40) + '" y2="112" stroke="#f2c75c" stroke-width="1.6" marker-end="url(#' + id + 'a)"/>' + T(cx + 46, 115, '左髖先動', 'start', 'fd-s');
      if (phase === 'finish') o += T(40, 30, '節奏 · 上桿 3 : 下桿 1', 'start', 'fd-t');
      o += T(340, 150, '面對球員的視角', 'end', 'fd-s');
    }
    return o + '</svg>';
  }

  /* One small picture per step (動作步驟) for the setup lessons. The part that changes is gold. */
  function stepFrames(id) {
    var G = '#f2c75c', C = '#f6f3ec';
    var svg = function (inner) { return '<svg class="step-svg" viewBox="0 0 200 130" aria-hidden="true"><rect width="200" height="130" rx="12" fill="#0b4a32"/>' + inner + '</svg>'; };
    var t = function (x, y, txt, a) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (a || 'middle') + '" class="sf-t">' + txt + '</text>'; };
    var arrow = function (x1, y1, x2, y2) {
      var a = Math.atan2(y2 - y1, x2 - x1), h = 6;
      return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + G + '" stroke-width="1.6"/><path d="M' + x2 + ' ' + y2 + ' L' + (x2 - h * Math.cos(a - .5)) + ' ' + (y2 - h * Math.sin(a - .5)) + ' L' + (x2 - h * Math.cos(a + .5)) + ' ' + (y2 - h * Math.sin(a + .5)) + 'z" fill="' + G + '"/>';
    };
    var eye = function (x, y) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="8" ry="5" fill="none" stroke="' + G + '" stroke-width="1.4"/><circle cx="' + x + '" cy="' + y + '" r="2.2" fill="' + G + '"/>'; };
    if (id === 'grip') {
      var hand = function (x, y, hl) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="22" ry="26" fill="' + C + '" stroke="' + (hl ? G : '#d9d2bd') + '" stroke-width="' + (hl ? 2 : 1) + '"/>'; };
      var bar = '<rect x="93" y="18" width="14" height="100" rx="6" fill="#2a2f2c"/>';
      return [
        svg(arrow(100, 40, 100, 14) + t(118, 22, '目標', 'start') + '<circle cx="100" cy="56" r="5" fill="#fff"/><rect x="78" y="66" width="44" height="18" rx="6" fill="#1f3b2f" stroke="#9aa59f"/><line x1="78" y1="66" x2="122" y2="66" stroke="' + G + '" stroke-width="3"/><line x1="112" y1="84" x2="112" y2="122" stroke="#9aa59f" stroke-width="3"/>' + t(136, 80, '桿面朝目標', 'start')),
        svg('<rect x="62" y="56" width="66" height="54" rx="12" fill="' + C + '"/>' + [70, 84, 98, 112].map(function (x, i) { return '<rect x="' + x + '" y="' + (24 + (i === 0 ? 10 : i === 3 ? 4 : 0)) + '" width="12" height="' + (34 - (i === 0 ? 10 : i === 3 ? 4 : 0)) + '" rx="6" fill="' + C + '"/>'; }).join('') +
          '<rect x="124" y="66" width="12" height="32" rx="6" fill="' + C + '" transform="rotate(-35 130 82)"/>' +
          '<line x1="66" y1="60" x2="126" y2="40" stroke="#2a2f2c" stroke-width="11" stroke-linecap="round" opacity=".85"/><line x1="66" y1="60" x2="126" y2="40" stroke="' + G + '" stroke-width="1.5" stroke-dasharray="3 3"/>' + t(100, 124, '手指根部，不是掌心')),
        svg(bar + hand(100, 70, false) + [0, 1, 2].map(function (n) { return '<circle cx="' + (86 + n * 9) + '" cy="50" r="3.5" fill="' + G + '"/>'; }).join('') + eye(100, 16) + arrow(100, 24, 100, 38) + t(128, 74, '2–3 個指節', 'start')),
        svg(bar + hand(100, 52, false) + hand(100, 84, true) + arrow(100, 62, 68, 26) + arrow(100, 96, 66, 62) + t(60, 20, '右肩', 'end') + t(160, 124, 'V 字指向右肩')),
        svg(t(100, 30, '握力') + Array.apply(null, Array(10)).map(function (_, i) { return '<rect x="' + (28 + i * 15) + '" y="52" width="12" height="22" rx="3" fill="' + (i < 4 ? G : 'rgba(251,248,239,.18)') + '"/>'; }).join('') +
          t(34, 92, '0') + t(85, 92, '4') + t(172, 92, '10') + t(100, 116, '像拿一條牙膏，不要擠出來'))
      ];
    }
    if (id === 'stance') {
      var feet = function (r, l, flare, hlR, hlL) {
        return '<ellipse cx="' + r + '" cy="86" rx="7" ry="14" fill="' + C + '" stroke="' + (hlR ? G : 'none') + '" stroke-width="2"/>' +
          '<ellipse cx="' + l + '" cy="86" rx="7" ry="14" fill="' + C + '" stroke="' + (hlL ? G : 'none') + '" stroke-width="2" transform="rotate(' + (flare ? 25 : 0) + ' ' + l + ' 86)"/>';
      };
      var base = '<line x1="18" y1="34" x2="178" y2="34" stroke="#fbf8ef" stroke-dasharray="3 4" opacity=".5"/>' + t(196, 26, '目標', 'end') + '<circle cx="100" cy="34" r="5" fill="#fff"/>';
      return [
        svg(base + feet(92, 108, false, true, true) + '<line x1="100" y1="40" x2="100" y2="70" stroke="' + G + '" stroke-dasharray="2 3"/>' + t(100, 120, '雙腳併攏，球在正中間')),
        svg(base + feet(92, 120, true, false, true) + arrow(108, 108, 122, 108) + t(100, 124, '左腳往目標一小步')),
        svg(base + feet(66, 120, true, true, false) + arrow(92, 106, 68, 106) + '<path d="M59 118 L59 114 L127 114 L127 118" fill="none" stroke="#fbf8ef" stroke-opacity=".5"/>' + t(93, 127, '右腳一大步：與肩同寬')),
        svg(base + feet(66, 120, true, false, false) + '<circle cx="66" cy="86" r="3" fill="' + G + '"/><circle cx="120" cy="86" r="3" fill="' + G + '"/>' + t(100, 116, '膝蓋微彎') + t(100, 128, '重心在腳掌中間'))
      ];
    }
    if (id === 'posture') {
      var fig = function (a, bend, arms, hl) {
        var r = a * Math.PI / 180, hip = [90 - (a ? 6 : 0), 66], sh = [hip[0] + Math.sin(r) * 40, hip[1] - Math.cos(r) * 40], hd = [hip[0] + Math.sin(r) * 52 + (a ? 3 : 0), hip[1] - Math.cos(r) * 52];
        var knee = [hip[0] + (bend ? 10 : 2), 92];
        var o2 = '<line x1="40" y1="118" x2="170" y2="118" stroke="#fbf8ef" stroke-opacity=".3"/><line x1="80" y1="118" x2="102" y2="118" stroke="' + C + '" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M88 116 L' + knee[0] + ' ' + knee[1] + ' L' + hip[0] + ' ' + hip[1] + '" fill="none" stroke="' + (hl === 'knee' ? G : C) + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<line x1="' + hip[0] + '" y1="' + hip[1] + '" x2="' + sh[0] + '" y2="' + sh[1] + '" stroke="' + (hl === 'spine' ? G : C) + '" stroke-width="6" stroke-linecap="round"/><circle cx="' + hd[0] + '" cy="' + hd[1] + '" r="8" fill="' + C + '"/>';
        if (arms === 'hip') o2 += '<line x1="' + sh[0] + '" y1="' + sh[1] + '" x2="' + (hip[0] + 8) + '" y2="' + (hip[1] + 2) + '" stroke="#e6e0d2" stroke-width="4" stroke-linecap="round"/><circle cx="' + (hip[0] + 8) + '" cy="' + (hip[1] + 2) + '" r="4" fill="' + G + '"/>';
        else { var hand = [sh[0] + 1, sh[1] + 50]; o2 += '<line x1="' + sh[0] + '" y1="' + sh[1] + '" x2="' + hand[0] + '" y2="' + hand[1] + '" stroke="' + G + '" stroke-width="4" stroke-linecap="round"/><line x1="' + hand[0] + '" y1="' + hand[1] + '" x2="' + (hand[0] + 38) + '" y2="116" stroke="#9aa59f" stroke-width="2"/><circle cx="' + (hand[0] + 44) + '" cy="115" r="3.5" fill="#fff"/>'; }
        return o2;
      };
      return [
        svg(fig(0, false, 'hip') + t(122, 56, '站直', 'start') + t(122, 70, '球桿橫放髖部', 'start')),
        svg(fig(35, false, 'hip', 'spine') + arrow(78, 70, 58, 70) + t(46, 60, '推髖', 'middle') + t(134, 40, '從髖部前傾', 'start') + t(134, 54, '背部平直', 'start')),
        svg(fig(35, true, 'hip', 'knee') + t(132, 96, '膝蓋微彎', 'start')),
        svg(fig(35, true, 'hang') + t(196, 128, '手臂自然垂下握桿', 'end'))
      ];
    }
    if (id === 'alignment') {
      var flag = '<line x1="178" y1="62" x2="178" y2="30" stroke="#fbf8ef" stroke-width="1.4"/><path d="M178 30 l14 5 l-14 5z" fill="' + G + '"/><circle cx="54" cy="62" r="4.5" fill="#fff"/>';
      var tline = function (hl) { return '<line x1="54" y1="62" x2="178" y2="62" stroke="' + (hl ? G : '#fbf8ef') + '" stroke-width="1.3" stroke-dasharray="' + (hl ? '3 4' : '0') + '" opacity="' + (hl ? 1 : .55) + '"/>'; };
      var mid = function (hl) { return '<circle cx="82" cy="62" r="5" fill="none" stroke="' + (hl ? G : '#fbf8ef') + '" stroke-width="1.4" opacity="' + (hl ? 1 : .7) + '"/>'; };
      var face = function (hl) { return '<line x1="47" y1="52" x2="47" y2="72" stroke="' + (hl ? G : '#9aa59f') + '" stroke-width="3" stroke-linecap="round"/>'; };
      var body = function (hl) { return '<line x1="24" y1="94" x2="150" y2="94" stroke="' + (hl ? G : '#fbf8ef') + '" stroke-width="1.6" opacity="' + (hl ? 1 : .6) + '"/><ellipse cx="40" cy="102" rx="7" ry="4" fill="' + C + '"/><ellipse cx="66" cy="102" rx="7" ry="4" fill="' + C + '"/>'; };
      return [
        svg(flag + eye(20, 62) + tline(true) + t(100, 110, '站在球的正後方看線')),
        svg(flag + tline() + mid(true) + t(82, 48, '1 公尺') + t(100, 110, '選一個中間目標')),
        svg(flag + tline() + mid() + face(true) + t(100, 110, '桿面先對準中間目標')),
        svg(flag + tline() + mid() + face() + body(true) + t(100, 122, '腳、髖、肩與目標線平行')),
        svg(flag + tline() + mid() + face() + body() + '<line x1="53" y1="92" x2="176" y2="40" stroke="' + G + '" stroke-dasharray="2 4"/>' + eye(52, 86) + t(118, 120, '最後看一次目標'))
      ];
    }
    return null;
  }

  function lessonArt(l, opts) { return l.art ? fundSVG(l.art, l.phase) : shotSVG(l.shot, opts || { label: l.title }); }
  var sectionOf = function (cat) { return GL.sections.filter(function (x) { return x.cats.indexOf(cat) > -1; })[0]; };
  var lessonOrder = function () {
    var out = [];
    GL.sections.forEach(function (sec) { sec.cats.forEach(function (c) { GL.lessons.forEach(function (l) { if (l.cat === c) out.push(l); }); }); });
    return out;
  };

  /* ---------- HOME ---------- */
  function home() {
    var hero = $('#heroArt');
    if (hero) hero.innerHTML = courseSVG();

    var feat = GL.lessons.filter(function (l) { return l.featured; });
    var tick = $('#ticker');
    if (tick) {
      tick.innerHTML = '<div class="tk-badge"><span>R1</span><small>Featured<br>Lessons</small></div>' + feat.concat(feat).map(function (l, i) {
        var c = catById(l.cat);
        return '<a class="tk" href="learn.html#' + l.id + '"' + (i >= feat.length ? ' aria-hidden="true" tabindex="-1"' : '') + '><span class="tk-pos">' + ((i % feat.length) + 1) + '</span>' +
          '<span class="tk-art">' + shotSVG(l.shot, { still: true }) + '</span>' +
          '<span class="tk-name">' + esc(l.title) + '<small>' + c.name + ' · <em>' + l.mins + '′</em></small></span>' + icon('star', 'tk-star') + '</a>';
      }).join('');
    }

    var acad = $('#academy');
    if (acad) {
      acad.innerHTML = ['bump-and-run', 'pitch-shot', 'flop-shot', 'putter-from-fringe'].map(function (id) {
        var l = lessonById(id);
        return '<a class="academy-card" href="learn.html#' + l.id + '"><div class="ac-art">' + shotSVG(l.shot, { label: l.title }) + '</div>' +
          '<h3>' + esc(l.title) + '</h3><p>' + esc(l.zh) + '</p></a>';
      }).join('');
    }

    var about = $('#aboutArt');
    if (about) about.innerHTML = shotSVG({ air: 0.4, h: 0.45, lie: 'fairway' }, { label: 'Shot Selector' });

    var tools = $('#tools');
    if (tools) {
      var T = [['book', 'learn.html', 'Learn Golf', '技巧教學', '4 大單元 · ' + GL.lessons.length + ' 篇'], ['club', 'clubs.html', 'Club Guide', '球桿選擇', '6 種球桿'],
        ['compass', 'fix.html', 'Fix My Shot', '擊球問題診斷', GL.problems.length + ' 種問題'], ['target', 'shot.html', 'Shot Selector', '短桿打法推薦', '4 個問題'], ['clock', 'practice.html', 'Practice', '練習計畫', '15 / 30 分鐘'], ['chart', 'my-game.html', 'My Game', '我的成績分析', '計分卡 + 統計']];
      tools.innerHTML = T.map(function (t) {
        return '<a class="tool" href="' + t[1] + '"><span class="ti">' + icon(t[0]) + '</span><strong>' + t[2] + '</strong><small>' + t[3] + '</small><span class="tag">' + t[4] + '</span></a>';
      }).join('');
    }

    var sc = $('#homeScore');
    if (sc) {
      var rows = [['56°', '1 : 1', 'Flop / Pitch'], ['PW', '1 : 2', 'Standard Chip'], ['9i', '1 : 3', 'Bump & Run'], ['8i', '1 : 4', 'Bump & Run'], ['7i', '1 : 5', 'Long Bump & Run']];
      sc.innerHTML = '<table class="scorecard"><thead><tr><th>Club</th>' + rows.map(function (r) { return '<th>' + r[0] + '</th>'; }).join('') + '</tr></thead><tbody>' +
        '<tr class="par"><th>空中 : 滾動</th>' + rows.map(function (r) { return '<td>' + r[1] + '</td>'; }).join('') + '</tr>' +
        '<tr><th>用途</th>' + rows.map(function (r, i) { return '<td><span class="sym ' + (i < 2 ? 'circle' : i < 4 ? 'square' : 'dsquare') + '">' + r[2] + '</span></td>'; }).join('') + '</tr>' +
        '</tbody></table>';
    }
    var pop = $('#popular');
    if (pop) pop.innerHTML = ['grip', 'stance', 'posture', 'alignment', 'iron-basics', 'short-putts'].map(function (id) {
      var l = lessonById(id);
      return '<li><a href="learn.html#' + l.id + '"><span class="pl-art">' + lessonArt(l) + '</span><span class="pl-t"><strong>' + esc(l.zh) + '</strong><small>' + esc(l.key || '') + '</small></span><span class="pl-m">' + l.mins + ' 分鐘</span></a></li>';
    }).join('');
    var inp = $('#search');
    if (inp) bindSearch(inp, $('#searchResults'));
    contact();
  }


  /* ---------- CONTACT (home) ---------- */
  function contact() {
    var form = $('#contactForm');
    if (!form) return;
    var TO = $('#ctEmail').textContent.trim();
    var status = $('#ctStatus'), send = $('#ctSend'), gmail = $('#ctGmail');
    var say = function (t, cls) { status.textContent = t; status.className = 'cf-status ' + (cls || ''); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      gmail.hidden = true;
      var d = {};
      new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
      if (d._honey) return;
      if (!d.name || !d.message || !d.email || !form.elements.email.checkValidity()) { say('請填寫姓名、有效的 Email 和訊息。', 'err'); return; }
      var subject = 'PAR/A：' + d.topic + '（' + d.name + '）';
      send.disabled = true; say('傳送中…');
      fetch('https://formsubmit.co/ajax/' + TO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: d.name, email: d.email, _replyto: d.email, _subject: subject, topic: d.topic, message: d.message, _template: 'table' })
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        form.reset(); say('謝謝！訊息已送出，我們會盡快回覆你。', 'ok');
      }).catch(function () {
        // Offline, blocked or the service is down: hand the message to Gmail instead.
        gmail.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(TO) + '&su=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(d.message + '\n\n— ' + d.name + ' (' + d.email + ')');
        gmail.hidden = false;
        say('目前無法直接送出。請用 Gmail 開啟並按下傳送，或寄信到 ' + TO + '。', 'err');
      }).then(function () { send.disabled = false; });
    });
    var copy = $('#ctCopy');
    copy.addEventListener('click', function () {
      var done = function () { copy.textContent = '已複製'; setTimeout(function () { copy.textContent = '複製'; }, 1800); };
      var select = function () { var r = document.createRange(); r.selectNodeContents($('#ctEmail')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); };
      try { navigator.clipboard.writeText(TO).then(done, select); } catch (e) { select(); }
    });
  }


  /* ---------- RULES ---------- */
  function holeMapSVG() {
    // Side-by-side schematic of one hole: tee → fairway → bunker / water → green, OB along the top.
    return '<svg class="hole-map" viewBox="0 0 900 300" role="img" aria-label="球場區域圖，點擊區域查看規則">' +
      '<rect width="900" height="300" rx="22" fill="#2c5e2a"/>' +
      '<g class="zone" data-zone="lost" tabindex="0" role="button" aria-label="界外"><rect x="0" y="0" width="900" height="46" rx="22" fill="#1b4220"/>' +
      Array.apply(null, Array(11)).map(function (_, i) { return '<rect x="' + (40 + i * 80) + '" y="34" width="6" height="26" rx="2" fill="#fbf8ef"/>'; }).join('') +
      '<text x="450" y="28" text-anchor="middle" class="zl">OUT OF BOUNDS · 界外（白樁）</text></g>' +
      '<g class="zone" data-zone="general" tabindex="0" role="button" aria-label="一般區域"><path d="M118 196 C 260 120 420 110 560 150 S 700 230 760 190 L 760 250 C 640 290 520 230 400 230 S 200 270 118 250 Z" fill="#4c8738"/><text x="330" y="200" text-anchor="middle" class="zl">GENERAL AREA · 一般區域</text></g>' +
      '<g class="zone" data-zone="tee" tabindex="0" role="button" aria-label="開球區"><rect x="36" y="180" width="80" height="70" rx="10" fill="#5fa64a"/><circle cx="54" cy="196" r="5" fill="#fbf8ef"/><circle cx="98" cy="196" r="5" fill="#fbf8ef"/><text x="76" y="272" text-anchor="middle" class="zl">TEE · 開球區</text></g>' +
      '<g class="zone" data-zone="penalty" tabindex="0" role="button" aria-label="罰桿區"><path d="M470 66 C 540 56 620 70 640 100 C 656 124 600 140 540 136 C 480 132 430 112 440 90 C 446 76 456 68 470 66 Z" fill="#3d7fa8"/><path d="M470 66 C 540 56 620 70 640 100 C 656 124 600 140 540 136 C 480 132 430 112 440 90 C 446 76 456 68 470 66 Z" fill="none" stroke="#c8102e" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round"/><text x="540" y="104" text-anchor="middle" class="zl">PENALTY AREA · 罰桿區</text></g>' +
      '<g class="zone" data-zone="bunker" tabindex="0" role="button" aria-label="沙坑"><path d="M690 250 c 20 -26 70 -26 86 -6 c 12 16 -20 30 -50 30 c -26 0 -46 -8 -36 -24z" fill="#efe6cf"/><text x="732" y="292" text-anchor="middle" class="zl">BUNKER · 沙坑</text></g>' +
      '<g class="zone" data-zone="green" tabindex="0" role="button" aria-label="果嶺"><ellipse cx="808" cy="170" rx="70" ry="52" fill="#86c062"/><line x1="814" y1="172" x2="814" y2="124" stroke="#fbf8ef" stroke-width="2.5"/><path d="M814 124 l20 7 l-20 7z" fill="#f2c75c"/><ellipse cx="814" cy="173" rx="5" ry="2" fill="#0b2a18"/><text x="808" y="208" text-anchor="middle" class="zl">GREEN · 果嶺</text></g>' +
      '<g class="zone" data-zone="relief" tabindex="0" role="button" aria-label="免罰救濟"><path d="M150 286 C 300 262 480 262 680 300" fill="none" stroke="#b9b3a1" stroke-width="10" stroke-linecap="round"/><text x="250" y="294" class="zl small">CART PATH · 電車道（免罰救濟）</text></g>' +
      '</svg>';
  }

  function reliefSVG() {
    // Penalty area relief: entry point X on the margin, back-on-the-line, lateral (red only), stroke & distance.
    return '<svg class="relief-svg" viewBox="0 0 520 360" role="img" aria-label="罰桿區救濟選項示意圖">' +
      '<rect width="520" height="360" rx="20" fill="#2f6b34"/>' +
      '<ellipse cx="430" cy="70" rx="70" ry="44" fill="#86c062"/><line x1="440" y1="72" x2="440" y2="34" stroke="#fbf8ef" stroke-width="2"/><path d="M440 34 l16 6 l-16 6z" fill="#f2c75c"/>' +
      '<path d="M210 120 C 290 100 360 130 350 180 C 340 226 260 236 214 214 C 170 192 160 136 210 120 Z" fill="#3d7fa8"/>' +
      '<path d="M210 120 C 290 100 360 130 350 180 C 340 226 260 236 214 214 C 170 192 160 136 210 120 Z" fill="none" stroke="#c8102e" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>' +
      '<line x1="440" y1="72" x2="40" y2="318" stroke="#fbf8ef" stroke-width="1.5" stroke-dasharray="5 6" opacity=".8"/>' +
      '<path d="M 70 330 Q 160 260 238 213" fill="none" stroke="#fbf8ef" stroke-width="1.6" opacity=".55"/>' +
      '<circle cx="70" cy="330" r="7" fill="#fbf8ef"/>' +
      '<g transform="translate(222 206)"><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#f2c75c" stroke-width="3" stroke-linecap="round"/></g>' +
      '<path d="M 186 230 A 44 44 0 0 1 258 244" fill="rgba(242,199,92,.18)" stroke="#f2c75c" stroke-width="1.6"/>' +
      '<path d="M222 206 L 186 230 M222 206 L 258 244" stroke="#f2c75c" stroke-width="1" opacity=".6"/>' +
      '<circle cx="130" cy="263" r="13" fill="#f2c75c"/><text x="130" y="268" text-anchor="middle" class="rn">2</text>' +
      '<circle cx="272" cy="238" r="13" fill="#f2c75c"/><text x="272" y="243" text-anchor="middle" class="rn">3</text>' +
      '<circle cx="96" cy="336" r="13" fill="#f2c75c"/><text x="96" y="341" text-anchor="middle" class="rn">1</text>' +
      '<text x="238" y="196" class="rl">X 越過邊界的點</text>' +
      '<text x="18" y="300" class="rl">上一桿位置</text>' +
      '<text x="150" y="292" class="rl">往後的直線（不限距離）</text>' +
      '</svg>';
  }

  function rules() {
    var state = { area: 'all', q: '' };
    var penBadge = function (p) {
      return p === 0 ? '<span class="pen free">免罰</span>' : p === 'x' ? '<span class="pen info">規則說明</span>' : '<span class="pen p' + p + '">罰 ' + p + ' 桿</span>';
    };
    $('#holeMap').innerHTML = holeMapSVG();
    $('#reliefArt').innerHTML = reliefSVG();
    $('#penaltyRef').innerHTML = GL.penaltyTable.map(function (r) {
      var cls = r[1] === '免罰' ? 'free' : /2 桿/.test(r[1]) ? 'p2' : 'p1';
      return '<li><span>' + esc(r[0]) + '</span><b class="pen ' + cls + '">' + esc(r[1]) + '</b></li>';
    }).join('');
    $('#scoreTerms').innerHTML = '<table class="scorecard terms"><thead><tr><th>Score</th>' + GL.scoreTerms.map(function (t) { return '<th>' + t.t + '</th>'; }).join('') + '</tr></thead><tbody>' +
      '<tr class="par"><th>中文</th>' + GL.scoreTerms.map(function (t) { return '<td>' + t.zh + '</td>'; }).join('') + '</tr>' +
      '<tr><th>To Par</th>' + GL.scoreTerms.map(function (t) { return '<td><span class="sym ' + t.sym + '">' + t.v + '</span></td>'; }).join('') + '</tr>' +
      '<tr class="desc"><th>說明</th>' + GL.scoreTerms.map(function (t) { return '<td>' + esc(t.d) + '</td>'; }).join('') + '</tr></tbody></table>';
    $('#etiquette').innerHTML = GL.etiquette.map(function (e, i) { return '<li><span class="pn">' + (i + 1) + '</span><div><h4>' + esc(e[0]) + '</h4><p>' + esc(e[1]) + '</p></div></li>'; }).join('');

    function draw() {
      $$('[data-area]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-area') === state.area); });
      $$('.zone').forEach(function (z) { z.classList.toggle('on', z.getAttribute('data-zone') === state.area); });
      var q = state.q.toLowerCase();
      var areas = GL.ruleAreas.filter(function (a) { return state.area === 'all' || a.id === state.area; });
      var html = '', n = 0;
      areas.forEach(function (a) {
        var list = GL.rules.filter(function (r) { return r.area === a.id && (!q || (r.q + r.a + r.rule).toLowerCase().indexOf(q) !== -1); });
        if (!list.length) return;
        n += list.length;
        html += '<section class="rule-group" id="g-' + a.id + '"><div class="rg-head"><h2>' + a.name + ' <span class="zh">' + a.zh + '</span></h2><p>' + a.desc + '</p></div>' +
          '<div class="rule-list">' + list.map(function (r) {
            return '<details class="rule"' + (q ? ' open' : '') + '><summary><span class="rq">' + esc(r.q) + '</span>' + penBadge(r.pen) + '</summary>' +
              '<div class="ra"><p>' + esc(r.a) + '</p><span class="rno">Rule ' + esc(r.rule) + '</span></div></details>';
          }).join('') + '</div></section>';
      });
      $('#ruleList').innerHTML = html || '<p class="empty-stats">找不到「' + esc(state.q) + '」相關的規則，試試「沙坑」、「界外」或「旗桿」。</p>';
      $('#ruleCount').textContent = n + ' 條規則';
      reveal($('#ruleList'));
      linkTerms($('#ruleList'));
    }
    $('#areaTabs').innerHTML = '<button type="button" role="tab" data-area="all">全部<small>All</small></button>' + GL.ruleAreas.map(function (a) {
      return '<button type="button" role="tab" data-area="' + a.id + '">' + a.zh + '<small>' + a.name + '</small></button>';
    }).join('');
    var pick = function (a, scroll) {
      state.area = a;
      if (location.hash.slice(1) !== a) history.replaceState(null, '', a === 'all' ? location.pathname : '#' + a);
      draw();
      if (scroll) { var t = $('#ruleList'); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 150, behavior: 'smooth' }); }
    };
    $$('[data-area]').forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-area')); }); });
    $$('.zone').forEach(function (z) {
      var go = function () { pick(z.getAttribute('data-zone'), true); };
      z.addEventListener('click', go);
      z.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    $('#ruleSearch').addEventListener('input', function () { state.q = this.value.trim(); draw(); });
    var h = location.hash.slice(1);
    state.area = GL.ruleAreas.some(function (a) { return a.id === h; }) ? h : 'all';
    draw();
  }


  /* ---------- START HERE ---------- */
  function start() {
    var level = store.get('level', null), hl = location.hash.slice(1);
    if (GL.paths[hl]) { level = hl; store.set('level', hl); }
    var linkDone = store.get('pathdone', {});
    function itemHTML(it, wk, k) {
      if (it.lesson) {
        var l = lessonById(it.lesson), done = isLearned(l.id);
        return '<li class="pi' + (done ? ' done' : '') + '"><span class="pi-check" aria-hidden="true">' + icon('check') + '</span><a href="learn.html#' + l.id + '"><strong>' + esc(l.zh) + '</strong><small>教學 · ' + esc(l.title) + ' · ' + l.mins + ' 分鐘</small></a></li>';
      }
      var key = wk + '-' + k, d = !!linkDone[key];
      return '<li class="pi' + (d ? ' done' : '') + '"><button type="button" class="pi-check" data-done="' + key + '" aria-pressed="' + d + '" aria-label="完成：' + esc(it.t) + '">' + icon('check') + '</button><a href="' + it.href + '"><strong>' + esc(it.t) + '</strong><small>' + esc(it.s) + '</small></a></li>';
    }
    function draw() {
      $$('[data-level]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-level') === level); });
      var box = $('#pathBox');
      if (!level) { box.innerHTML = '<p class="path-empty">先選一個最接近你的狀態，我們會給你一條 4 週的學習路線。</p>'; return; }
      var weeks = GL.paths[level], total = 0, done = 0;
      weeks.forEach(function (w, wi) { w.items.forEach(function (it, k) { total++; if (it.lesson ? isLearned(it.lesson) : linkDone[wi + '-' + k]) done++; }); });
      box.innerHTML = '<div class="path-progress"><div><span class="eyebrow">你的進度</span><strong>' + done + ' / ' + total + '</strong></div><div class="pp-bar"><i style="width:' + (done / total * 100) + '%"></i></div><p>教學頁按下「標記為已學會」會自動打勾；其他項目完成後自己點一下勾勾。</p></div>' +
        '<div class="weeks">' + weeks.map(function (w, wi) {
          var wd = w.items.filter(function (it, k) { return it.lesson ? isLearned(it.lesson) : linkDone[wi + '-' + k]; }).length;
          return '<section class="week' + (wd === w.items.length ? ' complete' : '') + '"><div class="wk-head"><span class="wk-n">' + w.w + '</span><h3>' + esc(w.t) + '</h3><span class="wk-c">' + wd + ' / ' + w.items.length + '</span></div><ul class="path-items">' + w.items.map(function (it, k) { return itemHTML(it, wi, k); }).join('') + '</ul></section>';
        }).join('') + '</div>';
      $$('[data-done]', box).forEach(function (b) {
        b.addEventListener('click', function () { var key = b.getAttribute('data-done'); linkDone[key] = !linkDone[key]; store.set('pathdone', linkDone); draw(); });
      });
      reveal(box);
    }
    $('#levelPick').innerHTML = GL.levels.map(function (lv, i) {
      return '<button type="button" class="level" data-level="' + lv.id + '"><span class="lv-n">0' + (i + 1) + '</span><strong>' + lv.t + '</strong><small>' + lv.s + '</small></button>';
    }).join('');
    $$('[data-level]').forEach(function (b) {
      b.addEventListener('click', function () {
        level = b.getAttribute('data-level'); store.set('level', level); draw();
        var t = $('#pathBox'); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
      });
    });
    draw();
    if (GL.paths[hl]) setTimeout(function () { var t = $('#pathBox'); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 90 }); }, 80);
  }


  /* Flat clothing drawings for the outfit guide (120 × 120). */
  function outfitSVG(type) {
    var C = '#f6f3ec', E = '#d9d2bd', G = '#0b4a32', o = '';
    var body = function (neck, sleeves, fill) {
      var p = sleeves ? 'M34 30 L48 22 Q60 30 72 22 L86 30 L104 50 L90 60 L86 54 L86 104 L34 104 L34 54 L30 60 L16 50 Z' : 'M40 22 Q60 34 80 22 L84 40 L84 104 L36 104 L36 40 Z';
      return '<path d="' + p + '" fill="' + fill + '" stroke="' + E + '" stroke-width="1.5" stroke-linejoin="round"/>' + neck;
    };
    if (type === 'polo') o = body('<path d="M48 22 L60 36 L72 22 L67 20 L60 29 L53 20 Z" fill="#fff" stroke="' + E + '"/><line x1="60" y1="36" x2="60" y2="56" stroke="' + E + '"/><circle cx="60" cy="43" r="1.6" fill="' + E + '"/><circle cx="60" cy="51" r="1.6" fill="' + E + '"/>', true, '#e7f0ea');
    else if (type === 'tee') o = body('<path d="M48 22 Q60 34 72 22" fill="none" stroke="' + E + '" stroke-width="2"/>', true, '#efe9dc');
    else if (type === 'tank') o = body('<path d="M44 24 Q60 40 76 24" fill="none" stroke="' + E + '" stroke-width="2"/>', false, '#efe9dc');
    else if (type === 'pants' || type === 'jeans') {
      var f = type === 'jeans' ? '#5b7a9d' : '#d9cfb4';
      o = '<path d="M36 16 H84 L90 108 H66 L60 46 L54 108 H30 Z" fill="' + f + '" stroke="' + (type === 'jeans' ? '#3f5c7c' : E) + '" stroke-width="1.5" stroke-linejoin="round"/><line x1="36" y1="24" x2="84" y2="24" stroke="' + (type === 'jeans' ? '#3f5c7c' : '#bfb497') + '" stroke-width="2"/>' +
        (type === 'jeans' ? '<path d="M42 30 Q48 38 56 32 M78 30 Q72 38 64 32" fill="none" stroke="#f2c75c" stroke-width="1" stroke-dasharray="2 2"/>' : '<circle cx="60" cy="20" r="2" fill="#bfb497"/>');
    }
    else if (type === 'skirt') o = '<path d="M38 26 H82 L96 92 H24 Z" fill="#f3dfe3" stroke="#e3c3ca" stroke-width="1.5" stroke-linejoin="round"/><line x1="38" y1="34" x2="82" y2="34" stroke="#e3c3ca" stroke-width="2"/><path d="M50 36 L44 92 M60 36 L60 92 M70 36 L76 92" stroke="#e3c3ca"/>';
    else if (type === 'shorts') o = '<path d="M34 34 H86 L92 72 H66 L60 54 L54 72 H28 Z" fill="#cfd8e3" stroke="#a9b6c6" stroke-width="1.5" stroke-linejoin="round"/><path d="M34 40 H86" stroke="#a9b6c6" stroke-width="3"/><path d="M58 42 L56 52 M62 42 L64 52" stroke="#fff"/>';
    else if (type === 'shoes') o = '<path d="M14 80 Q16 62 38 60 L62 54 Q76 52 84 62 L102 72 Q110 78 104 86 L20 88 Q12 86 14 80 Z" fill="#fff" stroke="' + E + '" stroke-width="1.5"/><path d="M14 84 L106 84" stroke="' + G + '" stroke-width="5" stroke-linecap="round"/><path d="M44 62 L52 72 M52 60 L60 70 M60 58 L68 68" stroke="' + E + '" stroke-width="1.5"/>' + [26, 44, 62, 80, 96].map(function (x) { return '<circle cx="' + x + '" cy="90" r="2.2" fill="' + G + '"/>'; }).join('');
    else if (type === 'cap') o = '<path d="M28 70 Q30 36 60 34 Q88 36 90 70 Z" fill="' + G + '"/><path d="M84 66 Q108 66 112 76 Q94 80 82 74 Z" fill="#083826"/><circle cx="59" cy="36" r="3" fill="#0d5c3e"/><path d="M60 46 l6 3 l-6 3z" fill="#f2c75c"/>';
    else if (type === 'glove') o = '<path d="M40 104 L40 60 Q40 50 46 50 L46 26 Q46 20 52 20 Q58 20 58 26 L58 46 L58 20 Q58 14 64 14 Q70 14 70 20 L70 46 L70 24 Q70 18 76 18 Q82 18 82 24 L82 50 L84 34 Q86 28 91 30 Q95 32 94 38 L90 72 Q88 90 80 104 Z" fill="#fff" stroke="' + E + '" stroke-width="1.5" stroke-linejoin="round"/><rect x="44" y="92" width="34" height="8" rx="3" fill="' + G + '"/>';
    return '<svg class="outfit-svg" viewBox="0 0 120 120" aria-hidden="true">' + o + '</svg>';
  }

  /* ---------- FIRST TIME GUIDE ---------- */
  function guide() {
    var DO = [['polo', 'Polo 衫', '有領，最安全的選擇'], ['pants', '卡其長褲', '或及膝短褲，看球場規定'], ['skirt', '球裙、褲裙', '及膝或稍短一點'], ['shoes', '高爾夫球鞋', '新手買無釘的，平常也能穿'], ['cap', '帽子或遮陽帽', '擋太陽，也不會刺眼'], ['glove', '手套', '右手球員戴左手']];
    var DONT = [['tee', '圓領 T 恤', '多數球場不接受'], ['jeans', '牛仔褲', '幾乎所有球場都不行'], ['tank', '無領背心', '有領的無袖上衣通常可以'], ['shorts', '運動短褲', '太短、太休閒']];
    var card = function (x, ok) { return '<figure class="outfit ' + (ok ? 'ok' : 'no') + '">' + outfitSVG(x[0]) + '<span class="mark" aria-hidden="true">' + (ok ? '✓' : '✕') + '</span><figcaption><strong>' + x[1] + '</strong><small>' + x[2] + '</small></figcaption></figure>'; };
    if ($('#outfitDo')) {
      $('#outfitDo').innerHTML = DO.map(function (x) { return card(x, true); }).join('');
      $('#outfitDont').innerHTML = DONT.map(function (x) { return card(x, false); }).join('');
      var ITEMS = ['Polo 衫（多帶一件替換）', '長褲、及膝短褲或球裙', '皮帶', '高爾夫球鞋', '帽子', '手套（多帶一副）', '防曬乳、袖套', '雨具或防風外套', '回程換洗的衣服'];
      var drawCheck = function () {
        var done = store.get('outfitcheck', []);
        $('#outfitCheck').innerHTML = ITEMS.map(function (t, i) {
          var on = done.indexOf(i) > -1;
          return '<li><label class="' + (on ? 'on' : '') + '"><input type="checkbox" data-i="' + i + '"' + (on ? ' checked' : '') + '><span class="box">' + icon('check') + '</span>' + t + '</label></li>';
        }).join('');
        $$('#outfitCheck input').forEach(function (c) {
          c.addEventListener('change', function () {
            var d = store.get('outfitcheck', []), i = +c.getAttribute('data-i');
            d = c.checked ? d.concat([i]) : d.filter(function (x) { return x !== i; });
            store.set('outfitcheck', d); drawCheck();
          });
        });
      };
      drawCheck();
      $('#outfitReset').addEventListener('click', function () { store.set('outfitcheck', []); drawCheck(); });
      reveal($('#outfit'));
    }
    linkTerms($('main'));
    var go = function () { var t = location.hash && document.getElementById(location.hash.slice(1)); if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 90 }); };
    setTimeout(go, 60);
  }

  /* ---------- GLOSSARY ---------- */
  function glossary() {
    var groups = [];
    GL.glossary.forEach(function (g) { if (groups.indexOf(g.g) < 0) groups.push(g.g); });
    var q = '';
    function draw() {
      var ql = q.toLowerCase(), n = 0;
      $('#glossList').innerHTML = groups.map(function (gr) {
        var list = GL.glossary.filter(function (g) { return g.g === gr && (!ql || (g.t + g.zh + g.d).toLowerCase().indexOf(ql) > -1); });
        n += list.length;
        if (!list.length) return '';
        return '<section class="gl-group"><h2>' + gr + '</h2><dl>' + list.map(function (g) {
          return '<div class="gl-item" id="' + esc(g.t) + '"><dt>' + esc(g.zh) + '<span>' + esc(g.t) + '</span></dt><dd>' + esc(g.d) + '</dd></div>';
        }).join('') + '</dl></section>';
      }).join('') || '<p class="empty-stats">找不到「' + esc(q) + '」，試試「差點」或「Loft」。</p>';
      $('#glossCount').textContent = n + ' 個名詞';
      reveal($('#glossList'));
    }
    $('#glossSearch').addEventListener('input', function () { q = this.value.trim(); draw(); });
    draw();
    var h = decodeURIComponent(location.hash.slice(1));
    var t = h && document.getElementById(h);
    if (t) { t.classList.add('hl'); setTimeout(function () { window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 110 }); }, 60); }
  }

  /* ---------- LEARN ---------- */
  function learn() {
    var root = $('#learnRoot');
    var render = function () {
      var h = decodeURIComponent(location.hash.slice(1));
      var l = lessonById(h);
      if (l) return renderLesson(root, l);
      var sec = GL.sections.filter(function (x) { return x.id === h; })[0] || (catById(h) && sectionOf(h)) || GL.sections[0];
      renderList(root, sec, catById(h) ? h : null);
    };
    window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); });
    render();
  }

  function renderList(root, sec, focusCat) {
    var count = function (x) { return GL.lessons.filter(function (l) { return x.cats.indexOf(l.cat) > -1; }).length; };
    document.title = sec.zh + '｜技巧教學 | PAR/A';
    root.innerHTML = '<header class="page-head wrap"><nav class="crumbs" aria-label="目前位置"><a href="index.html">首頁</a><span>/</span>學習</nav><h1>技巧教學</h1>' +
      '<p class="lead">分成四個單元，建議照順序來。每一篇都用一樣的寫法：什麼時候用、選哪支桿、怎麼站、怎麼揮、常見錯誤，最後是練習方法。一篇大約 5–8 分鐘就能看完。</p></header>' +
      '<div class="wrap"><nav class="units" aria-label="Learn Golf 單元">' + GL.sections.map(function (x, i) {
        return '<a href="#' + x.id + '" class="unit"' + (x.id === sec.id ? ' aria-current="true"' : '') + '><span class="u-n">第 ' + (i + 1) + ' 步</span><strong>' + x.zh + '</strong><small>已學會 ' + GL.lessons.filter(function (l) { return x.cats.indexOf(l.cat) > -1 && isLearned(l.id); }).length + ' / ' + count(x) + '</small></a>';
      }).join('') + '</nav>' +
      '<div class="unit-intro"><span class="eyebrow">第 ' + (GL.sections.indexOf(sec) + 1) + ' 單元</span><h2>' + sec.zh + '</h2><p>' + sec.desc + '</p></div>' +
      sec.cats.map(function (cid) {
        var c = catById(cid), ls = GL.lessons.filter(function (l) { return l.cat === cid; });
        return '<section class="cat-block" id="cat-' + cid + '">' + (sec.cats.length > 1 ? '<div class="cat-intro"><h2>' + c.name + ' <span class="zh">' + c.zh + '</span></h2><p>' + c.desc + '</p></div>' : '') +
          '<div class="lesson-grid' + (ls.length === 4 ? ' four' : '') + '">' + ls.map(function (l, i) { return lessonCard(l, sec.id === 'setup' || sec.id === 'swing' ? i + 1 : 0); }).join('') + '</div></section>';
      }).join('') + '</div>';
    reveal(root, true);
    linkTerms($('.unit-intro', root));
    if (focusCat && sec.cats.length > 1 && sec.cats[0] !== focusCat) {
      var t = document.getElementById('cat-' + focusCat);
      if (t) setTimeout(function () { window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 100 }); }, 30);
    }
  }

  function renderLesson(root, l) {
    var c = catById(l.cat);
    var sib = lessonOrder(), sec0 = sectionOf(l.cat);
    var idx = sib.indexOf(l), prev = sib[(idx - 1 + sib.length) % sib.length], next = sib[(idx + 1) % sib.length];
    document.title = l.zh + '｜技巧教學 | PAR/A';
    var sec = [
      ['situation', '適用情境', 'When'], ['club', '選桿', 'Club'], ['setup', '準備姿勢', 'Address'],
      ['steps', '動作步驟', 'Motion'], ['mistakes', '常見錯誤', 'Mistakes'], ['drills', '練習方法', 'Practice']
    ];
    var body = {
      situation: '<p class="big">' + esc(l.situation) + '</p>',
      club: '<div class="club-pick' + (l.club.ratios ? '' : ' solo') + '"><div><span class="eyebrow">建議用桿</span><strong>' + esc(l.club.pick) + '</strong><p>' + esc(l.club.note) + '</p></div>' + (!l.club.ratios ? '</div>' :
        '<table class="scorecard mini"><thead><tr><th>Club</th>' + l.club.ratios.map(function (r) { return '<th>' + r[0] + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody><tr><th>空中 : 滾動</th>' + l.club.ratios.map(function (r) { return '<td>' + r[1] + '</td>'; }).join('') + '</tr></tbody></table></div>'),
      setup: '<ul class="ticks">' + l.setup.map(function (s) { return '<li>' + icon('check') + '<span>' + esc(s) + '</span></li>'; }).join('') + '</ul>',
      steps: (function () {
        var pics = stepFrames(l.id);
        if (!pics) return '<ol class="steps">' + l.steps.map(function (s) { return '<li><span>' + esc(s) + '</span></li>'; }).join('') + '</ol>';
        return '<ol class="steps steps-pics">' + l.steps.map(function (s, i) { return '<li><figure>' + (pics[i] || '') + '</figure><span>' + esc(s) + '</span></li>'; }).join('') + '</ol>';
      })(),
      mistakes: '<div class="mistakes">' + l.mistakes.map(function (m) { return '<div class="mistake"><p class="m">' + esc(m.m) + '</p><p class="f"><b>修正</b>' + esc(m.fix) + '</p></div>'; }).join('') + '</div>',
      drills: '<div class="drills">' + l.drills.map(function (d) { return '<div class="drill">' + icon('target') + '<h4>' + esc(d.name) + '</h4><p>' + esc(d.how) + '</p></div>'; }).join('') + '</div>'
    };
    root.innerHTML = '<div class="wrap lesson">' +
      '<a class="crumb" href="#' + sec0.id + '">' + icon('back') + '回到「' + sec0.zh + '」</a>' +
      '<header class="lesson-head"><div><span class="eyebrow">' + c.zh + ' · ' + l.level + ' · 約 ' + l.mins + ' 分鐘</span><h1>' + esc(l.zh) + '</h1><p class="lead">' + esc(l.title) + '</p><p class="byline">Anne 整理 · 2026 年 10 月更新</p></div>' +
      '<div class="lesson-art">' + lessonArt(l, { label: l.title, tag: l.club.pick.split('、')[0] }) + '</div></header>' +
      (l.key ? '<div class="key-point"><span class="kp-label">這篇的重點</span><p>' + esc(l.key) + '</p></div>' : '') +
      '<div class="lesson-layout"><nav class="format-rail" aria-label="Lesson sections">' + sec.map(function (s, i) {
        return '<a href="#' + l.id + '" data-jump="sec-' + s[0] + '"><span class="n">' + (i + 1) + '</span>' + s[1] + '</a>';
      }).join('') + '</nav>' +
      '<div class="lesson-body">' + sec.map(function (s, i) {
        return '<section class="lsec" id="sec-' + s[0] + '"><div class="lsec-h"><span class="n">' + (i + 1) + '</span><h2>' + s[1] + '</h2></div>' + body[s[0]] + '</section>';
      }).join('') +
      (l.cat === 'setup' || l.cat === 'fullswing' ? '<a class="cta-band" href="fix.html"><div><strong>球一直打厚、往右飛？</strong><span>用「擊球診斷」回答幾個問題，找出最可能的原因。</span></div>' + icon('arrow') + '</a>' : '') +
      (l.cat === 'chipping' || l.cat === 'pitching' ? '<a class="cta-band" href="shot.html"><div><strong>不確定該打哪一種？</strong><span>用「短桿選擇」回答 4 個問題，馬上告訴你怎麼打。</span></div>' + icon('arrow') + '</a>' : '') +
      '<div class="learned-row"><button type="button" class="btn' + (isLearned(l.id) ? ' done' : '') + '" id="learnedBtn" aria-pressed="' + isLearned(l.id) + '">' + icon('check') + '<span>' + (isLearned(l.id) ? '已學會' : '標記為已學會') + '</span></button>' +
        '<p>學會之後，<a href="start.html">新手入門</a>的路線會自動打勾。</p></div>' +
      '<div class="pager"><a href="#' + prev.id + '"><small>上一篇</small>' + esc(prev.zh) + '</a><a href="#' + next.id + '" class="next"><small>下一篇</small>' + esc(next.zh) + '</a></div>' +
      '</div></div></div>';
    reveal(root, true);
    linkTerms($('.lesson-body', root));
    $('#learnedBtn').addEventListener('click', function () {
      var on = !isLearned(l.id);
      setLearned(l.id, on);
      this.classList.toggle('done', on);
      this.setAttribute('aria-pressed', on);
      $('span', this).textContent = on ? '已學會' : '標記為已學會';
    });
    $$('[data-jump]', root).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = document.getElementById(a.getAttribute('data-jump'));
        if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
      });
    });
    if ('IntersectionObserver' in window) {
      var links = $$('.format-rail a', root);
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-jump') === e.target.id); });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      $$('.lsec', root).forEach(function (s) { io.observe(s); });
    }
  }

  /* ---------- CLUBS ---------- */
  function clubs() {
    var state = { who: store.get('who', 'men'), unit: store.get('unit', 'yd') };
    var conv = function (y) { return state.unit === 'yd' ? y : Math.round(y * 0.9144); };
    var convRange = function (r) { return r === '—' ? '—' : r.split('–').map(function (n) { return conv(+n); }).join('–'); };

    function draw() {
      $$('[data-who]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-who') === state.who); });
      $$('[data-unit]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-unit') === state.unit); });
      var u = state.unit === 'yd' ? '碼' : '公尺';
      var t = GL.clubTable;
      var max = t[0][state.who];
      $('#clubTable').innerHTML = '<table class="scorecard"><thead><tr><th>Club</th>' + t.map(function (r) { return '<th>' + r.c + '</th>'; }).join('') + '<th class="tot">Unit</th></tr></thead><tbody>' +
        '<tr class="par"><th>Loft</th>' + t.map(function (r) { return '<td>' + r.loft + '°</td>'; }).join('') + '<td class="tot">°</td></tr>' +
        '<tr><th>Carry</th>' + t.map(function (r) { return '<td>' + conv(r[state.who]) + '</td>'; }).join('') + '<td class="tot">' + u + '</td></tr>' +
        '</tbody></table>';
      $('#gapping').innerHTML = t.map(function (r) {
        return '<div class="gap-row"><span class="gap-c">' + r.c + '</span><span class="gap-bar"><i style="width:' + (r[state.who] / max * 100) + '%"></i></span><span class="gap-v">' + conv(r[state.who]) + '</span></div>';
      }).join('');
      $('#clubCards').innerHTML = GL.clubs.map(function (c) {
        return '<article class="club-card" id="' + c.id + '"><div class="cc-art">' + loftSVG(c) + '</div><div class="cc-body">' +
          '<span class="eyebrow">' + esc(c.zh) + '</span><h3>' + esc(c.name) + '</h3>' +
          '<dl class="cc-stats"><div><dt>Loft</dt><dd>' + c.loft + '</dd></div><div><dt>' + (state.who === 'men' ? '男性' : '女性') + '平均距離</dt><dd>' + convRange(c[state.who]) + (c[state.who] === '—' ? '' : ' <small>' + u + '</small>') + '</dd></div></dl>' +
          '<h4>適合情況</h4><ul class="chips">' + c.best.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' +
          '<h4>如何挑選</h4><ul class="ticks">' + c.pick.map(function (p) { return '<li>' + icon('check') + '<span>' + esc(p) + '</span></li>'; }).join('') + '</ul>' +
          '<p class="tip">' + icon('flag') + esc(c.tip) + '</p></div></article>';
      }).join('');
      reveal($('main'));
      linkTerms($('#clubCards'));
    }
    var st = $('#starterSet');
    if (st) st.innerHTML = GL.starterSet.map(function (c) {
      return '<div class="starter ' + (c.need === '必備' ? 'must' : c.need === '建議' ? 'nice' : 'later') + '"><span class="need">' + c.need + '</span><strong>' + esc(c.c) + '</strong><p>' + esc(c.d) + '</p></div>';
    }).join('');
    $$('[data-who]').forEach(function (b) { b.addEventListener('click', function () { state.who = b.getAttribute('data-who'); store.set('who', state.who); draw(); }); });
    $$('[data-unit]').forEach(function (b) { b.addEventListener('click', function () { state.unit = b.getAttribute('data-unit'); store.set('unit', state.unit); draw(); }); });
    draw();
    if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) setTimeout(function () { el.scrollIntoView(); }, 50); }
  }

  /* ---------- FIX MY SHOT ---------- */
  function fix() {
    var root = $('#fixRoot');
    var st = null;

    function pickList() {
      st = null;
      root.innerHTML = '<div class="problem-grid">' + GL.problems.map(function (p, i) {
        return '<button class="problem" data-p="' + p.id + '"><strong>' + esc(p.title) + '</strong><span>' + esc(p.desc) + '</span><em>開始診斷 ' + icon('arrow') + '</em></button>';
      }).join('') + '</div>';
      reveal(root, true);
      $$('[data-p]', root).forEach(function (b) { b.addEventListener('click', function () { start(b.getAttribute('data-p')); }); });
    }
    function start(id) {
      var p = GL.problems.filter(function (x) { return x.id === id; })[0];
      if (!p) return pickList();
      st = { p: p, i: 0, ans: [] };
      if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
      ask();
    }
    function ask() {
      var p = st.p, q = p.questions[st.i];
      root.innerHTML = '<div class="wizard"><div class="wz-top"><button class="link-btn" id="wzBack">' + icon('back') + (st.i ? '上一題' : '所有問題') + '</button>' +
        '<span class="wz-count">' + (st.i + 1) + ' / ' + p.questions.length + '</span></div>' +
        '<div class="wz-bar"><i style="width:' + (st.i / p.questions.length * 100) + '%"></i></div>' +
        '<span class="eyebrow">' + esc(p.title) + '</span><h2>' + esc(q.q) + '</h2>' +
        '<div class="wz-options">' + q.a.map(function (a, k) { return '<button class="opt' + (st.ans[st.i] === k ? ' sel' : '') + '" data-k="' + k + '"><span class="ok">' + String.fromCharCode(65 + k) + '</span>' + esc(a.t) + '</button>'; }).join('') + '</div></div>';
      reveal(root, true);
      $('#wzBack').addEventListener('click', function () { if (st.i) { st.i--; ask(); } else { history.replaceState(null, '', location.pathname); pickList(); } });
      $$('.opt', root).forEach(function (b) {
        b.addEventListener('click', function () {
          st.ans[st.i] = +b.getAttribute('data-k');
          b.classList.add('sel');
          setTimeout(function () { if (st.i < p.questions.length - 1) { st.i++; ask(); } else result(); }, 160);
        });
      });
    }
    function result() {
      var p = st.p, score = {};
      Object.keys(p.causes).forEach(function (k) { score[k] = 0; });
      st.ans.forEach(function (k, i) { var w = p.questions[i].a[k].w; Object.keys(w).forEach(function (c) { score[c] += w[c]; }); });
      var ranked = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; });
      var total = ranked.reduce(function (s, k) { return s + score[k]; }, 0) || 1;
      var top = p.causes[ranked[0]];
      var tl = top.lesson && lessonById(top.lesson);
      root.innerHTML = '<div class="diag"><div class="wz-top"><button class="link-btn" id="again">' + icon('reset') + '重新回答</button><button class="link-btn" id="all">所有問題 ' + icon('arrow') + '</button></div>' +
        '<span class="eyebrow">診斷結果 · ' + esc(p.title) + '</span>' +
        '<div class="diag-main"><div class="diag-head"><span class="badge">最可能的原因</span><h2>' + esc(top.name) + '</h2><p>' + esc(top.why) + '</p></div>' +
        '<div class="diag-cols"><div><h4>' + icon('compass') + '怎麼修正</h4><p>' + esc(top.fix) + '</p></div><div><h4>' + icon('target') + '練習方法</h4><p>' + esc(top.drill) + '</p></div></div>' +
        (tl ? '<a class="cta-band light" href="learn.html#' + tl.id + '"><div><strong>相關教學：' + esc(tl.title) + '</strong><span>' + esc(tl.zh) + '</span></div>' + icon('arrow') + '</a>' : '') + '</div>' +
        '<h3 class="also">其他可能原因</h3><div class="also-list">' + ranked.slice(1).map(function (k) {
          var c = p.causes[k];
          return '<details class="also-item"><summary><span class="also-name">' + esc(c.name) + '</span><span class="meter"><i style="width:' + Math.round(score[k] / total * 100) + '%"></i></span><span class="pct">' + Math.round(score[k] / total * 100) + '%</span></summary>' +
            '<p>' + esc(c.why) + '</p><p><b>修正：</b>' + esc(c.fix) + '</p><p><b>練習：</b>' + esc(c.drill) + '</p></details>';
        }).join('') + '</div>' +
        '<p class="disclaimer">結果依照固定的規則判斷，只是方向參考。若問題持續，建議找教練錄影分析。</p></div>';
      reveal(root, true);
      linkTerms($('.diag-main', root));
      $('#again').addEventListener('click', function () { start(p.id); });
      $('#all').addEventListener('click', function () { history.replaceState(null, '', location.pathname); pickList(); });
      window.scrollTo({ top: root.getBoundingClientRect().top + window.pageYOffset - 100, behavior: 'smooth' });
    }
    var h = location.hash.slice(1);
    if (h) start(h); else pickList();
  }

  /* ---------- SHOT SELECTOR ---------- */
  var SHOT_Q = [
    { k: 'lie', q: '球位在哪裡？', en: 'Lie', a: [['tight', '球道 / 短草'], ['fringe', '果嶺邊緣'], ['fluffy', '長草・球浮在上面'], ['buried', '長草・球陷下去'], ['bunker', '沙坑']] },
    { k: 'dist', q: '球到果嶺邊緣有多遠？', en: 'To the green', a: [['near', '很近（2 步內）'], ['mid', '2–8 步'], ['far', '10 步以上 / 20 碼+']] },
    { k: 'room', q: '果嶺邊緣到旗桿有多少空間？', en: 'Green to work with', a: [['lots', '很多（15 步以上）'], ['some', '中等（6–15 步）'], ['little', '很少（6 步內）']] },
    { k: 'obs', q: '球和果嶺之間有障礙嗎？', en: 'In the way', a: [['none', '沒有，很平順'], ['rough', '長草或凹凸'], ['hazard', '沙坑或水']] }
  ];
  var RATIO_CLUBS = [['56°', 1], ['52°', 1.5], ['PW', 2], ['9i', 3], ['8i', 4], ['7i', 5]];

  function recommend(a) {
    var carry = { near: 2, mid: 6, far: 16 }[a.dist];
    var room = { lots: 20, some: 10, little: 4 }[a.room];
    var ratio = room / carry;
    var r = { why: [] };
    var pickByRatio = function () {
      var best = RATIO_CLUBS[0];
      RATIO_CLUBS.forEach(function (c) { if (Math.abs(c[1] - ratio) < Math.abs(best[1] - ratio)) best = c; });
      return best;
    };
    if (a.lie === 'bunker') {
      r.id = 'bunker-splash'; r.club = '56° 沙坑桿'; r.ratio = '3 : 1';
      r.why = ['在沙坑裡，讓沙把球送出來最安全。', '打開桿面、打球後方 3–5 公分的沙。'];
      r.shot = { air: 0.72, h: 0.7, lie: 'bunker' };
      return r;
    }
    if (a.obs === 'hazard' || a.dist === 'far') {
      if (a.dist !== 'far' && a.room === 'little' && a.lie === 'fluffy') {
        r.id = 'flop-shot'; r.club = '60° 挖起桿'; r.ratio = '4 : 1'; r.alt = 'pitch-shot';
        r.why = ['必須飛越障礙，而且旗桿附近幾乎沒有滾動空間。', '球浮在草上，是少數適合 Flop 的球位。', '把握不大時，打 Pitch 到果嶺中間也是好選擇。'];
        r.shot = { air: 0.9, h: 1, lie: 'rough', hazard: a.obs === 'hazard' };
        return r;
      }
      r.id = 'pitch-shot'; r.club = a.room === 'lots' ? '52° 挖起桿' : '56° 挖起桿'; r.ratio = a.room === 'lots' ? '2 : 1' : '3 : 1';
      r.alt = a.obs === 'hazard' ? null : 'bump-and-run';
      r.why = [a.obs === 'hazard' ? '中間有沙坑或水，球必須先飛過去。' : '距離較遠，需要較多飛行距離。', '用時鐘系統的擺幅控制距離。'];
      if (a.room === 'little' && a.lie !== 'fluffy' && a.obs === 'hazard') r.why.push('空間很少，但球位不適合 Flop——接受停在旗桿後方。');
      r.shot = { air: a.room === 'lots' ? 0.6 : 0.75, h: 0.6, lie: a.lie === 'tight' ? 'fairway' : 'rough', hazard: a.obs === 'hazard' };
      return r;
    }
    if (a.lie === 'buried') {
      r.id = 'standard-chip'; r.club = '56° 挖起桿'; r.ratio = '1 : 1.5'; r.alt = 'pitch-shot';
      r.why = ['球陷在長草中，需要較陡的擊球角度把球挖出來。', '球位放右腳、重心在左腳，預期落地後會滾得比平常多。', '不要嘗試 Flop：桿頭會從球下方穿過。'];
      r.shot = { air: 0.45, h: 0.35, lie: 'rough' };
      return r;
    }
    if (a.lie === 'fringe' && a.obs === 'none' && a.dist === 'near') {
      r.id = 'putter-from-fringe'; r.club = '推桿'; r.ratio = '0 : 1'; r.alt = 'bump-and-run';
      r.why = ['球在邊緣短草，中間沒有障礙。', '最差的推桿通常也比最差的切球好。', '邊緣草每一步約當果嶺上 1.5–2 步的力道。'];
      r.shot = { air: 0, h: 0, lie: 'fringe' };
      return r;
    }
    if (a.room === 'little' || ratio < 1.25) {
      if (a.lie === 'fluffy' && a.obs !== 'none') {
        r.id = 'flop-shot'; r.club = '60° 挖起桿'; r.ratio = '4 : 1'; r.alt = 'standard-chip';
        r.why = ['空間很少，要飛過長草並快速停球。', '球浮在草上，可以讓桿底從球下方滑過。'];
        r.shot = { air: 0.85, h: 0.95, lie: 'rough' };
        return r;
      }
      r.id = 'standard-chip'; r.club = '56° 挖起桿'; r.ratio = '1 : 1'; r.alt = 'pitch-shot';
      r.why = ['旗桿離果嶺邊很近，需要較多飛行、較少滾動。', '用 56° 打基本切球，讓球落地後只滾一半距離。'];
      r.shot = { air: carry / (carry + room), h: 0.38, lie: a.lie === 'tight' ? 'fairway' : a.lie === 'fringe' ? 'fringe' : 'rough' };
      return r;
    }
    var c = pickByRatio();
    var isBump = c[1] >= 3;
    r.id = isBump ? 'bump-and-run' : 'standard-chip';
    r.club = c[0] === '56°' || c[0] === '52°' ? c[0] + ' 挖起桿' : c[0] === 'PW' ? 'PW 劈起桿' : c[0] + ' 鐵桿';
    r.ratio = '1 : ' + c[1];
    r.alt = a.lie === 'fringe' && a.obs === 'none' ? 'putter-from-fringe' : isBump ? 'standard-chip' : 'bump-and-run';
    r.why = ['能滾就不要飛——滾動比飛行更容易預測。', '落點選在果嶺邊緣往內約一步。', '空中 ' + carry + ' 步、滾動約 ' + room + ' 步，所以選滾動比例 1 : ' + c[1] + ' 的球桿。'];
    if (a.obs === 'rough') r.why.push('記得讓落點越過長草，再讓球在果嶺上滾。');
    r.shot = { air: carry / (carry + room), h: isBump ? 0.18 : 0.3, lie: a.lie === 'fringe' ? 'fringe' : a.lie === 'tight' ? 'fairway' : 'rough' };
    return r;
  }

  function shot() {
    var ans = store.get('shot', { lie: 'tight', dist: 'near', room: 'lots', obs: 'none' });
    var form = $('#shotForm');
    form.innerHTML = SHOT_Q.map(function (q, i) {
      return '<fieldset class="q"><legend><span class="n">' + (i + 1) + '</span>' + q.q + '<small>' + q.en + '</small></legend><div class="seg">' + q.a.map(function (a) {
        return '<button type="button" data-k="' + q.k + '" data-v="' + a[0] + '">' + a[1] + '</button>';
      }).join('') + '</div></fieldset>';
    }).join('');
    function draw() {
      $$('.seg button', form).forEach(function (b) { b.setAttribute('aria-pressed', ans[b.getAttribute('data-k')] === b.getAttribute('data-v')); });
      $$('fieldset', form).forEach(function (f) { f.disabled = false; });
      var bunker = ans.lie === 'bunker';
      $$('fieldset', form).slice(1).forEach(function (f) { f.classList.toggle('muted', bunker); });
      var r = recommend(ans), l = lessonById(r.id), alt = r.alt && lessonById(r.alt);
      $('#shotResult').innerHTML = '<span class="eyebrow">建議打法</span><h2>' + esc(l.title) + '</h2><p class="zh-sub">' + esc(l.zh) + '</p>' +
        '<div class="res-art">' + shotSVG(r.shot, { label: l.title, tag: r.club }) + '</div>' +
        '<dl class="res-stats"><div><dt>建議用桿</dt><dd>' + esc(r.club) + '</dd></div><div><dt>空中 : 滾動</dt><dd>' + r.ratio + '</dd></div></dl>' +
        '<ul class="ticks">' + r.why.map(function (w) { return '<li>' + icon('check') + '<span>' + esc(w) + '</span></li>'; }).join('') + '</ul>' +
        '<a class="btn" href="learn.html#' + l.id + '">看完整教學 ' + icon('arrow') + '</a>' +
        (alt ? '<p class="alt">備案：<a href="learn.html#' + alt.id + '">' + esc(alt.title) + '</a> <span>' + esc(alt.zh) + '</span></p>' : '');
    }
    form.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-k]');
      if (!b) return;
      ans[b.getAttribute('data-k')] = b.getAttribute('data-v');
      store.set('shot', ans);
      draw();
      var res = $('#shotResult');
      res.classList.remove('pop'); void res.offsetWidth; res.classList.add('pop');
    });
    draw();
  }


  /* Top-down drill diagrams for the practice plans (320 × 190). */
  function drillSVG(type) {
    var T = function (x, y, t, a, cls) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (a || 'middle') + '" class="' + (cls || 'dg-t') + '">' + t + '</text>'; };
    var ball = function (x, y) { return '<circle cx="' + x + '" cy="' + (y + 1.5) + '" r="5" fill="rgba(0,0,0,.25)"/><circle cx="' + x + '" cy="' + y + '" r="5" fill="#fff"/>'; };
    var tee = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="3.2" fill="#f2c75c" stroke="#8a6514" stroke-width=".8"/>'; };
    var hole = function (x, y) { return '<circle cx="' + x + '" cy="' + y + '" r="7.5" fill="#0b2a18"/><circle cx="' + x + '" cy="' + y + '" r="2" fill="#fbf8ef"/>'; };
    var path = function (d, dash) { return '<path d="' + d + '" fill="none" stroke="#fbf8ef" stroke-width="1.6" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + ' opacity=".85"/>'; };
    var green = '<rect width="320" height="190" rx="16" fill="#5fa64a"/><rect width="320" height="190" rx="16" fill="url(#dgs)"/>';
    var defs = '<defs><pattern id="dgs" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(90)"><rect width="14" height="28" fill="rgba(255,255,255,.06)"/></pattern></defs>';
    var circle = function (cx, cy, r, gate) {
      var o = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#fbf8ef" stroke-width="1.2" stroke-dasharray="3 5" opacity=".7"/>';
      for (var k = 0; k < 8; k++) {
        var a = k * Math.PI / 4, ax = cx + Math.sin(a) * r, ay = cy - Math.cos(a) * r;
        var b = a + 0.22, bx = cx + Math.sin(b) * (r + 1), by = cy - Math.cos(b) * (r + 1);
        o += tee(ax, ay) + ball(bx, by);
        if (k === 2 || k === 5) o += path('M' + (cx + Math.sin(b) * (r - 9)) + ' ' + (cy - Math.cos(b) * (r - 9)) + ' L' + (cx + Math.sin(b) * 12) + ' ' + (cy - Math.cos(b) * 12), '1 5');
      }
      return o + hole(cx, cy) + '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy + r) + '" stroke="#f2c75c" stroke-width="1"/>' + T(cx + 6, cy + r / 2 + 4, '1 公尺', 'start');
    };
    var dial = function (cx, cy, r) {
      var o = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="rgba(251,248,239,.06)" stroke="#fbf8ef" stroke-opacity=".35"/>';
      for (var h = 0; h < 12; h++) { var a = h * Math.PI / 6; o += '<line x1="' + (cx + Math.sin(a) * (r - 6)) + '" y1="' + (cy - Math.cos(a) * (r - 6)) + '" x2="' + (cx + Math.sin(a) * r) + '" y2="' + (cy - Math.cos(a) * r) + '" stroke="#fbf8ef" stroke-opacity=".5"/>'; }
      // golfer seen from the front: head, body, ball at six o'clock
      return o + '<circle cx="' + cx + '" cy="' + (cy - 30) + '" r="9" fill="#fbf8ef" opacity=".9"/><line x1="' + cx + '" y1="' + (cy - 20) + '" x2="' + cx + '" y2="' + (cy + 18) + '" stroke="#fbf8ef" stroke-width="3" stroke-linecap="round" opacity=".9"/>' + ball(cx, cy + r - 4);
    };
    var arm = function (cx, cy, r, deg, label, col) {
      var a = deg * Math.PI / 180, x = cx + Math.sin(a) * r, y = cy - Math.cos(a) * r;
      return '<line x1="' + cx + '" y1="' + (cy - 14) + '" x2="' + x + '" y2="' + y + '" stroke="' + col + '" stroke-width="2.4" stroke-linecap="round"/><circle cx="' + x + '" cy="' + y + '" r="4" fill="' + col + '"/>' +
        T(x + (Math.sin(a) < -.2 ? -8 : Math.sin(a) > .2 ? 8 : 0), y + (Math.cos(a) > .5 ? -8 : 4), label, Math.sin(a) < -.2 ? 'end' : Math.sin(a) > .2 ? 'start' : 'middle', 'dg-t gold');
    };
    var o = '';
    if (type === 'gate') {
      o = green + '<rect x="40" y="84" width="9" height="24" rx="2" fill="#1f3b2f"/>' + ball(60, 96) + tee(72, 84) + tee(72, 108) +
        path('M66 96 L 252 96', '1 6') + hole(262, 96) +
        '<path d="M60 140 L262 140 M60 134 L60 146 M262 134 L262 146" stroke="#fbf8ef" stroke-opacity=".7"/>' + T(161, 158, '1 公尺') +
        '<path d="M72 78 C 90 50 120 46 140 46" fill="none" stroke="#f2c75c" stroke-width="1"/>' + T(146, 50, '兩支 tee 做成「門」', 'start', 'dg-t gold');
    } else if (type === 'circle') {
      o = green + circle(160, 86, 60) + T(160, 180, '以洞為中心 · 8 支 tee 圍成一圈', 'middle', 'dg-t gold');
    } else if (type === 'gatecircle') {
      o = green + '<rect x="18" y="78" width="7" height="20" rx="2" fill="#1f3b2f"/>' + ball(34, 88) + tee(44, 78) + tee(44, 98) + path('M40 88 L 96 88', '1 5') + T(62, 124, '① Gate', 'middle', 'dg-t gold') +
        '<line x1="118" y1="20" x2="118" y2="170" stroke="#fbf8ef" stroke-opacity=".25"/>' + circle(220, 86, 56) + T(220, 180, '② Circle 1 公尺', 'middle', 'dg-t gold');
    } else if (type === 'ladder') {
      o = green + ball(28, 98) + T(28, 124, '起點');
      [[120, '10 步'], [190, '15 步'], [270, '20 步']].forEach(function (m, i) {
        o += '<line x1="' + m[0] + '" y1="40" x2="' + m[0] + '" y2="156" stroke="#fbf8ef" stroke-width="1" stroke-dasharray="3 5" opacity="' + (i === 2 ? .9 : .5) + '"/>' + tee(m[0], 40) + tee(m[0], 156) + T(m[0], 28, m[1], 'middle', i === 2 ? 'dg-t gold' : 'dg-t');
      });
      [[126, 88], [158, 108], [204, 92], [238, 104], [262, 96]].forEach(function (p, i) { o += ball(p[0], p[1]) + T(p[0], p[1] - 9, i + 1, 'middle', 'dg-n'); });
      o += path('M36 98 L 112 98', '1 6') + '<rect x="270" y="40" width="50" height="116" fill="rgba(200,16,46,.18)"/>' + T(296, 176, '不能超過', 'middle', 'dg-t');
    } else if (type === 'towel' || type === 'threeclub') {
      o = '<rect width="320" height="190" rx="16" fill="#3f7d3a"/><rect x="96" width="224" height="190" fill="#5fa64a"/><path d="M304 0 h0 a16 16 0 0 1 16 16 v158 a16 16 0 0 1 -16 16 z" fill="#5fa64a"/>' +
        '<rect x="96" width="224" height="190" fill="url(#dgs)"/><line x1="96" y1="0" x2="96" y2="190" stroke="#8cc163" stroke-width="2"/>' + T(48, 20, '果嶺外', 'middle', 'dg-t') + T(104, 20, '果嶺', 'start', 'dg-t');
      if (type === 'towel') {
        o += '<rect x="110" y="78" width="40" height="34" rx="3" fill="#fbf8ef" transform="rotate(-6 130 95)"/><path d="M114 84 h32 M114 90 h32" stroke="#d9d2bd" stroke-width="2" transform="rotate(-6 130 95)"/>' +
          ball(46, 100) + path('M52 98 Q 90 52 128 92') + path('M132 96 L 262 98', '1 6') + hole(272, 98) + T(130, 132, '毛巾＝落點', 'middle', 'dg-t gold') +
          '<circle cx="272" cy="98" r="22" fill="none" stroke="#fbf8ef" stroke-opacity=".5" stroke-dasharray="2 4"/>';
      } else {
        o += '<rect x="112" y="40" width="30" height="112" rx="3" fill="#fbf8ef" opacity=".92"/>' + T(127, 170, '同一個落點', 'middle', 'dg-t gold') + hole(296, 96);
        [[58, 170, 'PW'], [96, 226, '9i'], [134, 282, '7i']].forEach(function (r) {
          o += ball(44, r[0]) + path('M50 ' + (r[0] - 2) + ' Q 86 ' + (r[0] - 36) + ' 124 ' + r[0]) + path('M128 ' + r[0] + ' L ' + r[1] + ' ' + r[0], '1 6') +
            '<circle cx="' + r[1] + '" cy="' + r[0] + '" r="4" fill="none" stroke="#f2c75c" stroke-width="1.4"/>' + T(r[1] + 9, r[0] + 4, r[2], 'start', 'dg-t gold');
        });
      }
    } else if (type === 'rails') {
      o = green + ball(60, 96) + '<rect x="42" y="88" width="9" height="16" rx="2" fill="#1f3b2f"/>' +
        [80, 112].map(function (y) { return '<line x1="28" y1="' + y + '" x2="236" y2="' + y + '" stroke="#c9c4b4" stroke-width="4" stroke-linecap="round"/><line x1="28" y1="' + y + '" x2="64" y2="' + y + '" stroke="#2a2f2c" stroke-width="6" stroke-linecap="round"/>'; }).join('') +
        path('M66 96 L 266 96', '1 6') + hole(276, 96) + T(132, 66, '兩支球桿做成軌道', 'middle', 'dg-t gold') +
        '<path d="M60 140 L276 140 M60 134 L60 146 M276 134 L276 146" stroke="#fbf8ef" stroke-opacity=".7"/>' + T(168, 158, '1 公尺');
    } else if (type === 'coin') {
      o = green + '<circle cx="80" cy="104" r="8" fill="#f2c75c" stroke="#8a6514"/>' + path('M88 104 L 248 100', '1 6') + ball(214, 101) + hole(260, 100) +
        '<ellipse cx="80" cy="40" rx="11" ry="7" fill="none" stroke="#f2c75c" stroke-width="1.6"/><circle cx="80" cy="40" r="3" fill="#f2c75c"/>' +
        '<line x1="80" y1="48" x2="80" y2="92" stroke="#f2c75c" stroke-dasharray="2 4"/>' + T(96, 44, '眼睛留在硬幣上', 'start', 'dg-t gold') +
        T(80, 130, '硬幣', 'middle', 'dg-t') + T(160, 170, '推完數一秒，再抬頭看球', 'middle', 'dg-t');
    } else if (type === 'zone') {
      o = green + '<circle cx="232" cy="92" r="40" fill="rgba(242,199,92,.14)" stroke="#f2c75c" stroke-width="1.4" stroke-dasharray="4 4"/>' + hole(232, 92) +
        '<line x1="232" y1="92" x2="272" y2="92" stroke="#f2c75c"/>' + T(232, 44, '半徑 = 1 支推桿', 'middle', 'dg-t gold');
      [[34, '16 步'], [76, '12 步'], [118, '8 步']].forEach(function (p, i) { o += tee(p[0], 150) + T(p[0], 170, p[1], 'middle', 'dg-t') + path('M' + p[0] + ' 144 Q ' + ((p[0] + 220) / 2) + ' ' + (120 - i * 8) + ' ' + (214 + i * 10) + ' ' + (104 - i * 14), '1 6'); });
      o += ball(214, 104) + ball(224, 90) + ball(244, 78) + T(232, 156, '停在圈裡就成功', 'middle', 'dg-t gold');
    } else if (type === 'speed') {
      o = green + ball(46, 96) + path('M52 96 L 232 96', '1 6') + hole(196, 96) +
        '<rect x="200" y="62" width="34" height="68" fill="rgba(242,199,92,.18)"/>' +
        '<line x1="240" y1="44" x2="240" y2="148" stroke="#c9c4b4" stroke-width="4" stroke-linecap="round"/><line x1="240" y1="44" x2="240" y2="74" stroke="#2a2f2c" stroke-width="6" stroke-linecap="round"/>' +
        ball(222, 96) + T(184, 56, '停在這裡', 'middle', 'dg-t gold') + T(270, 100, '球桿', 'start', 'dg-t') +
        '<path d="M196 150 L240 150 M196 145 L196 155 M240 145 L240 155" stroke="#fbf8ef" stroke-opacity=".7"/>' + T(218, 170, '30–40 公分');
    } else if (type === 'par18') {
      o = '<rect width="320" height="190" rx="16" fill="#3f7d3a"/><ellipse cx="160" cy="95" rx="146" ry="80" fill="#5fa64a"/><ellipse cx="160" cy="95" rx="146" ry="80" fill="url(#dgs)"/>';
      [[62, 70], [104, 42], [160, 36], [218, 46], [262, 82], [240, 132], [178, 150], [112, 140], [160, 96]].forEach(function (p, i) {
        o += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#0b2a18"/><line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + p[0] + '" y2="' + (p[1] - 16) + '" stroke="#fbf8ef" stroke-width="1.2"/><path d="M' + p[0] + ' ' + (p[1] - 16) + ' l9 3 l-9 3z" fill="#f2c75c"/>' +
          T(p[0] + 10, p[1] + 4, i + 1, 'start', 'dg-n');
      });
      o += T(160, 184, '9 洞 · 每洞標準桿 2 · 總共 18', 'middle', 'dg-t gold');
    } else if (type === 'targets') {
      o = '<rect width="320" height="190" rx="16" fill="#3f7d3a"/><rect width="320" height="190" rx="16" fill="url(#dgs)"/>' +
        '<rect x="128" y="160" width="64" height="22" rx="4" fill="#2a3a30"/><circle cx="160" cy="166" r="4" fill="#fff"/>' + T(160, 186, '打位', 'middle', 'dg-t');
      [[160, 120, '50 碼'], [110, 78, '100 碼'], [214, 50, '150 碼']].forEach(function (f) {
        o += '<ellipse cx="' + f[0] + '" cy="' + (f[1] + 4) + '" rx="22" ry="7" fill="#5fa64a"/><line x1="' + f[0] + '" y1="' + (f[1] + 4) + '" x2="' + f[0] + '" y2="' + (f[1] - 18) + '" stroke="#fbf8ef" stroke-width="1.4"/><path d="M' + f[0] + ' ' + (f[1] - 18) + ' l12 4 l-12 4z" fill="#f2c75c"/>' + T(f[0] + 28, f[1] + 2, f[2], 'start', 'dg-t gold');
      });
      o += path('M160 162 Q 150 120 110 82', '1 6') + path('M160 162 Q 200 100 214 54', '1 6');
    } else if (type === 'tee') {
      o = '<rect width="320" height="190" rx="16" fill="#0b4a32"/><line x1="30" y1="140" x2="290" y2="140" stroke="#fbf8ef" stroke-opacity=".4"/>' +
        '<rect x="158" y="112" width="4" height="28" fill="#f2c75c"/><path d="M152 112 h16 l-4 6 h-8z" fill="#f2c75c"/>' +
        '<circle cx="160" cy="99" r="13" fill="#fff"/>' +
        '<path d="M60 136 Q 66 92 108 90 L 140 92 Q 146 116 140 138 Z" fill="#1f3b2f" stroke="#9aa59f"/><line x1="66" y1="96" x2="38" y2="20" stroke="#9aa59f" stroke-width="3"/>' +
        '<line x1="132" y1="91" x2="200" y2="91" stroke="#f2c75c" stroke-dasharray="3 4"/>' + T(206, 94, '桿頭頂端', 'start', 'dg-t') +
        '<path d="M178 86 L178 99" stroke="#f2c75c"/>' + T(206, 80, '球有一半高過桿頭', 'start', 'dg-t gold') + T(160, 166, 'Tee 架高 · 球放左腳跟內側', 'middle', 'dg-t');
    } else if (type === 'halfswing') {
      o = '<rect width="320" height="190" rx="16" fill="#0b4a32"/>' + dial(160, 98, 72) +
        '<path d="M 88 98 A 72 72 0 0 0 232 98" fill="none" stroke="#f2c75c" stroke-width="2" stroke-dasharray="4 5"/>' +
        arm(160, 98, 72, 270, '9 點 後擺', '#f2c75c') + arm(160, 98, 72, 90, '3 點 收桿', '#f2c75c');
    } else if (type === 'clock') {
      o = '<rect width="320" height="190" rx="16" fill="#0b4a32"/>' + dial(176, 98, 72) +
        arm(176, 98, 72, 225, '7:30 · 短', '#cfe0d6') + arm(176, 98, 72, 270, '9:00 · 中', '#f2c75c') + arm(176, 98, 72, 315, '10:30 · 長', '#fbf8ef');
    } else if (type === 'updown') {
      o = '<rect width="320" height="190" rx="16" fill="#3f7d3a"/><ellipse cx="176" cy="92" rx="96" ry="60" fill="#5fa64a"/><ellipse cx="176" cy="92" rx="96" ry="60" fill="url(#dgs)"/>' +
        '<path d="M262 160 c 14 -18 46 -18 52 -2 c 4 12 -18 22 -38 20 c -14 -2 -20 -8 -14 -18z" fill="#efe6cf"/>' + hole(196, 86);
      [[38, 44, '長草'], [60, 164, '邊緣'], [288, 168, '沙坑']].forEach(function (p, i) {
        o += ball(p[0], p[1]) + path('M' + p[0] + ' ' + p[1] + ' Q ' + ((p[0] + 196) / 2) + ' ' + (Math.min(p[1], 86) - 30) + ' 190 88', '1 6') +
          '<circle cx="' + (p[0] + (i === 2 ? -16 : 14)) + '" cy="' + (p[1] - 12) + '" r="8" fill="#f2c75c"/>' + T(p[0] + (i === 2 ? -16 : 14), p[1] - 8.5, i + 1, 'middle', 'dg-n dark') + T(p[0], p[1] + 18, p[2], 'middle', 'dg-t');
      });
    }
    return '<svg class="drill-svg" viewBox="0 0 320 190" role="img" aria-label="練習示意圖">' + defs + o + '</svg>';
  }

  var CAT_ZH = { 'Putting': '推桿', 'Chipping': '切球', 'Pitching': '劈起球', 'Warm-up': '暖身', 'Pressure': '小挑戰', 'Half Swing': '半揮桿', 'Full Swing': '全揮桿', 'Woods': '木桿', 'Short Game': '短桿', 'Driver': '開球' };

  /* ---------- PRACTICE ---------- */
  function practice() {
    var hp = location.hash.slice(1);
    var plan = GL.plans[hp] ? hp : store.get('plan', '15');
    if (!GL.plans[plan]) plan = '15';
    var timer = { i: 0, left: 0, run: false, h: null };
    var STATIONS = ['短草 5 步', '邊緣推桿', '長草切球', '下坡切球', '上坡切球', '越過沙坑', '20 碼 Pitch', '沙坑', '自選位置'];
    var scores = store.get('ud', []);

    function drawPlan() {
      var p = GL.plans[plan];
      $$('[data-plan]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-plan') === plan); });
      var done = store.get('done' + plan, []);
      var total = p.blocks.reduce(function (s, b) { return s + b.mins; }, 0);
      $('#planHead').innerHTML = '<span class="eyebrow">共 ' + total + ' 分鐘 · ' + p.blocks.length + ' 個練習</span><h2>' + p.zh + '</h2><p class="plan-sub">' + p.name + '</p>';
      $('#planBar').innerHTML = p.blocks.map(function (b, i) { return '<i class="' + (done.indexOf(i) > -1 ? 'done' : '') + (timer.run || timer.left ? (i === timer.i ? ' now' : '') : '') + '" style="flex:' + b.mins + '" title="' + esc(b.name) + '"></i>'; }).join('');
      $('#planList').innerHTML = p.blocks.map(function (b, i) {
        var l = b.lesson && lessonById(b.lesson);
        return '<li class="block' + (done.indexOf(i) > -1 ? ' done' : '') + ((timer.run || timer.left) && i === timer.i ? ' now' : '') + '">' +
          '<label class="chk"><input type="checkbox" data-i="' + i + '"' + (done.indexOf(i) > -1 ? ' checked' : '') + '><span>' + icon('check') + '</span></label>' +
          '<div class="bl-time">' + b.mins + '<small>min</small></div>' +
          '<div class="bl-body"><span class="eyebrow">' + esc(CAT_ZH[b.cat] || b.cat) + '</span><h3>' + esc(b.name) + '</h3><p>' + esc(b.how) + '</p>' +
          (l ? '<a href="learn.html#' + l.id + '">教學：' + esc(l.title) + ' ' + icon('arrow') + '</a>' : '') + '</div>' +
          (b.fig ? '<figure class="bl-fig">' + drillSVG(b.fig) + '<figcaption>' + esc(b.cap) + '</figcaption></figure>' : '') + '</li>';
      }).join('');
      $$('#planList input').forEach(function (c) {
        c.addEventListener('change', function () {
          var d = store.get('done' + plan, []), i = +c.getAttribute('data-i');
          d = c.checked ? d.concat([i]) : d.filter(function (x) { return x !== i; });
          store.set('done' + plan, d); drawPlan();
        });
      });
      drawTimer();
    }
    function drawTimer() {
      var p = GL.plans[plan], b = p.blocks[timer.i];
      var secs = timer.left || b.mins * 60;
      var m = Math.floor(secs / 60), s = secs % 60;
      $('#timer').innerHTML = '<div class="tm-now"><span class="eyebrow">' + (timer.run ? '進行中' : timer.left ? '已暫停' : '準備開始') + ' · ' + (timer.i + 1) + ' / ' + p.blocks.length + '</span><strong>' + esc(b.name) + '</strong></div>' +
        '<div class="tm-clock">' + m + ':' + (s < 10 ? '0' : '') + s + '</div>' +
        '<div class="tm-ctrl"><button class="btn round" id="tmPlay" aria-label="' + (timer.run ? '暫停' : '開始') + '">' + icon(timer.run ? 'pause' : 'play') + '</button>' +
        '<button class="btn ghost" id="tmNext">下一項</button><button class="btn ghost" id="tmReset" aria-label="重設">' + icon('reset') + '</button></div>';
      $('#tmPlay').addEventListener('click', function () { timer.run ? pause() : play(); });
      $('#tmNext').addEventListener('click', function () { advance(); });
      $('#tmReset').addEventListener('click', function () { pause(); timer.i = 0; timer.left = 0; drawPlan(); });
    }
    function play() {
      var b = GL.plans[plan].blocks[timer.i];
      if (!timer.left) timer.left = b.mins * 60;
      timer.run = true;
      clearInterval(timer.h);
      timer.h = setInterval(function () {
        timer.left--;
        if (timer.left <= 0) {
          var d = store.get('done' + plan, []);
          if (d.indexOf(timer.i) < 0) store.set('done' + plan, d.concat([timer.i]));
          advance(true);
        } else drawTimer();
      }, 1000);
      drawPlan();
    }
    function pause() { timer.run = false; clearInterval(timer.h); drawPlan(); }
    function advance(keep) {
      var n = GL.plans[plan].blocks.length;
      var wasRunning = timer.run;
      clearInterval(timer.h); timer.run = false; timer.left = 0;
      if (timer.i < n - 1) { timer.i++; if (keep && wasRunning) return play(); }
      drawPlan();
    }
    $$('[data-plan]').forEach(function (b) {
      b.addEventListener('click', function () { pause(); plan = b.getAttribute('data-plan'); store.set('plan', plan); timer.i = 0; timer.left = 0; drawPlan(); });
    });
    window.addEventListener('hashchange', function () {
      var h = location.hash.slice(1);
      if (GL.plans[h] && h !== plan) { pause(); plan = h; store.set('plan', plan); timer.i = 0; timer.left = 0; drawPlan(); }
    });

    function symClass(v) { return !v ? '' : v === 1 ? 'circle' : v === 2 ? '' : v === 3 ? 'square' : 'dsquare'; }
    function drawCard() {
      var played = scores.filter(Boolean);
      var tot = played.reduce(function (s, v) { return s + v; }, 0);
      var toPar = tot - played.length * 2;
      $('#udCard').innerHTML = '<table class="scorecard game"><thead><tr><th>Station</th>' + STATIONS.map(function (s, i) { return '<th>' + (i + 1) + '</th>'; }).join('') + '<th class="tot">Total</th></tr></thead><tbody>' +
        '<tr class="par"><th>Par</th>' + STATIONS.map(function () { return '<td>2</td>'; }).join('') + '<td class="tot">18</td></tr>' +
        '<tr><th>Score</th>' + STATIONS.map(function (s, i) {
          return '<td><button class="cell" data-h="' + i + '" aria-label="站 ' + (i + 1) + ' ' + esc(s) + '"><span class="sym ' + symClass(scores[i]) + '">' + (scores[i] || '–') + '</span></button></td>';
        }).join('') + '<td class="tot"><strong>' + (tot || '–') + '</strong></td></tr></tbody></table>';
      $('#udStations').innerHTML = STATIONS.map(function (s, i) { return '<li><b>' + (i + 1) + '</b>' + s + '</li>'; }).join('');
      $('#udToPar').innerHTML = played.length ? '<span class="topar ' + (toPar < 0 ? 'under' : '') + '">' + (toPar === 0 ? 'E' : (toPar > 0 ? '+' : '') + toPar) + '</span><small>Thru ' + played.length + '</small>' : '<small>點擊格子輸入桿數</small>';
      var cnt = [0, 0, 0, 0];
      played.forEach(function (v) { cnt[Math.min(v, 4) - 1]++; });
      var n = played.length || 1;
      $('#udStats').innerHTML = [['Birdies', '一桿進洞', cnt[0]], ['Up & Down', '兩桿完成', cnt[1]], ['Bogey', '三桿', cnt[2]], ['Double +', '四桿以上', cnt[3]]].map(function (x) {
        var pct = played.length ? Math.round(x[2] / n * 100) : 0;
        return '<div class="stat">' + ringSVG(pct / 100) + '<div class="stat-v"><strong>' + pct + '<sup>%</sup></strong><small>' + x[2] + ' / ' + played.length + '</small></div><h4>' + x[0] + '</h4><p>' + x[1] + '</p></div>';
      }).join('');
      $$('.cell').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-h');
          scores[i] = scores[i] >= 5 ? 0 : (scores[i] || 0) + 1;
          store.set('ud', scores); drawCard();
          var nb = $('.cell[data-h="' + i + '"]'); if (nb) nb.focus();
        });
      });
    }
    $('#udReset').addEventListener('click', function () { scores = []; store.set('ud', scores); drawCard(); });
    drawPlan();
    drawCard();
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page');
    renderChrome(page);
    ({ home: home, learn: learn, clubs: clubs, fix: fix, shot: shot, practice: practice, rules: rules, start: start, guide: guide, glossary: glossary }[page] || function () {})();
    termPopover();
    reveal(document, true);
    booted = true;
    var hd = $('#site-header');
    var onScroll = function () { if (hd) hd.classList.toggle('scrolled', window.pageYOffset > 8); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    // gentle fade between pages of the site
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || REDUCED) return;
      var url = new URL(a.getAttribute('href'), location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || !/\.html$/.test(url.pathname)) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(function () { location.href = url.href; }, 260);
    });
    window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });
  });
})();
