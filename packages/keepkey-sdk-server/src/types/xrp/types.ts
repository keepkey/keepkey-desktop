import type * as types from '..'

export namespace hex {
  export type Blob = types.hex.bytes.Upper

  /**
   * uppercase hexadecimal encoding of an ASCII string containing only URL-safe characters
   * @pattern ^(?:2[13-9A-F]|3[0-9ABDF]|4[0-9A-F]|5[0-9ABDF]|6[1-9A-F]|7[0-9AE])*$
   */
  export type Memo = types.hex.bytes.Upper & unknown

  /**
   * @minLength 66
   * @maxLength 66
   */
  export type PubKey = types.hex.bytes.Upper
}

/**
 * - `0x00` prefix followed by 20 bytes
 * - base58check with the XRP dictionary (`rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz`)
 * @title an XRP address
 * @minLength 25
 * @maxLength 35
 * @pattern ^r[1-9A-HJ-NPZa-km-z]{24,34}$
 * @format base58check_xrp
 */
export type Address = string

// TODO: oneOf
export type CurrencyAmount = types.xrp.XrpAmount | types.xrp.TokenAmount

// TODO: oneOf
/** an XRP currency code */
export type CurrencyCode = types.xrp.currencyCode.Standard | types.xrp.currencyCode.Nonstandard

export namespace currencyCode {
  /**
   * - 3-character ASCII string
   * - alphanumeric characters and `!`, `#`, `-`, `&`, `(`, `-`, `*`, `<`, `>`, `-`, `@`, `[`, `]`, `^`, `{`, `|`, and `}`
   * - `XRP` disallowed
   * @title Standard Currency Code
   * @minLength 3
   * @maxLength 3
   * @pattern ^[0-9A-WYZa-z!#-&(-*<>-@[\]^{|}][0-9A-Za-z!#-&(-*<>-@[\]^{|}]{2}|X[0-9A-QS-Za-z!#-&(-*<>-@[\]^{|}][0-9A-Za-z!#-&(-*<>-@[\]^{|}]|XR[0-9A-OQ-Za-z!#-&(-*<>-@[\]^{|}]$
   */
  export type Standard = string

  /**
   * - uppercase hex
   * - 20 bytes
   * - first byte not 0x00
   * @title Nonstandard Currency Code
   * @minLength 40
   * @maxLength 40
   * @pattern ^(?:[0-9A-F][1-9A-F]|[1-9A-F][0-9A-F])(?:[0-9A-F]{2}){19}$
   */
  export type Nonstandard = types.hex.bytes.Upper & unknown
}

/**
 * @minLength 64
 * @maxLength 64
 */
export type Hash256 = types.hex.bytes.Upper & unknown

export type PathSet = types.xrp.Path[]

export type Path = types.xrp.Step[]

/**
 * - secp256k1 signature in r/s form
 * - 64 bytes, uppercase hex
 * @title a secp256k1 signature
 * @minLength 128
 * @maxLength 128
 */
export type Signature = types.hex.bytes.Upper & unknown

// TODO: oneOf
export type Step =
  | types.xrp.step.ChangeAddress
  | types.xrp.step.ChangeCurrency
  | types.xrp.step.ChangeIssuer

export namespace step {
  /** @title Change address */
  export type ChangeAddress = {
    account: types.xrp.Address
    currency?: null
    issuer?: null
  }
  export namespace changeCurrency {
    /** @title XRP */
    export type Xrp = {
      account?: null
      currency: 'XRP'
      issuer?: null
    }
    /** @title Token */
    export type Token = {
      account?: null
      currency: types.xrp.CurrencyAmount
      issuer?: types.xrp.Address
    }
  }
  /** @title Change currency */
  export type ChangeCurrency =
    | types.xrp.step.changeCurrency.Xrp
    | types.xrp.step.changeCurrency.Token
  /** @title Change issuer */
  export type ChangeIssuer = {
    account?: null
    currency?: null
    issuer: types.xrp.Address
  }
}

/**
 * Minimal signed decimal encoding. Fractional part and signed exponent allowed. ("E" separator is case-insensitive.)
 * @minLength 1
 * @pattern ^(?:0|-?[1-9]\d*(?:\.\d*[1-9])?(?:[Ee]-?[1-9]\d*)?)$
 * @format xrp_number
 */
export type StringNumber = string & unknown

/**
 * @title an amount of tokens
 */
export type TokenAmount = {
  value: types.xrp.StringNumber
  currency: types.xrp.CurrencyCode
  issuer: types.xrp.Address
}

/**
 * - whole number of drops
 * - unsigned decimal integer
 * - <= 10^17
 * @title an amount of XRP
 * @minLength 1
 * @maxLength 18
 * @pattern ^(?:0|[1-9]\d{0,16}|100000000000000000)$
 * @format uint64
 */
export type XrpAmount = string & unknown
