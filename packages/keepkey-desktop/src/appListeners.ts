import { app, BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'
import { autoUpdater } from 'electron-updater'
import { sleep } from 'wait-promise'

import { bridgeLogger, isLinux, settings, windows } from './globalState'
import { createMainWindow } from './helpers/utils'
import { createUpdaterSplashWindow, skipUpdateCheck } from './updaterListeners'

export const startAppListeners = () => {
  // app entry point
  // creates splash window to look for updates and then start the main window
  app.on('ready', async () => {
    await createUpdaterSplashWindow()
    const loadedSettings = await settings.loadSettingsFromDb()
    autoUpdater.autoDownload = loadedSettings.shouldAutoUpdate
    autoUpdater.allowPrerelease = loadedSettings.allowPreRelease
    if (!windows.splash) return
    if (isDev || isLinux || !loadedSettings.shouldAutoUpdate) await skipUpdateCheck(windows.splash)
    if (!isDev && !isLinux) await autoUpdater.checkForUpdates()
  })

  app.on('second-instance', async () => {
    if (windows.mainWindow) {
      if (windows.mainWindow.isDestroyed()) {
        await createMainWindow()
      } else if (windows.mainWindow.isMinimized()) {
        windows.mainWindow.restore()
      }
      windows.mainWindow.focus()
    } else {
      await createMainWindow()
    }
  })

  app.on('window-all-closed', async () => {
    if (!settings.shouldMinimizeToTray) {
      app.quit()
      await sleep(250)
      app.exit()
    }
  })

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) await createMainWindow()
  })

  app.on('before-quit', async () => {
    await bridgeLogger.saveLogs()
  })
}
