# Chiku & Bobo's Gem Hunt — LBD 1 · Improper Fractions (Grade 6)

Open `index.html` in Chrome / Edge / Safari (double-click works — no server needed).
The game is a fixed 1920×1080 stage that scales to any screen (laptop, tablet, smartboard).

## Flow
1. **Title** (mine entrance) → **Play**
2. **Story** (Figma frames) plays by itself, no taps and no black screens, with smooth zoom/crossfade transitions:
   Chiku "Whatever gems we find…" → Bobo "Promise!" → "3 covered stones!" → "One for you and one for me…" →
   "How do we share 3 stones equally?" → Bobo "By forming improper fractions!" → "Can you help us?"
   Characters blink, and their mouths move with each spoken line (story scenes, instruction-bar avatar, trolley seats).
3. **Torch-light transition** — Bobo's head-torch switches on, the beam sweeps to the stones, then opens up into the game.
4. **7 chambers** exactly as in the design sheet (tap → pick number → trace → auto-cut → hammer → share → name the fraction → ride on).
   Every wrong attempt follows the sheet: 1st = "Oops! Try again." + red glow/wiggle, 2nd = hint (glowing numbered buckets,
   pulsing key, hand-pointer trace, arrows + counting aloud). Inactivity repeats the instruction VO and shows the hand pointer.
5. **Finale** — all 7 shares (3/2, 5/2, 4/3, 7/4, 5/3, 7/5, 9/4).

Voice-over uses the browser's speech voice (different pitch per character); sound effects are synthesized. 🔊 button mutes.
The chamber dropdown (top right) lets a teacher jump to any chamber. `index.html?ch=3` also opens chamber 3 directly.

## Files
- `index.html`, `css/style.css`, `js/game.js` — the game
- `assets/images/backgrounds/` — story scenes + chamber background (from Figma)
- `assets/images/characters/` — Chiku, Bobo (transparent cut-outs)
- `assets/images/props/` — stone, glowing stone, bucket, trolley
- `assets/images/ui/` — board panel, speech bubbles, wood plank button, VO bar
- `assets/images/reference/` — game-screen mock-up from Figma (not used in-game)
- `assets/audio/vos`, `assets/audio/sfxs` — empty, ready for recorded audio

Golu, Mitthu and Tinku and the gems are drawn in code (no Figma art for them yet).

## Temporary dev menu (for testing)
Open `index.html?dev=1` → a ☰ button appears top-left (or press the ` key).
It jumps straight to any page: title, each story scene, tunnel / torch transitions, and for every chamber:
arrive, pick number, pick-number hint, trace, hammer, share, wrong share (too many / too few), name it, name hint, ride on — plus the finale.
Tools: speed 1×/2×/4×, sound on/off, restart, auto-play from a chamber.

**To remove before release:** delete `js/devmenu.js` and the `<script src="js/devmenu.js">` line in `index.html`. Nothing else depends on it.
