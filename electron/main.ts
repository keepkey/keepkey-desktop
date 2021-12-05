// @ts-ignore
const { app, BrowserWindow, screen: electronScreen } = require('electron')

const createMainWindow = () => {
  let mainWindow = new BrowserWindow({
    width: 460,
    height: 780,
    show: false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true
    }
  })
  const startURL = 'http://localhost:3000'

  mainWindow.loadURL(startURL)

  mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (!BrowserWindow.getAllWindows().length) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
