import { appReady } from 'appListeners'
import { app, Menu, nativeImage, nativeTheme, Tray } from 'electron'
import path from 'path'
import { sleep } from 'wait-promise'

import { assetsDirectory, isWalletBridgeRunning, tcpBridgeClosing, windows } from './globalState'
import { createMainWindow } from './helpers/utils'
import { startTcpBridge, stopTcpBridge } from './tcpBridge'

export let tray: Tray
const lightDark = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'

let createAndUpdateTrayQueued = false

// createAndUpdateTray must be called anytime bridgeRunning or bridgeCLosing changes
export const createAndUpdateTray = async () => {
  if (createAndUpdateTrayQueued) return
  createAndUpdateTrayQueued = true
  await appReady
  createAndUpdateTrayQueued = false

  const menuTemplate: any = [
    {
      label: !isWalletBridgeRunning() ? 'Bridge Not Running!' : 'Bridge Running',
      enabled: false,
      type: 'normal',
      icon: path.join(
        assetsDirectory,
        !isWalletBridgeRunning() ? 'status/unknown.png' : 'status/success.png',
      ),
    },
    { type: 'separator' },
    {
      label: 'Show App',
      enabled: true,
      click: () => {
        if (!windows.mainWindow) return createMainWindow()
        if (windows.mainWindow.isDestroyed()) {
          createMainWindow()
        } else {
          windows.mainWindow.show()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Start Bridge',
      click: () => startTcpBridge(),
      enabled: !isWalletBridgeRunning() && !tcpBridgeClosing,
    },
    {
      label: !tcpBridgeClosing ? 'Stop Bridge' : 'Bridge Closing, please wait...',
      enabled: !tcpBridgeClosing && isWalletBridgeRunning(),
      click: stopTcpBridge,
    },
    {
      label: 'Open dev tools',
      click: () =>
        windows.mainWindow &&
        !windows.mainWindow.isDestroyed() &&
        windows.mainWindow.webContents.openDevTools(),
    },
    {
      label: 'Quit KeepKey Bridge',
      async click() {
        app.quit()
        await sleep(250)
        app.exit()
      },
    },
  ]

  const trayImage = nativeImage.createFromPath(
    path.join(
      assetsDirectory,
      !isWalletBridgeRunning()
        ? `${lightDark}/keepKey/unknown.png`
        : `${lightDark}/keepKey/success.png`,
    ),
  )
  if (!tray) {
    tray = new Tray(trayImage)
  } else {
    tray.setImage(trayImage)
  }

  const contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setContextMenu(contextMenu)
}
