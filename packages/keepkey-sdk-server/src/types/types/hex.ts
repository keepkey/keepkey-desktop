import type * as types from '..'

export namespace bytes {
  /**
   * @pattern ^(?:[0-9a-f]{2})*$
   */
  export type Lower = types.hex.Bytes & unknown

  /**
   * @pattern ^(?:[0-9A-F]{2})*$
   */
  export type Upper = types.hex.Bytes & unknown
}

/**
 * @pattern ^(?:[0-9a-fA-F]{2})*$
 * @contentEncoding base16
 */
export type Bytes = string

export namespace secp256k1 {
  export namespace pubkey {
    /**
     * @minLength 130
     * @maxLength 130
     * @pattern ^(?:02|03)(?:[0-9a-f]{2}){64}
     */
    export type Compressed = types.hex.bytes.Lower & unknown
  }

  /**
   * - secp256k1 signature in r/s form
   * - 64 bytes, lowercase hex
   * @title a secp256k1 signature
   * @minLength 128
   * @maxLength 128
   */
  export type Signature = types.hex.bytes.Lower & unknown
}
