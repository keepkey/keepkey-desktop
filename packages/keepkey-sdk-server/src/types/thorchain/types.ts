import type * as types from '..'

export namespace account {
  export type Secp256k1 = {
    algo: 'secp256k1'
    address: types.cosmos.Address
    pubkey: types.hex.secp256k1.pubkey.Compressed
  }
}

// TODO: /// @discriminator algo
export type Account = types.cosmos.account.Secp256k1

export type Address = types.Bech32

export type Coin = {
  amount: types.cosmos.Int
  /** @minLength 1 */
  denom: string
}

export type Coins = types.cosmos.Coin[]

export type Int = types.decimal.U256
