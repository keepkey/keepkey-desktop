import { ipcMain } from 'electron'
import type { AddressInfo } from 'net'
import log from 'electron-log'
import { setAllowPreRelease } from '../updaterListeners'
import { db, kkAutoLauncher, server, tcpBridgeRunning } from '../globalState'
import { startTcpBridge, stopTcpBridge } from '../tcpBridge'

let instance: Settings

export class Settings {
  // don't allow user to change these two settings
  public shouldAutoStartBridge = true
  public bridgeApiPort = 1646

  public shouldAutoLunch = true
  public shouldMinimizeToTray = true
  public shouldAutoUpdate = true
  public allowPreRelease = false
  public allowBetaFirmware = false

  constructor() {
    if (instance) {
      throw new Error('Settings can only be initialized once')
    }
    instance = this

    ipcMain.on('@app/update-settings', (_event, data) => {
      this.updateBulkSettings(data)
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.on('@app/settings', (event, _data) => {
      event.sender.send('@app/settings', {
        shouldAutoLunch: this.shouldAutoLunch,
        shouldAutoStartBridge: this.shouldAutoStartBridge,
        shouldMinimizeToTray: this.shouldMinimizeToTray,
        shouldAutoUpdate: this.shouldAutoUpdate,
        bridgeApiPort: this.bridgeApiPort,
        allowPreRelease: this.allowPreRelease,
        allowBetaFirmware: this.allowBetaFirmware,
      })
    })
  }

  loadSettingsFromDb = () =>
    new Promise<Settings>(resolve => {
      db.findOne({ type: 'settings' }, async (_err, doc) => {
        if (!doc) {
          resolve(this)
          return this.syncSettingsWithDB()
        }

        if (
          doc.settings.shouldAutoLunch === undefined ||
          doc.settings.shouldAutoStartBridge === undefined ||
          doc.settings.shouldMinimizeToTray === undefined ||
          doc.settings.shouldAutoUpdate === undefined ||
          doc.settings.bridgeApiPort === undefined ||
          doc.settings.allowPreRelease === undefined ||
          doc.settings.allowBetaFirmware === undefined
        )
          await this.syncSettingsWithDB()

        this.shouldAutoLunch = doc.settings.shouldAutoLunch
        this.shouldAutoStartBridge = doc.settings.shouldAutoStartBridge
        this.shouldMinimizeToTray = doc.settings.shouldMinimizeToTray
        this.shouldAutoUpdate = doc.settings.shouldAutoUpdate
        this.bridgeApiPort = doc.settings.bridgeApiPort
        this.allowPreRelease = doc.settings.allowPreRelease
        this.allowBetaFirmware = doc.settings.allowBetaFirmware
        console.log('Saved settings: ', doc.settings)
        resolve(this)
      })
    })

  private syncSettingsWithDB = () =>
    new Promise<void>(resolve => {
      db.findOne({ type: 'settings' }, (_err, doc) => {
        if (!doc)
          return db.insert({
            type: 'settings',
            settings: {
              shouldAutoLunch: this.shouldAutoLunch,
              shouldAutoStartBridge: this.shouldAutoStartBridge,
              shouldMinimizeToTray: this.shouldMinimizeToTray,
              shouldAutoUpdate: this.shouldAutoUpdate,
              bridgeApiPort: this.bridgeApiPort,
              allowPreRelease: this.allowPreRelease,
              allowBetaFirmware: this.allowBetaFirmware,
            },
          })

        db.update(
          { type: 'settings' },
          {
            type: 'settings',
            settings: {
              shouldAutoLunch: this.shouldAutoLunch,
              shouldAutoStartBridge: this.shouldAutoStartBridge,
              shouldMinimizeToTray: this.shouldMinimizeToTray,
              shouldAutoUpdate: this.shouldAutoUpdate,
              bridgeApiPort: this.bridgeApiPort,
              allowPreRelease: this.allowPreRelease,
              allowBetaFirmware: this.allowBetaFirmware,
            },
          },
        )
        resolve()
      })
    })

  setShouldAutoLunch(value: boolean, bulk = false) {
    this.shouldAutoLunch = value
    kkAutoLauncher.isEnabled().then(autoLaunch => {
      if (autoLaunch && value) return
      if (!autoLaunch && value) return kkAutoLauncher.enable()
      if (!autoLaunch && !value) return kkAutoLauncher.disable()
    })
    if (!bulk) this.syncSettingsWithDB()
  }

  setShouldAutoStartBridge(value: boolean, bulk = false) {
    this.shouldAutoStartBridge = value
    if (!bulk) this.syncSettingsWithDB()
  }

  setShouldMinimizeToTray(value: boolean, bulk = false) {
    this.shouldMinimizeToTray = value
    if (!bulk) this.syncSettingsWithDB()
  }

  setShouldAutoUpdate(value: boolean, bulk = false) {
    this.shouldAutoUpdate = value
    if (!bulk) this.syncSettingsWithDB()
  }

  async setBridgeApiPort(value: number, bulk = false) {
    this.bridgeApiPort = value
    if (tcpBridgeRunning) {
      const address = server.address() as AddressInfo
      if (address.port !== value) {
        await stopTcpBridge()
        await startTcpBridge(value)
      }
    }
    if (!bulk) this.syncSettingsWithDB()
  }

  setAllowPreRelease(value: boolean, bulk = false) {
    this.allowPreRelease = value
    setAllowPreRelease(value)
    if (!bulk) this.syncSettingsWithDB()
  }

  setAllowBetaFirmware(value: boolean, bulk = false) {
    this.allowBetaFirmware = value
    if (!bulk) this.syncSettingsWithDB()
  }

  updateBulkSettings({
    shouldAutoLunch,
    shouldAutoStartBridge,
    shouldMinimizeToTray,
    shouldAutoUpdate,
    bridgeApiPort,
    allowPreRelease,
    allowBetaFirmware,
  }: {
    shouldAutoLunch?: boolean
    shouldAutoStartBridge?: boolean
    shouldMinimizeToTray?: boolean
    shouldAutoUpdate?: boolean
    bridgeApiPort?: number
    allowPreRelease?: boolean
    allowBetaFirmware?: boolean
  }) {
    log.info(
      shouldAutoLunch,
      shouldAutoStartBridge,
      shouldMinimizeToTray,
      shouldAutoUpdate,
      bridgeApiPort,
      allowPreRelease,
      allowBetaFirmware,
    )
    if (shouldAutoLunch !== undefined) this.setShouldAutoLunch(shouldAutoLunch, true)
    if (shouldAutoStartBridge !== undefined)
      this.setShouldAutoStartBridge(shouldAutoStartBridge, true)
    if (shouldMinimizeToTray !== undefined) this.setShouldMinimizeToTray(shouldMinimizeToTray, true)
    if (shouldAutoUpdate !== undefined) this.setShouldAutoUpdate(shouldAutoUpdate, true)
    if (bridgeApiPort !== undefined) this.setBridgeApiPort(bridgeApiPort, true)
    if (allowPreRelease !== undefined) this.setAllowPreRelease(allowPreRelease, true)
    if (allowBetaFirmware !== undefined) this.setAllowBetaFirmware(allowBetaFirmware, true)
    this.syncSettingsWithDB()
  }
}
