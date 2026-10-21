# 🐾 Mochi – Virtual Desktop Pet

A Tamagotchi-style virtual pet built with plain **HTML + CSS + JavaScript**. No frameworks, no build step, no server needed.
Adopt a pet, feed it, play with it, bathe it, put it to sleep, and shrink it into a small draggable pet. Your pet is saved in the browser.

## 1. Run it
- **Easiest:** double-click `index.html`.
- **Local server (optional):** run `python3 -m http.server 8000` in this folder and open http://localhost:8000
- Works in current Chrome, Edge, Firefox and Safari, on desktop and mobile.

## 2. Folder structure
```
mochi-desktop-pet/
├── index.html        Page markup: all 5 screens + minimized pet
├── css/style.css     All styling (colors are CSS variables at the top)
├── js/pets.js        Pet definitions (TY) + SVG drawing function svg()
├── js/app.js         Game logic: stats, food, pantry, mini-game, sleep, saving
└── README.md         This file
```
Load order matters: `pets.js` first (defines `$`, `TY`, `svg`), then `app.js`.

## 3. Screens
| # | Screen | How you get there |
|---|--------|-------------------|
| 1 | Adoption | First launch, or after ✕ (reset). Pick name + pet (Cat, Dog, Rabbit, Elephant) → ADOPT |
| 2 | Pet room | Main screen: header (name, level, coins), side buttons, speech bubble, 5 stat bars |
| 3 | Food menu | **Feed** button. Tabs: 🛒 Shop and 🎒 Pantry |
| 4 | Catch the Ball | **Play** button |
| 5 | Sleep | **Sleep** button |
| 6 | Minimized pet | **▾** in the title bar. Drag it anywhere in the page; click it to reopen |

**Bath** has no screen: it plays a bubble animation in the room.

## 4. Game rules (all numbers come from `js/app.js`)
**Starting values:** Hunger 72, Energy 51, Happiness 83, Cleanliness 64, Health 91, Coins 1,250, Level 5.

**Time:** every 3 seconds one "tick" happens.
| Stat | Change per tick (awake) |
|------|-------------------------|
| Hunger | −0.9 (Dog ×1.3, Elephant ×1.5) |
| Energy | −0.5 (Rabbit ×1.6) |
| Cleanliness | −0.5 |
| Happiness | −0.4 |
| Health | +0.3 normally; −0.8 for each of Hunger / Cleanliness / Happiness below 25 |

While **sleeping**, only Energy changes (+5 per tick) and the other stats pause. Stats are capped 0–100. Ticks pause during the mini-game.

**Food** (buy in Shop → stored in Pantry → eat any time with *Feed*):
| Food | Cost | Hunger | Happiness | Health |
|------|-----:|-------:|----------:|-------:|
| 🍎 Apple | 20 | +10 | – | +2 |
| 🍗 Chicken | 30 | +20 | – | +5 |
| 🍕 Pizza | 50 | +25 | +10 | −3 |
| 🍰 Cake | 50 | +15 | +20 | −5 |
| 🥕 Carrot | 25 | +12 (Rabbit ×1.5) | – | +3 |
A pet at 100% hunger refuses food (so nothing is wasted).

**Mini-game:** 30 seconds, needs Energy ≥ 10. Move mouse / drag finger / ← → keys. Catch the ball with the pet.
Rewards: coins `score × 10`, Happiness `+score × 2 + 5`, XP `score × 3`, Energy −15. The ball speeds up with each catch.

**Bath:** Cleanliness +40, XP +5. **Feeding:** XP +8.
**Levels:** you need `level × 50` XP to level up (XP resets, level +1).

**Speech bubble priority:** hungry (<40) → sleepy (energy <30) → needs bath (<35) → wants play (happiness <40) → happy message.
**Expression:** sleeping, sad (any of hunger/energy/clean <35), happy (happiness >75), idle.

## 5. Saving
Progress is stored in `localStorage` under the key `mochi` (name, type, stats, coins, XP, level, pantry `inv`).
Saved on every tick and action. Clear it by pressing ✕ (confirm), or in browser dev tools → Application → Local Storage.

## 6. Customizing
- **Colors:** edit the CSS variables at the top of `css/style.css` (`--bg`, `--win`, `--bar`, `--ac`, `--tx`).
- **Add a pet:** in `js/pets.js` add an entry to `TY` (`b` body color, `p` accent color, `n` label), then add an ears/tail/nose branch in `svg()`. The adoption tile appears automatically.
- **Pet-specific behaviour:** edit `tick()` in `js/app.js` (the multipliers `d` and `r`).
- **Add food:** append to `FOODS` in `js/app.js`: `['🍩','Donut',40,{h:12,ha:15,he:-2}]` (keys: `h` hunger, `ha` happiness, `he` health).
- **Balance:** change decay numbers in `tick()`, the 3000 ms interval at the bottom of `app.js`, or the game length (`t:30`) in `startGame()`.
- **Use your own artwork:** replace the `svg()` output with `<img>` tags, e.g. one PNG per state (`idle`, `happy`, `sleep`, `eat`, `play`, `walk`). `render()` in `app.js` is the one place that sets the pet image from `moodOf()`.

## 7. Known limitations
- The minimized pet floats **inside the browser page**, not over your real desktop. A browser can't draw outside its window.
- Time only passes while the page is open (no offline hunger).
- Pets are vector drawings, not the mockup's pixel-art sprites.

## 8. Next steps / ideas
- **Real desktop pet (Electron):** wrap `index.html` in a transparent, frameless, always-on-top `BrowserWindow` for the minimized mode (`transparent:true, frame:false, alwaysOnTop:true`).
- Offline progress (store a timestamp and apply missed ticks on load), more pets (fox, panda, dragon), sounds, achievements, daily rewards, more mini-games, per-state animations.
