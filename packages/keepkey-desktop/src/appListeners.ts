import { app, BrowserWindow } from 'electron'
import isDev from 'electron-is-dev'
import { autoUpdater } from 'electron-updater'
import { sleep } from 'wait-promise'

import {
  bridgeLogger,
  isLinux,
  setProtocolLaunchUrl,
  settings,
  walletConnectUrlInProtocolHandler,
  windows,
} from './globalState'
import { createMainWindow, getWalletConnectUri } from './helpers/utils'
import { createUpdaterSplashWindow, skipUpdateCheck } from './updaterListeners'

export const appReady = new Promise<void>(resolve => {
  app.once('ready', () => resolve())
})

export const startAppListeners = () => {
  // app entry point
  // creates splash window to look for updates and then start the main window
  app.on('ready', async () => {
    await createUpdaterSplashWindow()
    autoUpdater.setFeedURL({ provider: 'github', owner: 'keepkey', repo: 'keepkey-desktop' })
    autoUpdater.autoDownload = await settings.shouldAutoUpdate
    autoUpdater.allowPrerelease = await settings.allowPreRelease
    if (!windows.splash) return
    if (isDev || isLinux || !(await settings.shouldAutoUpdate))
      await skipUpdateCheck(windows.splash)
    if (!isDev && !isLinux) await autoUpdater.checkForUpdates()
  })

  app.on('second-instance', async (e, argv) => {
    e.preventDefault()
    if (process.platform !== 'darwin') {
      const protocolUrl = argv.find(arg => arg.startsWith('keepkey://'))
      if (protocolUrl) {
        setProtocolLaunchUrl(protocolUrl)
        const wcUri = getWalletConnectUri(protocolUrl)
        if (wcUri && wcUri.includes('wc')) {
          setProtocolLaunchUrl(wcUri)
          if (walletConnectUrlInProtocolHandler) walletConnectUrlInProtocolHandler(wcUri)
        }
      }
    }
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

  app.on('open-url', (e, url) => {
    e.preventDefault()
    if (url.startsWith('keepkey://')) {
      setProtocolLaunchUrl(url)
      const wcUri = getWalletConnectUri(url)
      if (wcUri && wcUri.includes('wc')) {
        setProtocolLaunchUrl(wcUri)
        if (walletConnectUrlInProtocolHandler) walletConnectUrlInProtocolHandler(wcUri)
      }
    }
  })

  app.on('window-all-closed', async () => {
    if (!(await settings.shouldMinimizeToTray)) {
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
