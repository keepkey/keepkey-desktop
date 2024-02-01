import type * as types from '../..'

export type Send = {
    from_address: types.cosmos.Address
    to_address: types.cosmos.Address
    amount: types.cosmos.Coins
}
