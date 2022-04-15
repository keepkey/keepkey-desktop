import { ComponentWithAs, IconProps } from '@chakra-ui/react'
import { HDWallet, Keyring } from '@shapeshiftoss/hdwallet-core'
import { getConfig } from 'config'
import { ipcRenderer } from 'electron'
import findIndex from 'lodash/findIndex'
import React, { useCallback, useEffect, useMemo, useReducer } from 'react'
import { useKeepKeyEventHandler } from 'context/WalletProvider/KeepKey/hooks/useKeepKeyEventHandler'
import { useModal } from 'hooks/useModal/useModal'

import { ActionTypes, Outcome, WalletActions } from './actions'
import { SUPPORTED_WALLETS } from './config'
import { KeepKeyService } from './KeepKey'
import { useKeyringEventHandler } from './KeepKey/hooks/useKeyringEventHandler'
import { PinMatrixRequestType } from './KeepKey/KeepKeyTypes'
import { KeyManager } from './KeyManager'
import { clearLocalWallet, getLocalWalletDeviceId, getLocalWalletType } from './local-wallet'
import { useNativeEventHandler } from './NativeWallet/hooks/useNativeEventHandler'
import { IWalletContext, WalletContext } from './WalletContext'
import { WalletViewsRouter } from './WalletViewsRouter'

const keepkey = new KeepKeyService()

type GenericAdapter = {
  initialize: (...args: any[]) => Promise<any>
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
  icons: Array<string>
  description: string
  url: string
}

export interface InitialState {
  keyring: Keyring
  adapters: Adapters | null
  wallet: HDWallet | null
  type: KeyManager | null
  initialRoute: string | null
  walletInfo: WalletInfo | null
  keepkeyStatus: string | null
  keepkeyState: any //TODO why cant this be number?
  keepkey: any
  walletConnectApp: WalletConnectApp | null
  isConnected: boolean
  modal: boolean
  isLoadingLocalWallet: boolean
  deviceId: string
  showBackButton: boolean
  keepKeyPinRequestType: PinMatrixRequestType | null
  awaitingDeviceInteraction: boolean
  lastDeviceInteractionStatus: Outcome
}

const initialState: InitialState = {
  keyring: new Keyring(),
  adapters: null,
  wallet: null,
  type: null,
  keepkeyStatus: null,
  keepkeyState: 0,
  walletConnectApp: null,
  initialRoute: null,
  walletInfo: null,
  isConnected: false,
  keepkey: null,
  modal: false,
  isLoadingLocalWallet: false,
  deviceId: '',
  showBackButton: true,
  keepKeyPinRequestType: null,
  awaitingDeviceInteraction: false,
  lastDeviceInteractionStatus: undefined,
}

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case WalletActions.SET_ADAPTERS:
      return { ...state, adapters: action.payload }
    case WalletActions.SET_WALLET:
      keepkey.pairWallet('keepkey', action.payload.wallet)

      return {
        ...state,
        wallet: action.payload.wallet,
        walletInfo: {
          name: action?.payload?.name,
          icon: action?.payload?.icon,
          deviceId: action?.payload?.deviceId,
          meta: {
            label: '', //TODO fixme
            address: (action.payload.wallet as any).ethAddress ?? '',
          },
        },
      }
    case WalletActions.SET_IS_CONNECTED:
      return { ...state, isConnected: action.payload }
    case WalletActions.SET_CONNECTOR_TYPE:
      return { ...state, type: action.payload }
    case WalletActions.SET_KEEPKEY_STATUS:
      return { ...state, keepkeyStatus: action.payload }
    case WalletActions.SET_KEEPKEY_STATE:
      return { ...state, keepkeyState: action.payload }
    case WalletActions.SET_INITIAL_ROUTE:
      return { ...state, initialRoute: action.payload }
    case WalletActions.SET_AWAITING_DEVICE_INTERACTION:
      return { ...state, awaitingDeviceInteraction: action.payload }
    case WalletActions.SET_LAST_DEVICE_INTERACTION_STATUS:
      return { ...state, lastDeviceInteractionStatus: action.payload }
    case WalletActions.SET_WALLET_MODAL:
      const newState = { ...state, modal: action.payload }
      // If we're closing the modal, then we need to forget the route we were on
      // Otherwise the connect button for last wallet we clicked on won't work
      if (!action.payload && state.modal) {
        newState.initialRoute = '/'
        newState.isLoadingLocalWallet = false
        newState.showBackButton = true
        newState.keepKeyPinRequestType = null
      }
      return newState
    case WalletActions.NATIVE_PASSWORD_OPEN:
      return {
        ...state,
        modal: action.payload.modal,
        type: KeyManager.Native,
        showBackButton: !state.isLoadingLocalWallet,
        deviceId: action.payload.deviceId,
        initialRoute: '/native/enter-password',
      }
    case WalletActions.OPEN_KEEPKEY_PIN:
      return {
        ...state,
        modal: true,
        type: KeyManager.KeepKey,
        showBackButton: false,
        deviceId: action.payload.deviceId,
        keepKeyPinRequestType: action.payload.pinRequestType ?? null,
        initialRoute: '/keepkey/enter-pin',
      }
    case WalletActions.OPEN_KEEPKEY_PASSPHRASE:
      return {
        ...state,
        modal: true,
        type: KeyManager.KeepKey,
        showBackButton: false,
        deviceId: action.payload.deviceId,
        initialRoute: '/keepkey/passphrase',
      }
    case WalletActions.OPEN_KEEPKEY_INITIALIZE:
      return {
        ...state,
        modal: true,
        type: KeyManager.KeepKey,
        deviceId: action.payload.deviceId,
        initialRoute: '/keepkey/new',
      }
    case WalletActions.SET_LOCAL_WALLET_LOADING:
      return { ...state, isLoadingLocalWallet: action.payload }
    case WalletActions.SET_WALLET_CONNECT_APP:
      if (action.payload === null) ipcRenderer.send('@walletconnect/disconnect')
      return { ...state, walletConnectApp: action.payload }
    case WalletActions.RESET_STATE:
      return {
        ...state,
        wallet: null,
        walletInfo: null,
        isConnected: false,
        type: null,
        initialRoute: null,
        isLoadingLocalWallet: false,
        showBackButton: true,
        keepKeyPinRequestType: null,
        awaitingDeviceInteraction: false,
        lastDeviceInteractionStatus: undefined,
      }
    default:
      return state
  }
}

function playSound(type: any) {
  if (type === 'send') {
    const audio = new Audio(require('../../assets/sounds/send.mp3'))
    audio.play()
  }
  if (type === 'receive') {
    const audio = new Audio(require('../../assets/sounds/chaching.mp3'))
    audio.play()
  }
  if (type === 'success') {
    const audio = new Audio(require('../../assets/sounds/success.wav'))
    audio.play()
  }
  if (type === 'fail') {
    //eww nerf
    // const audio = new Audio(require('../../assets/sounds/fail.mp3'))
    // audio.play()
  }
}

const getInitialState = () => {
  const localWalletType = getLocalWalletType()
  const localWalletDeviceId = getLocalWalletDeviceId()
  if (localWalletType && localWalletDeviceId) {
    /**
     * set isLoadingLocalWallet->true to bypass splash screen
     */
    return {
      ...initialState,
      isLoadingLocalWallet: true,
    }
  }
  return initialState
}

export const WalletProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, getInitialState())
  const { sign, pair, hardwareError } = useModal()

  const disconnect = useCallback(() => {
    /**
     * in case of KeepKey placeholder wallet,
     * the disconnect function is undefined
     */
    state.wallet?.disconnect?.()
    dispatch({ type: WalletActions.RESET_STATE })
    clearLocalWallet()
  }, [state.wallet])

  const load = useCallback(() => {
    const localWalletType = getLocalWalletType()
    const localWalletDeviceId = getLocalWalletDeviceId()
    if (localWalletType && localWalletDeviceId && state.adapters) {
      ;(async () => {
        if (state.adapters?.has(localWalletType)) {
          switch (localWalletType) {
            case KeyManager.Native:
              const localNativeWallet = await state.adapters
                .get(KeyManager.Native)
                ?.pairDevice(localWalletDeviceId)
              if (localNativeWallet) {
                /**
                 * This will eventually fire an event, which the native wallet
                 * password modal will be shown
                 */
                await localNativeWallet.initialize()
              } else {
                disconnect()
              }
              break
            case KeyManager.KeepKey:
              try {
                const localKeepKeyWallet = state.keyring.get(localWalletDeviceId)
                /**
                 * if localKeepKeyWallet is not null it means
                 * KeepKey remained connected during the reload
                 */
                if (localKeepKeyWallet) {
                  const { name, icon } = SUPPORTED_WALLETS[KeyManager.KeepKey]
                  const deviceId = await localKeepKeyWallet.getDeviceID()
                  // This gets the firmware version needed for some KeepKey "supportsX" functions
                  await localKeepKeyWallet.getFeatures()
                  // Show the label from the wallet instead of a generic name
                  const label = (await localKeepKeyWallet.getLabel()) || name

                  await localKeepKeyWallet.initialize()

                  dispatch({
                    type: WalletActions.SET_WALLET,
                    payload: {
                      wallet: localKeepKeyWallet,
                      name: label,
                      icon,
                      deviceId,
                      meta: { label },
                    },
                  })
                  dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: true })
                } else {
                  /**
                   * The KeepKey wallet is disconnected,
                   * because the accounts are not persisted, the app cannot load without getting pub keys from the
                   * wallet.
                   */
                  // TODO(ryankk): If persist is turned back on, we can restore the previous deleted code.
                  disconnect()
                }
              } catch (e) {
                disconnect()
              }
              dispatch({ type: WalletActions.SET_LOCAL_WALLET_LOADING, payload: false })
              break
            case KeyManager.Portis:
              const localPortisWallet = await state.adapters.get(KeyManager.Portis)?.pairDevice()
              if (localPortisWallet) {
                const { name, icon } = SUPPORTED_WALLETS[KeyManager.Portis]
                try {
                  await localPortisWallet.initialize()
                  const deviceId = await localPortisWallet.getDeviceID()
                  dispatch({
                    type: WalletActions.SET_WALLET,
                    payload: {
                      wallet: localPortisWallet,
                      name,
                      icon,
                      deviceId,
                    },
                  })
                  dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: true })
                } catch (e) {
                  disconnect()
                }
              } else {
                disconnect()
              }
              dispatch({ type: WalletActions.SET_LOCAL_WALLET_LOADING, payload: false })
              break
            case KeyManager.MetaMask:
              const localMetaMaskWallet = await state.adapters
                .get(KeyManager.MetaMask)
                ?.pairDevice()
              if (localMetaMaskWallet) {
                const { name, icon } = SUPPORTED_WALLETS[KeyManager.MetaMask]
                try {
                  await localMetaMaskWallet.initialize()
                  const deviceId = await localMetaMaskWallet.getDeviceID()
                  dispatch({
                    type: WalletActions.SET_WALLET,
                    payload: {
                      wallet: localMetaMaskWallet,
                      name,
                      icon,
                      deviceId,
                    },
                  })
                  dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: true })
                } catch (e) {
                  disconnect()
                }
              } else {
                disconnect()
              }
              dispatch({ type: WalletActions.SET_LOCAL_WALLET_LOADING, payload: false })
              break
            default:
              disconnect()
              break
          }
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.adapters, state.keyring])

  useEffect(() => {
    if (state.keyring) {
      ;(async () => {
        const adapters: Adapters = new Map()
        let options: undefined | { portisAppId: string }
        for (const wallet of Object.values(KeyManager)) {
          try {
            options =
              wallet === 'portis'
                ? { portisAppId: getConfig().REACT_APP_PORTIS_DAPP_ID }
                : undefined
            const adapter = SUPPORTED_WALLETS[wallet].adapter.useKeyring(state.keyring, options)
            // useKeyring returns the instance of the adapter. We'll keep it for future reference.
            if (wallet === 'keepkey') {
              // TODO: add ability to pass serviceKey to adapter
              // const serviceKey = keepkey.getServiceKey()
              await adapter.pairDevice('http://localhost:1646')
              adapters.set(wallet, adapter)
            } else {
              await adapter.initialize()
              adapters.set(wallet, adapter)
            }
          } catch (e) {
            console.error('Error initializing HDWallet adapters', e)
          }
        }

        dispatch({ type: WalletActions.SET_ADAPTERS, payload: adapters })
      })()
    }
  }, [state.keyring])

  useEffect(() => {
    if (!state.wallet) {
      //hardwareError.open({})
      console.info('Starting bridge')
      ipcRenderer.send('@app/start', {
        username: keepkey.username,
        queryKey: keepkey.queryKey,
        spec: process.env.REACT_APP_URL_PIONEER_SPEC,
      })
    } else {
      ipcRenderer.send('@wallet/connected')
    }

    ipcRenderer.on('@walletconnect/paired', (event, data) => {
      dispatch({ type: WalletActions.SET_WALLET_CONNECT_APP, payload: data })
    })

    //listen to events on main
    ipcRenderer.on('hardware', (event, data) => {
      //event
      //console.log('hardware event: ', data)

      switch (data.event.event) {
        case 'connect':
          playSound('success')
          break
        case 'disconnect':
          playSound('fail')
          break
        default:
        //TODO Spammy
        //console.log("unhandled event! ",data.event)
      }
    })

    ipcRenderer.on('playSound', (event, data) => {})

    ipcRenderer.on('attach', (event, data) => {
      dispatch({ type: WalletActions.SET_KEEPKEY_STATE, payload: data.state })
      dispatch({ type: WalletActions.SET_KEEPKEY_STATUS, payload: data.status })
    })

    ipcRenderer.on('detach', (event, data) => {
      playSound('fail')
      dispatch({ type: WalletActions.SET_KEEPKEY_STATE, payload: data.state })
      dispatch({ type: WalletActions.SET_KEEPKEY_STATUS, payload: data.status })
    })

    ipcRenderer.on('setKeepKeyState', (event, data) => {
      dispatch({ type: WalletActions.SET_KEEPKEY_STATE, payload: data.state })
      dispatch({ type: WalletActions.SET_KEEPKEY_STATUS, payload: data.status })
    })

    ipcRenderer.on('setKeepKeyStatus', (event, data) => {
      dispatch({ type: WalletActions.SET_KEEPKEY_STATE, payload: data.state })
      dispatch({ type: WalletActions.SET_KEEPKEY_STATUS, payload: data.status })
    })

    ipcRenderer.on('approveOrigin', (event: any, data: any) => {
      pair.open(data)
    })

    ipcRenderer.on('loadKeepKeyInfo', (event, data) => {
      keepkey.updateFeatures(data.payload)
    })

    ipcRenderer.on('setUpdaterMode', (event, data) => {
      keepkey.setUpdaterMode(data.payload)
    })

    ipcRenderer.on('setNeedsBootloaderUpdate', (event, data) => {
      keepkey.setNeedsBootloaderUpdate(true)
    })

    ipcRenderer.on('loadKeepKeyFirmwareLatest', (event, data) => {
      keepkey.updateKeepKeyFirmwareLatest(data.payload)
    })

    ipcRenderer.on('onCompleteBootloaderUpload', (event, data) => {
      keepkey.setNeedsBootloaderUpdate(false)
    })

    // ipcRenderer.on('onCompleteFirmwareUpload', (event, data) => {
    //   firmware.close()
    // })

    // ipcRenderer.on('openFirmwareUpdate', (event, data) => {
    //   firmware.open({})
    // })

    ipcRenderer.on('openHardwareError', (event, data) => {
      hardwareError.open(data)
    })

    ipcRenderer.on('closeHardwareError', (event, data) => {
      hardwareError.close()
    })

    // ipcRenderer.on('openBootloaderUpdate', (event, data) => {
    //   bootloader.open({})
    // })

    // ipcRenderer.on('closeBootloaderUpdate', (event, data) => {
    //   bootloader.close()
    // })

    //HDwallet API
    //TODO moveme into own file
    ipcRenderer.on('@hdwallet/getPublicKeys', async (event, data) => {
      if (state.wallet) {
        // @ts-ignore
        let pubkeys = await state.wallet.getPublicKeys(data.payload.paths)
        console.info('pubkeys: ', pubkeys)
        ipcRenderer.send('@hdwallet/response/getPublicKeys', pubkeys)
      }
    })

    ipcRenderer.on('@hdwallet/btcGetAddress', async (event, data) => {
      let payload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        console.info('payload: ', payload)
        // @ts-ignore
        let pubkeys = await state.wallet.btcGetAddress(payload)
        ipcRenderer.send('@hdwallet/response/btcGetAddress', pubkeys)
      }
    })

    ipcRenderer.on('@hdwallet/ethGetAddress', async (event, data) => {
      let payload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        console.info('payload: ', payload)
        // @ts-ignore
        let pubkeys = await state.wallet.ethGetAddress(payload)
        ipcRenderer.send('@hdwallet/response/ethGetAddress', pubkeys)
      }
    })

    ipcRenderer.on('@hdwallet/thorchainGetAddress', async (event, data) => {
      let payload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        // @ts-ignore
        let pubkeys = await state.wallet.thorchainGetAddress(payload)
        ipcRenderer.send('@hdwallet/response/thorchainGetAddress', pubkeys)
      }
    })

    ipcRenderer.on('@hdwallet/osmosisGetAddress', async (event, data) => {
      let payload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        // @ts-ignore
        let pubkeys = await state.wallet.osmosisGetAddress(payload)
        ipcRenderer.send('@hdwallet/response/osmosisGetAddress', pubkeys)
      }
    })

    ipcRenderer.on('@hdwallet/binanceGetAddress', async (event, data) => {
      let payload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        // @ts-ignore
        let pubkeys = await state.wallet.binanceGetAddress(payload)
        ipcRenderer.send('@hdwallet/response', pubkeys)
      } else {
        ipcRenderer.send('@hdwallet/response/binanceGetAddress', { error: 'wallet not online!' })
      }
    })

    ipcRenderer.on('@hdwallet/cosmosGetAddress', async (event, data) => {
      let payload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        // @ts-ignore
        let pubkeys = await state.wallet.cosmosGetAddress(payload)
        ipcRenderer.send('@hdwallet/response', pubkeys)
      } else {
        ipcRenderer.send('@hdwallet/response/cosmosGetAddress', { error: 'wallet not online!' })
      }
    })

    //signTx
    ipcRenderer.on('@hdwallet/btcSignTx', async (event, data) => {
      let HDwalletPayload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        // @ts-ignore
        let pubkeys = await state.wallet.btcSignTx(HDwalletPayload)
        ipcRenderer.send('@hdwallet/response/btcSignTx', pubkeys)
      }
    })

    ipcRenderer.on('@hdwallet/thorchainSignTx', async (event, data) => {
      let HDwalletPayload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        // @ts-ignore
        let pubkeys = await state.wallet.thorchainSignTx(HDwalletPayload)
        ipcRenderer.send('@hdwallet/response/thorchainSignTx', pubkeys)
      }
    })

    ipcRenderer.on('@hdwallet/cosmosSignTx', async (event, data) => {
      let HDwalletPayload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        // @ts-ignore
        let pubkeys = await state.wallet.thorchainSignTx(HDwalletPayload)
        ipcRenderer.send('@hdwallet/cosmosSignTx', pubkeys)
      }
    })

    ipcRenderer.on('@hdwallet/osmosisSignTx', async (event, data) => {
      let HDwalletPayload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        // @ts-ignore
        let pubkeys = await state.wallet.osmosisSignTx(HDwalletPayload)
        ipcRenderer.send('@hdwallet/response/osmosisSignTx', pubkeys)
      }
    })

    ipcRenderer.on('@hdwallet/ethSignTx', async (event, data) => {
      let HDwalletPayload = data.payload
      if (state.wallet) {
        console.info('state.wallet: ', state.wallet)
        // @ts-ignore
        let pubkeys = await state.wallet.ethSignTx(HDwalletPayload)
        ipcRenderer.send('@hdwallet/response/ethSignTx', pubkeys)
      }
    })

    //END HDwallet API

    ipcRenderer.on('setDevice', (event, data) => {})

    ipcRenderer.on('@account/sign-tx', async (event: any, data: any) => {
      let unsignedTx = data.payload.data
      //open signTx
      if (
        unsignedTx &&
        unsignedTx.invocation &&
        unsignedTx.invocation.unsignedTx &&
        unsignedTx.invocation.unsignedTx.HDwalletPayload
      ) {
        sign.open({ unsignedTx, nonce: data.nonce })
      } else {
        console.error('INVALID SIGN PAYLOAD!', JSON.stringify(unsignedTx))
      }
    })

    //start keepkey
    async function startPioneer() {
      try {
        //keepkey
        await keepkey.init()
      } catch (e) {
        console.error(e)
      }
    }
    startPioneer()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.wallet]) // we explicitly only want this to happen once

  useEffect(() => {
    ipcRenderer.on('@wallet/not-initialized', (event, deviceId) => {
      dispatch({
        type: WalletActions.OPEN_KEEPKEY_INITIALIZE,
        payload: {
          deviceId,
        },
      })
    })
  }, [])

  const connect = useCallback(async (type: KeyManager) => {
    dispatch({ type: WalletActions.SET_CONNECTOR_TYPE, payload: type })
    const routeIndex = findIndex(SUPPORTED_WALLETS[type]?.routes, ({ path }) =>
      String(path).endsWith('connect'),
    )
    if (routeIndex > -1) {
      dispatch({
        type: WalletActions.SET_INITIAL_ROUTE,
        payload: SUPPORTED_WALLETS[type].routes[routeIndex].path as string,
      })
    }
  }, [])

  const create = useCallback(async (type: KeyManager) => {
    dispatch({ type: WalletActions.SET_CONNECTOR_TYPE, payload: type })
    const routeIndex = findIndex(SUPPORTED_WALLETS[type]?.routes, ({ path }) =>
      String(path).endsWith('create'),
    )
    if (routeIndex > -1) {
      dispatch({
        type: WalletActions.SET_INITIAL_ROUTE,
        payload: SUPPORTED_WALLETS[type].routes[routeIndex].path as string,
      })
    }
  }, [])

  const setAwaitingDeviceInteraction = useCallback((awaitingDeviceInteraction: boolean) => {
    dispatch({
      type: WalletActions.SET_AWAITING_DEVICE_INTERACTION,
      payload: awaitingDeviceInteraction,
    })
  }, [])

  const setLastDeviceInteractionStatus = useCallback((lastDeviceInteractionStatus: Outcome) => {
    dispatch({
      type: WalletActions.SET_LAST_DEVICE_INTERACTION_STATUS,
      payload: lastDeviceInteractionStatus,
    })
  }, [])

  useEffect(() => load(), [load, state.adapters, state.keyring])

  useKeyringEventHandler(state)
  useNativeEventHandler(state, dispatch)
  useKeepKeyEventHandler(
    state,
    dispatch,
    load,
    setAwaitingDeviceInteraction,
    setLastDeviceInteractionStatus,
  )

  const value: IWalletContext = useMemo(
    () => ({
      state,
      dispatch,
      connect,
      create,
      disconnect,
      load,
      setAwaitingDeviceInteraction,
      setLastDeviceInteractionStatus,
      keepkey,
    }),
    [
      state,
      connect,
      create,
      disconnect,
      load,
      setAwaitingDeviceInteraction,
      setLastDeviceInteractionStatus,
    ],
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletViewsRouter />
    </WalletContext.Provider>
  )
}
