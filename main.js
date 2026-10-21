const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron');
const path = require('path');
const NORMAL = { w: 420, h: 700 }, MINI = { w: 190, h: 210 };
let win, onTop = true;

if (!app.requestSingleInstanceLock()) app.quit();

function centered(wa) {
  return { x: Math.round(wa.x + (wa.width - NORMAL.w) / 2), y: Math.round(wa.y + (wa.height - NORMAL.h) / 2), width: NORMAL.w, height: NORMAL.h };
}

function create() {
  const wa = screen.getPrimaryDisplay().workArea;
  win = new BrowserWindow({
    ...centered(wa),
    transparent: true, frame: false, hasShadow: false, resizable: false,
    backgroundColor: '#00000000', title: 'Mochi',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, backgroundThrottling: false }
  });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'src', 'index.html'));
  win.webContents.on('before-input-event', (e, i) => {
    if (i.type === 'keyDown' && (i.control || i.meta) && i.key.toLowerCase() === 'q') app.quit();
  });
}

// Switch between the normal window and the small always-on-top desktop pet
ipcMain.on('mini', (_, on) => {
  const wa = screen.getDisplayMatching(win.getBounds()).workArea;
  win.setResizable(true);
  if (on) {
    win.setMinimumSize(1, 1);
    win.setBounds({ x: wa.x + wa.width - MINI.w - 30, y: wa.y + wa.height - MINI.h - 30, width: MINI.w, height: MINI.h });
    win.setAlwaysOnTop(onTop, 'screen-saver');
  } else {
    win.setAlwaysOnTop(false);
    win.setBounds(centered(wa));
  }
  win.setResizable(false);
});

// Dragging the desktop pet
ipcMain.on('move', (_, x, y) => {
  const b = win.getBounds();
  win.setBounds({ x: Math.round(x), y: Math.round(y), width: b.width, height: b.height });
});

ipcMain.on('quit', () => app.quit());

// Right-click menu on the desktop pet
ipcMain.on('menu', () => {
  Menu.buildFromTemplate([
    { label: 'Open Mochi', click: () => win.webContents.send('open') },
    { label: 'Always on top', type: 'checkbox', checked: onTop, click: m => { onTop = m.checked; win.setAlwaysOnTop(onTop, 'screen-saver'); } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]).popup({ window: win });
});

app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
