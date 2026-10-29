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
      '<path d="M' + hx + ' ' + (gy - 62) + ' l20 7 l-20 7z" fill="#f2c75c"/>';
    // flight
    var stopX = hx - 9;
    if (s.air > 0) {
      out += '<path class="flight" pathLength="1" d="M' + bx + ' ' + (gy - 4) + ' Q ' + ((bx + land) / 2) + ' ' + (gy - 4 - 2 * peak) + ' ' + land + ' ' + (gy - 4) + '" fill="none" stroke="#fbf8ef" stroke-width="1.8" stroke-linecap="round"/>';
      out += '<circle class="land" cx="' + land + '" cy="' + (gy - 3) + '" r="5" fill="none" stroke="#f2c75c" stroke-width="1.4"/>';
      if (land < stopX - 4) out += '<path class="roll" d="M' + land + ' ' + (gy - 4) + ' L' + stopX + ' ' + (gy - 4) + '" stroke="#fbf8ef" stroke-width="1.8" stroke-dasharray="1 6" stroke-linecap="round"/>';
    } else {
      var c = s.curve || 0;
      out += '<path class="roll" d="M' + bx + ' ' + (gy - 4) + ' Q ' + ((bx + stopX) / 2) + ' ' + (gy - 4 - c * 60) + ' ' + stopX + ' ' + (gy - 4) + '" fill="none" stroke="#fbf8ef" stroke-width="1.8" stroke-dasharray="1 6" stroke-linecap="round"/>';
    }
    out += '<circle cx="' + bx + '" cy="' + (gy - 4) + '" r="4.2" fill="#ffffff"/>';
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
      '<ellipse cx="1031" cy="172" rx="4" ry="2" fill="#0b2a18"/><line x1="1031" y1="172" x2="1031" y2="132" stroke="#fff" stroke-width="2"/><path d="M1031 132 l16 6 l-16 6z" fill="#f2c75c"/>' +
      '<rect width="1200" height="760" fill="url(#hv)"/>' +
      '</svg>';
  }

  /* Masters-style stat ring */
  function ringSVG(pct) {
    var r = 46, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, pct));
    return '<svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#efece3" stroke-width="20"/>' +
      '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="#006747" stroke-width="20" stroke-dasharray="' + (c * v) + ' ' + c + '" transform="rotate(-90 60 60)"/></svg>';
  }

  /* ---------- layout ---------- */
  var NAV = [
    { href: 'learn.html', key: 'learn', en: 'Learn Golf', zh: '技巧教學' },
    { href: 'clubs.html', key: 'clubs', en: 'Club Guide', zh: '球桿選擇' },
    { href: 'fix.html', key: 'fix', en: 'Fix My Shot', zh: '擊球診斷' },
    { href: 'shot.html', key: 'shot', en: 'Shot Selector', zh: '短桿選擇' },
    { href: 'practice.html', key: 'practice', en: 'Practice', zh: '練習計畫' },
    { href: 'my-game.html', key: 'mygame', en: 'My Game', zh: '我的成績' }
  ];

  function renderChrome(page) {
    var h = $('#site-header');
    if (h) {
      h.className = 'site-header';
      h.innerHTML = '<div class="bar">' +
        '<a class="brand" href="index.html" aria-label="The Golf Lab home"><span class="brand-mark">' + icon('flag') + '</span><span class="brand-text">The Golf Lab</span></a>' +
        '<nav class="nav" id="nav" aria-label="Main">' + NAV.map(function (n) {
          return '<a href="' + n.href + '"' + (n.key === page ? ' aria-current="page"' : '') + '><span>' + n.en + '</span><small>' + n.zh + '</small></a>';
        }).join('') + '<a class="nav-contact" href="index.html#contact"><span>Contact Us</span><small>聯絡我們</small></a></nav>' +
        '<a class="contact-cta" href="index.html#contact">Contact</a>' +
        '<button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false">' + icon('menu') + '</button>' +
        '</div>';
      $('#navToggle').addEventListener('click', function () {
        var open = h.classList.toggle('open');
        this.setAttribute('aria-expanded', open);
        this.innerHTML = icon(open ? 'close' : 'menu');
      });
    }
    var f = $('#site-footer');
    if (f) {
      f.className = 'site-footer';
      f.innerHTML = '<div class="wrap foot">' +
        '<div><a class="brand light" href="index.html"><span class="brand-mark">' + icon('flag') + '</span><span class="brand-text">The Golf Lab</span></a>' +
        '<p class="foot-note">把高爾夫拆解成可以練習的方法。<br>所有說明皆以右手球員為準。</p></div>' +
        '<div class="foot-links">' + NAV.map(function (n) { return '<a href="' + n.href + '">' + n.en + '<small>' + n.zh + '</small></a>'; }).join('') + '<a href="index.html#contact">Contact Us<small>聯絡我們</small></a></div>' +
        '</div><div class="wrap foot-base"><span>&copy; ' + new Date().getFullYear() + ' The Golf Lab</span><span>Practice with purpose.</span></div>';
    }
  }

  /* ---------- search ---------- */
  function searchIndex() {
    var items = [];
    GL.lessons.forEach(function (l) {
      var c = catById(l.cat);
      items.push({ t: l.title, s: l.zh, k: c.name + ' ' + c.zh + ' ' + l.situation + ' ' + l.club.pick, type: 'Learn · ' + c.name, url: 'learn.html#' + l.id });
    });
    GL.clubs.forEach(function (c) {
      items.push({ t: c.name, s: c.zh, k: c.best.join(' ') + ' loft 球桿', type: 'Club Guide', url: 'clubs.html#' + c.id });
    });
    GL.problems.forEach(function (p) {
      items.push({ t: p.title, s: p.desc, k: p.en + ' 診斷 問題', type: 'Fix My Shot', url: 'fix.html#' + p.id });
    });
    items.push({ t: 'Shot Selector', s: '回答 4 個問題，推薦短桿打法', k: '短桿 切球 選擇 推薦 chipping', type: 'Tool', url: 'shot.html' });
    items.push({ t: 'My Game', s: '上傳計分卡，分析你的成績', k: '計分卡 成績 分析 scorecard 推桿 上果嶺 球道 stats', type: 'Tool', url: 'my-game.html' });
    items.push({ t: 'Practice Plans', s: '15 / 30 分鐘練習菜單', k: '練習 計畫 菜單 up and down', type: 'Tool', url: 'practice.html' });
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
  function lessonCard(l) {
    var c = catById(l.cat);
    return '<a class="lesson-card" href="learn.html#' + l.id + '">' +
      '<div class="lc-art">' + shotSVG(l.shot, { label: l.title }) + '</div>' +
      '<div class="lc-body"><span class="eyebrow">' + c.name + ' · ' + c.zh + '</span>' +
      '<h3>' + esc(l.title) + '</h3><p>' + esc(l.zh) + '</p>' +
      '<span class="lc-meta">' + icon('clock') + l.mins + ' min<span class="dot"></span>' + l.level + '<span class="go">' + icon('arrow') + '</span></span></div></a>';
  }

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
          '<span class="tk-art">' + shotSVG(l.shot) + '</span>' +
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
      var T = [['book', 'learn.html', 'Learn Golf', '技巧教學', '5 類 · ' + GL.lessons.length + ' 篇'], ['club', 'clubs.html', 'Club Guide', '球桿選擇', '6 種球桿'],
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
      var subject = 'The Golf Lab：' + d.topic + '（' + d.name + '）';
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

  /* ---------- LEARN ---------- */
  function learn() {
    var root = $('#learnRoot');
    var render = function () {
      var h = decodeURIComponent(location.hash.slice(1));
      var l = lessonById(h);
      if (l) return renderLesson(root, l);
      var cat = catById(h) ? h : 'chipping';
      renderList(root, cat);
    };
    window.addEventListener('hashchange', function () { render(); window.scrollTo(0, 0); });
    render();
  }

  function renderList(root, cat) {
    var c = catById(cat);
    var ls = GL.lessons.filter(function (l) { return l.cat === cat; });
    document.title = 'Learn Golf — ' + c.name + ' | The Golf Lab';
    root.innerHTML = '<header class="page-head wrap"><span class="eyebrow">Learn Golf · 技巧教學</span><h1>Learn Golf</h1>' +
      '<p class="lead">每一篇教學都用相同的六個步驟：<b>適用情境 → 選桿 → Setup → 動作步驟 → 常見錯誤 → 練習方法</b>。</p></header>' +
      '<div class="wrap"><div class="pill-tabs" role="tablist">' + GL.categories.map(function (x) {
        var n = GL.lessons.filter(function (l) { return l.cat === x.id; }).length;
        return '<a role="tab" href="#' + x.id + '" aria-selected="' + (x.id === cat) + '">' + x.name + '<small>' + x.zh + ' · ' + n + '</small></a>';
      }).join('') + '</div>' +
      '<div class="cat-intro"><h2>' + c.name + ' <span class="zh">' + c.zh + '</span></h2><p>' + c.desc + '</p></div>' +
      '<div class="lesson-grid">' + ls.map(lessonCard).join('') + '</div></div>';
  }

  function renderLesson(root, l) {
    var c = catById(l.cat);
    var sib = GL.lessons;
    var idx = sib.indexOf(l), prev = sib[(idx - 1 + sib.length) % sib.length], next = sib[(idx + 1) % sib.length];
    document.title = l.title + ' — ' + l.zh + ' | The Golf Lab';
    var sec = [
      ['situation', '適用情境', 'When'], ['club', '選桿', 'Club'], ['setup', 'Setup', 'Address'],
      ['steps', '動作步驟', 'Motion'], ['mistakes', '常見錯誤', 'Mistakes'], ['drills', '練習方法', 'Practice']
    ];
    var body = {
      situation: '<p class="big">' + esc(l.situation) + '</p>',
      club: '<div class="club-pick"><div><span class="eyebrow">建議用桿</span><strong>' + esc(l.club.pick) + '</strong><p>' + esc(l.club.note) + '</p></div>' +
        '<table class="scorecard mini"><thead><tr><th>Club</th>' + l.club.ratios.map(function (r) { return '<th>' + r[0] + '</th>'; }).join('') + '</tr></thead>' +
        '<tbody><tr><th>空中 : 滾動</th>' + l.club.ratios.map(function (r) { return '<td>' + r[1] + '</td>'; }).join('') + '</tr></tbody></table></div>',
      setup: '<ul class="ticks">' + l.setup.map(function (s) { return '<li>' + icon('check') + '<span>' + esc(s) + '</span></li>'; }).join('') + '</ul>',
      steps: '<ol class="steps">' + l.steps.map(function (s) { return '<li><span>' + esc(s) + '</span></li>'; }).join('') + '</ol>',
      mistakes: '<div class="mistakes">' + l.mistakes.map(function (m) { return '<div class="mistake"><p class="m">' + esc(m.m) + '</p><p class="f"><b>修正</b>' + esc(m.fix) + '</p></div>'; }).join('') + '</div>',
      drills: '<div class="drills">' + l.drills.map(function (d) { return '<div class="drill">' + icon('target') + '<h4>' + esc(d.name) + '</h4><p>' + esc(d.how) + '</p></div>'; }).join('') + '</div>'
    };
    root.innerHTML = '<div class="wrap lesson">' +
      '<a class="crumb" href="#' + l.cat + '">' + icon('back') + c.name + ' · ' + c.zh + '</a>' +
      '<header class="lesson-head"><div><span class="eyebrow">' + c.name + ' · ' + l.level + ' · ' + l.mins + ' min</span><h1>' + esc(l.title) + '</h1><p class="lead">' + esc(l.zh) + '</p></div>' +
      '<div class="lesson-art">' + shotSVG(l.shot, { label: l.title, tag: l.club.pick.split('、')[0] }) + '</div></header>' +
      '<div class="lesson-layout"><nav class="format-rail" aria-label="Lesson sections">' + sec.map(function (s, i) {
        return '<a href="#' + l.id + '" data-jump="sec-' + s[0] + '"><span class="n">' + (i + 1) + '</span>' + s[1] + '</a>';
      }).join('') + '</nav>' +
      '<div class="lesson-body">' + sec.map(function (s, i) {
        return '<section class="lsec" id="sec-' + s[0] + '"><div class="lsec-h"><span class="n">' + (i + 1) + '</span><h2>' + s[1] + '</h2><span class="en">' + s[2] + '</span></div>' + body[s[0]] + '</section>';
      }).join('') +
      (l.cat === 'chipping' || l.cat === 'pitching' ? '<a class="cta-band" href="shot.html"><div><strong>不確定該打哪一種？</strong><span>用 Shot Selector 回答 4 個問題，馬上得到建議。</span></div>' + icon('arrow') + '</a>' : '') +
      '<div class="pager"><a href="#' + prev.id + '"><small>上一篇</small>' + esc(prev.title) + '</a><a href="#' + next.id + '" class="next"><small>下一篇</small>' + esc(next.title) + '</a></div>' +
      '</div></div></div>';
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
    }
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
        return '<button class="problem" data-p="' + p.id + '"><span class="pn">' + String(i + 1).padStart(2, '0') + '</span><strong>' + esc(p.title) + '</strong><span>' + esc(p.desc) + '</span><em>' + esc(p.en) + ' ' + icon('arrow') + '</em></button>';
      }).join('') + '</div>';
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

  /* ---------- PRACTICE ---------- */
  function practice() {
    var plan = store.get('plan', '15');
    var timer = { i: 0, left: 0, run: false, h: null };
    var STATIONS = ['短草 5 步', '邊緣推桿', '長草切球', '下坡切球', '上坡切球', '越過沙坑', '20 碼 Pitch', '沙坑', '自選位置'];
    var scores = store.get('ud', []);

    function drawPlan() {
      var p = GL.plans[plan];
      $$('[data-plan]').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-plan') === plan); });
      var done = store.get('done' + plan, []);
      var total = p.blocks.reduce(function (s, b) { return s + b.mins; }, 0);
      $('#planHead').innerHTML = '<span class="eyebrow">' + total + ' minutes</span><h2>' + p.name + '</h2><p>' + p.zh + '・' + p.blocks.length + ' 個練習</p>';
      $('#planBar').innerHTML = p.blocks.map(function (b, i) { return '<i class="' + (done.indexOf(i) > -1 ? 'done' : '') + (timer.run || timer.left ? (i === timer.i ? ' now' : '') : '') + '" style="flex:' + b.mins + '" title="' + esc(b.name) + '"></i>'; }).join('');
      $('#planList').innerHTML = p.blocks.map(function (b, i) {
        var l = b.lesson && lessonById(b.lesson);
        return '<li class="block' + (done.indexOf(i) > -1 ? ' done' : '') + ((timer.run || timer.left) && i === timer.i ? ' now' : '') + '">' +
          '<label class="chk"><input type="checkbox" data-i="' + i + '"' + (done.indexOf(i) > -1 ? ' checked' : '') + '><span>' + icon('check') + '</span></label>' +
          '<div class="bl-time">' + b.mins + '<small>min</small></div>' +
          '<div class="bl-body"><span class="eyebrow">' + esc(b.cat) + '</span><h3>' + esc(b.name) + '</h3><p>' + esc(b.how) + '</p>' +
          (l ? '<a href="learn.html#' + l.id + '">教學：' + esc(l.title) + ' ' + icon('arrow') + '</a>' : '') + '</div></li>';
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
    ({ home: home, learn: learn, clubs: clubs, fix: fix, shot: shot, practice: practice }[page] || function () {})();
    var reveal = $$('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12 });
      reveal.forEach(function (r) { io.observe(r); });
    } else reveal.forEach(function (r) { r.classList.add('in'); });
  });
})();
