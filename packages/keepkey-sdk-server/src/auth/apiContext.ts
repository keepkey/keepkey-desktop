// @ts-ignore
import Pioneer from '@pioneer-platform/pioneer-client'
import type { BIP32Path } from '@keepkey/hdwallet-core'
import type { KeepKeyHDWallet } from '@keepkey/hdwallet-keepkey'
import { isEqual } from 'lodash'

// import { FailureType, isKKFailureType } from '../util'
import type { SdkClient } from './sdkClient'
const horribleAccountsHack = new WeakMap<KeepKeyHDWallet, Record<string, BIP32Path>>()

//@TODO get web3 providers

//serve web3 provider

//maintain network context from renderer selections

export class ApiContext {
  readonly sdkClient: SdkClient
  readonly wallet: KeepKeyHDWallet
  readonly db: any
  readonly accounts: Record<string, BIP32Path>
  readonly path: string
  api: Pioneer

  protected constructor(sdkClient: SdkClient, accounts: Record<string, BIP32Path>, path: string) {
    this.sdkClient = sdkClient
    this.wallet = sdkClient.wallet
    this.db = sdkClient.db
    this.accounts = accounts
    this.path = path
    this.api = new Pioneer('https://pioneers.dev/spec/swagger.json', { queryKey: 'kkdesktop:1' })
  }

  static async create(sdkClient: SdkClient, path: string): Promise<ApiContext> {
    // TODO: something something database something
    if (!horribleAccountsHack.has(sdkClient.wallet)) {
      horribleAccountsHack.set(sdkClient.wallet, {})
    }
    return new ApiContext(sdkClient, horribleAccountsHack.get(sdkClient.wallet) ?? {}, path)
  }

  async getAccount(address: string): Promise<{
    addressNList: BIP32Path
  }> {
    const out = this.accounts[address]
    if (!out) throw new Error('unrecognized address')
    return {
      addressNList: out,
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
