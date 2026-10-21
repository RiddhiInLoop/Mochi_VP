// ============================================================
// app.js — Main Application Logic
// Handles: pet stats, saving/loading, food shop, mini-game,
//          sleep, bubbles, mini/desktop-pet mode, drag, Electron
// ============================================================


// ============================================================
// SECTION 1 — ELECTRON BRIDGE
// window.electronAPI is exposed by preload.js only when
// the app runs inside Electron (not a normal browser).
// If it exists, we add the 'electron' class to body so
// CSS can apply desktop-specific styles (transparent bg, drag).
// ============================================================
const E = window.electronAPI;
if (E) document.body.classList.add('electron');


// ============================================================
// SECTION 2 — DATA CONSTANTS
// ============================================================

// FOODS array — each entry is: [emoji, name, price, {stat effects}]
// h=hunger, ha=happiness, he=health (negative he = junk food)
const FOODS = [
  ['🍎', 'Apple',   20, { h: 10, he:  2 }],
  ['🍗', 'Chicken', 30, { h: 20, he:  5 }],
  ['🍕', 'Pizza',   50, { h: 25, ha: 10, he: -3 }],
  ['🍰', 'Cake',    50, { h: 15, ha: 20, he: -5 }],
  ['🥕', 'Carrot',  25, { h: 12, he:  3 }],
];

// LAB — human-readable labels for each stat key (used in food UI)
const LAB = { h: 'Hunger', e: 'Energy', ha: 'Happiness', he: 'Health' };

// ST — stat bar definitions: [key, emoji, label, bar color]
// Used by render() to build the stats panel
const ST = [
  ['hunger', '🍗', 'Hunger',      '#f4a23c'],
  ['energy', '⚡', 'Energy',      '#4fb0ee'],
  ['happy',  '❤️', 'Happiness',   '#ee5470'],
  ['clean',  '🧼', 'Cleanliness', '#5fbf62'],
  ['health', '💜', 'Health',      '#a24fd0'],
];


// ============================================================
// SECTION 3 — GLOBAL STATE
// S  = the pet's save object (null if no pet adopted yet)
// sel = the currently selected pet type on the adopt screen
// sleeping = whether the pet is currently sleeping
// ============================================================
let S = null, sel = 'cat', mode = 'room', sleeping = false;

// cl() = "clamp" — keeps a value between 0 and 100
// Used everywhere stats are changed to prevent going below 0 or above 100
const cl = v => Math.max(0, Math.min(100, v));


// ============================================================
// SECTION 4 — SAVE / LOAD (localStorage)
// The pet's entire state is stored as JSON in localStorage
// under the key 'mochi'. This persists between app restarts.
// ============================================================

function load() {
  try { S = JSON.parse(localStorage.getItem('mochi')); }
  catch (e) { S = null; }
}

function save() {
  try { localStorage.setItem('mochi', JSON.stringify(S)); }
  catch (e) {}
}


// ============================================================
// SECTION 5 — SCREEN NAVIGATION
// show(id) hides all .scr screens then shows the one with
// the given id by adding the 'on' class.
// It also toggles the 'adopting' class on body for the
// full-page adoption screen styling.
// ============================================================
function show(id) {
  document.querySelectorAll('.scr').forEach(s => s.classList.remove('on'));
  $(id).classList.add('on');
  document.body.classList.toggle('adopting', id == 'adopt');
}


// ============================================================
// SECTION 6 — TOAST NOTIFICATION
// Shows a temporary pop-up message at the bottom of the screen.
// It fades out automatically after 1.8 seconds.
// clearTimeout prevents overlapping timers if toasts fire fast.
// ============================================================
function toast(m) {
  const t = $('toast');
  t.textContent = m;
  t.style.opacity = 1;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.style.opacity = 0, 1800);
}


// ============================================================
// SECTION 7 — MOOD & MESSAGE HELPERS
//
// moodOf() — determines which SVG pose to show
//   If sleeping → 'sleep' pose
//   If hunger/energy/clean below 35 → 'sad' pose
//   If happiness above 75 → 'happy' pose
//   Otherwise → 'idle' pose
//
// msg() — picks the pet's speech bubble message
//   Priority: hunger > energy > cleanliness > happiness > happy
// ============================================================
function moodOf() {
  if (sleeping) return 'sleep';
  return Math.min(S.hunger, S.energy, S.clean) < 35 ? 'sad'
       : S.happy > 75 ? 'happy'
       : 'idle';
}

function msg() {
  if (S.hunger < 40) return "I'm hungry!";
  if (S.energy < 30) return "I'm sleepy...";
  if (S.clean  < 35) return "I need a bath!";
  if (S.happy  < 40) return "Play with me!";
  return S.happy > 75 ? "I love you! ♥" : "Hello!";
}


// ============================================================
// SECTION 8 — XP & LEVELLING
// addXp(n) adds XP to the pet.
// When XP crosses the threshold (level × 50), the pet levels up.
// The while loop handles multiple level-ups in one go.
// ============================================================
function addXp(n) {
  S.xp += n;
  while (S.xp >= S.lvl * 50) {
    S.xp  -= S.lvl * 50;
    S.lvl++;
    toast('⭐ Level up! Lv. ' + S.lvl);
  }
}


// ============================================================
// SECTION 9 — RENDER
// Updates all visible UI elements to reflect the current state S.
// Called after every state change (feeding, ticking, etc.)
//
// It:
//   - Updates the name, level, coin count in the header
//   - Rebuilds the stats bar panel using the ST array
//   - Re-draws the pet SVG in the correct mood
//   - Updates both speech bubbles (room + mini mode)
// ============================================================
function render() {
  if (!S) return;

  // Update header bar
  $('hn').textContent = S.name;
  $('lv').textContent = 'Lv. ' + S.lvl;
  $('co').textContent = '🪙 ' + S.coins.toLocaleString();

  // Rebuild stat bars — each bar's width% and color come from S
  $('stats').innerHTML = ST.map(([k, i, n, c]) =>
    `<div class="st">
       <em>${i}</em>
       <u>${n}</u>
       <div class="tr"><i style="width:${S[k]}%; background:${c}"></i></div>
       <s>${Math.round(S[k])}%</s>
     </div>`
  ).join('');

  // Update pet SVGs (main room + mini mode)
  const m = moodOf();
  $('pet').innerHTML = svg(S.type, m);
  $('mp').innerHTML  = svg(S.type, m);

  // Update speech bubbles
  $('say').textContent = msg();
  $('mb').textContent  = msg();

  // Hide speech bubble while sleeping (pet has closed eyes)
  $('say').style.display = sleeping ? 'none' : '';
}


// ============================================================
// SECTION 10 — TICK (runs every 3 seconds)
// The main game loop that drains/restores stats over time.
//
// If sleeping:
//   → Energy refills by +5 each tick
//   → When full, shows the "Good morning" wake-up message
//
// If awake:
//   → All stats slowly drain (speed varies by pet type)
//   → If multiple stats are critically low, health also drops
//   → Otherwise health slowly recovers
//
// Paused while the mini-game screen is active.
// ============================================================
function tick() {
  if (!S || $('game').classList.contains('on')) return;

  if (sleeping) {
    // Sleeping: recover energy
    S.energy = cl(S.energy + 5);
    $('sb').style.width = S.energy + '%';
    if (S.energy >= 100) {
      $('wt').textContent = S.name + ' is fully rested! ♥';
    }
  } else {
    // Awake: drain stats (pet type modifiers change the speed)
    const d = S.type == 'dog' ? 1.3 : S.type == 'elephant' ? 1.5 : 1; // hunger drain multiplier
    const r = S.type == 'rabbit' ? 1.6 : 1; // energy drain multiplier

    S.hunger = cl(S.hunger - 0.9 * d);
    S.energy = cl(S.energy - 0.5 * r);
    S.clean  = cl(S.clean  - 0.5);
    S.happy  = cl(S.happy  - 0.4);

    // Count how many stats are critically low (below 25)
    const low = [S.hunger, S.clean, S.happy].filter(v => v < 25).length;
    // Health drops if stats are low, slowly recovers if all is well
    S.health = cl(S.health + (low ? -0.8 * low : 0.3));
  }

  save();
  render();
}


// ============================================================
// SECTION 11 — WANDER
// Every 4 seconds, randomly moves the pet around the room.
// Only runs on the room screen and when not sleeping.
// CSS transition on #pet smoothly animates the position change.
// ============================================================
function wander() {
  if (!S || sleeping || !$('room').classList.contains('on')) return;
  const p = $('pet');
  p.style.left = (35 + Math.random() * 30) + '%';
  p.style.top  = (40 + Math.random() * 12) + '%';
}


// ============================================================
// SECTION 12 — ADOPT SCREEN SETUP
// Fills the pet picker with one card per pet type (from TY).
// pick(t) highlights the selected pet and updates the preview.
// ============================================================
$('pick').innerHTML = Object.keys(TY).map(k =>
  `<div data-t="${k}">${svg(k)}${TY[k].n}</div>`
).join('');

function pick(t) {
  sel = t;
  // Toggle the 'sel' highlight class on the correct card
  document.querySelectorAll('#pick div').forEach(d =>
    d.classList.toggle('sel', d.dataset.t == t)
  );
  $('prev').innerHTML = svg(t, 'happy'); // Show preview of selected pet
}

// Click delegation — find the nearest [data-t] ancestor of what was clicked
$('pick').onclick = e => {
  const d = e.target.closest('[data-t]');
  if (d) pick(d.dataset.t);
};

// ADOPT button click — creates the pet state object and saves it
$('adoptBtn').onclick = () => {
  S = {
    name:   $('nm').value.trim() || 'Mochi',
    type:   sel,
    hunger: 72,
    energy: 51,
    happy:  83,
    clean:  64,
    health: 91,
    coins:  1250,
    xp:     0,
    lvl:    1,
  };
  save();
  enter();
};

// enter() — switches to the room screen and renders the pet
function enter() {
  show('room');
  render();
}


// ============================================================
// SECTION 13 — ACTION BUTTONS (Feed / Play / Sleep / Bath)
// Uses event delegation on the .side container.
// Reads data-a attribute from the clicked button to decide action.
// ============================================================
document.querySelector('.side').onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  const a = b.dataset.a;

  if (a == 'feed') {
    // If pantry has items, open pantry tab; otherwise open shop
    S.inv = S.inv || {};
    tab = Object.values(S.inv).some(v => v > 0) ? 'pantry' : 'shop';
    foodUI();
    $('food').classList.add('on');
  }

  if (a == 'play') {
    startGame();
  }

  if (a == 'sleep') {
    sleeping = true;
    $('sp').innerHTML = svg(S.type, 'sleep');
    $('sb').style.width = S.energy + '%';
    $('wt').textContent = 'Tap to wake up';
    show('sleep');
    render();
  }

  if (a == 'bath') {
    S.clean = cl(S.clean + 40); // Cleanliness +40
    addXp(5);
    bubbles(); // Soap bubble animation
    toast('🛁 Squeaky clean! ✨');
    save();
    render();
  }
};


// ============================================================
// SECTION 14 — FOOD SCREEN UI
// tab = 'shop' or 'pantry' — tracks which tab is active
// foodUI() rebuilds the food list based on the current tab
// ============================================================
$('fx').onclick = () => $('food').classList.remove('on'); // Close food screen
$('t1').onclick = () => { tab = 'shop';   foodUI(); };
$('t2').onclick = () => { tab = 'pantry'; foodUI(); };

// Click on a food item — either buy (shop) or feed (pantry)
$('fl').onclick = e => {
  const d = e.target.closest('.fi');
  if (!d) return;
  const i = +d.dataset.i, f = FOODS[i];
  S.inv = S.inv || {};

  if (tab == 'shop') {
    // Buying: check if enough coins
    if (S.coins < f[2]) return toast('Not enough coins!');
    S.coins -= f[2];
    S.inv[f[1]] = (S.inv[f[1]] || 0) + 1;
    toast(f[0] + ' added to pantry 🎒');

  } else {
    // Feeding: apply stat effects from the food's effect object
    if (!S.inv[f[1]]) return;
    if (S.hunger >= 100) return toast("Not hungry right now!");
    S.inv[f[1]]--;
    const m = f[3];
    // Rabbit gets 1.5× hunger bonus from carrots (special rule)
    if (m.h)  S.hunger = cl(S.hunger + m.h * (S.type == 'rabbit' && f[1] == 'Carrot' ? 1.5 : 1));
    if (m.ha) S.happy  = cl(S.happy  + m.ha);
    if (m.he) S.health = cl(S.health + m.he);
    addXp(8);
    float(f[0]); // Floating food emoji animation
    toast(f[0] + ' Yum!');
  }

  save();
  render();
  foodUI();
};

let tab = 'shop';

function foodUI() {
  S.inv = S.inv || {};

  // Highlight the active tab button
  $('t1').classList.toggle('on', tab == 'shop');
  $('t2').classList.toggle('on', tab == 'pantry');
  $('wal').textContent = '🪙 ' + S.coins.toLocaleString();

  // fx() builds the coloured effect labels (e.g. "+10 Hunger", "-3 Health")
  const fx = f => Object.entries(f[3]).map(([k, v]) =>
    `<span class="${v < 0 ? 'neg' : 'pos'}">${v > 0 ? '+' : ''}${v} ${LAB[k]}</span>`
  ).join('<br>');

  // In shop: show all foods. In pantry: only show foods you own
  const L = FOODS.map((f, i) => [f, i]).filter(([f]) => tab == 'shop' || S.inv[f[1]] > 0);

  $('fl').innerHTML = L.length
    ? L.map(([f, i]) =>
        `<div class="fi" data-i="${i}">
           <span>${f[0]}</span>
           <div>
             <b>${f[1]}</b>
             ${fx(f)}
             ${tab == 'shop' ? `<span class="own">Owned: ${S.inv[f[1]] || 0}</span>` : ''}
           </div>
           ${tab == 'shop'
             ? `<span class="p">🪙 ${f[2]}</span>`
             : `<span class="eat">Feed ×${S.inv[f[1]]}</span>`}
         </div>`
      ).join('')
    : '<div class="em">Your pantry is empty 🎒<br>Buy some food in the Shop!</div>';
}


// ============================================================
// SECTION 15 — VISUAL EFFECTS
//
// spot() — returns the pet's current [x, y] position in the room
//
// bubbles() — creates 16 floating soap bubbles at the pet's position
//   Each bubble has a random size and random animation delay
//   They are removed from DOM after 2.6s (animation duration)
//
// float(e) — floats a single emoji (e.g. 🍖) up from the pet
//   Used when feeding to show what food was eaten
// ============================================================
function spot() {
  const p = $('pet');
  return [p.offsetLeft, p.offsetTop];
}

function bubbles() {
  const [x, y] = spot();
  for (let i = 0; i < 16; i++) {
    const b = document.createElement('div');
    const z = 8 + Math.random() * 16; // Random bubble size 8–24px
    b.className = 'bb';
    b.style.cssText = `
      width:${z}px;
      height:${z}px;
      left:${x + Math.random() * 130}px;
      top:${y + 40 + Math.random() * 90}px;
      animation-delay:${Math.random() * 0.6}s
    `;
    $('rm').appendChild(b);
    setTimeout(() => b.remove(), 2600); // Clean up after animation
  }
}

function float(e) {
  const [x, y] = spot();
  const n = document.createElement('div');
  n.className = 'fx bb';
  n.style.cssText = `left:${x + 55}px; top:${y}px; font-size:34px; background:none; border:0; animation-duration:1.4s`;
  n.textContent = e;
  $('rm').appendChild(n);
  setTimeout(() => n.remove(), 1500);
}


// ============================================================
// SECTION 16 — WAKE UP (Sleep screen)
// Clicking the "GOOD MORNING!" card wakes the pet up
// ============================================================
$('wake').onclick = () => {
  sleeping = false;
  show('room');
  render();
};


// ============================================================
// SECTION 17 — MINI-GAME ("Catch the Ball!")
//
// G = the game state object (null when no game is running)
//   sc = score
//   t  = time remaining (seconds)
//   x  = pet catcher's X position (pixels from left)
//   bx = ball's X position
//   by = ball's Y position
//   sp = ball falling speed (pixels per tick)
//
// The game loop runs every 30ms via setInterval.
// The timer counts down every 1000ms via a second setInterval.
// ============================================================
let G = null;

function startGame() {
  if (S.energy < 10) return toast('Too tired to play!');
  show('game');
  $('gp').innerHTML = svg(S.type, 'happy'); // Show pet at the bottom

  // Initialise game state
  G = { sc: 0, t: 30, x: 150, bx: 100, by: 0, sp: 5.0 };
  const gm = $('game');

  // mv(x) — moves the pet catcher to the mouse/touch X position
  // Math.max/min clamps it so it can't go off-screen
  const mv = x => {
    const r = gm.getBoundingClientRect();
    G.x = Math.max(55, Math.min(r.width - 55, x - r.left));
  };

  gm.onmousemove = e => mv(e.clientX);
  gm.ontouchmove = e => mv(e.touches[0].clientX);
  addEventListener('keydown', kd);

  // GAME LOOP — runs every 30ms
  G.i = setInterval(() => {
    const w = gm.clientWidth, h = gm.clientHeight;

    G.by += G.sp; // Move ball down by speed amount

    // Keyboard movement (arrow keys)
    if (G.keys) G.x = Math.max(55, Math.min(w - 55, G.x + G.keys * 7));

    // CATCH DETECTION:
    // Ball is in the "catch zone" (near the bottom) AND
    // horizontally close enough to the catcher
    if (G.by > h - 90 && G.by < h - 40 && Math.abs(G.bx + 14 - G.x) < 60) {
      G.sc++;           // Increment score
      G.sp += 0.2;      // Speed up the ball slightly (gets harder!)
      G.by = 0;         // Reset ball to top
      G.bx = Math.random() * (w - 30); // Random new X position
    }
    // MISS: ball went past the bottom without being caught
    else if (G.by > h) {
      G.by = 0;
      G.bx = Math.random() * (w - 30);
    }

    // Update DOM positions
    $('ball').style.left = G.bx + 'px';
    $('ball').style.top  = G.by + 'px';
    $('gp').style.left   = G.x  + 'px';
    $('gs').textContent  = 'Score: ' + G.sc;

  }, 30);

  // TIMER — counts down once per second
  G.ti = setInterval(() => {
    G.t--;
    $('gt').textContent = 'Time: ' + G.t + 's';
    if (G.t <= 0) endGame();
  }, 1000);
}

// kd() — keyboard handler for arrow key movement
function kd(e) {
  if (!G) return;
  if (e.key == 'ArrowLeft')  G.x = Math.max(55, G.x - 30);
  if (e.key == 'ArrowRight') G.x += 30;
}

// endGame() — called when timer hits 0
// Cleans up both intervals, awards coins/XP/happiness based on score
function endGame() {
  clearInterval(G.i);
  clearInterval(G.ti);
  removeEventListener('keydown', kd);
  const s = G.sc;
  G = null;

  S.coins += s * 10;             // +10 coins per catch
  S.happy  = cl(S.happy + s * 2 + 5); // +happiness
  S.energy = cl(S.energy - 15); // Playing costs energy
  addXp(s * 3);
  save();
  show('room');
  render();
  toast(`🎾 Score ${s}! +${s * 10} coins`);
}


// ============================================================
// SECTION 18 — MINI MODE (Desktop Pet)
//
// bMin (▾) button: adds 'mini' class to body
//   → CSS hides .win and shows #mini instead
//   → In Electron: calls E.setMini(true) to resize the OS window
//
// bX (✕) button: resets the whole app (clears localStorage)
// ============================================================
$('bMin').onclick = () => {
  if (!S) return;
  document.body.classList.add('mini');
  const m = $('mini');
  if (E) {
    E.setMini(true);
    m.style.left = '35px';
    m.style.top  = '55px';
  } else {
    // Browser fallback: position in bottom-right
    m.style.left = (innerWidth - 170) + 'px';
    m.style.top  = '90px';
  }
};

$('bX').onclick = () => {
  if (confirm('Release your pet and start over?')) {
    try { localStorage.removeItem('mochi'); } catch (e) {}
    S = null;
    sleeping = false;
    show('adopt');
    pick('cat');
  }
};


// ============================================================
// SECTION 19 — MINI PET DRAGGING
// Uses the Pointer Events API (works for both mouse and touch).
//
// onpointerdown: record drag start position, capture pointer
// onpointermove: move the mini pet element with the pointer
//   In Electron: moves the actual OS window via E.moveTo()
//   In browser:  moves the #mini div directly
// onpointerup:  if barely moved (<4 moves), treat as a click
//   → openMain() expands back to the full window
// ============================================================
(function () {
  const m = $('mini');
  let d = null, moved = 0;

  m.onpointerdown = e => {
    d = E
      ? { sx: e.screenX, sy: e.screenY, wx: screenX, wy: screenY }
      : { x: e.clientX - m.offsetLeft, y: e.clientY - m.offsetTop };
    moved = 0;
    m.setPointerCapture(e.pointerId); // Ensures move/up fire even outside element
    m.style.cursor = 'grabbing';
  };

  m.onpointermove = e => {
    if (!d) return;
    moved++;
    if (E) {
      E.moveTo(d.wx + e.screenX - d.sx, d.wy + e.screenY - d.sy);
    } else {
      m.style.left = (e.clientX - d.x) + 'px';
      m.style.top  = (e.clientY - d.y) + 'px';
    }
  };

  m.onpointerup = () => {
    d = null;
    m.style.cursor = 'grab';
    if (moved < 4) openMain(); // Tap (not drag) → open main window
  };

  m.oncontextmenu = e => {
    e.preventDefault();
    if (E) E.menu(); // Right-click opens Electron context menu
  };
})(); // Immediately Invoked Function Expression (IIFE) — keeps variables private


// ============================================================
// SECTION 20 — OPEN MAIN WINDOW
// Removes the 'mini' class → CSS switches back to full window
// ============================================================
function openMain() {
  document.body.classList.remove('mini');
  if (E) E.setMini(false);
}


// ============================================================
// SECTION 21 — ELECTRON EXTRAS
// If running in Electron:
//   - Register a callback for when the tray icon is clicked
//     (E.onOpen) to re-expand the window
//   - Dynamically add a ⏻ quit button to the title bar
// ============================================================
if (E) {
  E.onOpen(openMain);
  const q = document.createElement('b');
  q.textContent = '⏻';
  q.title = 'Quit Mochi';
  q.onclick = () => E.quit();
  document.querySelector('.tb').appendChild(q);
}


// ============================================================
// SECTION 22 — INITIALISATION
// Load saved state (only in browser — Electron always starts fresh).
// If a saved pet exists: go straight to the room screen.
// If no saved pet:        show the adopt screen with cat selected.
// Start the tick (every 3s) and wander (every 4s) loops.
// ============================================================
function wanderMini() {} // Placeholder (mini wander not implemented)

if (!E) load(); // Load save only in browser/demo mode

if (S) {
  enter();       // Go to room screen
  pick(S.type);  // Highlight the correct pet in the picker
} else {
  pick('cat');   // Default selection on adopt screen
}

setInterval(tick,   3000); // Stats drain/recover every 3 seconds
setInterval(wander, 4000); // Pet wanders around room every 4 seconds
