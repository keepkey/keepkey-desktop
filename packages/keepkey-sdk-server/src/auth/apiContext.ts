import type { BIP32Path } from '@shapeshiftoss/hdwallet-core'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { isEqual } from 'lodash'

import type { SdkClient } from './sdkClient'

const horribleAccountsHack = new WeakMap<KeepKeyHDWallet, Record<string, BIP32Path>>()

export class ApiContext {
  readonly sdkClient: SdkClient
  readonly wallet: KeepKeyHDWallet
  readonly accounts: Record<string, BIP32Path>

  protected constructor(sdkClient: SdkClient, accounts: Record<string, BIP32Path>) {
    this.sdkClient = sdkClient
    this.wallet = sdkClient.wallet
    this.accounts = accounts
  }

  static async create(sdkClient: SdkClient): Promise<ApiContext> {
    // TODO: something something database something
    if (!horribleAccountsHack.has(sdkClient.wallet)) {
      horribleAccountsHack.set(
        sdkClient.wallet,
        Object.fromEntries(
          await Promise.all(
            (
              await sdkClient.wallet.ethGetAccountPaths({
                coin: 'Ethereum',
                accountIdx: 0,
              })
            ).map(async x => [
              await sdkClient.wallet.ethGetAddress({
                addressNList: x.addressNList,
                showDisplay: false,
              }),
              x.addressNList,
            ]),
          ),
        ),
      )
    }

    return new ApiContext(sdkClient, horribleAccountsHack.get(sdkClient.wallet)!)
  }

  async getAccount(address: string): Promise<{
    addressNList: BIP32Path
    chainId: number
  }> {
    const out = this.accounts[address]
    if (!out) throw new Error('unrecognized address')
    return {
      addressNList: out,
      chainId: 0,
    }
  }

  async saveAccount(address: string, addressNList: BIP32Path): Promise<void> {
    if (address in this.accounts) {
      if (isEqual(this.accounts[address], addressNList)) return
      throw new Error('conflicting account entry already present')
    }
    this.accounts[address] = addressNList
    // TODO: something something database something
  }
}
