import type * as types from '../..'

export type BeginRedelegate = {
  delegator_address: types.cosmos.Address
  validator_src_address: types.cosmos.Address
  validator_dst_address: types.cosmos.Address
  amount: types.cosmos.Coin
}

export type Delegate = {
  delegator_address: types.cosmos.Address
  validator_address: types.cosmos.Address
  amount: types.cosmos.Coin
}

export type Send = {
  from_address: types.cosmos.Address
  to_address: types.cosmos.Address
  amount: types.cosmos.Coins
}

export type Undelegate = {
  delegator_address: types.cosmos.Address
  validator_address: types.cosmos.Address
  amount: types.cosmos.Coin
}

export type WithdrawDelegatorReward = {
  delegator_address: types.cosmos.Address
  validator_address: types.cosmos.Address
}
