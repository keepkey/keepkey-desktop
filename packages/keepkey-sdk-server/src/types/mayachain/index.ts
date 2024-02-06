import type * as types from '..'

export type Coin = {
  amount: string
  /** @minLength 1 */
  denom: string
}

export type StdTxDepositMaya = {
  type: 'mayachain/MsgDeposit'
  value: {
    coins: any
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
  msgs: StdTxDepositMaya[]
  fee: {
    amount: any
    gas: types.decimal.U64
  }
}

export type StdTxTransferMaya = {
  type: 'mayachain/MsgSend'
  value: {
    amount: {
      amount: string
      denom: string
    }[]
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
  msgs: StdTxTransferMaya[]
  fee: {
    amount: {
      amount: string
      denom: string
    }[]
    gas: types.decimal.U64
  }
}
