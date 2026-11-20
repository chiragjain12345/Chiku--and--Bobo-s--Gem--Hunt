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
  /* Practice 1–7 from the sheet: every order is a MIXED fraction. Learners uncover whole gems first, then the extra parts.
     shape/d use Level 1's stone cuts. gem = index into LEVELS (0 ruby … 6 jade). */
  const ROUNDS = [
    { w: 2, n: 1, d: 2, give: 'mix', ask: 'mix', shape: 'square',   stones: 4, gem: 1, name: ['emerald', 'emeralds'] },
    { w: 1, n: 1, d: 3, give: 'mix', ask: 'mix', shape: 'triangle', stones: 3, gem: 2, name: ['sapphire', 'sapphires'] },
    { w: 3, n: 1, d: 2, give: 'mix', ask: 'mix', shape: 'circle',   stones: 5, gem: 0, name: ['ruby', 'rubies'] },
    { w: 2, n: 3, d: 4, give: 'mix', ask: 'mix', shape: 'triangle', stones: 4, gem: 3, name: ['topaz', 'topazes'] },
    { w: 1, n: 2, d: 3, give: 'mix', ask: 'mix', shape: 'hexagon',  stones: 3, gem: 4, name: ['amethyst', 'amethysts'] },
    { w: 2, n: 2, d: 5, give: 'mix', ask: 'mix', shape: 'circle',   stones: 4, gem: 5, name: ['aquamarine', 'aquamarines'] },
    { w: 3, n: 1, d: 4, give: 'mix', ask: 'mix', shape: 'rect',     stones: 5, gem: 6, name: ['jade stone', 'jade stones'] }
  ];
  const DEN = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'], 5: ['fifth', 'fifths'], 6: ['sixth', 'sixths'], 7: ['seventh', 'sevenths'] };
  const CH = { W: 474, H: 440, ground: 1010, tipX: .86, tipY: .36, home: 420 };
  RIGS['characters/chiku_pickaxe.png'] = [
    { who: 'Chiku', lid: '#E8853F', eyes: [[54.2, 29.5, 9.5, 9], [65.2, 25.8, 3.6, 7]], mouth: { type: 'jaw', x: 55, y: 39.5, w: 12, h: 4.5, up: 2.7 } }];

  const S2 = { run: 0, r: 0, parts: [], busy: false, phase: 'off', tries: 0, wTries: 0, vals: [], box: 0, idleT: null, paused: false, chX: CH.home };
  const R = () => ROUNDS[S2.r], T = () => R().w * R().d + R().n, U = () => S2.parts.flat().filter(Boolean).length;
  const gemLv = () => LEVELS[R().gem];
  const alive = rid => rid === S2.run && !S2.paused;
  const fr = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
  const mixHTML = r => `<span class="mix"><b>${r.w}</b>${fr(r.n, r.d)}</span>`;
  const impHTML = r => `<span class="mix">${fr(r.w * r.d + r.n, r.d)}</span>`;
  const givenHTML = r => r.give === 'mix' ? mixHTML(r) : impHTML(r);
  const mixWords = r => `${r.w} and ${r.n} ${DEN[r.d][r.n > 1 ? 1 : 0]}`;
  const impWords = r => `${r.w * r.d + r.n} ${DEN[r.d][1]}`;
  const givenWords = r => r.give === 'mix' ? mixWords(r) : impWords(r);
  const plur = (k, a, b) => k === 1 ? a : b;

  /* ---------------- sheet feedback helpers ---------------- */
  const gemName = () => R().name[1], gem1 = () => R().name[0], gemsFor = k => k === 1 ? gem1() : gemName();
  const wordsHTML = r => r.give === 'mix' ? mixHTML(r) : impHTML(r);
  /* uncovered amount as wholes + parts */
  function amountHTML(u, d) { const w = Math.floor(u / d), n = u % d; if (!u) return '0'; if (!n) return `${w} whole`; return w ? `<span class="mix"><b>${w}</b>${fr(n, d)}</span>` : `<span class="mix">${fr(n, d)}</span>`; }
  function setCounter() { const c = $('l2Count'); if (c) { c.innerHTML = ''; c.hidden = true; } }   // the side 'Uncovered' counter is not used any more
  function counterBad() { const c = $('l2Count'); if (!c) return; c.classList.remove('bad'); void c.offsetWidth; c.classList.add('bad'); }
  /* whole gems first: every started stone except at most one must be complete */
  function arrangement() {
    const d = R().d, counts = S2.parts.map(s => s.filter(Boolean).length);
    const partial = counts.map((c, i) => [c, i]).filter(([c]) => c > 0 && c < d).map(([, i]) => i);
    return { partial, scattered: partial.length > 1 };
  }
  function redParts(list) {
    list.forEach(([si, k]) => { const g = partEl(si, k); if (!g) return; g.classList.remove('redpart'); void g.getBBox(); g.classList.add('redpart'); setTimeout(() => g.classList.remove('redpart'), 1600); });
  }
  /* ghost outlines: W full stones + N parts on the next stone */
  function showGhost(on) { S2.ghost = on; S2.parts.forEach((_, si) => renderStone(si)); }
  const ghostHas = (si, k) => { const r = R(); return si < r.w || (si === r.w && k < r.n); };

  /* ---------------- stone geometry: d equal parts ---------------- */
  const partsOf = r => pieces(r.shape, r.d);
  const outlineOf = r => r.shape === 'circle' ? null : outline(r.shape);
  const cracksOf = r => cutLines(r.shape, r.d);

  /* ---------------- rendering ---------------- */
  function stoneSVG(si) {
    const r = R(), pcs = partsOf(r), Lv = gemLv(), up = S2.parts[si], ol = outlineOf(r), full = up.every(Boolean);
    let defs = '', body = '';
    pcs.forEach((pc, k) => {
      const id = `l2c${S2.run}_${si}_${k}`;
      defs += `<clipPath id="${id}"><polygon points="${P(pc)}"/></clipPath>`;
      let inner;
      if (S2.gone && S2.gone[si] && S2.gone[si][k]) inner = '';   // collected by Bobo: that part is gone
      else if (up[k]) inner = `<g class="gemPc" data-k="${k}">${gemPoly(Lv, shrink(pc, .96))}</g>`;
      else if (!ol) inner = `<g class="cover" clip-path="url(#${id})"><image href="${IMG}props/stone_round.png" x="4.5" y="4.5" width="91" height="91" preserveAspectRatio="none"/></g>`;
      else inner = `<polygon class="cover" points="${P(pc)}" fill="url(#stoneTex)"/>`;
      const gh = S2.ghost && !up[k] && ghostHas(si, k) ? `<polygon class="ghost" points="${P(shrink(pc, .9))}" fill="rgba(255,226,140,.28)" stroke="#FFE38A" stroke-width="2.6" stroke-dasharray="4 3" pointer-events="none"/>` : '';
      body += `<g class="part" data-s="${si}" data-k="${k}">${inner}<polygon points="${P(pc)}" fill="transparent"/>${gh}</g>`;
    });
    const allGone = !!(S2.gone && S2.gone[si] && S2.gone[si].every(Boolean));   // Bobo took every part: nothing left to draw
    let lines = full || allGone ? '' : cracksOf(r).map(([a, b]) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#2A1A10" stroke-width="2.6" stroke-linecap="round" pointer-events="none"/>`).join('');
    if (ol && !allGone) lines += `<polygon points="${P(ol)}" fill="none" stroke="${full ? Lv.c[2] : '#4E3A2C'}" stroke-width="3.2" stroke-linejoin="round" pointer-events="none"/>`;
    return `<svg viewBox="-6 -6 112 112"><defs>${defs}</defs>${body}${lines}</svg>`;
  }
  function renderStone(si, popK) {
    const el = $('l2Stones').children[si]; if (!el) return;
    const label = el.querySelector('.label');
    el.innerHTML = stoneSVG(si); if (label) el.appendChild(label);
    el.classList.toggle('emptied', !!(S2.gone && S2.gone[si] && S2.gone[si].every(Boolean)));
    el.querySelectorAll('.part').forEach(g => g.onclick = () => onPart(+g.dataset.s, +g.dataset.k));
    if (popK != null) { const g = el.querySelector(`.gemPc[data-k="${popK}"]`); if (g) g.classList.add('pop'); }
  }
  function buildStones(animate) {
    const n = R().stones, gap = n > 3 ? 46 : 110, size = Math.min(290, (1560 - gap * (n - 1)) / n);
    const box = $('l2Stones'); box.innerHTML = ''; box.style.gap = gap + 'px';
    for (let si = 0; si < n; si++) {
      const el = document.createElement('div'); el.className = 'l2stone'; el.style.width = el.style.height = size + 'px';
      if (animate) { el.classList.add('pop'); el.style.animationDelay = (si * .16) + 's'; el.addEventListener('animationend', e => { if (e.animationName === 'stoneIn') { el.classList.remove('pop'); el.style.animationDelay = ''; } }); }
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
  function setProgress(tick) {
    let el = $('l2List');
    if (!el) { el = document.createElement('div'); el.id = 'l2List'; $('lvl2').appendChild(el); }
    const done = Math.min(S2.r + (tick ? 1 : 0), ROUNDS.length);
    el.innerHTML = `<h4>Gem record <span>${done}/${ROUNDS.length}</span></h4><ul>` + ROUNDS.map((r, i) =>
      `<li class="${i < done ? 'done' : i === S2.r ? 'now' : ''}"><i>${i < done ? '✔' : ''}</i><span class="amt">${i < done ? mixHTML(r) : '<span class="blank">? ?/?</span>'}</span><em>${r.name[1]}</em></li>`).join('') + '</ul>';
    if (tick) { const li = el.querySelectorAll('li')[S2.r]; if (li) li.classList.add('tickPop'); SFX.coin(); }
    $('l2Prog').innerHTML = '';
  }
  function setPlank(html, drop) {
    const pl = $('l2Plank'); pl.innerHTML = html;
    if (drop) { pl.classList.remove('drop'); void pl.offsetWidth; pl.classList.add('drop'); }
  }

  /* ---------------- Chiku + cart (the cart rolls along with Chiku) ---------------- */
  /* Bobo: the collector. Chiku breaks the stones; Bobo walks over with a sack, gathers the gems and tips them into the cart */
  const BO = { W: 250, H: 336, home: 1560 };
  function buildBobo() {
    let b = $('l2Bobo');
    if (!b) { b = document.createElement('div'); b.id = 'l2Bobo'; $('lvl2').insertBefore(b, $('l2Chiku')); }
    const src = IMG + 'characters/bobo_full_shovel.png';
    b.innerHTML = `<div class="shadow"></div><div class="body"><div class="rigbox"><img src="${src}" alt=""><div class="rigLayer">${rigHTML(src, RIGS['characters/bobo_full_shovel.png'])}</div></div><div class="bsack">${SACK}<i class="bcnt"></i></div></div>`;
    b.className = 'idle'; placeBobo(BO.home, true);
  }
  function placeBobo(x, instant) {
    const b = $('l2Bobo'); S2.boX = x;
    if (instant) b.style.transition = 'none';
    b.style.left = x + 'px'; b.style.top = (CH.ground - BO.H) + 'px';
    if (instant) { void b.offsetWidth; b.style.transition = ''; }
  }
  async function boboWalk(x) {
    const b = $('l2Bobo'), d = Math.abs(x - S2.boX); if (d < 10) return;
    b.classList.toggle('flip', x < S2.boX); b.classList.remove('idle'); b.classList.add('walk');
    const ms = Math.min(1100, 300 + d * .7); b.style.transitionDuration = ms + 'ms';
    placeBobo(x); await sleep(ms); b.classList.remove('walk'); b.classList.add('idle');
  }
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
    return null;
  }
  function idleTarget() {
    if (S2.phase === 'uncover') return suggestion();
    if (S2.phase === 'write') return S2.vals[S2.box] ? $('l2keys').querySelector('.go') : $('l2Plank').querySelector('.wbox.on');
    return null;
  }
  function idle(now) {
    clearTimeout(S2.idleT); handHide();
    if (S2.paused || ['off', 'end', 'ride', 'dig'].includes(S2.phase)) return;
    const show = () => {
      if (S2.busy || S2.paused) return;
      if (S2.phase === 'uncover') say('Tap a part to break it open.');
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
    S2.paused = false; S2.run++; buildChiku(); buildBobo(); if ($('l2List')) $('l2List').hidden = false; $('l2Cart').querySelector('.load').innerHTML = '';
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
      await sleep(300); if (!alive(rid)) return;
    }
    loadRound(S2.r, rid);
  }
  async function loadRound(i, rid = S2.run) {
    S2.r = i; const r = R();
    S2.parts = Array.from({ length: r.stones }, () => Array(r.d).fill(false));
    hideHint(); S2.gone = null; S2.tries = 0; S2.wTries = 0; S2.lockAns = false; $('l2keys').classList.remove('lockAns'); S2.firstTries = 0; S2.ghost = false; S2.busy = false; S2.phase = 'uncover';
    $('l2Keys').hidden = true; $('l2Done').hidden = false; $('l2Done').classList.remove('ready'); $('l2Plank').className = '';
    $('l2Plank').style.visibility = ''; setProgress(); setPlank(`Chiku is digging for ${gemName()}…`, true);
    SFX.whoosh(); buildStones(true); updateDone(); setCounter(); $('l2Count').hidden = false; $('l2Chiku').className = 'idle'; hideBubble();
    [300, 460, 620].forEach(t => setTimeout(() => SFX.pop(), t));
    await sleep(750); if (!alive(rid)) return;
    await autoDig(i, rid);
  }
  /* Chiku uncovers the gems by herself: whole gems first, then the extra parts. Then the learner records it. */
  async function autoDig(i, rid, resumed) {
    const r = R(); S2.phase = 'dig'; S2.busy = true;
    if (!resumed) await say(i === 0 ? `Each ${gem1()} stone has ${r.d} parts. Watch me dig! Count what I find.` : `Watch me dig! Count the ${gemName()}.`); if (!alive(rid)) return;
    const order = []; for (let si = 0; si < r.w; si++) for (let k = 0; k < r.d; k++) order.push([si, k]);
    for (let k = 0; k < r.n; k++) order.push([r.w, k]);
    for (const [si, k] of order) {
      if (!alive(rid)) return;
      if (S2.parts[si][k]) continue;          // already dug before a pause
      await strike(partEl(si, k)); if (!alive(rid)) return;
      S2.parts[si][k] = true; renderStone(si, k); setCounter();
      const pr = rel(partEl(si, k)); rockFall(pr.cx, pr.cy); setTimeout(() => SFX.sparkle(), 120);
      if (S2.parts[si].every(Boolean)) {
        const st = $('l2Stones').children[si]; st.classList.add('goodglow'); setTimeout(() => st.classList.remove('goodglow'), 1200);
        SFX.good(); await say(`One whole ${gem1()}!`); if (!alive(rid)) return;
      } else await sleep(260);
    }
    $('l2Count').hidden = true;
    await say(i === 0 ? `How many ${gemName()} did I find? Count the whole ${gemName()} first, then the extra parts. Write it as a mixed fraction.` : `How many ${gemName()} did I find? Write it down.`);
    if (!alive(rid)) return;
    S2.busy = false; openWrite(); idle(i === 0);
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
    if (S2.parts[si][k]) { idle(false); return; }   // already uncovered: stays uncovered
    if (S2.r === 0) {   // sheet, Practice 1: finish one stone before starting another
      const d = R().d, open = S2.parts.findIndex(p => p.some(Boolean) && !p.every(Boolean));
      if (open >= 0 && open !== si) {
        S2.firstTries = (S2.firstTries || 0) + 1; redParts([[si, k]]); oops($('l2Stones').children[si]);
        S2.busy = true;
        if (S2.firstTries === 1) await say('Oops! Try again.', 'bad');
        else {
          hintCard('Finish one stone first. <b>Whole gems first!</b>');
          const st = $('l2Stones').children[open]; st.classList.add('hintglow');
          partEl(open, S2.parts[open].indexOf(false)).classList.add('pulsepart');
          setTimeout(() => { st.classList.remove('hintglow'); document.querySelectorAll('.pulsepart').forEach(e => e.classList.remove('pulsepart')); }, 5000);
          await say('Finish one stone first. Whole gems first!', 'bad');
        }
        if (rid !== S2.run) return; S2.busy = false; idle(S2.firstTries >= 2); return;
      }
    }
    if (S2.firstTries) hideHint();
    S2.busy = true; SFX.tap();
    await strike(partEl(si, k)); if (rid !== S2.run) return;
    S2.parts[si][k] = true; renderStone(si, k); setCounter();
    { const c = $('l2Count'); if (c) { c.classList.remove('tick'); void c.offsetWidth; c.classList.add('tick'); } }
    const pr = rel(partEl(si, k)); rockFall(pr.cx, pr.cy); setTimeout(() => SFX.sparkle(), 120);
    if (S2.parts[si].every(Boolean)) {
      const st = stones[si]; st.classList.add('goodglow'); setTimeout(() => st.classList.remove('goodglow'), 1200);
      setTimeout(() => SFX.good(), 250); { const wh = S2.parts.filter(p => p.every(Boolean)).length, NUM = ['', 'One', 'Two', 'Three', 'Four', 'Five'];
        say(S2.r === 0 ? (wh < R().w ? `${NUM[wh]} whole ${gemsFor(wh)}! Now the next stone.` : `${NUM[wh]} whole ${gemsFor(wh)}! Now just ${R().n} more ${R().d === 2 ? 'half' : 'part'}.`) : `That’s <b>${wh} whole</b> ${gemsFor(wh)}!`); }
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
    const stones = [...$('l2Stones').children], arr = arrangement();
    if (u === t && !arr.scattered) {
      S2.phase = 'check'; S2.busy = true; S2.ghost = false; hideHint(); updateDone(); SFX.good(); confetti(20);
      stones.forEach(e => e.classList.add('goodglow')); setTimeout(() => stones.forEach(e => e.classList.remove('goodglow')), 1400);
      $('l2Stones').querySelectorAll('.gemPc').forEach(g => g.classList.add('shine'));
      const c = $('l2Count'); if (c) c.classList.add('good');
      await speak(S2.r === ROUNDS.length - 1 ? `${mixWords(r)} ${gemName()}! The whole list is done. Great mining, Chiku!` : `${mixWords(r)} ${gemName()}, just like the list!`, 'Bobo'); if (!alive(rid)) return;
      if (c) c.classList.remove('good');
      S2.done = (S2.done || 0) + 1; setProgress(true);
      S2.busy = false; S2.phase = 'collect'; collect(); return;
    }
    /* wrong: too many, or the right amount but scattered (parts not making whole gems) */
    S2.tries++; S2.busy = true;
    counterBad(); oops($('l2Count'), arr.scattered ? 'Oops! Make whole gems first!' : 'Oops! Try again.', true);
    if (arr.scattered) {
      const bad = []; arr.partial.forEach(si => S2.parts[si].forEach((on, k) => on && bad.push([si, k])));
      redParts(bad); arr.partial.forEach(si => wig(stones[si]));
    } else {
      stones.forEach(e => { e.classList.add('redglow'); wig(e); }); setTimeout(() => stones.forEach(e => e.classList.remove('redglow')), 1300);
    }
    if (S2.tries === 1) {
      await say(arr.scattered ? 'Oops! Try again. Make whole gems first!' : `Oops! Try again. The list says ${wordsHTML(r)}. Count the whole gems and parts!`, 'bad');
    } else {
      showGhost(true);
      hintCard(`${wordsHTML(r)} means <b>${r.w} whole</b> ${gemsFor(r.w)} and <b>${r.n} more</b> ${plur(r.n, 'part', 'parts')}. Uncover the glowing outlines!`);
      await say(`${wordsHTML(r)} means ${r.w} whole ${gemsFor(r.w)} and ${r.n} more ${plur(r.n, 'part', 'parts')}.`, 'bad');
    }
    if (!alive(rid)) return;
    await resetStones(rid); if (!alive(rid)) return;
    S2.busy = false; idle(S2.tries >= 2);
  }
  /* wrong amount: rubble flies back onto the stones so the child can start again */
  async function resetStones(rid) {
    await sleep(300); if (!alive(rid)) return;
    S2.parts.forEach((p, si) => p.forEach((on, k) => {
      if (!on) return; const r = rel(partEl(si, k));
      particles(r.cx, r.cy + 60, 6, 'chip', 50);
    }));
    S2.parts = S2.parts.map(p => p.map(() => false));
    S2.parts.forEach((_, si) => renderStone(si));
    $('l2Stones').querySelectorAll('.cover').forEach(c => c.classList.add('recover'));
    SFX.crack(); SFX.whoosh(); setCounter(); updateDone();
    await sleep(500);
  }

  /* ---------------- write it (on the plank + number bar) ---------------- */
  const answer = () => { const r = R(); return r.ask === 'mix' ? [String(r.w), String(r.n), String(r.d)] : r.give === 'mix' ? [String(T()), String(r.d)] : [String(r.w), String(r.n), String(r.d)]; };
  function writeHTML() {
    const r = R(), v = S2.vals, b = i => `<button class="wbox${i === S2.box ? ' on' : v[i] ? ' done' : ''}" data-i="${i}">${v[i] || ''}</button>`;
    const mixBox = `<span class="wmix">${b(0)}<span class="wfrac">${b(1)}<i></i>${b(2)}</span></span>`;
    if (r.ask === 'mix') return `<span class="wq">Chiku found:</span>${mixBox}<span class="wq" style="font-size:.7em">${gemName()}</span>`;
    const box = r.give === 'mix' ? `<span class="wfrac">${b(0)}<i></i>${b(1)}</span>` : mixBox;
    return `<span class="wq">Write ${givenHTML(r)} as ${r.give === 'mix' ? 'an improper fraction' : 'a mixed fraction'}:</span>${box}`;
  }
  function drawWrite() {
    setPlank(writeHTML());
    $('l2Plank').querySelectorAll('.wbox').forEach(x => x.onclick = () => { if (S2.busy) return; SFX.tap(); S2.box = +x.dataset.i; drawWrite(); });
    $('l2keys').querySelector('.go').textContent = S2.lockAns || S2.box === S2.vals.length - 1 ? 'OK' : 'Next';
  }
  function openWrite() {
    const r = R(); S2.phase = 'write'; S2.vals = answer().map(() => ''); S2.box = 0;
    $('l2Done').hidden = true; hideBubble(); $('l2Count').hidden = true;
    const kb = $('l2Keys'); kb.hidden = false; kb.classList.remove('up'); void kb.offsetWidth; kb.classList.add('up');
    $('l2Plank').classList.add('wide'); drawWrite();
    walkTo(CH.home);   // step back so Chiku doesn't stand in front of the stone labels
    if (r.ask !== 'mix') speak(`Write ${givenWords(r)} as ${r.give === 'mix' ? 'an improper fraction' : 'a mixed fraction'}.`, 'Chiku');
    // highlight the record-book row that is being filled
    const li = $('l2List') && $('l2List').querySelectorAll('li')[S2.r]; if (li) li.classList.add('writing');
    idle(false);
  }
  function key(d) {
    if (S2.busy || S2.phase !== 'write') return; SFX.tap(); idle(false);
    if (S2.lockAns) { if (d === 'go') { S2.vals = answer().slice(); return check(); } return; }   // 4th attempt: only OK works
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
      S2.busy = true; hideHint(); SFX.good(); confetti(34); $('l2Keys').hidden = true;
      const res = r.ask === 'mix' ? `${mixHTML(r)} ${gemName()}` : r.give === 'mix' ? `${mixHTML(r)} = ${impHTML(r)}` : `${impHTML(r)} = ${mixHTML(r)}`;
      setPlank(`<span class="wq">Yes!</span> ${res}`); $('l2Plank').classList.add('good'); setLabels(true);
      if (r.ask === 'mix') {
        await speak(`Yes! ${r.w} whole ${gemsFor(r.w)} and ${r.n} ${DEN[r.d][r.n > 1 ? 1 : 0]} more. That’s ${mixWords(r)}! A whole number and a fraction: a mixed fraction.`, 'Bobo');
        if (!alive(rid)) return;
        S2.done = (S2.done || 0) + 1; setProgress(true);
        await sleep(700); if (!alive(rid)) return;
        S2.busy = false; S2.phase = 'collect'; collect(); return;
      }
      await speak(r.give === 'mix'
        ? `Yes! ${mixWords(r)} is ${T()} over ${r.d}. The top number is bigger, so it’s an improper fraction!`
        : `Yes! ${T()} over ${r.d} is ${mixWords(r)}. That’s a mixed fraction!`, 'Chiku');
      if (!alive(rid)) return;
      await sleep(400); if (!alive(rid)) return;
      S2.busy = false; S2.phase = 'collect'; collect();
      return;
    }
    S2.wTries++;
    const pl = $('l2Plank'); pl.classList.remove('bad'); void pl.offsetWidth; pl.classList.add('bad');
    // 3rd wrong: flash the answer (show, then remove). 4th attempt: the answer is written in, only OK can be tapped.
    if (S2.wTries >= 3) {
      S2.busy = true; hideHint(); setLabels(true);
      oops(pl.querySelector('.wfrac') || pl.querySelector('.wmix'), undefined, true);
      await sleep(900); if (!alive(rid)) return;
      S2.vals = ans.slice(); S2.box = ans.length - 1; drawWrite(); $('l2Plank').classList.add('flashAns'); SFX.sparkle();
      await say(`The answer is ${r.ask === 'mix' ? mixWords(r) : r.give === 'mix' ? `${T()} over ${r.d}` : mixWords(r)}.`, 'bad'); if (!alive(rid)) return;
      await sleep(600); if (!alive(rid)) return;
      $('l2Plank').classList.remove('flashAns'); S2.vals = ans.map(() => ''); S2.box = 0; drawWrite();
      await sleep(700); if (!alive(rid)) return;
      S2.lockAns = true; S2.vals = ans.slice(); S2.box = ans.length - 1; drawWrite();
      $('l2keys').classList.add('lockAns'); $('l2Plank').classList.add('locked');
      S2.busy = false; await say('Now tap <b>OK</b>.', 'bad');
      if (alive(rid)) handTapOn($('l2keys').querySelector('.go'));
      return;
    }
    const wb = pl.querySelector('.wfrac') || pl.querySelector('.wmix');
    pl.querySelectorAll('.wbox').forEach(x => x.classList.add('red'));
    setTimeout(() => { S2.vals = answer().map(() => ''); S2.box = 0; if (S2.phase === 'write') drawWrite(); }, 900);
    const swapped = r.give === 'mix' && r.ask !== 'mix' ? (v[0] === ans[1] && v[1] === ans[0]) : (v[0] === ans[0] && v[1] === ans[2] && v[2] === ans[1]);
    if (r.ask === 'mix' && v[0] === String(T()) ) { oops(wb, undefined, true); say(`Careful! The whole number counts only the <b>whole</b> ${gemName()}.`, 'bad'); if (S2.wTries < 2) return; }
    if (swapped) { oops(wb, 'Top and bottom are swapped!', true); say('Careful, the top and bottom are swapped!', 'bad'); return; }
    oops(wb, undefined, true);
    if (S2.wTries === 1) { say('Oops! Try again.', 'bad'); return; }
    hintCard(r.give === 'mix' && r.ask !== 'mix' ? `Bottom: parts in <b>1 whole</b> gem (${r.d}). Top: count <b>all</b> the gem parts.` : `Whole number: count the <b>whole</b> ${gemName()}. Top: the extra parts. Bottom: parts in 1 whole (${r.d}).`);
    S2.busy = true; setLabels(true);
    if (r.ask === 'mix') {
      // count the whole gems, then the extra parts
      const stones = [...$('l2Stones').children]; let w = 0;
      for (let si = 0; si < r.stones && alive(rid); si++) {
        if (!S2.parts[si].every(Boolean)) continue; w++;
        stones[si].classList.add('goodglow'); const pr = rel(stones[si]), tag = document.createElement('div'); tag.className = 'cnt'; tag.textContent = w;
        tag.style.left = pr.cx + 'px'; tag.style.top = (pr.cy - 40) + 'px'; stage.appendChild(tag); setTimeout(() => { tag.remove(); stones[si].classList.remove('goodglow'); }, 3200);
        SFX.coin(); await speak(`${w} whole`, 'Chiku');
      }
      if (alive(rid)) await say(`${r.w} whole ${gemsFor(r.w)}. And ${r.n} more ${plur(r.n, 'part', 'parts')} of a gem cut into ${r.d}.`, 'bad');
      S2.busy = false; idle(true); return;
    }
    if (r.give === 'mix') await say(`Bottom: parts in <b>1 whole</b> gem (${r.d}). Top: count <b>all</b> the gem parts!`, 'bad');
    else await say(`Whole number: count the <b>whole</b> gems. Top: the extra parts. Bottom: parts in 1 whole (${r.d}).`, 'bad');
    if (!alive(rid)) return;
    let n = 0;
    for (let si = 0; si < r.stones; si++) for (let k = 0; k < r.d; k++) {
      if (!S2.parts[si][k] || !alive(rid)) continue;
      n++; const g = $('l2Stones').children[si].querySelector(`.gemPc[data-k="${k}"]`); if (g) { g.classList.remove('pop'); void g.getBBox(); g.classList.add('pop'); }
      const pr = rel(partEl(si, k)), tag = document.createElement('div'); tag.className = 'cnt'; tag.textContent = n;
      tag.style.left = pr.cx + 'px'; tag.style.top = pr.cy + 'px'; stage.appendChild(tag); setTimeout(() => tag.remove(), 2600);
      SFX.coin(); await speak(String(n), 'Chiku');
    }
    S2.busy = false; idle(true);
  }

  /* ---------------- DONE after writing → gems to the cart → tunnel → next ---------------- */
  /* pile the cart's gems as a heap sitting in the bed: bottom row widest, each row a little higher; the front wall hides their lower halves */
  function heapLoad(load) {
    const kids = [...load.children], ROW = [6, 5, 4, 1], GAP = 40, RISE = 20;
    let i = 0;
    ROW.forEach((cap, row) => {
      const n = Math.min(cap, kids.length - i); if (n <= 0) return;
      for (let c = 0; c < n; c++, i++) {
        const el = kids[i], x = (c - (n - 1) / 2) * GAP, rot = ((i * 47) % 30) - 15;
        Object.assign(el.style, { left: `calc(50% + ${x}px)`, bottom: (row * RISE - 8) + 'px', transform: `translateX(-50%) rotate(${rot}deg)`, zIndex: 10 - row });
      }
    });
  }
  async function collect() {
    const rid = S2.run, r = R(), Lv = gemLv(), pcs = partsOf(r), cart = $('l2Cart');
    S2.busy = true; S2.phase = 'ride'; clearTimeout(S2.idleT); handHide(); SFX.tap();
    $('l2Done').classList.remove('ready'); $('l2Plank').classList.remove('good', 'wide'); setLabels(false);
    const bobo = $('l2Bobo'), sack = () => rel(bobo.querySelector('.bsack')), cnt = bobo.querySelector('.bcnt');
    let held = []; S2.gone = S2.parts.map(st => st.map(() => false));
    await speak('Bobo, collect the gems!', 'Chiku'); if (!alive(rid)) return;
    // Bobo goes stone by stone; the uncovered gems hop into his sack
    for (let si = 0; si < S2.parts.length; si++) {
      if (!S2.parts[si].some(Boolean)) continue;
      const st = rel($('l2Stones').children[si]);
      await boboWalk(st.cx - BO.W / 2); if (!alive(rid)) return;
      bobo.classList.add('reach'); setTimeout(() => bobo.classList.remove('reach'), 500);
      let j = 0;
      S2.parts[si].forEach((on, k) => {
        if (!on) return; const pr = rel(partEl(si, k)), sk = sack(), f = document.createElement('div'); f.className = 'fly';
        f.innerHTML = pieceMini(Lv, pcs[k]); f.style.left = (pr.cx - 28) + 'px'; f.style.top = (pr.cy - 28) + 'px'; stage.appendChild(f);
        const dl = 60 + j++ * 110;
        setTimeout(() => { f.style.transform = `translate(${sk.cx - pr.cx}px,${sk.cy - 20 - pr.cy}px) scale(.55) rotate(160deg)`; SFX.pop(); }, dl);
        setTimeout(() => { f.remove(); SFX.coin(); held.push(k); cnt.textContent = held.length; bobo.classList.remove('got'); void bobo.offsetWidth; bobo.classList.add('got'); }, dl + 700);
        S2.parts[si][k] = false; S2.gone[si][k] = true;
      });
      renderStone(si);
      await sleep(800 + j * 110); if (!alive(rid)) return;
    }
    // back to the cart and tip the sack in
    const cr0 = rel(cart);
    await boboWalk(cr0.x + cr0.w + 10); if (!alive(rid)) return;
    bobo.classList.add('tip'); SFX.whoosh();
    const sk = sack(), cr = rel(cart);
    held.forEach((k, i) => {
      const f = document.createElement('div'); f.className = 'fly'; f.innerHTML = pieceMini(Lv, pcs[k]);
      f.style.left = (sk.cx - 28) + 'px'; f.style.top = (sk.cy - 28) + 'px'; stage.appendChild(f);
      setTimeout(() => { f.style.transform = `translate(${cr.cx - sk.cx + (i % 5 - 2) * 18}px,${cr.y + 20 - sk.cy}px) scale(.7) rotate(-200deg)`; }, 80 + i * 90);
      setTimeout(() => {
        f.remove(); SFX.coin(); cart.classList.remove('bump'); void cart.offsetWidth; cart.classList.add('bump');
        const load = cart.querySelector('.load'); if (load.children.length < 16) { load.insertAdjacentHTML('beforeend', pieceMini(Lv, pcs[k])); heapLoad(load); }
        cnt.textContent = held.length - i - 1 || '';
      }, 820 + i * 90);
    });
    await sleep(1000 + held.length * 90); if (!alive(rid)) return;
    bobo.classList.remove('tip'); cnt.textContent = '';
    await boboWalk(BO.home); if (!alive(rid)) return;
    S2.busy = false;
    if (S2.r + 1 >= ROUNDS.length) return finale(rid);
    await rideSilhouette(rid); if (!alive(rid)) return;
    loadRound(S2.r + 1, rid);
  }
  /** like the reference: the scene dims to a dark tunnel and the cart + Chiku ride across in silhouette */
  async function rideSilhouette(rid) {
    // same mine-tunnel journey as Level 1 (timbers, lanterns, rails), Chiku riding to the next gem
    const nx = ROUNDS[S2.r + 1], nm = nx.name[1];
    await tunnelRide(`Practice ${S2.r + 2} · ${nm[0].toUpperCase() + nm.slice(1)}`, ['Chiku']);
    if (!alive(rid)) return;
    $('l2Cart').querySelector('.load').innerHTML = '';
    placeChiku(CH.home, true);
  }
  async function rideSilhouetteOld(rid) {
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
    const list = ROUNDS.map(r => `<div><span class="tk">✔</span>${mixHTML(r)}<em>${r.name[1]}</em></div>`).join('');
    const b = $('l2Board');
    b.innerHTML = `<div style="text-align:center"><h3>Cart full of gems!</h3>
      <p class="ptip" style="max-width:none;color:#5A2E0E">Every order on the list is done: whole gems first, then the extra parts. These are mixed fractions!</p>
      <div class="sumList">${list}</div>
      <div style="display:flex;gap:30px;justify-content:center"><button class="plankBtn" id="l2again">Play again</button><button class="plankBtn" id="l2back">Level 1</button></div></div>`;
    b.style.width = '1560px'; b.style.top = '200px'; if ($('l2List')) $('l2List').hidden = true;   // the summary board replaces the record card b.hidden = false; $('l2Dim').hidden = false;
    $('l2again').onclick = () => { if (S2.phase !== 'end') return; S2.phase = 'off'; SFX.tap(); start({ intro: false }); };
    $('l2back').onclick = () => { SFX.tap(); location.href = location.pathname + location.search.replace(/[?&]lvl=2/, ''); };
    say('Every order on the list is done! Great mining!');
  }

  /* ---------------- controls ---------------- */
  $('l2keys').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(d => `<button data-d="${d}">${d}</button>`).join('') + `<button data-d="del" class="del" aria-label="Delete">⌫</button><button data-d="go" class="go">Next</button>`;
  $('l2keys').querySelectorAll('button').forEach(x => x.onclick = () => key(x.dataset.d));
  addEventListener('keydown', e => {
    if ($('lvl2').hidden || S2.phase !== 'write') return;
    if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('del'); else if (e.key === 'Enter') key('go');
  });
  // Back: previous practice (practice 1 → replay the Level 2 story)
  $('lvl2').insertAdjacentHTML('beforeend', '<button id="l2Back" class="navBtn" aria-label="Back to the previous practice"><b>◀</b></button>');
  $('l2Back').onclick = () => {
    SFX.tap(); hush(); clearTimeout(S2.idleT); handHide(); $('l2Paused').hidden = true; $('l2Board').hidden = true; $('l2Dim').hidden = true;
    document.querySelectorAll('.fly').forEach(f => f.remove()); $('tunnel').hidden = true;
    S2.paused = false; const rid = ++S2.run;
    if ($('l2Bobo')) { placeBobo(BO.home, true); $('l2Bobo').className = 'idle'; }
    $('l2Cart').querySelector('.load').innerHTML = ''; placeChiku(CH.home, true); if ($('l2List')) $('l2List').hidden = false;
    if (S2.r > 0 && S2.phase !== 'end') return loadRound(S2.r - 1, rid);
    if (S2.phase === 'end') return loadRound(ROUNDS.length - 1, rid);
    window.L2.start();
  };
  $('l2Pause').onclick = () => { SFX.tap(); S2.paused = true; hush(); clearTimeout(S2.idleT); handHide(); $('l2Paused').hidden = false; };
  $('l2Resume').onclick = () => {
    SFX.tap(); $('l2Paused').hidden = true; S2.paused = false; S2.busy = false;
    // pausing stops the running step, so pick it up again here
    const rid = ++S2.run, ph = S2.phase;
    $('l2Chiku').className = 'idle';
    if (ph === 'uncover' || ph === 'dig') return autoDig(S2.r, rid, ph === 'dig');
    if (ph === 'ride' || ph === 'collect') {
      // gems were already being collected: finish quickly and go on
      $('l2Bobo') && (placeBobo(BO.home, true), $('l2Bobo').className = 'idle');
      $('l2Cart').querySelector('.load').innerHTML = ''; $('tunnel').hidden = true;
      document.querySelectorAll('.fly').forEach(f => f.remove());
      if (S2.r + 1 >= ROUNDS.length) return finale(rid);
      placeChiku(CH.home, true); return loadRound(S2.r + 1, rid);
    }
    if (ph === 'write') { drawWrite(); return idle(true); }
    if (ph === 'check') S2.phase = 'uncover';
    updateDone(); idle(true);
  };
  $('l2Done').onclick = onDone;

  window.L2 = {
    start: o => { ac(); start(o); },
    round: i => { ac(); enter(); S2.r = i; setProgress(); $('l2Chiku').className = 'idle'; loadRound(i); },
    write: i => { ac(); enter(); loadRound(i); setTimeout(() => { let left = T(); S2.parts = S2.parts.map(s => s.map(() => left-- > 0)); S2.parts.forEach((_, si) => renderStone(si)); onDone(); }, 900); },
    finale: () => { ac(); enter(); finale(S2.run); },
    rounds: ROUNDS
  };
  if (new URLSearchParams(location.search).get('lvl') === '2') { $('titleCard').hidden = true; window.L2.start({ intro: false }); }
})();
