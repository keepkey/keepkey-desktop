import { BrowserWindow } from 'electron'
import log from 'electron-log'
import { rendererIpc } from 'ipcListeners'
import path from 'path'

import { kkStateController, settings, windows } from '../globalState'
import { startTcpBridge } from '../tcpBridge'
import { startWindowListeners } from '../windowListeners'

export const openSignTxWindow = async (signArgs: any) => {
  log.info(' | openSignTxWindow | ')
  let prevContentSize = { width: 0, height: 0 }
  let windowWasPreviouslyOpen = false

  if (!windows.mainWindow || windows.mainWindow.isDestroyed()) {
    if (!(await createMainWindow())) return
  }
  if (!windows.mainWindow) throw Error('Failed to start App!')
  windows.mainWindow.focus()
  windows.mainWindow.setAlwaysOnTop(true)
  windowWasPreviouslyOpen = true
  const contentSize = windows.mainWindow.getContentSize()
  prevContentSize = { width: contentSize[0], height: contentSize[1] }

  if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return
  if (!windowWasPreviouslyOpen) windows.mainWindow.focus()
  // windows.mainWindow.setContentSize(400, 780)

  await (await rendererIpc).accountSignTx(signArgs)

  windows.mainWindow.setAlwaysOnTop(false)
  if (windowWasPreviouslyOpen && windows.mainWindow.minimizable) {
    console.log('prevContentSize', prevContentSize)
    windows.mainWindow.setContentSize(prevContentSize.width, prevContentSize.height)
    windows.mainWindow.minimize()
  } else if (windows.mainWindow.closable) {
    windows.mainWindow.close()
  }
}

export const getWallectConnectUri = (inputUri: string): string | undefined => {
  const uri = inputUri.replace('keepkey://', '')
  if (!uri.startsWith('wc')) return
  else return decodeURIComponent(uri.replace('wc/?uri=', '').replace('wc?uri=', ''))
}

export const createMainWindow = async () => {
  try {
    await kkStateController.syncState()
  } catch (e) {
    log.error(e)
    if (String(e).includes('claimInterface error')) {
      windows?.splash?.webContents.send('@update/errorClaimed')
      await new Promise(() => 0)
    } else {
      windows?.splash?.webContents.send('@update/errorReset')
      await new Promise(() => 0)
    }
  }

  if (await settings.shouldAutoStartBridge) await startTcpBridge(await settings.bridgeApiPort)

  windows.mainWindow = new BrowserWindow({
    focusable: true,
    width: 1400,
    height: 920,
    show: false,
    backgroundColor: 'white',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'assets/preload.js'),
      webviewTag: true,
      devTools: true,
    },
  })
  windows.mainWindow.webContents.addListener(
    'will-attach-webview',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_event, webPreferences, params) => {
      // Security check -- we don't use this and it would allow the app to break out of context isolation if compromised
      delete webPreferences.preload
      // Security check -- we don't use this and it would allow the app to disable its CSP if compromised
      delete params.disablewebsecurity
    },
  )

  windows.mainWindow.loadURL(`file://${path.join(__dirname, 'app/index.html')}`)

  startWindowListeners()

  return true
}
