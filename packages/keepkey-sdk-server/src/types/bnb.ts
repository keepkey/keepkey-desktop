import type * as types from '.'

/**
 * a binance chain address
 * @minLength 10
 * @pattern ^bnb1[02-9ac-hj-np-z]{6,}$
 */
export type Address = types.Bech32 & unknown

export type Coin = {
  amount: types.numeric.U64
  /** @minLength 1 */
  denom: string
}

export type Msg = {
  inputs: types.bnb.msg.InputOutput[]
  outputs: types.bnb.msg.InputOutput[]
}

export namespace msg {
  export type InputOutput = {
    address: types.bnb.Address
    coins: types.bnb.Coin[]
  }
}

export type SignDoc = {
  account_number: types.decimal.U64
  /** @minLength 1 */
  chain_id: string
  sequence: types.decimal.U64
  source: types.decimal.U64
  memo: string
  /**
   * @minItems 1
   * @maxItems 1
   */
  msgs: types.bnb.Msg[]
}
