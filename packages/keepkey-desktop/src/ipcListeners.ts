import * as Comlink from 'comlink'
import { electronEndpoint } from 'comlink-electron-endpoint/main'
import type { IpcMainEvent } from 'electron'
import { app, desktopCapturer, ipcMain } from 'electron'
import log from 'electron-log'
import jsQR from 'jsqr'
// import isDev from 'electron-is-dev'
// import { autoUpdater } from 'electron-updater'
import { sleep } from 'wait-promise'

import type {
  PairedAppProps,
  PairingProps as PairingProps2,
} from '../../keepkey-desktop-app/src/pages/Pairings/types'
import { bridgeLogger, db, isWalletBridgeRunning, kkStateController, settings } from './globalState'
import {
  downloadFirmware,
  getAllFirmwareData,
  getFirmwareBaseUrl,
  getLatestFirmwareData,
  loadFirmware,
} from './helpers/kk-state-controller/firmwareUtils'
import type { BridgeLog, Settings } from './helpers/types'
import type { IpcListeners, RendererIpc } from './types'

export const [rendererIpc, rendererIpcQueue] = (() => {
  const { port1, port2 } = new MessageChannel()
  return [Comlink.wrap<RendererIpc>(port1), port2]
})()

ipcMain.on('@app/get-ipc-listeners', (event: IpcMainEvent) => {
  Comlink.expose(ipcListeners, electronEndpoint(event.ports[0]))
})

ipcMain.on('@app/register-render-listeners', (event: IpcMainEvent) => {
  const rendererIpcPort = event.ports[0]

  rendererIpcQueue.addEventListener('message', e => {
    rendererIpcPort.postMessage(e.data)
  })
  rendererIpcQueue.addEventListener('messageerror', e => log.error('messageerror', e))

  rendererIpcPort.on('message', e => {
    rendererIpcQueue.postMessage(e.data)
  })
  // no messageerror on Electron.MessagePortMain

  rendererIpcQueue.start()
  rendererIpcPort.start()
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
    serviceKey: string,
  ): Promise<undefined | { app: PairedAppProps; logs: BridgeLog[] }> {
    const doc = await db.findOne<PairedAppProps>({
      type: 'service',
      serviceKey,
    })
    if (!doc) return undefined
    const logs = bridgeLogger.fetchLogs(serviceKey)
    return {
      app: doc,
      logs,
    }
  },

  async bridgeConnected() {
    return isWalletBridgeRunning()
  },

  async bridgeServiceName(serviceKey: string): Promise<string | undefined> {
    const doc = await db.findOne<{ serviceName: string }>({
      type: 'service',
      serviceKey,
    })
    return doc?.serviceName
  },

  // send paired apps when requested
  async bridgePairedApps(): Promise<PairedAppProps[]> {
    return await db.find<PairedAppProps>({ type: 'service' })
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
    return 'Unable to scan QR'
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
