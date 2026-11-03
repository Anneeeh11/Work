/* PAR/A — What to Wear: lookbook page with drawn garments (160 × 160 each, shaded and stitched),
   and the today's-weather outfit card shown on the home page. */
(function () {
  'use strict';
  var GL = window.GL, store = GL.store, icon = GL.icon;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- drawing helpers ---------- */
  var n = 0, P = '';
  function defs() {
    return '<defs>' +
      '<linearGradient id="' + P + 'sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".13"/></linearGradient>' +
      '<linearGradient id="' + P + 'v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>' +
      '<linearGradient id="' + P + 'metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f3ec"/><stop offset=".5" stop-color="#a9a396"/><stop offset="1" stop-color="#e4dfd3"/></linearGradient>' +
      '<radialGradient id="' + P + 'ball" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ddd8cc"/></radialGradient>' +
      '<pattern id="' + P + 'knit" width="7" height="6" patternUnits="userSpaceOnUse"><path d="M0 0 L3.5 4 L7 0" fill="none" stroke="#000" stroke-opacity=".09" stroke-width="1.1"/></pattern>' +
      '<pattern id="' + P + 'denim" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" stroke="#fff" stroke-opacity=".1" stroke-width="1.4"/></pattern>' +
      '<pattern id="' + P + 'pique" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r=".7" fill="#000" fill-opacity=".05"/></pattern>' +
      '<pattern id="' + P + 'linen" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3 H6 M3 0 V6" stroke="#8a7b5c" stroke-opacity=".06"/></pattern>' +
      '</defs>';
  }
  // a shaded piece of fabric: base colour, light from the left, optional texture, outline on top
  function part(d, fill, line, tex) {
    return '<path d="' + d + '" fill="' + fill + '"/>' + (tex ? '<path d="' + d + '" fill="url(#' + P + tex + ')"/>' : '') +
      '<path d="' + d + '" fill="url(#' + P + 'sh)"/><path d="' + d + '" fill="none" stroke="' + line + '" stroke-width="1.3" stroke-linejoin="round"/>';
  }
  function stitch(d, col, op) { return '<path d="' + d + '" fill="none" stroke="' + (col || '#000') + '" stroke-opacity="' + (op || (col ? 1 : .2)) + '" stroke-width="1" stroke-dasharray="2.4 2.2" stroke-linecap="round"/>'; }
  function line(d, col, w, op) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 1) + '" stroke-opacity="' + (op == null ? 1 : op) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function logo(x, y, s) { s = s || 1; return '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + 10 * s) + '" stroke="#0b4a32" stroke-width="' + s + '"/><path d="M' + x + ' ' + y + ' l' + 6 * s + ' ' + 2.3 * s + ' l' + -6 * s + ' ' + 2.3 * s + 'z" fill="#d9a93a"/>'; }
  var shadow = function (cx, cy, rx) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + (rx * .1) + '" fill="#1b2a22" opacity=".09"/>'; };

  /* ---------- garments ---------- */
  var G = {
    polo: function (o) {
      o = o || {};
      var f = o.f || '#ffffff', l = o.l || '#cdc5b0', t = o.trim || f;
      var body = o.sleeveless
        ? 'M54 30 L66 21 Q80 29 94 21 L106 30 Q99 48 108 64 L108 138 Q80 143 52 138 L52 64 Q61 48 54 30 Z'
        : 'M50 30 L66 21 Q80 29 94 21 L110 30 L134 56 L119 71 L110 63 L110 138 Q80 143 50 138 L50 63 L41 71 L26 56 Z';
      var s = part(body, f, l, 'pique');
      if (o.sleeveless) s += stitch('M57.5 32 Q64 48 55.5 64') + stitch('M102.5 32 Q96 48 104.5 64');
      else s += '<path d="M26 56 L41 71 L45 67 L30 52 Z" fill="' + t + '" stroke="' + l + '" stroke-width="1.1"/><path d="M134 56 L119 71 L115 67 L130 52 Z" fill="' + t + '" stroke="' + l + '" stroke-width="1.1"/>' +
        line('M50 63 Q52 46 50 30', l, 1, .6) + line('M110 63 Q108 46 110 30', l, 1, .6);
      s += stitch('M53 133 Q80 138 107 133') + line('M66 90 Q80 94 94 90', '#000', 1, .05) + line('M60 110 Q80 115 100 110', '#000', 1, .04);
      s += '<path d="M76 37 L84 37 L84 72 L76 72 Z" fill="' + f + '" stroke="' + l + '" stroke-width="1"/>' +
        [45, 54, 63].map(function (y) { return '<circle cx="80" cy="' + y + '" r="1.9" fill="#fbf8ef" stroke="' + l + '" stroke-width=".9"/>'; }).join('');
      s += '<path d="M66 21 Q80 28 94 21 L94 16.5 Q80 23.5 66 16.5 Z" fill="' + t + '" stroke="' + l + '" stroke-width="1"/>' +
        '<path d="M66 18 L80 38 L71 45 L58.5 27 Z" fill="' + t + '" stroke="' + l + '" stroke-width="1.1" stroke-linejoin="round"/>' +
        '<path d="M94 18 L80 38 L89 45 L101.5 27 Z" fill="' + t + '" stroke="' + l + '" stroke-width="1.1" stroke-linejoin="round"/>' +
        stitch('M65 22 L76 37.5 L70.5 41.5', l, .9) + stitch('M95 22 L84 37.5 L89.5 41.5', l, .9);
      if (o.stripe) s += '<path d="M28.5 54.4 L43.4 68.6" stroke="' + o.stripe + '" stroke-width="1.6"/><path d="M131.5 54.4 L116.6 68.6" stroke="' + o.stripe + '" stroke-width="1.6"/>';
      if (o.logo !== false) s += logo(96, 50);
      return s;
    },
    tee: function () {
      var f = '#efe9dc', l = '#cdc5b0';
      var s = part('M50 30 L66 21 Q80 33 94 21 L110 30 L134 56 L119 71 L110 63 L110 138 Q80 143 50 138 L50 63 L41 71 L26 56 Z', f, l);
      s += line('M66 21 Q80 33 94 21', l, 4) + line('M66.5 24.5 Q80 35.5 93.5 24.5', '#fff', 1, .5) + stitch('M53 133 Q80 138 107 133') + stitch('M29 53 L44 67.5') + stitch('M131 53 L116 67.5');
      return s + '<rect x="68" y="66" width="24" height="18" rx="3" fill="none" stroke="#c2b79c" stroke-width="1.2" stroke-dasharray="3 2"/>';
    },
    tank: function () {
      var f = '#efe9dc', l = '#cdc5b0';
      var s = part('M60 21 Q80 46 100 21 L106 23 Q99 48 110 66 L110 138 Q80 143 50 138 L50 66 Q61 48 54 23 Z', f, l);
      return s + line('M60.5 23.5 Q80 47.5 99.5 23.5', '#fff', 1, .6) + stitch('M57 26 Q63 48 53 64') + stitch('M103 26 Q97 48 107 64') + stitch('M53 133 Q80 138 107 133');
    },
    knit: function () {
      var f = '#1f4f3b', l = '#143a2b';
      var s = part('M56 28 L67 21 L80 60 L93 21 L104 28 Q97 48 108 64 L108 138 Q80 143 52 138 L52 64 Q63 48 56 28 Z', f, l, 'knit');
      s += line('M67 23 L80 60 L93 23', '#e9dfc4', 2.4) + line('M63 30 Q67 46 56 63', '#e9dfc4', 2, .9) + line('M97 30 Q93 46 104 63', '#e9dfc4', 2, .9);
      s += '<path d="M52 127 Q80 132 108 127 L108 138 Q80 143 52 138 Z" fill="#e9dfc4" opacity=".9"/>';
      for (var x = 56; x < 106; x += 4) s += line('M' + x + ' ' + (128.5 + Math.abs(80 - x) * -.02) + ' V138', '#143a2b', .7, .35);
      return s;
    },
    pants: function (o) {
      o = o || {};
      var denim = o.denim, f = o.f || (denim ? '#5f82a8' : '#d8cba7'), l = o.l || (denim ? '#3e5d80' : '#b3a47e');
      var sc = denim ? '#e2b65a' : null;
      var s = part('M46 20 L114 20 L121 146 L89 146 L80 58 L71 146 L39 146 Z', f, l, denim ? 'denim' : null);
      s += '<path d="M46 20 L114 20 L114.7 31 L45.3 31 Z" fill="' + f + '"/><path d="M46 20 L114 20 L114.7 31 L45.3 31 Z" fill="url(#' + P + 'v)"/><path d="M45.3 31 L114.7 31" stroke="' + l + '"/>';
      [52, 69, 91, 106].forEach(function (x) { s += '<rect x="' + x + '" y="18" width="4" height="14" rx="1.2" fill="' + f + '" stroke="' + l + '" stroke-width=".9"/>'; });
      s += '<circle cx="80" cy="25.5" r="2.3" fill="' + (denim ? '#d9b062' : '#8f8160') + '"/>';
      s += stitch('M80 31 V55 Q86 52 86 31', sc, denim ? .9 : 0);
      s += line('M49 32 Q61 40 59 55', l, 1.1) + line('M111 32 Q99 40 101 55', l, 1.1);
      if (denim) s += stitch('M50.5 31 Q62 40 60.5 56', sc, .8) + stitch('M109.5 31 Q98 40 99.5 56', sc, .8) + '<circle cx="50" cy="33" r="1.3" fill="#d9b062"/><circle cx="110" cy="33" r="1.3" fill="#d9b062"/>' +
        line('M40 141 H70 M90 141 H120', sc, 1, .8) + line('M60 70 L57 146 M100 70 L103 146', '#fff', 1, .07);
      else s += line('M61 62 L57 146 M99 62 L103 146', '#000', 1, .1) + stitch('M40.5 140 H70 M89.5 140 H119.5');
      return s;
    },
    belt: function (o) {
      o = o || {};
      var f = o.f || '#4b3427', l = '#2e1f17';
      var s = part('M14 71 H138 Q151 71 151 80 Q151 89 138 89 H14 Z', f, l);
      s += stitch('M18 74 H138 Q147 74 147.5 80 Q147 86 138 86 H18', '#a07a58', .9);
      [108, 118, 128].forEach(function (x) { s += '<circle cx="' + x + '" cy="80" r="1.9" fill="#21160f"/>'; });
      s += '<rect x="52" y="68.5" width="8" height="23" rx="2" fill="#3e2a1f" stroke="' + l + '"/>';
      s += '<rect x="20" y="64" width="26" height="32" rx="5" fill="none" stroke="url(#' + P + 'metal)" stroke-width="4.5"/><rect x="20" y="64" width="26" height="32" rx="5" fill="none" stroke="#8d877b" stroke-width=".8"/>';
      s += '<line x1="33" y1="80" x2="50" y2="80" stroke="url(#' + P + 'metal)" stroke-width="2.6" stroke-linecap="round"/>';
      return s;
    },
    skirt: function (o) {
      o = o || {};
      var f = o.f || '#f4f2ec', l = o.l || '#d4ccb8';
      var s = part('M49 42 H111 L132 126 Q80 134 28 126 Z', f, l);
      for (var i = 1; i < 7; i++) {
        var xt = 49 + i * 62 / 7, xb = 28 + i * 104 / 7, yb = 126 + 4 * Math.sin(i / 7 * Math.PI);
        s += '<path d="M' + xt + ' 42 L' + xb + ' ' + yb + ' L' + (xb + 6) + ' ' + (yb + .4) + ' Z" fill="#000" fill-opacity=".05"/>' + line('M' + xt + ' 42 L' + xb + ' ' + yb, l, 1, .9);
      }
      s += '<path d="M50 30 H110 L111 42 H49 Z" fill="' + f + '" stroke="' + l + '" stroke-width="1.1"/><path d="M50 30 H110 L111 42 H49 Z" fill="url(#' + P + 'v)"/>' + stitch('M51 39.5 H109');
      return s + stitch('M30 121.5 Q80 129.5 130 121.5') + '<circle cx="104" cy="36" r="1.6" fill="' + l + '"/>';
    },
    shorts: function () {
      var f = '#cdd8e6', l = '#9fb0c6';
      var s = part('M44 44 H116 L124 114 L88 116 L80 88 L72 116 L36 114 Z', f, l);
      s += '<path d="M44 44 H116 L116.9 57 H43.1 Z" fill="#b8c7da"/>';
      for (var x = 48; x < 114; x += 5) s += line('M' + x + ' 45 V56.5', '#8ea1b9', .8, .6);
      s += line('M77 57 Q73 66 71 74 M83 57 Q87 66 89 74', '#ffffff', 1.6) + '<path d="M47 57 L39 114 M113 57 L121 114" stroke="#fff" stroke-width="3.5" stroke-opacity=".85"/>';
      return s;
    },
    shoes: function (o) {
      o = o || {};
      var a = o.accent || '#0b4a32', l = '#cdc5b0', up = 'M18 108 Q15 92 25 86 Q33 82 42 86 Q52 89 62 79 L76 71 Q88 66 101 71 Q118 79 133 89 Q147 98 144 108 Z';
      var s = '<clipPath id="' + P + 'shoe"><path d="' + up + '"/></clipPath>' + part(up, '#ffffff', l);
      s += '<g clip-path="url(#' + P + 'shoe)"><path d="M66 60 Q80 58 92 62 L102 112 L74 112 Z" fill="' + a + '"/><path d="M10 112 L10 80 Q26 78 34 84 L38 112 Z" fill="' + a + '"/>' +
        '<path d="M66 60 Q80 58 92 62 L102 112 L74 112 Z" fill="url(#' + P + 'sh)"/></g>';
      [[72, 74.5], [79.5, 71], [87, 69], [94.5, 69.5]].forEach(function (p) { s += line('M' + (p[0] - 4) + ' ' + (p[1] + 1) + ' L' + (p[0] + 4.5) + ' ' + (p[1] + 5.5), '#fbf8ef', 2.1); });
      s += stitch('M117 84 Q127 96 125 107', l, .9) + stitch('M38 106 Q37 94 42 88', '#fbf8ef', .8) + line('M25 86 Q33 81.5 42 86', '#a9a18c', 1.6);
      s += '<path d="M14 108 H145 Q150 108 148.5 114 Q147 120 139 120 H23 Q14 120 13.5 114 Q13.5 108 14 108 Z" fill="#f1ede2" stroke="' + l + '" stroke-width="1.2"/>' + line('M16 112.5 H146', a, 1.6);
      for (var x = 24; x < 140; x += 11) s += '<rect x="' + x + '" y="119.5" width="6" height="3" rx="1.3" fill="#c9c1ab"/>';
      return s;
    },
    cap: function (o) {
      o = o || {};
      var f = o.f || '#0b4a32', b = o.brim || '#073a27';
      var s = part('M36 96 Q36 47 80 41 Q124 47 124 96 Z', f, '#062d1f');
      s += line('M80 41 Q74 70 76 96', '#000', 1, .2) + line('M58 49 Q50 72 54 96', '#000', 1, .18) + line('M102 49 Q110 72 106 96', '#000', 1, .18);
      s += '<circle cx="64" cy="58" r="1.6" fill="#062d1f"/><circle cx="97" cy="58" r="1.6" fill="#062d1f"/><circle cx="80" cy="42" r="4" fill="' + f + '" stroke="#062d1f"/>';
      s += line('M36 96 Q80 104 124 96', '#062d1f', 3);
      s += part('M56 94 Q100 87 147 104 Q133 119 96 113 Q70 109 56 94 Z', b, '#05281b') + stitch('M64 96 Q100 91 138 104', '#ffffff', .25) + stitch('M68 100 Q100 96 132 107', '#ffffff', .2);
      return s + logo(84, 64, 1.6);
    },
    visor: function () {
      var s = part('M38 76 Q80 60 122 76 L122 90 Q80 74 38 90 Z', '#ffffff', '#cdc5b0') + stitch('M40 80 Q80 65 120 80') + stitch('M40 86 Q80 71 120 86');
      s += part('M48 88 Q90 76 141 96 Q128 113 92 107 Q66 103 48 88 Z', '#0b4a32', '#062d1f') + stitch('M58 90 Q92 82 132 97', '#ffffff', .25);
      return s + logo(76, 68, 1.2);
    },
    sweater: function (o) {
      // crew-neck sweater with a long-sleeve polo underneath: its collar and cuffs show
      o = o || {};
      var f = o.f || '#2e4560', l = o.l || '#1f3044', r = o.rib || '#263a52';
      var s = part('M50 30 L66 22 Q80 31 94 22 L110 30 Q124 40 132 58 L142 126 L126 130 L114 74 L112 138 Q80 143 48 138 L46 74 L34 130 L18 126 L28 58 Q36 40 50 30 Z', f, l, 'knit');
      s += line('M80 44 Q76 52 80 60 Q84 68 80 76 Q76 84 80 92 Q84 100 80 108 Q76 116 80 124', '#ffffff', 1.4, .18) + line('M74 46 V126 M86 46 V126', '#000', 1, .12);
      s += line('M46 74 Q48 60 50 30', l, 1, .5) + line('M114 74 Q112 60 110 30', l, 1, .5);
      s += '<path d="M48 128 Q80 133 112 128 L112 138 Q80 143 48 138 Z" fill="' + r + '"/>';
      for (var x = 51; x < 111; x += 4) s += line('M' + x + ' 129.5 V139', '#000', .7, .25);
      s += '<path d="M19 118 L33 122 L34 130 L18 126 Z" fill="' + r + '"/><path d="M141 118 L127 122 L126 130 L142 126 Z" fill="' + r + '"/>';
      s += '<path d="M18.2 126.5 L33.8 130.4 L33.4 135 L17.6 131 Z" fill="#ffffff" stroke="#cdc5b0" stroke-width=".8"/><path d="M141.8 126.5 L126.2 130.4 L126.6 135 L142.4 131 Z" fill="#ffffff" stroke="#cdc5b0" stroke-width=".8"/>';
      s += '<path d="M64 24 Q80 35 96 24 L94 21 Q80 31 66 21 Z" fill="' + r + '"/>';
      s += '<path d="M66 18 L80 34 L72 41 L59.5 26 Z" fill="#ffffff" stroke="#cdc5b0" stroke-width="1" stroke-linejoin="round"/><path d="M94 18 L80 34 L88 41 L100.5 26 Z" fill="#ffffff" stroke="#cdc5b0" stroke-width="1" stroke-linejoin="round"/>';
      return s + stitch('M65 22 L76.5 34.5 L71.5 38.5', '#cdc5b0', .9) + stitch('M95 22 L83.5 34.5 L88.5 38.5', '#cdc5b0', .9);
    },
    sunglasses: function () {
      var lens = function (d) { return '<path d="' + d + '" fill="url(#' + P + 'lens)" stroke="#1d241f" stroke-width="2.4" stroke-linejoin="round"/>'; };
      var s = '<linearGradient id="' + P + 'lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4e6a5c"/><stop offset=".55" stop-color="#1f2d26"/><stop offset="1" stop-color="#0f1613"/></linearGradient>';
      s += lens('M28 70 Q28 62 38 62 H70 Q77 62 77 70 Q77 92 56 92 Q34 92 28 70 Z') + lens('M132 70 Q132 62 122 62 H90 Q83 62 83 70 Q83 92 104 92 Q126 92 132 70 Z');
      s += line('M77 68 Q80 63 83 68', '#1d241f', 2.6) + line('M28 66 L12 60 M132 66 L148 60', '#1d241f', 2.4);
      return s + line('M36 70 Q42 66 50 66', '#ffffff', 2, .45) + line('M92 70 Q98 66 106 66', '#ffffff', 2, .45);
    },
    golfshorts: function () {
      var f = '#d8cba7', l = '#b3a47e';
      var s = '<clipPath id="' + P + 'gs"><rect x="0" y="0" width="160" height="98"/></clipPath><g clip-path="url(#' + P + 'gs)">' + G.pants() + '</g>';
      return s + line('M42.6 98 H75.6 M84.4 98 H117.4', l, 1.4) + stitch('M43 93 H75 M85 93 H117');
    },
    jacket: function () {
      var f = '#2f4f6b', l = '#1f374c';
      var s = part('M50 30 L66 20 L80 26 L94 20 L110 30 L132 70 Q136 104 128 136 L116 136 L110 78 L110 138 Q80 142 50 138 L50 78 L44 136 L32 136 Q24 104 28 70 Z', f, l);
      s += '<path d="M66 20 Q80 30 94 20 L94 13 Q80 22 66 13 Z" fill="#3c6283" stroke="' + l + '"/>' + line('M80 26 V140', '#c9d3dc', 1.6) + stitch('M77 28 V138', '#c9d3dc', .6);
      s += line('M58 92 L70 90 M102 90 L90 92', '#c9d3dc', 1.4, .8) + stitch('M51 132 Q80 136 109 132', '#c9d3dc', .5) + '<rect x="78" y="40" width="4" height="6" rx="1" fill="#e2b65a"/>';
      return s + line('M36 128 L44 129 M124 128 L116 129', '#c9d3dc', 2, .7);
    },
    umbrella: function () {
      var s = part('M20 78 Q24 32 80 28 Q136 32 140 78 Q126 70 113 78 Q100 70 87 78 L80 76 L73 78 Q60 70 47 78 Q34 70 20 78 Z', '#0b4a32', '#062d1f');
      s += line('M80 28 Q66 50 73 78 M80 28 Q94 50 87 78 M80 28 Q46 44 47 78 M80 28 Q114 44 113 78', '#fbf8ef', 1, .35) + '<path d="M50 30 Q80 20 110 30 Q80 26 50 30 Z" fill="#f2c75c" opacity=".8"/>';
      return s + line('M80 76 V128 Q80 138 70 138 Q62 138 62 130', '#4b3427', 3) + '<circle cx="80" cy="26" r="2.6" fill="#f2c75c"/>';
    },
    glove: function () {
      var d = 'M40 104 L40 60 Q40 50 46 50 L46 26 Q46 20 52 20 Q58 20 58 26 L58 46 L58 20 Q58 14 64 14 Q70 14 70 20 L70 46 L70 24 Q70 18 76 18 Q82 18 82 24 L82 50 L84 34 Q86 28 91 30 Q95 32 94 38 L90 72 Q88 90 80 104 Z';
      var s = '<g transform="translate(8 8) scale(1.2)">' + part(d, '#ffffff', '#cdc5b0');
      [[52, 30], [52, 36], [64, 24], [64, 30], [76, 28], [76, 34]].forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r=".9" fill="#cdc5b0"/>'; });
      s += line('M48 56 Q52 58 56 56 M60 54 Q64 56 68 54 M72 56 Q76 58 80 56', '#cdc5b0', .9);
      s += '<path d="M42 90 H80 L80 100 Q60 103 42 100 Z" fill="#0b4a32"/><rect x="62" y="88" width="16" height="12" rx="3" fill="#0e5a3d" stroke="#062d1f" stroke-width=".8"/>' + logo(68, 89, .9);
      return s + '</g>';
    }
  };

  // one garment on its own tile
  function tile(type, o) {
    P = 'of' + (++n) + '_';
    var sh = { belt: [80, 104, 64], shoes: [80, 132, 62], cap: [86, 122, 52], visor: [90, 116, 50], glove: [82, 140, 40], golfshorts: [80, 108, 46], umbrella: [80, 146, 30], sunglasses: [80, 104, 52] }[type] || [80, 148, 46];
    return '<svg class="of-art" viewBox="0 0 160 160" aria-hidden="true">' + defs() + shadow(sh[0], sh[1], sh[2]) + G[type](o) + '</svg>';
  }
  var place = function (x, y, s, inner, rot) { return '<g transform="translate(' + x + ' ' + y + ')' + (rot ? ' rotate(' + rot + ' 80 80)' : '') + ' scale(' + s + ')">' + inner + '</g>'; };

  // flat lay for the hero: a full outfit laid out on linen
  function flatLay() {
    P = 'of' + (++n) + '_';
    var ball = function (x, y, r) {
      var s = '<circle cx="' + x + '" cy="' + (y + r * .25) + '" r="' + r + '" fill="#1b2a22" opacity=".08"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + P + 'ball)" stroke="#d6d0c2" stroke-width=".8"/>';
      for (var k = 0; k < 9; k++) { var a = k * 2.4, rr = (k % 3 + 1) * r * .26; s += '<circle cx="' + (x + Math.cos(a) * rr) + '" cy="' + (y + Math.sin(a) * rr) + '" r="' + r * .09 + '" fill="#cfc8b8"/>'; }
      return s;
    };
    var tee = function (x, y, rot, c) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><path d="M-6 0 H6 L4 3 L1 4 L.8 26 L0 28 L-.8 26 L-1 4 L-4 3 Z" fill="' + c + '"/></g>'; };
    var o = '<svg class="of-flat" viewBox="0 0 560 440" aria-hidden="true">' + defs() +
      '<rect width="560" height="440" rx="22" fill="#f3eee2"/><rect width="560" height="440" rx="22" fill="url(#' + P + 'linen)"/>';
    o += place(20, 10, 1.62, shadow(80, 146, 50) + G.polo({ f: '#ffffff', trim: '#ffffff', stripe: '#0b4a32' }));
    o += place(290, 18, 1.5, shadow(80, 150, 46) + G.pants(), -6);
    o += place(316, 262, 1.22, shadow(80, 92, 66) + G.belt(), -6);
    o += place(4, 262, 1.08, shadow(86, 120, 50) + G.cap(), -10);
    o += place(150, 286, 1.0, shadow(80, 126, 60) + G.shoes(), 0);
    o += place(438, 150, .74, shadow(82, 140, 36) + G.glove(), 14);
    o += ball(510, 66, 15) + ball(478, 98, 11) + tee(522, 372, 24, '#f2c75c') + tee(500, 388, -14, '#ffffff') + tee(540, 396, 66, '#0b4a32');
    return o + '</svg>';
  }

  // a whole outfit stacked from cap to shoes, with numbered markers
  function look(kind) {
    P = 'of' + (++n) + '_';
    var mark = function (x, y, k) { return '<g class="of-pin"><circle cx="' + x + '" cy="' + y + '" r="11" fill="#0b4a32" stroke="#fbf8ef" stroke-width="2"/><text x="' + x + '" y="' + (y + 4.2) + '" text-anchor="middle">' + k + '</text></g>'; };
    var o = '<svg class="of-look-art" viewBox="0 0 240 460" aria-hidden="true">' + defs() + '<ellipse cx="120" cy="446" rx="90" ry="7" fill="#1b2a22" opacity=".08"/>';
    var pair = function (y, opt) { return place(12, y, .64, G.shoes(opt)) + '<g transform="translate(228 ' + y + ') scale(-.64 .64)">' + G.shoes(opt) + '</g>'; };
    if (kind === 'winter-f') o = o.replace('viewBox="0 0 240 460"', 'viewBox="0 0 240 484"').replace('cy="446" rx="90"', 'cy="470" rx="90"');
    // legs in tights, with the shoes under them (toes pointing out)
    var tights = '<path d="M104 356 L93 432 M136 356 L147 432" stroke="#2f3438" stroke-width="10" stroke-linecap="round"/>';
    var feet = function (y) { return '<g transform="translate(118 ' + y + ') scale(-.64 .64)">' + G.shoes() + '</g>' + place(122, y, .64, G.shoes()); };
    if (kind === 'winter-f') {
      o += place(56, -4, .8, G.cap()) + tights + place(32, 215, 1.1, G.skirt({ f: '#4b525b', l: '#353b42' })) + place(16, 70, 1.3, G.sweater({ f: '#7a2e3a', l: '#561c26', rib: '#66242f' })) + feet(380);
      o += mark(176, 44, 1) + mark(150, 196, 2) + mark(146, 98, 3) + mark(178, 330, 4) + mark(214, 452, 5);
    } else if (kind === 'summer-f') {
      o += place(48, 4, .9, G.visor()) + place(148, 18, .5, G.sunglasses()) + place(20, 209, 1.25, G.skirt({ f: '#ffffff' })) + place(16, 70, 1.3, G.polo({ f: '#f6e4e8', l: '#e0c2ca', stripe: '#c96a7a' })) + pair(352, { accent: '#c96a7a' });
      o = o.replace('cy="446" rx="90"', 'cy="434" rx="90"');
      o += mark(70, 48, 1) + mark(150, 106, 2) + mark(186, 320, 3) + mark(60, 420, 4);
    } else if (kind === 'winter') {
      o += place(56, -4, .8, G.cap()) + place(30, 236, 1.125, G.pants({ f: '#58636c', l: '#3f484f' })) + place(16, 70, 1.3, G.sweater()) + pair(368);
      o += mark(176, 44, 1) + mark(150, 196, 2) + mark(146, 98, 3) + mark(170, 330, 4) + mark(60, 430, 5);
    } else {
      o += place(56, -4, .8, G.cap()) + place(148, 18, .5, G.sunglasses()) + place(16, 70, 1.3, G.polo({ f: '#e6f0f6', l: '#b9ccda', stripe: '#0b4a32' })) + place(30, 236, 1.125, G.golfshorts()) + pair(320);
      o = o.replace('cy="446" rx="90"', 'cy="402" rx="90"');
      o += mark(70, 40, 1) + mark(150, 106, 2) + mark(176, 300, 3) + mark(60, 390, 4);
    }
    return o + '</svg>';
  }

  /* ---------- small icons ---------- */
  var ICONS = {
    sun: '<circle cx="32" cy="32" r="11" fill="#f2c75c"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { var r = a * Math.PI / 180; return '<line x1="' + (32 + Math.cos(r) * 17) + '" y1="' + (32 + Math.sin(r) * 17) + '" x2="' + (32 + Math.cos(r) * 24) + '" y2="' + (32 + Math.sin(r) * 24) + '" stroke="#e0ab2f" stroke-width="3" stroke-linecap="round"/>'; }).join(''),
    cold: [0, 60, 120].map(function (a) { return '<g transform="rotate(' + a + ' 30 30)"><line x1="30" y1="10" x2="30" y2="50" stroke="#5f86a8" stroke-width="2.6" stroke-linecap="round"/><path d="M24 15 L30 21 L36 15 M24 45 L30 39 L36 45" fill="none" stroke="#5f86a8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>'; }).join('') + '<path d="M44 46 H58 M48 53 H62" stroke="#9fb6c9" stroke-width="2.4" stroke-linecap="round"/>',
    rain: '<path d="M18 38 Q10 38 10 30 Q10 22 19 22 Q22 12 33 12 Q45 12 47 23 Q56 23 56 31 Q56 38 48 38 Z" fill="#c9d6cf" stroke="#93ab9d" stroke-width="1.6"/>' + [[22, 46], [33, 49], [44, 46]].map(function (p) { return '<path d="M' + p[0] + ' ' + p[1] + ' q-3 5 0 7 q3 -2 0 -7z" fill="#5f9a7b"/>'; }).join(''),
    cloud: '<path d="M18 46 Q8 46 8 37 Q8 28 18 28 Q21 16 34 16 Q47 16 50 29 Q58 29 58 37 Q58 46 48 46 Z" fill="#dfe6e2" stroke="#a9b9b0" stroke-width="1.6"/>',
    partly: '<circle cx="24" cy="24" r="10" fill="#f2c75c"/><path d="M24 50 Q14 50 14 42 Q14 34 23 34 Q26 24 37 24 Q48 24 50 35 Q58 35 58 42 Q58 50 50 50 Z" fill="#eef2ef" stroke="#a9b9b0" stroke-width="1.6"/>',
    storm: '<path d="M18 36 Q8 36 8 28 Q8 20 18 20 Q21 10 34 10 Q47 10 50 21 Q58 21 58 28 Q58 36 48 36 Z" fill="#b9c4cc" stroke="#7f8f9b" stroke-width="1.6"/><path d="M34 38 L26 50 H33 L28 60 L42 45 H35 L40 38 Z" fill="#f2c75c"/>',
    snow: '<path d="M18 36 Q8 36 8 28 Q8 20 18 20 Q21 10 34 10 Q47 10 50 21 Q58 21 58 28 Q58 36 48 36 Z" fill="#eef3f6" stroke="#a9b9c6" stroke-width="1.6"/>' + [[22, 46], [34, 52], [46, 46]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#8fb0c9"/>'; }).join(''),
    fog: '<path d="M10 24 H54 M6 34 H50 M14 44 H58" stroke="#a9b9b0" stroke-width="4" stroke-linecap="round"/>',
    range: '<rect x="8" y="40" width="48" height="12" rx="3" fill="#5fa64a"/><rect x="8" y="40" width="48" height="4" rx="2" fill="#7cbd5f"/><path d="M30 40 V30" stroke="#f2c75c" stroke-width="2.4"/><circle cx="30" cy="25" r="6" fill="#fff" stroke="#d6d0c2"/><path d="M10 14 Q30 4 54 18" fill="none" stroke="#0b4a32" stroke-width="1.6" stroke-dasharray="2 4"/>',
    course: '<ellipse cx="32" cy="50" rx="24" ry="7" fill="#5fa64a"/><ellipse cx="34" cy="50" rx="3.5" ry="1.4" fill="#0b2a18"/><line x1="34" y1="50" x2="34" y2="12" stroke="#0b4a32" stroke-width="2"/><path d="M34 12 L52 18 L34 24 Z" fill="#f2c75c"/>'
  };
  var ico = function (k) { return '<svg class="of-ico" viewBox="0 0 64 64" aria-hidden="true">' + ICONS[k] + '</svg>'; };

  /* ---------- content ---------- */
  var DO = [['polo', 'Polo 衫', '有領，最安全的選擇'], ['pants', '卡其長褲', '或及膝短褲，看球場規定'], ['skirt', '球裙、褲裙', '及膝或稍短一點'], ['belt', '皮帶', '上衣紮進褲子時一定要繫'],
    ['shoes', '高爾夫球鞋', '新手買無釘的，平常也能穿'], ['cap', '帽子或遮陽帽', '擋太陽，也不會刺眼'], ['glove', '手套', '右手球員戴左手'], ['knit', '針織背心', '冬天加一件，不會卡住揮桿']];
  var DONT = [['tee', '圓領 T 恤', '多數球場不接受'], ['jeans', '牛仔褲', '幾乎所有球場都不行'], ['tank', '無領背心', '有領的無袖上衣通常可以'], ['shorts', '運動短褲', '太短、太休閒']];
  var LOOKS = {
    m: [
      ['winter', '冬天款', '天氣冷的時候，保暖又好揮桿', ['帽子：早上冷也可以戴毛帽', '毛衣或針織衫', '裡面穿有領的長袖 Polo 衫', '長褲（冷的話選刷毛內裡）', '高爾夫球鞋']],
      ['summer', '夏天款', '天氣熱的時候，清爽又合規定', ['帽子加墨鏡：擋太陽，也保護眼睛', '短袖 Polo 衫：排汗快乾、淺色', '及膝短褲', '高爾夫球鞋']]
    ],
    f: [
      ['winter-f', '冬天款', '天氣冷的時候，保暖又好揮桿', ['帽子：早上冷也可以戴毛帽', '毛衣或針織衫', '裡面穿有領的長袖 Polo 衫', '球裙配保暖褲襪（或長褲）', '高爾夫球鞋']],
      ['summer-f', '夏天款', '天氣熱的時候，清爽又合規定', ['遮陽帽加墨鏡：擋太陽，也保護眼睛', '短袖或無袖的有領上衣', '及膝或稍短的球裙、褲裙', '高爾夫球鞋']]
    ]
  };
  var ITEMS = ['Polo 衫（多帶一件替換）', '長褲、及膝短褲或球裙', '皮帶', '高爾夫球鞋', '帽子', '手套（多帶一副）', '防曬乳、袖套', '雨具或防風外套', '回程換洗的衣服'];

  /* ---------- today: weather where you are, and what to wear ---------- */
  var EN = function () { return GL.lang === 'en'; };
  function wx(code) {
    if (code === 0) return ['sun', '晴天'];
    if (code <= 2) return ['partly', '晴時多雲'];
    if (code === 3) return ['cloud', '陰天'];
    if (code === 45 || code === 48) return ['fog', '有霧'];
    if (code >= 95) return ['storm', '雷雨'];
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['snow', '下雪'];
    return ['rain', '下雨'];
  }
  // what to wear from today's high, the feel right now, rain, wind and UV
  function advise(d) {
    var hi = d.hi, lo = d.lo, feel = d.feel, rain = d.rain >= 50 || d.wet, wind = d.wind >= 25, mood, items, tips = [];
    if (hi >= 28) {
      mood = '今天很熱，穿清爽一點';
      items = [['polo', '排汗快乾的 Polo 衫', '淺色比較不熱'], ['golfshorts', '及膝短褲或球裙', '透氣好活動'], ['cap', '帽子或遮陽帽', '一定要戴'], ['shoes', '高爾夫球鞋', '透氣的款式']];
      tips.push('多帶一件上衣，下半場換上會舒服很多', '多喝水，每一洞都喝幾口');
    } else if (hi >= 20) {
      mood = '溫度剛好，經典款就對了';
      items = [['polo', 'Polo 衫', '有領，最安全的選擇'], [hi >= 25 ? 'golfshorts' : 'pants', hi >= 25 ? '及膝短褲或球裙' : '卡其長褲', '看球場規定'], ['cap', '帽子或遮陽帽', '擋太陽，也不會刺眼'], ['shoes', '高爾夫球鞋', '新手買無釘的，平常也能穿']];
      if (lo < 16) { items.push(['knit', '針織背心', '早上涼，熱了再脫']); tips.push('早晚溫差大，早場先多穿一件'); }
    } else if (hi >= 12) {
      mood = '有點涼，加一件背心';
      items = [['polo', 'Polo 衫', '可以選長袖款'], ['knit', '針織背心', '不會卡住揮桿'], ['pants', '長褲', '比短褲舒服'], ['shoes', '高爾夫球鞋', '新手買無釘的，平常也能穿']];
      tips.push('打一兩洞身體熱了再脫外層');
    } else {
      mood = '很冷，洋蔥式穿法';
      items = [['polo', '長袖內搭加 Polo 衫', '貼身的保暖內搭最好'], ['knit', '針織背心', '保暖又好揮桿'], ['jacket', '防風外套', '熱了可以脫'], ['pants', '長褲', '可以選刷毛內裡']];
      tips.push('準備暖手包，推桿前手才不會僵硬', '揮桿前多做幾次空揮暖身');
    }
    if (rain) { items.push(['umbrella', '雨傘和雨衣雨褲', '分開的雨衣褲比較好揮桿']); tips.push('穿防水的球鞋，多帶兩、三副手套和毛巾'); }
    if (wind && !items.some(function (x) { return x[0] === 'jacket'; })) { items.push(['jacket', '防風外套', '風大的時候很有用']); tips.push('風大時球會被吹偏，選低一點的球路'); }
    if (d.uv >= 6) tips.push('紫外線很強：擦防曬，可以戴防曬袖套');
    if (d.storm) tips.unshift('有雷雨：聽到打雷就停止打球，到室內躲避');
    if (feel <= hi - 6 && lo >= 16) tips.push('現在體感比較冷，出門先多穿一件');
    return { mood: mood, items: items, tips: tips };
  }
  function getJSON(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); }); }
  function forecast(lat, lon) {
    return getJSON('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max&timezone=auto&forecast_days=1');
  }
  function placeName(lat, lon) {
    return getJSON('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + lat + '&longitude=' + lon + '&localityLanguage=' + (EN() ? 'en' : 'zh-Hant'))
      .then(function (r) { return r.city || r.locality || r.principalSubdivision || ''; }, function () { return ''; });
  }
  function findCity(q) {
    return getJSON('https://geocoding-api.open-meteo.com/v1/search?count=1&format=json&language=' + (EN() ? 'en' : 'zh') + '&name=' + encodeURIComponent(q))
      .then(function (r) { if (!r.results || !r.results.length) throw new Error('nf'); return r.results[0]; });
  }
  function showToday(place, w) {
    var c = w.current || {}, dl = w.daily || {};
    var d = { hi: Math.round(dl.temperature_2m_max[0]), lo: Math.round(dl.temperature_2m_min[0]), now: Math.round(c.temperature_2m), feel: Math.round(c.apparent_temperature),
      rain: dl.precipitation_probability_max ? dl.precipitation_probability_max[0] || 0 : 0, wet: (c.precipitation || 0) > 0, uv: dl.uv_index_max ? Math.round(dl.uv_index_max[0] || 0) : 0,
      wind: Math.round(Math.max(c.wind_speed_10m || 0, dl.wind_speed_10m_max ? dl.wind_speed_10m_max[0] || 0 : 0)), code: dl.weather_code ? dl.weather_code[0] : c.weather_code };
    var k = wx(d.code); d.storm = k[0] === 'storm';
    var a = advise(d);
    var stat = function (v, u, label) { return '<div><b>' + v + '<small>' + u + '</small></b><span>' + label + '</span></div>'; };
    $('#ofTodayOut').innerHTML =
      '<div class="tw-now"><div class="tw-ico">' + ico(k[0]) + '</div><div><span class="tw-place">' + GL.esc(place || (EN() ? 'Your location' : '你的位置')) + '</span>' +
        '<div class="tw-temp"><b>' + d.now + '°</b><span>' + k[1] + '</span></div></div></div>' +
      '<div class="tw-stats">' + stat(d.hi + '° / ' + d.lo + '°', '', '最高 / 最低') + stat(d.feel + '°', '', '體感') + stat(d.rain, '%', '降雨機率') + stat(d.wind, ' km/h', '風速') + stat(d.uv, '', '紫外線') + '</div>' +
      '<div class="tw-advice"><h3>' + a.mood + '</h3><div class="tw-items">' + a.items.map(function (x) {
        return '<figure><div class="of-swatch">' + tile(x[0]) + '</div><figcaption><strong>' + x[1] + '</strong><small>' + x[2] + '</small></figcaption></figure>';
      }).join('') + '</div>' + (a.tips.length ? '<ul class="tw-tips">' + a.tips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' : '') + '</div>' +
      '<p class="tw-src">天氣資料：Open-Meteo，每小時更新。</p>';
    $('#ofToday').classList.add('has-result');
  }
  function todayMsg(t) { $('#ofTodayOut').innerHTML = '<p class="tw-msg">' + t + '</p>'; }
  function byCoords(lat, lon, label) {
    todayMsg('正在查今天的天氣⋯');
    return Promise.all([forecast(lat, lon), label != null ? Promise.resolve(label) : placeName(lat, lon)])
      .then(function (r) { showToday(r[1], r[0]); }, function () { todayMsg('暫時查不到天氣，請稍後再試，或先參考下面的「看天氣調整」。'); });
  }
  function initToday() {
    var btn = $('#ofLocate'), form = $('#ofCity');
    btn.addEventListener('click', function () {
      if (!navigator.geolocation) return todayMsg('這個瀏覽器沒辦法定位，請直接輸入城市。');
      todayMsg('正在取得你的位置⋯');
      navigator.geolocation.getCurrentPosition(function (pos) {
        byCoords(pos.coords.latitude.toFixed(3), pos.coords.longitude.toFixed(3));
      }, function () { todayMsg('沒有取得位置，可以直接輸入城市，例如「台北」或 Vancouver。'); }, { timeout: 10000, maximumAge: 600000 });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = form.q.value.trim(); if (!q) return;
      store.set('wxcity', q);
      todayMsg('正在查今天的天氣⋯');
      findCity(q).then(function (c) { byCoords(c.latitude, c.longitude, c.name); }, function () { todayMsg('找不到這個城市，換個寫法試試看，例如「台北」或 Taipei。'); });
    });
    var last = store.get('wxcity', '');
    if (last) form.q.value = last;
  }

  // the two looks, for men or for women (the choice is remembered on this device)
  function drawLooks(who) {
    if (!LOOKS[who]) who = 'm';
    $$('[data-lookfor]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lookfor') === who); });
    $('#ofLooks').innerHTML = LOOKS[who].map(function (l, i) {
      return '<article class="of-look"><div class="of-look-fig">' + look(l[0]) + '</div><div class="of-look-txt"><span class="of-tag">Look 0' + (i + 1) + '</span><h3>' + l[1] + '</h3><p>' + l[2] + '</p>' +
        '<ol>' + l[3].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol></div></article>';
    }).join('');
  }
  function render() {
    if ($('#ofToday')) initToday();
    if (!$('#ofFlat')) return;
    $('#ofFlat').innerHTML = flatLay();
    drawLooks(store.get('lookfor', 'm'));
    $$('[data-lookfor]').forEach(function (b) { b.addEventListener('click', function () { store.set('lookfor', b.getAttribute('data-lookfor')); drawLooks(b.getAttribute('data-lookfor')); }); });
    var card = function (x, ok) {
      var opt = x[0] === 'jeans' ? { denim: true } : null;
      return '<figure class="of-item ' + (ok ? 'ok' : 'no') + '"><div class="of-swatch">' + tile(x[0] === 'jeans' ? 'pants' : x[0], opt) + '<span class="of-mark" aria-hidden="true">' + (ok ? '✓' : '✕') + '</span></div>' +
        '<figcaption><strong>' + x[1] + '</strong><small>' + x[2] + '</small></figcaption></figure>';
    };
    $('#outfitDo').innerHTML = DO.map(function (x) { return card(x, true); }).join('');
    $('#outfitDont').innerHTML = DONT.map(function (x) { return card(x, false); }).join('');
    $$('[data-ico]').forEach(function (el) { el.insertAdjacentHTML('afterbegin', ico(el.getAttribute('data-ico'))); });
    drawCheck();
    $('#outfitReset').addEventListener('click', function () { store.set('outfitcheck', []); drawCheck(); });
    if (GL.reveal) GL.reveal($('main'), true);
  }
  function drawCheck() {
    var done = store.get('outfitcheck', []);
    $('#ofCount').innerHTML = '已準備 ' + done.length + ' / ' + ITEMS.length;
    $('#ofBar').style.width = (done.length / ITEMS.length * 100) + '%';
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
  }
  document.addEventListener('DOMContentLoaded', render);
})();
