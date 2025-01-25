// @ts-ignore
import Pioneer from '@pioneer-platform/pioneer-client'
import type { BIP32Path } from '@keepkey/hdwallet-core'
import type { KeepKeyHDWallet } from '@keepkey/hdwallet-keepkey'
import { isEqual } from 'lodash'

// import { FailureType, isKKFailureType } from '../util'
import type { SdkClient } from './sdkClient'
const horribleAccountsHack = new WeakMap<KeepKeyHDWallet, Record<string, BIP32Path>>()

// @ts-ignore
// import sqlite3 from 'sqlite3'

export class ApiContext {
  readonly sdkClient: SdkClient
  readonly wallet: KeepKeyHDWallet
  readonly db: any
  readonly accounts: Record<string, BIP32Path>
  readonly path: string
  api: Pioneer
  sql: any

  protected constructor(sdkClient: SdkClient, accounts: Record<string, BIP32Path>, path: string) {
    this.sdkClient = sdkClient
    this.wallet = sdkClient.wallet
    this.db = sdkClient.db
    this.accounts = accounts
    this.path = path
    this.api = new Pioneer('https://pioneers.dev/spec/swagger.json', { queryKey: 'kkdesktop:1' })

    // // Use the callback signature (err: Error | null) => void
    // this.sql = new sqlite3.Database('./keepkey-vault.sqlite3', (err: Error | null) => {
    //   if (err) {
    //     console.error('Failed to connect to SQLite database:', err.message)
    //   }
    // })
    //
    // // Create a table if it doesn't exist yet
    // this.sql.run(
    //     `
    //     CREATE TABLE IF NOT EXISTS accounts (
    //       address TEXT PRIMARY KEY,
    //       addressNList TEXT NOT NULL
    //     )
    //   `,
    //     (err: Error | null) => {
    //       if (err) {
    //         console.error('Failed to create accounts table:', err.message)
    //       }
    //     }
    // )
  }

  static async create(sdkClient: SdkClient, path: string): Promise<ApiContext> {
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
  }
}
