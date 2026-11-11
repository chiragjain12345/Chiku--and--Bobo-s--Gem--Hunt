/* =====================================================================
   LEVEL 2 · Mixed numbers ⇄ improper fractions  (flow follows the reference video)
   Round:  plank "Uncover 2 1/7 gems."  → tap stone parts (Chiku + cart roll under the
   stone, Chiku jumps & smashes the part open) → DONE → plank turns into
   "Write 2 1/7 as an improper fraction: □/□" with the number bar at the bottom
   (Next → OK) → correct: DONE → gems fly into the cart → silhouette tunnel ride →
   next round. Rounds alternate: mixed → improper  and  improper → mixed.
   ===================================================================== */
(function () {
  'use strict';
  /* give: what the plank shows ('mix' = 2 1/7, 'imp' = 15/7); the learner writes the other form */
  const ROUNDS = [
    { w: 2, n: 1, d: 7, give: 'mix', shape: 'poly' },
    { w: 2, n: 2, d: 3, give: 'imp', shape: 'poly' },
    { w: 2, n: 4, d: 7, give: 'mix', shape: 'poly' },
    { w: 2, n: 3, d: 4, give: 'mix', shape: 'square' },
    { w: 1, n: 3, d: 4, give: 'imp', shape: 'square' },
    { w: 1, n: 5, d: 6, give: 'imp', shape: 'poly' }
  ];
  const GEMLV = [2, 1, 5, 3, 6, 4];
  const DEN = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'], 7: ['seventh', 'sevenths'] };
  const CH = { W: 474, H: 440, ground: 1010, tipX: .86, tipY: .36, home: 420 };
  RIGS['characters/chiku_pickaxe.png'] = [
    { who: 'Chiku', lid: '#E8853F', eyes: [[54.2, 29.5, 9.5, 9], [65.2, 25.8, 3.6, 7]], mouth: { type: 'jaw', x: 55, y: 39.5, w: 12, h: 4.5, up: 2.7 } }];

  const S2 = { run: 0, r: 0, parts: [], busy: false, phase: 'off', tries: 0, wTries: 0, vals: [], box: 0, idleT: null, paused: false, chX: CH.home };
  const STONES = 3;
  const R = () => ROUNDS[S2.r], T = () => R().w * R().d + R().n, U = () => S2.parts.flat().filter(Boolean).length;
  const gemLv = () => LEVELS[GEMLV[S2.r % GEMLV.length]];
  const alive = rid => rid === S2.run && !S2.paused;
  const fr = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
  const mixHTML = r => `<span class="mix"><b>${r.w}</b>${fr(r.n, r.d)}</span>`;
  const impHTML = r => `<span class="mix">${fr(r.w * r.d + r.n, r.d)}</span>`;
  const givenHTML = r => r.give === 'mix' ? mixHTML(r) : impHTML(r);
  const mixWords = r => `${r.w} and ${r.n} ${DEN[r.d][r.n > 1 ? 1 : 0]}`;
  const impWords = r => `${r.w * r.d + r.n} ${DEN[r.d][1]}`;
  const givenWords = r => r.give === 'mix' ? mixWords(r) : impWords(r);
  const plur = (k, a, b) => k === 1 ? a : b;

  /* ---------------- stone geometry: d equal parts ---------------- */
  function polyPts(d, shape) {
    const a0 = shape === 'square' ? -135 : -90, rr = shape === 'square' ? 56 : 47;
    return [...Array(d)].map((_, k) => { const a = (a0 + 360 * k / d) * Math.PI / 180; return [50 + rr * Math.cos(a), 52 + rr * Math.sin(a)]; });
  }
  function partsOf(r) {
    if (r.d === 2) return pieces('circle', 2);
    const v = polyPts(r.d, r.shape), c = [50, 52];
    return v.map((p, k) => [c, p, v[(k + 1) % v.length]]);
  }
  const outlineOf = r => r.d === 2 ? null : polyPts(r.d, r.shape);
  const cracksOf = r => r.d === 2 ? cutLines('circle', 2) : polyPts(r.d, r.shape).map(p => [[50, 52], p]);

  /* ---------------- rendering ---------------- */
  function stoneSVG(si) {
    const r = R(), pcs = partsOf(r), Lv = gemLv(), up = S2.parts[si], ol = outlineOf(r), full = up.every(Boolean);
    let defs = '', body = '';
    pcs.forEach((pc, k) => {
      const id = `l2c${S2.run}_${si}_${k}`;
      defs += `<clipPath id="${id}"><polygon points="${P(pc)}"/></clipPath>`;
      let inner;
      if (up[k]) inner = `<g class="gemPc" data-k="${k}">${gemPoly(Lv, shrink(pc, .96))}</g>`;
      else if (!ol) inner = `<g class="cover" clip-path="url(#${id})"><image href="${IMG}props/stone_round.png" x="4.5" y="4.5" width="91" height="91" preserveAspectRatio="none"/></g>`;
      else inner = `<polygon class="cover" points="${P(pc)}" fill="url(#stoneTex)"/>`;
      body += `<g class="part" data-s="${si}" data-k="${k}">${inner}<polygon points="${P(pc)}" fill="transparent"/></g>`;
    });
    let lines = full ? '' : cracksOf(r).map(([a, b]) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#2A1A10" stroke-width="2.6" stroke-linecap="round" pointer-events="none"/>`).join('');
    if (ol) lines += `<polygon points="${P(ol)}" fill="none" stroke="${full ? Lv.c[2] : '#4E3A2C'}" stroke-width="3.2" stroke-linejoin="round" pointer-events="none"/>`;
    return `<svg viewBox="-2 -2 104 104"><defs>${defs}</defs>${body}${lines}</svg>`;
  }
  function renderStone(si, popK) {
    const el = $('l2Stones').children[si]; if (!el) return;
    const label = el.querySelector('.label');
    el.innerHTML = stoneSVG(si); if (label) el.appendChild(label);
    el.querySelectorAll('.part').forEach(g => g.onclick = () => onPart(+g.dataset.s, +g.dataset.k));
    if (popK != null) { const g = el.querySelector(`.gemPc[data-k="${popK}"]`); if (g) g.classList.add('pop'); }
  }
  function buildStones(animate) {
    const box = $('l2Stones'); box.innerHTML = ''; box.style.gap = '150px';
    for (let si = 0; si < STONES; si++) {
      const el = document.createElement('div'); el.className = 'l2stone'; el.style.width = el.style.height = '290px';
      if (animate) { el.classList.add('pop'); el.style.animationDelay = (si * .16) + 's'; }
      box.appendChild(el); renderStone(si);
    }
  }
  const partEl = (si, k) => $('l2Stones').children[si].querySelector(`.part[data-k="${k}"]`);
  function setLabels(on) {
    [...$('l2Stones').children].forEach((el, si) => {
      let lb = el.querySelector('.label');
      if (!on) { if (lb) lb.remove(); return; }
      if (!lb) { lb = document.createElement('div'); lb.className = 'label'; el.appendChild(lb); }
      const c = S2.parts[si].filter(Boolean).length, d = R().d;
      lb.classList.toggle('full', c === d);
      lb.textContent = c === d ? `${d}/${d} = 1 whole` : `${c}/${d}`;
    });
  }
  function setProgress() { $('l2Prog').innerHTML = ROUNDS.map((_, i) => `<i class="${i < S2.r ? 'on' : i === S2.r ? 'now' : ''}"></i>`).join(''); }
  function setPlank(html, drop) {
    const pl = $('l2Plank'); pl.innerHTML = html;
    if (drop) { pl.classList.remove('drop'); void pl.offsetWidth; pl.classList.add('drop'); }
  }

  /* ---------------- Chiku + cart (the cart rolls along with Chiku) ---------------- */
  function buildChiku() {
    const src = IMG + 'characters/chiku_pickaxe.png';
    $('l2Chiku').innerHTML = `<div class="shadow"></div><div class="body"><div class="rigbox"><img src="${src}" alt=""><div class="rigLayer">${rigHTML(src, RIGS['characters/chiku_pickaxe.png'])}</div></div></div>`;
    placeChiku(CH.home, true);
  }
  function placeChiku(x, instant) {
    const c = $('l2Chiku'), cart = $('l2Cart'); S2.chX = x;
    if (instant) [c, cart].forEach(e => { e.style.transition = 'none'; });
    c.style.left = x + 'px'; c.style.top = (CH.ground - CH.H) + 'px';
    cart.style.left = (x - 300) + 'px';
    if (instant) { void c.offsetWidth; c.style.transition = ''; cart.style.transition = ''; }
  }
  async function walkTo(x) {
    x = Math.max(250, Math.min(1920 - CH.W + 60, x));
    if (Math.abs(x - S2.chX) < 12) return;
    const c = $('l2Chiku'), cart = $('l2Cart'); c.classList.remove('idle'); c.classList.add('walk'); cart.classList.add('roll'); hideBubble();
    SFX.rumble(.45); placeChiku(x); await sleep(460); c.classList.remove('walk'); c.classList.add('idle'); cart.classList.remove('roll');
  }
  /** roll under the part, jump up and smash it (hammer pose if available) */
  async function strike(el) {
    const r = rel(el), c = $('l2Chiku'), body = c.querySelector('.body');
    await walkTo(r.cx - CH.tipX * CH.W);
    const rise = Math.max(60, Math.min(460, CH.ground - CH.H + CH.tipY * CH.H - r.cy));
    c.classList.remove('idle');
    const hp = window.HPOSE && HPOSE.Chiku, img = c.querySelector('.rigbox>img'), rig = c.querySelector('.rigLayer');
    if (hp && hp.ok) { img.src = hp.src; rig.style.opacity = 0; setTimeout(() => { img.src = IMG + 'characters/chiku_pickaxe.png'; rig.style.opacity = ''; }, 780); }
    const a = body.animate([
      { transform: 'translateY(0) rotate(0) scale(1,1)' },
      { transform: 'translateY(10px) rotate(-5deg) scale(1.08,.86)', offset: .16 },
      { transform: `translateY(${-rise}px) rotate(-14deg) scale(.95,1.06)`, offset: .46 },
      { transform: `translateY(${-rise}px) rotate(12deg) scale(1.05,.95)`, offset: .58 },
      { transform: 'translateY(0) rotate(0) scale(1.1,.85)', offset: .88 },
      { transform: 'translateY(0) rotate(0) scale(1,1)' }], { duration: 820, easing: 'ease-in-out' });
    SFX.whoosh();
    await sleep(480);
    smashFX(el, 1);
    a.finished.then(() => { c.classList.add('idle'); SFX.tap(); }).catch(() => {});
  }
  async function say(text, cls) {
    $('l2Say').hidden = true;   // voice-over only, no speech bubble on screen
    const body = $('l2Chiku').querySelector('.body'); if (body) body.animate([{ transform: 'none' }, { transform: 'translateY(-6px) rotate(-1.5deg)' }, { transform: 'none' }], { duration: 420 });
    const plain = text.replace(/<span class="mix"><b>(\d+)<\/b><span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span><\/span>/g, (m, w, n, d) => mixWords({ w: +w, n: +n, d: +d }))
      .replace(/<span class="mix"><span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span><\/span>/g, '$1 over $2');
    await speak(plain, 'Chiku');
  }
  function hideBubble() { $('l2Say').hidden = true; }

  /* ---------------- idle help ---------------- */
  function suggestion() {
    const t = T(), u = U(), up = S2.parts;
    if (u === t) return null;
    if (u < t) { let best = -1, bc = -1; up.forEach((s, si) => { const c = s.filter(Boolean).length; if (c < s.length && c > bc) { bc = c; best = si; } }); return best < 0 ? null : partEl(best, up[best].indexOf(false)); }
    let best = -1, bc = 1e9; up.forEach((s, si) => { const c = s.filter(Boolean).length; if (c > 0 && c < bc) { bc = c; best = si; } }); return partEl(best, up[best].lastIndexOf(true));
  }
  function idleTarget() {
    if (S2.phase === 'uncover') return suggestion();
    if (S2.phase === 'write') return S2.vals[S2.box] ? $('l2keys').querySelector('.go') : $('l2Plank').querySelector('.wbox.on');
    return null;
  }
  function idle(now) {
    clearTimeout(S2.idleT); handHide();
    if (S2.paused || ['off', 'end', 'ride'].includes(S2.phase)) return;
    const show = () => {
      if (S2.busy || S2.paused) return;
      if (S2.phase === 'uncover') say(`Uncover ${givenHTML(R())} gems.`);
      if (S2.phase === 'write') speak('Fill in the boxes.', 'Chiku');
      if (S2.phase === 'collect') speak('Tap Done.', 'Chiku');
      handTapOn(idleTarget());
    };
    if (now) handTapOn(idleTarget());
    S2.idleT = setTimeout(function rep() { show(); S2.idleT = setTimeout(rep, 14000); }, S2.r === 0 ? 7000 : 10000);
  }

  /* ---------------- flow ---------------- */
  function enter() {
    RUN++; stopIdle(); hush(); closeBoard(); fb(null);
    ['story', 'game', 'tunnel'].forEach(id => $(id).hidden = true); $('torch').hidden = true;
    $('lvl2').hidden = false; $('l2Board').hidden = true; $('l2Paused').hidden = true; $('l2Dim').hidden = true; $('l2Ride').hidden = true;
    $('l2Keys').hidden = true; $('l2Done').hidden = false; $('l2Plank').className = '';
    S2.paused = false; S2.run++; buildChiku(); $('l2Cart').querySelector('.load').innerHTML = '';
  }
  async function start(opts = {}) {
    enter(); const rid = S2.run;
    S2.r = opts.round || 0; S2.phase = 'off';
    if (opts.intro !== false) {
      $('lvl2').hidden = true;
      await tunnelRide('Level 2 · Mixed Numbers', ['Chiku', 'Bobo']);
      if (!alive(rid)) return;
      $('lvl2').hidden = false; $('l2Stones').innerHTML = ''; setProgress();
      $('l2Plank').style.visibility = 'hidden';
      const c = $('l2Chiku'), cart = $('l2Cart');
      cart.className = 'in'; c.className = 'walk in'; SFX.rumble(1.4);
      await sleep(1300); c.className = 'idle'; cart.className = ''; if (!alive(rid)) return;
      await say('This mine has gems in <b>wholes</b> and <b>parts</b>!'); if (!alive(rid)) return;
      await sleep(250);
      await say('Help me uncover just the right amount of gem!'); if (!alive(rid)) return;
    }
    loadRound(S2.r, rid);
  }
  async function loadRound(i, rid = S2.run) {
    S2.r = i; const r = R();
    S2.parts = Array.from({ length: STONES }, () => Array(r.d).fill(false));
    S2.tries = 0; S2.wTries = 0; S2.busy = false; S2.phase = 'uncover';
    $('l2Keys').hidden = true; $('l2Done').hidden = false; $('l2Done').classList.remove('ready'); $('l2Plank').className = '';
    $('l2Plank').style.visibility = ''; setProgress(); setPlank(`Uncover ${givenHTML(r)} gems.`, true);
    SFX.whoosh(); buildStones(true); updateDone(); $('l2Chiku').className = 'idle'; hideBubble();
    [300, 460, 620].forEach(t => setTimeout(() => SFX.pop(), t));
    await sleep(750); if (!alive(rid)) return;
    if (i === 0) {
      await say(`Uncover ${mixHTML(r)} gems. Each stone has <b>${r.d} parts</b>.`); if (!alive(rid)) return;
      say('Tap a part, and I’ll smash it open!'); idle(true);
    } else if (i === 1) {
      await say(`Now uncover ${impHTML(r)} gems. That’s <b>${T()} parts</b>. Each stone has <b>${r.d}</b>.`); if (!alive(rid)) return;
      idle(true);
    } else { say(`Uncover ${givenHTML(r)} gems.`); idle(false); }
  }
  function updateDone() { $('l2Done').disabled = S2.phase === 'uncover' ? U() === 0 : S2.phase !== 'collect'; }

  const queue = [];
  function onPart(si, k) {
    if (S2.paused || S2.phase !== 'uncover') return;
    if (S2.busy) { if (queue.length < 4 && !queue.some(q => q[0] === si && q[1] === k)) queue.push([si, k]); return; }
    doPart(si, k).then(() => { if (queue.length && !S2.busy) { const [a, b] = queue.shift(); onPart(a, b); } });
  }
  async function doPart(si, k) {
    const rid = S2.run; clearTimeout(S2.idleT); handHide(); setLabels(false);
    const stones = $('l2Stones').children;
    [...stones].forEach(e => e.classList.remove('redglow'));
    if (S2.parts[si][k]) {
      SFX.tap(); S2.parts[si][k] = false; renderStone(si);
      const r = rel(partEl(si, k)); particles(r.cx, r.cy, 6, 'chip', 50); SFX.crack();
      updateDone(); idle(false); return;
    }
    S2.busy = true; SFX.tap();
    await strike(partEl(si, k)); if (rid !== S2.run) return;
    S2.parts[si][k] = true; renderStone(si, k);
    const pr = rel(partEl(si, k)); rockFall(pr.cx, pr.cy); setTimeout(() => SFX.sparkle(), 120);
    if (S2.parts[si].every(Boolean)) {
      const st = stones[si]; st.classList.add('goodglow'); setTimeout(() => st.classList.remove('goodglow'), 1200);
      setTimeout(() => SFX.good(), 250); say('That’s <b>1 whole</b> gem!');
    }
    await sleep(380); S2.busy = false; updateDone();
    if (U() >= T()) { queue.length = 0; return onDone(); }
    idle(false);
  }
  /* the rock covering crumbles: chunks tumble down to the floor */
  function rockFall(x, y) {
    particles(x, y, 10, 'spark', 120);
    for (let k = 0; k < 9; k++) {
      const c = document.createElement('div'); c.className = 'rock'; const s = 14 + Math.random() * 22;
      c.style.width = c.style.height = s + 'px'; c.style.left = (x + (Math.random() - .5) * 90) + 'px'; c.style.top = (y + (Math.random() - .5) * 60) + 'px';
      stage.appendChild(c);
      const dx = (Math.random() - .5) * 220;
      c.animate([{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: `translate(${dx}px,${880 - y}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 1, offset: .85 },
        { transform: `translate(${dx * 1.1}px,${900 - y}px) rotate(400deg)`, opacity: 0 }],
        { duration: 900 + Math.random() * 300, easing: 'cubic-bezier(.4,0,.9,.6)' }).finished.then(() => c.remove(), () => c.remove());
    }
    setTimeout(() => SFX.tap(), 700);
  }

  async function onDone() {
    if (S2.busy || S2.paused) return;
    if (S2.phase === 'collect') return collect();
    if (S2.phase !== 'uncover' || U() === 0) return;
    queue.length = 0;
    const rid = S2.run, r = R(), t = T(), u = U(); clearTimeout(S2.idleT); handHide(); SFX.tap();
    const stones = [...$('l2Stones').children];
    if (u === t) {
      S2.phase = 'check'; S2.busy = true; updateDone(); SFX.good(); confetti(20);
      stones.forEach(e => e.classList.add('goodglow')); setTimeout(() => stones.forEach(e => e.classList.remove('goodglow')), 1400);
      $('l2Stones').querySelectorAll('.gemPc').forEach(g => g.classList.add('shine'));
      await say(`Yes! That’s ${givenHTML(r)} gems!`); if (!alive(rid)) return;
      S2.busy = false; openWrite(); return;
    }
    S2.tries++; SFX.bad();
    const pl = $('l2Plank'); pl.classList.remove('bad'); void pl.offsetWidth; pl.classList.add('bad');
    stones.forEach(e => { e.classList.add('redglow'); wig(e); });
    setTimeout(() => stones.forEach(e => e.classList.remove('redglow')), 1300);
    S2.busy = true;
    if (S2.tries === 1) await say(u > t ? 'Oops! That’s too much gem. Tap a gem piece to cover it back.' : 'Oops! Try again.', 'bad');
    else {
      setLabels(true);
      const mx = pl.querySelector('.mix'); if (mx) { mx.classList.add('glowW'); setTimeout(() => mx.classList.remove('glowW'), 4000); }
      let msg;
      if (u > t) msg = 'That’s too much gem! Tap a gem piece to cover it back.';
      else if (r.give === 'mix') msg = `${mixHTML(r)} means <b>${r.w} whole</b> ${plur(r.w, 'gem', 'gems')} and <b>${r.n} more</b> ${plur(r.n, 'part', 'parts')}. Uncover more!`;
      else msg = `${impHTML(r)} means <b>${t} parts</b>. Each stone has ${r.d} parts. Uncover more!`;
      await say(msg, 'bad');
    }
    if (!alive(rid)) return;
    S2.busy = false; idle(S2.tries >= 2);
  }

  /* ---------------- write it (on the plank + number bar) ---------------- */
  const answer = () => { const r = R(); return r.give === 'mix' ? [String(T()), String(r.d)] : [String(r.w), String(r.n), String(r.d)]; };
  function writeHTML() {
    const r = R(), v = S2.vals, b = i => `<button class="wbox${i === S2.box ? ' on' : v[i] ? ' done' : ''}" data-i="${i}">${v[i] || ''}</button>`;
    const box = r.give === 'mix' ? `<span class="wfrac">${b(0)}<i></i>${b(1)}</span>` : `<span class="wmix">${b(0)}<span class="wfrac">${b(1)}<i></i>${b(2)}</span></span>`;
    return `<span class="wq">Write ${givenHTML(r)} as ${r.give === 'mix' ? 'an improper fraction' : 'a mixed number'}:</span>${box}`;
  }
  function drawWrite() {
    setPlank(writeHTML());
    $('l2Plank').querySelectorAll('.wbox').forEach(x => x.onclick = () => { if (S2.busy) return; SFX.tap(); S2.box = +x.dataset.i; drawWrite(); });
    $('l2keys').querySelector('.go').textContent = S2.box === S2.vals.length - 1 ? 'OK' : 'Next';
  }
  function openWrite() {
    const r = R(); S2.phase = 'write'; S2.vals = answer().map(() => ''); S2.box = 0;
    $('l2Done').hidden = true; hideBubble();
    const kb = $('l2Keys'); kb.hidden = false; kb.classList.remove('up'); void kb.offsetWidth; kb.classList.add('up');
    $('l2Plank').classList.add('wide'); drawWrite();
    speak(`Write ${givenWords(r)} as ${r.give === 'mix' ? 'an improper fraction' : 'a mixed number'}.`, 'Chiku');
    idle(false);
  }
  function key(d) {
    if (S2.busy || S2.phase !== 'write') return; SFX.tap(); idle(false);
    if (d === 'go') {
      if (!S2.vals[S2.box]) return;
      if (S2.box < S2.vals.length - 1) { S2.box++; drawWrite(); return; }
      return check();
    }
    if (d === 'del') { if (S2.vals[S2.box]) S2.vals[S2.box] = ''; else if (S2.box > 0) { S2.box--; S2.vals[S2.box] = ''; } }
    else S2.vals[S2.box] = (S2.vals[S2.box] + d).slice(-2).replace(/^0(\d)/, '$1');
    drawWrite();
  }
  async function check() {
    const r = R(), ans = answer(), v = S2.vals, rid = S2.run;
    if (v.some(x => !x)) return;
    clearTimeout(S2.idleT); handHide();
    if (v.every((x, i) => x === ans[i])) {
      S2.busy = true; SFX.good(); confetti(34); $('l2Keys').hidden = true;
      const res = r.give === 'mix' ? `${mixHTML(r)} = ${impHTML(r)}` : `${impHTML(r)} = ${mixHTML(r)}`;
      setPlank(`<span class="wq">Yes!</span> ${res}`); $('l2Plank').classList.add('good');
      await speak(r.give === 'mix'
        ? `Yes! ${mixWords(r)} is ${T()} over ${r.d}. The top number is bigger, so it’s an improper fraction!`
        : `Yes! ${T()} over ${r.d} is ${mixWords(r)}. That’s a mixed number!`, 'Chiku');
      if (!alive(rid)) return;
      await sleep(400); if (!alive(rid)) return;
      S2.busy = false; S2.phase = 'collect'; collect();
      return;
    }
    S2.wTries++; SFX.bad();
    const pl = $('l2Plank'); pl.classList.remove('bad'); void pl.offsetWidth; pl.classList.add('bad');
    pl.querySelectorAll('.wbox').forEach(x => x.classList.add('red'));
    setTimeout(() => { S2.vals = answer().map(() => ''); S2.box = 0; if (S2.phase === 'write') drawWrite(); }, 900);
    const swapped = r.give === 'mix' ? (v[0] === ans[1] && v[1] === ans[0]) : (v[0] === ans[0] && v[1] === ans[2] && v[2] === ans[1]);
    if (swapped) { say('Careful, the top and bottom are swapped!', 'bad'); return; }
    if (S2.wTries === 1) { say('Oops! Try again.', 'bad'); return; }
    S2.busy = true; setLabels(true);
    if (r.give === 'mix') await say(`Bottom: parts in <b>1 whole</b> gem (${r.d}). Top: count <b>all</b> the gem parts!`, 'bad');
    else await say(`Big number: count the <b>whole</b> gems. Top: parts left over. Bottom: parts in 1 whole (${r.d}).`, 'bad');
    if (!alive(rid)) return;
    let n = 0;
    for (let si = 0; si < STONES; si++) for (let k = 0; k < r.d; k++) {
      if (!S2.parts[si][k] || !alive(rid)) continue;
      n++; const g = $('l2Stones').children[si].querySelector(`.gemPc[data-k="${k}"]`); if (g) { g.classList.remove('pop'); void g.getBBox(); g.classList.add('pop'); }
      const pr = rel(partEl(si, k)), tag = document.createElement('div'); tag.className = 'cnt'; tag.textContent = n;
      tag.style.left = pr.cx + 'px'; tag.style.top = pr.cy + 'px'; stage.appendChild(tag); setTimeout(() => tag.remove(), 2600);
      SFX.coin(); await speak(String(n), 'Chiku');
    }
    S2.busy = false; idle(true);
  }

  /* ---------------- DONE after writing → gems to the cart → tunnel → next ---------------- */
  async function collect() {
    const rid = S2.run, r = R(), Lv = gemLv(), pcs = partsOf(r), cart = $('l2Cart');
    S2.busy = true; S2.phase = 'ride'; clearTimeout(S2.idleT); handHide(); SFX.tap();
    $('l2Done').classList.remove('ready'); $('l2Plank').classList.remove('good', 'wide'); setLabels(false);
    const cr = rel(cart); let j = 0;
    S2.parts.forEach((s, si) => s.forEach((on, k) => {
      if (!on) return; const pr = rel(partEl(si, k)), f = document.createElement('div'); f.className = 'fly';
      f.innerHTML = pieceMini(Lv, pcs[k]); f.style.left = (pr.cx - 28) + 'px'; f.style.top = (pr.cy - 28) + 'px'; stage.appendChild(f);
      const dl = 80 + j++ * 90;
      setTimeout(() => { f.style.transform = `translate(${cr.cx - pr.cx}px,${cr.y + 30 - pr.cy}px) scale(.7) rotate(200deg)`; SFX.pop(); }, dl);
      setTimeout(() => {
        f.remove(); SFX.coin(); cart.classList.remove('bump'); void cart.offsetWidth; cart.classList.add('bump');
        const load = cart.querySelector('.load'); if (load.children.length < 16) load.insertAdjacentHTML('beforeend', pieceMini(Lv, pcs[k]));
      }, dl + 780);
      S2.parts[si][k] = false;
    }));
    [...$('l2Stones').children].forEach((_, si) => renderStone(si));
    await sleep(950 + j * 90); if (!alive(rid)) return;
    S2.busy = false;
    if (S2.r + 1 >= ROUNDS.length) return finale(rid);
    await rideSilhouette(rid); if (!alive(rid)) return;
    loadRound(S2.r + 1, rid);
  }
  /** like the reference: the scene dims to a dark tunnel and the cart + Chiku ride across in silhouette */
  async function rideSilhouette(rid) {
    const ov = $('l2Ride'); ov.hidden = false;
    ov.innerHTML = `<div class="rails"></div><div class="sil"><img class="silChiku" src="${IMG}characters/chiku_pickaxe.png" alt=""><img class="silCart" src="${IMG}props/trolley.png" alt=""></div>`;
    const sil = ov.querySelector('.sil');
    ov.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards' });
    SFX.rumble(2.6); SFX.clack(2.4);
    sil.animate([{ transform: 'translateX(-700px)' }, { transform: 'translateX(2500px)' }], { duration: 2700, easing: 'cubic-bezier(.3,0,.7,1)', fill: 'forwards' });
    await sleep(2400); if (!alive(rid)) { ov.hidden = true; return; }
    $('l2Cart').querySelector('.load').innerHTML = '';
    placeChiku(CH.home, true);
    await ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).finished.catch(() => {});
    ov.hidden = true; ov.innerHTML = '';
  }
  function finale(rid) {
    S2.phase = 'end'; S2.r = ROUNDS.length; setProgress(); clearTimeout(S2.idleT); handHide();
    $('l2Stones').innerHTML = ''; setPlank('Level 2 complete!', true); $('l2Done').hidden = true; $('l2Keys').hidden = true;
    SFX.good(); confetti(60); setTimeout(() => confetti(40), 900);
    const list = ROUNDS.map(r => `<div>${mixHTML(r)}<span>=</span>${impHTML(r)}</div>`).join('');
    const b = $('l2Board');
    b.innerHTML = `<div style="text-align:center"><h3>Cart full of gems!</h3>
      <p class="ptip" style="max-width:none;color:#5A2E0E">You turned mixed numbers into improper fractions, and back again!</p>
      <div class="sumList">${list}</div>
      <div style="display:flex;gap:30px;justify-content:center"><button class="plankBtn" id="l2again">Play again</button><button class="plankBtn" id="l2back">Level 1</button></div></div>`;
    b.style.width = '1300px'; b.style.top = '230px'; b.hidden = false; $('l2Dim').hidden = false;
    $('l2again').onclick = () => { SFX.tap(); start({ intro: false }); };
    $('l2back').onclick = () => { SFX.tap(); location.href = location.pathname + location.search.replace(/[?&]lvl=2/, ''); };
    say('You turned mixed numbers into improper fractions, and back again!');
  }

  /* ---------------- controls ---------------- */
  $('l2keys').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => `<button data-d="${d}">${d}</button>`).join('') + `<button data-d="del" class="del" aria-label="Delete">⌫</button><button data-d="go" class="go">Next</button>`;
  $('l2keys').querySelectorAll('button').forEach(x => x.onclick = () => key(x.dataset.d));
  addEventListener('keydown', e => {
    if ($('lvl2').hidden || S2.phase !== 'write') return;
    if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('del'); else if (e.key === 'Enter') key('go');
  });
  $('l2Pause').onclick = () => { SFX.tap(); S2.paused = true; hush(); clearTimeout(S2.idleT); handHide(); $('l2Paused').hidden = false; };
  $('l2Resume').onclick = () => {
    SFX.tap(); $('l2Paused').hidden = true; S2.paused = false; S2.busy = false;
    if (S2.phase === 'check') S2.phase = 'uncover';
    if (S2.phase === 'ride') S2.phase = 'collect';
    updateDone(); idle(true);
  };
  $('l2Done').onclick = onDone;

  window.L2 = {
    start: o => { ac(); start(o); },
    round: i => { ac(); enter(); S2.r = i; setProgress(); $('l2Chiku').className = 'idle'; loadRound(i); },
    write: i => { ac(); enter(); loadRound(i); setTimeout(() => { let left = T(); S2.parts = S2.parts.map(s => s.map(() => left-- > 0)); S2.parts.forEach((_, si) => renderStone(si)); onDone(); }, 900); },
    finale: () => { ac(); enter(); finale(S2.run); }
  };
  if (new URLSearchParams(location.search).get('lvl') === '2') { $('titleCard').hidden = true; window.L2.start({ intro: false }); }
})();
