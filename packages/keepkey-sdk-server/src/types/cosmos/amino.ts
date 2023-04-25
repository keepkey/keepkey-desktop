import type * as types from '..'

// TODO: /// @discriminator type
export type Any = {
  type: string
  value: { [_: string]: unknown }
}

export type SignDoc = {
  account_number: string
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
    | StdTxDelegate
  )[]
  fee: {
    amount: types.cosmos.Coins
    gas: types.decimal.U64
  }
}

export type StdTxDelegate = {
  type: 'cosmos-sdk/MsgDelegate'
  value:{
    delegator_address: types.cosmos.Address
    validator_address: types.cosmos.Address
    amount: any  
  }
}

export type StdTxUnDelegate = {
  type: 'cosmos-sdk/MsgUndelegate'
  value:{
    delegator_address: types.cosmos.Address
    validator_address: types.cosmos.Address
    amount: any
  }
}

export type StdTxBeginReDelegate = {
  type: 'cosmos-sdk/MsgBeginRedelegate'
  value:{
    delegator_address: types.cosmos.Address
    validator_src_address: types.cosmos.Address
    validator_dst_address: types.cosmos.Address
    amount: any
  }
}

export type StdTxWithdrawDelegationReward = {
  type: 'cosmos-sdk/MsgWithdrawDelegationReward'
  value:{
    delegator_address: types.cosmos.Address
    validator_address: types.cosmos.Address
  }
}

export type StdTxMsgTransfer = {
  type: 'cosmos-sdk/MsgTransfer'
  value:{
    source_port: string
    source_channel: string
    token: types.cosmos.Coin
    sender: types.cosmos.Address
    receiver: types.cosmos.Address
    timeout_height: types.cosmos.messages.ibcGo.transfer.Height
    memo?: string
  }
}

export type SignDocDelegate = {
  account_number: string
  /** @minLength 1 */
  chain_id: string
  sequence: types.decimal.U64
  memo: string
  /**
   * @minItems 1
   * @maxItems 1
   */
  msgs: (StdTxDelegate)[],
  fee: {
    amount: types.cosmos.Coins
    gas: types.decimal.U64
  }
}

export type SignDocUnDelegate = {
  account_number: string
  /** @minLength 1 */
  chain_id: string
  sequence: types.decimal.U64
  memo: string
  /**
   * @minItems 1
   * @maxItems 1
   */
  msgs: (StdTxUnDelegate)[],
  fee: {
    amount: types.cosmos.Coins
    gas: types.decimal.U64
  }
}

export type SignDocBeginReDelegate = {
  account_number: string
  /** @minLength 1 */
  chain_id: string
  sequence: types.decimal.U64
  memo: string
  /**
   * @minItems 1
   * @maxItems 1
   */
  msgs: (StdTxBeginReDelegate)[],
  fee: {
    amount: types.cosmos.Coins
    gas: types.decimal.U64
  }
}

export type SignDocWithdrawDelegationReward = {
  account_number: string
  /** @minLength 1 */
  chain_id: string
  sequence: types.decimal.U64
  memo: string
  /**
   * @minItems 1
   * @maxItems 1
   */
  msgs: (StdTxWithdrawDelegationReward)[],
  fee: {
    amount: types.cosmos.Coins
    gas: types.decimal.U64
  }
}

export type SignDocIbcGoTransfer = {
  account_number: string
  /** @minLength 1 */
  chain_id: string
  sequence: types.decimal.U64
  memo: string
  /**
   * @minItems 1
   * @maxItems 1
   */
  msgs: (StdTxMsgTransfer)[],
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

  export type CosmosSdkDelegate = {
    type: 'cosmos-sdk/MsgDelegate'
    /** cosmos-sdk/MsgDelegate */
    value: any
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
