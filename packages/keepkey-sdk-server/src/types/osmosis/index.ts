import type * as types from '..'


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
        timeout_timestamp: types.numeric.U64
        memo: string
    }
}

export type Route = {
    pool_id: string
    token_out_denom: string
}

export type StdTxMsgSwap = {
    type: 'osmosis/gamm/swap-exact-amount-in'
    value:{
        routes: Route[]
        sender: types.cosmos.Address
        token_in: types.cosmos.Coin
        token_out_min_amount: string
    }
}

export type StdTxMsgLPRemove = {
    type: 'osmosis/gamm/exit-pool'
    value:{
        pool_id: string
        sender: types.cosmos.Address
        share_in_amount: string
        token_out_mins: types.cosmos.Coin[]
    }
}

export type StdTxMsgLPAdd = {
    type: 'osmosis/gamm/join-pool'
    value:{
        pool_id: string
        sender: types.cosmos.Address
        share_out_amount: string
        token_in_maxs: types.cosmos.Coin[]
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

export type SignDocSwap = {
    account_number: string
    /** @minLength 1 */
    chain_id: string
    sequence: types.decimal.U64
    memo: string
    /**
     * @minItems 1
     * @maxItems 1
     */
    msgs: (StdTxMsgSwap)[],
    fee: {
        amount: types.cosmos.Coins
        gas: types.decimal.U64
    }
}

export type SignDocLPRemove = {
    account_number: string
    /** @minLength 1 */
    chain_id: string
    sequence: types.decimal.U64
    memo: string
    /**
     * @minItems 1
     * @maxItems 1
     */
    msgs: (StdTxMsgLPRemove)[],
    fee: {
        amount: types.cosmos.Coins
        gas: types.decimal.U64
    }
}

export type SignDocLPAdd = {
    account_number: string
    /** @minLength 1 */
    chain_id: string
    sequence: types.decimal.U64
    memo: string
    /**
     * @minItems 1
     * @maxItems 1
     */
    msgs: (StdTxMsgLPAdd)[],
    fee: {
        amount: types.cosmos.Coins
        gas: types.decimal.U64
    }
}