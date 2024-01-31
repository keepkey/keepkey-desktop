import * as core from '@keepkey/hdwallet-core'

import type { KeepKeySdk } from './kkrest'
import { KeepKeyRestHDWallet } from './kkrest'

export class KkRestAdapter {
  keyring: core.Keyring

  // wallet id to remove from the keyring when the active wallet changes
  currentDeviceID?: string

  private constructor(keyring: core.Keyring) {
    this.keyring = keyring
  }

  public static useKeyring(keyring: core.Keyring) {
    return new KkRestAdapter(keyring)
  }

  public async initialize(): Promise<number> {
    return Object.keys(this.keyring.wallets).length
  }

  public async pairDevice(sdk: KeepKeySdk): Promise<core.HDWallet> {
    const wallet = await KeepKeyRestHDWallet.create(sdk)
    await wallet.initialize()
    const deviceID = await wallet.getDeviceID()
    this.keyring.add(wallet, deviceID)
    this.currentDeviceID = deviceID
    this.keyring.emit(['kkrest', deviceID, core.Events.CONNECT], deviceID)
    return wallet
  }
}
