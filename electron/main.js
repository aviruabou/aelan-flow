// electron/main.js
// MereSimi Studios Ltd — Honiara Taxi Network

const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width:  1280,
    height: 800,
    minWidth:  375,
    minHeight: 667,
    backgroundColor: '#0A0C0F',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      nodeIntegration:  false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
