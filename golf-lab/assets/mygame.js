/* THE GOLF LAB — My Game: enter or upload a scorecard and analyse it, Masters-style. */
(function () {
  'use strict';
  var GL = window.GL, esc = GL.esc, icon = GL.icon, store = GL.store;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var DEFAULT_PAR = [4, 5, 4, 3, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 5, 3, 4, 4];
  var H = 18;
  var blank = function () { var a = []; for (var i = 0; i < H; i++) a.push(null); return a; };
  var today = function () { return new Date().toISOString().slice(0, 10); };
  var sum = function (a) { return a.reduce(function (s, v) { return s + (v || 0); }, 0); };

  function sampleRounds() {
    var Y = true, N = false, _ = null;
    return [
      { id: 's1', sample: true, course: '範例球場 Example Golf Club', date: '2026-10-04', par: DEFAULT_PAR.slice(),
        score: [5, 6, 4, 4, 6, 3, 5, 5, 5, 4, 5, 4, 6, 5, 7, 4, 5, 5],
        putts: [2, 2, 1, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2],
        fir: [N, Y, Y, _, N, _, Y, Y, N, Y, N, _, Y, N, N, _, Y, N] },
      { id: 's2', sample: true, course: '範例球場 Example Golf Club', date: '2026-10-18', par: DEFAULT_PAR.slice(),
        score: [6, 5, 5, 3, 5, 4, 5, 6, 4, 5, 4, 3, 6, 5, 6, 4, 4, 5],
        putts: [2, 2, 2, 2, 2, 2, 2, 2, 1, 3, 2, 1, 2, 2, 2, 2, 2, 2],
        fir: [N, Y, Y, _, Y, _, Y, N, Y, N, Y, _, Y, Y, N, _, Y, Y] }
    ];
  }

  var rounds = store.get('rounds', null);
  if (!rounds || !rounds.length) rounds = sampleRounds();
  var cur = Math.min(store.get('round', rounds.length - 1), rounds.length - 1);
  var tab = store.get('mgtab', 'summary');
  var save = function () {
    store.set('rounds', rounds.map(function (r) { var c = Object.assign({}, r); if (c.photo && c.photo.length > 900000) c.photo = null; return c; }));
    store.set('round', cur);
  };
  var R = function () { return rounds[cur]; };

  function newRound(data) {
    var last = rounds[rounds.length - 1];
    var r = { id: 'r' + Date.now(), course: last && !last.sample ? last.course : '', date: today(),
      par: last ? last.par.slice() : DEFAULT_PAR.slice(), score: blank(), putts: blank(), fir: blank(), photo: null };
    if (data) Object.keys(data).forEach(function (k) { if (data[k] != null) r[k] = data[k]; });
    rounds = rounds.filter(function (x) { return !x.sample; });
    rounds.push(r);
    cur = rounds.length - 1;
    save();
    return r;
  }

  /* ---------- scoring helpers ---------- */
  var diff = function (r, i) { return r.score[i] == null ? null : r.score[i] - r.par[i]; };
  var symClass = function (d) { return d == null ? '' : d <= -2 ? 'dcircle' : d === -1 ? 'circle' : d === 0 ? '' : d === 1 ? 'square' : 'dsquare'; };
  var gir = function (r, i) { return r.score[i] == null || r.putts[i] == null ? null : (r.score[i] - r.putts[i]) <= r.par[i] - 2; };
  var played = function (r) { var n = []; for (var i = 0; i < H; i++) if (r.score[i] != null) n.push(i); return n; };
  var toParStr = function (n) { return n === 0 ? 'E' : (n > 0 ? '+' : '') + n; };

  function stats(list) {
    var s = { holes: 0, strokes: 0, par: 0, cat: [0, 0, 0, 0, 0], byPar: { 3: [0, 0], 4: [0, 0], 5: [0, 0] },
      front: [0, 0, 0], back: [0, 0, 0], putts: 0, puttHoles: 0, one: 0, three: 0,
      fir: [0, 0], gir: [0, 0], scr: [0, 0], hole: [] };
    for (var h = 0; h < H; h++) s.hole.push([0, 0]);
    list.forEach(function (r) {
      played(r).forEach(function (i) {
        var d = diff(r, i), p = r.par[i];
        s.holes++; s.strokes += r.score[i]; s.par += p;
        s.cat[d <= -2 ? 0 : d === -1 ? 1 : d === 0 ? 2 : d === 1 ? 3 : 4]++;
        if (s.byPar[p]) { s.byPar[p][0] += r.score[i]; s.byPar[p][1]++; }
        var half = i < 9 ? s.front : s.back; half[0] += r.score[i]; half[1] += p; half[2]++;
        s.hole[i][0] += d; s.hole[i][1]++;
        if (r.putts[i] != null) {
          s.putts += r.putts[i]; s.puttHoles++;
          if (r.putts[i] === 1) s.one++;
          if (r.putts[i] >= 3) s.three++;
          var g = gir(r, i);
          s.gir[1]++; if (g) s.gir[0]++;
          else { s.scr[1]++; if (d <= 0) s.scr[0]++; }
        }
        if (p > 3 && r.fir[i] != null) { s.fir[1]++; if (r.fir[i]) s.fir[0]++; }
      });
    });
    s.rounds = list.filter(function (r) { return played(r).length; }).length || 1;
    return s;
  }
  var pct = function (a) { return a[1] ? a[0] / a[1] : 0; };

  /* ---------- svg ---------- */
  function dualRing(outer, inner) {
    var ro = 50, ri = 34, co = 2 * Math.PI * ro, ci = 2 * Math.PI * ri;
    return '<svg class="ring" viewBox="0 0 124 124" aria-hidden="true">' +
      '<circle cx="62" cy="62" r="' + ro + '" fill="none" stroke="#efece3" stroke-width="22"/>' +
      '<circle cx="62" cy="62" r="' + ro + '" class="arc" fill="none" stroke="#006747" stroke-width="22" stroke-dasharray="' + (co * outer) + ' ' + co + '" transform="rotate(-90 62 62)"/>' +
      (inner == null ? '' : '<circle class="arc" cx="62" cy="62" r="' + ri + '" fill="none" stroke="#8d918e" stroke-width="3" stroke-linecap="round" stroke-dasharray="' + (ci * inner) + ' ' + ci + '" transform="rotate(-90 62 62)"/>') +
      '</svg>';
  }
  var CAT = [['Eagles', '老鷹以上', '#c8a24a'], ['Birdies', '博蒂', '#127a56'], ['Par', '標準桿', '#d9d8d2'], ['Bogey', '柏忌', '#a7aaa6'], ['Double +', '雙柏忌以上', '#17251e']];
  function donut(cat) {
    var total = sum(cat) || 1, r = 80, c = 2 * Math.PI * r, off = 0, out = '';
    cat.forEach(function (n, k) {
      if (!n) return;
      var len = n / total * c;
      out += '<circle class="arc" cx="110" cy="110" r="' + r + '" fill="none" stroke="' + CAT[k][2] + '" stroke-width="42" stroke-dasharray="' + len + ' ' + c + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 110 110)"/>';
      off += len;
    });
    return '<svg class="donut" viewBox="0 0 220 220" role="img" aria-label="Scoring breakdown"><circle cx="110" cy="110" r="' + r + '" fill="none" stroke="#efece3" stroke-width="42"/>' + out + '</svg>';
  }

  /* ---------- rendering ---------- */
  function drawRounds() {
    $('#roundTabs').innerHTML = rounds.map(function (r, i) {
      var p = played(r), tp = sum(p.map(function (h) { return diff(r, h); }));
      return '<button type="button" role="tab" aria-selected="' + (i === cur) + '" data-r="' + i + '">R' + (i + 1) + '<small>' + esc(r.date.slice(5).replace('-', '/')) + (p.length ? ' · ' + sum(r.score) : '') + '</small></button>';
    }).join('') + '<button type="button" class="add-round" id="addRound">' + icon('plus') + '新增回合</button>';
    $$('[data-r]').forEach(function (b) { b.addEventListener('click', function () { cur = +b.getAttribute('data-r'); save(); drawAll(); }); });
    $('#addRound').addEventListener('click', function () { newRound(); drawAll(); toast('已新增 R' + rounds.length + '，在計分卡輸入每洞桿數。'); setTimeout(function () { var f = $('.in-score'); if (f) f.focus(); }, 50); });
    $('#sampleNote').hidden = !rounds.some(function (r) { return r.sample; });
  }

  function drawHeader() {
    var r = R(), p = played(r);
    var tp = sum(p.map(function (h) { return diff(r, h); }));
    $('#roundHead').innerHTML =
      '<div class="rh-main"><label class="rh-field"><span>球場 Course</span><input id="rCourse" type="text" maxlength="60" placeholder="輸入球場名稱" value="' + esc(r.course) + '"></label>' +
      '<label class="rh-field date"><span>日期 Date</span><input id="rDate" type="date" value="' + esc(r.date) + '"></label></div>' +
      '<div class="player-box"><div><span>Total</span><strong>' + (p.length ? sum(r.score) : '–') + '</strong></div>' +
      '<div><span>To Par</span><strong class="' + (tp < 0 ? 'under' : '') + '">' + (p.length ? toParStr(tp) : '–') + '</strong></div>' +
      '<div><span>Thru</span><strong>' + (p.length === H ? 'F' : p.length) + '</strong></div></div>';
    $('#rCourse').addEventListener('change', function () { R().course = this.value.trim(); save(); drawOfficial(); });
    $('#rDate').addEventListener('change', function () { R().date = this.value || today(); save(); drawRounds(); });
  }

  function cardHTML() {
    var r = R();
    var cols = [];
    for (var i = 0; i < 9; i++) cols.push(i);
    cols.push('out');
    for (i = 9; i < 18; i++) cols.push(i);
    cols.push('in');
    var tot = function (from, to, arr) { var v = 0, any = false; for (var k = from; k < to; k++) if (arr[k] != null) { v += +arr[k]; any = true; } return any ? v : '–'; };
    var row = function (label, cls, cell, totals) {
      return '<tr class="' + cls + '"><th>' + label + '</th>' + cols.map(function (c) {
        if (c === 'out') return '<td class="sub">' + totals(0, 9) + '</td>';
        if (c === 'in') return '<td class="sub">' + totals(9, 18) + '</td>';
        return '<td>' + cell(c) + '</td>';
      }).join('') + '<td class="tot">' + totals(0, 18) + '</td></tr>';
    };
    var girArr = r.par.map(function (_, i) { var g = gir(r, i); return g == null ? null : g ? 1 : 0; });
    var firArr = r.fir.map(function (f, i) { return r.par[i] === 3 || f == null ? null : f ? 1 : 0; });
    return '<table class="scorecard edit"><thead><tr><th>Hole</th>' + cols.map(function (c) {
      return '<th class="' + (typeof c === 'string' ? 'sub' : '') + '">' + (c === 'out' ? 'Out' : c === 'in' ? 'In' : c + 1) + '</th>';
    }).join('') + '<th class="tot">Total</th></tr></thead><tbody>' +
      row('Par <small>點擊修改</small>', 'par', function (i) { return '<button type="button" class="par-btn" data-par="' + i + '" aria-label="第 ' + (i + 1) + ' 洞標準桿 ' + r.par[i] + '">' + r.par[i] + '</button>'; }, function (a, b) { return tot(a, b, r.par); }) +
      row('Score <small>桿數</small>', 'score-row', function (i) {
        return '<span class="sym ' + symClass(diff(r, i)) + '"><input class="in-score" data-h="' + i + '" inputmode="numeric" maxlength="2" aria-label="第 ' + (i + 1) + ' 洞桿數" value="' + (r.score[i] == null ? '' : r.score[i]) + '"></span>';
      }, function (a, b) { return tot(a, b, r.score); }) +
      row('Putts <small>推桿</small>', 'putt-row', function (i) {
        return '<input class="in-putt" data-h="' + i + '" inputmode="numeric" maxlength="1" aria-label="第 ' + (i + 1) + ' 洞推桿數" value="' + (r.putts[i] == null ? '' : r.putts[i]) + '">';
      }, function (a, b) { return tot(a, b, r.putts); }) +
      row('Fairway <small>上球道</small>', 'fir-row', function (i) {
        if (r.par[i] === 3) return '<span class="na">·</span>';
        var f = r.fir[i];
        return '<button type="button" class="fir-btn ' + (f === true ? 'yes' : f === false ? 'no' : '') + '" data-fir="' + i + '" aria-label="第 ' + (i + 1) + ' 洞是否上球道">' + (f === true ? '✓' : f === false ? '✕' : '–') + '</button>';
      }, function (a, b) { return tot(a, b, firArr); }) +
      row('GIR <small>自動計算</small>', 'gir-row', function (i) { var g = gir(r, i); return g == null ? '<span class="na">·</span>' : '<span class="gir ' + (g ? 'yes' : '') + '"></span>'; }, function (a, b) { return tot(a, b, girArr); }) +
      '</tbody></table>';
  }

  function drawCard() {
    var wrap = $('#editCard');
    var keep = document.activeElement && wrap.contains(document.activeElement) ? { cls: document.activeElement.className, h: document.activeElement.getAttribute('data-h') } : null;
    wrap.innerHTML = cardHTML();
    if (keep && keep.h != null) { var el = $('.' + keep.cls.split(' ')[0] + '[data-h="' + keep.h + '"]', wrap); if (el) { el.focus(); if (el.select) el.select(); } }
  }

  function bindCard() {
    var wrap = $('#editCard');
    wrap.addEventListener('click', function (e) {
      var p = e.target.closest('[data-par]'), f = e.target.closest('[data-fir]');
      if (p) { var i = +p.getAttribute('data-par'); R().par[i] = R().par[i] === 5 ? 3 : R().par[i] + 1; if (R().par[i] === 3) R().fir[i] = null; changed(); }
      if (f) { var j = +f.getAttribute('data-fir'), v = R().fir[j]; R().fir[j] = v == null ? true : v === true ? false : null; changed(); }
    });
    wrap.addEventListener('input', function (e) {
      var t = e.target;
      if (!t.matches('input')) return;
      var h = +t.getAttribute('data-h'), raw = t.value.replace(/\D/g, ''), isScore = t.classList.contains('in-score');
      t.value = raw;
      var v = raw === '' ? null : +raw;
      if (isScore) { if (v === 0) v = null; R().score[h] = v; } else R().putts[h] = v;
      if (R().sample) { R().sample = false; }
      save();
      var advance = raw !== '' && (!isScore || raw.length === 2 || raw !== '1');
      refreshSoft();
      var next = advance && h < H - 1 ? $((isScore ? '.in-score' : '.in-putt') + '[data-h="' + (h + 1) + '"]', wrap) : null;
      if (next) { next.focus(); next.select(); }
      else { var same = $((isScore ? '.in-score' : '.in-putt') + '[data-h="' + h + '"]', wrap); if (same) { same.focus(); var L = same.value.length; same.setSelectionRange(L, L); } }
    });
    wrap.addEventListener('focusin', function (e) { if (e.target.select) e.target.select(); });
  }

  function changed() { if (R().sample) R().sample = false; save(); refreshSoft(); }
  function refreshSoft() { drawCard(); drawHeader(); drawOfficial(); drawStats(); drawInsights(); drawRoundsLabels(); }
  function drawRoundsLabels() {
    $$('[data-r]').forEach(function (b) {
      var r = rounds[+b.getAttribute('data-r')], p = played(r);
      b.querySelector('small').textContent = r.date.slice(5).replace('-', '/') + (p.length ? ' · ' + sum(r.score) : '');
    });
    $('#sampleNote').hidden = !rounds.some(function (r) { return r.sample; });
  }

  function drawOfficial() {
    $('#officialCard').innerHTML = '<table class="scorecard"><thead><tr><th>Hole</th>' + DEFAULT_PAR.map(function (_, i) { return '<th>' + (i + 1) + '</th>'; }).join('') + '<th class="tot">Total</th></tr></thead><tbody>' +
      '<tr class="par"><th>Par</th>' + R().par.map(function (p) { return '<td>' + p + '</td>'; }).join('') + '<td class="tot">' + sum(R().par) + '</td></tr>' +
      rounds.map(function (r, k) {
        return '<tr class="' + (k === cur ? 'cur' : '') + '"><th><button type="button" class="link-btn" data-pick="' + k + '">R' + (k + 1) + '</button></th>' + r.score.map(function (v, i) {
          return '<td><span class="sym ' + symClass(diff(r, i)) + '">' + (v == null ? '' : v) + '</span></td>';
        }).join('') + '<td class="tot"><strong>' + (played(r).length ? sum(r.score) : '–') + '</strong></td></tr>';
      }).join('') + '</tbody></table>';
    $$('[data-pick]').forEach(function (b) { b.addEventListener('click', function () { cur = +b.getAttribute('data-pick'); save(); drawAll(); }); });
  }

  var TABS = [['summary', 'Scoring Summary'], ['par', 'Par 3 / 4 / 5'], ['greens', 'Greens Hit'], ['fairways', 'Fairways Hit'], ['putting', 'Putting'], ['holes', 'Hole by Hole']];
  function drawStats() {
    var me = stats([R()]), all = stats(rounds);
    var multi = rounds.length > 1;
    $('#statTabs').innerHTML = TABS.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('');
    $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); store.set('mgtab', tab); drawStats(); }); });
    var el = $('#statBody');
    var legend = multi ? '<p class="ring-legend"><span class="lg-me"></span>R' + (cur + 1) + ' 本回合<span class="lg-all"></span>所有 ' + rounds.length + ' 回合平均</p>' : '';
    var ringStat = function (title, sub, a, b, extra) {
      return '<div class="stat">' + dualRing(a, multi ? b : null) + '<div class="stat-v"><strong>' + Math.round(a * 100) + '<sup>%</sup></strong>' + (multi ? '<small>' + Math.round(b * 100) + '%</small>' : '') + '</div><h4>' + title + '</h4><p>' + sub + '</p>' + (extra || '') + '</div>';
    };
    if (!me.holes) { el.innerHTML = '<p class="empty-stats">輸入至少一洞的桿數，統計就會出現在這裡。</p>'; return; }

    if (tab === 'summary') {
      el.innerHTML = '<p class="stat-cap">Cumulative breakdown of scores per hole · 每洞成績分布</p><div class="summary-grid"><div class="overall"><h3>' + esc(R().course || 'My Round') + ' · R' + (cur + 1) + '</h3>' + donut(me.cat) +
        '<ul class="donut-key">' + CAT.map(function (c, k) { return '<li><i style="background:' + c[2] + '"></i>' + c[0] + '<b>' + me.cat[k] + '</b></li>'; }).join('') + '</ul></div>' +
        '<div><div class="stat-grid">' + CAT.map(function (c, k) { return ringStat(c[0], c[1], me.cat[k] / me.holes, all.cat[k] / all.holes); }).join('') + '</div>' + legend + '</div></div>';
    } else if (tab === 'par') {
      el.innerHTML = '<p class="stat-cap">Scoring average by par · 各標準桿平均桿數</p><div class="par-grid">' + [3, 4, 5].map(function (p) {
        var m = me.byPar[p], a = all.byPar[p];
        if (!m[1]) return '<div class="par-card"><span class="eyebrow">Par ' + p + '</span><strong>–</strong><p>本回合沒有紀錄</p></div>';
        var avg = m[0] / m[1], over = avg - p, aAvg = a[1] ? a[0] / a[1] : avg;
        return '<div class="par-card"><span class="eyebrow">Par ' + p + ' · ' + m[1] + ' 洞</span><strong>' + avg.toFixed(2) + '</strong>' +
          '<p class="' + (over < 0 ? 'under' : '') + '">' + (over >= 0 ? '+' : '') + over.toFixed(2) + ' / 洞</p>' +
          '<div class="par-bar"><i style="width:' + Math.min(100, Math.max(4, over / 2 * 100)) + '%"></i></div>' +
          (multi ? '<small>所有回合平均 ' + aAvg.toFixed(2) + '</small>' : '') + '</div>';
      }).join('') + '</div>' +
        '<div class="half-grid">' + [['Front 9', '前九洞', me.front, all.front], ['Back 9', '後九洞', me.back, all.back]].map(function (x) {
          var tp = x[2][0] - x[2][1];
          return '<div class="half"><span class="eyebrow">' + x[0] + ' · ' + x[1] + '</span><strong>' + (x[2][2] ? x[2][0] : '–') + '</strong><p class="' + (tp < 0 ? 'under' : '') + '">' + (x[2][2] ? toParStr(tp) : '') + '</p>' +
            (multi && x[3][2] ? '<small>平均 ' + (x[3][0] / all.rounds).toFixed(1) + '</small>' : '') + '</div>';
        }).join('') + '</div>';
    } else if (tab === 'greens') {
      el.innerHTML = '<p class="stat-cap">Greens in regulation · 標準桿上果嶺（桿數 − 推桿 ≤ 標準桿 − 2）</p><div class="stat-grid three">' +
        ringStat('Greens Hit', me.gir[0] + ' / ' + me.gir[1] + ' 洞', pct(me.gir), pct(all.gir)) +
        ringStat('Scrambling', '沒上果嶺仍保住 Par', pct(me.scr), pct(all.scr)) +
        ringStat('Par or Better', '標準桿或更好', (me.cat[0] + me.cat[1] + me.cat[2]) / me.holes, (all.cat[0] + all.cat[1] + all.cat[2]) / all.holes) +
        '</div>' + legend + (me.gir[1] ? '' : '<p class="empty-stats">輸入推桿數後才能計算上果嶺率。</p>');
    } else if (tab === 'fairways') {
      el.innerHTML = '<p class="stat-cap">Fairways hit on par 4 and par 5 · Par 4 / Par 5 開球上球道</p><div class="stat-grid three">' +
        ringStat('Fairways Hit', me.fir[0] + ' / ' + me.fir[1] + ' 洞', pct(me.fir), pct(all.fir)) +
        '</div>' + legend + (me.fir[1] ? '' : '<p class="empty-stats">在計分卡的 Fairway 列點擊 ✓ 或 ✕ 紀錄開球。</p>');
    } else if (tab === 'putting') {
      var per = me.puttHoles ? me.putts / me.puttHoles : 0;
      var r = R();
      el.innerHTML = '<p class="stat-cap">Putting · 推桿</p><div class="tiles">' +
        tile('Total Putts', me.puttHoles ? me.putts : '–', multi && all.puttHoles ? '平均 ' + (all.putts / all.rounds).toFixed(1) : '') +
        tile('Per Hole', me.puttHoles ? per.toFixed(2) : '–', '每洞推桿') +
        tile('1-Putts', me.one, '一推進洞') + tile('3-Putts', me.three, '三推以上', me.three >= 2) + '</div>' +
        '<div class="putt-strip">' + r.putts.map(function (p, i) { return '<div class="ps"><i class="p' + (p == null ? 'x' : Math.min(p, 3)) + '" style="height:' + (p == null ? 4 : Math.min(p, 4) * 22) + 'px"></i><span>' + (i + 1) + '</span></div>'; }).join('') + '</div>';
    } else {
      var maxAbs = 0.5;
      all.hole.forEach(function (h) { if (h[1]) maxAbs = Math.max(maxAbs, Math.abs(h[0] / h[1])); });
      el.innerHTML = '<p class="stat-cap">Average score to par on each hole, all rounds · 每洞平均（所有回合）</p><div class="hole-chart">' + all.hole.map(function (h, i) {
        var v = h[1] ? h[0] / h[1] : 0, w = Math.abs(v) / maxAbs * 50;
        return '<div class="hc-row"><span class="hc-n">' + (i + 1) + '<small>P' + R().par[i] + '</small></span><span class="hc-bar"><i class="' + (v < 0 ? 'neg' : v >= 1 ? 'bad' : '') + '" style="' + (v < 0 ? 'right:50%' : 'left:50%') + ';width:' + w + '%"></i></span><span class="hc-v">' + (h[1] ? (v > 0 ? '+' : '') + v.toFixed(1) : '–') + '</span></div>';
      }).join('') + '</div>';
    }
  }
  function tile(t, v, sub, warn) { return '<div class="tile' + (warn ? ' warn' : '') + '"><span>' + t + '</span><strong>' + v + '</strong><small>' + sub + '</small></div>'; }

  function drawInsights() {
    var s = stats([R()]);
    var tips = [];
    var L = function (id) { var l = GL.lessonById(id); return l ? { href: 'learn.html#' + id, label: l.title } : null; };
    if (!s.holes) { $('#insights').innerHTML = ''; return; }
    var per18 = function (n) { return n / s.holes * 18; };
    if (s.puttHoles && (per18(s.putts) > 34 || s.three >= 2)) tips.push({ t: '減少三推', d: '本回合 ' + s.three + ' 次三推、每 18 洞約 ' + per18(s.putts).toFixed(0) + ' 推。先練長推距離感，讓第一推停在 1 公尺內。', l: L('lag-putting') });
    if (s.puttHoles && s.one < s.holes / 9) tips.push({ t: '提高短推命中', d: '一推進洞只有 ' + s.one + ' 次。1–2 公尺的短推是最快省桿的地方。', l: L('short-putts') });
    if (s.gir[1] && pct(s.gir) < 0.3) tips.push({ t: '上果嶺率偏低', d: '標準桿上果嶺 ' + Math.round(pct(s.gir) * 100) + '%。檢查是否常打厚或打薄。', l: { href: 'fix.html#fat', label: 'Fix My Shot：打厚' } });
    if (s.scr[1] >= 3 && pct(s.scr) < 0.3) tips.push({ t: '加強救球（Up & Down）', d: '沒上果嶺時只有 ' + Math.round(pct(s.scr) * 100) + '% 保住 Par。用 Shot Selector 選對打法，再練 Up & Down 挑戰。', l: { href: 'practice.html', label: 'Up & Down Challenge' } });
    if (s.fir[1] >= 4 && pct(s.fir) < 0.45) tips.push({ t: '開球上球道', d: '球道命中 ' + Math.round(pct(s.fir) * 100) + '%。如果總是偏右，先檢查握桿與揮桿路徑。', l: { href: 'fix.html#slice', label: 'Fix My Shot：球往右飛' } });
    if (s.cat[4] >= 3) tips.push({ t: '避免大數字', d: '本回合 ' + s.cat[4] + ' 個雙柏忌以上。遇到麻煩時先求安全出來，短桿選最保守的打法。', l: { href: 'shot.html', label: 'Shot Selector' } });
    if (s.byPar[3][1] && s.byPar[3][0] / s.byPar[3][1] - 3 > 0.8) tips.push({ t: 'Par 3 的鐵桿', d: 'Par 3 平均 ' + (s.byPar[3][0] / s.byPar[3][1]).toFixed(1) + ' 桿。確認每支鐵桿的距離，選對桿。', l: { href: 'clubs.html#iron', label: 'Club Guide：Irons' } });
    if (!tips.length) tips.push({ t: '保持下去', d: '這一回合沒有明顯的弱點。用 30 分鐘完整短桿計畫維持手感。', l: { href: 'practice.html', label: 'Practice Plans' } });
    $('#insights').innerHTML = tips.slice(0, 4).map(function (t, i) {
      return '<div class="insight"><span class="pn">' + (i + 1) + '</span><h4>' + esc(t.t) + '</h4><p>' + esc(t.d) + '</p>' + (t.l ? '<a href="' + t.l.href + '">' + esc(t.l.label) + ' ' + icon('arrow') + '</a>' : '') + '</div>';
    }).join('');
  }

  function drawPhoto() {
    var r = R(), box = $('#photoBox');
    box.hidden = !r.photo;
    if (r.photo) $('#photoImg').src = r.photo;
  }

  function drawAll() { drawRounds(); drawHeader(); drawCard(); drawOfficial(); drawStats(); drawInsights(); drawPhoto(); drawDelete(); GL.reveal($('main')); }

  var delArmed = false;
  function drawDelete() {
    var b = $('#delRound');
    b.textContent = delArmed ? '確定刪除 R' + (cur + 1) + '？' : '刪除這一回合';
    b.classList.toggle('armed', delArmed);
  }

  /* ---------- import ---------- */
  function parseText(text) {
    var lines = text.split(/\r?\n/).map(function (l) { return l.split(/[,\t;]+/).map(function (c) { return c.trim(); }); }).filter(function (l) { return l.join('') !== ''; });
    var out = {}, keys = { par: /^(par|標準桿)$/i, score: /^(score|strokes|桿數|成績|scores)$/i, putts: /^(putts?|推桿|推桿數)$/i, fir: /^(fir|fairways?|球道|上球道)$/i };
    var num = function (c) { var n = parseInt(c, 10); return isNaN(n) ? null : n; };
    var bool = function (c) { c = String(c).toLowerCase(); return /^(1|y|yes|t|true|✓|v|o)$/.test(c) ? true : /^(0|n|no|f|false|✕|x)$/.test(c) ? false : null; };
    var keyOf = function (c) { for (var k in keys) if (keys[k].test(c)) return k; if (/^(course|球場)$/i.test(c)) return 'course'; if (/^(date|日期)$/i.test(c)) return 'date'; return null; };
    // row-wise: each line starts with a label
    var rowWise = lines.some(function (l) { var k = keyOf(l[0]); return k === 'score' || k === 'par'; });
    if (rowWise) {
      lines.forEach(function (l) {
        var k = keyOf(l[0]); if (!k) return;
        if (k === 'course' || k === 'date') { out[k] = l.slice(1).join(' '); return; }
        var vals = l.slice(1).filter(function (c) { return !/^(out|in|total|tot|前九|後九|總計)$/i.test(c); });
        var arr = vals.map(k === 'fir' ? bool : num);
        // drop subtotal columns if a 21-column (with Out/In/Total) row was given
        if (arr.length >= 21 && k !== 'fir') arr = arr.slice(0, 9).concat(arr.slice(10, 19));
        out[k] = arr.slice(0, H);
      });
    } else {
      var head = lines[0].map(function (c) { return keyOf(c) || (/^(hole|洞)$/i.test(c) ? 'hole' : null); });
      var hasHead = head.some(Boolean);
      if (!hasHead && lines.length === 1) { out.score = lines[0].map(num).slice(0, H); }
      else {
        var cols = hasHead ? head : ['hole', 'par', 'score', 'putts', 'fir'];
        var body = hasHead ? lines.slice(1) : lines;
        body.forEach(function (l) {
          cols.forEach(function (k, ci) {
            if (!k || k === 'hole' || k === 'course' || k === 'date') return;
            (out[k] = out[k] || []).push(k === 'fir' ? bool(l[ci]) : num(l[ci]));
          });
        });
      }
    }
    if (!out.score || !out.score.some(function (v) { return v != null; })) return null;
    var fill = function (a, d) { a = (a || []).slice(0, H); while (a.length < H) a.push(d === undefined ? null : d); return a; };
    var par = out.par && out.par.filter(Boolean).length >= 9 ? fill(out.par).map(function (p, i) { return p || DEFAULT_PAR[i]; }) : null;
    return { score: fill(out.score), putts: fill(out.putts), fir: fill(out.fir), par: par, course: out.course || null, date: /^\d{4}-\d{2}-\d{2}$/.test(out.date || '') ? out.date : null };
  }

  function readFile(file) {
    if (!file) return;
    if (/^image\//.test(file.type)) return readPhoto(file);
    var fr = new FileReader();
    fr.onload = function () {
      var data = parseText(String(fr.result));
      if (!data) { toast('讀不到桿數。請確認檔案有「Score」一列，或參考下方的範本格式。', true); return; }
      newRound(data);
      drawAll();
      toast('已匯入 ' + played(R()).length + ' 洞成績到 R' + (cur + 1) + '。');
      document.getElementById('scorecardSec').scrollIntoView({ behavior: 'smooth' });
    };
    fr.onerror = function () { toast('無法讀取這個檔案，請再試一次。', true); };
    fr.readAsText(file);
  }

  function readPhoto(file) {
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 1400, sc = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        var url = c.toDataURL('image/jpeg', 0.82);
        var r = R();
        if (r.sample || played(r).length) r = newRound();
        r.photo = url;
        save(); drawAll();
        toast('照片已加入 R' + (cur + 1) + '。對照照片在下方計分卡輸入每洞桿數。');
        document.getElementById('scorecardSec').scrollIntoView({ behavior: 'smooth' });
        setTimeout(function () { var f = $('.in-score'); if (f) f.focus({ preventScroll: true }); }, 400);
      };
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  }

  var toastT;
  function toast(msg, err) {
    var t = $('#toast');
    t.textContent = msg; t.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(toastT); toastT = setTimeout(function () { t.className = 'toast'; }, 4200);
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    $('#fileCsv').addEventListener('change', function () { readFile(this.files[0]); this.value = ''; });
    $('#filePhoto').addEventListener('change', function () { readFile(this.files[0]); this.value = ''; });
    var drop = $('#dropZone');
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { readFile(e.dataTransfer.files[0]); });
    $('#pasteBtn').addEventListener('click', function () {
      var data = parseText($('#pasteArea').value);
      if (!data) { toast('讀不到桿數。請貼上像範本一樣有「Score」的資料。', true); return; }
      newRound(data); drawAll(); $('#pasteArea').value = '';
      toast('已匯入 ' + played(R()).length + ' 洞成績到 R' + (cur + 1) + '。');
      document.getElementById('scorecardSec').scrollIntoView({ behavior: 'smooth' });
    });
    $('#manualBtn').addEventListener('click', function () {
      newRound(); drawAll();
      document.getElementById('scorecardSec').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { var f = $('.in-score'); if (f) f.focus({ preventScroll: true }); }, 400);
    });
    $('#clearSample').addEventListener('click', function () { rounds = rounds.filter(function (r) { return !r.sample; }); if (!rounds.length) newRound(); cur = rounds.length - 1; save(); drawAll(); });
    $('#removePhoto').addEventListener('click', function () { R().photo = null; save(); drawPhoto(); });
    $('#delRound').addEventListener('click', function () {
      if (!delArmed) { delArmed = true; drawDelete(); setTimeout(function () { delArmed = false; drawDelete(); }, 4000); return; }
      delArmed = false;
      rounds.splice(cur, 1);
      if (!rounds.length) rounds = sampleRounds();
      cur = Math.max(0, Math.min(cur, rounds.length - 1));
      save(); drawAll(); toast('已刪除這一回合。');
    });
    $('#copyTpl').addEventListener('click', function () {
      var txt = $('#tpl').textContent, b = this;
      var done = function () { b.textContent = '已複製'; setTimeout(function () { b.textContent = '複製範本'; }, 1800); };
      try { navigator.clipboard.writeText(txt).then(done, function () { $('#pasteArea').value = txt; done(); }); } catch (e) { $('#pasteArea').value = txt; done(); }
    });
    bindCard();
    drawAll();
  });
})();
