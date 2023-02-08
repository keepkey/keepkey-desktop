import type * as types from '.'

/**
 * @minLength 3
 * @pattern ^0x(?:0|[1-9a-f][0-9a-f]*)$
 * @format eth_quantity
 */
export type HexQuantity = string

/**
 * 0x-prefixed hexadecimal octet string. (The empty string is `0x`.)
 * @minLength 2
 * @pattern ^0x(?:[0-9a-f]{2})*$
 * @format eth_data
 */
export type HexData = string

/**
 * an ethereum address, possibly checksummed
 * @minLength 42
 * @maxLength 42
 * @pattern ^0x(?:[0-9a-fA-F]{2}){20}$
 * @format eth_data
 */
export type Address = string

/**
 * a 65-byte secp256k1 signature, in 0x-prefixed r/s/v format
 * @minLength 132
 * @maxLength 132
 * @pattern ^0x(?:[0-9a-f]{2}){65}$
 */
export type Signature = types.eth.HexData & unknown

export type TypedData = {
  types: {
    EIP712Domain: types.eth.typedData.NamedType[]
    [_: string]: types.eth.typedData.NamedType[]
  }
  primaryType: string
  domain: { [_: string]: unknown }
  message: { [_: string]: unknown }
}

export namespace typedData {
  export type NamedType = {
    name: string
    type: string
  }
}
