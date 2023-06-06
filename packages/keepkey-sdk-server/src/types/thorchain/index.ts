import type * as types from '..'

export type Coin = {
  amount: types.cosmos.Int
  /** @minLength 1 */
  denom: string
}

export type StdTxDeposit = {
  type: 'thorchain/MsgDeposit'
  value: {
    coins: Coin
    memo: string
    signer: string
  }
}

export type SignDocDeposit = {
  account_number: string
  /** @minLength 1 */
  chain_id: string
  sequence: types.decimal.U64
  memo: string
  /**
   * @minItems 1
   * @maxItems 1
   */
  msgs: StdTxDeposit[]
  fee: {
    amount: types.cosmos.Coins
    gas: types.decimal.U64
  }
}

export type StdTxTransfer = {
  type: 'thorchain/MsgSend'
  value: {
    amount: Coin
    from_address: string
    to_address: string
  }
}

export type SignDocTransfer = {
  account_number: string
  /** @minLength 1 */
  chain_id: string
  sequence: types.decimal.U64
  memo: string
  /**
   * @minItems 1
   * @maxItems 1
   */
  msgs: StdTxTransfer[]
  fee: {
    amount: types.cosmos.Coins
    gas: types.decimal.U64
  }
}
