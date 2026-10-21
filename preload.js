const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  setMini: on => ipcRenderer.send('mini', on),
  moveTo: (x, y) => ipcRenderer.send('move', x, y),
  quit: () => ipcRenderer.send('quit'),
  menu: () => ipcRenderer.send('menu'),
  onOpen: cb => ipcRenderer.on('open', cb)
});
