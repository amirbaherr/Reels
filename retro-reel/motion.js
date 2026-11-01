'use strict';
/* Retro / synthwave motion graphic — deterministic renderer: renderAt(t) draws the frame at time t (seconds). */

const W = 1080, H = 1920, DUR = 48.53;
const cv = document.getElementById('c');
cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
const bctx = buf.getContext('2d');

const FA = '"Peyda"', VT = '"VT323"', PX = '"PS2P"';
const C = {
  pink: '#ff2e97', cyan: '#2de2e6', yel: '#ffd319', ora: '#ff8a1f', purp: '#a45cff',
  red: '#ff3355', white: '#fff4fb', green: '#3dff9a', dark: '#12052a', ink: '#0b0220',
};

/* ---------------- math / easing ---------------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const P = (t, a, d) => clamp((t - a) / d);
const E = {
  out: x => 1 - Math.pow(1 - x, 3),
  in: x => x * x * x,
  io: x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: x => { const c1 = 2.0, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  el: x => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const faSep = n => fa(Math.round(n).toLocaleString('en-US')).replace(/,/g, '٬');
const ZW = '\u200c';

/* visibility helper: pop in at a, fade/scale out ending at b */
function life(t, a, b, fi = 0.35, fo = 0.25) {
  if (t < a || t > b) return null;
  const i = E.back(P(t, a, fi));
  const o = 1 - E.in(P(t, b - fo, fo));
  return { i, o, a: clamp(P(t, a, fi * 0.5)) * o };
}

function withT(x, y, s, r, a, fn) {
  if (a <= 0.001 || s <= 0.001) return;
  ctx.save();
  ctx.translate(x, y);
  if (r) ctx.rotate(r);
  if (s !== 1) ctx.scale(s, s);
  ctx.globalAlpha *= clamp(a);
  fn();
  ctx.restore();
}

/* ---------------- text ---------------- */
function setFont(size, fam = FA) { ctx.font = `${size}px ${fam}`; }
function T(s, x, y, size, o = {}) {
  ctx.save();
  setFont(size, o.font || FA);
  ctx.textAlign = o.align || 'center';
  ctx.textBaseline = 'middle';
  ctx.direction = o.dir || 'rtl';
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.shadow) { ctx.fillStyle = o.shadow; ctx.fillText(s, x + (o.sx ?? 7), y + (o.sy ?? 7)); }
  if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.strokeW || 10; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur || 30; }
  ctx.fillStyle = o.color || C.white;
  ctx.fillText(s, x, y);
  ctx.restore();
}
function tw(s, size, fam = FA) { ctx.save(); setFont(size, fam); ctx.direction = 'rtl'; const w = ctx.measureText(s).width; ctx.restore(); return w; }

/* 80s chrome lettering with extrusion */
function chrome(s, x, y, size, o = {}) {
  ctx.save();
  setFont(size);
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
  ctx.lineJoin = 'round';
  const depth = Math.round(size / 14);
  for (let i = depth; i > 0; i--) {
    const k = i / depth;
    ctx.fillStyle = `rgb(${Math.round(60 + 140 * (1 - k))},${Math.round(10 + 20 * (1 - k))},${Math.round(90 + 60 * (1 - k))})`;
    ctx.fillText(s, x + i * 0.8, y + i * 1.1);
  }
  ctx.lineWidth = Math.max(4, size / 22); ctx.strokeStyle = '#1a0636';
  ctx.strokeText(s, x, y);
  const g = ctx.createLinearGradient(0, y - size * 0.45, 0, y + size * 0.45);
  const top = o.top || ['#ffffff', '#bdf3ff', '#38b6ff'];
  g.addColorStop(0, top[0]); g.addColorStop(0.3, top[1]); g.addColorStop(0.5, top[2]);
  g.addColorStop(0.52, '#2b0a4d'); g.addColorStop(0.6, '#ff4fb0'); g.addColorStop(0.85, '#ffc36b'); g.addColorStop(1, '#fff6c9');
  ctx.fillStyle = g;
  ctx.fillText(s, x, y);
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.strokeText(s, x, y);
  ctx.restore();
}

function neon(s, x, y, size, col, o = {}) {
  ctx.save();
  setFont(size, o.font || FA);
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle'; ctx.direction = o.dir || 'rtl';
  ctx.lineJoin = 'round';
  ctx.shadowColor = col; ctx.shadowBlur = o.blur || 40;
  ctx.lineWidth = o.lw || Math.max(5, size / 16); ctx.strokeStyle = col;
  ctx.strokeText(s, x, y);
  ctx.shadowBlur = 18;
  ctx.fillStyle = o.core || '#fff8fd';
  ctx.fillText(s, x, y);
  ctx.restore();
}

/* header text at the top of the frame */
function header(t, a, b, s, style = 'chrome', o = {}) {
  const L = life(t, a, b, 0.4, 0.22);
  if (!L) return;
  const y = o.y || 330, size = o.size || 120;
  const sc = lerp(0.4, 1, L.i);
  withT(540, y, sc, o.rot || 0, L.a, () => {
    if (style === 'chrome') chrome(s, 0, 0, size, o);
    else neon(s, 0, 0, size, style, o);
  });
}

/* ---------------- shapes ---------------- */
function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function glowStroke(col, lw, blur = 25) { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = blur; ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke(); ctx.restore(); }

function pix(map, pal, x, y, ps) {
  for (let r = 0; r < map.length; r++) {
    const row = map[r];
    for (let c = 0; c < row.length; c++) {
      const col = pal[row[c]];
      if (col) { ctx.fillStyle = col; ctx.fillRect(Math.round(x + c * ps), Math.round(y + r * ps), Math.ceil(ps), Math.ceil(ps)); }
    }
  }
}
function pixC(map, pal, cx, cy, ps) { pix(map, pal, cx - map[0].length * ps / 2, cy - map.length * ps / 2, ps); }

const ROCKET = [
  '.....W.....',
  '....WWW....',
  '...WWWWW...',
  '...WPPPW...',
  '...WPCPW...',
  '...WPPPW...',
  '...WWWWW...',
  '...WWWWW...',
  '..RWWWWWR..',
  '.RRWWWWWRR.',
  'RRRWWWWWRRR',
  'RR.WWWWW.RR',
  'R...GGG...R',
];
const FLAME = ['...OYO...', '...OYO...', '....O....'];
const FLAME2 = ['..OOYOO..', '...OYO...', '...OYO...', '....O....'];
const BRAIN = [
  '....PPPP.PPPP...',
  '..PPpPPPPPPpPP..',
  '.PPPPPpPPpPPPPP.',
  'PPpPPPPPPPPPPpPP',
  'PPPPpPPpPPpPPPPP',
  'PpPPPPPPPPPPPPpP',
  'PPPPpPPPPPPpPPPP',
  '.PPPPPpPPpPPPPP.',
  '..PPPPPPPPPPPP..',
  '....PPPP.PPPP...',
  '.......PP.......',
  '.......PP.......',
];
const CURSOR = [
  'K...........',
  'KK..........',
  'KWK.........',
  'KWWK........',
  'KWWWK.......',
  'KWWWWK......',
  'KWWWWWK.....',
  'KWWWWWWK....',
  'KWWWWWWWK...',
  'KWWWWWKKKK..',
  'KWWKWWK.....',
  'KWK.KWWK....',
  'KK..KWWK....',
  'K....KWWK...',
  '.....KWWK...',
  '......KK....',
];

function star5(cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r;
    ctx.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2);
  }
  ctx.closePath();
}
function heartPath(cx, cy, s) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.35);
  ctx.bezierCurveTo(cx - s * 0.9, cy - s * 0.25, cx - s * 0.45, cy - s * 0.95, cx, cy - s * 0.4);
  ctx.bezierCurveTo(cx + s * 0.45, cy - s * 0.95, cx + s * 0.9, cy - s * 0.25, cx, cy + s * 0.35);
  ctx.closePath();
}
function eyeIcon(cx, cy, s, col) {
  ctx.save();
  ctx.beginPath(); ctx.moveTo(cx - s, cy); ctx.quadraticCurveTo(cx, cy - s * 0.9, cx + s, cy); ctx.quadraticCurveTo(cx, cy + s * 0.9, cx - s, cy);
  ctx.lineWidth = s * 0.14; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 15; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.3, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
  ctx.restore();
}
function personIcon(cx, cy, s, col) {
  ctx.save(); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 15;
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.35, s * 0.32, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.55, s * 0.62, s * 0.5, 0, Math.PI, 0); ctx.fill();
  ctx.restore();
}
function magnifier(cx, cy, s, col) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.18; ctx.lineCap = 'round'; ctx.shadowColor = col; ctx.shadowBlur = 15;
  ctx.beginPath(); ctx.arc(cx - s * 0.12, cy - s * 0.12, s * 0.45, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + s * 0.22, cy + s * 0.22); ctx.lineTo(cx + s * 0.62, cy + s * 0.62); ctx.stroke();
  ctx.restore();
}
function globeIcon(cx, cy, s, col, t) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.09; ctx.shadowColor = col; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(cx, cy, s, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const ph = ((t * 0.6 + i / 3) % 1) * Math.PI;
    const rx = Math.abs(Math.cos(ph)) * s;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx + 0.1, s, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.5, s * 0.86, s * 0.12, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.5, s * 0.86, s * 0.12, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
function checkBadge(cx, cy, r, col = C.green) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 20; ctx.fill();
  ctx.shadowBlur = 0; ctx.lineWidth = r * 0.22; ctx.strokeStyle = C.ink; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(cx - r * 0.45, cy + r * 0.02); ctx.lineTo(cx - r * 0.1, cy + r * 0.38); ctx.lineTo(cx + r * 0.5, cy - r * 0.35); ctx.stroke();
  ctx.restore();
}
function face(cx, cy, r, skin, mood, blink = false) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = skin; ctx.fill();
  ctx.lineWidth = r * 0.08; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.fillStyle = C.ink;
  const ey = cy - r * 0.18, ex = r * 0.36, es = r * 0.17;
  if (blink) { ctx.fillRect(cx - ex - es, ey, es * 2, es * 0.5); ctx.fillRect(cx + ex - es, ey, es * 2, es * 0.5); }
  else { ctx.fillRect(cx - ex - es / 2, ey - es, es, es * 1.6); ctx.fillRect(cx + ex - es / 2, ey - es, es, es * 1.6); }
  ctx.beginPath(); ctx.lineWidth = r * 0.12; ctx.lineCap = 'round';
  if (mood < 0) ctx.arc(cx, cy + r * 0.62, r * 0.36, Math.PI * 1.15, Math.PI * 1.85);
  else if (mood > 0) ctx.arc(cx, cy + r * 0.1, r * 0.42, Math.PI * 0.15, Math.PI * 0.85);
  else { ctx.moveTo(cx - r * 0.3, cy + r * 0.4); ctx.lineTo(cx + r * 0.3, cy + r * 0.4); }
  ctx.stroke();
  if (mood < 0) { // tear
    ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.ellipse(cx + ex + es * 0.2, ey + r * 0.32, r * 0.08, r * 0.13, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function gem(cx, cy, s, t) {
  ctx.save();
  const pts = [[-1, -0.35], [-0.55, -0.85], [0.55, -0.85], [1, -0.35], [0, 1]];
  ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, cx + a * s, cy + b * s)); ctx.closePath();
  const g = ctx.createLinearGradient(cx - s, cy - s, cx + s, cy + s);
  g.addColorStop(0, '#bdf3ff'); g.addColorStop(0.5, C.cyan); g.addColorStop(1, C.purp);
  ctx.fillStyle = g; ctx.shadowColor = C.cyan; ctx.shadowBlur = 40; ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s * 0.35); ctx.lineTo(cx + s, cy - s * 0.35);
  ctx.moveTo(cx - s * 0.55, cy - s * 0.85); ctx.lineTo(cx - s * 0.25, cy - s * 0.35); ctx.lineTo(cx, cy + s);
  ctx.moveTo(cx + s * 0.55, cy - s * 0.85); ctx.lineTo(cx + s * 0.25, cy - s * 0.35); ctx.lineTo(cx, cy + s);
  ctx.moveTo(cx - s * 0.25, cy - s * 0.35); ctx.lineTo(cx, cy - s * 0.85); ctx.lineTo(cx + s * 0.25, cy - s * 0.35);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2.5; ctx.stroke();
  // sparkle
  const sp = 0.5 + 0.5 * Math.sin(t * 6);
  ctx.fillStyle = '#fff'; ctx.globalAlpha *= sp;
  star5(cx - s * 0.45, cy - s * 0.5, s * 0.18); ctx.fill();
  ctx.restore();
}
function trashBin(cx, cy, s, lid) {
  ctx.save();
  ctx.strokeStyle = C.cyan; ctx.lineWidth = 6; ctx.shadowColor = C.cyan; ctx.shadowBlur = 20; ctx.fillStyle = 'rgba(20,8,40,0.9)';
  ctx.beginPath(); ctx.moveTo(cx - s * 0.42, cy - s * 0.3); ctx.lineTo(cx + s * 0.42, cy - s * 0.3); ctx.lineTo(cx + s * 0.34, cy + s * 0.55); ctx.lineTo(cx - s * 0.34, cy + s * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(cx + i * s * 0.17, cy - s * 0.15); ctx.lineTo(cx + i * s * 0.14, cy + s * 0.42); ctx.stroke(); }
  ctx.save(); ctx.translate(cx - s * 0.48, cy - s * 0.38); ctx.rotate(-lid);
  ctx.fillRect(0, -s * 0.08, s * 0.96, s * 0.1); ctx.strokeRect(0, -s * 0.08, s * 0.96, s * 0.1);
  ctx.strokeRect(s * 0.36, -s * 0.18, s * 0.24, s * 0.1);
  ctx.restore();
  ctx.restore();
}
function hookShape(cx, cy, s, col) {
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#e8e8ff'; ctx.lineWidth = s * 0.12; ctx.shadowColor = col; ctx.shadowBlur = 25;
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.95, s * 0.12, 0, Math.PI * 2); ctx.stroke(); // eye
  ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.83); ctx.lineTo(cx, cy + s * 0.3);
  ctx.arc(cx - s * 0.32, cy + s * 0.3, s * 0.32, 0, Math.PI, false);
  ctx.lineTo(cx - s * 0.64, cy + s * 0.02); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - s * 0.64, cy + s * 0.0); ctx.lineTo(cx - s * 0.5, cy + s * 0.14); ctx.stroke(); // barb
  ctx.restore();
}

/* retro window chrome */
function win(x, y, w, h, title, col, o = {}) {
  const th = o.th || 74;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x + 16, y + 16, w, h);
  ctx.fillStyle = o.body || 'rgba(18,6,40,0.94)'; ctx.fillRect(x, y, w, h);
  // body inner grid texture
  ctx.globalAlpha *= 0.07; ctx.strokeStyle = col; ctx.lineWidth = 1;
  for (let gx = x + 30; gx < x + w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, y + th); ctx.lineTo(gx, y + h); ctx.stroke(); }
  for (let gy = y + th + 30; gy < y + h; gy += 40) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke(); }
  ctx.restore();
  ctx.save();
  ctx.shadowColor = col; ctx.shadowBlur = 30; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, h);
  ctx.restore();
  // title bar
  ctx.save();
  const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, col); g.addColorStop(1, o.col2 || col);
  ctx.fillStyle = g; ctx.fillRect(x, y, w, th);
  setFont(o.ts || 40); ctx.direction = /[A-Za-z]/.test(title) ? 'ltr' : 'rtl'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  const tWidth = ctx.measureText(title).width;
  ctx.fillStyle = C.dark; ctx.fillText(title, x + w - 26, y + th / 2 + 3);
  // stripes
  ctx.fillStyle = 'rgba(18,5,42,0.35)';
  const sx0 = x + 190, sx1 = x + w - 50 - tWidth;
  if (sx1 > sx0) for (let i = 0; i < 5; i++) ctx.fillRect(sx0, y + 15 + i * 10, sx1 - sx0, 4);
  // buttons
  const b = 42, by = y + (th - b) / 2;
  ['x', 'o', '_'].forEach((k, i) => {
    const bx = x + 18 + i * (b + 12);
    ctx.fillStyle = '#fff3fb'; ctx.fillRect(bx, by, b, b);
    ctx.strokeStyle = C.dark; ctx.lineWidth = 4; ctx.strokeRect(bx, by, b, b);
    ctx.beginPath(); ctx.lineWidth = 5;
    if (k === 'x') { ctx.moveTo(bx + 12, by + 12); ctx.lineTo(bx + b - 12, by + b - 12); ctx.moveTo(bx + b - 12, by + 12); ctx.lineTo(bx + 12, by + b - 12); }
    if (k === 'o') { ctx.rect(bx + 11, by + 11, b - 22, b - 22); }
    if (k === '_') { ctx.moveTo(bx + 11, by + b - 13); ctx.lineTo(bx + b - 11, by + b - 13); }
    ctx.stroke();
  });
  ctx.restore();
  return { x, y: y + th, w, h: h - th };
}

/* ---------------- background ---------------- */
const STARS = Array.from({ length: 170 }, (_, i) => ({ x: rnd(i * 3.1) * W, y: rnd(i * 7.7 + 1) * 1150, s: 1 + rnd(i * 1.3 + 2) * 3, p: rnd(i * 5.9) * 6.28 }));
const sunCv = document.createElement('canvas'); sunCv.width = 760; sunCv.height = 760;
const sctx = sunCv.getContext('2d');
const HOR = 1235;

const MOUNT = (() => {
  const pts = []; let x = -40;
  let i = 0;
  while (x < W + 80) { pts.push([x, 60 + rnd(i * 4.3) * 170]); x += 50 + rnd(i * 9.1) * 70; i++; }
  return pts;
})();

function drawBG(t, st) {
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, HOR);
  g.addColorStop(0, '#07011a'); g.addColorStop(0.45, '#1c0640'); g.addColorStop(0.8, '#4a0f63'); g.addColorStop(1, '#8a1a6e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, HOR);
  // stars
  for (const s of STARS) {
    const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 2.2 + s.p));
    ctx.globalAlpha = a * (1 - s.y / 1300);
    ctx.fillStyle = '#fff';
    ctx.fillRect(s.x, s.y, s.s, s.s);
  }
  ctx.globalAlpha = 1;
  // sun
  const R = 330 * st.sunScale;
  sctx.clearRect(0, 0, 760, 760);
  const sg = sctx.createLinearGradient(0, 380 - R, 0, 380 + R);
  sg.addColorStop(0, '#fff27a'); sg.addColorStop(0.35, '#ffb12b'); sg.addColorStop(0.7, '#ff3d7f'); sg.addColorStop(1, '#c4007a');
  sctx.globalCompositeOperation = 'source-over';
  sctx.fillStyle = sg; sctx.beginPath(); sctx.arc(380, 380, R, 0, Math.PI * 2); sctx.fill();
  sctx.globalCompositeOperation = 'destination-out';
  const ph = (t * 18) % 34;
  for (let k = 0; k < 14; k++) {
    const yy = 380 - R * 0.05 + k * 34 - ph;
    const hh = 3 + (yy - (380 - R * 0.1)) / R * 16;
    if (yy > 380 - R * 0.1) sctx.fillRect(0, yy, 760, Math.max(0, hh));
  }
  sctx.globalCompositeOperation = 'source-over';
  const sunCY = HOR - 140 * st.sunScale + st.sunLift;
  ctx.save();
  ctx.beginPath(); ctx.rect(0, 0, W, HOR); ctx.clip();
  ctx.globalAlpha = st.sunAlpha;
  ctx.shadowColor = '#ff3d9a'; ctx.shadowBlur = 90;
  ctx.drawImage(sunCv, 540 - 380, sunCY - 380);
  ctx.restore();
  // mountains
  ctx.save();
  ctx.beginPath(); ctx.moveTo(-50, HOR);
  for (const [x, h] of MOUNT) ctx.lineTo(x, HOR - h * 0.75);
  ctx.lineTo(W + 50, HOR); ctx.closePath();
  const mg = ctx.createLinearGradient(0, HOR - 200, 0, HOR); mg.addColorStop(0, '#2a0a52'); mg.addColorStop(1, '#0d0322');
  ctx.fillStyle = mg; ctx.fill();
  ctx.strokeStyle = 'rgba(45,226,230,0.55)'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
  // floor
  const fg = ctx.createLinearGradient(0, HOR, 0, H);
  fg.addColorStop(0, '#2b0638'); fg.addColorStop(1, '#090014');
  ctx.fillStyle = fg; ctx.fillRect(0, HOR, W, H - HOR);
  // grid
  ctx.save();
  ctx.beginPath(); ctx.rect(0, HOR, W, H - HOR); ctx.clip();
  const speed = st.gridSpeed;
  const frac = (t * speed) % 1;
  const lines = [];
  for (let i = 0; i < 26; i++) {
    const z = 0.32 + i - frac;
    if (z <= 0.05) continue;
    lines.push(HOR + 280 / z);
  }
  const drawGrid = (lw, alpha, col) => {
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.globalAlpha = alpha;
    ctx.beginPath();
    for (const y of lines) { if (y > H + 10) continue; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    for (let k = -22; k <= 22; k++) { ctx.moveTo(540 + k * 26, HOR); ctx.lineTo(540 + k * 380, H + 900); }
    ctx.stroke();
  };
  drawGrid(9, 0.18, '#ff2e97');
  drawGrid(3, 0.95, '#ff4fb0');
  ctx.globalAlpha = 1;
  ctx.restore();
  // horizon glow
  const hg = ctx.createLinearGradient(0, HOR - 60, 0, HOR + 120);
  hg.addColorStop(0, 'rgba(255,60,160,0)'); hg.addColorStop(0.35, 'rgba(255,90,180,0.55)'); hg.addColorStop(1, 'rgba(255,60,160,0)');
  ctx.fillStyle = hg; ctx.fillRect(0, HOR - 60, W, 180);
  // dim for readability
  if (st.dim > 0) { ctx.fillStyle = `rgba(6,0,18,${st.dim})`; ctx.fillRect(0, 0, W, H); }
}

/* ---------------- post effects ---------------- */
const scan = document.createElement('canvas'); scan.width = W; scan.height = H;
(() => {
  const s = scan.getContext('2d');
  s.fillStyle = 'rgba(0,0,0,0.22)';
  for (let y = 0; y < H; y += 4) s.fillRect(0, y, W, 2);
  const v = s.createRadialGradient(540, 960, 500, 540, 960, 1250);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)');
  s.fillStyle = v; s.fillRect(0, 0, W, H);
})();
const noiseCv = document.createElement('canvas'); noiseCv.width = 216; noiseCv.height = 384;
const nctx = noiseCv.getContext('2d');
const nimg = nctx.createImageData(216, 384);
function staticNoise(seed, alpha) {
  let s = seed * 9301 + 49297;
  for (let i = 0; i < nimg.data.length; i += 4) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const v = s & 255;
    nimg.data[i] = v; nimg.data[i + 1] = v; nimg.data[i + 2] = v; nimg.data[i + 3] = 255;
  }
  nctx.putImageData(nimg, 0, 0);
  ctx.save(); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(noiseCv, 0, 0, W, H); ctx.restore();
}

const GLITCH = [0.0, 2.0, 5.02, 7.4, 9.18, 12.08, 16.66, 19.5, 21.86, 25.9, 29.02, 31.48, 37.4, 39.25, 42.36, 46.6];
const SHAKES = [[3.22, 26], [5.02, 14], [16.66, 30], [17.42, 12], [18.92, 16], [34.7, 10], [35.18, 10], [36.56, 16], [39.15, 12], [45.3, 14]];

function glitchAmt(t) {
  let a = 0;
  for (const g of GLITCH) { const d = t - g + 0.06; if (d >= 0 && d < 0.3) a = Math.max(a, 1 - d / 0.3); }
  return a;
}
function shake(t) {
  let a = 0;
  for (const [s, m] of SHAKES) { const d = t - s; if (d >= 0 && d < 0.45) a = Math.max(a, m * Math.pow(1 - d / 0.45, 2)); }
  return a;
}

function applyGlitch(amt, seed) {
  if (amt <= 0.02) return;
  bctx.clearRect(0, 0, W, H); bctx.drawImage(cv, 0, 0);
  const n = Math.round(4 + amt * 14);
  for (let i = 0; i < n; i++) {
    const y = rnd(seed + i * 3.7) * H, h = 8 + rnd(seed + i * 1.9) * 90 * amt;
    const dx = (rnd(seed + i * 5.3) - 0.5) * 160 * amt;
    ctx.drawImage(buf, 0, y, W, h, dx, y, W, h);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28 * amt;
  ctx.drawImage(buf, 18 * amt, 0);
  ctx.restore();
  for (let i = 0; i < 5 * amt; i++) {
    ctx.fillStyle = [C.pink, C.cyan, C.yel][i % 3];
    ctx.globalAlpha = 0.35 * amt;
    ctx.fillRect(rnd(seed * 2 + i) * W, rnd(seed * 3 + i) * H, 60 + rnd(seed + i * 7) * 300, 6 + rnd(i + seed) * 20);
  }
  ctx.globalAlpha = 1;
}

function trackingBand(t, seed) {
  const y = ((t * 140) % (H + 400)) - 200;
  bctx.clearRect(0, 0, W, H); bctx.drawImage(cv, 0, 0);
  for (let k = 0; k < 6; k++) {
    const yy = y + k * 9, dx = (rnd(seed + k) - 0.5) * 14;
    ctx.drawImage(buf, 0, yy, W, 9, dx, yy, W, 9);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, y, W, 54);
}

/* ---------------- HUD ---------------- */
function hud(t) {
  ctx.save();
  const stop = t > 47.9;
  const blink = Math.floor(t * 1.6) % 2 === 0;
  ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
  setFont(70, VT);
  ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 0; ctx.shadowOffsetX = 4; ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  if (stop) ctx.fillText('STOP ■', 60, 110);
  else if (blink || t < 0.8) ctx.fillText('PLAY ►', 60, 110);
  setFont(54, VT);
  ctx.fillText('SP', 60, 175);
  ctx.textAlign = 'right';
  const tt = Math.min(t, 48.5), f = Math.floor((tt % 1) * 30);
  const tc = `${Math.floor(tt / 60)}:${String(Math.floor(tt % 60)).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  setFont(70, VT); ctx.fillText(tc, W - 60, 110);
  setFont(54, VT); ctx.fillText('NOV. 01 1986', W - 60, 175);
  ctx.restore();
}

/* ---------------- subtitles (karaoke) ---------------- */
const SUBS = [
  ['هیچی اندازه\u200cی پستی که فکر می\u200cکردی', [0.76, 1.48, 2.0, 2.36, 2.4, 2.68], 3.15],
  ['می\u200cترکونه و میره اکسپلور', [3.22, 3.84, 3.9, 4.26], 4.98],
  ['ولی ۲۰۰ تا ویو بیشتر نمی\u200cخوره،', [5.02, 5.3, 5.76, 6.22, 6.4, 6.78], 7.35],
  ['شخصیتت رو نمی\u200cسازه!', [7.4, 8.18, 8.28], 9.12],
  ['این موقعیت رو قطعاً هممون تجربه کردیم', [9.18, 9.5, 9.94, 10.1, 10.68, 11.1, 11.68], 12.04],
  ['یه پستی که فکر می\u200cکردیم خیلی خوبه', [12.08, 12.26, 12.62, 12.7, 12.96, 13.52, 13.94], 14.2],
  ['و قراره کلی ویو و فالوور بیاره', [14.24, 14.32, 14.66, 15.22, 15.4, 15.5, 16.0], 16.62],
  ['بدترین بازخورد ممکن رو بهمون داده', [16.66, 17.42, 17.94, 18.34, 18.52, 18.92], 19.5],
  ['باید بگم توی این نسل اینستاگرام', [19.66, 19.96, 20.2, 20.5, 20.7, 21.06], 21.84],
  ['شما علاوه بر حفظ کیفیت مغز محتوا', [21.88, 22.16, 22.62, 22.8, 23.2, 23.84, 24.2], 24.96],
  ['باید بیشتر تمرکزتون رو روی تعداد محتوا بذارید', [25.0, 25.46, 25.96, 26.84, 27.02, 27.26, 27.76, 28.24], 28.98],
  ['یعنی اگر یه ریلز درست می\u200cکنید', [29.02, 29.28, 29.62, 29.98, 30.32, 30.74], 31.26],
  ['با ۳ تا قلاب مختلف درستش کنید', [31.3, 31.48, 31.62, 31.76, 32.34, 32.9, 33.52], 33.98],
  ['و دو تاش رو تریال پست کنید', [34.02, 34.22, 34.38, 34.54, 34.7, 35.18, 35.46], 35.86],
  ['و یکیش رو عمومی', [35.9, 36.04, 36.4, 36.56], 37.36],
  ['کمال\u200cگرایی رو کنار بذارید', [37.4, 38.32, 38.46, 38.88], 39.26],
  ['تا بتونید تعداد محتواهاتون رو افزایش بدید', [39.3, 39.48, 39.9, 40.46, 41.2, 41.36, 41.92], 42.32],
  ['الان تمرکز اینستاگرام روی', [42.36, 42.88, 43.5, 44.3], 44.62],
  ['واچ\u200cتایم کلی پیجه!', [44.66, 45.3, 45.86], 46.9],
];

function drawSubs(t) {
  const sub = SUBS.find(s => t >= s[1][0] - 0.12 && t <= s[2] + 0.04);
  if (!sub) return;
  const [text, times, end] = sub;
  const words = text.split(' ');
  const size = 64, space = 20, maxW = 940;
  const ws = words.map(w => tw(w, size));
  // line breaking (balanced, max 2 lines)
  const total = ws.reduce((a, b) => a + b, 0) + space * (words.length - 1);
  let lines = [words.map((_, i) => i)];
  if (total > maxW) {
    let best = 1, bestV = 1e9;
    for (let k = 1; k < words.length; k++) {
      const a = ws.slice(0, k).reduce((x, y) => x + y, 0) + space * (k - 1);
      const b = total - a - space;
      if (Math.max(a, b) < bestV) { bestV = Math.max(a, b); best = k; }
    }
    lines = [words.slice(0, best).map((_, i) => i), words.slice(best).map((_, i) => i + best)];
  }
  const lh = 92, cy = 1500, top = cy - (lines.length - 1) * lh / 2;
  const inA = E.out(P(t, times[0] - 0.12, 0.18)), outA = 1 - P(t, end - 0.08, 0.12);
  const alpha = Math.min(inA, outA);
  const boxW = Math.max(...lines.map(l => l.reduce((s, i) => s + ws[i], 0) + space * (l.length - 1))) + 80;
  const boxH = lines.length * lh + 40;
  ctx.save();
  ctx.globalAlpha = alpha;
  const by = top - lh / 2 - 20 + (1 - inA) * 30;
  ctx.fillStyle = C.cyan; ctx.fillRect(540 - boxW / 2 + 10, by + 10, boxW, boxH);
  ctx.fillStyle = 'rgba(14,4,34,0.92)'; ctx.fillRect(540 - boxW / 2, by, boxW, boxH);
  ctx.strokeStyle = C.pink; ctx.lineWidth = 5; ctx.strokeRect(540 - boxW / 2, by, boxW, boxH);
  lines.forEach((l, li) => {
    const lineW = l.reduce((s, i) => s + ws[i], 0) + space * (l.length - 1);
    let x = 540 + lineW / 2;
    const y = top + li * lh + (1 - inA) * 30;
    l.forEach(i => {
      const st = times[i], nx = i + 1 < times.length ? times[i + 1] : end;
      const active = t >= st && t < nx, done = t >= nx;
      const pop = active ? 1 + 0.14 * (1 - E.out(P(t, st, 0.18))) : 1;
      const cx = x - ws[i] / 2;
      ctx.save(); ctx.translate(cx, y); ctx.scale(pop, pop);
      setFont(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
      if (active) {
        ctx.fillStyle = C.pink; ctx.fillRect(-ws[i] / 2 - 6, size * 0.42, ws[i] + 12, 7);
        ctx.shadowColor = C.yel; ctx.shadowBlur = 22; ctx.fillStyle = C.yel;
      } else ctx.fillStyle = done ? '#ffffff' : 'rgba(255,255,255,0.38)';
      ctx.fillText(words[i], 0, 0);
      ctx.restore();
      x -= ws[i] + space;
    });
  });
  ctx.restore();
}

/* ============================================================
   SCENES
   ============================================================ */
function particles(t, t0, cx, cy, n, spd, cols, seed, size = 14, grav = 900) {
  const d = t - t0; if (d < 0 || d > 1.4) return;
  for (let i = 0; i < n; i++) {
    const a = rnd(seed + i) * Math.PI * 2, v = spd * (0.4 + rnd(seed + i * 2.3) * 0.8);
    const x = cx + Math.cos(a) * v * d, y = cy + Math.sin(a) * v * d + 0.5 * grav * d * d;
    ctx.globalAlpha = clamp(1 - d / 1.4);
    ctx.fillStyle = cols[i % cols.length];
    const s = size * (0.6 + rnd(seed + i * 4.1));
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
}
function starburst(cx, cy, r, t, col1, col2, n = 16) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.6);
  for (let i = 0; i < n; i++) {
    const a0 = i * Math.PI * 2 / n, a1 = a0 + Math.PI / n;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0, a1); ctx.closePath();
    ctx.fillStyle = i % 2 ? col1 : col2; ctx.fill();
  }
  ctx.restore();
}
function spikyBurst(cx, cy, r, col, rot) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 28; i++) { const a = i * Math.PI / 14, rr2 = i % 2 ? r * 0.72 : r; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 40; ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = C.dark; ctx.shadowBlur = 0; ctx.stroke();
  ctx.restore();
}
function stamp(s, cx, cy, size, col, t0, t, rot = -0.2) {
  if (t < t0) return;
  const k = P(t, t0, 0.22);
  const sc = lerp(2.6, 1, E.out(k));
  withT(cx, cy, sc, rot, k * 1.4, () => {
    const w = tw(s, size) + 60, h = size * 1.35;
    ctx.save();
    ctx.lineWidth = 9; ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 25;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.lineWidth = 3; ctx.strokeRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24);
    ctx.fillStyle = 'rgba(10,2,25,0.8)'; ctx.fillRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24);
    ctx.restore();
    T(s, 0, 2, size, { color: col, glow: col, blur: 20 });
  });
}
function pill(s, cx, cy, size, col, o = {}) {
  const w = tw(s, size) + (o.icon ? size * 1.6 : 0) + 70, h = size * 1.5;
  ctx.save();
  ctx.fillStyle = C.ink; rr(cx - w / 2 + 8, cy - h / 2 + 8, w, h, h / 2); ctx.fill();
  rr(cx - w / 2, cy - h / 2, w, h, h / 2); ctx.fillStyle = o.fill || 'rgba(18,6,40,0.95)'; ctx.fill();
  glowStroke(col, 5, 22);
  ctx.restore();
  const tx = o.icon ? cx + size * 0.75 : cx;
  T(s, tx, cy + 3, size, { color: o.tcol || col });
  if (o.icon) o.icon(cx - w / 2 + size * 1.1, cy, size * 0.62);
}

/* ---------- Scene 1 : 0 – 9.2 ---------- */
function scene1(t) {
  if (t > 9.35) return;
  // A — headline
  const k = E.io(P(t, 1.92, 0.42));
  const outA = 1 - P(t, 3.65, 0.3);
  if (t > 0.76 && outA > 0) {
    const pin = E.back(P(t, 0.76, 0.38));
    withT(540, lerp(640, 300, k), pin * lerp(1, 0.55, k), lerp(-0.06, 0, pin), outA, () => chrome('هیچی', 0, 0, 250));
    if (t > 1.48) {
      const p2 = E.back(P(t, 1.48, 0.32));
      withT(540, lerp(870, 418, k), p2 * lerp(1, 0.62, k), 0, outA, () => neon('اندازه' + ZW + 'ی', 0, 0, 140, C.pink));
    }
  }
  // B — post window
  if (t > 1.95 && t < 5.4) {
    const enter = E.back(P(t, 1.98, 0.5));
    const fall = E.in(P(t, 5.04, 0.32));
    const wx = 170, wy = 560 + (1 - enter) * 1300 + fall * 1400;
    const rot = fall * 0.25;
    const boom = P(t, 3.22, 0.5);
    withT(540, wy + 360, 1 + (t > 3.22 && t < 3.6 ? 0.05 * Math.sin((t - 3.22) * 60) * (1 - boom) : 0), rot, 1, () => {
      // starburst behind
      if (t > 3.18 && t < 4.2) {
        const sb = E.back(P(t, 3.2, 0.3)) * (1 - P(t, 3.9, 0.3));
        withT(0, -60, sb, 0, sb, () => starburst(0, 0, 820, t, 'rgba(255,211,25,0.28)', 'rgba(255,46,151,0.18)', 22));
      }
      const b = win(-370, -360, 740, 720, 'پست_جدید.jpg', C.cyan, { col2: C.pink });
      // pixel image
      const ix = b.x + 30, iy = b.y + 30, iw = b.w - 60, ih = 400;
      ctx.save();
      ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
      const ig = ctx.createLinearGradient(0, iy, 0, iy + ih); ig.addColorStop(0, '#1b0b5a'); ig.addColorStop(0.6, '#ff4fa0'); ig.addColorStop(1, '#ffb347');
      ctx.fillStyle = ig; ctx.fillRect(ix, iy, iw, ih);
      ctx.fillStyle = '#ffe66d'; ctx.beginPath(); ctx.arc(ix + iw / 2, iy + ih * 0.62, 110, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#ff4fa0';
      for (let s = 0; s < 4; s++) ctx.fillRect(ix, iy + ih * 0.62 - 20 - s * 26, iw, 5 + s);
      ctx.fillStyle = '#16052e'; ctx.fillRect(ix, iy + ih * 0.62, iw, ih);
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
      for (let g = 0; g < 7; g++) { const y = iy + ih * 0.62 + Math.pow(g / 6, 2) * 160 + ((t * 30) % 10); ctx.beginPath(); ctx.moveTo(ix, y); ctx.lineTo(ix + iw, y); ctx.stroke(); }
      for (let g = -8; g <= 8; g++) { ctx.beginPath(); ctx.moveTo(ix + iw / 2 + g * 12, iy + ih * 0.62); ctx.lineTo(ix + iw / 2 + g * 70, iy + ih); ctx.stroke(); }
      // play triangle
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.moveTo(ix + iw / 2 - 30, iy + 110); ctx.lineTo(ix + iw / 2 + 40, iy + 150); ctx.lineTo(ix + iw / 2 - 30, iy + 190); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(ix, iy, iw, ih);
      // stats row
      const ry = iy + ih + 70;
      ctx.save(); heartPath(ix + 50, ry + 4, 48); ctx.fillStyle = C.pink; ctx.shadowColor = C.pink; ctx.shadowBlur = 20; ctx.fill(); ctx.restore();
      eyeIcon(ix + 150, ry, 34, C.cyan);
      T('۰', ix + 230, ry + 2, 56, { color: C.cyan });
      T('#اکسپلور', ix + iw, ry + 4, 52, { color: C.yel, align: 'right' });
      T('کپشن: این یکی قطعاً می\u200cترکونه...', ix + iw, ry + 90, 40, { color: 'rgba(255,255,255,0.75)', align: 'right' });
      // sparkles while "thinking"
      if (t > 2.4 && t < 3.25) for (let s = 0; s < 6; s++) {
        const sp = 0.5 + 0.5 * Math.sin(t * 9 + s * 2);
        ctx.save(); ctx.globalAlpha = sp; ctx.fillStyle = s % 2 ? C.yel : '#fff';
        star5(ix + 60 + rnd(s * 3) * (iw - 120), iy + 40 + rnd(s * 7) * 300, 14 + sp * 10); ctx.fill(); ctx.restore();
      }
      // boom stamp
      if (t > 3.22 && t < 4.15) {
        const sk = E.back(P(t, 3.22, 0.3)) * (1 - P(t, 3.9, 0.25));
        withT(0, -150, sk, -0.12, sk, () => {
          spikyBurst(0, 0, 330, C.yel, t * 0.8);
          chrome('می\u200cترکونه!', 0, 0, 120);
        });
      }
    });
    particles(t, 3.22, 540, 760, 60, 1300, [C.yel, C.pink, C.cyan, '#fff'], 11, 18, 1200);
  }
  // explore badge + rocket
  if (t >= 3.88 && t <= 5.9) {
    const L = life(t, 3.88, 5.9, 0.4, 0.4);
    const failed = t > 5.02;
    const shakeX = failed && t < 5.4 ? Math.sin(t * 80) * 10 * (1 - P(t, 5.02, 0.38)) : 0;
    withT(540 + shakeX, 300, lerp(0.3, 1, L.i), 0, L.a, () => {
      const col = failed ? '#777089' : C.yel;
      pill('اکسپلور', 0, 0, 78, col, { icon: (x, y, s) => magnifier(x, y, s, col) });
      if (failed) {
        const xk = E.back(P(t, 5.05, 0.25));
        withT(220, -50, xk, 0, xk, () => {
          ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fillStyle = C.red; ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-17, -17); ctx.lineTo(17, 17); ctx.moveTo(17, -17); ctx.lineTo(-17, 17); ctx.stroke();
        });
      }
    });
  }
  if (t > 3.95 && t < 6.2) {
    let rx = 540, ry, rot = 0, flame = true;
    if (t < 5.02) {
      const k2 = E.out(P(t, 3.95, 1.05));
      ry = lerp(620, 470, k2);
      rx += Math.sin(t * 40) * 3;
    } else {
      const d = t - 5.02;
      ry = 470 - 140 * d + 0.5 * 3600 * d * d;
      rx = 540 + 260 * d;
      rot = d * 5;
      flame = false;
    }
    // trail
    if (t < 5.02) for (let i = 0; i < 16; i++) {
      const d = i * 0.035; const tt = t - d; if (tt < 3.95) continue;
      const yy = lerp(620, 470, E.out(P(tt, 3.95, 1.05))) + 70;
      ctx.globalAlpha = 0.6 * (1 - i / 16); ctx.fillStyle = i % 2 ? C.ora : C.yel;
      const s = 18 - i * 0.7; ctx.fillRect(rx - s / 2 + (rnd(i + Math.floor(t * 30)) - 0.5) * 20, yy + i * 12, s, s);
    }
    ctx.globalAlpha = 1;
    withT(rx, ry, 1, rot, 1, () => {
      ctx.save(); ctx.shadowColor = C.pink; ctx.shadowBlur = 30;
      pixC(ROCKET, { W: '#f4f0ff', P: C.purp, C: C.cyan, R: C.pink, G: '#888' }, 0, 0, 11);
      if (flame) pixC(Math.floor(t * 20) % 2 ? FLAME : FLAME2, { O: C.ora, Y: C.yel }, 0, 98, 11);
      else { ctx.fillStyle = 'rgba(200,200,200,0.6)'; ctx.fillRect(-10, 70, 8, 8); ctx.fillRect(4, 84, 10, 10); }
      ctx.restore();
    });
  }
  // C — view counter
  if (t >= 5.32 && t <= 7.65) {
    const L = life(t, 5.32, 7.65, 0.45, 0.3);
    withT(540, 830, lerp(0.2, 1, L.i), 0, L.a, () => {
      const bad = t > 6.78;
      const b = win(-400, -330, 800, 660, 'شمارنده_ویو.exe', bad ? C.red : C.green, { col2: bad ? C.ora : C.cyan });
      // expected
      const exA = clamp(P(t, 5.5, 0.3));
      T('انتظار: ۱۰۰٬۰۰۰ ویو', 0, b.y + 80, 54, { color: C.cyan, alpha: exA * (t > 6.4 ? 0.55 : 1) });
      if (t > 6.4) {
        const sk = E.out(P(t, 6.4, 0.25)); const w = tw('انتظار: ۱۰۰٬۰۰۰ ویو', 54) + 30;
        ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.shadowColor = C.red; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.moveTo(w / 2, b.y + 82); ctx.lineTo(w / 2 - w * sk, b.y + 82); ctx.stroke(); ctx.restore();
      }
      // LCD panel
      ctx.fillStyle = '#05140c'; rr(-330, b.y + 140, 660, 280, 18); ctx.fill();
      ctx.strokeStyle = 'rgba(61,255,154,0.4)'; ctx.lineWidth = 3; ctx.stroke();
      const cntK = E.out(P(t, 5.3, 0.95));
      let v = Math.round(200 * cntK);
      if (cntK < 1) v = Math.round(v + rnd(Math.floor(t * 30)) * 9);
      const flash = bad ? (Math.floor(t * 8) % 2 ? C.red : '#ff8fa3') : C.green;
      T('۸۸۸۸', 0, b.y + 285, 210, { color: 'rgba(61,255,154,0.07)' });
      T(fa(v), 0, b.y + 285, 210, { color: flash, glow: flash, blur: 35 });
      T('ویو', 0, b.y + 485, 64, { color: '#fff' });
      if (bad) {
        const ak = E.back(P(t, 6.78, 0.3));
        withT(-250, b.y + 285, ak, 0, ak, () => {
          ctx.fillStyle = C.red; ctx.shadowColor = C.red; ctx.shadowBlur = 25;
          ctx.fillRect(-14, -70, 28, 80); ctx.beginPath(); ctx.moveTo(-45, 5); ctx.lineTo(45, 5); ctx.lineTo(0, 65); ctx.closePath(); ctx.fill();
        });
        withT(250, b.y + 285, ak, 0, ak, () => face(0, 0, 55, '#ffd27a', -1));
      }
    });
  }
  // D — personality line
  if (t > 7.38) {
    const o = 1 - P(t, 9.05, 0.2);
    const p1 = E.back(P(t, 7.4, 0.45));
    withT(540, 640, p1, lerp(0.15, 0, p1), o, () => chrome('شخصیتت', 0, 0, 230));
    if (t > 8.18) { const p2 = E.back(P(t, 8.18, 0.35)); withT(540, 880, p2, 0, o, () => neon('رو نمی\u200cسازه!', 0, 0, 140, C.pink)); }
  }
}

/* ---------- Scene 2 : 9.18 – 12.1 ---------- */
const SKINS = ['#ffd27a', '#ffb38a', '#f2a7ff', '#9ef0ff', '#b8ff9e', '#ffe9a8', '#ff9ec7', '#c7b3ff', '#ffcf8a'];
const BORD = [C.pink, C.cyan, C.yel, C.cyan, C.pink, C.purp, C.yel, C.pink, C.cyan];
function scene2(t) {
  if (t < 9.15 || t > 12.3) return;
  header(t, 9.2, 10.66, 'این موقعیت...', C.cyan, { size: 110 });
  header(t, 10.68, 12.1, 'قطعاً هممون!', 'chrome', { size: 140 });
  for (let i = 0; i < 9; i++) {
    const r = Math.floor(i / 3), c = i % 3;
    const t0 = 9.3 + i * 0.13;
    if (t < t0) continue;
    const pin = E.back(P(t, t0, 0.4));
    const out = 1 - E.in(P(t, 11.9 + i * 0.015, 0.22));
    const jump = t > 10.68 ? Math.abs(Math.sin((t - 10.68 - c * 0.05) * 9)) * 30 * Math.max(0, 1 - (t - 10.68) / 0.9) : 0;
    const cx = 540 + (1 - c) * 300, cy = 790 + (r - 1) * 270 - jump;
    withT(cx, cy, pin * out, 0, out, () => {
      ctx.save();
      ctx.fillStyle = C.ink; ctx.fillRect(-105 + 10, -105 + 10, 210, 210);
      ctx.fillStyle = 'rgba(22,8,48,0.95)'; ctx.fillRect(-105, -105, 210, 210);
      ctx.beginPath(); ctx.rect(-105, -105, 210, 210); glowStroke(BORD[i], 5, 20);
      ctx.restore();
      face(0, 0, 70, SKINS[i], -1, Math.floor(t * 3 + i) % 7 === 0);
      if (t > 11.1 + i * 0.05) {
        const ck = E.back(P(t, 11.1 + i * 0.05, 0.3));
        withT(-95, -95, ck, 0, 1, () => checkBadge(0, 0, 34));
      }
    });
  }
}

/* ---------- Scene 3 : 12.08 – 19.6 ---------- */
function scene3(t) {
  if (t < 12.05 || t > 19.7) return;
  header(t, 12.1, 16.6, 'فکر می\u200cکردیم...', C.yel, { size: 110 });
  header(t, 16.66, 19.55, 'بدترین بازخورد!', C.red, { size: 120 });
  const enter = E.back(P(t, 12.1, 0.5));
  const collapse = E.in(P(t, 19.25, 0.3));
  const red = P(t, 16.66, 0.15);
  const sh = 1 - collapse;
  ctx.save();
  ctx.translate(540, 850); ctx.scale(enter, enter * sh); ctx.globalAlpha = clamp(enter * 1.5) * (1 - collapse * 0.5);
  const col = red > 0.5 ? C.red : C.cyan;
  const b = win(-450, -380, 900, 760, red > 0.5 ? 'واقعیت.exe' : 'پیش\u200cبینی_من.exe', col, { col2: red > 0.5 ? C.ora : C.purp });
  const cx0 = b.x + 70, cx1 = b.x + b.w - 70, cy0 = b.y + 150, cy1 = b.y + b.h - 70;
  // axes
  ctx.strokeStyle = 'rgba(164,92,255,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([8, 10]);
  for (let g = 0; g <= 4; g++) { const y = lerp(cy0, cy1, g / 4); ctx.beginPath(); ctx.moveTo(cx0, y); ctx.lineTo(cx1, y); ctx.stroke(); }
  ctx.setLineDash([]);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx0, cy0 - 20); ctx.lineTo(cx0, cy1); ctx.lineTo(cx1 + 20, cy1); ctx.stroke();
  // stars rating
  for (let s = 0; s < 5; s++) {
    const st = 13.52 + s * 0.09; const on = t > st;
    const fallD = Math.max(0, t - 16.7 - s * 0.05);
    const yy = b.y + 70 + 0.5 * 2600 * fallD * fallD;
    const sc = on ? E.back(P(t, st, 0.3)) : 1;
    ctx.save(); ctx.translate(b.x + b.w - 70 - s * 78, yy); ctx.rotate(fallD * 4 * (s % 2 ? 1 : -1)); ctx.scale(sc, sc);
    star5(0, 0, 32);
    if (on) { ctx.fillStyle = C.yel; ctx.shadowColor = C.yel; ctx.shadowBlur = 20; ctx.fill(); }
    else { ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.restore();
  }
  T('امتیاز من:', b.x + b.w - 470, b.y + 72, 40, { color: 'rgba(255,255,255,0.8)', alpha: clamp(P(t, 13.4, 0.2)) * (1 - red) });
  // expected curve
  const f = u => Math.pow(u, 2.3);
  const drawK = E.io(P(t, 12.5, 3.4));
  if (drawK > 0) {
    ctx.save();
    ctx.setLineDash([22, 14]); ctx.lineDashOffset = -t * 60;
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 9; ctx.shadowColor = C.cyan; ctx.shadowBlur = 25; ctx.lineCap = 'round';
    ctx.globalAlpha *= red > 0 ? 0.45 : 1;
    ctx.beginPath();
    const N = 60;
    for (let i = 0; i <= N * drawK; i++) { const u = i / N; ctx.lineTo(lerp(cx0, cx1, u), lerp(cy1, cy0, f(u))); }
    ctx.stroke();
    ctx.setLineDash([]);
    const u = drawK, ex = lerp(cx0, cx1, u), ey = lerp(cy1, cy0, f(u));
    const ang = Math.atan2(-(cy1 - cy0) * 2.3 * Math.pow(Math.max(u, 0.01), 1.3) / (cx1 - cx0) * (cx1 - cx0), cx1 - cx0);
    ctx.translate(ex, ey); ctx.rotate(ang);
    ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(-18, -22); ctx.lineTo(-18, 22); ctx.closePath(); ctx.fill();
    ctx.restore();
    T('انتظار', cx0 + 120, cy0 + 40, 46, { color: C.cyan, alpha: clamp(P(t, 13.0, 0.3)) });
  }
  // chips
  const chip = (s, t0, y, icon, c2) => {
    if (t < t0) return;
    const k = E.back(P(t, t0, 0.35));
    const fd = Math.max(0, t - 16.72);
    withT(cx0 + 270, y + 0.5 * 2600 * fd * fd, k, fd * 2, 1 - P(t, 16.72, 0.5), () => pill(s, 0, 0, 44, c2, { icon }));
  };
  chip('۱۰۰ هزار ویو', 15.22, cy0 + 130, (x, y, s) => eyeIcon(x, y, s * 0.9, C.yel), C.yel);
  chip('۵ هزار فالوور', 15.5, cy0 + 240, (x, y, s) => personIcon(x, y, s * 0.8, C.pink), C.pink);
  // reality line
  if (t > 16.66) {
    const k = E.out(P(t, 16.66, 0.55));
    const g = u => (u < 0.35 ? 0.12 * Math.sin(u / 0.35 * Math.PI * 0.8) : 0.12 * Math.sin(Math.PI * 0.8) - (u - 0.35) * 0.18);
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 11; ctx.shadowColor = C.red; ctx.shadowBlur = 30; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 60 * k; i++) { const u = i / 60; ctx.lineTo(lerp(cx0, cx1, u), clamp(lerp(cy1, cy0, Math.max(0, g(u)) + 0.02), cy0, cy1)); }
    ctx.stroke(); ctx.restore();
    if (k > 0.9) T('واقعیت', cx1 - 90, cy1 - 50, 46, { color: C.red });
  }
  ctx.restore();
  // error dialogs cascade
  for (let i = 0; i < 5; i++) {
    const t0 = 17.42 + i * 0.3;
    if (t < t0) continue;
    const k = E.back(P(t, t0, 0.25));
    const x = 120 + i * 30, y = 640 + i * 46;
    ctx.save();
    ctx.translate(x + 350, y + 190); ctx.scale(k, k * sh); ctx.translate(-350, -190);
    const bb = win(0, 0, 700, 380, 'خطا!', C.red, { col2: '#ff6a3d', th: 66 });
    face(110, bb.y + 115, 60, '#ffd27a', -1);
    T('بدترین بازخورد', 640, bb.y + 85, 54, { align: 'right', color: '#fff' });
    T('ممکن رو گرفتی!', 640, bb.y + 155, 54, { align: 'right', color: C.yel });
    ctx.fillStyle = '#e9e2ff'; ctx.fillRect(250, bb.y + 215, 200, 66); ctx.strokeStyle = C.dark; ctx.lineWidth = 5; ctx.strokeRect(250, bb.y + 215, 200, 66);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(250, bb.y + 270, 200, 11);
    T('باشه :(', 350, bb.y + 246, 40, { color: C.dark });
    ctx.restore();
  }
}

/* ---------- Scene 4 : 19.66 – 25.9 ---------- */
function scene4(t) {
  if (t < 19.6 || t > 26.2) return;
  header(t, 19.66, 20.46, 'باید بگم...', C.cyan, { size: 110 });
  header(t, 20.5, 21.86, 'نسل جدید اینستاگرام', 'chrome', { size: 96 });
  header(t, 21.9, 25.0, 'علاوه بر کیفیت...', C.yel, { size: 100 });
  // CRT monitor
  if (t < 22.1) {
    const enter = E.back(P(t, 19.66, 0.55));
    const off = P(t, 21.75, 0.3);
    withT(540, lerp(-700, 820, enter) + E.in(off) * 1300, 1, 0, 1, () => {
      // body
      const bx = -380, by = -330, bw = 760, bh = 620;
      ctx.save();
      ctx.fillStyle = C.ink; rr(bx + 16, by + 16, bw, bh, 40); ctx.fill();
      const bg = ctx.createLinearGradient(0, by, 0, by + bh); bg.addColorStop(0, '#e8dcff'); bg.addColorStop(1, '#9d85d6');
      ctx.fillStyle = bg; rr(bx, by, bw, bh, 40); ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = C.dark; ctx.stroke();
      // stand
      ctx.fillStyle = '#8a72c4'; ctx.beginPath(); ctx.moveTo(-120, by + bh); ctx.lineTo(120, by + bh); ctx.lineTo(170, by + bh + 70); ctx.lineTo(-170, by + bh + 70); ctx.closePath(); ctx.fill(); ctx.stroke();
      // vents + led
      for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(30,10,60,0.4)'; ctx.fillRect(bx + 60 + i * 26, by + bh - 70, 12, 40); }
      ctx.fillStyle = C.green; ctx.shadowColor = C.green; ctx.shadowBlur = 15; ctx.beginPath(); ctx.arc(bx + bw - 80, by + bh - 50, 12, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // screen
      const sx = bx + 50, sy = by + 45, sw = bw - 100, shh = bh - 160;
      ctx.save();
      rr(sx, sy, sw, shh, 34); ctx.fillStyle = '#03140d'; ctx.fill(); ctx.clip();
      const sg = ctx.createRadialGradient(0, sy + shh / 2, 50, 0, sy + shh / 2, 450); sg.addColorStop(0, 'rgba(61,255,154,0.16)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg; ctx.fillRect(sx, sy, sw, shh);
      const cmd = 'C:\\> LOAD NEW_GEN.EXE';
      const n = Math.floor(clamp(P(t, 19.95, 0.6)) * cmd.length);
      setFont(48, VT); ctx.direction = 'ltr'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = C.green; ctx.shadowColor = C.green; ctx.shadowBlur = 12;
      ctx.fillText(cmd.slice(0, n) + (Math.floor(t * 4) % 2 ? '█' : ''), sx + 36, sy + 50);
      if (t > 20.7) {
        const k = E.back(P(t, 20.7, 0.35));
        withT(0, sy + 170, k, 0, 1, () => T('نسل جدید', 0, 0, 108, { color: '#d9ffe9', glow: C.green, blur: 30 }));
      }
      if (t > 21.06) {
        const k = E.back(P(t, 21.06, 0.3));
        withT(0, sy + 280, k, 0, 1, () => T('اینستاگرام', 0, 0, 70, { color: C.green, glow: C.green }));
        // progress
        const pk = clamp(P(t, 21.1, 0.6));
        ctx.strokeStyle = C.green; ctx.lineWidth = 4; ctx.strokeRect(sx + 60, sy + 350, sw - 120, 44);
        const nb = Math.floor(pk * 16);
        ctx.fillStyle = C.green;
        for (let i = 0; i < nb; i++) ctx.fillRect(sx + 68 + i * ((sw - 136) / 16), sy + 358, (sw - 136) / 16 - 6, 28);
      }
      // scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = sy; y < sy + shh; y += 5) ctx.fillRect(sx, y, sw, 2);
      // power-off collapse
      if (off > 0) { ctx.fillStyle = `rgba(255,255,255,${off})`; ctx.fillRect(sx, sy + shh / 2 - 4, sw, 8); }
      ctx.restore();
      ctx.save(); rr(sx, sy, sw, shh, 34); ctx.lineWidth = 8; ctx.strokeStyle = C.dark; ctx.stroke(); ctx.restore();
    });
  }
  // checklist window
  if (t > 21.86) {
    const enter = E.back(P(t, 21.9, 0.5));
    const zoom = E.in(P(t, 25.75, 0.3));
    withT(540 + (1 - enter) * 1200, 830, 1 + zoom * 1.8, 0, 1 - zoom, () => {
      const b = win(-440, -340, 880, 680, 'اولویت\u200cها.txt', C.yel, { col2: C.ora });
      const row = (y, txt, t0, tick, extra) => {
        if (t < t0) return;
        const k = E.back(P(t, t0, 0.35));
        withT(0, y, k, 0, 1, () => {
          // checkbox on the right (RTL)
          ctx.save(); ctx.fillStyle = '#fff'; ctx.fillRect(300, -45, 90, 90); ctx.lineWidth = 6; ctx.strokeStyle = C.dark; ctx.strokeRect(300, -45, 90, 90); ctx.restore();
          if (t > tick) {
            const ck = E.out(P(t, tick, 0.25));
            ctx.save(); ctx.strokeStyle = C.green; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = C.green; ctx.shadowBlur = 20;
            ctx.beginPath(); ctx.moveTo(318, 0); ctx.lineTo(340, 25 * Math.min(1, ck * 2)); if (ck > 0.5) ctx.lineTo(340 + 70 * (ck - 0.5) * 2, 25 - 75 * (ck - 0.5) * 2); ctx.stroke(); ctx.restore();
          }
          T(txt, 270, 4, 66, { align: 'right', color: '#fff' });
          extra && extra();
        });
      };
      row(b.y + 150, 'کیفیت مغز محتوا', 22.16, 23.2, () => {
        const pulse = t > 23.84 ? 1 + 0.12 * Math.sin((t - 23.84) * 14) * Math.max(0, 1 - (t - 23.84)) : 1;
        withT(-330, 0, pulse, 0, 1, () => { ctx.save(); ctx.shadowColor = C.pink; ctx.shadowBlur = t > 23.84 ? 40 : 10; pixC(BRAIN, { P: '#ff7ac0', p: '#c4357d' }, 0, 0, 9); ctx.restore(); });
        if (t > 24.2) { const uk = E.out(P(t, 24.2, 0.3)); ctx.fillStyle = C.pink; ctx.fillRect(270 - 450 * uk, 52, 450 * uk, 7); }
      });
      row(b.y + 380, 'تعداد محتوا', 25.0, 99, () => {
        if (t > 25.46) { const k = E.back(P(t, 25.46, 0.3)); withT(-260, -10, k, -0.15, 1, () => pill('بیشتر!', 0, 0, 52, C.pink, { fill: C.pink, tcol: '#fff' })); }
      });
    });
  }
}

/* ---------- Scene 5 : 25.9 – 29.1 ---------- */
const TILECOL = [['#ff4fa0', '#ffb347'], ['#2de2e6', '#a45cff'], ['#ffd319', '#ff2e97'], ['#3dff9a', '#2de2e6'], ['#a45cff', '#ff4fa0'], ['#ff8a1f', '#ffd319']];
function miniTile(x, y, s, i, t) {
  const [a, b2] = TILECOL[i % TILECOL.length];
  ctx.save();
  ctx.fillStyle = C.ink; ctx.fillRect(x - s / 2 + 8, y - s / 2 + 8, s, s);
  const g = ctx.createLinearGradient(x - s / 2, y - s / 2, x + s / 2, y + s / 2); g.addColorStop(0, a); g.addColorStop(1, b2);
  ctx.fillStyle = g; ctx.fillRect(x - s / 2, y - s / 2, s, s);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(x - s / 2, y - s / 2, s, s);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  const k = i % 3;
  if (k === 0) { ctx.beginPath(); ctx.moveTo(x - s * 0.13, y - s * 0.18); ctx.lineTo(x + s * 0.2, y); ctx.lineTo(x - s * 0.13, y + s * 0.18); ctx.closePath(); ctx.fill(); }
  else if (k === 1) { ctx.beginPath(); ctx.arc(x, y + s * 0.1, s * 0.22, Math.PI, 0); ctx.fill(); ctx.fillRect(x - s * 0.4, y + s * 0.1, s * 0.8, s * 0.05); }
  else { heartPath(x, y + s * 0.05, s * 0.32); ctx.fill(); }
  ctx.restore();
}
function scene5(t) {
  if (t < 25.85 || t > 29.2) return;
  header(t, 25.96, 27.2, 'تمرکز', 'chrome', { size: 160 });
  header(t, 27.26, 29.02, 'تعداد محتوا!', 'chrome', { size: 140 });
  const out = 1 - E.in(P(t, 28.85, 0.22));
  // tiles grid
  let shown = 0;
  for (let i = 0; i < 12; i++) {
    const t0 = 27.26 + i * 0.1;
    if (t < t0) continue;
    shown++;
    const r = Math.floor(i / 4), c = i % 4;
    const k = E.back(P(t, t0, 0.3));
    const x = 540 + (1.5 - c) * 215, y = 620 + r * 230;
    withT(x, y, k * out, 0, out, () => miniTile(0, 0, 190, i, t));
  }
  // crosshair
  const ck = E.out(P(t, 25.92, 0.6));
  if (t > 25.9) {
    const R = lerp(520, t > 27.26 ? 470 : 240, ck) + (t > 27.26 ? 0 : 6 * Math.sin(t * 8));
    withT(540, 850, 1, t * 0.5 * (t < 27.26 ? 1 : 0.2), ck * out, () => {
      ctx.save(); ctx.strokeStyle = C.cyan; ctx.lineWidth = 7; ctx.shadowColor = C.cyan; ctx.shadowBlur = 25;
      for (let q = 0; q < 4; q++) { ctx.beginPath(); ctx.arc(0, 0, R, q * Math.PI / 2 + 0.2, q * Math.PI / 2 + Math.PI / 2 - 0.2); ctx.stroke(); }
      ctx.lineWidth = 5;
      for (let q = 0; q < 4; q++) { ctx.save(); ctx.rotate(q * Math.PI / 2); ctx.beginPath(); ctx.moveTo(R - 50, 0); ctx.lineTo(R + 50, 0); ctx.stroke(); ctx.restore(); }
      if (t < 27.26) { ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fillStyle = C.pink; ctx.shadowColor = C.pink; ctx.fill(); }
      ctx.restore();
    });
  }
  if (t > 25.96 && t < 27.3) {
    const k = E.back(P(t, 26.1, 0.4)) * (1 - P(t, 27.1, 0.2));
    withT(540, 850, k, 0, k, () => miniTile(0, 0, 230, 0, t));
  }
  if (shown) {
    const k = E.back(P(t, 27.3, 0.3));
    withT(850, 1170, k * out, -0.08, out, () => pill('×' + fa(shown), 0, 0, 64, C.yel, { fill: C.yel, tcol: C.dark }));
  }
}

/* ---------- Scene 6 : 29.02 – 37.5 — cassettes ---------- */
function cassette(cx, cy, s, label, col, t, glow = 0) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  const w = 540, h = 340;
  ctx.fillStyle = C.ink; rr(-w / 2 + 14, -h / 2 + 14, w, h, 26); ctx.fill();
  rr(-w / 2, -h / 2, w, h, 26); ctx.fillStyle = '#1e1238'; ctx.fill();
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 25 + glow * 50; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  // screws
  ctx.fillStyle = '#8f86b0'; [[-w / 2 + 22, -h / 2 + 22], [w / 2 - 22, -h / 2 + 22], [-w / 2 + 22, h / 2 - 22], [w / 2 - 22, h / 2 - 22]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill(); });
  // label
  ctx.fillStyle = col; rr(-w / 2 + 40, -h / 2 + 30, w - 80, 220, 14); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillRect(-w / 2 + 40, -h / 2 + 50, w - 80, 70);
  ctx.fillStyle = 'rgba(18,5,42,0.25)'; for (let i = 0; i < 3; i++) ctx.fillRect(-w / 2 + 40, -h / 2 + 140 + i * 14, w - 80, 5);
  T(label, 0, -h / 2 + 88, 58, { color: C.dark });
  setFont(36, VT); ctx.direction = 'ltr'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.dark; ctx.fillText('A', -w / 2 + 52, -h / 2 + 152);
  ctx.textAlign = 'right'; ctx.fillText('C-60', w / 2 - 52, -h / 2 + 152);
  // tape window
  ctx.fillStyle = '#0a0414'; rr(-160, -h / 2 + 170, 320, 72, 36); ctx.fill();
  ctx.fillStyle = '#3a2418'; ctx.fillRect(-100, -h / 2 + 182, 200, 48);
  for (const sx of [-112, 112]) {
    ctx.save(); ctx.translate(sx, -h / 2 + 206); ctx.rotate(t * 4);
    ctx.fillStyle = '#f2ecff'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a0414'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2ecff'; for (let k = 0; k < 6; k++) { ctx.save(); ctx.rotate(k * Math.PI / 3); ctx.fillRect(-3, -15, 6, 7); ctx.restore(); }
    ctx.restore();
  }
  // bottom trapezoid
  ctx.fillStyle = '#2c1d4d'; ctx.beginPath(); ctx.moveTo(-170, h / 2); ctx.lineTo(-140, h / 2 - 70); ctx.lineTo(140, h / 2 - 70); ctx.lineTo(170, h / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0a0414'; [-90, -30, 30, 90].forEach(x => { ctx.beginPath(); ctx.arc(x, h / 2 - 32, 10, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}
function scene6(t) {
  if (t < 29.0 || t > 37.6) return;
  header(t, 29.02, 31.28, 'یه ریلز...', C.cyan, { size: 120 });
  header(t, 31.3, 34.0, '۳ تا قلاب مختلف', 'chrome', { size: 120 });
  header(t, 34.02, 37.4, '۲ تریال + ۱ عمومی', 'chrome', { size: 110 });
  const out = 1 - E.in(P(t, 37.2, 0.25));
  const split = E.io(P(t, 31.45, 0.55));
  const cols = [C.pink, C.yel, C.cyan];
  const labels = ['قلاب ۱', 'قلاب ۲', 'قلاب ۳'];
  if (split <= 0) {
    if (t > 29.8) {
      const k = E.back(P(t, 29.85, 0.5));
      withT(540 + (1 - k) * 900, 860, 1, (1 - k) * 0.6, out, () => cassette(0, 0, 1.15, 'ریلز من', C.purp, t));
    }
    return;
  }
  for (let i = 0; i < 3; i++) {
    const tx = 540 + (1 - i) * 330; // i=0 right
    let x = lerp(540, tx, split), y = 900, s = lerp(1.15, 0.56, split);
    let glow = 0, alpha = 1;
    const isPub = i === 1;
    if (!isPub && t > 35.18) { const d = E.out(P(t, 35.18, 0.4)); y += 70 * d; alpha = 1 - 0.35 * d; }
    if (isPub && t > 36.04) { const d = E.back(P(t, 36.04, 0.5)); y -= 60 * d; s = lerp(0.56, 0.78, d); glow = d; }
    if (isPub && t > 36.04) {
      const rk = E.out(P(t, 36.04, 0.4));
      withT(x, y, rk, 0, rk * out, () => starburst(0, 0, 520, t, 'rgba(255,211,25,0.25)', 'rgba(255,211,25,0.0)', 18));
    }
    withT(0, 0, 1, 0, out * alpha, () => cassette(x, y, s, labels[i], cols[i], t + i, glow));
    // hooks
    const hd = E.out(P(t, 31.76 + i * 0.12, 0.55)) * (1 - E.in(P(t, 33.8, 0.35)));
    if (hd > 0) {
      const hy = lerp(380, 640, hd) + Math.sin(t * 3 + i) * 8;
      ctx.save(); ctx.globalAlpha = out; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, 380); ctx.lineTo(x, hy - 85); ctx.stroke(); ctx.restore();
      withT(x, hy, 1, Math.sin(t * 2.5 + i) * 0.12, out, () => hookShape(0, 0, 90, cols[i]));
    }
    if (!isPub) stamp('تریال', x, y + 20, 64, C.cyan, 34.7 + (i === 0 ? 0 : 0.18), t, i === 0 ? -0.22 : 0.18);
    else {
      stamp('عمومی', x, y + 35, 74, C.yel, 36.56, t, -0.12);
      if (t > 36.6) { const gk = E.back(P(t, 36.6, 0.35)); withT(x + 200, y - 150, gk, 0, out, () => globeIcon(0, 0, 50, C.yel, t)); }
    }
  }
}

/* ---------- Scene 7 : 37.4 – 42.45 ---------- */
function scene7(t) {
  if (t < 37.35 || t > 42.5) return;
  // perfectionism header with strike
  const L = life(t, 37.4, 39.25, 0.4, 0.25);
  if (L) withT(540, 320, lerp(0.4, 1, L.i), 0, L.a, () => {
    chrome('کمال\u200cگرایی', 0, 0, 130);
    if (t > 38.46) { const k = E.out(P(t, 38.46, 0.25)); const w = tw('کمال\u200cگرایی', 130) + 40; ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 14; ctx.shadowColor = C.red; ctx.shadowBlur = 20; ctx.beginPath(); ctx.moveTo(w / 2, 6); ctx.lineTo(w / 2 - w * k, -6); ctx.stroke(); ctx.restore(); }
  });
  header(t, 39.3, 41.3, 'تعداد بیشتر', 'chrome', { size: 130 });
  header(t, 41.36, 42.4, 'افزایش!', C.green, { size: 140 });
  // perfectionism window dragged to trash
  const binA = clamp(P(t, 38.2, 0.3)) * (1 - P(t, 39.3, 0.25));
  if (t < 39.3) {
    const enter = E.back(P(t, 37.45, 0.5));
    const drag = E.io(P(t, 38.6, 0.55));
    const wx = lerp(540, 880, drag), wy = lerp(830, 1170, drag), ws = lerp(enter, 0.06, drag);
    if (drag < 1) withT(wx, wy, ws, drag * 0.4, 1, () => {
      const b = win(-400, -280, 800, 560, 'کمال\u200cگرایی.exe', C.pink, { col2: C.purp });
      gem(0, b.y + 150, 95, t);
      T('در حال بی\u200cنقص کردن...', 0, b.y + 300, 50, { color: '#fff' });
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(-320, b.y + 360, 640, 50);
      ctx.fillStyle = C.pink; const nb = 19;
      for (let i = 0; i < nb; i++) ctx.fillRect(320 - 8 - (i + 1) * (624 / 20), b.y + 368, 624 / 20 - 6, 34);
      T(Math.floor(t * 3) % 2 ? '۹۹٪' : '', 0, b.y + 450, 44, { color: C.yel });
    });
    if (binA > 0) {
      const lid = t > 38.6 && t < 39.25 ? 0.7 * Math.sin(clamp(P(t, 38.6, 0.6)) * Math.PI) : 0;
      const bump = t > 39.12 ? 1 + 0.15 * Math.sin((t - 39.12) * 25) * Math.max(0, 1 - (t - 39.12) * 4) : 1;
      withT(880, 1180, bump, 0, binA, () => trashBin(0, 0, 170, lid));
    }
    // cursor
    if (t > 38.1 && t < 39.2) {
      const mk = E.io(P(t, 38.1, 0.45));
      const enterW = 1;
      let cx = lerp(1000, 540 + 200, mk), cy = lerp(1400, 830 - 250, mk);
      if (t > 38.6) { cx = lerp(540 + 200, 880, drag); cy = lerp(830 - 250, 1170, drag); }
      withT(cx, cy, enterW, 0, 1 - P(t, 39.0, 0.2), () => pix(CURSOR, { K: C.dark, W: '#fff' }, 0, 0, 7));
    }
  }
  // bar chart
  if (t > 39.25) {
    const enter = E.back(P(t, 39.3, 0.5));
    const out = 1 - E.in(P(t, 42.2, 0.25));
    withT(540, 860, enter, 0, out, () => {
      const b = win(-440, -370, 880, 740, 'تعداد_محتوا.exe', C.green, { col2: C.cyan });
      const base = b.y + b.h - 60;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-380, b.y + 40); ctx.lineTo(-380, base); ctx.lineTo(380, base); ctx.stroke();
      const hs = [2, 3, 4, 6, 8, 11];
      hs.forEach((hh, i) => {
        const t0 = 39.5 + i * 0.36; if (t < t0) return;
        const k = E.out(P(t, t0, 0.35));
        const nb = Math.round(hh * k);
        const bx = 300 - i * 125;
        for (let j = 0; j < nb; j++) {
          ctx.fillStyle = j >= hh - 1 && k >= 1 ? C.yel : (i % 2 ? C.cyan : C.green);
          ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 12;
          ctx.fillRect(bx - 45, base - 12 - (j + 1) * 40, 90, 32);
        }
        ctx.shadowBlur = 0;
      });
      if (t > 41.36) {
        const ak = E.out(P(t, 41.36, 0.45));
        ctx.save(); ctx.strokeStyle = C.pink; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = C.pink; ctx.shadowBlur = 30;
        const pts = [[330, base - 60], [130, base - 180], [10, base - 140], [-300, base - 470]];
        ctx.beginPath(); ctx.moveTo(...pts[0]);
        const segs = pts.length - 1, upto = ak * segs;
        let last = pts[0];
        for (let s = 0; s < segs; s++) {
          const f2 = clamp(upto - s); if (f2 <= 0) break;
          last = [lerp(pts[s][0], pts[s + 1][0], f2), lerp(pts[s][1], pts[s + 1][1], f2)]; ctx.lineTo(...last);
        }
        ctx.stroke();
        if (ak > 0.95) { ctx.fillStyle = C.pink; ctx.translate(-300, base - 470); ctx.rotate(Math.atan2(-330, -310)); ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(-20, -32); ctx.lineTo(-20, 32); ctx.closePath(); ctx.fill(); }
        ctx.restore();
      }
    });
    if (t > 41.36) for (let i = 0; i < 14; i++) {
      const d = ((t - 41.36) * 0.9 + rnd(i)) % 1;
      const x = 160 + rnd(i * 3.3) * 760, y = 1150 - d * 700;
      T('+', x, y, 60, { color: [C.yel, C.green, C.cyan][i % 3], alpha: Math.sin(d * Math.PI) * out_(t), glow: C.green });
    }
  }
}
const out_ = t => 1 - P(t, 42.2, 0.25);

/* ---------- Scene 8 : 42.36 – 46.8 — watch time ---------- */
function scene8(t) {
  if (t < 42.3 || t > 46.9) return;
  header(t, 42.36, 44.62, 'تمرکز اینستاگرام', C.cyan, { size: 100 });
  header(t, 44.66, 46.75, 'واچ\u200cتایم', 'chrome', { size: 170 });
  const enter = E.back(P(t, 42.4, 0.55));
  const out = 1 - E.in(P(t, 46.5, 0.28));
  const cx = 540, cy = 870, R = 270;
  // orbiting tiles
  for (let i = 0; i < 8; i++) {
    const t0 = 42.9 + i * 0.12; if (t < t0) continue;
    const k = E.back(P(t, t0, 0.35));
    const a = i * Math.PI / 4 + t * 0.35;
    const rr2 = 410;
    const x = cx + Math.cos(a) * rr2, y = cy + Math.sin(a) * rr2 * 0.95;
    // stream dots towards center
    if (t > 45.3) for (let d = 0; d < 4; d++) {
      const f = ((t - 45.3) * 1.6 + d / 4) % 1;
      ctx.globalAlpha = out * (1 - f); ctx.fillStyle = C.yel;
      ctx.fillRect(lerp(x, cx, f) - 7, lerp(y, cy, f) - 7, 14, 14);
    }
    ctx.globalAlpha = 1;
    withT(x, y, k * 0.55, 0, out, () => miniTile(0, 0, 150, i, t));
  }
  withT(cx, cy, enter, 0, out, () => {
    // body
    ctx.save();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(14, 14, R, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#170830'; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); glowStroke(C.pink, 12, 35);
    // crown
    ctx.fillStyle = C.pink; ctx.fillRect(-40, -R - 60, 80, 34); ctx.fillRect(-14, -R - 30, 28, 32);
    // ticks
    for (let i = 0; i < 60; i++) {
      ctx.save(); ctx.rotate(i * Math.PI / 30);
      ctx.fillStyle = i % 5 ? 'rgba(255,255,255,0.4)' : '#fff';
      ctx.fillRect(-2, -R + 22, 4, i % 5 ? 14 : 28); ctx.restore();
    }
    // progress arc
    const pk = E.io(P(t, 42.7, 3.6));
    ctx.beginPath(); ctx.arc(0, 0, R - 70, -Math.PI / 2, -Math.PI / 2 + pk * Math.PI * 2);
    ctx.strokeStyle = C.yel; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.shadowColor = C.yel; ctx.shadowBlur = 25; ctx.stroke();
    ctx.restore();
    // hand
    ctx.save(); ctx.rotate(t * 6); ctx.strokeStyle = C.cyan; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.shadowColor = C.cyan; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -R + 60); ctx.stroke(); ctx.restore();
    ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
    // digital readout
    const secs = Math.floor(Math.pow(P(t, 42.6, 3.8), 1.6) * 512345);
    const hh = Math.floor(secs / 3600), mm = Math.floor(secs / 60) % 60, ss = secs % 60;
    const s = `${fa(String(hh).padStart(3, '0'))}:${fa(String(mm).padStart(2, '0'))}:${fa(String(ss).padStart(2, '0'))}`;
    ctx.fillStyle = 'rgba(5,1,15,0.85)'; rr(-200, 50, 400, 100, 16); ctx.fill(); ctx.strokeStyle = C.yel; ctx.lineWidth = 3; ctx.stroke();
    ctx.save(); setFont(70); ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.yel; ctx.shadowColor = C.yel; ctx.shadowBlur = 18; ctx.fillText(s, 0, 104); ctx.restore();
    T('ساعت تماشا', 0, -95, 44, { color: 'rgba(255,255,255,0.85)', alpha: clamp(P(t, 42.9, 0.3)) });
  });
  if (t > 45.3) {
    const k = E.back(P(t, 45.3, 0.4));
    const pulse = 1 + 0.06 * Math.sin((t - 45.3) * 10);
    withT(540, 1290, k * pulse, -0.04, out, () => pill('کلِ پیج!', 0, 0, 70, C.yel, { fill: C.yel, tcol: C.dark }));
  }
}

/* ---------- Scene 9 : outro ---------- */
function scene9(t) {
  if (t < 46.6) return;
  const a = (t0) => E.back(P(t, t0, 0.35));
  withT(540, 520, a(46.65), 0, 1, () => neon('کیفیت', 0, 0, 130, C.cyan));
  withT(540, 680, a(46.85), 0, 1, () => neon('+', 0, 0, 120, C.yel));
  withT(540, 830, a(46.95), 0, 1, () => neon('تعداد', 0, 0, 130, C.pink));
  if (t > 47.15) {
    const k = E.out(P(t, 47.15, 0.2));
    ctx.save(); ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 20; ctx.fillRect(540 - 260 * k, 950, 520 * k, 10); ctx.restore();
  }
  withT(540, 1100, a(47.2), 0, 1, () => chrome('واچ\u200cتایم ↑', 0, 0, 150));
}

/* ---------------- frame ---------------- */
function bgState(t) {
  let sunScale = 1, sunLift = 0, dim = 0.18, sunAlpha = 1, gridSpeed = 1.3;
  // big sun for the "personality" line and outro
  const bigA = E.io(P(t, 7.3, 0.6)) * (1 - E.io(P(t, 9.0, 0.4)));
  const bigB = E.io(P(t, 46.6, 0.6));
  const big = Math.max(bigA, bigB);
  sunScale = lerp(1, 1.12, big); sunLift = lerp(0, -40, big);
  dim = lerp(0.3, 0.05, big);
  if (t > 16.66 && t < 19.6) dim = 0.42;
  if (t > 42.36 && t < 46.6) gridSpeed = 2.6;
  return { sunScale, sunLift, dim, sunAlpha, gridSpeed };
}

function renderAt(t) {
  const frame = Math.round(t * 30);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const sh = shake(t);
  ctx.save();
  if (sh > 0) ctx.translate((rnd(frame * 1.7) - 0.5) * sh * 2, (rnd(frame * 2.9) - 0.5) * sh * 2);
  drawBG(t, bgState(t));
  scene1(t); scene2(t); scene3(t); scene4(t); scene5(t); scene6(t); scene7(t); scene8(t); scene9(t);
  ctx.restore();
  drawSubs(t);
  hud(t);
  // post
  trackingBand(t, frame);
  const g = glitchAmt(t);
  applyGlitch(g, frame * 13.37);
  ctx.drawImage(scan, 0, 0);
  // power on
  if (t < 0.5) {
    staticNoise(frame, 1 - P(t, 0.15, 0.35));
    const k = E.out(P(t, 0, 0.35));
    if (k < 1) {
      bctx.clearRect(0, 0, W, H); bctx.drawImage(cv, 0, 0);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const hh = Math.max(6, H * k);
      ctx.drawImage(buf, 0, 0, W, H, 0, H / 2 - hh / 2, W, hh);
    }
  } else if (g > 0.3) staticNoise(frame, 0.12 * g);
  // power off
  if (t > 47.85) {
    const k = P(t, 47.85, 0.45);
    bctx.clearRect(0, 0, W, H); bctx.drawImage(cv, 0, 0);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const sy = Math.max(0.004, 1 - E.out(clamp(k * 1.6)));
    const sx = k > 0.62 ? Math.max(0.0, 1 - E.out(clamp((k - 0.62) / 0.38))) : 1;
    if (sx > 0.003) {
      ctx.drawImage(buf, 0, 0, W, H, W / 2 - W * sx / 2, H / 2 - H * sy / 2, W * sx, H * sy);
      ctx.fillStyle = `rgba(255,255,255,${clamp(k * 2)})`;
      ctx.shadowColor = '#fff'; ctx.shadowBlur = 40;
      ctx.fillRect(W / 2 - W * sx / 2, H / 2 - Math.max(3, H * sy / 2), W * sx, Math.max(6, H * sy));
      ctx.shadowBlur = 0;
    }
    if (k > 0.97) hud(t);
  }
}

window.renderAt = renderAt;
window.DUR = DUR;
window.ready = Promise.all([
  document.fonts.load('64px "Peyda"', 'سلام'), document.fonts.load('64px "VT323"', 'A'), document.fonts.load('32px "PS2P"', 'A'),
]).then(() => { renderAt(0); return true; });
