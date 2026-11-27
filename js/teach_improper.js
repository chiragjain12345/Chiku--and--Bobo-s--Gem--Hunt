/* =====================================================================
   STORY · What is an improper fraction?  (plays after Bobo's
   "By forming improper fractions!" and before "Can you help us?")
   1. Chalkboard: cut each whole into equal parts and share them.
   2. "How will I say how many pieces I have?" → total pieces / pieces in one whole.
   3. Three picture questions: choose the right improper fraction.
   ===================================================================== */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const fr = (n, d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
  const QUESTIONS = [
    { gem: 0, shape: 'circle', d: 2, n: 5, opts: [[5, 2], [2, 5], [5, 3]] },
    { gem: 2, shape: 'triangle', d: 3, n: 4, opts: [[3, 4], [4, 3], [4, 2]] },
    { gem: 5, shape: 'circle', d: 4, n: 7, opts: [[7, 3], [4, 7], [7, 4]] }
  ];
  let rid = 0;
  const ok = r => r === rid && r === window.__teachRun;

  const fullBody = src => `<div class="rigbox"><img src="${IMG + src}" alt=""><div class="rigLayer">${rigHTML(IMG + src, RIGS[src])}</div></div>`;
  /* ---------- layer ---------- */
  function build() {
    let T = $('teach');
    if (T) T.remove();
    T = document.createElement('div'); T.id = 'teach';
    T.innerHTML = `<img class="bg full" src="${IMG}backgrounds/game_bg.jpg" alt=""><div class="tDim"></div>
      <div class="tBoard chalk"><svg viewBox="0 0 1260 600" id="tSvg"></svg><div id="tHtml"></div></div>
      <div class="tChar left">${fullBody('characters/chiku_pickaxe.png')}</div><div class="tChar right">${fullBody('characters/bobo_full_shovel.png')}</div>
      <div id="tBubble" class="bubble" hidden><p></p></div>`;
    $('story').appendChild(T);
    T.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    return T;
  }
  async function line(r, who, text, fs = 40) {
    if (!ok(r)) return false;
    const b = $('tBubble'), side = who === 'Chiku' ? 'left' : 'right';
    b.className = 'bubble ' + side; b.querySelector('p').innerHTML = text; b.querySelector('p').style.fontSize = fs + 'px';
    b.hidden = false; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); SFX.pop();
    const c = document.querySelector(`#teach .tChar.${side}`); c.classList.remove('talking'); void c.offsetWidth; c.classList.add('talking');
    await speak(text.replace(/<[^>]+>/g, ''), who);
    return ok(r) && sleep(500).then(() => ok(r));
  }
  const el = (tag, attrs, parent = $('tSvg')) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
  const lab = (html, x, y, cls = '') => { const d = document.createElement('div'); d.className = 'ckLab ' + cls; d.innerHTML = html; d.style.left = x + 'px'; d.style.top = y + 'px'; $('tHtml').appendChild(d); return d; };
  const move = (g, x, y, s = 1, ms = 900) => { g.style.transition = `transform ${ms}ms cubic-bezier(.5,0,.3,1.25)`; g.style.transform = `translate(${x}px,${y}px) scale(${s})`; };

  /* ---------- 1–2: explanation ---------- */
  async function explain(r) {
    const R0 = 90, half = side => `M0 ${-R0} A${R0} ${R0} 0 0 ${side < 0 ? 0 : 1} 0 ${R0} Z`;
    const xs = [330, 630, 930], halves = [];
    xs.forEach(x => [-1, 1].forEach(side => {
      const g = el('g', {}); g.innerHTML = `<path d="${half(side)}" class="ck"/>`;
      g.style.transform = `translate(${x}px,230px)`; halves.push({ g, side });
    }));
    lab('3 stones', 630, 30, 'mid');
    if (!await line(r, 'Bobo', 'We can divide each whole into equal parts, and then share the parts equally.', 36)) return false;
    // chalk cut down the middle of each stone
    xs.forEach(x => { const l = el('line', { x1: x, y1: 230 - R0 - 12, x2: x, y2: 230 + R0 + 12, class: 'ckCut' }); });
    SFX.chalk(); if (!(await sleep(700).then(() => ok(r)))) return false;
    $('tSvg').querySelectorAll('.ckCut').forEach(e => e.remove());
    // share: left halves to Chiku, right halves to Bobo
    let ci = 0, bi = 0;
    halves.forEach(h => {
      if (h.side < 0) move(h.g, 140 + ci++ * 120, 470, .62);
      else move(h.g, 880 + bi++ * 120, 470, .62);
    });
    $('tHtml').innerHTML = ''; SFX.whoosh();
    lab('Chiku', 260, 545, 'small'); lab('Bobo', 1000, 545, 'small');
    if (!(await sleep(1000).then(() => ok(r)))) return false;
    // Chiku: how will I say how many pieces I have?
    const mine = halves.filter(h => h.side < 0);
    mine.forEach((h, i) => setTimeout(() => { h.g.classList.add('ckLit'); el('text', { x: 140 + i * 120, y: 400, class: 'ckNum' }).textContent = i + 1; SFX.coin(); }, i * 350));
    if (!await line(r, 'Chiku', 'But how will I say how many pieces I have?')) return false;
    // Bobo: total pieces / pieces one whole is cut into
    const big = lab(`<span class="tFrac"><i id="tTop">3</i><i id="tBot">2</i></span>`, 630, 70, 'big');
    const wh = el('g', {}); wh.innerHTML = `<circle r="58" class="ck"/><line x1="0" y1="-58" x2="0" y2="58" class="ck"/>`; wh.style.transform = 'translate(960px,215px)';
    lab('1 whole = 2 pieces', 960, 290, 'small nowrap');
    if (!await line(r, 'Bobo', 'You can say it as an improper fraction:<br><b>total number of pieces</b> over the <b>number of pieces that make one whole</b>.', 32)) return false;
    $('tTop').classList.add('ckGlow');
    el('path', { d: 'M575 135 Q430 250 270 385', class: 'ckArrow', style: 'stroke:#FFE38A' }); lab('total pieces', 360, 70, 'note yel nowrap');
    SFX.sparkle(); if (!(await sleep(1500).then(() => ok(r)))) return false;
    $('tTop').classList.remove('ckGlow'); $('tBot').classList.add('ckGlow');
    el('path', { d: 'M690 250 Q800 250 895 225', class: 'ckArrow', style: 'stroke:#9BE7FF' }); lab('pieces in one whole', 960, 70, 'note blu nowrap');
    SFX.sparkle(); if (!(await sleep(1500).then(() => ok(r)))) return false;
    $('tBot').classList.remove('ckGlow');
    if (!await line(r, 'Chiku', 'So I have 3/2! Okay, I get it now.')) return false;
    return line(r, 'Bobo', 'Let’s try a few!');
  }

  /* ---------- 3: picture questions ---------- */
  function wholeSVG(q) {
    const L = LEVELS[q.gem], pcs = pieces(q.shape, q.d);
    return `<svg viewBox="-6 -6 112 112">${pcs.map(pc => gemPoly(L, shrink(pc, .97))).join('')}${cutLines(q.shape, q.d).map(([a, b]) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`).join('')}</svg>`;
  }
  async function question(r, q, i) {
    $('tSvg').innerHTML = ''; $('tHtml').innerHTML = '';
    const L = LEVELS[q.gem], pc = pieces(q.shape, q.d)[0];
    const name = L.plural.toLowerCase();
    $('tHtml').innerHTML = `<div class="tq">
      <h3>How much ${L.gem} is here?</h3>
      <div class="tqRow">
        <div class="tqWhole">${wholeSVG(q)}<p>1 whole = <b>${q.d} pieces</b></p></div>
        <div class="tqPile">${Array.from({ length: q.n }, () => `<span>${pieceMini(L, pc)}</span>`).join('')}</div>
      </div>
      <div class="tqOpts">${q.opts.map(([a, b], k) => `<button class="tqOpt" data-k="${k}">${fr(a, b)}</button>`).join('')}</div>
      <p class="tqTip" id="tqTip"></p></div>`;
    $('tHtml').querySelectorAll('.tqPile span').forEach((s, k) => s.animate([{ transform: 'scale(0) rotate(-90deg)' }, { transform: 'none' }], { duration: 400, delay: k * 90, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'both' }));
    if (!await line(r, i ? 'Chiku' : 'Bobo', i ? 'Which fraction shows these pieces?' : 'Count the pieces, then choose the improper fraction!')) return false;
    let tries = 0;
    const rightK = q.opts.findIndex(([a, b]) => a === q.n && b === q.d);
    const opts = [...$('tHtml').querySelectorAll('.tqOpt')];
    idleHand();
    function idleHand() { clearTimeout(question.t); question.t = setTimeout(() => { if (ok(r)) { speak('Tap the right fraction.', 'Chiku'); handTapOn(opts[tries >= 2 ? rightK : 1]); } }, 9000); }
    return new Promise(done => {
      let busy = false;
      opts.forEach((b, k) => b.onclick = async () => {
        if (busy || !ok(r)) return; busy = true; clearTimeout(question.t); handHide(); SFX.tap();
        const [a, bb] = q.opts[k];
        if (k === rightK) {
          b.classList.add('right'); SFX.good(); confetti(22); $('tqTip').innerHTML = '';
          $('tHtml').querySelectorAll('.tqPile span').forEach((s, j) => setTimeout(() => s.classList.add('lit'), j * 80));
          const res = await line(r, 'Bobo', `Yes! ${q.n} pieces in all, and ${q.d} pieces make one whole. ${q.n}/${q.d}!`);
          return done(res);
        }
        tries++;
        // red glow + wiggle on the tapped card only (no 'Oops' badge on top of the board)
        SFX.bad(); b.classList.remove('fbRed'); void b.offsetWidth; b.classList.add('fbRed'); wig(b); setTimeout(() => b.classList.remove('fbRed'), 1600);
        if (tries === 1) { await line(r, 'Chiku', a === q.d && bb === q.n ? 'Careful, the top and bottom are swapped!' : 'Oops! Try again.'); }
        else {
          $('tqTip').innerHTML = `<span class="hintInline"><b class="bulb">💡</b><span class="fr hintFr"><i>total number of pieces</i><i>number of pieces that make 1 whole</i></span></span>`;
          opts[rightK].classList.add('pulse');
          const spans = [...$('tHtml').querySelectorAll('.tqPile span')];
          for (let j = 0; j < spans.length && ok(r); j++) { spans[j].classList.add('lit'); spans[j].dataset.n = j + 1; SFX.coin(); await sleep(260); }
          // the hint is shown once, on the board; Chiku only reads it aloud (no second bubble)
          $('tBubble').hidden = true; await speak('Total number of pieces, over the number of pieces that make one whole.', 'Chiku');
        }
        busy = false; idleHand();
      });
    });
  }

  /* ---------- run ---------- */
  window.teachImproper = async function (storyRun) {
    const r = ++rid; window.__teachRun = r;
    const stillStory = () => storyRun == null || storyRun === RUN;
    build();
    const alive = () => ok(r) && stillStory();
    let res = await explain(r) && alive();
    for (let i = 0; res && i < QUESTIONS.length; i++) res = await question(r, QUESTIONS[i], i) && alive();
    if (res) res = await line(r, 'Chiku', 'Now I can name my share. Let’s go!') && alive();
    clearTimeout(question.t); handHide();
    const T = $('teach'); if (T) T.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400 }).finished.then(() => T.remove(), () => T.remove());
    return res;
  };
})();
