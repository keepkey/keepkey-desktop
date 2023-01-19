import type { KeepKeySdk } from '@keepkey/keepkey-sdk'
import type { HDWallet } from '@shapeshiftoss/hdwallet-core'
import type { Deferred } from 'common-utils'

import type { PinMatrixRequestType } from './KeepKey/KeepKeyTypes'
import type { KeyManager } from './KeyManager'
import type { Adapters, InitialState, WalletConnectApp, WalletInfo } from './WalletProvider'
import type { DeviceState } from './WalletProvider'

export enum WalletActions {
  SET_ADAPTERS = 'SET_ADAPTERS',
  SET_WALLET = 'SET_WALLET',
  SET_CONNECTOR_TYPE = 'SET_CONNECTOR_TYPE',
  CLEAR_MODAL_CACHE = 'CLEAR_MODAL_CACHE',
  SET_INITIAL_ROUTE = 'SET_INITIAL_ROUTE',
  SET_IS_CONNECTED = 'SET_IS_CONNECTED',
  SET_PROVIDER = 'SET_PROVIDER',
  SET_IS_LOCKED = 'SET_IS_LOCKED',
  SET_WALLET_MODAL = 'SET_WALLET_MODAL',
  RESET_STATE = 'RESET_STATE',
  RESET_LAST_DEVICE_INTERACTION_STATE = 'RESET_LAST_DEVICE_INTERACTION_STATE',
  OPEN_KEEPKEY_PIN = 'OPEN_KEEPKEY_PIN',
  OPEN_KEEPKEY_PASSPHRASE = 'OPEN_KEEPKEY_PASSPHRASE',
  OPEN_KEEPKEY_INITIALIZE = 'OPEN_KEEPKEY_INITIALIZE',
  OPEN_KEEPKEY_LABEL = 'OPEN_KEEPKEY_LABEL',
  OPEN_KEEPKEY_RECOVERY_SYNTAX_FAILURE = 'OPEN_KEEPKEY_RECOVERY_SYNTAX_FAILURE',
  SET_DEVICE_STATE = 'SET_DEVICE_STATE',
  SET_PIN_REQUEST_TYPE = 'SET_PIN_REQUEST_TYPE',
  OPEN_KEEPKEY_RECOVERY_SETTINGS = 'OPEN_KEEPKEY_RECOVERY_SETTINGS',
  OPEN_KEEPKEY_RECOVERY = 'OPEN_KEEPKEY_RECOVERY',
  OPEN_KEEPKEY_CHARACTER_REQUEST = 'OPEN_KEEPKEY_CHARACTER_REQUEST',
  SET_WALLET_CONNECT_APP = 'SET_WALLET_CONNECT_APP',
  SET_KEEPKEY_SDK = 'SET_KEEPKEY_SDK',
  SET_BROWSER_URL = 'SET_BROWSER_URL',
  OPEN_KEEPKEY_WIPE = 'OPEN_KEEPKEY_WIPE',
}

export type ActionTypes =
  | { type: WalletActions.SET_ADAPTERS; payload: Adapters }
  | {
      type: WalletActions.SET_WALLET
      payload: WalletInfo & { wallet: HDWallet | null }
    }
  | { type: WalletActions.SET_IS_CONNECTED; payload: boolean }
  | { type: WalletActions.SET_PROVIDER; payload: InitialState['provider'] }
  | { type: WalletActions.SET_IS_LOCKED; payload: boolean }
  | { type: WalletActions.SET_CONNECTOR_TYPE; payload: KeyManager }
  | { type: WalletActions.SET_INITIAL_ROUTE; payload: string }
  | { type: WalletActions.SET_WALLET_MODAL; payload: boolean }
  | { type: WalletActions.SET_DEVICE_STATE; payload: Partial<DeviceState> }
  | { type: WalletActions.SET_PIN_REQUEST_TYPE; payload: PinMatrixRequestType }
  | {
      type: WalletActions.OPEN_KEEPKEY_CHARACTER_REQUEST
      payload: {
        characterPos: number | undefined
        wordPos: number | undefined
        deferred?: Deferred<string | boolean>
      }
    }
  | {
      type: WalletActions.OPEN_KEEPKEY_PIN
      payload: {
        pinRequestType: PinMatrixRequestType
        showBackButton?: boolean
        deferred: Deferred<string>
      }
    }
  | {
      type: WalletActions.OPEN_KEEPKEY_PASSPHRASE
      payload: {
        deferred: Deferred<string>
      }
    }
  | {
      type: WalletActions.OPEN_KEEPKEY_RECOVERY
    }
  | {
      type: WalletActions.OPEN_KEEPKEY_RECOVERY_SETTINGS
    }
  | {
      type: WalletActions.CLEAR_MODAL_CACHE
    }
  | {
      type: WalletActions.OPEN_KEEPKEY_RECOVERY_SYNTAX_FAILURE
    }
  | { type: WalletActions.RESET_STATE }
  | { type: WalletActions.RESET_LAST_DEVICE_INTERACTION_STATE }
  | {
      type: WalletActions.OPEN_KEEPKEY_INITIALIZE
    }
  | {
      type: WalletActions.OPEN_KEEPKEY_LABEL
      payload: {
        deferred: Deferred<string>
      }
    }
  | { type: WalletActions.SET_WALLET_CONNECT_APP; payload: WalletConnectApp | null }
  | { type: WalletActions.SET_KEEPKEY_SDK; payload: KeepKeySdk | null }
  | { type: WalletActions.SET_BROWSER_URL; payload: string | null }
  | {
      type: WalletActions.OPEN_KEEPKEY_WIPE
      payload: {
        preventClose?: boolean
      }
    }
