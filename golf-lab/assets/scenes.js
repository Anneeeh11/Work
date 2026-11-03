/* PAR/A — drawn scenes (golf course, range, cart) and thin-line icons for editorial pages.
   Place with <div data-scene="course|range|cart"></div> and <i data-icon="clubs"></i>. */
(function () {
  'use strict';
  var n = 0;
  var trees = function (pts, col, hi) {
    return pts.map(function (p) {
      var x = p[0], y = p[1], r = p[2];
      return '<ellipse cx="' + x + '" cy="' + (y + r * .9) + '" rx="' + r * 1.1 + '" ry="' + r * .22 + '" fill="#000" opacity=".12"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/><circle cx="' + (x - r * .45) + '" cy="' + (y + r * .2) + '" r="' + r * .72 + '" fill="' + col + '"/><circle cx="' + (x + r * .5) + '" cy="' + (y + r * .25) + '" r="' + r * .68 + '" fill="' + col + '"/>' +
        '<path d="M' + (x - r * .9) + ' ' + (y - r * .05) + ' Q ' + (x - r * .5) + ' ' + (y - r * .95) + ' ' + (x + r * .25) + ' ' + (y - r * .8) + '" fill="none" stroke="' + hi + '" stroke-width="' + r * .18 + '" stroke-linecap="round" opacity=".35"/>';
    }).join('');
  };
  var row = function (x0, x1, y, r, seed) { var a = [], x = x0, k = seed || 1; while (x < x1) { k = (k * 9301 + 49297) % 233280; var j = k / 233280; a.push([x, y + j * r * .5, r * (.75 + j * .5)]); x += r * (1.1 + j * .6); } return a; };

  var SCENES = {
    // golden-hour course: sweeping fairway, bunkers, the green and flag
    course: function (P) {
      return '<svg viewBox="0 0 1600 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
        '<linearGradient id="' + P + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8d3a6"/><stop offset=".55" stop-color="#f4e2b8"/><stop offset="1" stop-color="#f7ecd0"/></linearGradient>' +
        '<radialGradient id="' + P + 'sun" cx=".72" cy=".2" r=".45"><stop offset="0" stop-color="#fff6dc" stop-opacity=".95"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + P + 'fw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc66a"/><stop offset="1" stop-color="#6aa34a"/></linearGradient>' +
        '<linearGradient id="' + P + 'ro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f8f45"/><stop offset="1" stop-color="#2f5f33"/></linearGradient>' +
        '<linearGradient id="' + P + 'shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04261a" stop-opacity="0"/><stop offset=".55" stop-color="#04261a" stop-opacity=".15"/><stop offset="1" stop-color="#04261a" stop-opacity=".78"/></linearGradient>' +
        '<radialGradient id="' + P + 'pool" cx=".5" cy=".62" r=".42"><stop offset="0" stop-color="#04261a" stop-opacity=".42"/><stop offset="1" stop-color="#04261a" stop-opacity="0"/></radialGradient>' +
        '<pattern id="' + P + 'mow" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><rect width="35" height="70" fill="#fff" opacity=".07"/></pattern>' +
        '</defs>' +
        '<rect width="1600" height="760" fill="url(#' + P + 'sky)"/><rect width="1600" height="760" fill="url(#' + P + 'sun)"/>' +
        '<path d="M0 250 Q 220 200 420 232 T 820 214 T 1240 226 T 1600 206 V 360 H0 Z" fill="#a9b98a" opacity=".7"/>' +
        trees(row(-20, 1640, 236, 26, 3), '#7d9767', '#a7bb8c') +
        '<path d="M0 300 Q 300 262 640 290 T 1240 278 T 1600 286 V 420 H0 Z" fill="#7fa260"/>' +
        trees(row(-30, 1650, 286, 34, 7), '#4f7a45', '#79a062') +
        '<path d="M0 360 Q 400 318 800 344 T 1600 330 V 760 H0 Z" fill="url(#' + P + 'ro)"/>' +
        // fairway sweeping from the front left up to the green
        '<path d="M-40 760 C 180 640 320 560 560 520 C 820 476 980 470 1080 420 C 1150 386 1200 366 1250 360 L 1320 368 C 1270 392 1210 420 1150 458 C 1030 530 860 560 700 610 C 520 664 400 720 360 760 Z" fill="url(#' + P + 'fw)"/>' +
        '<path d="M-40 760 C 180 640 320 560 560 520 C 820 476 980 470 1080 420 C 1150 386 1200 366 1250 360 L 1320 368 C 1270 392 1210 420 1150 458 C 1030 530 860 560 700 610 C 520 664 400 720 360 760 Z" fill="url(#' + P + 'mow)"/>' +
        // green, flag and bunkers
        '<ellipse cx="1262" cy="360" rx="96" ry="20" fill="#b3d77a"/><ellipse cx="1262" cy="358" rx="80" ry="14" fill="#c1df8c" opacity=".7"/>' +
        '<line x1="1280" y1="360" x2="1280" y2="292" stroke="#fbf8ef" stroke-width="3"/><path d="M1280 292 l30 10 l-30 10z" fill="#f2c75c"/><ellipse cx="1280" cy="361" rx="6" ry="2" fill="#0b2a18"/>' +
        '<path d="M1110 392 q 40 -22 92 -6 q 18 10 -6 18 q -50 12 -86 -12z" fill="#efe3c4"/><path d="M1340 388 q 46 -14 82 4 q 8 10 -14 14 q -44 4 -68 -18z" fill="#efe3c4"/>' +
        '<path d="M760 560 q 70 -40 170 -22 q 34 12 -8 30 q -96 28 -162 -8z" fill="#efe3c4"/><path d="M780 556 q 60 -30 140 -18" fill="none" stroke="#d7c79f" stroke-width="3"/>' +
        '<path d="M300 690 q 90 -46 200 -30 q 40 14 -10 34 q -120 30 -190 -4z" fill="#efe3c4"/>' +
        // foreground trees framing the view
        trees([[60, 470, 86], [150, 520, 70], [-10, 580, 110], [1540, 470, 92], [1460, 540, 74], [1620, 600, 120]], '#244a2c', '#3f6b40') +
        '<rect width="1600" height="760" fill="url(#' + P + 'shade)"/><rect width="1600" height="760" fill="url(#' + P + 'pool)"/></svg>';
    },
    // a driving range: mats, distance flags and a scatter of balls
    range: function (P) {
      var flags = [[300, 238, '50'], [470, 196, '100'], [620, 168, '150']].map(function (f) {
        return '<ellipse cx="' + f[0] + '" cy="' + (f[1] + 8) + '" rx="46" ry="9" fill="#a8d06f"/><line x1="' + f[0] + '" y1="' + (f[1] + 8) + '" x2="' + f[0] + '" y2="' + (f[1] - 34) + '" stroke="#fbf8ef" stroke-width="2.2"/><path d="M' + f[0] + ' ' + (f[1] - 34) + ' l18 6 l-18 6z" fill="#f2c75c"/>';
      }).join('');
      var balls = '';
      for (var k = 0; k < 46; k++) { var x = 60 + (k * 137) % 700, y = 220 + (k * 53) % 200; balls += '<circle cx="' + x + '" cy="' + y + '" r="' + (1.6 + (y - 200) / 120) + '" fill="#fff" opacity=".85"/>'; }
      var mats = '';
      for (var m = 0; m < 4; m++) mats += '<path d="M' + (40 + m * 200) + ' 470 L' + (90 + m * 196) + ' 430 L' + (250 + m * 196) + ' 430 L' + (220 + m * 200) + ' 470 Z" fill="#2f6b34"/><path d="M' + (60 + m * 200) + ' 466 L' + (100 + m * 196) + ' 436 L' + (180 + m * 196) + ' 436 L' + (150 + m * 200) + ' 466 Z" fill="#5fa64a"/><circle cx="' + (130 + m * 198) + '" cy="450" r="4" fill="#fff"/>';
      return '<svg viewBox="0 0 800 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
        '<linearGradient id="' + P + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe9dc"/><stop offset="1" stop-color="#f4f0e1"/></linearGradient>' +
        '<linearGradient id="' + P + 'gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86b75c"/><stop offset="1" stop-color="#4f8a3c"/></linearGradient>' +
        '<pattern id="' + P + 'mow" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><rect width="30" height="60" fill="#fff" opacity=".06"/></pattern></defs>' +
        '<rect width="800" height="560" fill="url(#' + P + 'sky)"/>' + trees(row(-20, 820, 120, 22, 5), '#6f8f5a', '#97b27d') +
        '<path d="M0 140 Q 400 120 800 140 V 560 H0 Z" fill="url(#' + P + 'gr)"/><path d="M0 140 Q 400 120 800 140 V 560 H0 Z" fill="url(#' + P + 'mow)"/>' +
        flags + balls +
        '<line x1="20" y1="40" x2="20" y2="480" stroke="#3b4a40" stroke-width="5"/><line x1="780" y1="40" x2="780" y2="480" stroke="#3b4a40" stroke-width="5"/><path d="M20 44 Q 400 70 780 44" fill="none" stroke="#3b4a40" stroke-opacity=".4" stroke-width="1.5" stroke-dasharray="3 5"/>' +
        '<rect x="0" y="470" width="800" height="90" fill="#e9e2cf"/><rect x="0" y="470" width="800" height="6" fill="#d6ccb2"/>' + mats +
        '<path d="M260 440 q 30 -6 60 0" fill="none" stroke="#f2c75c" stroke-width="2" stroke-dasharray="2 5"/></svg>';
    },
    // golf cart on the path, bag on the back
    cart: function (P) {
      return '<svg viewBox="0 0 800 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
        '<linearGradient id="' + P + 'sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6dcc0"/><stop offset="1" stop-color="#f6efdc"/></linearGradient>' +
        '<linearGradient id="' + P + 'gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fae55"/><stop offset="1" stop-color="#3f7a35"/></linearGradient>' +
        '<linearGradient id="' + P + 'body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8ef"/><stop offset="1" stop-color="#ddd5c0"/></linearGradient></defs>' +
        '<rect width="800" height="640" fill="url(#' + P + 'sky)"/>' + trees(row(-30, 830, 210, 40, 11), '#56794a', '#7f9d6c') +
        '<path d="M0 260 Q 400 230 800 262 V 640 H0 Z" fill="url(#' + P + 'gr)"/>' +
        '<path d="M-20 560 C 200 500 420 470 820 450 L 820 520 C 460 530 260 560 -20 640 Z" fill="#d9cfb6"/>' +
        trees([[690, 300, 60], [760, 340, 48], [90, 320, 52]], '#2f5a37', '#4c7a4c') +
        // cart
        '<g transform="translate(210 300)">' +
        '<ellipse cx="190" cy="226" rx="200" ry="14" fill="#000" opacity=".15"/>' +
        '<rect x="40" y="0" width="300" height="16" rx="8" fill="#0b4a32"/><line x1="70" y1="16" x2="64" y2="120" stroke="#3b4a40" stroke-width="7"/><line x1="300" y1="16" x2="306" y2="120" stroke="#3b4a40" stroke-width="7"/>' +
        '<path d="M60 124 L320 124 L350 160 L350 196 L30 196 L22 160 Z" fill="url(#' + P + 'body)" stroke="#c9c0a8" stroke-width="2"/>' +
        '<path d="M86 124 L86 92 Q 86 82 98 82 L180 82 Q 192 82 192 94 L192 124" fill="#0b4a32"/><rect x="60" y="120" width="140" height="14" rx="6" fill="#0d5a3c"/>' +
        '<path d="M300 40 L300 128" stroke="#2a2f2c" stroke-width="5"/><rect x="250" y="56" width="44" height="74" rx="14" fill="#8a3c2e"/><rect x="250" y="66" width="44" height="8" fill="#f2c75c"/>' +
        '<line x1="262" y1="56" x2="256" y2="20" stroke="#9aa59f" stroke-width="3"/><line x1="274" y1="56" x2="274" y2="14" stroke="#9aa59f" stroke-width="3"/><line x1="286" y1="56" x2="292" y2="22" stroke="#9aa59f" stroke-width="3"/>' +
        '<rect x="252" y="10" width="12" height="10" rx="3" fill="#2a2f2c"/><rect x="268" y="4" width="12" height="10" rx="3" fill="#0b4a32"/><rect x="286" y="12" width="12" height="10" rx="3" fill="#2a2f2c"/>' +
        [[90, 200], [300, 200]].map(function (w) { return '<circle cx="' + w[0] + '" cy="' + w[1] + '" r="28" fill="#1f2420"/><circle cx="' + w[0] + '" cy="' + w[1] + '" r="12" fill="#bdb6a8"/>'; }).join('') +
        '<rect x="330" y="150" width="20" height="10" rx="3" fill="#f2c75c"/></g></svg>';
    }
  };

  var I = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    clubs: '<path d="M14 4 L22 36 M24 4 L24 36 M34 4 L26 36" ' + I + '/><path d="M18 36 h10 l2 4 h-14z M10 2 h6 M21 2 h6 M32 2 h6" ' + I + '/>',
    glove: '<path d="M14 40 V22 Q14 18 17 18 V8 Q17 6 19 6 Q21 6 21 8 V17 V5 Q21 3 23 3 Q25 3 25 5 V17 V7 Q25 5 27 5 Q29 5 29 7 V19 L30 13 Q31 11 33 12 Q34 13 34 15 L32 28 Q31 35 28 40 Z" ' + I + '/><path d="M15 34 H29" ' + I + '/>',
    shoe: '<path d="M4 30 Q4 24 10 23 L18 20 Q24 18 28 22 L36 26 Q42 28 40 32 Z M3 32 H41 Q42 36 38 36 H6 Q3 36 3 32 Z M18 22 l3 4 M22 20 l3 4" ' + I + '/>',
    ticket: '<path d="M6 12 H38 V18 Q34 20 34 22 Q34 24 38 26 V32 H6 V26 Q10 24 10 22 Q10 20 6 18 Z M16 12 V32" ' + I + '/><circle cx="25" cy="22" r="3" ' + I + '/>',
    target: '<circle cx="22" cy="22" r="16" ' + I + '/><circle cx="22" cy="22" r="9" ' + I + '/><circle cx="22" cy="22" r="2.5" fill="currentColor"/>',
    eye: '<path d="M4 22 Q22 6 40 22 Q22 38 4 22 Z" ' + I + '/><circle cx="22" cy="22" r="6" ' + I + '/>',
    stop: '<path d="M15 4 H29 L40 15 V29 L29 40 H15 L4 29 V15 Z M15 22 H29" ' + I + '/>',
    walk: '<circle cx="22" cy="7" r="3.5" ' + I + '/><path d="M22 12 L20 26 L14 40 M20 26 L27 40 M21 16 L13 22 M21 16 L30 21" ' + I + '/>',
    clock: '<circle cx="22" cy="22" r="17" ' + I + '/><path d="M22 11 V22 L30 27" ' + I + '/>',
    bag: '<path d="M14 14 H30 L32 40 H12 Z M17 14 V6 M22 14 V3 M27 14 V7 M12 24 H32" ' + I + '/>',
    flag: '<path d="M14 40 V4 L34 11 L14 18" ' + I + '/><ellipse cx="18" cy="40" rx="10" ry="2.5" ' + I + '/>',
    card: '<rect x="6" y="8" width="32" height="28" rx="3" ' + I + '/><path d="M6 16 H38 M16 8 V36 M27 8 V36 M6 26 H38" ' + I + '/>'
  };

  function paint(root) {
    (root || document).querySelectorAll('[data-scene]').forEach(function (el) {
      var f = SCENES[el.getAttribute('data-scene')]; if (f && !el.firstChild) el.innerHTML = f('sc' + (++n) + '_');
    });
    (root || document).querySelectorAll('i[data-icon]').forEach(function (el) {
      var s = ICONS[el.getAttribute('data-icon')]; if (s && !el.firstChild) el.innerHTML = '<svg viewBox="0 0 44 44" aria-hidden="true">' + s + '</svg>';
    });
  }
  window.GL = window.GL || {};
  window.GL.paintScenes = paint;
  document.addEventListener('DOMContentLoaded', function () { paint(); });
})();
