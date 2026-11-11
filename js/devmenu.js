/* =====================================================================
   TEMPORARY DEV MENU — delete this file (and its <script> tag in
   index.html) when the game is finished. Nothing in game.js depends on it.

   Open the game with  index.html?dev=1  → a ☰ button appears top-left.
   Press the ` (backtick) key to open/close it too.
   Also kept here: index.html?ch=3 (start chamber 3) and the ?dbg=… previews.
   ===================================================================== */
(function () {
  'use strict';
  const q = new URLSearchParams(location.search);

  /* ---------------- shared helpers (use game.js globals) ---------------- */
  function resetAll() {
    RUN++; stopIdle(); hush(); storyTap = null;
    ['story', 'game', 'tunnel', 'lvl2'].forEach(id => $(id).hidden = true);
    $('torch').hidden = true; $('fade').hidden = true; $('fade').classList.remove('on');
    ['bubble', 'narration', 'btnSkip', 'titleCard'].forEach(id => $(id).hidden = true);
    $('storyBg').classList.remove('kenburns'); $('storyBg').style.transform = 'none';
    fb(null); closeBoard(); $('btnAgain').hidden = true;
    document.querySelectorAll('.fly,.hammerer,.confetti,.chip,.spark').forEach(e => e.remove());
  }
  function showGame() { $('game').hidden = false; }
  function showStory() { $('story').hidden = false; }
  /** load chamber i silently, with the stones in the given state */
  function setup(i, opt = {}) {
    resetAll(); showGame(); loadLevel(i, { silent: true });
    const n = opt.n || M();
    if (opt.cut || opt.split) { S.n = n; S.cutDone = S.cutDone.map(() => true); }
    if (opt.split) { S.split = S.split.map(() => true); S.rev = S.rev.map(() => n); }
    if (opt.dealt) { S.dealt = S.dealt.map(() => true); S.buckets = S.buckets.map(() => L().count); }
    if (opt.hint) S.hint = true;
    renderTrain(); renderWall();
  }

  /* ---------------- page list ---------------- */
  const STORY_ITEMS = [
    ['Title screen', () => { resetAll(); showStory(); setBg(STORY[0].bg); $('storyBg').classList.add('kenburns'); $('titleCard').hidden = false; }],
    ['Mine entrance + narrator', () => { resetAll(); showStory(); runStory(1); }],
    ...STORY.slice(1).map((s, k) => [`Scene ${k + 1}: “${s.text.length > 26 ? s.text.slice(0, 24) + '…' : s.text}”`,
      () => { resetAll(); showStory(); runStory(k + 1); }])
  ];
  const TRANSITIONS = [
    ['Promise! → cave ride → stones', () => { resetAll(); showStory(); runStory(2); }],
    ['Tunnel ride', async () => { resetAll(); await tunnelRide('Chamber 4 · Topazes', ['Chiku', 'Bobo', 'Golu', 'Mitthu']); }],
    ['Torch light → game', async () => {
      resetAll(); showStory(); await setBg(STORY[STORY.length - 1].bg);
      loadLevel(0, { silent: true }); const rid = RUN; await torchReveal(); if (rid === RUN) beginLevel(RUN);
    }]
  ];
  const STEPS = [
    ['Arrive (start)', i => { resetAll(); showGame(); loadLevel(i); }],
    ['Pick number', i => { setup(i); openCut(0); }],
    ['Pick number — hint (2nd wrong)', i => { setup(i, { hint: true }); openCut(0); }],
    ['Trace line', i => { setup(i); openCut(0); pickN(M(), keyEl(M())); }],
    ['Hammer', i => { setup(i, { cut: true }); allCut(); }],
    ['Share', i => { setup(i, { split: true }); allOpen(); }],
    ['Share — wrong (too many)', i => { const n = CUTS[LEVELS[i].shape].find(k => k > LEVELS[i].crew.length) || 6; setup(i, { split: true, n }); allOpen(); setTimeout(() => deal(0), 300); }],
    ['Share — wrong (too few)', i => { setup(i, { split: true, n: 2 }); if (M() <= 2) { fb('Not possible here: only 2 miners', 'bad', 2500); return allOpen(); } allOpen(); setTimeout(() => deal(0), 300); }],
    ['Name the fraction', i => { setup(i, { split: true, dealt: true }); openName(); }],
    ['Name — hint (2nd wrong)', i => { setup(i, { split: true, dealt: true }); openName(); S.nameTries = 1; S.val = { top: '1', bot: '9' }; checkName(); }],
    ['Ride on → next chamber', i => { setup(i, { split: true, dealt: true }); rideOn(RUN); }]
  ];

  /* ---------------- menu UI ---------------- */
  function buildMenu() {
    const css = document.createElement('style');
    css.textContent = `
#devBtn{position:fixed;left:12px;top:12px;z-index:100000;width:48px;height:48px;border-radius:12px;border:2px solid #F6B73C;background:rgba(30,16,8,.85);color:#FFE9B8;font-size:26px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.5)}
#devPanel{position:fixed;left:0;top:0;bottom:0;width:320px;z-index:99999;background:#1e120a;color:#FFE9B8;font:14px/1.3 system-ui,sans-serif;overflow-y:auto;padding:70px 10px 20px;box-shadow:6px 0 24px rgba(0,0,0,.6);transform:translateX(-105%);transition:transform .22s}
#devPanel.open{transform:none}
#devPanel h4{margin:14px 6px 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#F6B73C}
#devPanel details{margin:2px 0;border-radius:8px;background:#2b1a0e}
#devPanel summary{cursor:pointer;padding:8px 10px;font-weight:700}
#devPanel button.it{display:block;width:100%;text-align:left;padding:7px 12px;border:0;background:none;color:#FFE9B8;font:inherit;cursor:pointer;border-radius:6px}
#devPanel button.it:hover{background:#4a2e17}
#devPanel .row{display:flex;gap:6px;flex-wrap:wrap;padding:4px 6px}
#devPanel .row button{flex:1;padding:6px;border-radius:6px;border:1px solid #6b4a2e;background:#2b1a0e;color:#FFE9B8;cursor:pointer;font:inherit}
#devPanel .row button.on{background:#F6B73C;color:#2b1a0e;font-weight:700}
#devPanel .note{opacity:.6;font-size:12px;padding:8px 6px}
#devTag{position:fixed;right:10px;bottom:8px;z-index:100000;font:12px system-ui;color:#fff;background:rgba(200,40,30,.8);padding:2px 8px;border-radius:6px;pointer-events:none}`;
    document.head.appendChild(css);

    const btn = document.createElement('button'); btn.id = 'devBtn'; btn.textContent = '☰'; btn.title = 'Dev menu ( ` )';
    const panel = document.createElement('nav'); panel.id = 'devPanel'; panel.setAttribute('aria-label', 'Dev menu');
    const tag = document.createElement('div'); tag.id = 'devTag'; tag.textContent = 'DEV MODE';
    document.body.append(panel, btn, tag);

    const item = (label, fn) => { const b = document.createElement('button'); b.className = 'it'; b.textContent = label; b.onclick = () => { ac(); toggle(false); fn(); }; return b; };
    const head = t => { const h = document.createElement('h4'); h.textContent = t; panel.appendChild(h); };
    const group = (title, items, open) => {
      const d = document.createElement('details'); if (open) d.open = true;
      const s = document.createElement('summary'); s.textContent = title; d.appendChild(s);
      items.forEach(([l, f]) => d.appendChild(item(l, f))); panel.appendChild(d);
    };

    head('Story');
    group('Story screens', STORY_ITEMS, true);
    group('Transitions', TRANSITIONS);
    head('Chambers');
    LEVELS.forEach((Lv, i) => group(`${Lv.title} · ${Lv.plural} (${Lv.count} ÷ ${Lv.crew.length})`, STEPS.map(([l, f]) => [l, () => f(i)])));
    head('Level 2 · Mixed numbers');
    group('Level 2', [
      ['Start (with ride-in intro)', () => { resetAll(); L2.start(); }],
      ...[0, 1, 2, 3, 4, 5].map(i => [`Round ${i + 1} — uncover`, () => { resetAll(); L2.round(i); }]),
      ['Round 1 — write the fraction', () => { resetAll(); L2.write(0); }],
      ['Round 4 — write the fraction', () => { resetAll(); L2.write(3); }],
      ['Level 2 finale', () => { resetAll(); L2.finale(); }]
    ]);
    head('End');
    group('Finale', [['Sacks full! (finale)', () => { setup(6); finale(); }]], true);

    head('Tools');
    const row = (btns) => { const r = document.createElement('div'); r.className = 'row'; btns.forEach(b => r.appendChild(b)); panel.appendChild(r); return r; };
    const mk = (t, fn) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => fn(b); return b; };
    const speeds = [['1×', 1], ['2×', .5], ['4×', .25]].map(([t, v]) => mk(t, b => { SPEED = v; speeds.forEach(x => x.classList.toggle('on', x === b)); }));
    speeds[0].classList.add('on'); row(speeds);
    row([mk(muted ? 'Sound: off' : 'Sound: on', b => { $('btnMute').click(); b.textContent = muted ? 'Sound: off' : 'Sound: on'; }),
      mk('Restart game', () => { location.href = location.pathname + '?dev=1'; })]);
    row([mk('Auto-play ▶ chamber…', () => { const c = prompt('Auto-play from chamber (1–7):', '1'); if (c) location.href = `${location.pathname}?dev=1&dbg=auto&i=${Math.max(0, Math.min(6, +c - 1))}`; })]);
    const note = document.createElement('p'); note.className = 'note';
    note.textContent = 'Temporary: delete js/devmenu.js and its <script> tag in index.html when the game is done. Key ` toggles this menu.';
    panel.appendChild(note);

    let isOpen = false;
    function toggle(v) { isOpen = v === undefined ? !isOpen : v; panel.classList.toggle('open', isOpen); btn.textContent = isOpen ? '✕' : '☰'; }
    btn.onclick = () => toggle();
    addEventListener('keydown', e => { if (e.key === '`') toggle(); if (e.key === 'Escape') toggle(false); });
  }
  if (q.get('dev') === '1') buildMenu();

  /* ---------------- URL shortcuts (moved from game.js) ----------------
     ?ch=1..7 jumps straight to a chamber
     ?dbg=scene3|game|mark|hint|deal|name|finale|tunnel|torch|auto (+ &i= chamber index, &n=, &h=1) */
  const ch = +q.get('ch'), d = q.get('dbg');
  if (ch >= 1 && ch <= 7) { $('story').hidden = true; $('game').hidden = false; loadLevel(ch - 1); }
  if (!d) return;
  muted = true;
  const goGame = i => { $('story').hidden = true; $('game').hidden = false; loadLevel(i, { silent: true }); };
  if (d.startsWith('scene')) { const s = STORY[+d.slice(5)]; $('titleCard').hidden = true; $('storyBg').classList.remove('kenburns'); setBg(s.bg); if (s.text) showBubble(s); }
  if (d === 'game') goGame(+(q.get('i') || 0));
  if (d === 'mark') { goGame(+(q.get('i') || 0)); openCut(0); if (q.get('n')) pickN(+q.get('n')); }
  if (d === 'hint') { goGame(0); openCut(0); pickN(3, keyEl(3)); pickN(4, keyEl(4)); }
  if (d === 'deal') { const i = +(q.get('i') || 0); goGame(i); S.n = +(q.get('n') || L().crew.length); S.split = S.split.map(() => true); S.phase = 'deal'; S.dealt[0] = true; S.buckets = S.buckets.map((_, k) => k < S.n ? 1 : 0); renderTrain(); renderWall(); }
  if (d === 'name') { const i = +(q.get('i') || 0); goGame(i); S.n = M(); S.buckets = S.buckets.map(() => L().count); renderTrain(); openName(); if (q.get('h')) { S.nameTries = 1; S.val = { top: '1', bot: '1' }; checkName(); } }
  if (d === 'finale') { goGame(6); finale(); }
  if (d === 'tunnel') { tunnelRide('Chamber 2 · Emeralds'); }
  if (d === 'torch') { setBg('story_06_bobo_help.jpg'); $('titleCard').hidden = true; loadLevel(0, { silent: true }); $('story').hidden = false; $('game').hidden = true; torchReveal(); }
  if (d === 'auto') {
    SPEED = .3;
    const log = document.createElement('pre'); log.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;background:rgba(255,255,255,.92);font:14px monospace;margin:0;max-height:100vh;overflow:hidden;max-width:50vw;pointer-events:none';
    document.body.appendChild(log); const W = t => { log.textContent += t + '\n'; };
    addEventListener('error', e => W('ERROR ' + e.message + ' @' + e.lineno));
    $('story').hidden = true; $('titleCard').hidden = true; $('game').hidden = false; loadLevel(+(q.get('i') || 0));
    let last = '', wrongShare = false, wrongName = 0, wrongKey = 0;
    setInterval(() => {
      const st = `L${S.li} ${S.phase} busy=${S.busy} board=${S.boardOpen} n=${S.n}`; if (st !== last) { W(st + ' | ' + $('voLine').textContent.slice(0, 60)); last = st; }
      if (S.busy) return;
      if (S.phase === 'cut' && !S.boardOpen) return onGem(0);
      if (S.boardOpen && $('keys') && !S.n) { if (S.li === 0 && wrongKey < 2) { wrongKey++; return pickN(3, keyEl(3)); } const k = (S.li === 1 && !wrongShare) ? 3 : M(); return pickN(k, keyEl(k)); }
      if (S.boardOpen && $('big') && S.n) { const i = S.traced.findIndex(t => t < 1); if (i >= 0) { S.traced[i] = 1; drawBig(); afterLine(); } return; }
      if (S.phase === 'hammer') { const g = firstGem(x => !S.split[x]); if (g) g.click(); return; }
      if (S.phase === 'deal') { const g = firstGem(x => S.split[x] && !S.dealt[x]); if (g) g.click(); return; }
      if (S.phase === 'fail' && !$('btnAgain').hidden) { wrongShare = true; W('fail msg: ' + $('fb').textContent); return $('btnAgain').click(); }
      if (S.phase === 'name' && $('bxtop')) {
        if (wrongName < 2) { wrongName++; S.val = { top: '1', bot: '9' }; return checkName(); }
        S.val = { top: String(S.buckets[S.whoK]), bot: String(S.n) }; return checkName();
      }
    }, 400);
  }
})();
