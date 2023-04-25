import * as Comlink from 'comlink'
import { electronEndpoint } from 'comlink-electron-endpoint/main'
import { deferred } from 'common-utils'
import type { IpcMainEvent } from 'electron'
import { session } from 'electron'
import { webContents } from 'electron'
import { app, desktopCapturer, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import jsQR from 'jsqr'
import * as _ from 'lodash'
import fetch from 'node-fetch'
// import isDev from 'electron-is-dev'
// import { autoUpdater } from 'electron-updater'
import { sleep } from 'wait-promise'

import type {
  PairedAppProps,
  PairingProps as PairingProps2,
} from '../../keepkey-desktop-app/src/pages/Pairings/types'
import {
  bridgeLogger,
  db,
  isWalletBridgeRunning,
  kkStateController,
  settings,
  windows,
} from './globalState'
import {
  downloadFirmware,
  getAllFirmwareData,
  getFirmwareBaseUrl,
  getLatestFirmwareData,
  loadFirmware,
} from './helpers/kk-state-controller/firmwareUtils'
import type { BridgeLog, Settings } from './helpers/types'
import type { IpcListeners, RendererIpc } from './types'

export let rendererIpc = deferred<RendererIpc>()

ipcMain.on('@app/register-render-listeners', (event: IpcMainEvent) => {
  if (rendererIpc.settled) rendererIpc = deferred<RendererIpc>()
  rendererIpc.resolve(Comlink.wrap<RendererIpc>(electronEndpoint(event.ports[0])))
})

ipcMain.on('@app/get-ipc-listeners', (event: IpcMainEvent) => {
  Comlink.expose(ipcListeners, electronEndpoint(event.ports[0]))
})

export const ipcListeners: IpcListeners = {
  async appRestart() {
    app.relaunch()
    app.exit()
  },

  async appExit() {
    app.exit()
  },

  async appVersion() {
    return app.getVersion()
  },

  async appPreRelease() {
    if (!autoUpdater.allowPrerelease) return false
    const currentVersion = app.getVersion()

    try {
      const r = await fetch(
        `https://api.github.com/repos/keepkey/keepkey-desktop/releases/tags/v${currentVersion}`,
      )
      const resp: any = await r.json()
      if (!resp) return false
      return resp.prerelease
    } catch (error) {
      console.error(error)
      return false
    }
  },

  async appUpdateSettings(data: Partial<Settings>) {
    await settings.updateBulkSettings(data)
  },

  async appSettings(): Promise<Settings> {
    return {
      shouldAutoLaunch: await settings.shouldAutoLaunch,
      shouldAutoStartBridge: await settings.shouldAutoStartBridge,
      shouldMinimizeToTray: await settings.shouldMinimizeToTray,
      shouldAutoUpdate: await settings.shouldAutoUpdate,
      bridgeApiPort: await settings.bridgeApiPort,
      allowPreRelease: await settings.allowPreRelease,
      allowBetaFirmware: await settings.allowBetaFirmware,
      autoScanQr: await settings.autoScanQr,
    }
  },

  async appPairings(): Promise<PairingProps2[]> {
    return await db.find<PairingProps2>({ type: 'pairing' })
  },

  async walletconnectPairing(data: {
    serviceName: string
    serviceHomePage: string
    serviceImageUrl: string
  }) {
    await db.update(
      {
        type: 'pairing',
        serviceName: data.serviceName,
        serviceHomePage: data.serviceHomePage,
        pairingType: 'walletconnect',
      },
      {
        type: 'pairing',
        addedOn: Date.now(),
        serviceName: data.serviceName,
        serviceImageUrl: data.serviceImageUrl,
        serviceHomePage: data.serviceHomePage,
        pairingType: 'walletconnect',
      },
      {
        upsert: true,
      },
    )
  },

  async bridgeServiceDetails(
    apiKey: string,
  ): Promise<undefined | { app: PairedAppProps; logs: BridgeLog[] }> {
    const doc = await db.findOne<PairedAppProps>({
      type: 'sdk-pairing',
      apiKey,
    })
    if (!doc) return undefined
    const logs = bridgeLogger.fetchLogs(apiKey)
    return {
      app: doc,
      logs,
    }
  },

  async bridgeConnected() {
    return isWalletBridgeRunning()
  },

  async bridgeServiceName(apiKey: string): Promise<string | undefined> {
    const doc = await db.findOne<PairedAppProps>({
      type: 'sdk-pairing',
      apiKey,
    })
    if (!doc) return 'Unable to fetch name'
    return doc.info.name
  },

  // send paired apps when requested
  async bridgePairedApps(): Promise<PairedAppProps[]> {
    return await db.find<PairedAppProps>({ type: 'sdk-pairing' })
  },

  async bridgeCheckAppPaired(url: string): Promise<boolean> {
    const apps = await db.find<PairedAppProps>({ type: 'sdk-pairing' })
    if (!apps) return false
    const paired = apps.find(app => app.info.url === url)
    if (!paired) return false
    return true
  },

  // used only for implicitly pairing the KeepKey web app
  async bridgeAddService(data: {
    serviceKey: string
    serviceName: string
    serviceImageUrl: string
    serviceHomePage?: string
  }) {
    await db.updateOne(
      {
        type: 'sdk-pairing',
        apiKey: data.serviceKey,
      },
      {
        type: 'sdk-pairing',
        apiKey: data.serviceKey,
        info: {
          name: data.serviceName,
          url: data.serviceHomePage,
          imageUrl: data.serviceImageUrl,
          addedOn: Date.now(),
          isKeepKeyDesktop: true,
        },
      },
      { upsert: true },
    )
  },

  // used for unpairing apps
  async bridgeRemoveService(data: PairedAppProps) {
    await db.remove(data, {})
  },

  async keepkeyUpdateFirmware() {
    const baseUrl = await getFirmwareBaseUrl()
    const firmwareData = await getAllFirmwareData(baseUrl)
    const url = (await getLatestFirmwareData(firmwareData)).firmware.url
    const firmware = await downloadFirmware(baseUrl, url)
    if (!firmware) throw new Error(`Failed to load firmware from url '${url}'`)
    const wallet = kkStateController.wallet
    if (!wallet) throw new Error('No HDWallet instance found')
    await loadFirmware(wallet, firmware)
    setTimeout(async () => {
      app.relaunch()
      app.quit()
      await sleep(250)
      app.exit()
    }, 0)
  },

  async keepkeyUpdateBootloader() {
    const baseUrl = await getFirmwareBaseUrl()
    const firmwareData = await getAllFirmwareData(baseUrl)
    const url = (await getLatestFirmwareData(firmwareData)).bootloader.url
    const firmware = await downloadFirmware(baseUrl, url)
    if (!firmware) throw new Error(`Failed to load bootloader from url '${url}'`)
    const wallet = kkStateController.wallet
    if (!wallet) throw new Error('No HDWallet instance found')
    await loadFirmware(wallet, firmware)
  },

  async keepkeySkipUpdate() {
    await kkStateController.skipUpdate()
  },

  async appReadQr(): Promise<string> {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 },
    })

    for (let index = 0; index < sources.length; index++) {
      const source = sources[index]
      const thumbnail = source.thumbnail
      const { height, width } = thumbnail.getSize()

      const scanned = jsQR(new Uint8ClampedArray(thumbnail.getBitmap()), width, height)
      if (!scanned) continue

      return scanned.data
    }

    throw new Error('Unable to scan QR')
  },

  async appMonitorWebContentsForQr(
    webContentsId: number,
    signal: AbortSignal,
    callback: (data: string) => Promise<void>,
  ): Promise<void> {
    console.log(`appMonitorWebContentsForQr: subscribing to ${webContentsId}`)

    let lastScannedValue: string | undefined = undefined

    const contents = webContents.fromId(webContentsId)
    const handler = _.debounce(
      () => {
        ;(async () => {
          const image = await contents.capturePage()
          const { width, height } = image.getSize()
          const scanned = jsQR(new Uint8ClampedArray(image.getBitmap()), width, height)?.data
          if (scanned && scanned !== lastScannedValue) {
            lastScannedValue = scanned
            console.log('appMonitorWebContentsForQr: scanned', scanned)
            callback(scanned).catch(e =>
              console.error('appMonitorWebContentsForQr callback error:', e),
            )
          }
        })().catch(e => console.error('appMonitorWebContentsForQr:debouncedHandler error:', e))
      },
      1000,
      { leading: false, trailing: true },
    )
    contents.on('input-event', handler)
    signal.addEventListener('abort', () => {
      console.log(`appMonitorWebContentsForQr: unsubscribing from ${webContentsId}`)
      try {
        contents.off('input-event', handler)
      } catch {} // the contents object might have already been destroyed, and that's ok
    })
  },

  async webviewAttachOpenHandler(
    webContentsId: number,
    loadUrl: (url: string, options?: Electron.LoadURLOptions) => Promise<void>,
  ): Promise<void> {
    console.log(`webviewAttachOpenHandler: subscribing to ${webContentsId}`)

    const contents = webContents.fromId(webContentsId)
    contents.setWindowOpenHandler((details: Electron.HandlerDetails) => {
      if (details.disposition === 'foreground-tab') {
        loadUrl(details.url, {
          httpReferrer: details.referrer,
          postData: details.postBody?.data,
        }).catch(e => console.error('webviewAttachOpenHandler: loadUrl error:', e))
        return {
          action: 'deny',
        }
      } else {
        return {
          action: 'allow',
          overrideBrowserWindowOptions: {
            autoHideMenuBar: true,
          },
        }
      }
    })
  },

  async clearBrowserSession() {
    const browserSession = session.fromPartition('browser')
    await browserSession.clearStorageData()
    await browserSession.clearCache()
  },

  async clearLocalStorage() {
    await session.defaultSession.clearStorageData()
    await session.defaultSession.clearCache()
  },

  async wipeKeepKey() {
    if (!kkStateController.wallet) return
    await kkStateController.wallet.cancel()
    await kkStateController.wallet.wipe()
  },

  async forceReconnect() {
    await kkStateController.forceReconnect()
  },

  async setAlwaysOnTop(value: boolean) {
    if (!windows.mainWindow) return
    if (value) windows.mainWindow.focus()
    windows.mainWindow.setAlwaysOnTop(value)
  },

  // async appUpdate() {
  //   if (isDev) {
  //     return { updateInfo: { version: app.getVersion() } }
  //   }
  //   const update = await autoUpdater.checkForUpdates()
  //   autoUpdater.autoDownload = await settings.shouldAutoUpdate
  //   return update ?? undefined
  // },

  // async appDownloadUpdates() {
  //   await autoUpdater.downloadUpdate()
  // },

  // async appInstallUpdates() {
  //   autoUpdater.quitAndInstall()
  // },
}
