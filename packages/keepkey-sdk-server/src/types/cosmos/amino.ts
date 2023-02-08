import type * as types from '..'

// TODO: /// @discriminator type
export type Any = {
  type: string
  value: { [_: string]: unknown }
}

export type SignDoc = {
  account_number: types.decimal.U64
  /** @minLength 1 */
  chain_id: string
  sequence: types.decimal.U64
  memo: string
  /**
   * @minItems 1
   * @maxItems 1
   */
  msgs: (
    | types.cosmos.amino.signDoc.CosmosSdkSend
    | types.cosmos.amino.signDoc.CosmosSdkDelegate
    | types.cosmos.amino.signDoc.CosmosSdkUndelegate
    | types.cosmos.amino.signDoc.CosmosSdkBeginRedelegate
    | types.cosmos.amino.signDoc.CosmosSdkWithdrawDelegationReward
    | types.cosmos.amino.signDoc.IbcGoTransfer
    | types.cosmos.amino.signDoc.ThornodeSend
  )[]
  fee: {
    amount: types.cosmos.Coins
    gas: types.decimal.U64
  }
}

export namespace signDoc {
  export type CosmosSdkSend = types.cosmos.amino.Any & {
    type: 'cosmos-sdk/MsgSend'
    /** cosmos-sdk/MsgSend */
    value: types.cosmos.messages.cosmosSdk.Send & unknown
  }

  export type CosmosSdkDelegate = types.cosmos.amino.Any & {
    type: 'cosmos-sdk/MsgDelegate'
    /** cosmos-sdk/MsgDelegate */
    value: types.cosmos.messages.cosmosSdk.Delegate & unknown
  }

  export type CosmosSdkUndelegate = types.cosmos.amino.Any & {
    type: 'cosmos-sdk/MsgUndelegate'
    /** cosmos-sdk/MsgUndelegate */
    value: types.cosmos.messages.cosmosSdk.Undelegate & unknown
  }

  export type CosmosSdkBeginRedelegate = types.cosmos.amino.Any & {
    type: 'cosmos-sdk/MsgBeginRedelegate'
    /** cosmos-sdk/MsgBeginRedelegate */
    value: types.cosmos.messages.cosmosSdk.Undelegate & unknown
  }

  export type CosmosSdkWithdrawDelegationReward = types.cosmos.amino.Any & {
    type: 'cosmos-sdk/MsgWithdrawDelegationReward'
    /** cosmos-sdk/MsgWithdrawDelegationReward */
    value: types.cosmos.messages.cosmosSdk.WithdrawDelegatorReward & unknown
  }

  export type IbcGoTransfer = types.cosmos.amino.Any & {
    type: 'cosmos-sdk/MsgTransfer'
    /** cosmos-sdk/MsgTransfer */
    value: types.cosmos.messages.ibcGo.Transfer & unknown
  }

  export type ThornodeSend = types.cosmos.amino.Any & {
    type: 'thorchain/MsgSend'
    /** thorchain/MsgSend */
    value: types.cosmos.messages.thornode.Send & unknown
  }
}
