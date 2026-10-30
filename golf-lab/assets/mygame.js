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
        score: [6, 7, 5, 4, 7, 4, 6, 6, 6, 5, 6, 5, 8, 6, 7, 4, 6, 6],
        putts: [2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2],
        fir: [N, Y, Y, _, N, _, Y, Y, N, Y, N, _, Y, N, N, _, Y, N],
        drive: [205, 228, 214, _, 198, _, 220, 236, 202, 218, 196, _, 231, 210, 224, _, 215, 207],
        pen: [_, 1, _, _, 2, _, _, _, _, _, _, _, 1, _, _, _, _, _],
        sand: [_, _, _, Y, Y, _, _, _, _, _, _, _, _, Y, _, _, _, _] },
      { id: 's2', sample: true, course: '範例球場 Example Golf Club', date: '2026-10-18', par: DEFAULT_PAR.slice(),
        score: [6, 6, 5, 4, 6, 4, 6, 6, 5, 6, 6, 4, 7, 6, 6, 4, 6, 6],
        putts: [2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 2],
        fir: [N, Y, Y, _, Y, _, Y, N, Y, N, Y, _, Y, Y, N, _, Y, Y],
        drive: [212, 240, 219, _, 225, _, 221, 233, 216, 209, 222, _, 244, 218, 229, _, 220, 214],
        pen: [_, _, _, _, _, _, _, 1, _, _, _, _, 1, _, _, _, _, _],
        sand: [_, _, _, _, _, Y, _, _, Y, _, _, Y, _, _, _, _, _, _] }
    ];
  }

  var rounds = store.get('rounds', null);
  if (!rounds || !rounds.length || rounds.every(function (r) { return r.sample; })) rounds = sampleRounds();
  rounds.forEach(function (r) { r.drive = r.drive || blank(); r.sand = r.sand || blank(); r.pen = r.pen || blank(); });
  var mode = store.get('mgmode', 'beginner');
  var FIELDS = {
    amateur: { name: '業餘 · 約 18 差點', cat: [0, .02, .28, .42, .28], gir: .22, fir: .45, sand: .10, putts: 34, drive: 215, longest: 240 },
    single: { name: '單差點 · 約 5 差點', cat: [.002, .08, .50, .32, .098], gir: .45, fir: .55, sand: .25, putts: 31, drive: 245, longest: 270 },
    tour: { name: '職業巡迴賽', cat: [.01, .20, .60, .16, .03], gir: .66, fir: .60, sand: .50, putts: 29, drive: 300, longest: 330 }
  };
  var fieldKey = store.get('field', 'amateur');
  if (!FIELDS[fieldKey]) fieldKey = 'amateur';
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
      par: last ? last.par.slice() : DEFAULT_PAR.slice(), score: blank(), putts: blank(), fir: blank(), drive: blank(), sand: blank(), pen: blank(), photo: null };
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
      fir: [0, 0], gir: [0, 0], scr: [0, 0], hole: [], drv: [0, 0], longest: 0, sand: [0, 0] };
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
        if (p > 3 && r.drive[i] != null) { s.drv[0] += r.drive[i]; s.drv[1]++; s.longest = Math.max(s.longest, r.drive[i]); }
        // sand save: up and down from a greenside bunker = at most one putt after the bunker shot
        if (r.sand[i]) { s.sand[1]++; if (r.putts[i] != null ? r.putts[i] <= 1 : d <= 0) s.sand[0]++; }
      });
    });
    s.rounds = list.filter(function (r) { return played(r).length; }).length || 1;
    return s;
  }
  var pct = function (a) { return a[1] ? a[0] / a[1] : 0; };

  /* ---------- svg ---------- */
  /* Masters ring: grey disc, thick green band for you, thin grey arc for the field, white centre. */
  function mRing(p, f) {
    var rb = 73, rf = 45, cb = 2 * Math.PI * rb, cf = 2 * Math.PI * rf;
    return '<svg class="mring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="98" fill="#f1f0ec"/>' +
      '<circle class="arc" cx="100" cy="100" r="' + rb + '" fill="none" stroke="#3b7a59" stroke-width="46" stroke-dasharray="' + (cb * Math.min(1, p)) + ' ' + cb + '" transform="rotate(-90 100 100)"/>' +
      (f == null ? '' : '<circle class="arc" cx="100" cy="100" r="' + rf + '" fill="none" stroke="#86898a" stroke-width="6" stroke-dasharray="' + (cf * Math.min(1, f)) + ' ' + cf + '" transform="rotate(-90 100 100)"/>') +
      '<circle cx="100" cy="100" r="37" fill="#fff"/></svg>';
  }
  function ringBlock(p, f, big) {
    return '<div class="mr' + (big ? ' big' : '') + '">' + mRing(p, f) + '<div class="mr-v"><strong>' + Math.round(p * 100) + '<sup>%</sup></strong>' + (f == null ? '' : '<small>' + Math.round(f * 100) + '%</small>') + '</div></div>';
  }
  var CAT = [['Eagles', '老鷹以上', '#b9dc8f'], ['Birdies', '博蒂', '#127a56'], ['Par', '標準桿', '#d9d9d6'], ['Bogey', '柏忌', '#a9abaa'], ['Double Bogeys', '雙柏忌以上', '#17251e']];
  function donut(cat) {
    var total = sum(cat) || 1, r = 80, c = 2 * Math.PI * r, off = 0, out = '';
    cat.forEach(function (n, k) {
      if (!n) return;
      var len = n / total * c;
      out += '<circle class="arc" cx="110" cy="110" r="' + r + '" fill="none" stroke="' + CAT[k][2] + '" stroke-width="42" stroke-dasharray="' + len + ' ' + c + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 110 110)"/>';
      off += len;
    });
    return '<svg class="donut" viewBox="0 0 220 220" role="img" aria-label="Scoring breakdown"><circle cx="110" cy="110" r="' + r + '" fill="none" stroke="#f1f0ec" stroke-width="42"/>' + out + '</svg>';
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
      row('Penalty <small>罰桿（已含在桿數裡）</small>', 'pen-row', function (i) {
        return '<input class="in-pen" data-h="' + i + '" inputmode="numeric" maxlength="1" aria-label="第 ' + (i + 1) + ' 洞罰桿數" value="' + (r.pen[i] ? r.pen[i] : '') + '">';
      }, function (a, b) { var n = 0; for (var k = a; k < b; k++) n += r.pen[k] || 0; return n || '–'; }) +
      row('Fairway <small>上球道</small>', 'fir-row', function (i) {
        if (r.par[i] === 3) return '<span class="na">·</span>';
        var f = r.fir[i];
        return '<button type="button" class="fir-btn ' + (f === true ? 'yes' : f === false ? 'no' : '') + '" data-fir="' + i + '" aria-label="第 ' + (i + 1) + ' 洞是否上球道">' + (f === true ? '✓' : f === false ? '✕' : '–') + '</button>';
      }, function (a, b) { return tot(a, b, firArr); }) +
      row('Drive <small>開球距離（碼）</small>', 'drive-row', function (i) {
        if (r.par[i] === 3) return '<span class="na">·</span>';
        return '<input class="in-drive" data-h="' + i + '" inputmode="numeric" maxlength="3" aria-label="第 ' + (i + 1) + ' 洞開球距離（碼）" value="' + (r.drive[i] == null ? '' : r.drive[i]) + '">';
      }, function (a, b) { var n = 0, t = 0; for (var k = a; k < b; k++) if (r.drive[k] != null && r.par[k] > 3) { n++; t += r.drive[k]; } return n ? Math.round(t / n) : '–'; }) +
      row('Bunker <small>果嶺邊沙坑</small>', 'sand-row', function (i) {
        return '<button type="button" class="sand-btn' + (r.sand[i] ? ' on' : '') + '" data-sand="' + i + '" aria-pressed="' + !!r.sand[i] + '" aria-label="第 ' + (i + 1) + ' 洞是否從果嶺邊沙坑擊球"></button>';
      }, function (a, b) { var n = 0; for (var k = a; k < b; k++) if (r.sand[k]) n++; return n || '–'; }) +
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
      var p = e.target.closest('[data-par]'), f = e.target.closest('[data-fir]'), sd = e.target.closest('[data-sand]');
      if (sd) { var q = +sd.getAttribute('data-sand'); R().sand[q] = R().sand[q] ? null : true; changed(); }
      if (p) { var i = +p.getAttribute('data-par'); R().par[i] = R().par[i] === 5 ? 3 : R().par[i] + 1; if (R().par[i] === 3) { R().fir[i] = null; R().drive[i] = null; } changed(); }
      if (f) { var j = +f.getAttribute('data-fir'), v = R().fir[j]; R().fir[j] = v == null ? true : v === true ? false : null; changed(); }
    });
    wrap.addEventListener('input', function (e) {
      var t = e.target;
      if (!t.matches('input')) return;
      var h = +t.getAttribute('data-h'), raw = t.value.replace(/\D/g, ''), isScore = t.classList.contains('in-score'), isDrive = t.classList.contains('in-drive'), isPen = t.classList.contains('in-pen');
      t.value = raw;
      var v = raw === '' ? null : +raw;
      if (isDrive) {
        R().drive[h] = v || null;
        if (R().sample) R().sample = false;
        save(); refreshSoft();
        var nd = null;
        if (raw.length === 3) for (var k = h + 1; k < H && !nd; k++) nd = $('.in-drive[data-h="' + k + '"]', wrap);
        var tgt = nd || $('.in-drive[data-h="' + h + '"]', wrap);
        if (tgt) { tgt.focus(); if (nd) tgt.select(); else tgt.setSelectionRange(tgt.value.length, tgt.value.length); }
        return;
      }
      if (isPen) {
        R().pen[h] = v || null;
        if (R().sample) R().sample = false;
        save(); refreshSoft();
        var np = raw !== '' && h < H - 1 ? $('.in-pen[data-h="' + (h + 1) + '"]', wrap) : null;
        var tp = np || $('.in-pen[data-h="' + h + '"]', wrap);
        if (tp) { tp.focus(); tp.select(); }
        return;
      }
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

  var TABS = [['summary', 'Scoring Summary'], ['greens', 'Greens Hit'], ['fairways', 'Fairways Hit'], ['driving', 'Driving Distance'], ['sand', 'Sand Saves'], ['putting', 'Putting'], ['longest', 'Longest Drive']];
  var CAPS = {
    summary: 'Cumulative breakdown of scores per hole · 所有回合每洞成績分布',
    greens: 'The percentage of times you reached the green in two or more strokes less than par · 標準桿上果嶺（桿數 − 推桿 ≤ 標準桿 − 2）',
    fairways: 'Fairways hit are calculated for par 4s and par 5s · 只計算 Par 4 與 Par 5 的開球',
    driving: 'Average of the drives you entered on par 4s and par 5s · 在計分卡 Drive 列輸入開球距離（碼）',
    sand: 'The percentage of times you got up and down from a greenside bunker · 在 Bunker 列標記沙坑；出沙後一推內進洞算成功',
    putting: 'Total putts in each round · 每回合推桿總數（越少越好）',
    longest: 'Your longest drive in each round · 每回合最遠的一次開球'
  };
  /* Beginner mode: the few numbers that matter on the way to breaking 100. */
  function drawBeginner(replay) {
    var el = $('#statBody'), r = R(), p = played(r);
    if (!p.length) { el.innerHTML = '<p class="empty-stats">在上面的計分卡輸入這一回合的桿數，這裡就會告訴你桿數掉在哪裡。</p>'; return; }
    var tot = sum(p.map(function (i) { return r.score[i]; })), par = sum(p.map(function (i) { return r.par[i]; })), full = p.length === H;
    var putts = sum(p.map(function (i) { return r.putts[i] || 0; })), hasPutts = p.some(function (i) { return r.putts[i] != null; });
    var three = p.filter(function (i) { return r.putts[i] >= 3; }).length, pens = sum(p.map(function (i) { return r.pen[i] || 0; }));
    var big = p.filter(function (i) { return diff(r, i) >= 2; }), good = p.filter(function (i) { return diff(r, i) <= 0; }).length;
    var capped = sum(p.map(function (i) { return Math.min(r.score[i], r.par[i] * 2); }));
    // where the strokes over par went
    // each stroke over par is counted once: penalties first, then putts beyond two, then beyond a double bogey
    var acc = [0, 0, 0, 0];
    p.forEach(function (i) {
      var rem = Math.max(0, diff(r, i)), a = Math.min(r.pen[i] || 0, rem); rem -= a;
      var b = Math.min(Math.max(0, (r.putts[i] || 0) - 2), rem); rem -= b;
      var c = Math.max(0, rem - 2);
      acc[0] += b; acc[1] += a; acc[2] += c; acc[3] += rem - c;
    });
    var over = sum(acc);
    var parts = [['多出來的推桿', acc[0], '#c8102e', '每洞超過 2 推的部分'], ['罰桿', acc[1], '#b88a2a', '出界、進水、遺失球'], ['大數字', acc[2], '#17251e', '超過雙柏忌的部分'], ['其他', acc[3], '#a9abaa', '開球、攻果嶺、切球']];
    // previous played round
    var prev = null;
    for (var k = cur - 1; k >= 0; k--) if (played(rounds[k]).length === H) { prev = rounds[k]; break; }
    var prevTot = prev ? sum(prev.score) : null;
    var goal = !full ? null : tot >= 100 ? { t: '破百', n: tot - 99, s: '還差 ' + (tot - 99) + ' 桿就能破百' } : tot >= 95 ? { t: '打進 95', n: tot - 94, s: '已經破百！下一個目標：94 桿以內' } : { t: '打進 90', n: tot - 89, s: '進步很多！下一個目標：90 桿以內' };
    var worst = p.slice().sort(function (a, b) { return diff(r, b) - diff(r, a); }).slice(0, 3);
    var trend = rounds.filter(function (x) { return played(x).length === H; });
    var tmax = Math.max.apply(null, trend.map(function (x) { return sum(x.score); }).concat([110])), tmin = Math.min.apply(null, trend.map(function (x) { return sum(x.score); }).concat([85])) - 5;
    var ty = function (v) { return (v - tmin) / (tmax - tmin) * 100; };

    el.innerHTML = '<p class="stat-cap">新手模式：只看最重要的幾個數字 · R' + (cur + 1) + (full ? '' : '（已輸入 ' + p.length + ' 洞）') + '</p>' +
      '<div class="bg-top"><div class="bg-score"><span class="eyebrow">總桿數</span><strong>' + tot + '</strong><small class="' + (tot - par < 0 ? 'under' : '') + '">' + toParStr(tot - par) + '</small>' +
        (prevTot != null && full ? '<p class="bg-delta ' + (tot < prevTot ? 'up' : tot > prevTot ? 'down' : '') + '">' + (tot < prevTot ? '比上一場少 ' + (prevTot - tot) + ' 桿' : tot > prevTot ? '比上一場多 ' + (tot - prevTot) + ' 桿' : '和上一場一樣') + '</p>' : '') + '</div>' +
        (goal ? '<div class="bg-goal"><span class="eyebrow">下一個目標 · ' + goal.t + '</span><p>' + goal.s + '</p><div class="goal-bar"><i style="width:' + Math.max(6, 100 - goal.n / 20 * 100) + '%"></i></div>' +
          (capped < tot ? '<p class="bg-cap">如果每洞最多記雙倍標準桿，這一場是 <b>' + capped + '</b> 桿。</p>' : '') + '</div>' : '') + '</div>' +
      '<div class="tiles bg-tiles">' + tile('推桿', hasPutts ? putts : '–', hasPutts ? '三推 ' + three + ' 次' : '在計分卡輸入推桿數', three >= 3) + tile('罰桿', pens, '出界、進水等', pens >= 4) +
        tile('雙柏忌以上', big.length + ' 洞', '每洞多 2 桿以上', big.length >= 8) + tile('標準桿或更好', good + ' 洞', good ? '保持下去' : '目標：每場至少 1 洞') + '</div>' +
      '<h3 class="bg-h">比標準桿多的 ' + over + ' 桿，掉在哪裡？</h3>' +
      '<div class="lost-bar">' + parts.map(function (x) { return x[1] ? '<i style="flex:' + x[1] + ';background:' + x[2] + '" title="' + x[0] + ' ' + x[1] + '"></i>' : ''; }).join('') + '</div>' +
      '<ul class="lost-key">' + parts.map(function (x) { return '<li><i style="background:' + x[2] + '"></i><strong>' + x[0] + ' <b>' + x[1] + '</b></strong><small>' + x[3] + '</small></li>'; }).join('') + '</ul>' +
      '<div class="bg-split"><div><h3 class="bg-h">這一場最貴的 3 個洞</h3><ol class="worst">' + worst.map(function (i) {
        return '<li><span class="sym ' + symClass(diff(r, i)) + '">' + r.score[i] + '</span><strong>第 ' + (i + 1) + ' 洞 · Par ' + r.par[i] + '</strong><small>' + toParStr(diff(r, i)) + (r.putts[i] >= 3 ? ' · ' + r.putts[i] + ' 推' : '') + (r.pen[i] ? ' · 罰 ' + r.pen[i] + ' 桿' : '') + '</small></li>';
      }).join('') + '</ol></div>' +
      '<div><h3 class="bg-h">每一場的總桿數</h3>' + (trend.length ? '<div class="trend"><span class="tl" style="bottom:' + ty(100) + '%"><em>100</em></span><span class="tl t95" style="bottom:' + ty(95) + '%"><em>95</em></span>' + trend.map(function (x) {
        var v = sum(x.score); return '<div class="tb' + (x === r ? ' cur' : '') + '"><i style="height:' + ty(v) + '%"></i><b>' + v + '</b><small>R' + (rounds.indexOf(x) + 1) + '</small></div>';
      }).join('') + '</div>' : '<p class="empty-stats">輸入完整 18 洞後就會出現。</p>') + '</div></div>';
    if (replay) { el.classList.remove('replay'); void el.offsetWidth; el.classList.add('replay'); }
  }

  function drawMode() {
    var t = $('#modeToggle');
    if (!t) return;
    t.innerHTML = '<button type="button" data-mode="beginner" aria-pressed="' + (mode === 'beginner') + '">新手模式</button><button type="button" data-mode="masters" aria-pressed="' + (mode === 'masters') + '">進階 · Masters 統計</button>';
    $$('[data-mode]', t).forEach(function (b) { b.addEventListener('click', function () { mode = b.getAttribute('data-mode'); store.set('mgmode', mode); drawMode(); drawStats(true); }); });
  }

  function drawStats(replay) {
    $('#statTabs').hidden = mode === 'beginner';
    $('#statTabs').classList.add('in'); // hidden tabs never scroll into view, so reveal them directly
    if (mode === 'beginner') return drawBeginner(replay);
    var F = FIELDS[fieldKey];
    var list = rounds.filter(function (r) { return played(r).length; });
    var all = stats(list), per = list.map(function (r) { return { r: r, n: rounds.indexOf(r) + 1, s: stats([r]) }; });
    $('#statTabs').innerHTML = TABS.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('');
    $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); store.set('mgtab', tab); drawStats(true); }); });
    var el = $('#statBody');
    var foot = '<div class="m-foot"><div class="m-legend"><span><i class="me"></i>你 You</span><span><i class="fd"></i>Field</span></div>' +
      '<label class="field-pick">FIELD<select id="fieldSel" aria-label="比較對象">' + Object.keys(FIELDS).map(function (k) { return '<option value="' + k + '"' + (k === fieldKey ? ' selected' : '') + '>' + FIELDS[k].name + '</option>'; }).join('') + '</select></label></div>';
    var cap = '<p class="stat-cap">' + CAPS[tab] + '</p>';
    if (!all.holes) { el.innerHTML = cap + '<p class="empty-stats">輸入至少一洞的桿數，統計就會出現在這裡。</p>'; return; }

    var ringTab = function (key, field) {
      var tot = all[key];
      return '<div class="m-split"><div class="m-total"><h4>TOTAL · 所有回合 <span>' + tot[0] + '/' + tot[1] + '</span></h4>' + ringBlock(pct(tot), field, true) + '</div>' +
        '<div class="m-rounds">' + per.map(function (x) {
          var v = x.s[key];
          return '<div class="m-round"><h4>ROUND ' + x.n + ' <span>' + v[0] + '/' + v[1] + '</span></h4>' + ringBlock(pct(v), field) + '</div>';
        }).join('') + '</div></div>';
    };
    var barTab = function (unit, value, field, empty) {
      var vals = per.map(function (x) { return value(x); });
      var max = Math.max.apply(null, vals.concat([field(per[0])]).filter(function (v) { return v != null; })) * 1.45 || 1;
      return '<div class="dist-grid">' + per.map(function (x, k) {
        var v = vals[k], f = field(x);
        return '<div class="dcard"><div class="dc-h"><span>ROUND ' + x.n + '</span><span>' + unit + '</span></div>' +
          '<div class="dc-box"><i class="dc-me" style="width:' + (v == null ? 0 : v / max * 100) + '%"></i><i class="dc-fd" style="width:' + (f / max * 100) + '%"></i>' +
          '<strong>' + (v == null ? '–' : v) + '</strong><small>' + f + '</small></div>' + (v == null ? '<p class="dc-empty">' + empty + '</p>' : '') + '</div>';
      }).join('') + '</div>';
    };

    var html;
    if (tab === 'summary') {
      html = '<div class="summary-grid"><div class="overall"><h3>My Game Overall</h3>' + donut(all.cat) +
        '<ul class="donut-key">' + CAT.map(function (c, k) { return '<li><i style="background:' + c[2] + '"></i>' + c[0] + ' <em>(' + all.cat[k] + ')</em></li>'; }).join('') + '</ul></div>' +
        '<div class="sum-rings">' + CAT.map(function (c, k) { return '<div class="sum-ring"><h4>' + c[0].toUpperCase() + '</h4>' + ringBlock(all.cat[k] / all.holes, F.cat[k]) + '<p>' + c[1] + '</p></div>'; }).join('') + '</div></div>';
    } else if (tab === 'greens') html = ringTab('gir', F.gir) + (all.gir[1] ? '' : '<p class="empty-stats">輸入推桿數後才能計算上果嶺率。</p>');
    else if (tab === 'fairways') html = ringTab('fir', F.fir) + (all.fir[1] ? '' : '<p class="empty-stats">在計分卡的 Fairway 列點擊 ✓ 或 ✕ 紀錄開球。</p>');
    else if (tab === 'sand') html = ringTab('sand', F.sand) + (all.sand[1] ? '' : '<p class="empty-stats">在計分卡的 Bunker 列點擊有進果嶺邊沙坑的洞。</p>');
    else if (tab === 'driving') html = barTab('YARDS', function (x) { return x.s.drv[1] ? Math.round(x.s.drv[0] / x.s.drv[1]) : null; }, function () { return F.drive; }, '這一回合沒有輸入開球距離。');
    else if (tab === 'longest') html = barTab('YARDS', function (x) { return x.s.longest || null; }, function () { return F.longest; }, '這一回合沒有輸入開球距離。');
    else html = barTab('PUTTS', function (x) { return x.s.puttHoles ? x.s.putts : null; }, function (x) { return Math.round(F.putts * (x.s.holes || 18) / 18); }, '這一回合沒有輸入推桿數。') +
      '<div class="tiles putt-tiles">' + tile('Per Round', all.puttHoles ? (all.putts / all.puttHoles * 18).toFixed(1) : '–', '每 18 洞') + tile('Per Hole', all.puttHoles ? (all.putts / all.puttHoles).toFixed(2) : '–', '每洞推桿') +
      tile('1-Putts', all.one, '一推進洞') + tile('3-Putts', all.three, '三推以上', all.three >= 2 * all.rounds) + '</div>';
    el.innerHTML = cap + html + foot;
    $('#fieldSel').addEventListener('change', function () { fieldKey = this.value; store.set('field', fieldKey); drawStats(true); });
    if (replay) { el.classList.remove('replay'); void el.offsetWidth; el.classList.add('replay'); }
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
    var pn = sum(R().pen.map(function (v) { return v || 0; }));
    if (pn >= 3) tips.push({ t: '少一點罰桿', d: '這一場有 ' + pn + ' 桿罰桿。開球不確定時，用 Hybrid 或 5 號木開球，寧可短一點也要留在場內。', l: { href: 'rules.html#lost', label: '遺失球與界外的規則' } });
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

  function drawAll() { drawMode(); drawRounds(); drawHeader(); drawCard(); drawOfficial(); drawStats(); drawInsights(); drawPhoto(); drawDelete(); GL.reveal($('main')); }

  var delArmed = false;
  function drawDelete() {
    var b = $('#delRound');
    b.textContent = delArmed ? '確定刪除 R' + (cur + 1) + '？' : '刪除這一回合';
    b.classList.toggle('armed', delArmed);
  }

  /* ---------- import ---------- */
  function parseText(text) {
    var lines = text.split(/\r?\n/).map(function (l) { return l.split(/[,\t;]/).map(function (c) { return c.trim(); }); }).filter(function (l) { return l.join('') !== ''; });
    var out = {}, keys = { par: /^(par|標準桿)$/i, score: /^(score|strokes|桿數|成績|scores)$/i, putts: /^(putts?|推桿|推桿數)$/i, fir: /^(fir|fairways?|球道|上球道)$/i, drive: /^(drive|drives|driving|開球|開球距離)$/i, sand: /^(sand|bunker|沙坑)$/i, pen: /^(penalty|penalties|pen|罰桿)$/i };
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
        var arr = vals.map(k === 'fir' || k === 'sand' ? bool : num);
        // drop subtotal columns if a 21-column (with Out/In/Total) row was given
        if (arr.length >= 21 && k !== 'fir' && k !== 'sand') arr = arr.slice(0, 9).concat(arr.slice(10, 19));
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
            (out[k] = out[k] || []).push(k === 'fir' || k === 'sand' ? bool(l[ci]) : num(l[ci]));
          });
        });
      }
    }
    if (!out.score || !out.score.some(function (v) { return v != null; })) return null;
    var fill = function (a, d) { a = (a || []).slice(0, H); while (a.length < H) a.push(d === undefined ? null : d); return a; };
    var par = out.par && out.par.filter(Boolean).length >= 9 ? fill(out.par).map(function (p, i) { return p || DEFAULT_PAR[i]; }) : null;
    return { score: fill(out.score), putts: fill(out.putts), fir: fill(out.fir), drive: fill(out.drive), pen: fill(out.pen), sand: fill(out.sand).map(function (v) { return v ? true : null; }), par: par, course: out.course || null, date: /^\d{4}-\d{2}-\d{2}$/.test(out.date || '') ? out.date : null };
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
