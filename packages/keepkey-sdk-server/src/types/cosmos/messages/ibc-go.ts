import type * as types from '../..'

export namespace transfer {
  export type Height = {
    revision_number: types.numeric.U64
    revision_height: types.numeric.U64
  }
}

export type Transfer = {
  source_port: string
  source_channel: string
  token: types.cosmos.Coin
  sender: types.cosmos.Address
  receiver: types.cosmos.Address
  timeout_height: types.cosmos.messages.ibcGo.transfer.Height
  timeout_timestamp: types.numeric.U64
  memo: string
}
