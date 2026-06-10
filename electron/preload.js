// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform:   process.platform,
  getVersion: () => ipcRenderer.invoke('get-version'),
})
