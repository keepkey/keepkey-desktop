import log from 'electron-log'
import type { AddressInfo } from 'net'

import { db, kkAutoLauncher, server, tcpBridgeRunning } from '../globalState'
import { startTcpBridge, stopTcpBridge } from '../tcpBridge'
import { setAllowPreRelease } from '../updaterListeners'
import type { Settings } from './types'

export class SettingsInstance {
  static #singletonInitialized = false

  readonly loaded = this.loadSettingsFromDb()

  #shouldAutoStartBridge = true
  get shouldAutoStartBridge() {
    return (async () => (await this.loaded, this.#shouldAutoStartBridge))()
  }
  #bridgeApiPort = 1646
  get bridgeApiPort() {
    return (async () => (await this.loaded, this.#bridgeApiPort))()
  }

  #shouldAutoLaunch = false
  get shouldAutoLaunch() {
    return (async () => (await this.loaded, this.#shouldAutoLaunch))()
  }

  #shouldMinimizeToTray = true
  get shouldMinimizeToTray() {
    return (async () => (await this.loaded, this.#shouldMinimizeToTray))()
  }

  #shouldAutoUpdate = true
  get shouldAutoUpdate() {
    return (async () => (await this.loaded, this.#shouldAutoUpdate))()
  }

  #allowPreRelease = false
  get allowPreRelease() {
    return (async () => (await this.loaded, this.#allowPreRelease))()
  }

  #allowBetaFirmware = false
  get allowBetaFirmware() {
    return (async () => (await this.loaded, this.#allowBetaFirmware))()
  }

  #autoScanQr = false
  get autoScanQr() {
    return (async () => (await this.loaded, this.#autoScanQr))()
  }

  constructor() {
    if (SettingsInstance.#singletonInitialized) {
      throw new Error('SettingsInstance can only be initialized once')
    }
    SettingsInstance.#singletonInitialized = true
  }

  async loadSettingsFromDb() {
    const doc = await db.findOne<{ settings: Settings }>({ type: 'settings' })
    if (!doc) {
      await this.syncSettingsWithDB()
      return this
    }

    if (
      doc.settings.shouldAutoLaunch === undefined ||
      doc.settings.shouldAutoStartBridge === undefined ||
      doc.settings.shouldMinimizeToTray === undefined ||
      doc.settings.shouldAutoUpdate === undefined ||
      doc.settings.bridgeApiPort === undefined ||
      doc.settings.allowPreRelease === undefined ||
      doc.settings.allowBetaFirmware === undefined ||
      doc.settings.autoScanQr === undefined
    ) {
      await this.syncSettingsWithDB()
    }

    this.#shouldAutoLaunch = doc.settings.shouldAutoLaunch
    this.#shouldAutoStartBridge = doc.settings.shouldAutoStartBridge
    this.#shouldMinimizeToTray = doc.settings.shouldMinimizeToTray
    this.#shouldAutoUpdate = doc.settings.shouldAutoUpdate
    this.#bridgeApiPort = doc.settings.bridgeApiPort
    this.#allowPreRelease = doc.settings.allowPreRelease
    this.#allowBetaFirmware = doc.settings.allowBetaFirmware
    this.#autoScanQr = doc.settings.autoScanQr
    console.log('Loaded settings: ', doc.settings)

    return this
  }

  private async syncSettingsWithDB() {
    await db.update(
      { type: 'settings' },
      {
        type: 'settings',
        settings: {
          shouldAutoLaunch: this.#shouldAutoLaunch,
          shouldAutoStartBridge: this.#shouldAutoStartBridge,
          shouldMinimizeToTray: this.#shouldMinimizeToTray,
          shouldAutoUpdate: this.#shouldAutoUpdate,
          bridgeApiPort: this.#bridgeApiPort,
          allowPreRelease: this.#allowPreRelease,
          allowBetaFirmware: this.#allowBetaFirmware,
          autoScanQr: this.#autoScanQr,
        },
      },
      {
        upsert: true,
      },
    )
  }

  async setShouldAutoLaunch(value: boolean) {
    await this.loaded
    this.#shouldAutoLaunch = value
    const autoLaunch = await kkAutoLauncher.isEnabled()
    if (!autoLaunch && value) await kkAutoLauncher.enable()
    if (!autoLaunch && !value) await kkAutoLauncher.disable()
    await this.syncSettingsWithDB()
  }

  async setShouldAutoStartBridge(value: boolean) {
    await this.loaded
    this.#shouldAutoStartBridge = value
    await this.syncSettingsWithDB()
  }

  async setShouldMinimizeToTray(value: boolean) {
    await this.loaded
    this.#shouldMinimizeToTray = value
    await this.syncSettingsWithDB()
  }

  async setShouldAutoUpdate(value: boolean) {
    await this.loaded
    this.#shouldAutoUpdate = value
    await this.syncSettingsWithDB()
  }

  async setBridgeApiPort(value: number) {
    await this.loaded
    this.#bridgeApiPort = value
    if (tcpBridgeRunning) {
      const address = server.address() as AddressInfo
      if (address.port !== value) {
        await stopTcpBridge()
        await startTcpBridge(value)
      }
    }
    await this.syncSettingsWithDB()
  }

  async setAllowPreRelease(value: boolean) {
    await this.loaded
    this.#allowPreRelease = value
    setAllowPreRelease(value)
    await this.syncSettingsWithDB()
  }

  async setAllowBetaFirmware(value: boolean) {
    await this.loaded
    this.#allowBetaFirmware = value
    await this.syncSettingsWithDB()
  }

  async setAutoScanQr(value: boolean) {
    await this.loaded
    this.#autoScanQr = value
    await this.syncSettingsWithDB()
  }

  async updateBulkSettings({
    shouldAutoLaunch,
    shouldAutoStartBridge,
    shouldMinimizeToTray,
    shouldAutoUpdate,
    bridgeApiPort,
    allowPreRelease,
    allowBetaFirmware,
    autoScanQr,
  }: {
    shouldAutoLaunch?: boolean
    shouldAutoStartBridge?: boolean
    shouldMinimizeToTray?: boolean
    shouldAutoUpdate?: boolean
    bridgeApiPort?: number
    allowPreRelease?: boolean
    allowBetaFirmware?: boolean
    autoScanQr?: boolean
  }) {
    await this.loaded
    log.info(
      shouldAutoLaunch,
      shouldAutoStartBridge,
      shouldMinimizeToTray,
      shouldAutoUpdate,
      bridgeApiPort,
      allowPreRelease,
      allowBetaFirmware,
      autoScanQr,
    )
    if (shouldAutoLaunch !== undefined) this.#shouldAutoLaunch = shouldAutoLaunch
    if (shouldAutoStartBridge !== undefined) this.#shouldAutoStartBridge = shouldAutoStartBridge
    if (shouldMinimizeToTray !== undefined) this.#shouldMinimizeToTray = shouldMinimizeToTray
    if (shouldAutoUpdate !== undefined) this.#shouldAutoUpdate = shouldAutoUpdate
    if (bridgeApiPort !== undefined) this.#bridgeApiPort = bridgeApiPort
    if (allowPreRelease !== undefined) this.#allowPreRelease = allowPreRelease
    if (allowBetaFirmware !== undefined) this.#allowBetaFirmware = allowBetaFirmware
    if (autoScanQr !== undefined) this.#autoScanQr = autoScanQr
    await this.syncSettingsWithDB()
  }
}
