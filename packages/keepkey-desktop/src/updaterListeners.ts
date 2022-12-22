import { app, BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import { sleep } from 'wait-promise'

import { isLinux, shouldShowWindow, windows } from './globalState'
import { createMainWindow } from './helpers/utils'

export const [updateComplete, setUpdateComplete] = (() => {
  let out: () => void
  return [new Promise<boolean>(resolve => (out = () => resolve(true))), out!]
})()

export let skipUpdateCheckCompleted = false

export const startUpdaterListeners = () => {
  autoUpdater.logger = log

  autoUpdater.on('update-available', async info => {
    if (skipUpdateCheckCompleted) return
    if (!windows.splash) return
    windows.splash.webContents.send('@update/download', info)

    // skip the update if it takes more than 1 minute
    if (!(await Promise.race([updateComplete, sleep(60000).then(() => false)]))) {
      if (!windows.splash) return
      await skipUpdateCheck(windows.splash)
    }
  })

  autoUpdater.on('download-progress', progress => {
    let prog = Math.floor(progress.percent)
    if (windows.splash && !windows.splash.isDestroyed())
      windows.splash.webContents.send('@update/percentage', prog)
    if (windows.splash && !windows.splash.isDestroyed()) windows.splash.setProgressBar(prog / 100)
    if (windows.mainWindow && !windows.mainWindow.isDestroyed())
      windows.mainWindow.webContents.send('@update/percentage', prog)
    if (windows.mainWindow && !windows.mainWindow.isDestroyed())
      windows.mainWindow.setProgressBar(prog / 100)

    setUpdateComplete()
  })

  autoUpdater.on('update-downloaded', async () => {
    if (skipUpdateCheckCompleted) return
    if (windows.splash) windows.splash.webContents.send('@update/relaunch')
    setUpdateComplete()
    await sleep(1000)
    autoUpdater.quitAndInstall()
  })

  autoUpdater.on('update-not-available', async () => {
    if (skipUpdateCheckCompleted) return
    if (!windows.splash) return
    await skipUpdateCheck(windows.splash)
  })

  autoUpdater.on('error', async () => {
    if (skipUpdateCheckCompleted) return
    if (!windows.splash) return
    await skipUpdateCheck(windows.splash)
  })
}

export const skipUpdateCheck = async (splash: BrowserWindow) => {
  setUpdateComplete()

  createMainWindow()
  splash.webContents.send('@update/notfound')
  if (isLinux || isDev) {
    splash.webContents.send('@update/skipCheck')
  }

  if (await Promise.race([shouldShowWindow, sleep(10000).then(() => false)])) {
    if (windows.splash) splash.webContents.send('@update/launch')
    await sleep(8000)
    if (windows.splash) splash.destroy()
    if (windows.mainWindow) windows.mainWindow.show()
  } else {
    splash.webContents.send('@update/errorReset')
    await sleep(3000)
    app.exit()
  }

  skipUpdateCheckCompleted = true
}

export const createUpdaterSplashWindow = async () => {
  windows.splash = new BrowserWindow({
    width: 300,
    height: 410,
    transparent: true,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })
  await windows.splash.loadFile(path.join(__dirname, 'assets/splash.html'))
}

export const setAllowPreRelease = (value: boolean) => {
  autoUpdater.allowPrerelease = value
}
