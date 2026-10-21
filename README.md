# 🐾 Mochi — Desktop Pet

A cute virtual pet that lives right on your desktop, built with Electron. Adopt your pet, keep it fed and happy, play mini-games, and watch it wander around your screen!

> Made by [@RiddhiInLoop](https://github.com/RiddhiInLoop)

---

## ✨ Features

- **4 pet types** — Cat 🐱, Dog 🐶, Rabbit 🐰, Elephant 🐘, each with unique stats and traits
- **Live stat system** — Hunger, Energy, Happiness, Cleanliness, and Health all tick in real time
- **Food shop & pantry** — Buy food with coins and feed your pet whenever it's hungry
- **Mini-game** — Play "Catch the Ball!" to earn coins and make your pet happy
- **Sleep system** — Put your pet to sleep to recover energy, wake it up when it's rested
- **XP & levelling** — Every interaction earns XP; level up by taking good care of your pet
- **Desktop pet mode** — Minimize to a tiny floating pet that sits on top of all your windows, fully draggable
- **Right-click menu** — Toggle always-on-top or quit from a context menu in desktop pet mode
- **No images** — All pet art is generated with pure inline SVG, no external assets needed
- **Persistent saves** — Pet state is saved to `localStorage` so your pet survives app restarts

---

## 🖥️ Screenshots

> _Add your screenshots here!_
> Drag images into this section or replace these lines with `![Alt text](screenshots/name.png)`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- npm (comes with Node.js)

### Install & Run

```bash
# Clone the repo
git clone https://github.com/RiddhiInLoop/mochi-desktop-pet.git
cd mochi-desktop-pet

# Install dependencies
npm install

# Start the app
npm start
```

### Build a distributable

```bash
npm run dist
```

This uses [electron-builder](https://www.electron.build/) and outputs to the `dist/` folder:
- **Windows** → portable `.exe`
- **macOS** → `.dmg`
- **Linux** → `.AppImage`

---

## 🗂️ Project Structure

```
mochi-electron/
├── main.js          # Electron main process — window management, IPC
├── preload.js       # Context bridge — safely exposes APIs to the renderer
├── src/
│   ├── index.html   # App shell with all five screens
│   ├── js/
│   │   ├── pets.js  # Pet type definitions + SVG sprite generator
│   │   └── app.js   # All game logic — stats, saving, food, mini-game, drag
│   └── css/
│       └── style.css
├── package.json
└── .gitignore
```

---

## 🎮 How to Play

| Action | What it does |
|---|---|
| **Feed** | Opens the food shop/pantry. Buy food with coins, then feed your pet. |
| **Play** | Launches the "Catch the Ball!" mini-game. Score coins and happiness. |
| **Sleep** | Sends your pet to sleep. Energy recovers +5 every few seconds. |
| **Bath** | Instantly boosts Cleanliness by 40. |
| **▾ (Minimize)** | Shrinks to a tiny floating desktop pet. Drag it anywhere. |
| **Right-click pet** | Context menu: open main window, toggle always-on-top, or quit. |
| **✕ (Reset)** | Releases your pet and resets all save data. |

### Pet Differences

| Pet | Trait |
|---|---|
| 🐶 Dog | Gets hungry 30% faster |
| 🐘 Elephant | Hunger drains 50% faster |
| 🐰 Rabbit | Energy drains 60% faster, but gets 1.5× benefit from Carrots |
| 🐱 Cat | Balanced stats |

---

## 🛠️ Tech Stack

- **[Electron](https://www.electronjs.org/)** — cross-platform desktop app framework
- **Vanilla JS** — no frontend framework, just clean ES6+
- **Pure CSS** — no UI libraries; all art and layout is hand-crafted
- **electron-builder** — packaging and distribution

---

## 📄 License

MIT © [RiddhiInLoop](https://github.com/RiddhiInLoop)
