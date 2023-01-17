import type { ComponentWithAs, IconProps } from '@chakra-ui/react'
import { KeepKeySdk } from '@keepkey/keepkey-sdk'
import type { HDWallet } from '@shapeshiftoss/hdwallet-core'
import { Keyring } from '@shapeshiftoss/hdwallet-core'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import type { WalletConnectProviderConfig } from '@shapeshiftoss/hdwallet-walletconnect'
import type WalletConnectProvider from '@walletconnect/web3-provider'
import kkIconBlack from 'assets/kk-icon-black.png'
import type { Deferred } from 'common-utils'
import type { Entropy } from 'context/WalletProvider/KeepKey/components/RecoverySettings'
import { VALID_ENTROPY } from 'context/WalletProvider/KeepKey/components/RecoverySettings'
import { useKeepKeyEventHandler } from 'context/WalletProvider/KeepKey/hooks/useKeepKeyEventHandler'
import { KeepKeyRoutes } from 'context/WalletProvider/routes'
import { randomUUID } from 'crypto'
import { ipcListeners } from 'electron-shim'
import { logger } from 'lib/logger'
import debounce from 'lodash/debounce'
import omit from 'lodash/omit'
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import * as uuid from 'uuid'

import type { ActionTypes } from './actions'
import { WalletActions } from './actions'
import { SUPPORTED_WALLETS } from './config'
import { KeepKeyConfig } from './KeepKey/config'
import { useKeyringEventHandler } from './KeepKey/hooks/useKeyringEventHandler'
import type { PinMatrixRequestType } from './KeepKey/KeepKeyTypes'
import { KeyManager } from './KeyManager'
import { clearLocalWallet, setLocalWalletTypeAndDeviceId } from './local-wallet'
import type { IWalletContext } from './WalletContext'
import { WalletContext } from './WalletContext'
import { WalletViewsRouter } from './WalletViewsRouter'

const moduleLogger = logger.child({ namespace: ['WalletProvider'] })

type GenericAdapter = {
  pairDevice: (...args: any[]) => Promise<HDWallet>
}

export type Adapters = Map<KeyManager, GenericAdapter>

export type WalletInfo = {
  name: string
  icon: ComponentWithAs<'svg', IconProps>
  deviceId: string
  meta?: { label?: string; address?: string }
}

export type WalletConnectApp = {
  name: string
  icons: string[]
  description: string
  url: string
}

export type Outcome = 'success' | 'error'
export type DeviceDisposition = 'initialized' | 'recovering' | 'initializing'

export type DeviceState = {
  awaitingDeviceInteraction: boolean
  lastDeviceInteractionStatus: Outcome | undefined
  disposition: DeviceDisposition | undefined
  recoverWithPassphrase: boolean | undefined
  recoveryEntropy: Entropy
  recoveryCharacterIndex: number | undefined
  recoveryWordIndex: number | undefined
  isDeviceLoading: boolean | undefined
}

const initialDeviceState: DeviceState = {
  awaitingDeviceInteraction: false,
  lastDeviceInteractionStatus: undefined,
  disposition: undefined,
  recoverWithPassphrase: undefined,
  recoveryEntropy: VALID_ENTROPY[0],
  recoveryCharacterIndex: undefined,
  recoveryWordIndex: undefined,
  isDeviceLoading: false,
}

export interface InitialState {
  keyring: Keyring
  adapters: Adapters | null
  wallet: HDWallet | null
  type: KeyManager | null
  initialRoute: string | null
  walletInfo: WalletInfo | null
  isConnected: boolean
  isUpdatingKeepkey: boolean
  provider: WalletConnectProvider | null
  isLocked: boolean
  modal: boolean
  deviceId: string
  showBackButton: boolean
  keepKeyPinRequestType: PinMatrixRequestType | null
  deviceState: DeviceState
  disconnectOnCloseModal: boolean
  keepkeySdk: KeepKeySdk | null
  browserUrl: string | null
  pinDeferred?: Deferred<string>
  passphraseDeferred?: Deferred<string>
  labelDeferred?: Deferred<string>
}

const initialState: InitialState = {
  keyring: new Keyring(),
  adapters: null,
  wallet: null,
  type: KeyManager.KeepKey,
  initialRoute: null,
  walletInfo: null,
  isConnected: false,
  provider: null,
  isLocked: false,
  modal: false,
  deviceId: '',
  showBackButton: true,
  keepKeyPinRequestType: null,
  deviceState: initialDeviceState,
  disconnectOnCloseModal: false,
  keepkeySdk: null,
  browserUrl: null,
  isUpdatingKeepkey: false,
}

export const isKeyManagerWithProvider = (keyManager: KeyManager | null) => Boolean(keyManager)

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case WalletActions.SET_ADAPTERS:
      return { ...state, adapters: action.payload }
    case WalletActions.SET_WALLET:
      return {
        ...state,
        wallet: action.payload.wallet,
        walletInfo: {
          name: action?.payload?.name,
          icon: action?.payload?.icon,
          deviceId: action?.payload?.deviceId,
          meta: {
            label: action.payload.meta?.label ?? '',
            address: '',
          },
        },
      }
    case WalletActions.SET_BROWSER_URL:
      return { ...state, browserUrl: action.payload }
    case WalletActions.SET_PROVIDER:
      return { ...state, provider: action.payload }
    case WalletActions.SET_IS_CONNECTED:
      return { ...state, isConnected: action.payload }
    case WalletActions.SET_IS_LOCKED:
      return { ...state, isLocked: action.payload }
    case WalletActions.SET_CONNECTOR_TYPE:
      return { ...state, type: action.payload }
    case WalletActions.SET_INITIAL_ROUTE:
      return { ...state, initialRoute: action.payload }
    case WalletActions.SET_PIN_REQUEST_TYPE:
      return { ...state, keepKeyPinRequestType: action.payload }
    case WalletActions.SET_KEEPKEY_SDK:
      return { ...state, keepkeySdk: action.payload }
    case WalletActions.SET_DEVICE_STATE: {
      const { deviceState } = state
      const {
        awaitingDeviceInteraction = deviceState.awaitingDeviceInteraction,
        lastDeviceInteractionStatus = deviceState.lastDeviceInteractionStatus,
        disposition = deviceState.disposition,
        recoverWithPassphrase = deviceState.recoverWithPassphrase,
        recoveryEntropy = deviceState.recoveryEntropy,
        isDeviceLoading = deviceState.isDeviceLoading,
      } = action.payload
      return {
        ...state,
        deviceState: {
          ...deviceState,
          awaitingDeviceInteraction,
          lastDeviceInteractionStatus,
          disposition,
          recoverWithPassphrase,
          recoveryEntropy,
          isDeviceLoading,
        },
      }
    }
    case WalletActions.SET_WALLET_MODAL: {
      const newState = { ...state, modal: action.payload }
      // If we're closing the modal, then we need to forget the route we were on
      // Otherwise the connect button for last wallet we clicked on won't work
      if (!action.payload && state.modal) {
        newState.initialRoute = '/'
        newState.showBackButton = true
        newState.keepKeyPinRequestType = null
      }
      return newState
    }
    case WalletActions.OPEN_KEEPKEY_PIN: {
      const { showBackButton, pinRequestType, deferred } = action.payload
      return {
        ...state,
        modal:
          window.localStorage.getItem('onboarded') === 'true' &&
          window.localStorage.getItem('languageSelected') === 'true'
            ? true
            : false,
        type: KeyManager.KeepKey,
        showBackButton: showBackButton ?? false,
        keepKeyPinRequestType: pinRequestType ?? null,
        initialRoute: KeepKeyRoutes.Pin,
        pinDeferred: deferred,
      }
    }
    case WalletActions.OPEN_KEEPKEY_CHARACTER_REQUEST: {
      const { characterPos: recoveryCharacterIndex, wordPos: recoveryWordIndex } = action.payload
      const { deviceState } = state
      return {
        ...state,
        modal: true,
        showBackButton: false,
        type: KeyManager.KeepKey,
        initialRoute: KeepKeyRoutes.RecoverySentenceEntry,
        deviceState: {
          ...deviceState,
          recoveryCharacterIndex,
          recoveryWordIndex,
        },
      }
    }
    case WalletActions.OPEN_KEEPKEY_PASSPHRASE: {
      const { deferred } = action.payload
      return {
        ...state,
        modal: true,
        type: KeyManager.KeepKey,
        showBackButton: false,
        initialRoute: KeepKeyRoutes.Passphrase,
        passphraseDeferred: deferred,
      }
    }
    case WalletActions.OPEN_KEEPKEY_INITIALIZE:
      return {
        ...state,
        modal: true,
        showBackButton: false,
        disconnectOnCloseModal: true,
        type: KeyManager.KeepKey,
        initialRoute: KeepKeyRoutes.FactoryState,
      }
    case WalletActions.OPEN_KEEPKEY_LABEL: {
      const { deferred } = action.payload
      return {
        ...state,
        modal: true,
        showBackButton: false,
        disconnectOnCloseModal: true,
        type: KeyManager.KeepKey,
        initialRoute: KeepKeyRoutes.NewLabel,
        labelDeferred: deferred,
      }
    }
    case WalletActions.OPEN_KEEPKEY_RECOVERY:
      return {
        ...state,
        modal: true,
        type: KeyManager.KeepKey,
        initialRoute: KeepKeyRoutes.NewRecoverySentence,
      }
    case WalletActions.OPEN_KEEPKEY_RECOVERY_SETTINGS:
      return {
        ...state,
        modal: true,
        showBackButton: false,
        disconnectOnCloseModal: true,
        type: KeyManager.KeepKey,
        initialRoute: KeepKeyRoutes.RecoverySettings,
      }
    case WalletActions.OPEN_KEEPKEY_RECOVERY_SYNTAX_FAILURE:
      return {
        ...state,
        modal: true,
        type: KeyManager.KeepKey,
        initialRoute: KeepKeyRoutes.RecoverySentenceInvalid,
      }
    case WalletActions.CLEAR_MODAL_CACHE:
      return {
        ...state,
        modal: false,
        initialRoute: '/',
        showBackButton: true,
        keepKeyPinRequestType: null,
        keyring: new Keyring(),
      }
    case WalletActions.RESET_STATE:
      const resetProperties = omit(initialState, ['adapters', 'modal', 'deviceId'])
      return { ...state, ...resetProperties }
    // TODO: Remove this once we update SET_DEVICE_STATE to allow explicitly setting falsey values
    case WalletActions.RESET_LAST_DEVICE_INTERACTION_STATE: {
      const { deviceState } = state
      return {
        ...state,
        deviceState: {
          ...deviceState,
          lastDeviceInteractionStatus: undefined,
        },
      }
    }
    default:
      return state
  }
}

export const WalletProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  // External, exposed state to be consumed with useWallet()
  const [state, dispatch] = useReducer(reducer, initialState)
  // Keepkey is in a fucked state and needs to be unplugged/replugged

  // to know we are in the process of updating bootloader or firmware
  // so we dont unintentionally show the keepkey error modal while updating
  const [isUpdatingKeepkey, setIsUpdatingKeepkey] = useState(false)

  const disconnect = useCallback(async () => {
    /**
     * in case of KeepKey placeholder wallet,
     * the disconnect function is undefined
     */
    clearLocalWallet()
    dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
    dispatch({ type: WalletActions.RESET_STATE })
    setIsUpdatingKeepkey(false)
  }, [])

  const pairAndConnect = useRef(
    debounce(async () => {
      console.log('pairAndConnect')
      const sdk = await getsdk()
      const adapters: Adapters = new Map()
      let options: undefined | WalletConnectProviderConfig
      for (const walletName of Object.values(KeyManager)) {
        try {
          const adapter = SUPPORTED_WALLETS[walletName].adapter.useKeyring(state.keyring, options)
          const wallet: KeepKeyHDWallet = await adapter.pairDevice(sdk)
          adapters.set(walletName, adapter)
          dispatch({ type: WalletActions.SET_ADAPTERS, payload: adapters })
          const { name, icon } = KeepKeyConfig
          const deviceId = await wallet.getDeviceID()
          // Show the label from the wallet instead of a generic name
          const label = (await wallet.getLabel()) || name
          dispatch({
            type: WalletActions.SET_WALLET,
            payload: { wallet, name: label, icon, deviceId, meta: { label } },
          })
          if ((await wallet.getFeatures()).initialized) {
            dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: true })
          }
          /**
           * The real deviceId of KeepKey wallet could be different from the
           * deviceId recieved from the wallet, so we need to keep
           * aliases[deviceId] in the local wallet storage.
           */
          setLocalWalletTypeAndDeviceId(KeyManager.KeepKey, state.keyring.getAlias(deviceId))
        } catch (e) {
          moduleLogger.error(e, 'Error initializing HDWallet adapters')
          disconnect()
        }
      }
    }, 2000),
  )

  const getsdk = async () => {
    console.log('setup kk sdk called')
    let serviceKey = window.localStorage.getItem('@app/serviceKey')
    let config = {
      serviceName: 'KeepKey Desktop',
      serviceImageUrl: kkIconBlack,
      serviceKey: serviceKey ? serviceKey : randomUUID(),
    }
    if (!serviceKey) {
      window.localStorage.setItem('@app/serviceKey', config.serviceKey)
    }
    await ipcListeners.bridgeAddService(config)
    return await KeepKeySdk.create({
      apiKey: config.serviceKey,
    })
  }

  const setupKeepKeySDK = async () => {
    let serviceKey = window.localStorage.getItem('@app/serviceKey')
    let config = {
      serviceName: 'KeepKey Desktop',
      serviceImageUrl: kkIconBlack,
      serviceKey: serviceKey ? serviceKey : uuid.v4(),
    }
    if (!serviceKey) {
      window.localStorage.setItem('@app/serviceKey', config.serviceKey)
    }
    await ipcListeners.bridgeAddService(config)
    try {
      const sdk = await KeepKeySdk.create({
        apiKey: config.serviceKey,
      })
      dispatch({ type: WalletActions.SET_KEEPKEY_SDK, payload: sdk })
    } catch (e) {
      console.error('GET KEEPKEYSDK ERROR', e)
    }
  }

  useEffect(() => {
    disconnect()
    setupKeepKeySDK()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setDeviceState = useCallback((deviceState: Partial<DeviceState>) => {
    dispatch({
      type: WalletActions.SET_DEVICE_STATE,
      payload: deviceState,
    })
  }, [])

  useKeyringEventHandler(state)
  useKeepKeyEventHandler(state, dispatch, disconnect, setDeviceState)

  const value: IWalletContext = useMemo(
    () => ({
      state,
      dispatch,
      disconnect,
      setDeviceState,
      isUpdatingKeepkey,
      setIsUpdatingKeepkey,
      pairAndConnect,
    }),
    [state, disconnect, setDeviceState, setIsUpdatingKeepkey, isUpdatingKeepkey, pairAndConnect],
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletViewsRouter />
    </WalletContext.Provider>
  )
}
