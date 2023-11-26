import * as Messages from '@keepkey/device-protocol/lib/messages_pb'
import * as core from '@shapeshiftoss/hdwallet-core'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { assume } from 'common-utils'
import log from 'electron-log'
import { usb } from 'usb'

import { getAllFirmwareData, getFirmwareBaseUrl, getLatestFirmwareData } from './firmwareUtils'
import type {
  KeyringEventHandler,
  KKStateData,
  StateChangeHandler,
  TransportEventHandler,
} from './types'
import { KKState } from './types'
import { initializeWallet } from './walletUtils'

const semver = require('semver')

/**
 * Keeps track of the last known state of the keepkey
 * sends ipc events to the web renderer on state change
 */

export type OnStateChange = (
  this: KKStateController,
  ...args: Parameters<StateChangeHandler>
) => ReturnType<StateChangeHandler>
export type OnKeyringEvent = (
  this: KKStateController,
  ...args: Parameters<KeyringEventHandler>
) => ReturnType<KeyringEventHandler>
export type OnTransportEvent = (
  this: KKStateController,
  ...args: Parameters<TransportEventHandler>
) => ReturnType<TransportEventHandler>

export class KKStateController {
  public readonly keyring = new core.Keyring()

  #wallet: KeepKeyHDWallet | undefined = undefined
  get wallet() {
    return this.#wallet
  }
  set wallet(value: KeepKeyHDWallet | undefined) {
    if (this.#wallet) {
      this.#wallet.transport.offAny(this.#onTransportEvent)
    }
    if (value) {
      value.transport.onAny(this.#onTransportEvent)
    }
    this.#wallet = value
  }

  public data: KKStateData = { state: KKState.Disconnected }

  public readonly onStateChange: StateChangeHandler
  public readonly onKeyringEvent: KeyringEventHandler
  public readonly onTransportEvent: TransportEventHandler
  readonly #onTransportEvent = (_: unknown, e: core.Event) => {
    this.onTransportEvent(e)
  }

  constructor(
    onStateChange: OnStateChange,
    onKeyringEvent: OnKeyringEvent,
    onTransportEvent: OnTransportEvent,
  ) {
    log.info('KKStateController constructor')
    this.onStateChange = onStateChange.bind(this)
    this.onKeyringEvent = onKeyringEvent.bind(this)
    this.onTransportEvent = onTransportEvent.bind(this)

    this.keyring.onAny(async (e: unknown) => {
      assume<[vendor: string, deviceId: string, event: string]>(e)
      await onKeyringEvent.call(this, e[0], e[1], e[2])
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

  public async forceReconnect() {
    await this.updateState({ state: KKState.NeedsReconnect })
  }

  public async skipUpdate() {
    console.log('skip update data', this.data)
    if (this.data.state === KKState.UpdateFirmware && this.data.bootloaderMode) {
      return await this.updateState({ state: KKState.NeedsReconnect })
    }
    if (this.data.state === KKState.NeedsReconnect)
      return await this.updateState({ state: KKState.NeedsReconnect })
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
      log.warn('KKStateController HARDWARE_ERROR :(', err)
      await this.updateState({
        state: KKState.HardwareError,
        error: String(err),
      })
      return undefined
    })
    console.log("resultInit: ", resultInit)
    this.wallet = resultInit?.wallet
    if (!resultInit) return

    log.info('KKStateController resultInit: ', resultInit)
    if (!resultInit.firmwareVersion) resultInit.firmwareVersion = '0.0.0'

    if (!resultInit.wallet) {
      log.info('KKStateController resultInit.unplugged')
      await this.updateState({ state: KKState.Disconnected })
    } else if (
      resultInit.bootloaderVersion !== latestFirmware.bootloader.version &&
      semver.lt(resultInit.bootloaderVersion, latestFirmware.bootloader.version)
    ) {
      log.info('KKStateController UPDATE_BOOTLOADER')
      await this.updateState({
        state: KKState.UpdateBootloader,
        firmware: resultInit.firmwareVersion ?? '',
        bootloader: resultInit.bootloaderVersion ?? '',
        recommendedBootloader: latestFirmware.bootloader.version,
        recommendedFirmware: latestFirmware.firmware.version,
        bootloaderMode: !!resultInit.bootloaderMode,
      })
    } else if (
      resultInit.firmwareVersion !== latestFirmware.firmware.version &&
      semver.lt(resultInit.firmwareVersion, latestFirmware.firmware.version)
    ) {
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

  async nextButtonRequestFinished() {
    if (!this.wallet) return
    const transport = this.wallet!.transport

    return await new Promise<void>(resolve => {
      transport.once(String(Messages.MessageType.MESSAGETYPE_BUTTONACK), () => {
        const listener = () => {
          resolve()
          transport.offAny(listener)
        }
        transport.onAny(listener)
      })
    })
  }
}
