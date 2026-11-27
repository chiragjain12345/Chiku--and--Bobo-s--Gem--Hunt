/* =====================================================================
   Chiku & Bobo's Gem Hunt — LBD 1 · Improper fractions (Grade 6)
   Flow follows the design sheet: Story → torch reveal → 7 chambers
   (tap → pick number → trace → auto-cut → hammer → share → name it → ride on)
   ===================================================================== */
'use strict';
const IMG = 'assets/images/';
const $ = id => document.getElementById(id);
let SPEED = 1; // dev/test only: <1 speeds up waits
const sleep = ms => new Promise(r => setTimeout(r, ms * SPEED));
const stage = $('stage');
let SCALE = 1;
function fit() {
  // fill the screen (no black bars): zoom up to 12% past "fit", cropping a little off the edges if needed
  const fitS = Math.min(innerWidth / 1920, innerHeight / 1080), cover = Math.max(innerWidth / 1920, innerHeight / 1080);
  SCALE = innerWidth / innerHeight < 1920 / 1080 ? Math.min(cover, fitS * 1.12) : fitS; // taller screens: trim the sides; wider screens: show all
  stage.style.transform = `translate(-50%,-50%) scale(${SCALE})`;
}
addEventListener('resize', fit); fit();
/** element rect in stage (1920×1080) coordinates */
function rel(el) {
  const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
  const x = (r.left - s.left) / SCALE, y = (r.top - s.top) / SCALE, w = r.width / SCALE, h = r.height / SCALE;
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

/* ===================== DATA (from the design sheet) ===================== */
const LEVELS = [
  { title: 'Chamber 1', gem: 'ruby', stuff: 'ruby', plural: 'Rubies', c: ['#FF8A9A', '#E0304E', '#6E0E20'], shape: 'circle', count: 3,
    crew: ['Chiku', 'Bobo'], name: 'Bobo', ask: 'Chiku', markBy: 'Chiku', ham: 'Bobo', brk: 'Bobo',
    hamLine: 'Tap a stone. I’ll hammer off one part at a time!', arrive: [] },
  { title: 'Chamber 2', gem: 'emerald', stuff: 'emerald', plural: 'Emeralds', c: ['#7DF0B8', '#18A86A', '#0B4F32'], shape: 'square', count: 5,
    crew: ['Chiku', 'Bobo'], name: 'Chiku', ask: 'Bobo', markBy: 'Bobo', ham: 'Bobo', brk: 'Bobo',
    hamLine: 'Tap a stone to hammer off each part.', arrive: [['Chiku', 'Five stones for the 2 of us. Tap a stone to mark it.']] },
  { title: 'Chamber 3', gem: 'sapphire', stuff: 'sapphire', plural: 'Sapphires', c: ['#9EC2FF', '#2F63DB', '#142E78'], shape: 'triangle', count: 4,
    crew: ['Chiku', 'Bobo', 'Golu'], name: 'Golu', ask: 'Bobo', markBy: 'Bobo', ham: 'Golu', brk: 'Golu', join: { Golu: 'pop' },
    hamLine: 'My turn to hammer! Tap a stone.', arrive: [['Golu', 'I’m mining here too! Can I share?'], ['Chiku', 'Yes! Equal shares for all 3 of us. Tap a stone.']] },
  { title: 'Chamber 4', gem: 'topaz', stuff: 'topaz', plural: 'Topazes', c: ['#FFE08A', '#F2992A', '#8A4E08'], shape: 'triangle', count: 7,
    crew: ['Chiku', 'Bobo', 'Golu', 'Mitthu'], name: 'Mitthu', ask: 'Bobo', markBy: 'Chiku', ham: 'Mitthu', brk: 'Bobo', join: { Mitthu: 'pop' },
    hamLine: 'Tap a stone to hammer it!', arrive: [['Mitthu', 'I found this chamber too!'], ['Bobo', 'Then we share it 4 ways. Tap a stone.']] },
  { title: 'Chamber 5', gem: 'amethyst', stuff: 'amethyst', plural: 'Amethysts', c: ['#E2BEFF', '#9452E0', '#4A1F80'], shape: 'hexagon', count: 5,
    crew: ['Chiku', 'Bobo', 'Mitthu'], name: 'Bobo', ask: 'Mitthu', markBy: 'Bobo', ham: 'Bobo', brk: 'Bobo',
    hamLine: 'Tap a stone to hammer it.', arrive: [['Mitthu', 'Golu has gone home. It’s 3 of us now.'], ['Chiku', 'Tap a stone.']] },
  { title: 'Chamber 6', gem: 'aquamarine', stuff: 'aquamarine', plural: 'Aquamarines', c: ['#B4FFF7', '#2EC4B6', '#0F6B64'], shape: 'circle', count: 7,
    crew: ['Chiku', 'Bobo', 'Mitthu', 'Golu', 'Tinku'], name: 'Tinku', ask: 'Golu', markBy: 'Chiku', ham: 'Tinku', brk: 'Bobo', join: { Golu: 'pop', Tinku: 'walk' },
    hamLine: 'Tap a stone to hammer it!', arrive: [['Tinku', 'Can I join?'], ['Golu', 'All 5 of us! Same promise.'], ['Bobo', 'Tap a stone.']] },
  { title: 'Chamber 7', gem: 'jade stone', stuff: 'jade', plural: 'Jade stones', c: ['#CDF5B8', '#5DAE5A', '#2C6A2E'], shape: 'rect', count: 9,
    crew: ['Chiku', 'Bobo', 'Golu', 'Tinku'], name: 'Chiku', ask: 'Tinku', markBy: 'Chiku', ham: 'Golu', brk: 'Bobo',
    hamLine: 'Tap a stone to hammer it!', arrive: [['Bobo', 'Mitthu is tired. It’s 4 of us now. Tap a stone.']] }
];
const LEAVE = { Golu: 'dig', Mitthu: 'dig', Tinku: 'dig', Chiku: 'fly', Bobo: 'fly' };
const CUTS = { circle: [2, 3, 4, 5, 6], square: [2, 3, 4, 5, 6], rect: [2, 3, 4, 5, 6], triangle: [2, 3, 4], hexagon: [2, 3, 6] };

const STORY = [
  { bg: 'cover.jpg', title: true },
  { bg: 'story_02_chiku_promise.jpg', who: 'Chiku', text: 'Whatever gems we find, we share equally.', box: [800, 101, 510, 170], fs: 40, enter: 'zoom' },
  { bg: 'story_03_bobo_promise.jpg', who: 'Bobo', text: 'Promise!', box: [1270, 164, 376, 125], fs: 58, enter: 'cut' },
  { bg: 'story_04_chamber_stones.jpg', who: 'Chiku', text: '3 covered stones!', box: [349, 108, 510, 170], fs: 48, rings: [[62.5, 45.5, 9.8, 19.6], [75.1, 45.2, 9.8, 20], [89.2, 45, 10.4, 20.6]], enter: 'cave' },
  { bg: 'story_04_chamber_stones.jpg', who: 'Chiku', text: 'One for you and one for me. But one stone is left.', box: [349, 108, 510, 170], fs: 35 },
  { bg: 'story_04_chamber_stones.jpg', who: 'Chiku', text: 'How do we share 3 stones equally?', box: [349, 108, 510, 170], fs: 40 },
  { bg: 'story_05_bobo_idea.jpg', who: 'Bobo', text: 'By forming improper fractions!', box: [1128, 57, 594, 198], fs: 48, enter: 'whoosh', teach: true },
  { bg: 'story_07_bobo_pointing.jpg', who: 'Bobo', text: 'Can you help us?', box: [1150, 50, 540, 180], fs: 56, enter: 'cut' }
];

/* ===================== AUDIO: synthesized SFX + voice (speech synthesis) ===================== */
let muted = false, AC = null, NB = null;
function ac() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
function tone(f, d, type = 'sine', v = .2, delay = 0, f2 = null) {
  const a = ac(); if (!a || muted) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d + .05);
}
function noise(d, v = .3, freq = 1000, type = 'lowpass', delay = 0, f2 = null) {
  const a = ac(); if (!a || muted) return;
  if (!NB) { NB = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const ch = NB.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
  const t = a.currentTime + delay, s = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
  s.buffer = NB; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(freq, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  s.connect(fl).connect(g).connect(a.destination); s.start(t); s.stop(t + d + .05);
}
const SFX = {
  tap() { tone(720, .07, 'triangle', .12); },
  pop() { tone(480, .14, 'sine', .2, 0, 980); },
  chalk() { noise(.05, .07, 3800, 'bandpass'); },
  bang() { noise(.3, .75, 1400, 'lowpass', 0, 160); tone(130, .25, 'square', .16, 0, 55); },
  crack() { noise(.18, .5, 2500, 'bandpass', 0, 600); },
  cut(d) { noise(d, .16, 3000, 'bandpass'); tone(190, d, 'sawtooth', .045, 0, 260); },
  good() { [523, 659, 784, 1047].forEach((f, i) => tone(f, .28, 'triangle', .15, i * .09)); },
  bad() { tone(250, .16, 'square', .09); tone(185, .32, 'square', .09, .15); },
  whoosh() { noise(.7, .35, 300, 'bandpass', 0, 3500); },
  screech() { noise(.7, .18, 5200, 'bandpass', 0, 2600); tone(2300, .6, 'sawtooth', .025, 0, 1500); noise(.25, .5, 220, 'lowpass', .55); },
  clack(d) { for (let i = 0; i < d / .26; i++) { noise(.05, .22, 1800, 'bandpass', i * .26); noise(.05, .16, 1500, 'bandpass', i * .26 + .09); } },
  rumble(d) { noise(d, .3, 160, 'lowpass'); for (let i = 0; i < d / .35; i++) tone(70, .08, 'square', .05, i * .35); },
  click() { tone(1900, .03, 'square', .1); noise(.05, .2, 4500, 'highpass'); },
  sparkle() { [1319, 1568, 2093, 2637].forEach((f, i) => tone(f, .2, 'sine', .07, i * .06)); },
  coin() { tone(988, .08, 'square', .07); tone(1319, .22, 'square', .07, .08); }
};
const VOICE = { Chiku: { pitch: 1.35, rate: 1 }, Bobo: { pitch: 1.12, rate: .98 }, Golu: { pitch: .7, rate: .92 },
  Mitthu: { pitch: 1.75, rate: 1.06 }, Tinku: { pitch: 1.5, rate: 1.02 }, Narrator: { pitch: 1, rate: .95 } };
let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices(); if (!vs.length) return;
  voice = vs.find(v => /en-IN/i.test(v.lang)) || vs.find(v => /Google UK English Female|Samantha|Karen|Moira/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, who) {
  return new Promise(res => {
    const plain = String(text).replace(/<[^>]+>/g, '').replace(/(\d+)\/(\d+)/g, '$1 by $2').replace(/’/g, "'");
    const est = 900 + plain.length * 58;
    const tok = lipStart(who, plain, (VOICE[who] || VOICE.Narrator).rate);
    let done = false; const fin = () => { if (!done) { done = true; lipStop(tok); res(); } };
    if (muted || !('speechSynthesis' in window)) { setTimeout(fin, est * SPEED); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(plain), p = VOICE[who] || VOICE.Narrator;
      if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-IN';
      u.pitch = p.pitch; u.rate = p.rate; u.onend = fin; u.onerror = fin;
      u.onstart = () => lipSync(tok, 0); u.onboundary = e => { if (!e.name || e.name === 'word') lipSync(tok, e.charIndex); };
      speechSynthesis.speak(u);
      setTimeout(fin, est + 4000);
    } catch (e) { setTimeout(fin, est); }
  });
}
function hush() { try { speechSynthesis.cancel(); } catch (e) { } }

/* ===================== CHARACTERS ===================== */
const PNG = { Chiku: 'characters/chiku.png', Bobo: 'characters/bobo.png', Golu: 'characters/golu.png', Mitthu: 'characters/mitthu.png', Tinku: 'characters/tinku.png' };
const AVCROP = { Chiku: 'width:250px;left:-112px;top:-22px', Bobo: 'width:230px;left:-62px;top:-28px', Golu: 'width:210px;left:-26px;top:-24px', Mitthu: 'width:255px;left:-72px;top:-28px', Tinku: 'width:250px;left:-62px;top:-34px' };
function peekSVG(kind, vb = '0 0 200 200') {
  const eye = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#24140c"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .38}" fill="#fff"/>`;
  const helmet = (col, dark) => `<path d="M40 92 Q100 14 160 92Z" fill="${col}" stroke="${dark}" stroke-width="5" stroke-linejoin="round"/><rect x="30" y="84" width="140" height="18" rx="9" fill="${col}" stroke="${dark}" stroke-width="5"/><circle cx="100" cy="56" r="17" fill="#FFF4C9" stroke="#8A5A0E" stroke-width="5"/><circle cx="100" cy="56" r="28" fill="#FFE38A" opacity=".35"/>`;
  const lid = (cx, cy, rx, ry, col) => `<ellipse class="svlid" data-lid="${kind}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${col}" stroke="#2a160b" stroke-width="2"/>`;
  const mouth = (cx, cy, rx, ry) => `<ellipse class="svmouth" data-mouth="${kind}" data-type="svg" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#4E1510"/>`;
  let body = '';
  if (kind === 'Golu') body = `<ellipse cx="100" cy="132" rx="72" ry="66" fill="#7B6670" stroke="#3B2C33" stroke-width="5"/><ellipse cx="100" cy="150" rx="44" ry="32" fill="#E9CFC6"/>${eye(76, 120, 6)}${eye(124, 120, 6)}<ellipse cx="100" cy="142" rx="17" ry="12" fill="#F48FA6" stroke="#A0566A" stroke-width="3"/><path d="M86 162 Q100 174 114 162" fill="none" stroke="#3B2C33" stroke-width="4" stroke-linecap="round"/><circle cx="64" cy="146" r="8" fill="#F7A9B9" opacity=".7"/><circle cx="136" cy="146" r="8" fill="#F7A9B9" opacity=".7"/>${helmet('#4DB45C', '#1E5A27')}${lid(76, 120, 9, 9, '#7B6670')}${lid(124, 120, 9, 9, '#7B6670')}${mouth(100, 170, 11, 8)}<ellipse cx="62" cy="192" rx="24" ry="14" fill="#F2B9A6" stroke="#3B2C33" stroke-width="4"/><ellipse cx="138" cy="192" rx="24" ry="14" fill="#F2B9A6" stroke="#3B2C33" stroke-width="4"/>`;
  if (kind === 'Mitthu') body = `<path d="M84 60 Q78 30 96 36 Q100 20 112 34 Q128 26 120 58Z" fill="#E8453C" stroke="#7A1C16" stroke-width="4"/><ellipse cx="100" cy="130" rx="64" ry="68" fill="#43B85C" stroke="#1D5C2F" stroke-width="5"/><ellipse cx="78" cy="118" rx="17" ry="19" fill="#fff"/><ellipse cx="122" cy="118" rx="17" ry="19" fill="#fff"/>${eye(80, 120, 8)}${eye(120, 120, 8)}<path d="M84 140 Q100 128 116 140 Q114 170 100 176 Q86 166 84 140Z" fill="#F7A23A" stroke="#9A4C0E" stroke-width="4"/><path d="M88 150 Q100 158 112 150" fill="none" stroke="#9A4C0E" stroke-width="3"/>${helmet('#3D7DE0', '#173985')}${lid(78, 118, 18, 20, '#43B85C')}${lid(122, 118, 18, 20, '#43B85C')}${mouth(100, 160, 9, 7)}<path d="M34 196 Q40 160 62 172 Q66 190 60 200Z" fill="#2E9A4A" stroke="#1D5C2F" stroke-width="4"/><path d="M166 196 Q160 160 138 172 Q134 190 140 200Z" fill="#2E9A4A" stroke="#1D5C2F" stroke-width="4"/>`;
  if (kind === 'Tinku') {
    let sp = '';
    for (let k = 0; k < 15; k++) {
      const a = (-200 + k * 15.7) * Math.PI / 180, b = (-192 + k * 15.7) * Math.PI / 180, c = (-184 + k * 15.7) * Math.PI / 180;
      sp += `${(100 + 66 * Math.cos(a)).toFixed(1)},${(132 + 64 * Math.sin(a)).toFixed(1)} ${(100 + 92 * Math.cos(b)).toFixed(1)},${(132 + 90 * Math.sin(b)).toFixed(1)} ${(100 + 66 * Math.cos(c)).toFixed(1)},${(132 + 64 * Math.sin(c)).toFixed(1)} `;
    }
    body = `<polygon points="${sp}" fill="#7A5233" stroke="#3E2814" stroke-width="4" stroke-linejoin="round"/><ellipse cx="100" cy="134" rx="66" ry="64" fill="#8C613D" stroke="#3E2814" stroke-width="5"/><ellipse cx="100" cy="146" rx="48" ry="42" fill="#F2D2A8"/>${eye(80, 128, 7)}${eye(120, 128, 7)}<circle cx="100" cy="150" r="9" fill="#24140c"/><path d="M88 164 Q100 174 112 164" fill="none" stroke="#3E2814" stroke-width="4" stroke-linecap="round"/><circle cx="66" cy="152" r="8" fill="#F7A9B9" opacity=".7"/><circle cx="134" cy="152" r="8" fill="#F7A9B9" opacity=".7"/>${helmet('#E2533B', '#7A1C16')}${lid(80, 128, 10, 10, '#8C613D')}${lid(120, 128, 10, 10, '#8C613D')}${mouth(100, 172, 10, 7)}<ellipse cx="64" cy="192" rx="22" ry="13" fill="#E9C095" stroke="#3E2814" stroke-width="4"/><ellipse cx="136" cy="192" rx="22" ry="13" fill="#E9C095" stroke="#3E2814" stroke-width="4"/>`;
  }
  if (kind === 'Narrator') body = `<circle cx="100" cy="100" r="80" fill="#3A2645" stroke="#F6B73C" stroke-width="8"/><path d="M70 110 L100 52 L130 110 L100 146Z" fill="#43CFC4" stroke="#126B65" stroke-width="6" stroke-linejoin="round"/>`;
  return `<svg viewBox="${vb}" aria-hidden="true" overflow="visible">${body}</svg>`;
}
function pngRig(who, style = '') { const src = IMG + PNG[who]; return `<div class="rigbox" style="${style}"><img src="${src}" alt=""><div class="rigLayer">${rigHTML(src, RIGS[PNG[who]])}</div></div>`; }
function charFull(who) { return PNG[who] ? pngRig(who) : peekSVG(who); }
function avatarHTML(who) {
  if (who === 'Bobo') { const src = IMG + 'characters/avatar_bobo.png'; return `<div class="boboAv rigbox"><img src="${src}" alt=""><div class="rigLayer">${rigHTML(src, RIGS['characters/avatar_bobo.png'])}</div></div>`; }
  return `<div class="slot">${PNG[who] ? pngRig(who, AVCROP[who]) : peekSVG(who, '10 6 180 194')}</div>`;
}

/* ===================== GEOMETRY (0–100 box, from rough game) ===================== */
const CEN = { circle: [50, 50], square: [50, 50], rect: [50, 50], triangle: [50, 58.67], hexagon: [50, 50] };
const rim = (a, r = 44) => { const t = a * Math.PI / 180; return [50 + r * Math.cos(t), 50 + r * Math.sin(t)]; };
const arc = (a0, a1, s) => { const p = []; for (let i = 0; i <= s; i++) p.push(rim(a0 + (a1 - a0) * i / s)); return p; };
const A = [50, 8], B = [6, 84], Cc = [94, 84], G = [50, 58.67];
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const BOX = { square: [10, 10, 90, 90], rect: [4, 24, 96, 76] };
const hv = k => rim(-90 + 60 * k, 45);
function outline(s) {
  if (s == 'circle') return arc(0, 360, 72).slice(0, 72);
  if (BOX[s]) { const [x0, y0, x1, y1] = BOX[s]; return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]; }
  if (s == 'triangle') return [A, B, Cc];
  return [0, 1, 2, 3, 4, 5].map(hv);
}
function pieces(s, n) {
  if (s == 'circle') return [...Array(n)].map((_, k) => { const a0 = -90 + 360 * k / n; return [[50, 50], ...arc(a0, a0 + 360 / n, Math.max(4, Math.round(72 / n)))]; });
  if (BOX[s]) { const [x0, y0, x1, y1] = BOX[s], w = (x1 - x0) / n; return [...Array(n)].map((_, k) => [[x0 + k * w, y0], [x0 + (k + 1) * w, y0], [x0 + (k + 1) * w, y1], [x0 + k * w, y1]]); }
  if (s == 'triangle') {
    const ab = mid(A, B), bc = mid(B, Cc), ca = mid(Cc, A);
    if (n == 2) return [[A, B, bc], [A, bc, Cc]];
    if (n == 3) return [[A, B, G], [B, Cc, G], [Cc, A, G]];
    return [[A, ab, ca], [ab, B, bc], [ca, bc, Cc], [ab, bc, ca]];
  }
  const c = [50, 50];
  if (n == 6) return [0, 1, 2, 3, 4, 5].map(k => [c, hv(k), hv(k + 1)]);
  if (n == 3) return [0, 1, 2].map(k => [c, hv(2 * k), hv(2 * k + 1), hv(2 * k + 2)]);
  return [[hv(0), hv(1), hv(2), hv(3)], [hv(3), hv(4), hv(5), hv(0)]];
}
function cutLines(s, n) {
  if (s == 'circle') return n == 2 ? [[[50, 6], [50, 94]]] : [...Array(n)].map((_, k) => [[50, 50], rim(-90 + 360 * k / n)]);
  if (BOX[s]) { const [x0, y0, x1, y1] = BOX[s]; return [...Array(n - 1)].map((_, k) => { const x = x0 + (x1 - x0) * (k + 1) / n; return [[x, y0], [x, y1]]; }); }
  if (s == 'triangle') {
    const ab = mid(A, B), bc = mid(B, Cc), ca = mid(Cc, A);
    if (n == 2) return [[A, bc]]; if (n == 3) return [[G, A], [G, B], [G, Cc]]; return [[ab, bc], [bc, ca], [ca, ab]];
  }
  const c = [50, 50]; if (n == 2) return [[hv(0), hv(3)]]; if (n == 3) return [[c, hv(0)], [c, hv(2)], [c, hv(4)]]; return [0, 1, 2, 3, 4, 5].map(k => [c, hv(k)]);
}
const P = a => a.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
const cent = a => { let x = 0, y = 0; a.forEach(p => { x += p[0]; y += p[1]; }); return [x / a.length, y / a.length]; };
const shrink = (a, k, c) => { c = c || cent(a); return a.map(p => [c[0] + (p[0] - c[0]) * k, c[1] + (p[1] - c[1]) * k]); };
const VB = '-6 -6 112 112';

/* ===================== ART ===================== */
function buildDefs() {
  let h = `<pattern id="stoneTex" patternUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><image href="${IMG}props/stone_round.png" x="-40" y="-40" width="180" height="180" preserveAspectRatio="none"/></pattern>`;
  LEVELS.forEach((L, i) => {
    h += `<linearGradient id="gg${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${L.c[0]}"/><stop offset=".5" stop-color="${L.c[1]}"/><stop offset="1" stop-color="${L.c[2]}"/></linearGradient>`;
  });
  $('defsInner').innerHTML = h;
}
const LI = Lv => LEVELS.indexOf(Lv);
function gemPoly(Lv, pc, opt = {}) {
  const c = cent(pc), hi = shrink(pc, .55, c);
  const red = opt.red, sw = opt.sw || 2.4;
  return `<g ${opt.attr || ''}><polygon points="${P(pc)}" fill="url(#gg${LI(Lv)})" stroke="${red ? '#FF3B2F' : Lv.c[2]}" stroke-width="${red ? 4.5 : sw}" stroke-linejoin="round"/>` +
    `<polygon points="${P(hi)}" fill="#fff" opacity=".2"/><circle cx="${(c[0] - 4).toFixed(1)}" cy="${(c[1] - 4).toFixed(1)}" r="2.6" fill="#fff" opacity=".75"/></g>`;
}
function stoneBase(Lv) {
  if (Lv.shape === 'circle') return `<image href="${IMG}props/stone_round.png" x="4.5" y="4.5" width="91" height="91" preserveAspectRatio="none"/>`;
  const o = outline(Lv.shape), c = CEN[Lv.shape];
  return `<polygon points="${P(o)}" fill="url(#stoneTex)" stroke="#5B4636" stroke-width="5.5" stroke-linejoin="round"/>` +
    `<polygon points="${P(shrink(o, .86, c))}" fill="none" stroke="rgba(60,40,25,.45)" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<polygon points="${P(o)}" fill="none" stroke="rgba(255,225,180,.4)" stroke-width="1.2" stroke-linejoin="round" transform="translate(-1 -1)"/>`;
}
const groove = ([a, b]) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#2A1A10" stroke-width="2.8" stroke-linecap="round"/><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="rgba(255,220,170,.35)" stroke-width="1" transform="translate(1 1)"/>`;
function rockCut(Lv, rev, n) {
  let h = stoneBase(Lv);
  if (rev) pieces(Lv.shape, n).forEach((pc, k) => { if (k < rev) h += `<polygon points="${P(pc)}" fill="#2A1A10"/>` + gemPoly(Lv, shrink(pc, .97)); });
  cutLines(Lv.shape, n).forEach(l => h += groove(l));
  return h;
}
function gemSplit(Lv, n, opt = {}) {
  const c = CEN[Lv.shape];
  return pieces(Lv.shape, n).map((pc, k) => {
    const m = cent(pc); let dx = m[0] - c[0], dy = m[1] - c[1]; const d = Math.hypot(dx, dy) || 1; dx = dx / d * 4; dy = dy / d * 4;
    if (opt.gone && opt.gone(k)) return '';
    return gemPoly(Lv, pc, { red: opt.extra && opt.extra(k), attr: `transform="translate(${dx.toFixed(1)} ${dy.toFixed(1)})"` });
  }).join('');
}
function pieceMini(Lv, pc) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pc.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
  const s = Math.max(x1 - x0, y1 - y0) + 8, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return `<svg viewBox="${(cx - s / 2).toFixed(1)} ${(cy - s / 2).toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)}" aria-hidden="true">${gemPoly(Lv, pc, { sw: s / 16 })}</svg>`;
}
const svgWrap = inner => `<svg viewBox="${VB}" aria-hidden="true">${inner}</svg>`;
const HAMMER = `<svg viewBox="0 0 66 66" aria-hidden="true"><rect x="30" y="18" width="7" height="46" rx="3" transform="rotate(-40 33 41)" fill="#A9733F" stroke="#5E3414" stroke-width="1.5"/><rect x="6" y="6" width="34" height="16" rx="3" transform="rotate(-40 23 14)" fill="#8D93A0" stroke="#3E4350" stroke-width="2"/></svg>`;
const SACK = `<svg viewBox="0 0 100 110" aria-hidden="true"><path d="M30 22 Q50 30 70 22 L74 30 Q96 60 88 92 Q82 108 50 108 Q18 108 12 92 Q4 60 26 30Z" fill="#C79A5B" stroke="#6B4A22" stroke-width="4" stroke-linejoin="round"/><path d="M28 24 Q50 34 72 24" fill="none" stroke="#6B4A22" stroke-width="6"/><path d="M40 8 Q50 22 60 8" fill="none" stroke="#6B4A22" stroke-width="5" stroke-linecap="round"/><path d="M24 60 Q50 70 78 58 M20 80 Q50 90 82 78" fill="none" stroke="#A47A44" stroke-width="3"/></svg>`;


/* ===================== CHARACTER RIGS: blinking + lip-sync =====================
   Positions are % of each image. eyes: [cx, cy, w, h]. Mouth 'jaw' = a patch of the
   picture (lower lip + chin) that slides up to close / down to open the painted mouth.
   Mouth 'draw' = a drawn mouth that opens on a closed smile line. */
const RIGS = {
  'story_02_chiku_promise.jpg': [
    { who: 'Chiku', lid: '#EC9D71', eyes: [[40.4, 40.4, 3.4, 4.6], [44.4, 39.8, 1.4, 4.6]], mouth: { type: 'draw', x: 42.6, y: 45.2, w: 2.6, h: 2.4 } },
    { who: 'Bobo', lid: '#EFC7A6', eyes: [[58.25, 39.0, 1.9, 5.2], [62.7, 42.5, 3.4, 4.6]], mouth: { type: 'jaw', x: 56.8, y: 48.6, w: 5.6, h: 3.2, up: 1.0 } }],
  'story_03_bobo_promise.jpg': [
    { who: 'Chiku', lid: '#F6B37A', eyes: [[39.8, 39.7, 3.3, 4.8], [44.3, 39.7, 1.4, 5.0]], mouth: { type: 'jaw', x: 39.3, y: 48.0, w: 5.0, h: 3.0, up: 1.1 } },
    { who: 'Bobo', lid: '#E8C2A6', eyes: [[58.9, 38.3, 2.1, 5.0], [63.4, 42.9, 2.9, 5.4]], mouth: { type: 'jaw', x: 58.0, y: 48.4, w: 5.6, h: 3.2, up: 1.5 } }],
  'story_04_chamber_stones.jpg': [
    { who: 'Chiku', lid: '#F0A877', eyes: [[22.0, 43.5, 3.0, 3.8], [26.0, 42.6, 1.4, 5.4]], mouth: { type: 'jaw', x: 24.0, y: 48.3, w: 2.6, h: 2.3, up: 0.9 } },
    { who: 'Bobo', lid: '#EDC7A8', eyes: [[39.25, 41.6, 2.6, 4.2], [43.05, 44.3, 1.8, 3.6]] }],
  'story_05_bobo_idea.jpg': [
    { who: 'Bobo', lid: '#EBB087', eyes: [[42.65, 38.0, 6.0, 11.4], [51.4, 42.2, 4.0, 9.6]] }],
  'story_07_bobo_pointing.jpg': [
    { who: 'Bobo', lid: '#F7BB90', eyes: [[40.1, 38.3, 5.1, 10], [50.3, 38.7, 5, 9.8]] }],
  'story_06_bobo_help.jpg': [
    { who: 'Bobo', lid: '#F3B98F', eyes: [[40.0, 38.25, 5.4, 10.6], [50.25, 38.9, 5.0, 10.0]] }],
  'characters/chiku.png': [
    { who: 'Chiku', lid: '#F7B57E', eyes: [[66.3, 41.4, 12.5, 14.3], [84.8, 43.6, 4.5, 8.0]], mouth: { type: 'jaw', x: 63.0, y: 63.5, w: 19.0, h: 7.0, up: 2.5 } }],
  'characters/avatar_bobo.png': [
    { who: 'Bobo', lid: '#EFC9AA', eyes: [[44.5, 57.5, 11, 14], [68, 63, 8, 12]], mouth: { type: 'jaw', x: 40, y: 79, w: 36, h: 12, up: 4.5 } }],
  'characters/golu.png': [
    { who: 'Golu', lid: '#6E6680', eyes: [[37.5, 47.5, 9, 13.3], [59.5, 52.5, 7, 13.3]], mouth: { type: 'jaw', x: 32, y: 67.5, w: 18, h: 7.5, up: 4.2 } }],
  'characters/golu_full.png': [
    { who: 'Golu', lid: '#6E6680', eyes: [[37.5, 28.5, 9, 8], [59.5, 31.5, 7, 8]] }],
  'characters/mitthu.png': [
    { who: 'Mitthu', lid: '#A86A40', eyes: [[50, 40.5, 9, 10.3], [67.5, 46.6, 6.5, 10.3]], mouth: { type: 'jaw', x: 50, y: 57.8, w: 14, h: 7.8, up: 4.8 } }],
  'characters/mitthu_full.png': [
    { who: 'Mitthu', lid: '#A86A40', eyes: [[50, 23.5, 9, 6], [67.5, 27, 6.5, 6]] }],
  'characters/tinku.png': [
    { who: 'Tinku', lid: '#B5713E', eyes: [[42, 47.3, 9.5, 12.5], [59, 42, 6.5, 11.6]], mouth: { type: 'jaw', x: 46, y: 61.6, w: 13, h: 8, up: 4.5 } }],
  'characters/tinku_full.png': [
    { who: 'Tinku', lid: '#B5713E', eyes: [[42, 26.5, 9.5, 7], [59, 23.5, 6.5, 6.5]] }],
  'characters/bobo.png': [
    { who: 'Bobo', lid: '#ECBA99', eyes: [[51.1, 42.9, 11.3, 12.4], [67.2, 48.7, 8.7, 10.6]], mouth: { type: 'jaw', x: 45.0, y: 61.5, w: 21.0, h: 7.0, up: 2.2 } }]
};
function rigHTML(src, list) {
  if (!list) return '';
  return list.map(r => {
    let h = '';
    r.eyes.forEach(([cx, cy, w, hh]) => { const W = w * 1.18, H = hh * 1.15; h += `<i class="lid" data-lid="${r.who}" style="left:${(cx - W / 2).toFixed(2)}%;top:${(cy - H / 2).toFixed(2)}%;width:${W.toFixed(2)}%;height:${H.toFixed(2)}%;background:${r.lid}"></i>`; });
    const m = r.mouth;
    if (m && m.type === 'jaw') h += `<i class="jaw" data-mouth="${r.who}" data-type="jaw" data-up="${(m.up / m.h * 100).toFixed(1)}" data-down="${(m.up * .35 / m.h * 100).toFixed(1)}" style="left:${m.x}%;top:${m.y}%;width:${m.w}%;height:${m.h}%;background-image:url('${src}');background-size:${(10000 / m.w).toFixed(2)}% ${(10000 / m.h).toFixed(2)}%;background-position:${(m.x / (100 - m.w) * 100).toFixed(3)}% ${(m.y / (100 - m.h) * 100).toFixed(3)}%"></i>`;
    if (m && m.type === 'draw') h += `<i class="mdraw" data-mouth="${r.who}" data-type="draw" style="left:${m.x - m.w / 2}%;top:${m.y}%;width:${m.w}%;height:${m.h}%"></i>`;
    return h;
  }).join('');
}
const rigLayer = $('storyRig');
function buildStoryRig(bg) { rigLayer.innerHTML = rigHTML(IMG + 'backgrounds/' + bg, RIGS[bg]); }

/* lip-sync: mouth shape follows the letters being spoken; re-synced on every spoken word */
const LIP = { tok: 0, who: null, text: '', base: 0, idx: 0, msPer: 68, on: false };
function lipStart(who, text, rate = 1) { LIP.tok++; Object.assign(LIP, { who, text: text.toLowerCase(), base: performance.now(), idx: 0, msPer: 68 / rate, on: true }); return LIP.tok; }
function lipSync(tok, i) { if (tok === LIP.tok) { LIP.base = performance.now(); LIP.idx = i; } }
function lipStop(tok) { if (tok === LIP.tok) LIP.on = false; }
function openFor(c) {
  if (!c) return .05;
  if ('ao'.includes(c)) return 1; if (c === 'e') return .8; if ('iuy'.includes(c)) return .55;
  if ('mbp'.includes(c)) return 0; if ('fv'.includes(c)) return .22; if ('wq'.includes(c)) return .4;
  if (/[a-z]/.test(c)) return .42; if (/[0-9]/.test(c)) return .7; if (c === ' ') return .18; return .04;
}
function lipValue(now) {
  const k = LIP.idx + (now - LIP.base) / LIP.msPer;
  if (k >= LIP.text.length) return .05;
  return openFor(LIP.text[Math.floor(k)]) * (.82 + .18 * Math.sin(now / 47));
}
(function lipLoop(now) {
  document.querySelectorAll('[data-mouth]').forEach(el => {
    const type = el.dataset.type, talking = LIP.on && LIP.who === el.dataset.mouth;
    const tgt = talking ? lipValue(now) : (type === 'jaw' ? .75 : 0);
    el._v = el._v == null ? tgt : el._v + (tgt - el._v) * .4;
    const v = el._v;
    if (type === 'jaw') { const up = +el.dataset.up, dn = +el.dataset.down, ty = v < .75 ? -(.75 - v) / .75 * up : (v - .75) / .25 * dn; el.style.transform = `translateY(${ty.toFixed(1)}%)`; }
    else el.style.transform = `scaleY(${Math.max(0, v).toFixed(3)})`;
  });
  requestAnimationFrame(lipLoop);
})(0);
/* blinking: each character blinks every 2–6 s (sometimes a double blink) */
const BLINK = {};
setInterval(() => {
  const now = performance.now(), groups = {};
  document.querySelectorAll('[data-lid]').forEach(e => (groups[e.dataset.lid] = groups[e.dataset.lid] || []).push(e));
  for (const w in groups) {
    if (!BLINK[w]) BLINK[w] = now + 800 + Math.random() * 2500;
    if (now >= BLINK[w]) {
      groups[w].forEach(e => { e.classList.remove('blink'); void e.getBoundingClientRect(); e.classList.add('blink'); });
      BLINK[w] = now + (Math.random() < .2 ? 300 : 2200 + Math.random() * 3800);
    }
  }
}, 90);

/* ===================== INCORRECT FEEDBACK (sheet columns G–J) =====================
   Attempt 1: "Oops! Try again." pop + red glow and wiggle on what was tapped.
   Attempt 2: hint card (💡 Hint) + the hint animation, stays until the next right step. */
function oops(el, text = 'Oops! Try again.', below = false) {
  SFX.bad();
  if (el) { el.classList.remove('fbRed'); void el.offsetWidth; el.classList.add('fbRed'); wig(el); setTimeout(() => el.classList.remove('fbRed'), 1600); }
  document.querySelectorAll('.oopsPop').forEach(e => e.remove());
  const p = document.createElement('div'); p.className = 'oopsPop'; p.innerHTML = `<i>✕</i><span>${text}</span>`;
  const r = el ? rel(el) : { cx: 960, y: 520 };
  if (el && el.closest && el.closest('#board')) below = true;   // on a board: badge goes under the item, never over the heading
  p.style.left = Math.max(260, Math.min(1660, r.cx)) + 'px'; p.style.top = (below ? r.y + r.h + 92 : Math.max(150, r.y - 20)) + 'px';
  stage.appendChild(p); setTimeout(() => p.remove(), 1900);
}
function hintCard(text) {
  document.querySelectorAll('.oopsPop').forEach(e => e.remove());   // the hint replaces the Oops badge (never on top of each other)
  // a board is open: show the hint inside it, so it never covers the keys or the Check button
  const boardOpen = !$('board').hidden, tipEl = boardOpen && ($('hintSlot') || $('ptip'));
  if (tipEl) { tipEl.classList.remove('bad'); if (!tipEl.dataset.orig) tipEl.dataset.orig = tipEl.innerHTML; tipEl.innerHTML = `<span class="hintInline"><b class="bulb">💡</b> ${text}</span>`; SFX.sparkle(); return; }
  // Level 1 without a board: the instruction bar itself becomes the hint
  if (!$('game').hidden) { const v = $('vo'); v.classList.add('hint'); SFX.sparkle(); return; }
  let c = $('hintCard');
  if (!c) { c = document.createElement('div'); c.id = 'hintCard'; stage.appendChild(c); }
  c.innerHTML = `<b class="bulb">💡</b><p>${text}</p>`;
  // Level 2: sit above the number bar so the keys stay tappable
  c.classList.toggle('l2', !$('lvl2').hidden);
  c.classList.remove('show'); void c.offsetWidth; c.classList.add('show'); c.hidden = false;
  SFX.sparkle();
}
function hideHint() {
  const c = $('hintCard'); if (c) c.hidden = true; $('vo').classList.remove('hint');
  ['hintSlot', 'ptip'].forEach(id => { const t = $(id); if (t && t.querySelector('.hintInline')) { t.innerHTML = t.dataset.orig && id === 'hintSlot' ? t.dataset.orig : ''; delete t.dataset.orig; } });
}

/* ===================== HAND POINTER + IDLE ===================== */
const hand = $('hand');
let traceAnim = 0;
function handAt(x, y) { hand.style.transform = `translate(${x - 33}px,${y - 10}px)`; }
function handTapOn(el) { if (!el) return; const r = rel(el); traceAnim++; hand.hidden = false; hand.className = 'tap'; handAt(r.cx, r.cy); }
function handHide() { traceAnim++; hand.hidden = true; hand.className = ''; }
/** move the hand along stage-space points; resolves when done */
function handTrace(pts, ms) {
  const id = ++traceAnim; hand.hidden = false; hand.className = '';
  const segs = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); segs.push(d); tot += d; }
  return new Promise(res => {
    const t0 = performance.now();
    const step = now => {
      if (id !== traceAnim) return res();
      const t = Math.min(1, (now - t0) / ms); let d = t * tot, i = 0;
      while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
      const f = segs[i] ? d / segs[i] : 0, a = pts[i], b = pts[i + 1] || a;
      handAt(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
      if (t < 1) requestAnimationFrame(step); else res();
    };
    handAt(pts[0].x, pts[0].y); setTimeout(() => requestAnimationFrame(step), 350);
  });
}
let idleT = null, idleCfg = null;
const tut = () => S.li === 0;
function idle(cfg) {
  clearTimeout(idleT); handHide(); idleCfg = cfg || null; if (!cfg) return;
  if (cfg.now) showIdleHand(cfg);
  idleT = setTimeout(() => fireIdle(cfg), tut() ? 7000 : 10000);
}
function fireIdle(cfg) {
  if (idleCfg !== cfg || S.busy) { if (idleCfg === cfg) idleT = setTimeout(() => fireIdle(cfg), 3000); return; }
  if (cfg.who) say(cfg.who, cfg.text);
  showIdleHand(cfg);
  idleT = setTimeout(() => fireIdle(cfg), 14000);
}
async function showIdleHand(cfg) {
  if (cfg.trace) {
    const id = traceAnim + 1;
    for (let k = 0; k < 3; k++) { const pts = cfg.trace(); if (!pts) return; await handTrace(pts, cfg.slow ? 2600 : 1600); if (traceAnim !== id) return; await sleep(500); if (traceAnim !== id) return; }
    handHide();
  } else handTapOn(cfg.target && cfg.target());
}
function stopIdle() { clearTimeout(idleT); idleCfg = null; handHide(); }

/* ===================== VO BAR + FEEDBACK ===================== */
function say(who, text) {
  $('voAv').innerHTML = avatarHTML(who);
  { const n = String(text).length; $('voLine').classList.toggle('long', n > 60 && n <= 85); $('voLine').classList.toggle('xlong', n > 85); }
  $('voLine').innerHTML = `<span>${String(text).replace(/(\d+\/\d+)/g, '<b>$1</b>')}</span>`;
  const vo = $('vo'); vo.classList.remove('pop'); void vo.offsetWidth; vo.classList.add('pop');
  const av = $('voAv'); av.classList.remove('talk'); void av.offsetWidth; av.classList.add('talk');
  return speak(text, who);
}
let fbT = null;
/* Level 1: all instructions and feedback live in the top instruction panel only.
   The old centre pill is switched off so the same text never shows in two places. */
function fb(t, cls, ms = 0) {
  const f = $('fb'); clearTimeout(fbT);
  f.hidden = true; return;
  f.innerHTML = t; f.className = cls || ''; f.hidden = false; f.style.animation = 'none'; void f.offsetWidth; f.style.animation = '';
  if (ms) fbT = setTimeout(() => f.hidden = true, ms);
}
function wig(el) { if (!el) return; el.classList.remove('wig'); void el.offsetWidth; el.classList.add('wig'); setTimeout(() => el.classList.remove('wig'), 1000); }
function particles(x, y, n, cls = 'chip', spread = 90) {
  for (let k = 0; k < n; k++) {
    const c = document.createElement('div'); c.className = cls; c.style.left = x + 'px'; c.style.top = y + 'px';
    const a = Math.random() * Math.PI * 2, d = spread * (.4 + Math.random() * .8);
    c.style.setProperty('--dx', Math.cos(a) * d + 'px'); c.style.setProperty('--dy', Math.sin(a) * d + 'px');
    stage.appendChild(c); setTimeout(() => c.remove(), 900);
  }
}
function confetti(n = 40) {
  for (let i = 0; i < n; i++) {
    const Lv = LEVELS[i % LEVELS.length], f = document.createElement('div'); f.className = 'confetti';
    f.innerHTML = pieceMini(Lv, pieces(Lv.shape, 2 + (i % 3))[0]);
    f.style.left = (860 + Math.random() * 200) + 'px'; f.style.top = (500 + Math.random() * 80) + 'px';
    f.style.setProperty('--dx', (Math.random() - .5) * 1800 + 'px'); f.style.setProperty('--dy', (Math.random() * 900 - 600) + 'px');
    f.style.setProperty('--rot', (Math.random() * 900 - 450) + 'deg');
    f.style.animationDelay = (Math.random() * .3) + 's';
    stage.appendChild(f); setTimeout(() => f.remove(), 3200);
  }
}

/* ===================== GAME STATE ===================== */
let S = { li: 0 }, RUN = 0;
const L = () => LEVELS[S.li], M = () => L().crew.length;
const an = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const NUMW = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const wallEl = g => $('wall').children[g];
const firstGem = f => { for (let g = 0; g < L().count; g++) if (f(g)) return wallEl(g); return null; };

function loadLevel(i, opts = {}) {
  if (typeof hideBigHammer === 'function') { hideBigHammer(); hidePoseHammer(); hideHandHammer(); }
  RUN++; stopIdle(); hush();
  S = { li: i, phase: 'cut', n: null, tries: 0, ktries: 0, hint: false, busy: false, traced: [], lines: [], active: null, dir: {}, trTries: 0,
    box: 'top', val: { top: '', bot: '' }, nameTries: 0, saidHit: false, boardOpen: false };
  const Lv = L();
  S.cutDone = Array(Lv.count).fill(false); S.split = Array(Lv.count).fill(false); S.dealt = Array(Lv.count).fill(false);
  S.rev = Array(Lv.count).fill(0); S.buckets = Array(M()).fill(0);
  $('jump').value = i; $('btnAgain').hidden = true; closeBoard(); fb(null);
  // reset the trolley instantly (no slide back from where the last ride left it)
  const tr = $('train'); tr.style.transition = 'none'; tr.className = ''; tr.getAnimations().forEach(x => x.cancel());
  tr.style.transform = opts.rollin ? 'translateX(-1700px)' : ''; void tr.offsetWidth; tr.style.transition = '';
  renderTrain(opts.anim ? Lv.join : null); renderWall();
  const rid = RUN;
  if (opts.rollin) {
    // roll in from the left, stop in place, and only then start the chamber
    tr.classList.add('bump'); SFX.rumble(1.4);
    const a = tr.animate([{ transform: 'translateX(-1700px)' }, { transform: 'translateX(0)' }], { duration: 1600, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    a.finished.then(() => {
      if (rid !== RUN) return;
      a.cancel(); tr.style.transform = ''; tr.classList.remove('bump');
      SFX.tap(); if (!opts.silent) beginLevel(rid, 150);
    }).catch(() => {});
    return;
  }
  if (!opts.silent) beginLevel(RUN, 300);
}
async function beginLevel(rid, delay = 300) {
  const Lv = L();
  if (tut()) {
    wallEl(0).classList.add('glow');
    say('Bobo', 'Tap a stone to mark it with chalk.');
    idle({ who: 'Bobo', text: 'Tap a stone.', target: () => wallEl(0), now: true });
    return;
  }
  $('voAv').innerHTML = avatarHTML(Lv.arrive[0][0]); $('voLine').innerHTML = `<b>${Lv.title}</b> · ${Lv.plural}`;
  await sleep(delay);
  for (const [w, t] of Lv.arrive) { if (rid !== RUN || S.boardOpen) return; await say(w, t); await sleep(250); }
  if (rid !== RUN || S.boardOpen) return;
  const last = Lv.arrive[Lv.arrive.length - 1][0];
  idle({ who: last, text: 'Tap a stone.', target: () => wallEl(0) });
}

/* ---------- render: train with miners & buckets ---------- */
function renderTrain(joinMap) {
  const tr = $('train'); tr.innerHTML = '';
  const crew = L().crew, groups = []; for (let k = 0; k < crew.length; k += 2) groups.push(crew.slice(k, k + 2).map((n, j) => [n, k + j]));
  groups.forEach((gp, gi) => {
    if (gi) { const c = document.createElement('div'); c.className = 'coupler'; tr.appendChild(c); }
    const car = document.createElement('div'); car.className = 'car'; car.style.width = (gp.length * 192 + (gp.length - 1) * 26 + 50) + 'px';
    gp.forEach(([name, k]) => {
      const s = document.createElement('div'); s.className = 'seat'; s.id = 'seat' + k;
      if (joinMap && joinMap[name]) s.classList.add('join-' + joinMap[name]);
      s.innerHTML = `<div class="who">${charFull(name)}</div><div class="bucket"><div class="pile" id="pile${k}"></div></div><div class="tag" id="tag${k}"></div>`;
      car.appendChild(s);
    });
    if (gi === groups.length - 1) { const sk = document.createElement('div'); sk.className = 'sack'; sk.id = 'sack'; sk.innerHTML = SACK; car.appendChild(sk); }
    tr.appendChild(car);
  });
  for (let k = 0; k < crew.length; k++) fillPile(k);
  setHintSeats(S.hint);
}
function setHintSeats(on) {
  // the cut board is open: number the miner faces on the board itself (never lift the trolley over the board)
  const row = $('faceRow');
  if (row) {
    $('train').style.zIndex = '';
    row.classList.toggle('hintOn', !!on);
    row.querySelectorAll('.face').forEach((f, k) => {
      let b = f.querySelector('.fbadge');
      if (on && !b) { b = document.createElement('i'); b.className = 'fbadge'; b.textContent = k + 1; f.appendChild(b); }
      if (!on && b) b.remove();
    });
    return;
  }
  for (let k = 0; k < M(); k++) {
    const s = $('seat' + k); if (!s) continue;
    s.classList.toggle('glow', !!on);
    let b = s.querySelector('.badge');
    if (on && !b) { b = document.createElement('span'); b.className = 'badge'; b.textContent = k + 1; s.appendChild(b); }
    if (!on && b) b.remove();
  }
}
function fillPile(k) {
  const p = $('pile' + k); if (!p) return;
  const pc = S.n ? pieces(L().shape, S.n)[0] : null; let h = '';   // same piece shape & direction in every tray
  const n = S.buckets[k], had = p.children.length;
  // lay the pieces out in a balanced grid inside the tray bed, keeping each piece's real shape
  const BW = 146, BH = 34;
  let aw = 1, ah = 1;
  if (pc) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pc.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }); aw = x1 - x0 + 8; ah = y1 - y0 + 8; }
  let best = { size: 0, r: 1, c: Math.max(n, 1) };
  for (let r = 1; r <= 3; r++) {
    const c = Math.ceil(Math.max(n, 1) / r), cw = BW / c, ch = BH / r;
    const sc = Math.min(cw / aw, ch / ah) * Math.max(aw, ah);       // longest side of the fitted piece
    if (sc > best.size + .5) best = { size: sc, r, c };
  }
  const cw = BW / best.c, ch = BH / best.r;
  const tight = (() => { if (!pc) return ''; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pc.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    return `viewBox="${(x0 - 4).toFixed(1)} ${(y0 - 4).toFixed(1)} ${(x1 - x0 + 8).toFixed(1)} ${(y1 - y0 + 8).toFixed(1)}"`; })();
  for (let j = 0; j < n; j++) h += pieceMini(L(), pc).replace(/viewBox="[^"]*"/, tight).replace('<svg ', `<svg style="width:${cw.toFixed(1)}px;height:${ch.toFixed(1)}px" ${j >= had && had ? 'class="new" ' : ''}`);
  p.innerHTML = h;
  $('tag' + k).textContent = `${L().crew[k]} · ` + (S.buckets[k] && S.n ? `${S.buckets[k]}/${S.n}` : '0');
}

/* ---------- render: wall of stones ---------- */
function layoutWall(n) {
  const W = 1500, H = 316, gap = n <= 3 ? 52 : 30; let best = { s: 0, per: n };
  for (let r = 1; r <= 3; r++) { const per = Math.ceil(n / r), s = Math.min((W - (per - 1) * gap) / per, (H - (r - 1) * gap) / r, 236); if (s > best.s + 1) best = { s, per }; }
  const w = $('wall'); w.dataset.shape = L().shape; w.style.setProperty('--g', best.s + 'px'); w.style.gap = gap + 'px';
  w.style.width = (best.per * best.s + (best.per - 1) * gap) + 'px';
}
function cellHTML(g) {
  const Lv = L();
  if (!S.split[g]) return svgWrap(S.cutDone[g] ? rockCut(Lv, S.rev[g], S.n) : stoneBase(Lv));
  if (!S.dealt[g]) return svgWrap(gemSplit(Lv, S.n));
  return svgWrap(gemSplit(Lv, S.n, { gone: k => k < M(), extra: k => k >= M() }));
}
function renderWall() {
  const w = $('wall'); w.innerHTML = ''; layoutWall(L().count);
  for (let g = 0; g < L().count; g++) {
    const b = document.createElement('button'); b.className = 'gem'; b.setAttribute('aria-label', `stone ${g + 1}`);
    b.innerHTML = cellHTML(g); b.onclick = () => onGem(g); w.appendChild(b);
  }
}
function setCell(g, cls) {
  const b = wallEl(g); b.innerHTML = cellHTML(g); b.classList.remove('pop', 'shake', 'glow');
  if (cls) { void b.offsetWidth; b.classList.add(cls); }
  b.classList.toggle('dealt', S.dealt[g] && S.n <= M());
  b.classList.toggle('redglow', S.dealt[g] && S.n > M());
}
function onGem(g) {
  if (S.busy || S.boardOpen) return;
  SFX.tap();
  if (S.phase == 'cut') return openCut(g);
  if (S.phase == 'hammer' && !S.split[g]) return hammerStone(g);
  if (S.phase == 'deal' && S.split[g] && !S.dealt[g]) return deal(g);
}

/* ---------- board ---------- */
function showBoard(html, width) {
  document.querySelectorAll('.oopsPop').forEach(e => e.remove());   // no stale Oops badge on a new board
  const b = $('board'); b.innerHTML = html; b.style.width = ''; /* one board size & place everywhere (CSS) */ b.hidden = false; b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
  $('dim').hidden = false; S.boardOpen = true;
}
function closeBoard() { hideHint(); $('board').hidden = true; $('dim').hidden = true; S.boardOpen = false; $('train').style.zIndex = ''; }
const tip = (t, bad) => { const p = $('ptip'); if (p) { p.textContent = t; p.classList.toggle('bad', !!bad); } };

/* ---------- 1–3: mark (pick number) + trace ---------- */
function openCut(g) {
  stopIdle(); const Lv = L(); S.first = g; S.n = null; S.trTries = 0; S.pickOk = false;
  wallEl(g).classList.remove('glow');
  const speaker = tut() ? 'Chiku' : Lv.markBy;
  const line = tut() ? 'There are 2 of us. How many pieces should each stone be cut into?'
    : S.li === 1 ? 'How many pieces should each stone be cut into? Then trace the lines.'
      : `How many pieces for ${M()} miners? Then trace the lines.`;
  showBoard(`<h3>Mark the stone with chalk</h3>
    <div class="row"><div class="cutwrap"><svg id="big" viewBox="${VB}"></svg></div>
    <div class="col" style="width:620px"><p class="ptip" id="hintSlot" style="color:#5A2E0E">How many pieces?</p>
      <div class="keys" id="keys">${CUTS[Lv.shape].map(k => `<button class="key${S.hint && k == M() ? ' pulse' : ''}" data-k="${k}">${k}</button>`).join('')}</div>
      <div class="faceRow" id="faceRow">${Lv.crew.map((w, i) => `<div class="face" data-i="${i}">${miniFace(w)}<b></b><span>${w}</span></div>`).join('')}</div>
      <p class="ptip" id="ptip">Pick a number first.</p></div></div>`, 1180);
  $('board').querySelector('.cutwrap').insertAdjacentHTML('beforeend', '<div id="faceMap"></div>');
  if (S.hint && !$('faceRow')) { $('train').style.zIndex = 62; }
  $('keys').querySelectorAll('.key').forEach(b => b.onclick = () => pickN(+b.dataset.k, b));
  say(speaker, line);
  drawBig(); bindTrace();
  idle(tut() ? { who: 'Chiku', text: 'Tap a number.', target: () => keyEl(M()) } : { who: speaker, text: 'Pick a number, then trace the lines.', target: () => $('keys') });
}
const keyEl = k => $('keys') && $('keys').querySelector(`[data-k="${k}"]`);
async function pickN(k, btn) {
  if (S.busy) return; SFX.tap();
  const rid = RUN;
  S.pickOk = k == M();
  previewCut(k);   // the stone shows k parts with a miner's face on each part
  if (k != M()) {
    const m = M(), crew = L().crew, who = tut() ? 'Chiku' : L().markBy;
    S.ktries++; $('keys').querySelectorAll('.key.bad').forEach(b => b.classList.remove('bad'));
    btn.classList.add('bad'); setTimeout(() => btn.classList.remove('bad'), 1600); tip('');
    const msg = k < m ? `${list(crew.slice(k))} would get nothing!` : `${k - m == 1 ? 'One piece' : NUMW[k - m] + ' pieces'} would be left over!`;
    oops(btn, k < m ? 'Oops! Someone gets nothing!' : 'Oops! Pieces left over!');
    S.busy = true;
    await say(who, `Oops! Try again. ${msg}`); if (rid !== RUN) return;
    if (S.ktries >= 2) {
      hintCard('Count the miners. One piece for each miner.'); await say(who, 'Count the miners. One piece for each miner.'); if (rid !== RUN) return;
      S.hint = true; setHintSeats(true); keyEl(m).classList.add('pulse');
    }
    // 3 wrong tries: the 4th attempt is locked to the right answer (no endless loop)
    if (S.ktries >= 3) {
      $('keys').querySelectorAll('.key').forEach(b => { if (+b.dataset.k != m) { b.disabled = true; b.classList.add('locked'); } });
      keyEl(m).classList.add('pulse');
      await say(who, `There are ${m} miners, so we cut the stone into ${m} pieces.`); if (rid !== RUN) return;
      S.busy = false; return pickN(m, keyEl(m));
    }
    S.busy = false;
    idle({ who, text: 'Tap a number.', target: () => keyEl(m) });
    return;
  }
  if (k == M()) hideHint();
  S.n = k; S.lines = cutLines(L().shape, k); S.traced = S.lines.map(() => 0); S.active = null; S.dir = {}; S.strokes = [];
  $('keys').querySelectorAll('.key').forEach(b => { b.classList.toggle('on', +b.dataset.k == k); b.classList.remove('pulse'); });
  drawBig();
  const traceCfg = { who: tut() ? 'Bobo' : L().markBy, text: tut() ? 'Trace the dotted line across the stone.' : 'Pick a number, then trace the lines.', trace: nextLinePts };
  stopIdle();
  S.hint = false; setHintSeats(false); $('train').style.zIndex = ''; hideHint();
  SFX.good(); tip('Yes! One piece for each of us.');
  S.busy = true; await say(tut() ? 'Chiku' : L().markBy, `Yes! ${M()} pieces, one for each of us.`); S.busy = false; if (rid !== RUN || S.phase !== 'cut') return;
  clearFaces();
  if (tut()) {
    if (!S.traced.some(t => t > 0)) { tip('Trace the dotted line across the stone with your finger.'); say('Bobo', 'Trace the dotted line across the stone with your finger.'); }
    idle(Object.assign({ now: true }, traceCfg));
  } else {
    tip(S.lines.length == 1 ? 'Trace the dotted line across the stone.' : `Trace the ${S.lines.length} dotted lines across the stone.`);
    idle(traceCfg);
  }
}
/* small round miner face for the cut board */
function miniFace(w) { return `<div class="mf"><div class="av">${avatarHTML(w)}</div></div>`; }
/* preview: split the big stone into k parts and put a miner's face on each part */
function previewCut(k) {
  const Lv = L(), m = M(), pcs = pieces(Lv.shape, k), map = $('faceMap'); if (!map) return;
  S.n = k; S.lines = cutLines(Lv.shape, k); S.traced = S.lines.map(() => 0); S.strokes = [];
  const svg = $('big');
  let h = stoneBase(Lv);
  pcs.forEach((pc, i) => h += `<polygon points="${P(pc)}" fill="${i < m ? 'rgba(120,230,140,.28)' : 'rgba(255,70,50,.38)'}" stroke="none"/>`);
  S.lines.forEach(([a, b]) => h += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#fff" stroke-width="2.4" stroke-dasharray="3 3" stroke-linecap="round"/>`);
  svg.innerHTML = h;
  const sz = $('board').querySelector('.cutwrap').getBoundingClientRect().width / SCALE;
  const ctr = pc => { let A = 0, X = 0, Y = 0; for (let j = 0; j < pc.length; j++) { const [x0, y0] = pc[j], [x1, y1] = pc[(j + 1) % pc.length], f = x0 * y1 - x1 * y0; A += f; X += (x0 + x1) * f; Y += (y0 + y1) * f; } return A ? [X / (3 * A), Y / (3 * A)] : cent(pc); };
  map.innerHTML = pcs.map((pc, i) => { const c = ctr(pc), x = (c[0] + 6) / 112 * sz, y = (c[1] + 6) / 112 * sz;
    return i < m ? `<div class="pf" style="left:${x}px;top:${y}px;animation-delay:${i * .12}s">${miniFace(Lv.crew[i])}</div>`
                 : `<div class="pf extra" style="left:${x}px;top:${y}px;animation-delay:${i * .12}s">?</div>`; }).join('');
  document.querySelectorAll('#faceRow .face').forEach((f, i) => { f.classList.toggle('got', i < k); f.classList.toggle('none', i >= k); });
  SFX.chalk();
}
function clearFaces() { const m = $('faceMap'); if (m) m.innerHTML = ''; document.querySelectorAll('#faceRow .face').forEach(f => f.classList.remove('got', 'none')); }
function svgToStage(svg, x, y) {
  const pt = svg.createSVGPoint(); pt.x = x; pt.y = y; const p = pt.matrixTransform(svg.getScreenCTM());
  const s = stage.getBoundingClientRect(); return { x: (p.x - s.left) / SCALE, y: (p.y - s.top) / SCALE };
}
function nextLinePts() {
  const svg = $('big'); if (!svg || !S.n) return null;
  const i = S.traced.findIndex(t => t < 1); if (i < 0) return null;
  const [a, b] = S.lines[i]; return [svgToStage(svg, a[0], a[1]), svgToStage(svg, b[0], b[1])];
}
function drawBig(live) {
  const svg = $('big'); if (!svg) return;
  let h = stoneBase(L());
  if (S.n) {
    const chalk = ps => `<polyline points="${ps.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" filter="drop-shadow(0 0 1.5px #fff)"/>`;
    S.lines.forEach(([a, b], i) => {
      if (S.traced[i] < 1) h += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#FFF6D6" stroke-opacity=".95" stroke-width="2.6" stroke-dasharray="3.5 3.5" stroke-linecap="round"/><circle cx="${a[0]}" cy="${a[1]}" r="2.6" fill="#FFE08A"/><circle cx="${b[0]}" cy="${b[1]}" r="2.6" fill="#FFE08A"/>`;
      else if (S.strokes && S.strokes[i]) h += chalk(S.strokes[i]);
    });
    if (live && live.length > 1) h += chalk(live);
  }
  svg.innerHTML = h;
}
function traceWrong(i, from, e) {
  S.trTries++; SFX.bad();
  drawBig([from, e]); setTimeout(() => { if (S.boardOpen) drawBig(); }, 450);
  const who = tut() ? 'Bobo' : L().markBy;
  if (S.trTries === 1) { tip(''); oops($('big')); say(who, 'Oops! Try again.'); idle({ who, text: tut() ? 'Trace the dotted line across the stone.' : 'Pick a number, then trace the lines.', trace: nextLinePts }); }
  else {
    const h = tut() ? 'Start at the glowing dot and follow the dots to the other end.' : 'Start at the glowing dot and follow the dots.';
    tip(''); oops($('big')); hintCard(h); say(who, h);
    idle({ who, text: tut() ? 'Trace the dotted line across the stone.' : 'Pick a number, then trace the lines.', trace: nextLinePts, now: true, slow: true });
  }
}
/* Free drawing: the child draws any line across the stone (no need to follow the dots).
   Each long-enough stroke counts as one cut; the stone cutter then makes the equal cuts. */
function bindTrace() {
  const svg = $('big');
  const toS = e => { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); };
  let lastChalk = 0, pts = null;
  svg.addEventListener('touchmove', e => e.preventDefault(), { passive: false });   // never scroll the page while tracing
  svg.onpointerdown = e => {
    if (e.preventDefault) e.preventDefault();
    if (!S.n || !S.pickOk || S.busy || S.traced.every(t => t >= 1)) return;
    svg.setPointerCapture(e.pointerId); stopIdle(); tip('');
    const p = toS(e); pts = [[p.x, p.y]]; S.active = 0; drawBig(pts);
  };
  svg.onpointermove = e => {
    if (!pts) return; const p = toS(e), q = pts[pts.length - 1];
    if (Math.hypot(p.x - q[0], p.y - q[1]) < 1.5) return;
    pts.push([p.x, p.y]); drawBig(pts);
    const now = performance.now(); if (now - lastChalk > 70) { SFX.chalk(); lastChalk = now; }
  };
  svg.onpointerup = svg.onpointercancel = () => {
    if (!pts) return; const stroke = pts; pts = null; S.active = null;
    let len = 0; for (let k = 1; k < stroke.length; k++) len += Math.hypot(stroke[k][0] - stroke[k - 1][0], stroke[k][1] - stroke[k - 1][1]);
    // the stroke must follow one of the dotted lines (close to it along most of its length)
    const match = i => {
      const [A, B] = S.lines[i], dx = B[0] - A[0], dy = B[1] - A[1], L2 = dx * dx + dy * dy, LL = Math.sqrt(L2), TOL = 9;
      let near = 0, lo = 1, hi = 0;
      stroke.forEach(([x, y]) => {
        const t = Math.max(0, Math.min(1, ((x - A[0]) * dx + (y - A[1]) * dy) / L2)), d = Math.hypot(x - A[0] - t * dx, y - A[1] - t * dy);
        if (d <= TOL) { near++; lo = Math.min(lo, t); hi = Math.max(hi, t); }
      });
      return { ok: near / stroke.length >= .75 && (hi - lo) >= .7 && len >= LL * .55, score: near / stroke.length + (hi - lo) };
    };
    let best = -1, bs = 0;
    S.traced.forEach((t, i) => { if (t >= 1) return; const m = match(i); if (m.ok && m.score > bs) { bs = m.score; best = i; } });
    const who = tut() ? 'Bobo' : L().markBy;
    if (best < 0) {
      S.trTries = (S.trTries || 0) + 1; drawBig();
      if (S.trTries >= 3) {   // loop ends: the line is traced for the child
        const i = S.traced.findIndex(t => t < 1); S.traced[i] = 1; (S.strokes = S.strokes || [])[i] = S.lines[i].slice();
        say(who, 'Like this, along the dotted line.'); S.trTries = 0; drawBig(); afterLine(); return;
      }
      oops(svg, 'Trace the dotted line!');
      say(who, S.trTries === 1 ? 'Oops! Trace along the dotted line.' : 'Follow the dotted line with your finger, from one end to the other.');
      idle({ who, text: 'Trace the dotted line.', trace: nextLinePts, now: S.trTries >= 2 });
      return;
    }
    if (S.trTries) say(who, 'Yes! That’s the line.');
    S.trTries = 0; S.traced[best] = 1; (S.strokes = S.strokes || [])[best] = S.lines[best].slice();   // snap to the clean line
    drawBig(); afterLine();
  };
}
async function afterLine() {
  SFX.pop(); hideHint();
  if (S.traced.some(t => t < 1)) { const left = S.traced.filter(t => t < 1).length; tip(`Nice line! ${left} more to go.`); idle({ who: tut() ? 'Bobo' : L().markBy, text: 'Trace the next line.', trace: nextLinePts }); return; }
  const rid = RUN; S.busy = true; stopIdle(); tip('Here comes the stone cutter…');
  await cutAnim($('big'), S.lines, 700);
  if (rid !== RUN) return;
  $('big').innerHTML = rockCut(L(), 0, S.n);
  tip(`The covering is cut into ${S.n} parts!`);
  if (tut()) await say('Bobo', `The covering is cut into ${S.n} parts!`); else await sleep(1100);
  if (rid !== RUN) return;
  closeBoard(); S.cutDone[S.first] = true; setCell(S.first, 'pop'); cutRest(rid);
}
function cutAnim(svg, lines, ms) {
  return new Promise(done => {
    const ns = 'http://www.w3.org/2000/svg', g = document.createElementNS(ns, 'g');
    g.innerHTML = '<circle r="9" fill="#C9CED8" stroke="#3E4350" stroke-width="1.6"/><circle r="9" fill="none" stroke="#3E4350" stroke-width="2.6" stroke-dasharray="2 2.2"/><circle r="2.4" fill="#3E4350"/><path d="M9 -2 L15 -6 M9 2 L16 3 M8 5 L12 10" stroke="#FFD25A" stroke-width="1.6" stroke-linecap="round"/>';
    svg.appendChild(g); let i = 0;
    const run = () => {
      if (i >= lines.length) { g.remove(); return done(); }
      const [a, b] = lines[i], cut = document.createElementNS(ns, 'line');
      cut.setAttribute('x1', a[0]); cut.setAttribute('y1', a[1]); cut.setAttribute('x2', a[0]); cut.setAttribute('y2', a[1]);
      cut.setAttribute('stroke', '#2A1A10'); cut.setAttribute('stroke-width', '2.8'); cut.setAttribute('stroke-linecap', 'round'); svg.insertBefore(cut, g);
      SFX.cut(ms / 1000);
      const t0 = performance.now();
      const step = now => {
        const t = Math.min(1, (now - t0) / ms), x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
        g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((now * .9) % 360).toFixed(0)})`); cut.setAttribute('x2', x); cut.setAttribute('y2', y);
        if (t < 1) requestAnimationFrame(step); else { i++; run(); }
      };
      requestAnimationFrame(step);
    };
    run();
  });
}
/* ---------- 4: auto-cut the rest ---------- */
async function cutRest(rid) {
  const Lv = L(), lines = cutLines(Lv.shape, S.n), rest = [];
  for (let g = 0; g < Lv.count; g++) if (!S.cutDone[g]) rest.push(g);
  if (tut()) say('Chiku', 'My stone cutter will cut the rest the same way!');
  else say('Chiku', `My stone cutter will cut the other ${rest.length} stones the same way!`);
  await sleep(500);
  await Promise.all(rest.map((g, j) => sleep(j * 220).then(() => {
    if (rid !== RUN) return; const svg = wallEl(g).querySelector('svg');
    return cutAnim(svg, lines, 260).then(() => { if (rid !== RUN) return; S.cutDone[g] = true; setCell(g); });
  })));
  if (rid !== RUN) return;
  await sleep(tut() ? 1400 : 500); if (rid !== RUN) return;
  allCut();
}
/* ---------- 5: hammer ---------- */
function allCut() {
  const Lv = L(); S.busy = false; S.phase = 'hammer';
  say(Lv.ham, Lv.hamLine);
  idle({ who: Lv.ham, text: tut() ? 'Tap the stone to hammer it.' : 'Tap a stone.', target: () => firstGem(x => !S.split[x]), now: tut() });
}
/* Bobo hammers as his full-body shovel pose, standing beside the stone; he stays out between quick hits */
const FULL = { Bobo: { src: 'characters/bobo_full_shovel.png', ar: 994 / 1335, tool: 'left', hx: .16, hy: .30 }, Golu: { src: 'characters/golu_full.png', ar: 508 / 760, tool: 'right', hx: .88, hy: .60 }, Mitthu: { src: 'characters/mitthu_full.png', ar: 547 / 760, tool: 'right', hx: .86, hy: .62 }, Tinku: { src: 'characters/tinku_full.png', ar: 580 / 760, tool: 'left', hx: .12, hy: .80 } };
let bigHam = null, bigHamT = null;
function seatOf(who) { const k = L().crew.indexOf(who); return k >= 0 ? $('seat' + k) : null; }
function bigHammer(target, who, ms) {
  return new Promise(done => {
    const f = FULL[who], r = rel(target), H = 330, W = H * f.ar;
    if (bigHam && bigHam.dataset.who !== who) { const old = bigHam; bigHam = null; old.remove(); document.querySelectorAll('.seat.away').forEach(x => x.classList.remove('away')); }
    if (!bigHam) {
      bigHam = document.createElement('div'); bigHam.className = 'bigHam'; bigHam.dataset.who = who;
      bigHam.innerHTML = `<div class="flip"><div class="rigbox swing"><img src="${IMG + f.src}" alt=""><div class="rigLayer">${rigHTML(IMG + f.src, RIGS[f.src])}</div></div></div><div class="ledge"><i></i><i></i></div><div class="bang">Bang!</div>`;
      stage.appendChild(bigHam);
      bigHam.animate([{ opacity: 0, transform: 'translateY(60px) scale(.8)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.3,1.5,.5,1)' });
    }
    clearTimeout(bigHamT);
    const seat = seatOf(who); if (seat) seat.classList.add('away');
    // stand on the side where the tool reaches the stone; flip if that would go off-screen
    // the tool head (f.hx, f.hy = its spot in the picture) is placed on the stone's near edge; the character
    // stands on a little scaffold plank. Tool on the left -> stand right of the stone; flip if off-screen.
    const toolLeft = f.tool === 'left';
    let mirror = false, hx = f.hx, tx = toolLeft ? r.x + r.w * .78 : r.x + r.w * .22;
    let left = tx - hx * W;
    if (left < 20 || left + W > 1900) { mirror = true; hx = 1 - f.hx; tx = toolLeft ? r.x + r.w * .22 : r.x + r.w * .78; left = tx - hx * W; }
    const sg = toolLeft ? 1 : -1;
    const top = Math.max(200, Math.min(r.y + r.h * .45 - f.hy * H, 1000 - H));
    Object.assign(bigHam.style, { width: W + 'px', height: H + 'px', left: left + 'px', top: top + 'px' });
    bigHam.classList.toggle('mirror', mirror);
    bigHam.classList.toggle('bangR', (f.tool === 'right') !== mirror);
    const img = bigHam.querySelector('.swing'), bang = bigHam.querySelector('.bang');
    img.getAnimations().forEach(a => a.cancel());
    img.animate([{ transform: 'rotate(0)' }, { transform: `rotate(${9 * sg}deg)`, offset: .35 }, { transform: `rotate(${-15 * sg}deg)`, offset: .55 },
      { transform: `rotate(${-13 * sg}deg)`, offset: .7 }, { transform: 'rotate(0)' }], { duration: ms, easing: 'ease-in-out' });
    bang.style.animation = 'none'; void bang.offsetWidth; bang.style.animation = '';
    setTimeout(() => { SFX.bang(); target.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px) scale(.97)' }, { transform: 'none' }], { duration: 180 }); }, ms * .55);
    setTimeout(done, ms);
    bigHamT = setTimeout(hideBigHammer, ms + 1300);
  });
}
function hideBigHammer() {
  clearTimeout(bigHamT); if (!bigHam) return; const el = bigHam; bigHam = null;
  document.querySelectorAll('.seat.away').forEach(s => s.classList.remove('away'));
  el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(40px) scale(.85)' }], { duration: 250, fill: 'forwards' }).finished.then(() => el.remove()).catch(() => el.remove());
}
/* Hammer poses (overhead swing). Drop the original pictures into assets/images/characters/ as
   <name>_hammer.png and they are used automatically. hx/hy = where the hammer head is in the picture. */
const HPOSE = { Bobo: { hx: .77, hy: .13 }, Mitthu: { hx: .78, hy: .11 }, Golu: { hx: .84, hy: .13 }, Chiku: { hx: .89, hy: .12 } };   // Tinku has no _hammer.png yet: add it here once the art exists
for (const w in {}) { const im = new Image(); im.onload = () => { HPOSE[w].ok = true; HPOSE[w].ar = im.naturalWidth / im.naturalHeight; }; im.src = IMG + 'characters/' + w.toLowerCase() + '_hammer.png'; HPOSE[w].src = im.src; }
let poseEl = null, poseT = null;
/* The poses face left with the hammer raised behind. dir = -1: as drawn (stone on the left);
   dir = +1: mirrored (stone on the right). The body rotates about the feet so the hammer comes over the head
   and lands on the stone. */
function poseHammer(target, who, ms) {
  ms = Math.max(ms, 1050);
  return new Promise(done => {
    const p = HPOSE[who], r = rel(target), H = 330, W = H * p.ar, ANG = 16, GROUND = 1050;
    if (poseEl && poseEl.dataset.who !== who) { poseEl.remove(); poseEl = null; }
    if (!poseEl) {
      poseEl = document.createElement('div'); poseEl.className = 'poseHam'; poseEl.dataset.who = who;
      poseEl.innerHTML = `<div class="shadow"></div><div class="jump"><div class="swing"><div class="flip"><img src="${p.src}" alt=""></div></div></div>`;
      stage.appendChild(poseEl);
      poseEl.animate([{ opacity: 0, transform: 'translateY(40px) scale(.85)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.3,1.5,.5,1)' });
    }
    clearTimeout(poseT);
    const seat = seatOf(who); if (seat) seat.classList.add('away');
    const impact = dir => {   // hammer-head spot in the box after the swing rotation
      const hx = dir > 0 ? 1 - p.hx : p.hx, a = dir * ANG * Math.PI / 180;
      const px = .5 * W, py = .96 * H, vx = (hx - .5) * W, vy = (p.hy - .96) * H;
      return [px + vx * Math.cos(a) - vy * Math.sin(a), py + vx * Math.sin(a) + vy * Math.cos(a)];
    };
    let dir = r.cx > 960 ? -1 : 1, [ix, iy] = impact(dir), left = r.cx - ix;
    if (left < 0 || left + W > 1920) { dir = -dir; [ix, iy] = impact(dir); left = r.cx - ix; }
    const top = GROUND - H, rise = Math.max(0, top - (r.cy + r.h * .1 - iy));
    Object.assign(poseEl.style, { width: W + 'px', height: H + 'px', left: left + 'px', top: top + 'px' });
    poseEl.classList.toggle('mirror', dir > 0);
    const jump = poseEl.querySelector('.jump'), sw = poseEl.querySelector('.swing'), sh = poseEl.querySelector('.shadow');
    [jump, sw, sh].forEach(e => e.getAnimations().forEach(x => x.cancel()));
    const o = { duration: ms, easing: 'linear' };
    // crouch → leap up (hammer cocked back) → SMASH at the top → fall → land with a squash
    jump.animate([
      { transform: 'translateY(0) scale(1,1)' },
      { transform: 'translateY(0) scale(1.08,.86)', offset: .14, easing: 'cubic-bezier(.2,.7,.4,1)' },
      { transform: `translateY(${-rise}px) scale(.95,1.06)`, offset: .44 },
      { transform: `translateY(${-rise}px) scale(1.06,.94)`, offset: .52 },
      { transform: `translateY(${-rise + 10}px) scale(1,1)`, offset: .6, easing: 'cubic-bezier(.5,0,.9,.5)' },
      { transform: 'translateY(0) scale(1.1,.84)', offset: .86 },
      { transform: 'translateY(0) scale(1,1)' }], o);
    sw.animate([
      { transform: 'rotate(0)' }, { transform: `rotate(${-dir * 4}deg)`, offset: .14 },
      { transform: `rotate(${-dir * 14}deg)`, offset: .42 }, { transform: `rotate(${dir * ANG}deg)`, offset: .5 },
      { transform: `rotate(${dir * (ANG - 4)}deg)`, offset: .62 }, { transform: 'rotate(0)', offset: .86 }, { transform: 'rotate(0)' }], o);
    sh.animate([{ transform: 'scale(1)', opacity: .55 }, { transform: 'scale(.5)', opacity: .2, offset: .48 }, { transform: 'scale(.5)', opacity: .2, offset: .6 }, { transform: 'scale(1.1)', opacity: .6, offset: .86 }, { transform: 'scale(1)', opacity: .55 }], o);
    setTimeout(SFX.whoosh, ms * .2);
    setTimeout(() => smashFX(target, dir), ms * .5);
    setTimeout(() => { SFX.tap(); particles(left + W / 2, GROUND - 6, 6, 'chip', 60); }, ms * .86);
    setTimeout(done, ms * .58);
    poseT = setTimeout(hidePoseHammer, ms + 1300);
  });
}
/** impact: flash, star burst, spreading cracks, chips & sparks, screen shake */
function smashFX(target, dir) {
  const r = rel(target), x = r.cx, y = r.cy + r.h * .1;
  SFX.bang(); setTimeout(SFX.crack, 60);
  stage.animate([{ transform: stage.style.transform }, { transform: stage.style.transform + ' translate(9px,-7px)' }, { transform: stage.style.transform + ' translate(-8px,6px)' },
    { transform: stage.style.transform + ' translate(5px,3px)' }, { transform: stage.style.transform }], { duration: 260 });
  target.animate([{ transform: 'none' }, { transform: 'translateY(10px) scale(.93,1.04)' }, { transform: 'scale(1.03)' }, { transform: 'none' }], { duration: 300 });
  const fx = document.createElement('div'); fx.className = 'smash'; fx.style.left = x + 'px'; fx.style.top = y + 'px';
  let rays = ''; for (let k = 0; k < 10; k++) rays += `<i style="transform:rotate(${k * 36 + 8}deg)"></i>`;
  fx.innerHTML = `<b class="flash"></b><span class="burst">${rays}</span><em class="pow">BANG!</em>`;
  stage.appendChild(fx); setTimeout(() => fx.remove(), 900);
  // cracks spreading over the stone
  const ns = 'http://www.w3.org/2000/svg', cv = document.createElementNS(ns, 'svg');
  cv.setAttribute('class', 'cracks'); cv.setAttribute('viewBox', '0 0 100 100');
  Object.assign(cv.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
  let d = ''; for (let k = 0; k < 6; k++) { let a = Math.random() * 6.28, px = 50, py = 55; d += `M${px} ${py}`; for (let j = 0; j < 3; j++) { a += (Math.random() - .5) * 1.2; px += Math.cos(a) * 12; py += Math.sin(a) * 12; d += ` L${px.toFixed(1)} ${py.toFixed(1)}`; } }
  cv.innerHTML = `<path d="${d}" fill="none" stroke="#1E120A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/>`;
  stage.appendChild(cv); setTimeout(() => cv.remove(), 700);
  particles(x, y, 16, 'chip', 150); particles(x, y, 10, 'spark', 170);
}
function hidePoseHammer() {
  clearTimeout(poseT); if (!poseEl) return; const el = poseEl; poseEl = null;
  document.querySelectorAll('.seat.away').forEach(s => s.classList.remove('away'));
  el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(40px) scale(.85)' }], { duration: 250, fill: 'forwards' }).finished.then(() => el.remove()).catch(() => el.remove());
}
/* Level 1 stone breaking: only a gloved hand with a hammer swings in and smashes the stone */
const HAND_SVG = `<svg viewBox="0 0 200 300" aria-hidden="true">
 <defs><linearGradient id="hhHead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9CED6"/><stop offset=".45" stop-color="#8E959F"/><stop offset="1" stop-color="#5B616B"/></linearGradient>
 <linearGradient id="hhWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8A5226"/><stop offset=".5" stop-color="#C8874A"/><stop offset="1" stop-color="#7A451E"/></linearGradient>
 <linearGradient id="hhGlove" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9A6238"/><stop offset="1" stop-color="#5E3517"/></linearGradient></defs>
 <rect x="88" y="62" width="24" height="210" rx="10" fill="url(#hhWood)" stroke="#4A2810" stroke-width="4"/>
 <rect x="30" y="18" width="140" height="58" rx="12" fill="url(#hhHead)" stroke="#33373D" stroke-width="5"/>
 <rect x="30" y="18" width="22" height="58" rx="8" fill="#B5BBC4" stroke="#33373D" stroke-width="4"/>
 <rect x="148" y="18" width="22" height="58" rx="8" fill="#6E747E" stroke="#33373D" stroke-width="4"/>
 <path d="M60 30h70" stroke="#E8ECF1" stroke-width="5" stroke-linecap="round" opacity=".7"/>
 <rect x="80" y="70" width="40" height="18" rx="5" fill="#7E848E" stroke="#33373D" stroke-width="4"/>
 <path d="M58 262c-6-30 6-58 30-66l40-4c22 2 34 20 30 42l-6 30c-4 18-20 30-40 30H90c-18 0-30-14-32-32z" fill="url(#hhGlove)" stroke="#3B200C" stroke-width="5"/>
 <path d="M88 196c-14-2-24 8-22 20s14 16 26 12M86 222c-14-2-22 8-20 19s14 15 26 11M90 247c-12-1-19 8-17 18s13 13 24 9" fill="#A8703F" stroke="#3B200C" stroke-width="4.5"/>
 <path d="M126 200c10 6 14 20 8 30" fill="none" stroke="#3B200C" stroke-width="4" stroke-linecap="round" opacity=".6"/>
 <rect x="60" y="270" width="104" height="30" rx="10" fill="#7A4A26" stroke="#3B200C" stroke-width="5"/>
 <path d="M70 284h84" stroke="#C48A4E" stroke-width="3" stroke-dasharray="7 6"/>
</svg>`;
let handEl = null, handT = null;
function handHammer(target, ms) {
  ms = Math.max(ms, 760);
  return new Promise(done => {
    const r = rel(target), sc = Math.max(.55, Math.min(.78, r.w / 300)), W = 200 * sc, H = 300 * sc, L = 240 * sc;
    const right = r.cx < 1500;                  // swing in from the right, or from the left near the edge
    const dir = right ? 1 : -1, HIT = -26 * dir, a = HIT * Math.PI / 180;
    const hx = r.cx, hy = r.cy;                 // hammer head lands on the stone centre
    const px = hx - L * Math.sin(a), py = hy + L * Math.cos(a);   // pivot (the glove)
    if (!handEl) {
      handEl = document.createElement('div'); handEl.className = 'handHam';
      handEl.innerHTML = `<div class="sw">${HAND_SVG}</div>`; stage.appendChild(handEl);
    }
    clearTimeout(handT);
    Object.assign(handEl.style, { width: W + 'px', height: H + 'px', left: (px - W / 2) + 'px', top: (py - 252 * sc) + 'px' });
    const sw = handEl.firstChild; sw.style.transformOrigin = `50% ${252 / 3}%`;
    sw.style.transform = dir > 0 ? '' : 'scaleX(-1)';
    sw.getAnimations().forEach(x => x.cancel()); handEl.getAnimations().forEach(x => x.cancel());
    const f = dir > 0 ? '' : ' scaleX(-1)';
    handEl.animate([{ opacity: 0, transform: `translate(${120 * dir}px,140px)` }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'ease-out', fill: 'forwards' });
    sw.animate([
      { transform: `rotate(${30 * dir}deg)${f}` },
      { transform: `rotate(${48 * dir}deg)${f}`, offset: .3 },
      { transform: `rotate(${HIT}deg)${f}`, offset: .48, easing: 'ease-out' },
      { transform: `rotate(${HIT + 8 * dir}deg)${f}`, offset: .62 },
      { transform: `rotate(${HIT + 2 * dir}deg)${f}`, offset: .74 },
      { transform: `rotate(${24 * dir}deg)${f}` }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
    setTimeout(SFX.whoosh, ms * .3);
    setTimeout(() => smashFX(target, dir), ms * .48);
    setTimeout(done, ms * .55);
    handT = setTimeout(hideHandHammer, ms + 900);
  });
}
function hideHandHammer() {
  clearTimeout(handT); if (!handEl) return; const el = handEl; handEl = null;
  el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translate(80px,160px)' }], { duration: 260, fill: 'forwards' }).finished.then(() => el.remove(), () => el.remove());
}
function hammerOn(target, who, ms = 650) {
  return handHammer(target, ms);
  if (HPOSE[who] && HPOSE[who].ok) return poseHammer(target, who, Math.max(ms, 760));
  if (FULL[who]) return bigHammer(target, who, Math.max(ms, 720));
  return new Promise(done => {
    const r = rel(target), h = document.createElement('div'); h.className = 'hammerer';
    h.innerHTML = `<div class="whoH">${charFull(who)}</div><div class="ham">${HAMMER}</div><div class="bang">Bang!</div>`;
    h.style.left = (r.x + r.w * .62) + 'px'; h.style.top = (r.y - 80) + 'px'; stage.appendChild(h);
    setTimeout(() => SFX.bang(), 220);
    setTimeout(() => { h.remove(); done(); }, ms);
  });
}
async function hammerStone(g) {
  const rid = RUN, Lv = L(); S.busy = true; stopIdle(); const b = wallEl(g); b.classList.add('shake');
  await hammerOn(b, Lv.ham);
  if (rid !== RUN) return;
  const r = rel(b); particles(r.cx, r.cy, 12); SFX.crack();
  S.rev[g]++; b.classList.remove('shake');
  if (S.rev[g] >= S.n) { S.split[g] = true; setCell(g, 'pop'); SFX.sparkle(); particles(r.cx, r.cy, 8, 'spark', 120); } else setCell(g);
  S.busy = false;
  const left = S.split.filter(x => !x).length, done = S.split.filter(x => x).length;
  if (left && done >= 2 && S.split[g]) return breakRest(rid);
  if (!left) return allOpen();
  if (S.rev[g] == 1 && tut() && !S.saidHit) { S.saidHit = true; say(Lv.ham, 'One part is off! Tap again for the next part.'); }
  const parts = S.n - S.rev[g];
  if (!(S.rev[g] == 1 && tut())) say(Lv.ham, !S.split[g] ? `${parts} part${parts > 1 ? 's' : ''} left on this stone.` : `Great! Now the next stone.`);
  idle({ who: Lv.ham, text: tut() ? 'Tap the stone to hammer it.' : 'Tap a stone.', target: () => S.split[g] ? firstGem(x => !S.split[x]) : b, now: tut() });
}
async function breakRest(rid) {
  const Lv = L(), rest = []; for (let g = 0; g < Lv.count; g++) if (!S.split[g]) rest.push(g);
  S.busy = true; stopIdle(); fb(null);
  const line = tut() ? 'You’ve got it! I’ll break the last stone for you.' : (S.li === 1 ? 'Great! ' : '') + `I’ll break the other ${rest.length}!`;
  say(Lv.brk, line);
  await sleep(900);
  for (const g of rest) {
    if (rid !== RUN) return;
    const b = wallEl(g); b.classList.add('shake'); await hammerOn(b, Lv.brk, 480); if (rid !== RUN) return;
    const r = rel(b); particles(r.cx, r.cy, 10); S.rev[g] = S.n; S.split[g] = true; setCell(g, 'pop');
  }
  SFX.sparkle(); await sleep(900); if (rid !== RUN) return;
  S.busy = false; allOpen();
}
/* ---------- 6: share ---------- */
function allOpen() {
  hideBigHammer(); hidePoseHammer(); hideHandHammer();
  const Lv = L(); S.phase = 'deal'; fb(null);
  say('Chiku', tut() ? `Tap a ruby to share its pieces into our trays.` : `Tap ${an(Lv.gem)} to share its pieces.`);
  idle({ who: 'Chiku', text: tut() ? 'Tap a ruby to share it.' : `Tap ${an(Lv.gem)}.`, target: () => firstGem(x => !S.dealt[x]), now: tut() });
}
function deal(g) {
  S.busy = true; stopIdle(); S.last = g;
  flyPieces(wallEl(g).querySelector('svg'), () => { S.dealt[g] = true; setCell(g); landed(); });
}
function flyPieces(svgEl, done) {
  const Lv = L(), n = S.n, m = M(), pcs = pieces(Lv.shape, n), give = Math.min(n, m), r = rel(svgEl);
  pcs.forEach((pc, k) => {
    if (k >= give) return; const c = cent(pc), f = document.createElement('div'); f.className = 'fly'; f.innerHTML = pieceMini(Lv, pc);
    const x0 = r.x + (c[0] + 6) / 112 * r.w - 28, y0 = r.y + (c[1] + 6) / 112 * r.h - 28; f.style.left = x0 + 'px'; f.style.top = y0 + 'px'; stage.appendChild(f);
    const t = rel($('pile' + k)), x1 = t.cx - 28, y1 = t.cy - 20;
    setTimeout(() => { f.style.transform = `translate(${x1 - x0}px,${y1 - y0}px) scale(.6)`; SFX.pop(); }, 40 + k * 170);
    setTimeout(() => f.remove(), 820 + k * 170);
  });
  setTimeout(() => { for (let k = 0; k < give; k++) { S.buckets[k]++; fillPile(k); } SFX.coin(); done(); }, 860 + give * 170);
}
async function landed() {
  const Lv = L(), n = S.n, m = M(), rid = RUN;
  if (n < m) return fail('few'); if (n > m) return fail('many');
  S.busy = false; const k = S.buckets[0];
  if (S.dealt.every(x => x)) {
    S.phase = 'done'; hideHint(); SFX.good(); confetti(24);
    fb('Fair and square! Everyone got the same.', 'good');
    await say('Chiku', 'Fair and square! Everyone got the same.'); if (rid !== RUN) return;
    await sleep(500); if (rid !== RUN) return; fb(null); openName(); return;
  }
  if (k == 1 && tut()) say('Chiku', `Each piece is 1/${n} of a ruby.`);
  fb(`Every tray has <b>${k} ${k === 1 ? 'piece' : 'pieces'}</b>.`, '', 2200);
  idle({ who: 'Chiku', text: tut() ? 'Tap a ruby to share it.' : `Tap ${an(Lv.gem)}.`, target: () => firstGem(x => !S.dealt[x]) });
}
async function fail(type) {
  const Lv = L(), n = S.n, m = M(), rid = RUN; S.phase = 'fail'; S.tries++; SFX.bad();
  let msg;
  if (type == 'few') {
    const left = Lv.crew.slice(n, m); msg = `Oops! Try again. ${list(left)} got nothing!`;
    for (let k = n; k < m; k++) { const st = $('seat' + k); st.classList.add('emptybad'); wig(st); setTimeout(() => st.classList.remove('emptybad'), 2400); }
  } else {
    const ex = n - m; msg = `Oops! Try again. ${ex == 1 ? 'One piece is' : NUMW[ex] + ' pieces are'} left over!`;
    wig(wallEl(S.last));
  }
  fb(null); oops(type == 'few' ? $('seat' + n) : wallEl(S.last), type == 'few' ? 'Oops! Someone got nothing!' : 'Oops! Pieces left over!');
  await say('Chiku', msg); if (rid !== RUN) return;
  if (S.tries >= 2) {
    S.hint = true; setHintSeats(true);
    hintCard('Count the miners. Cut each stone into one piece for each miner.');
    await say('Chiku', 'Count the miners. Cut each stone into one piece for each miner.'); if (rid !== RUN) return;
  }
  S.busy = false; $('btnAgain').hidden = false; idle({ target: () => $('btnAgain'), now: S.tries >= 2 });
}
$('btnAgain').onclick = () => {
  SFX.tap(); $('btnAgain').hidden = true; stopIdle();
  S.n = null; S.buckets = Array(M()).fill(0); ['dealt', 'split', 'cutDone'].forEach(k => S[k] = S[k].map(() => false)); S.rev = S.rev.map(() => 0);
  S.phase = 'cut'; S.busy = false; S.saidHit = false; fb(null);
  renderTrain(null); renderWall();
  say('Bobo', S.hint ? 'Look at the numbers on our trays. Tap a stone to mark it again.' : 'Let’s try again. Tap a stone to mark it with chalk.');
  idle({ who: 'Bobo', text: 'Tap a stone.', target: () => wallEl(0) });
};

/* ---------- 7: name the share ---------- */
function openName() {
  const Lv = L(), who = Lv.name, k = Lv.crew.indexOf(who), pcs = pieces(Lv.shape, S.n);
  S.whoK = k; S.phase = 'name'; S.box = 'top'; S.val = { top: '', bot: '' }; S.nameTries = 0;
  const tipped = Array.from({ length: S.buckets[k] }, () => `<span class="pc">${pieceMini(Lv, pcs[0])}</span>`).join('');
  showBoard(`<h3>How much ${Lv.stuff} did ${who} get?</h3>
    <div class="row" id="nameRow" style="position:relative;align-items:center">
      <div class="col shower" style="width:560px">
        <div class="showWho">${charFull(who)}</div>
        <div class="showTray"><div class="tipped" id="tipped" style="--cols:${Math.ceil(S.buckets[k] / Math.ceil(S.buckets[k] / 6))}">${tipped}</div></div>
</div>
      <div class="wordFr" id="wordFr" hidden><div class="wfRow"><b class="bulb">💡</b><div class="wf"><span id="wfTop">Total number of pieces</span><i></i><span id="wfBot">Number of pieces that make one whole</span></div></div>
        <div class="onegem" id="onegem" hidden>${svgWrap(gemSplit(Lv, S.n))}</div><div class="ogLab">1 ${Lv.gem} cut into ${S.n}</div></div>
      <div class="frac" id="frac"><button class="box sel" id="bxtop" aria-label="Top number"></button><div class="bar"></div><button class="box" id="bxbot" aria-label="Bottom number"></button></div>
      <div class="col"><div class="pad" id="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button data-d="${d}">${d}</button>`).join('')}<button data-d="del" class="del" aria-label="Delete">⌫</button><button data-d="0">0</button><button data-d="clr" class="del" aria-label="Clear">C</button><button data-d="ok" class="ok">Check</button></div></div>
      <svg class="arrows" id="arrows"></svg>
    </div><p class="ptip" id="ptip" style="max-width:none;margin-top:8px"></p>`, 1560);
  $('bxtop').onclick = () => { if (S.nameLock) return; SFX.tap(); selBox('top'); }; $('bxbot').onclick = () => { if (S.nameLock) return; SFX.tap(); selBox('bot'); };
  $('pad').querySelectorAll('button').forEach(b => b.onclick = () => padPress(b.dataset.d));
  // the miner holds up their tray and shows it, then the question is asked
  const tray = document.querySelector('.showTray'), whoEl = document.querySelector('.showWho');
  tray.animate([{ transform: 'translateY(120px) scale(.6)', opacity: 0 }, { transform: 'translateY(-14px) scale(1.05)', offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 750, easing: 'ease-out', fill: 'both' });
  whoEl.animate([{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 500, fill: 'both' });
  [...tray.querySelectorAll('.pc')].forEach((p, j) => p.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.2)', offset: .7 }, { transform: 'none' }], { duration: 380, delay: 600 + j * 110, fill: 'both' }));
  setTimeout(SFX.sparkle, 700);
  const rid = RUN; S.busy = true;
  (async () => {
    await say(who, 'Look, these are my gems!'); if (rid !== RUN) return;
    S.busy = false;
    say(Lv.ask, tut() ? 'How much ruby did Bobo get? Write it as a fraction.' : `How much ${Lv.stuff} did ${who} get? Write it as a fraction.`);
    idle({ who: Lv.ask, text: 'Fill in the boxes.', target: () => $('bxtop') });
  })();
}
function selBox(k) { S.box = k; $('bxtop').classList.toggle('sel', k == 'top'); $('bxbot').classList.toggle('sel', k == 'bot'); }
function padPress(d) {
  if (S.busy) return;
  if (S.nameLock && d != 'ok') return;   // answer is locked in: only Check works
  SFX.tap();
  idle({ who: L().ask, text: 'Fill in the boxes.', target: () => (S.val.top && S.val.bot) ? $('pad').querySelector('.ok') : $(S.val.top ? 'bxbot' : 'bxtop') });
  if (d == 'ok') return checkName();
  if (d == 'clr') { S.val = { top: '', bot: '' }; selBox('top'); }
  else if (d == 'del') { if (S.val[S.box]) S.val[S.box] = ''; else if (S.box == 'bot') { selBox('top'); S.val.top = ''; } }
  else { S.val[S.box] = d; if (S.box == 'top') selBox('bot'); }   // one digit per box, then move on automatically
  $('bxtop').textContent = S.val.top; $('bxbot').textContent = S.val.bot; tip('');
}
async function checkName() {
  const Lv = L(), top = S.val.top, bot = S.val.bot, c = String(S.buckets[S.whoK]), m = String(S.n), who = Lv.name, rid = RUN;
  if (!top || !bot) { tip('Fill in both boxes first.'); return; }
  if (top == c && bot == m) {
    stopIdle(); hideHint(); S.busy = true; SFX.good(); confetti(30);
    $('frac').style.borderColor = '#3FAF5A'; $('frac').style.background = 'rgba(200,255,200,.6)';
    const msg = tut() ? `Yes! ${c}/${m}. The top number is bigger, so it’s an improper fraction!`
      : S.li == LEVELS.length - 1 ? `${c}/${m}! You formed improper fractions in every chamber!` : `${c}/${m}! An improper fraction.`;
    tip(msg); await say(Lv.ask, msg); if (rid !== RUN) return;
    await sleep(600); if (rid !== RUN) return;
    S.busy = false; rideOn(rid); return;
  }
  if (S.nameLock) return;
  S.nameTries++;
  const fr = $('frac'); fr.classList.add('bad');
  // 3rd wrong answer: the right answer stays in the boxes and only Check works (no endless loop)
  if (S.nameTries >= 3) {
    oops(fr); S.nameLock = true; stopIdle(); hideHint();
    setTimeout(() => {
      fr.classList.remove('bad'); if (!$('bxtop')) return;
      S.val = { top: c, bot: m }; $('bxtop').textContent = c; $('bxbot').textContent = m; selBox('bot');
      $('pad').querySelectorAll('button').forEach(b => { if (b.dataset.d !== 'ok') { b.disabled = true; b.classList.add('locked'); } else b.classList.add('pulse'); });
      [$('bxtop'), $('bxbot')].forEach(b => b.classList.add('locked'));
    }, 900);
    await say(Lv.ask, `The answer is ${c} over ${m}: ${c} pieces in all, and ${m} pieces make one whole. Tap Check to go on.`); if (rid !== RUN) return;
    if ($('pad')) handTapOn($('pad').querySelector('.ok'));
    return;
  }
  setTimeout(() => { fr.classList.remove('bad'); S.val = { top: '', bot: '' }; if ($('bxtop')) { $('bxtop').textContent = ''; $('bxbot').textContent = ''; selBox('top'); } }, 900);
  const hintLine = tut() ? `Bottom: how many pieces each ruby was cut into. Top: how many pieces on Bobo’s tray.`
    : `Bottom: pieces each ${Lv.gem} was cut into. Top: pieces on ${who}’s tray.`;
  tip('');
  if (top == m && bot == c) { oops($('frac'), 'Top and bottom are swapped!'); await say(Lv.ask, 'Careful, the top and bottom are swapped!'); if (rid !== RUN) return; }
  else if (S.nameTries == 1) { oops($('frac')); say(Lv.ask, 'Oops! Try again.'); return; }
  else oops($('frac'));
  if (S.nameTries >= 2) showArrows(rid);   // the hint speaks for itself (explain, then count with the child)
}
async function showArrows(rid) {
  S.busy = true; stopIdle();
  const og = $('onegem'); og.hidden = false; og.classList.add('pop');
  const wf = $('wordFr'); if (wf && wf.hidden) { wf.hidden = false; wf.classList.add('pop'); SFX.sparkle(); }
  await sleep(450); if (rid !== RUN || !$('arrows')) return;
  const svg = $('arrows'), base = rel(svg), pt = (el, fx, fy) => { const r = rel(el); return [r.x - base.x + r.w * fx, r.y - base.y + r.h * fy]; };
  const bot = pt($('bxbot'), 0, .5), gem = pt(og, 1, .5), gemB = pt(og, .5, 1), topB = pt($('bxtop'), 0, .5), tp = pt($('tipped'), 1, .5);
  const arrow = (a, b, col) => `<path d="M${a[0]} ${a[1]} C${a[0] - 80} ${a[1]}, ${b[0] + 80} ${b[1]}, ${b[0] + 10} ${b[1]}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="14 10"><animate attributeName="stroke-dashoffset" from="48" to="0" dur=".8s" repeatCount="indefinite"/></path><circle cx="${b[0] + 10}" cy="${b[1]}" r="10" fill="${col}"/>`;
  const wT = pt($('wfTop'), 0, .5), wB = pt($('wfBot'), .5, 1), gT = pt(og, .5, 0);
  const up = `<path d="M${gT[0]} ${gT[1] + 4} L${wB[0]} ${wB[1] + 10}" fill="none" stroke="#2F63DB" stroke-width="7" stroke-linecap="round" stroke-dasharray="14 10"><animate attributeName="stroke-dashoffset" from="48" to="0" dur=".8s" repeatCount="indefinite"/></path>`;
  svg.innerHTML = up + arrow(wT, tp, '#E07A26');
  const who = L().ask, n = S.n;
  await say(who, 'Numerator is the total number of pieces, and denominator is the number of pieces that make one whole.'); if (rid !== RUN) return;
  // 1) count the pieces on the tray
  $('wfTop').classList.add('wfOn');
  await say(who, 'Let’s count the total number of pieces with me.'); if (rid !== RUN) return;
  const pcs = [...$('tipped').querySelectorAll('.pc')];
  for (let i = 0; i < pcs.length; i++) {
    if (rid !== RUN) return;
    pcs[i].classList.add('lit'); pcs[i].insertAdjacentHTML('beforeend', `<i>${i + 1}</i>`); SFX.coin();
    await speak(i === pcs.length - 1 && i > 0 ? `and ${i + 1}` : String(i + 1), who);
  }
  $('wfTop').classList.remove('wfOn'); if (rid !== RUN) return;
  // 2) count the pieces of one complete whole (numbers appear on the cut gem)
  $('wfBot').classList.add('wfOn');
  await say(who, 'And now let’s count the number of pieces of one complete whole.'); if (rid !== RUN) return;
  const gsvg = og.querySelector('svg'), st = stage.getBoundingClientRect();
  const marks = pieces(L().shape, n).map(cent).sort((a, b) => Math.abs(a[1] - b[1]) > 12 ? a[1] - b[1] : a[0] - b[0]).map(c => {   // count left→right, top→bottom
    const q = gsvg.createSVGPoint(); q.x = c[0]; q.y = c[1]; const r = q.matrixTransform(gsvg.getScreenCTM());
    const m = document.createElement('div'); m.className = 'ogNum'; m.style.left = ((r.x - st.left) / SCALE) + 'px'; m.style.top = ((r.y - st.top) / SCALE) + 'px'; return m;
  });
  for (let k = 0; k < marks.length; k++) {
    if (rid !== RUN) { marks.forEach(m => m.remove()); return; }
    marks[k].textContent = k + 1; stage.appendChild(marks[k]); SFX.coin();
    await speak(k === marks.length - 1 && k > 0 ? `and ${k + 1}` : String(k + 1), who);
  }
  $('wfBot').classList.remove('wfOn');
  setTimeout(() => marks.forEach(m => m.remove()), 2500);
  if (rid !== RUN) return;
  say(who, 'Now fill in the boxes.');
  S.busy = false; idle({ who: L().ask, text: 'Fill in the boxes.', target: () => $('bxtop') });
}

/* ---------- 8: ride on ---------- */
async function rideOn(rid) {
  const Lv = L(); closeBoard(); stopIdle();
  fb('Into the sacks they go!', 'good');
  const sack = $('sack'); sack.classList.add('show'); const sr = rel(sack);
  for (let k = 0; k < M(); k++) {
    const pr = rel($('pile' + k));
    for (let j = 0; j < Math.min(S.buckets[k], 4); j++) {
      const f = document.createElement('div'); f.className = 'fly'; f.innerHTML = pieceMini(Lv, pieces(Lv.shape, S.n)[k % S.n]);
      f.style.left = (pr.cx - 28) + 'px'; f.style.top = (pr.cy - 28) + 'px'; stage.appendChild(f);
      setTimeout(() => f.style.transform = `translate(${sr.cx - pr.cx}px,${sr.cy - pr.cy}px) scale(.4)`, 60 + (k * 3 + j) * 90);
      setTimeout(() => { f.remove(); sack.classList.remove('got'); void sack.offsetWidth; sack.classList.add('got'); SFX.coin(); }, 820 + (k * 3 + j) * 90);
    }
  }
  await sleep(1300); if (rid !== RUN) return;
  S.buckets = S.buckets.map(() => 0); for (let k = 0; k < M(); k++) fillPile(k);
  const last = S.li == LEVELS.length - 1;
  if (last) { await say('Chiku', 'Our sacks are full, and every share was equal!'); if (rid !== RUN) return;
    // no summary board: straight into the Level 2 story, which then starts Level 2
    await sleep(600); if (rid !== RUN) return; stopIdle(); closeBoard(); return window.L2 ? window.L2.start() : finale(); }
  await say('Bobo', 'On to the next chamber!'); if (rid !== RUN) return;
  fb(null);
  const next = LEVELS[S.li + 1], leavers = Lv.crew.filter(n => !next.crew.includes(n));
  if (leavers.length) {
    leavers.forEach(n => { const s = $('seat' + Lv.crew.indexOf(n)); s.classList.add('leave-' + (LEAVE[n] || 'dig')); });
    SFX.whoosh(); await sleep(1500); if (rid !== RUN) return;
  }
  const tr = $('train'); tr.classList.add('bump'); SFX.rumble(2.2); tr.classList.add('rollout');
  await sleep(1900); if (rid !== RUN) return;
  // the trolley rolls in once inside the tunnel and stops; the next chamber fades in around it (no second roll-in)
  let arrived = 0;
  await tunnelRide(`${next.title} · ${next.plural}`, Lv.crew.filter(n => !leavers.includes(n)),
    () => { if (rid !== RUN) return; loadLevel(S.li + 1, { anim: true, silent: true }); arrived = RUN; });
  if (!arrived || arrived !== RUN) return;
  beginLevel(arrived, 200);
}
function finale() {
  stopIdle(); fb(null); SFX.good(); confetti(60); setTimeout(() => confetti(40), 900);
  const items = LEVELS.map((Lv, i) => {
    const m = Lv.crew.length;
    return `<div class="item">${svgWrap(gemSplit(Lv, m))}<span class="fr"><span>${Lv.count}</span><i></i><span>${m}</span></span><span style="font-size:24px">${Lv.plural}</span></div>`;
  }).join('');
  showBoard(`<div class="finale" style="text-align:center"><h3>Sacks full!</h3>
    <p class="ptip" style="max-width:none;color:#5A2E0E">You shared every gem equally and wrote each share as an improper fraction.<br>In each one, the top number is bigger than the bottom number.</p>
    <div class="list">${items}</div>
    <div style="display:flex;gap:30px;justify-content:center"><button class="plankBtn" id="toL2">Level 2 ▸</button><button class="plankBtn" id="again">Play again</button><button class="plankBtn" id="story2">Watch the story</button></div></div>`, 1400);
  $('again').onclick = () => { SFX.tap(); loadLevel(0); };
  $('toL2').onclick = () => { SFX.tap(); closeBoard(); window.L2 && window.L2.start(); };
  $('story2').onclick = () => { SFX.tap(); location.reload(); };
}

/* ===================== TRANSITIONS ===================== */
function tween(o, to, ms, ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, onFrame) {
  const from = {}; for (const k in to) from[k] = o[k];
  return new Promise(res => {
    const t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / ms), e = ease(t);
      for (const k in to) o[k] = from[k] + (to[k] - from[k]) * e;
      onFrame && onFrame(); if (t < 1) requestAnimationFrame(step); else res();
    };
    requestAnimationFrame(step);
  });
}
/** chamber-to-chamber journey:
    1) back view: Chiku & Bobo's trolley heads deeper into the tunnel (short dive)
    2) side view: the whole team rides along the rails, mine timbers & lanterns stream past, chamber sign swings in
    3) the train brakes, the camera stops and the team rolls off to the right into the next chamber */
function trainHTML(crew) {
  let h = '';
  for (let k = 0; k < crew.length; k += 2) {
    const gp = crew.slice(k, k + 2);
    if (k) h += '<div class="coupler"></div>';
    h += `<div class="car" style="width:${gp.length * 192 + (gp.length - 1) * 26 + 50}px">` +
      gp.map(n => `<div class="seat"><div class="who">${charFull(n)}</div><div class="bucket"></div></div>`).join('') + '</div>';
  }
  return h;
}
async function tunnelRide(caption, crew = ['Chiku', 'Bobo'], onArrive) {
  const T = $('tunnel'); T.hidden = false;
  const cap = $('tunnelCap'); cap.textContent = caption; cap.hidden = !caption; cap.style.opacity = 0; cap.style.animation = 'none';
  const anims = [], A = (el, kf, o) => { const x = el.animate(kf, o); anims.push(x); return x; };
  SFX.rumble(5.5); SFX.clack(5.2);
  // ---- 2) side view journey ----
  const j = document.createElement('div'); j.className = 'journey';
  j.innerHTML = `<div class="jStrip"></div><div class="jGlow"></div><div class="jTrain">${trainHTML(crew)}</div><div class="jVig"></div><div class="jEnd"></div>`;
  T.insertBefore(j, cap);
  const strip = j.querySelector('.jStrip'), tr = j.querySelector('.jTrain');
  A(j, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards' });
  const scroll = A(strip, [{ transform: 'translateX(0)' }, { transform: 'translateX(-3840px)' }], { duration: 3200, iterations: Infinity });
  tr.classList.add('bumpy');
  A(tr, [{ transform: 'translateX(-1500px)' }, { transform: 'translateX(0)' }], { duration: 1300, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
  const dust2 = setInterval(() => { const b = tr.getBoundingClientRect(), s0 = stage.getBoundingClientRect(); dustPuff((b.left - s0.left) / SCALE + 30, 1000, 2, -1.4, j); }, 160);
  cap.style.opacity = 1; cap.style.animation = '';
  await sleep(2600);
  // ---- 3) brake: camera slows to a stop, train rolls off right into the next chamber ----
  SFX.screech();
  const t0 = performance.now();
  await new Promise(res => { const st = n => { const k = Math.min(1, (n - t0) / 900); scroll.playbackRate = 1 - k * k * .999; k < 1 ? requestAnimationFrame(st) : res(); }; requestAnimationFrame(st); });
  scroll.pause(); clearInterval(dust2);
  // the trolley stays where it stopped; the next chamber fades in around it
  tr.classList.remove('bumpy'); SFX.tap();
  await sleep(500);
  if (onArrive) onArrive();
  cap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' });
  await A(j, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, fill: 'forwards' }).finished.catch(() => {});
  anims.forEach(x => x.cancel()); j.remove(); cap.getAnimations().forEach(x => x.cancel()); T.hidden = true;
}
/** Bobo's head-torch switches on, its beam sweeps to the stones, then the light opens up on the game */
async function torchReveal() {
  const cv = $('torch'), c = cv.getContext('2d'); cv.hidden = false;
  const lamp = { x: 885, y: 150 }, st = { dark: 0, sx: lamp.x, sy: lamp.y, r: 60, beam: 0, lamp: 0 };
  const draw = () => {
    c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, 1920, 1080);
    c.fillStyle = `rgba(4,2,1,${.95 * st.dark})`; c.fillRect(0, 0, 1920, 1080);
    c.globalCompositeOperation = 'destination-out';
    let g = c.createRadialGradient(st.sx, st.sy, st.r * .45, st.sx, st.sy, st.r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(st.sx, st.sy, st.r, 0, 7); c.fill();
    if (st.beam > .01) {
      const dx = st.sx - lamp.x, dy = st.sy - lamp.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
      const bg = c.createLinearGradient(lamp.x, lamp.y, st.sx, st.sy); bg.addColorStop(0, `rgba(0,0,0,${.7 * st.beam})`); bg.addColorStop(1, `rgba(0,0,0,${.45 * st.beam})`);
      c.fillStyle = bg; c.beginPath(); c.moveTo(lamp.x + nx * 14, lamp.y + ny * 14); c.lineTo(st.sx + nx * st.r * .8, st.sy + ny * st.r * .8);
      c.lineTo(st.sx - nx * st.r * .8, st.sy - ny * st.r * .8); c.lineTo(lamp.x - nx * 14, lamp.y - ny * 14); c.closePath(); c.fill();
    }
    if (st.lamp > .01) { g = c.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, 90); g.addColorStop(0, `rgba(0,0,0,${st.lamp})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(lamp.x, lamp.y, 90, 0, 7); c.fill(); }
    c.globalCompositeOperation = 'lighter';
    if (st.lamp > .01) { g = c.createRadialGradient(lamp.x, lamp.y, 0, lamp.x, lamp.y, 70); g.addColorStop(0, `rgba(255,240,180,${.55 * st.lamp})`); g.addColorStop(1, 'rgba(255,200,90,0)'); c.fillStyle = g; c.beginPath(); c.arc(lamp.x, lamp.y, 70, 0, 7); c.fill(); }
    if (st.beam > .01) { g = c.createRadialGradient(st.sx, st.sy, 0, st.sx, st.sy, st.r); g.addColorStop(0, `rgba(255,210,120,${.22 * st.beam})`); g.addColorStop(1, 'rgba(255,170,60,0)'); c.fillStyle = g; c.beginPath(); c.arc(st.sx, st.sy, st.r, 0, 7); c.fill(); }
  };
  await tween(st, { dark: 1, r: 70 }, 900, undefined, draw);
  // torch flickers on
  for (const v of [1, .2, 1, .4, 1]) { st.lamp = v; draw(); SFX.click(); await sleep(110); }
  await sleep(250);
  await tween(st, { beam: 1, sx: 1446, sy: 555, r: 230 }, 1500, undefined, draw);
  SFX.sparkle(); await sleep(600);
  // swap to the game underneath while it is dark
  $('story').hidden = true; $('game').hidden = false;
  const g0 = rel(wallEl(0));
  await tween(st, { lamp: 0, sx: g0.cx, sy: g0.cy, r: 220 }, 900, undefined, draw);
  await sleep(250);
  await tween(st, { r: 2300, dark: .6, beam: 0 }, 1300, t => t * t, draw);
  cv.hidden = true;
}

/* ===================== STORY ===================== */
let storyTap = null;
$('story').addEventListener('pointerdown', e => { if (e.target.closest('button')) return; if (storyTap) { const f = storyTap; storyTap = null; hush(); f(); } });
function waitTap(ms) { return new Promise(res => { const t = setTimeout(() => { storyTap = null; res(); }, ms); storyTap = () => { clearTimeout(t); res(); }; }); }
function setBg(src, mode) {
  const a = $('storyBg'), b = $('storyBg2');
  if (mode === 'cross') {
    b.src = IMG + 'backgrounds/' + src; b.style.transition = 'none'; b.style.opacity = 0; b.style.transform = 'scale(1.25)'; void b.offsetWidth;
    b.style.transition = 'opacity .8s ease, transform .8s ease-out'; b.style.opacity = 1; b.style.transform = 'scale(1)';
    return sleep(850).then(() => { a.src = b.src; a.style.transition = 'none'; a.style.transform = 'none'; void a.offsetWidth; a.style.transition = ''; b.style.transition = 'none'; b.style.opacity = 0; });
  }
  a.src = IMG + 'backgrounds/' + src; a.style.transition = 'none'; a.style.transform = 'none'; void a.offsetWidth; a.style.transition = '';
  return Promise.resolve();
}
function showBubble(s) {
  const b = $('bubble'); const [x, y, w, h] = s.box;
  b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.width = w + 'px'; b.style.height = h + 'px';
  $('bubbleText').textContent = s.text; $('bubbleText').style.fontSize = s.fs + 'px';
  b.hidden = false; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show');
}
function fadeOut(on) { const f = $('fade'); f.hidden = false; f.classList.toggle('on', on); return sleep(650).then(() => { if (!on) f.hidden = true; }); }
/* ---------- cave ride: cart rolls into the mine, rushes through the tunnel, brakes, stops ---------- */
function rideLayer(src, lanterns, parent) {
  const w = document.createElement('div'); w.className = 'rideLayer';
  w.innerHTML = `<div class="zoomer"><img class="bg" src="${IMG}backgrounds/${src}" alt="">${lanterns.map(([x, y, r]) => `<i class="lglow" style="left:${x}%;top:${y}%;width:${r}px;height:${r}px;animation-delay:${(-Math.random()).toFixed(2)}s"></i>`).join('')}</div>`;
  if (parent) parent.insertBefore(w, parent.firstChild); else $('storyRig').before(w); return w;
}
function dustPuff(x, y, n = 6, dx = -1, parent) {
  for (let k = 0; k < n; k++) {
    const d = document.createElement('div'); d.className = 'dust';
    const s = 18 + Math.random() * 34; d.style.width = d.style.height = s + 'px';
    d.style.left = (x + (Math.random() - .5) * 60) + 'px'; d.style.top = (y + (Math.random() - .5) * 20) + 'px';
    d.style.setProperty('--dx', (dx * (60 + Math.random() * 140)) + 'px'); d.style.setProperty('--dy', (-30 - Math.random() * 70) + 'px');
    (parent || $('story')).appendChild(d); setTimeout(() => d.remove(), 1300);
  }
}
async function caveRide(nextBg, rid) {
  const ok = () => rid === RUN;
  const timers = [], every = (ms, fn) => { const t = setInterval(fn, ms); timers.push(t); return t; };
  const stopAll = () => timers.forEach(clearInterval);
  // 1) outside: push into the tunnel mouth, accelerating
  const r1 = rideLayer('story_03b_cave_entrance.jpg', [[83.7, 16, 150], [86, 35, 70], [81, 44.6, 50], [84.5, 49, 40]]);
  r1.classList.add('bob');
  r1.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, fill: 'forwards', easing: 'ease-out' });
  r1.firstChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)', offset: .55 }, { transform: 'scale(1.75)' }],
    { duration: 3800, fill: 'forwards', easing: 'cubic-bezier(.45,0,.9,.6)' });
  r1.firstChild.style.transformOrigin = '86% 58%';
  SFX.rumble(7.6); SFX.clack(7.4);
  every(380, () => { dustPuff(560, 930, 3, -1); dustPuff(1050, 900, 3, -1); });
  await sleep(2900); if (!ok()) { stopAll(); r1.remove(); return; }
  // 2) inside: rush past lanterns, then slow to a stop
  const r2 = rideLayer('story_03c_cave_tunnel.jpg', [[59.5, 16, 190], [54.4, 35, 90], [54, 45, 60], [53.4, 51.5, 40]]);
  r2.classList.add('bob', 'fast');
  const streaks = document.createElement('div'); streaks.className = 'streaks'; r2.appendChild(streaks);
  SFX.whoosh();
  r2.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, fill: 'forwards', easing: 'ease-in-out' });
  r2.firstChild.style.transformOrigin = '54% 47%';
  const z = r2.firstChild.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }], { duration: 4200, fill: 'forwards', easing: 'cubic-bezier(.15,.6,.35,1)' });
  setTimeout(() => r1.remove(), 1000);
  await sleep(2300); if (!ok()) { stopAll(); r2.remove(); return; }
  r2.classList.remove('fast'); streaks.style.opacity = 0;   // braking
  SFX.screech(); stopAll();
  every(160, () => { dustPuff(780, 960, 2, -.4); dustPuff(1170, 960, 2, .4); });
  await sleep(900); stopAll();
  r2.classList.remove('bob'); r2.classList.add('stopBump'); dustPuff(780, 960, 8, -.6); dustPuff(1170, 960, 8, .6);
  await z.finished.catch(() => {}); if (!ok()) { r2.remove(); return; }
  // 3) reveal the chamber (cart parked by the stones)
  await setBg(nextBg); const a = $('storyBg');
  a.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 1100, easing: 'ease-out' });
  const f = r2.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 800, fill: 'forwards', easing: 'ease-in-out' });
  await f.finished.catch(() => {}); r2.remove();
}
/* golden rings light up the 3 stones one by one, with a count badge */
function showStoneRings(list) {
  document.querySelectorAll('.stoneRing').forEach(e => e.remove());
  list.forEach(([cx, cy, w, h], i) => setTimeout(() => {
    const r = document.createElement('div'); r.className = 'stoneRing';
    Object.assign(r.style, { left: (cx - w / 2) + '%', top: (cy - h / 2) + '%', width: w + '%', height: h + '%' });
    r.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><ellipse class="gl" cx="50" cy="50" rx="47" ry="47" pathLength="100"/><ellipse class="run" cx="50" cy="50" rx="47" ry="47" pathLength="100" style="animation-delay:${i * -.6}s"/></svg>`;
    $('storyRig').parentNode.appendChild(r);
    SFX.sparkle(); const b = r.getBoundingClientRect(), st = stage.getBoundingClientRect();
    particles((b.left - st.left + b.width / 2) / SCALE, (b.top - st.top) / SCALE + 10, 8, 'spark', 110);
  }, 350 + i * 650));
}
async function runStory(from = 1) {
  const skip = $('btnSkip'); skip.hidden = true;
  const myRun = ++RUN;
  $('titleCard').hidden = true;
  if (from > 1) { await setBg(STORY[from].bg); }
  else {
    /* outside the mine: Chiku & Bobo walk up to the entrance while the narrator speaks (voice only) */
    $('storyBg').classList.remove('kenburns'); SFX.whoosh();
    await setBg('story_00_mine_outside.jpg', 'cross'); if (myRun !== RUN) return;
    const sb = $('storyBg'); sb.style.transformOrigin = '58% 55%';
    sb.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }], { duration: 7000, easing: 'ease-in-out', fill: 'forwards' });
    await Promise.all([speak('There are hidden gems inside the hill! Chiku and Bobo are going gem hunting.', 'Narrator'), sleep(4500)]);
    sb.getAnimations().forEach(x => x.cancel());
    if (myRun !== RUN) return;
    $('narration').hidden = true;
  }
  for (let i = from; i < STORY.length; i++) {
    const s = STORY[i]; $('bubble').hidden = true;
    const newBg = i === from || s.bg !== STORY[i - 1].bg;
    if (newBg) { rigLayer.classList.add('off'); document.querySelectorAll('.stoneRing').forEach(e => e.remove()); }
    if (i === from && from > 1) { /* jumped here: no entry transition */ }
    else if (s.enter === 'zoom') {
      const a = $('storyBg'); a.classList.remove('kenburns'); a.style.transformOrigin = '62% 52%'; a.style.transition = 'transform 1.8s ease-in'; a.style.transform = 'scale(2.2)';
      SFX.whoosh(); await sleep(700); await setBg(s.bg, 'cross'); a.style.transformOrigin = '';
    } else if (s.enter === 'cave') { await caveRide(s.bg, myRun); }
    else if (s.enter === 'whoosh') { SFX.whoosh(); await setBg(s.bg, 'cross'); }
    else if (s.enter === 'cut') { await setBg(s.bg, 'cross'); }
    else if (s.bg !== STORY[i - 1].bg) await setBg(s.bg, 'cross');
    if (newBg) { buildStoryRig(s.bg); rigLayer.classList.remove('off'); }
    if (myRun !== RUN) return;
    showBubble(s); SFX.pop();
    if (s.rings) showStoneRings(s.rings);
    await speak(s.text, s.who);
    if (myRun !== RUN) return;
    await sleep(900);
    if (myRun !== RUN) return;
    // teaching part: what an improper fraction is, then picture questions
    if (s.teach && window.teachImproper) { $('bubble').hidden = true; const ok = await window.teachImproper(myRun); if (!ok || myRun !== RUN) return; }
  }
  $('bubble').hidden = true; skip.hidden = true;
  loadLevel(0, { silent: true });
  await torchReveal();
  if (myRun !== RUN - 1 && myRun !== RUN) return;
  beginLevel(RUN);
}
function skipStory() {
  RUN++; hush(); storyTap = null; $('story').hidden = true; $('tunnel').hidden = true; $('torch').hidden = true; $('fade').hidden = true;
  $('game').hidden = false; loadLevel(0);
}
$('btnSkip').onclick = e => { e.stopPropagation(); SFX.tap(); skipStory(); };
$('btnPlay').onclick = () => { if ($('btnPlay').dataset.used) return; $('btnPlay').dataset.used = 1; ac(); SFX.tap(); runStory(); };   // one tap only: no double start

/* ===================== HUD ===================== */
LEVELS.forEach((l, i) => { const o = document.createElement('option'); o.value = i; o.textContent = `${l.title} · ${l.plural}`; $('jump').appendChild(o); });
$('jump').onchange = e => { $('story').hidden = true; $('tunnel').hidden = true; $('torch').hidden = true; $('game').hidden = false; loadLevel(+e.target.value); };
$('btnMute').onclick = () => { muted = !muted; if (muted) hush(); $('btnMute').textContent = muted ? '🔇' : '🔊'; $('btnMute').setAttribute('aria-label', muted ? 'Sound off' : 'Sound on'); };

/* ===================== BOOT ===================== */
buildDefs();
setBg(STORY[0].bg); $('storyBg').classList.add('kenburns'); $('titleCard').hidden = false;
// preload images
['backgrounds/' + STORY.map(s => s.bg).join(',backgrounds/'), 'backgrounds/story_00_mine_outside.jpg', 'backgrounds/story_07_bobo_pointing.jpg', 'backgrounds/cover.jpg', 'backgrounds/story_03b_cave_entrance.jpg', 'backgrounds/story_03c_cave_tunnel.jpg', 'backgrounds/game_bg.jpg', 'props/stone_round.png', 'props/tray.svg', 'props/trolley.png', 'ui/board_panel.png', 'ui/speech_bubble.png', 'ui/wood_plank.png', 'characters/chiku.png', 'characters/bobo.png']
  .join(',').split(',').forEach(p => { const i = new Image(); i.src = IMG + p; });

/* instruction panel follows its text: measure the natural width, then animate to it (left side stays put) */
(function () {
  const vo = $('vo'), line = $('voLine'); if (!vo || !line) return;
  const MIN = 620, MAX = 1300;
  let pending = 0;
  function fitVo() {
    const from = vo.offsetWidth;
    vo.style.transition = 'none'; vo.style.width = 'max-content';
    const want = Math.max(MIN, Math.min(MAX, vo.offsetWidth));
    vo.style.width = from + 'px'; void vo.offsetWidth; vo.style.transition = '';
    vo.style.width = want + 'px';
  }
  new MutationObserver(() => { cancelAnimationFrame(pending); pending = requestAnimationFrame(fitVo); })
    .observe(line, { childList: true, characterData: true, subtree: true });
  fitVo();
})();

/* ===================== LEVEL 1: Back + Pause buttons ===================== */
(function () {
  const g = $('game');
  g.insertAdjacentHTML('beforeend', `<button id="g1Back" class="navBtn" aria-label="Back to the previous chamber"><b>◀</b></button>
    <button id="g1Pause" class="navBtn pz" aria-label="Pause"><i></i><i></i></button>
    <div id="g1Paused" class="pauseOv" hidden><h2>Paused</h2><button class="plankBtn big" id="g1Resume">Resume</button></div>`);
  const freeze = on => {
    document.getAnimations().forEach(a => { try { on ? a.pause() : a.play(); } catch (e) { } });
    document.body.classList.toggle('gamePaused', on);
  };
  $('g1Pause').onclick = () => { SFX.tap(); hush(); stopIdle(); handHide(); freeze(true); $('g1Paused').hidden = false; };
  $('g1Resume').onclick = () => {
    SFX.tap(); $('g1Paused').hidden = true; freeze(false);
    // repeat the current instruction so the child knows what to do next
    const t = $('voLine').textContent.trim(); if (t) speak(t, (L() && L().markBy) || 'Bobo');
  };
  // Back: previous chamber (chamber 1 → back to the cover)
  $('g1Back').onclick = () => {
    SFX.tap(); $('g1Paused').hidden = true; freeze(false); hush(); stopIdle(); handHide();
    if (S.li > 0) return loadLevel(S.li - 1);
    location.href = location.pathname + location.search.replace(/[?&](ch|lvl)=\d+/g, '');
  };
})();
