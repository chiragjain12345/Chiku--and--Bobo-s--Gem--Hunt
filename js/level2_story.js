/* =====================================================================
   LEVEL 2 · CONTEXT  (from the sheet: Context_Draft 2 → "Context 2",
   Level 2_Draft 2 → "Learning 2" + the list scenes)
   1. Outside the mine, evening: full sacks.        (Context 2, scenes 1–5)
   2. Chalkboard: how 5/2 becomes 2 1/2.            (Learning 2, scenes 1–7)
   3. Morning: Bobo hands Chiku the gem list.       (list scenes 1–2)
   → tunnel ride → Level 2 gameplay.
   Built from existing art; swap in real scene pictures later if they are made.
   ===================================================================== */
(function () {
  'use strict';
  const EM = () => LEVELS[1];                       // emerald colours
  const halfL = pieces('circle', 2)[1], halfR = pieces('circle', 2)[0];
  const gemSVG = (pcs, w) => `<svg viewBox="-6 -6 112 112" style="width:${w}px;height:${w}px;overflow:visible">${pcs.map(pc => gemPoly(EM(), pc)).join('')}</svg>`;
  const fr = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;

  let rid = 0;
  const alive = r => r === rid;
  const wait = (r, ms) => sleep(ms).then(() => alive(r));

  /* ---------- layer + helpers ---------- */
  function layer() {
    let L = $('l2Ctx');
    if (!L) {
      L = document.createElement('section'); L.id = 'l2Ctx'; L.className = 'layer';
      L.innerHTML = `<img class="bg" id="cxBg" alt=""><div id="cxTint"></div><div id="cxStage"></div>
        <div id="cxBubble" class="bubble" hidden><p></p></div><button class="plankBtn small" id="cxSkip">Skip ▸▸</button>`;
      stage.appendChild(L);
      $('cxSkip').onclick = () => { if ($('l2Ctx').hidden) return; SFX.tap(); rid++; finish(true); };   // ignore a second tap
    }
    L.hidden = false; return L;
  }
  const cx = () => $('cxStage');
  /* crop: show only the right part of the outside picture (no painted Chiku & Bobo in it) */
  function setScene(bg, tint, crop) {
    const b = $('cxBg'); b.src = IMG + 'backgrounds/' + bg; b.style.filter = '';
    b.style.transformOrigin = '100% 60%'; b.style.transform = crop ? 'scale(1.75)' : '';
    $('cxTint').style.background = tint || 'none'; cx().innerHTML = ''; hideB(); $('cxBubble').classList.remove('flip');
    $('l2Ctx').animate([{ opacity: .2 }, { opacity: 1 }], { duration: 600 });
  }
  function actor(html, x, y, w, cls = '') {
    const a = document.createElement('div'); a.className = 'cxActor ' + cls; a.innerHTML = html;
    Object.assign(a.style, { left: x + 'px', top: y + 'px', width: w + 'px' }); cx().appendChild(a); return a;
  }
  /* eye positions (% of picture: cx, cy, w, h) — a soft patch of each eye slides so the pupils look somewhere */
  const EYES = {
    'characters/chiku_pickaxe.png': [[52.2, 28.1, 9, 11], [65.6, 24.6, 4.5, 8.4]],
    'characters/bobo_full_shovel.png': [[49.4, 28.1, 7.8, 6.6], [60.9, 31.9, 6.1, 5.8]]
  };
  const img = src => {
    const u = IMG + src, eyes = (EYES[src] || []).map(([cx, cy, w, h]) => `<div class="cxEye" style="left:${cx - w / 2}%;top:${cy - h / 2}%;width:${w}%;height:${h}%"><i style="background-image:url('${encodeURI(u)}');background-size:${(10000 / w).toFixed(2)}% ${(10000 / h).toFixed(2)}%;background-position:${((cx - w / 2) / (100 - w) * 100).toFixed(2)}% ${((cy - h / 2) / (100 - h) * 100).toFixed(2)}%"></i></div>`).join('');
    return `<div class="lb"><img src="${u}" alt="">${eyes}</div>`;
  };
  /** point a character's eyes: x -1 (left) … 1 (right), y -1 (up) … 1 (down) */
  const look = (a, x = 0, y = 0) => { if (!a) return; a.style.setProperty('--lx', x); a.style.setProperty('--ly', y); };
  /** speech bubble near a character, voice, then a short pause */
  async function line(r, who, text, x, y, w = 560, fs = 38) {
    if (!alive(r)) return false;
    const b = $('cxBubble'); b.querySelector('p').innerHTML = text; b.querySelector('p').style.fontSize = fs + 'px';
    Object.assign(b.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: 'auto', minHeight: '150px' });
    b.hidden = false; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); SFX.pop();
    await speak(text, who); return wait(r, 650);
  }
  function hideB() { $('cxBubble').hidden = true; }

  /* ---------- 1. Context 2 ---------- */
  async function context2(r) {
    // scene 1: evening, the trolley rolls out of the mine, Chiku & Bobo hop out with full sacks
    setScene('story_00_mine_outside.jpg', 'linear-gradient(rgba(255,130,50,.32),rgba(70,20,60,.45))', true);
    SFX.rumble(1.4); if (!await wait(r, 900)) return false;
    const ch = actor(img('characters/chiku_pickaxe.png'), 330, 540, 420), bo = actor(img('characters/bobo_full_shovel.png'), 780, 420, 420);
    // they walk out of the dark mine entrance: small and dim at the tunnel mouth, growing as they step forward
    const MOUTH = { x: 520, y: 650 }, RATIO = [408 / 440, 760 / 566];
    [ch, bo].forEach((a, i) => {
      a.style.transformOrigin = '50% 100%';
      const w = a.offsetWidth, h = w * RATIO[i], bx = a.offsetLeft + w / 2, by = a.offsetTop + h;
      const dx = MOUTH.x - bx + (i ? 40 : -40), dy = MOUTH.y - by;
      const kf = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8, e = 1 - Math.pow(1 - t, 2), bob = k % 2 ? -14 * (1 - t * .6) : 0;
        kf.push({ offset: t, opacity: Math.min(1, t * 3), filter: `brightness(${(.25 + .75 * Math.min(1, t * 1.6)).toFixed(2)})`,
          transform: `translate(${(dx * (1 - e)).toFixed(1)}px,${(dy * (1 - e) + bob).toFixed(1)}px) scale(${(.3 + .7 * e).toFixed(3)})` });
      }
      a.animate(kf, { duration: 1700, delay: i * 650, easing: 'linear', fill: 'both' });
      for (let k = 1; k < 5; k++) setTimeout(() => SFX.tap(), i * 650 + k * 380);
    });
    if (!await wait(r, 1900)) return false;
    const s1 = actor(`<div class="cxSack">${SACK}</div>`, 600, 820, 150), s2 = actor(`<div class="cxSack">${SACK}</div>`, 1010, 830, 150);
    [s1, s2].forEach((a, i) => a.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.15)', offset: .7 }, { transform: 'scale(1)' }], { duration: 600, delay: 200 + i * 200, fill: 'both' }));
    setTimeout(() => { SFX.sparkle(); particles(680, 860, 10, 'spark', 120); particles(1090, 870, 10, 'spark', 120); }, 600);
    if (!await wait(r, 1000)) return false;
    look(ch, .4, 1); look(bo, -1, .3);                 // Chiku looks down at the sacks, Bobo at Chiku
    $('cxBubble').classList.add('flip');               // bubble up-left of Chiku, tail pointing down at his head
    if (!await line(r, 'Chiku', 'Look at all the gems we collected!', 100, 340, 470)) return false;
    $('cxBubble').classList.remove('flip');
    look(bo, .4, 1); look(ch, 1, -.3);                 // Bobo looks at his sack, Chiku at Bobo
    if (!await line(r, 'Bobo', 'Our sacks are so full!', 950, 250, 460)) return false;

    // scenes 2–4: a flat rock, a cloth, 5 half-emeralds join into 2 wholes and a half
    setScene('story_00_mine_outside.jpg', 'linear-gradient(rgba(255,130,50,.24),rgba(70,20,60,.38))', true);
    $('cxBg').style.filter = 'blur(6px) brightness(.8)';
    // warm light pool behind the mat + slow floating sparkles
    actor(`<div class="cxMotes">${Array.from({ length: 16 }, (_, k) => `<i style="left:${(k * 61) % 100}%;top:${(k * 37) % 100}%;animation-delay:${(-k * .7).toFixed(1)}s;animation-duration:${(5 + (k % 5)).toFixed(1)}s"></i>`).join('')}</div>`, 300, 120, 1500);
    // a picnic mat laid on the ground (perspective), with a soft shadow
    actor(`<svg class="cxMat" viewBox="-20 -20 1240 370"><defs>
      <pattern id="ging" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#C93A33"/><rect width="22" height="44" fill="#E46A5E" opacity=".75"/><rect width="44" height="22" fill="#F4B3A8" opacity=".5"/></pattern>
      <linearGradient id="matShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient></defs>
      <ellipse cx="600" cy="322" rx="640" ry="36" fill="rgba(0,0,0,.45)"/>
      <path d="M140 10 L1060 10 L1180 300 L20 300 Z" fill="url(#ging)" stroke="#F3DDB5" stroke-width="12" stroke-linejoin="round"/>
      <path d="M140 10 L1060 10 L1180 300 L20 300 Z" fill="url(#matShade)"/>
      <path d="M158 30 L1042 30 L1150 282 L50 282 Z" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-dasharray="14 12"/>
      ${Array.from({ length: 39 }, (_, k) => `<line x1="${30 + k * 30}" y1="306" x2="${30 + k * 30}" y2="326" stroke="#F3DDB5" stroke-width="5" stroke-linecap="round"/>`).join('')}
      </svg>`, 360, 540, 1240);
    const ch2 = actor(img('characters/chiku_pickaxe.png'), 20, 400, 400);
    const sack = actor(`<div class="cxSack">${SACK}</div>`, 250, 730, 150);
    look(ch2, .2, 1);                                  // at the sack
    if (!await line(r, 'Chiku', 'Let me see my emeralds.', 160, 250, 560)) return false;
    look(ch2, 1, .6);                                  // at the gems on the mat
    // pour: 5 halves fly from the sack and land in a neat row in the middle of the mat
    const G = 165, CY = 700, Y = CY - G / 2, CXS = [660, 820, 980, 1140, 1300], X = CXS.map(c => c - G / 2), H = [];
    for (let k = 0; k < 5; k++) {
      const h = actor(gemSVG([k % 2 ? halfR : halfL], G), X[k], Y, G, 'half');
      h.animate([{ transform: `translate(${300 - X[k]}px,${800 - Y}px) scale(.3) rotate(-200deg)`, opacity: 0 }, { transform: `translateY(-60px)`, opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 750, delay: k * 160, easing: 'ease-out', fill: 'both' });
      setTimeout(() => SFX.pop(), k * 160 + 500); H.push(h);
    }
    sack.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(35deg)', offset: .3 }, { transform: 'rotate(35deg)', offset: .8 }, { transform: 'rotate(0)' }], { duration: 1300 });
    if (!await wait(r, 1600)) return false;
    // tally board: wholes / halves, updated as halves join
    const tally = actor(`<div class="cxTally"><div><span class="ti">${gemSVG(pieces('circle', 2), 54)}</span><b id="tW">0</b><em>whole</em></div><div><span class="ti">${gemSVG([halfL], 54)}</span><b id="tH">5</b><em>halves</em></div></div>`, 1380, 70, 440);
    tally.animate([{ transform: 'translateY(-260px)' }, { transform: 'translateY(12px)', offset: .7 }, { transform: 'none' }], { duration: 700, easing: 'ease-out', fill: 'both' });
    const setTally = (w, h) => {
      [['tW', w], ['tH', h]].forEach(([id, v]) => { const b = $(id); if (b.textContent != v) { b.textContent = v; b.animate([{ transform: 'scale(1.7)', color: '#2FBF71' }, { transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.3,1.6,.5,1)' }); } });
      $('tW').nextElementSibling.textContent = w === 1 ? 'whole' : 'wholes'; $('tH').nextElementSibling.textContent = h === 1 ? 'half' : 'halves';
    };
    // slots after joining: 2 wholes + 1 half, centred on the mat
    const SLOT = [700, 980, 1260];
    const tag = (t, cxp, cls = '') => { const d = actor(`<div class="cxTag ${cls}">${t}</div>`, cxp - 90, CY + 90, 180); d.animate([{ transform: 'scale(0)' }, { transform: 'none' }], { duration: 350, easing: 'cubic-bezier(.3,1.6,.5,1)', fill: 'both' }); return d; };
    const slide = (h, cxp) => h.animate([{ left: h.style.left }, { left: (cxp - G / 2) + 'px' }], { duration: 700, easing: 'cubic-bezier(.5,0,.3,1.3)', fill: 'forwards' });
    let joined = 0;
    const join = (a, b, cxp) => {
      slide(a, cxp); slide(b, cxp);
      setTimeout(() => { SFX.coin(); SFX.sparkle(); particles(cxp, CY, 12, 'spark', 110); a.classList.add('whole'); b.classList.add('whole'); tag('1 whole', cxp); joined++; setTally(joined, 5 - 2 * joined); }, 700);
    };
    join(H[0], H[1], SLOT[0]); slide(H[2], SLOT[1] - 40); slide(H[3], SLOT[1] + 40); slide(H[4], SLOT[2] + G / 4);
    if (!await wait(r, 1000)) return false;
    if (!await line(r, 'Chiku', 'Wait! Two pieces make a whole emerald!', 160, 215, 520)) return false;
    join(H[2], H[3], SLOT[1]);
    if (!await wait(r, 1000)) return false;
    H[4].classList.add('glowHalf'); tag('1 half', SLOT[2], 'half');
    if (!await line(r, 'Chiku', 'I have 2 whole emeralds and one half!', 160, 215, 520)) return false;
    // scene 5: Bobo looks at the cloth and nods
    const bo2 = actor(img('characters/bobo_full_shovel.png'), 1520, 400, 330, 'nod');
    look(bo2, -1, .6); look(ch2, 1, 0);
    bo2.animate([{ transform: 'translateX(400px)' }, { transform: 'none' }], { duration: 700, easing: 'ease-out', fill: 'both' });
    if (!await wait(r, 800)) return false;
    look(bo2, -1, 0);                                  // Bobo turns to Chiku
    $('cxBubble').classList.add('flip');
    return line(r, 'Bobo', 'Yes! That is a mixed fraction. Let’s see how it is formed.', 1130, 250, 600, 34);
  }

  /* ---------- 2. Learning 2: chalkboard ---------- */
  async function learning2(r) {
    setScene('game_bg.jpg'); $('cxBg').style.filter = 'brightness(.55)';
    const board = actor(`<div class="chalk"><svg viewBox="0 0 1400 700" id="ckSvg"></svg><div id="ckHtml"></div><div class="ckTray"><i class="stick a"></i><i class="stick b"></i><i class="stick c"></i><i class="eraser"></i></div></div>`, 424, 40, 1500);
    board.style.zoom = .8;
    // the two speakers stand below the board, left and right; whoever talks bounces and the bubble points at them
    const who = {
      Chiku: actor(img('characters/chiku_pickaxe.png'), 50, 700, 390, 'ckSpk left'),
      Bobo: actor(img('characters/bobo_full_shovel.png'), 1590, 690, 280, 'ckSpk right')
    };
    who.Chiku.animate([{ transform: 'translateX(-500px)' }, { transform: 'none' }], { duration: 700, easing: 'ease-out', fill: 'both' });
    who.Bobo.animate([{ transform: 'translateX(500px)' }, { transform: 'none' }], { duration: 700, easing: 'ease-out', fill: 'both' });
    const BOARD = { Chiku: [.8, -1], Bobo: [-1, -1] }, AT = { Chiku: [1, -.2], Bobo: [-1, -.2] };
    look(who.Chiku, ...BOARD.Chiku); look(who.Bobo, ...BOARD.Bobo);
    const talk = async (r, w, text, fs = 40) => {
      const other = w === 'Chiku' ? 'Bobo' : 'Chiku', aboutOther = new RegExp('\\b' + other + '\\b').test(text);
      look(who[w], ...(aboutOther ? AT[w] : BOARD[w])); look(who[other], ...(aboutOther ? AT[other] : BOARD[other]));
      if (aboutOther) setTimeout(() => { look(who[w], ...BOARD[w]); look(who[other], ...BOARD[other]); }, 1800);
      Object.entries(who).forEach(([n, a]) => { a.classList.toggle('on', n === w); a.classList.remove('talking'); });
      void who[w].offsetWidth; who[w].classList.add('talking');
      return line(r, w, text, w === 'Chiku' ? 400 : 620, 735, 900, fs);
    };
    const lineFlip = (r, w, ...rest) => { $('cxBubble').classList.toggle('flip', w === 'Bobo'); return talk(r, w, ...rest); };
    board.animate([{ transform: 'scale(.8)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    const svg = $('ckSvg'), html = $('ckHtml');
    const R0 = 100, hp = side => side < 0 ? `M0 ${-R0} A${R0} ${R0} 0 0 0 0 ${R0} Z` : `M0 ${-R0} A${R0} ${R0} 0 0 1 0 ${R0} Z`;
    const K = 1448 / 1400, sx = x => x * K, sy = y => y * 1.011;     // svg units → board px (for the html labels)
    svg.innerHTML = `<defs><filter id="chalkF" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></defs>`;
    const halves = [], Y0 = 400;
    const xs = [300, 500, 700, 900, 1100];
    xs.forEach((x, k) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = `<path d="${hp(k % 2 ? 1 : -1)}" class="ck em"/>`; g.setAttribute('transform', `translate(${x} ${Y0})`); g.style.transition = 'transform .8s cubic-bezier(.5,0,.3,1.3)';
      svg.appendChild(g); halves.push(g);
      g.firstChild.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.12)', opacity: 1, offset: .7 }, { transform: 'none', opacity: 1 }], { duration: 500, delay: 300 + k * 160, fill: 'both' });
    });
    const lab = (h, x, y, cls = '') => { const d = document.createElement('div'); d.className = 'ckLab ' + cls; d.innerHTML = h; d.style.left = x + 'px'; d.style.top = y + 'px'; html.appendChild(d); return d; };
    const vis = k => xs[k] + (k % 2 ? 50 : -50);              // visual centre of half k at its start
    const fade = el => { el.style.opacity = 0; setTimeout(() => el.remove(), 400); };
    // 1: count the halves 1…5, each labelled ½
    const l52 = lab(fr(5, 2), sx(700), 30, 'big');
    const halfTags = xs.map((x, k) => lab(fr(1, 2), sx(vis(k)), sy(Y0 + R0 + 16), 'tag'));
    const nums = xs.map((x, k) => { const n = lab(String(k + 1), sx(vis(k)), sy(Y0 - R0 - 70), 'num'); n.style.opacity = 0; return n; });
    nums.forEach((n, k) => setTimeout(() => { n.style.opacity = 1; halves[k].firstChild.classList.add('lit'); SFX.coin(); }, 1300 + k * 450));
    if (!await lineFlip(r, 'Bobo', 'Chiku has 5 halves. That is 5/2.')) return false;
    if (!await wait(r, Math.max(0, 900))) return false;
    nums.forEach(fade); halves.forEach(h => h.firstChild.classList.remove('lit'));
    // 2: two halves make one whole
    const W1 = 470, W2 = 730, HX = 1010;
    halves[0].setAttribute('transform', `translate(${W1} ${Y0})`); halves[1].setAttribute('transform', `translate(${W1} ${Y0})`);
    fade(halfTags[0]); fade(halfTags[1]);
    setTimeout(() => { SFX.coin(); halves[0].firstChild.classList.add('whole'); halves[1].firstChild.classList.add('whole'); lab('1 whole', sx(W1), sy(Y0 + R0 + 20), 'tag w'); }, 750);
    if (!await wait(r, 900)) return false;
    if (!await lineFlip(r, 'Chiku', 'Two halves make one whole.')) return false;
    // 3
    halves[2].setAttribute('transform', `translate(${W2} ${Y0})`); halves[3].setAttribute('transform', `translate(${W2} ${Y0})`);
    halves[4].setAttribute('transform', `translate(${HX} ${Y0})`);
    fade(halfTags[2]); fade(halfTags[3]); halfTags[4].style.left = sx(HX - 50) + 'px';
    setTimeout(() => { SFX.coin(); halves[2].firstChild.classList.add('whole'); halves[3].firstChild.classList.add('whole'); lab('1 whole', sx(W2), sy(Y0 + R0 + 20), 'tag w'); halves[4].firstChild.classList.add('lit'); }, 750);
    if (!await wait(r, 900)) return false;
    if (!await lineFlip(r, 'Bobo', 'Now we have 2 wholes and 1 half.')) return false;
    html.querySelectorAll('.ckLab.tag').forEach(fade); halves[4].firstChild.classList.remove('lit');
    l52.style.opacity = 0; if (!await wait(r, 450)) return false;
    // 4: labels 2 and 1/2, then they slide together into 2 1/2
    l52.style.opacity = 0;
    const l2 = lab('2', sx((W1 + W2) / 2), sy(Y0 + R0 + 20), 'big'), lh = lab(fr(1, 2), sx(HX - 50), sy(Y0 + R0 + 10), 'big');
    SFX.chalk(); if (!await wait(r, 900)) return false;
    l2.style.left = sx(650) + 'px'; lh.style.left = sx(740) + 'px'; l2.classList.add('slide'); lh.classList.add('slide'); SFX.whoosh();
    if (!await wait(r, 750)) return false;
    l2.remove(); lh.remove();
    const both = lab(`<span class="mix"><b>2</b>${fr(1, 2)}</span>`, sx(700), sy(Y0 + R0 + 10), 'big');
    const l2b = { classList: both.querySelector('b').classList }, lhb = { classList: both.querySelector('.fr').classList };
    if (!await lineFlip(r, 'Chiku', 'We write it as 2 1/2. We say “two and a half.”')) return false;
    // 5: the 2 → the wholes, the 1/2 → the half
    const arrow = (x1, y1, x2, y2, col) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', `M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 60} ${x2} ${y2}`); p.setAttribute('class', 'ckArrow'); p.style.stroke = col; svg.appendChild(p); return p; };
    // a chalk box around BOTH wholes → arrow to the 2; later the half → arrow to the 1/2
    const NS = 'http://www.w3.org/2000/svg', mk = (tag, at) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); svg.appendChild(e); return e; };
    const curve = (x1, y1, cx, cy, x2, y2, col) => { const p = mk('path', { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, class: 'ckArrow' }); p.style.stroke = col;
      const ang = Math.atan2(y2 - cy, x2 - cx), h = (t, d) => `${x2 - 26 * Math.cos(ang + t)} ${y2 - 26 * Math.sin(ang + t)}`;
      mk('path', { d: `M${h(.45)} L${x2} ${y2} L${h(-.45)}`, fill: 'none', stroke: col, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); return p; };
    const box = mk('rect', { x: W1 - R0 - 22, y: Y0 - R0 - 22, width: (W2 - W1) + 2 * R0 + 44, height: 2 * R0 + 44, rx: 34, fill: 'none', stroke: '#FFE38A', 'stroke-width': 7, 'stroke-dasharray': '16 10', class: 'ckBox' });
    box.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 });
    l2b.classList.add('ckGlow'); curve(470, Y0 + R0 + 22, 520, 590, 618, 585, '#FFE38A'); [0, 1, 2, 3].forEach(k => halves[k].firstChild.classList.add('lit')); SFX.sparkle();
    if (!await wait(r, 1200)) return false;
    l2b.classList.remove('ckGlow'); lhb.classList.add('ckGlow'); mk('rect', { x: HX - R0 - 16, y: Y0 - R0 - 16, width: R0 + 32, height: 2 * R0 + 32, rx: 26, fill: 'none', stroke: '#9BE7FF', 'stroke-width': 7, 'stroke-dasharray': '16 10' }); curve(HX - 50, Y0 + R0 + 18, 900, 600, 808, 585, '#9BE7FF'); [0, 1, 2, 3].forEach(k => halves[k].firstChild.classList.remove('lit')); halves[4].firstChild.classList.add('lit'); SFX.sparkle();
    if (!await lineFlip(r, 'Bobo', 'The 2 is the whole number. The 1/2 is the fraction.')) return false;
    // 6: definition
    svg.querySelectorAll(':scope > :not(defs)').forEach(e => e.remove()); html.innerHTML = '';
    lab(`<span class="mix"><b>2</b>${fr(1, 2)}</span>`, 260, 180, 'huge');
    lab('<b>Mixed fraction:</b><br>a whole number and<br>a fraction together.', 700, 230, 'def');
    SFX.chalk();
    if (!await lineFlip(r, 'Chiku', 'A whole number and a fraction together is called a mixed fraction.', 34)) return false;
    // 7: 5/2 = 2 1/2 with pictures
    html.innerHTML = '';
    const LX = 360, RX = 1030, PY = 450, r2 = 50;
    lab(fr(5, 2), sx(LX), 40, 'big'); lab('=', sx(700), 95, 'big eq'); lab(`<span class="mix"><b>2</b>${fr(1, 2)}</span>`, sx(RX), 40, 'big');
    const pic = (x, side, whole, delay) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.innerHTML = whole ? `<g class="ck em whole"><circle r="${r2}"/><line x1="0" y1="${-r2}" x2="0" y2="${r2}"/></g>` : `<path class="ck em" d="${side < 0 ? `M0 ${-r2} A${r2} ${r2} 0 0 0 0 ${r2} Z` : `M0 ${-r2} A${r2} ${r2} 0 0 1 0 ${r2} Z`}"/>`;
      g.setAttribute('transform', `translate(${x} ${PY})`); svg.appendChild(g);
      g.firstChild.animate([{ transform: 'scale(0)' }, { transform: 'none' }], { duration: 400, delay, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'both' });
    };
    // left: 5 separate halves, centred under 5/2
    for (let k = 0; k < 5; k++) pic(LX + (k - 2) * 82 + r2 / 2, -1, false, 200 + k * 120);
    // right: 2 wholes and a half, centred under 2 1/2
    pic(RX - 125, 0, true, 900); pic(RX - 10, 0, true, 1020); pic(RX + 95 + r2 / 2, -1, false, 1140);
    lab('5 halves', sx(LX), sy(PY + r2 + 24), 'tag');
    lab('2 wholes + 1 half', sx(RX), sy(PY + r2 + 24), 'tag w');
    SFX.chalk();
    return lineFlip(r, 'Bobo', '5/2 and 2 1/2 are the same amount of emerald.');
  }

  /* ---------- 3. The list ---------- */
  async function listScene(r) {
    setScene('story_00_mine_outside.jpg', 'none', true);
    const ch = actor(img('characters/chiku_pickaxe.png'), 150, 560, 420), bo = actor(img('characters/bobo_full_shovel.png'), 900, 500, 380);   // on the dirt path, in front of the rocks
    if (!await wait(r, 500)) return false;
    // the rolled list travels from Bobo to Chiku, then unrolls
    look(ch, 1, -.2); look(bo, -1, 0);
    $('cxBubble').classList.add('flip');
    if (!await line(r, 'Bobo', 'Our friends back home need some gems too!', 580, 330, 560, 34)) return false;
    hideB(); $('cxBubble').classList.remove('flip');
    look(ch, 1, -.2); look(bo, -1, 0);
    if (!await line(r, 'Chiku', 'Let’s find some for them! I will uncover the gems, and you collect. Let’s go!', 300, 370, 600, 34)) return false;
    // Chiku hops into the trolley, which rolls into the tunnel
    hideB();
    ch.animate([{ transform: 'none' }, { transform: 'translate(260px,-260px)', offset: .5 }, { transform: 'translate(480px,-120px) scale(.7)' }], { duration: 1000, easing: 'ease-in-out', fill: 'forwards' });
    SFX.whoosh(); if (!await wait(r, 1000)) return false; SFX.tap();
    ch.animate([{ transform: 'translate(480px,-120px) scale(.7)', opacity: 1 }, { transform: 'translate(560px,-300px) scale(.35)', opacity: 0 }], { duration: 1200, delay: 300, easing: 'ease-in', fill: 'forwards' });
    SFX.rumble(1.5); return wait(r, 1600);
  }

  function finish(skipped) {
    const L = $('l2Ctx'); if (L) L.hidden = true; hush();
    if (skipped) window.L2._start({});
  }
  async function play(parts = ['ctx', 'learn', 'list']) {
    const r = ++rid; RUN++; stopIdle(); hush(); closeBoard(); fb(null);
    ['story', 'game', 'tunnel', 'lvl2'].forEach(id => $(id).hidden = true);
    layer();
    for (const p of parts) {
      const ok = await (p === 'ctx' ? context2(r) : p === 'learn' ? learning2(r) : listScene(r));
      if (!ok || !alive(r)) return false;
    }
    finish(false); return true;
  }
  // Level 2 now starts with its story, then the ride and the game
  const base = window.L2.start; window.L2._start = base;
  window.L2.start = o => { ac(); if (o && o.intro === false) return base(o); play().then(ok => ok && base(o || {})); };
  window.L2.story = parts => { ac(); return play(parts); };
})();
