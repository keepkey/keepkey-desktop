import { Keyring } from '@shapeshiftoss/hdwallet-core'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import log from 'electron-log'
import { usb } from 'usb'

import { getAllFirmwareData, getFirmwareBaseUrl, getLatestFirmwareData } from './firmwareUtils'
import type { KeyringEventHandler, KKStateData, StateChangeHandler } from './types'
import { KKState } from './types'
import { initializeWallet } from './walletUtils'

/**
 * Keeps track of the last known state of the keepkey
 * sends ipc events to the web renderer on state change
 */

export type OnStateChange = (this: KKStateController, _: KKStateData) => Promise<void>
export type OnKeyringEvent = (this: KKStateController, _: unknown) => Promise<void>

export class KKStateController {
  public readonly keyring: Keyring
  public wallet?: KeepKeyHDWallet

  public data: KKStateData = { state: KKState.Disconnected }

  public readonly onStateChange: StateChangeHandler

  constructor(onStateChange: StateChangeHandler, onKeyringEvent: KeyringEventHandler) {
    log.info('KKStateController constructor')
    this.onStateChange = onStateChange.bind(this)

    this.keyring = new Keyring()
    this.keyring.onAny(async (e: unknown) => {
      await onKeyringEvent.call(this, e)
    })

    usb.on('attach', async e => {
      log.info('KKStateController attach')
      if (e.deviceDescriptor.idVendor !== 11044) return
      await this.updateState({ state: KKState.Plugin })
      await this.syncState()
    })
    usb.on('detach', async e => {
      log.info('KKStateController detach')
      if (e.deviceDescriptor.idVendor !== 11044) return
      await this.updateState({ state: KKState.Disconnected })
    })
  }

  private async updateState(data: KKStateData) {
    this.onStateChange(data)
    this.data = data
  }

  public async skipUpdate() {
    if (this.data.state === KKState.UpdateFirmware && this.data.bootloaderMode) {
      await this.updateState({ state: KKState.NeedsReconnect })
    }
    if (this.wallet && !(await this.wallet.isInitialized()))
      await this.updateState({ state: KKState.NeedsInitialize })
    else await this.updateState({ state: KKState.Connected })
  }

  public async syncState() {
    log.info('KKStateController syncState')
    const firmwareData = await getAllFirmwareData(await getFirmwareBaseUrl())
    const latestFirmware = await getLatestFirmwareData(firmwareData)
    console.log('latestFirmware', latestFirmware)
    const bootloaderHashes = firmwareData.hashes.bootloader
    console.log('bootloaderHashes', bootloaderHashes)

    const resultInit = await initializeWallet(this.keyring, bootloaderHashes).catch(async err => {
      log.warn('KKStateController HARDWARE_ERROR', err)
      await this.updateState({
        state: KKState.HardwareError,
        error: String(err),
      })
      return undefined
    })
    this.wallet = resultInit?.wallet
    if (!resultInit) return

    log.info('KKStateController resultInit: ', resultInit)
    if (!resultInit.wallet) {
      log.info('KKStateController resultInit.unplugged')
      await this.updateState({ state: KKState.Disconnected })
    } else if (resultInit.bootloaderVersion !== latestFirmware.bootloader.version) {
      log.info('KKStateController UPDATE_BOOTLOADER')
      await this.updateState({
        state: KKState.UpdateBootloader,
        firmware: resultInit.firmwareVersion ?? '',
        bootloader: resultInit.bootloaderVersion ?? '',
        recommendedBootloader: latestFirmware.bootloader.version,
        recommendedFirmware: latestFirmware.firmware.version,
        bootloaderMode: !!resultInit.bootloaderMode,
      })
    } else if (resultInit.firmwareVersion !== latestFirmware.firmware.version) {
      log.info('KKStateController UPDATE_FIRMWARE')
      log.info('KKStateController UPDATE_FIRMWARE resultInit: ', resultInit)
      await this.updateState({
        state: KKState.UpdateFirmware,
        firmware: !!resultInit.firmwareVersion ? resultInit.firmwareVersion : 'unknown',
        bootloader: resultInit.bootloaderVersion,
        recommendedBootloader: latestFirmware.bootloader.version,
        recommendedFirmware: latestFirmware.firmware.version,
        bootloaderMode: !!resultInit.bootloaderMode,
      })
    } else if (!resultInit.features.initialized) {
      log.info('KKStateController NEEDS_INITIALIZE')
      await this.updateState({ state: KKState.NeedsInitialize })
    } else {
      log.info('KKStateController CONNECTED')
      await this.updateState({ state: KKState.Connected })
    }
  }
}
