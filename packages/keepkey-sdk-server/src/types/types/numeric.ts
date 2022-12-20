import type * as types from '..'

export namespace UnsignedInteger {
  /**
   * @isLong
   * @minimum 0
   * @maximum 9007199254740991
   */
  export type Safe = number

  /**
   * Warning: while numeric values >= 2^53 are technically valid JSON, they are often deserialized incorrectly when parsed.
   * @isLong
   * @minimum 9007199254740991
   * @exclusiveMinimum true
   */
  export type Unsafe = number
}

export type UnsignedInteger =
  | types.numeric.UnsignedInteger.Safe
  | types.numeric.UnsignedInteger.Unsafe

/**
 * @isInt
 * @format uint8
 * @minimum 0
 * @maximum 255
 */
export type U8 = types.numeric.UnsignedInteger.Safe & unknown

/**
 * @isInt
 * @format uint16
 * @minimum 0
 * @maximum 65535
 */
export type U16 = types.numeric.UnsignedInteger.Safe & unknown

/**
 * @isInt
 * @format uint32
 * @minimum 0
 * @maximum 4294967295
 */
export type U32 = types.numeric.UnsignedInteger.Safe & unknown

/**
 * @isInt
 * @format uint64
 * @minimum 0
 * @maximum 18446744073709551615
 */
export type U64 = types.numeric.UnsignedInteger & unknown

/**
 * @isInt
 * @format uint128
 * @minimum 0
 * @maximum 340282366920938463463374607431768211455
 */
export type U128 = types.numeric.UnsignedInteger & unknown

/**
 * @isInt
 * @format uint256
 * @minimum 0
 * @maximum 1461501637330902918203684832716283019655932542975
 */
export type U160 = types.numeric.UnsignedInteger & unknown

/**
 * @isInt
 * @format uint256
 * @minimum 0
 * @maximum 115792089237316195423570985008687907853269984665640564039457584007913129639935
 */
export type U256 = types.numeric.UnsignedInteger & unknown
