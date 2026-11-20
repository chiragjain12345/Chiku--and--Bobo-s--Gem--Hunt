# CONTEXT — Chiku and Bobo's Gem Hunt

Hand-off notes for a new working session. Read this first, then `README.md` (older, partly outdated) and the code.

## What it is
A Grade 6 maths game in plain HTML/CSS/JS (no build step, no framework).
- **Level 1:** improper fractions. Gems are shared equally between miners and each share is written as an improper fraction.
- **Level 2:** mixed fractions. Chiku uncovers whole gems plus extra parts, and the child records them as a mixed fraction.

**Characters:**
- Chiku (squirrel, pickaxe) and Bobo (rabbit, shovel) appear throughout.
- Golu, Mitthu and Tinku are extra miners who join some Level 1 chambers.

**Source material:**
- **Design sheets (Google Sheets):**
  - Original (public, Level 1, 7 chambers): https://docs.google.com/spreadsheets/d/1smaSk7UH848M-cSV6739mtd-3MWAe2Drq07zKhZx5h4
  - Newer (private, read through the Google Drive connector): https://docs.google.com/spreadsheets/d/1S78wx5TST7OWWZBmfd4bkvXVxUGxckLBhCCDsRkiVZM
    - Tabs: `Context_Draft 2`, `Level 1_Draft 2`, `Level 2_Draft 2`.
    - Incorrect-feedback columns G–J: 1st attempt = "Oops! Try again." + red glow/wiggle; 2nd attempt = hint + hint animation.
- **Art (Figma):** https://www.figma.com/design/pa2CRguEhI83xtoEHDKOBa. Exported art is in `assets/images/`.

## Run and test
- Open `index.html`, or serve the folder (the user runs VS Code Live Server at `http://127.0.0.1:5500`).
- **Temporary dev menu: `?dev=1`.**
  - A ☰ button appears top-left, or press the backtick key.
  - It jumps to any scene or chamber, sets speed, and starts auto-play.
  - It lives in `js/devmenu.js` and its `<script>` line in `index.html`; delete both before release.
- **Other URL switches:**
  - `?ch=N` opens Level 1 at chamber N.
  - `?lvl=2` opens Level 2 directly, without its story.
  - `?dev=1&dbg=auto&i=N` auto-plays from chamber index N, deliberately making wrong answers too.
  - `?dev=1&dbg=name&i=N` opens the "name it" board.
  - Other `dbg=` values: `scene3`, `game`, `mark`, `hint`, `deal`, `finale`, `tunnel`, `torch`.
- **Useful console calls:**
  - `L2.round(i)`, `L2.write(i)`, `L2.finale()`
  - `L2.story(['ctx','learn','list'])`
  - `teachImproper()`
  - `tunnelRide('caption', ['Chiku'])`
- **Speed knob:** the `SPEED` global (lower = faster sleeps). For fast tests, stub the voice with `speak = () => sleep(100)`.
- **Headless screenshots:** use Chrome with `--remote-debugging-port`. The earlier sessions used a small CDP script (`cdp.py URL seconds out.png [js]`) kept in the session scratchpad; recreate it if needed.
- **Caching:** the user's browser caches hard.
  - `index.html` has no-cache meta tags and `?v=<timestamp>` on every CSS/JS include.
  - **Bump the version after every change:** `v=$(date +%s); sed -i '' -E "s/\?v=[0-9]+/?v=$v/g" index.html`
  - If the user reports something already fixed, tell them to hard-reload with Cmd+Shift+R.

## Files
| File | Role |
|---|---|
| `index.html` | Single 1920×1080 stage containing the sections `#story`, `#game` (Level 1), `#lvl2`, `#tunnel`, `#torch`. Script order: `game.js`, `teach_improper.js`, `level2.js`, `level2_story.js`, `devmenu.js`. |
| `js/game.js` | Shared engine plus the story and Level 1. Contains the stage scaling (`fit()`), voice (`speak`, `say`), sound effects (`SFX.*`), character rigs (`RIGS`: blink and lip-sync), gem geometry (`pieces`, `cutLines`, `gemPoly`, `pieceMini`), feedback helpers (`oops`, `hintCard`, `hideHint`), the hand pointer and idle prompts (`handTapOn`, `idle`), `tunnelRide`, `torchReveal`, and the `STORY` list. |
| `js/teach_improper.js` | `window.teachImproper()` teaching interlude. It explains what an improper fraction is on a chalkboard, then asks 3 picture multiple-choice questions (5/2, 4/3, 7/4). |
| `js/level2.js` | Level 2 gameplay (`ROUNDS`, the `S2` state object). Exposes `window.L2`. |
| `js/level2_story.js` | Level 2 story scenes. It wraps `L2.start` so that the story plays first and then the game starts. |
| `css/style.css`, `css/level2.css` | All styling. Many tweak blocks are appended at the end of each file; later rules (often `!important`) win. |
| `assets/images/props/tray.svg` | Miner tray. It uses `preserveAspectRatio="none"` so it stretches to its box. |

## Full flow
1. **Cover screen.** The Play button is at the bottom right.
2. **Story, which plays by itself (no taps):**
   1. Narrator outside the mine.
   2. Chiku's promise, then Bobo's promise.
   3. Cave ride by cart.
   4. "3 covered stones!", with one golden ring animation around the stones.
   5. Bobo: "By forming improper fractions!"
3. **Teaching interlude** (`teachImproper`).
4. **Bobo pointing: "Can you help us?"**, then the torch-light reveal into the game.
5. **Level 1: 7 chambers.** The `LEVELS` array in `game.js` holds the gem, shape, crew and who does what in each chamber.
   1. Tap a stone. A board opens: pick how many pieces to cut it into.
      - Miner faces preview each piece, and extra pieces show a red "?".
      - Wrong pick: 1st = an explanation (someone gets nothing, or pieces are left over); 2nd = hint (numbered, glowing miner faces on the board, the right key pulses); 3rd = the right number is locked in and the other keys grey out.
   2. Trace the dotted guide lines (yellow end dots). A stroke only counts if it stays close to one dotted line along most of it; it then snaps to that clean line. Off-line strokes: 1st = Oops, 2nd = the hand shows the trace, 3rd = the line is drawn for the child.
   3. Chiku's cutter cuts the other stones the same way.
   4. Hammer: a gloved hand with a hammer knocks off one part at a time.
   5. Share: tap a stone to deal its pieces into the miners' trays on the trolley.
   6. Name it: the miner holds up their tray and the child writes the fraction.
      - 2nd wrong answer shows the hint: a word fraction "Total number of pieces / Total number of pieces a whole is divided into", with a 💡, arrows from the tray pieces and from the cut gem, and the pieces counted aloud.
   7. Ride on: the trolley leaves to the right, `tunnelRide` plays, and the trolley rolls in **once** and stays where it stops.
6. **After chamber 7:** no summary board. The game goes straight into the Level 2 story (`L2.start()`).
7. **Level 2 story** (`level2_story.js`, has a Skip button):
   1. Chiku and Bobo walk out of the mine with full sacks.
   2. Picnic mat: 5 emerald halves join into 2 wholes and 1 half, with a live tally board.
   3. Chalkboard lesson: 5/2 = 2½ and the definition of a mixed fraction. The speaking character bounces and the bubble points at them.
   4. Gem list scene.
8. **Level 2: 7 practices.** `ROUNDS`: 2½ emeralds, 1⅓ sapphires, 3½ rubies, 2¾ topaz, 1⅔ amethysts, 2⅖ aquamarines, 3¼ jade.
   1. Chiku auto-digs: whole gems first, then the extra parts.
   2. The child writes □ □/□ with the number bar (Next / OK).
   3. Wrong answer: 1st = Oops; 2nd = hint and counting aloud; 3rd = the answer flashes and then clears; 4th = the answer is pre-filled, every key is locked except OK.
   4. Correct answer: Bobo explains it and the Gem record card (top left) ticks the row.
   5. Bobo (the collector) walks to each stone, the gems hop into his sack with a counter, the collected parts vanish, and fully emptied stones disappear completely (no outline).
   6. Bobo tips the sack into the cart, and the gems heap inside the cart.
   7. `tunnelRide('Practice N · Gem')` plays, then the next practice starts.
   8. After practice 7: the "Cart full of gems!" board.

## UX rules the user has asked for (keep them)
- **Instruction panel:**
  - Level 1 shows instructions and feedback only in the top instruction panel. `fb()` is a no-op: no centre pill, no second copy of any text.
  - The panel sizes itself to its text: the left edge (avatar) stays fixed at x=330, and the right edge animates wider or narrower (620–1300px; MutationObserver at the end of `game.js`). It is drawn in CSS, not a stretched image.
  - Speaker names are never shown in dialogue boxes. The avatar face shows who is talking.
- **Hints:**
  - Show the 💡 only, never the word "Hint".
  - Show the hint text once, not in both the dialogue and a box.
  - Feedback loops must end: lock in the answer after the 3rd/4th attempt.
- **Layout:**
  - Nothing may overlap: characters, boards, text, the frame's lantern and pickaxes, the Gem record card.
  - Level 1 boards are always the same size and position (`#board` is 1560×720).
  - Gem pieces sit **inside** trays and carts, never on the rims.
- **Speech bubbles:** they sit above the speaker's head, and the tail points at the speaker (`#cxBubble.flip` for a right-side speaker).
- **Story characters:**
  - Show the full body when visible.
  - Look at what is being talked about (eye-look overlay `look()` in `level2_story.js`).
  - Blink and lip-sync where a rig exists.
- **Level 2:**
  - Voice and plank only (no character speech bubbles), and no DONE button.
  - No "Uncovered" counter (`#l2Count` stays hidden and empty).
  - Only one plank: the sign painted into `level2_bg.jpg` is covered by `#l2BgPatch`.
- **Navigation buttons:** round orange Back (◀) and Pause buttons at the left edge in Level 1 (`#g1Back`, `#g1Pause`) and Level 2 (`#l2Back`, `#l2Pause`). Back goes to the previous chamber or practice (Chamber 1 → cover; Practice 1 → Level 2 story). Pause freezes animations and speech; Resume repeats the current instruction.
- **Feedback timing:** give feedback at the moment of the mistake, not at the end.
- **Language:** the user writes in Hinglish; reply in plain English (Hinglish is fine if they prefer).

## Known loose ends
- **Unused code paths:** these still exist but are not used.
  - Level 1: `poseHammer`, `bigHammer`.
  - Level 2: tap-to-uncover (`doPart`, `onDone`, ghosts) and `rideSilhouetteOld`.
- **Before release:** remove the dev menu (`devmenu.js` and its `<script>` line).
- **Audio:** the voice is the browser's Web Speech API. The `assets/audio/` folders are empty, ready for recorded voice-over.
- **Git:** the repo is the user's new repo. There is one commit ("first commit"), and everything since is uncommitted. Commit or push only when asked.
