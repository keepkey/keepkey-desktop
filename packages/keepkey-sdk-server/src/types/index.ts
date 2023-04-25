import type * as types from '.'

export * as bnb from './bnb'
export * as cosmos from './cosmos'
export * as osmosis from './osmosis'
export * as eth from './eth'
export * from './types'
export * as xrp from './xrp'

/**
 * a BIP-32 path, expressed as a list of node indexes
 * @minItems 3
 * @maxItems 5
 */
export type AddressNList = types.numeric.U32[]

/** an entry in the device's Coins table */
export type Coin = {
  coin_name?: string
  coin_shortcut?: string
  address_type?: types.numeric.U32
  maxfee_kb?: types.numeric.U64
  address_type_p2sh?: types.numeric.U32
  signed_message_header?: string
  bip44_account_path?: types.numeric.U32
  forkid?: types.numeric.U32
  decimals?: types.numeric.U32
  contract_address?: types.hex.bytes.Lower
  xpub_magic?: types.numeric.U32
  segwit?: boolean
  force_bip143?: boolean
  curve_name?: string
  cashaddr_prefix?: string
  bech32_prefix?: string
  decred?: boolean
  xpub_magic_segwit_p2sh?: types.numeric.U32
  xpub_magic_segwit_native?: types.numeric.U32
  nanoaddr_prefix?: string
}

export type Features = {
  /** name of the manufacturer */
  vendor?: string
  /** major version of the device */
  major_version?: types.numeric.U32 & unknown
  /** minor version of the device */
  minor_version?: types.numeric.U32 & unknown
  /** patch version of the device */
  patch_version?: types.numeric.U32 & unknown
  /** is device in bootloader mode? */
  bootloader_mode?: boolean
  /** device's unique identifier */
  device_id?: string
  /** is device protected by PIN? */
  pin_protection?: boolean
  /** is node/mnemonic encrypted using passphrase? */
  passphrase_protection?: boolean
  /** device language */
  language?: string
  /** device description label */
  label?: string
  /** does device contain seed? */
  initialized?: boolean
  /** SCM revision of firmware */
  revision?: types.hex.bytes.Lower & unknown
  /**
   * double sha256 hash of the bootloader
   * @minLength 64
   * @maxLength 64
   */
  bootloader_hash?: types.hex.bytes.Lower & unknown
  /** was storage imported from an external source? */
  imported?: boolean
  /** is PIN already cached in session? */
  pin_cached?: boolean
  /** is passphrase already cached in session? */
  passphrase_cached?: boolean
  policies?: types.Policy[]
  /** device hardware model */
  model?: string
  /** Firmware variant */
  firmware_variant?: string
  /**
   * double sha256 hash of the firmware
   * @minLength 64
   * @maxLength 64
   */
  firmware_hash?: types.hex.bytes.Lower & unknown
  /** Device was initialized without displaying recovery sentence. */
  no_backup?: boolean
  wipe_code_protection?: boolean
  /** Current auto lock delay (in milliseconds) */
  auto_lock_delay_ms?: types.numeric.U32 & unknown
}

export type HDNode = {
  depth: types.numeric.U32
  fingerprint: types.numeric.U32
  child_num: types.numeric.U32
  chain_code: types.hex.bytes.Lower
  private_key?: types.hex.bytes.Lower
  public_key?: types.hex.bytes.Lower
}

export type Policy = {
  policy_name: string
  enabled: boolean
}
