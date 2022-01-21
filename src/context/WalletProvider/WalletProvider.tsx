import { ComponentWithAs, IconProps } from '@chakra-ui/react'
import { HDWallet, Keyring } from '@shapeshiftoss/hdwallet-core'
import { getConfig } from 'config'
import cryptoTools from 'crypto'
import { ipcRenderer } from 'electron'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer
} from 'react'
import { useModal } from 'context/ModalProvider/ModalProvider'

import { KeyManager, SUPPORTED_WALLETS } from './config'
import { useKeepKeyEventHandler } from './KeepKey/hooks/useKeepKeyEventHandler'
import { useKeyringEventHandler } from './KeepKey/hooks/useKeyringEventHandler'
import { useNativeEventHandler } from './NativeWallet/hooks/useNativeEventHandler'
import { PioneerService } from './Pioneer'
import { WalletViewsRouter } from './WalletViewsRouter'

const pioneer = new PioneerService()

export enum WalletActions {
  SET_ADAPTERS = 'SET_ADAPTERS',
  SET_WALLET = 'SET_WALLET',
  SET_CONNECTOR_TYPE = 'SET_CONNECTOR_TYPE',
  SET_INITIAL_ROUTE = 'SET_INITIAL_ROUTE',
  SET_IS_CONNECTED = 'SET_IS_CONNECTED',
  SET_WALLET_MODAL = 'SET_WALLET_MODAL',
  SET_KEEPKEY_STATE = 'SET_KEEPKEY_STATE',
  SET_KEEPKEY_STATUS = 'SET_KEEPKEY_STATUS',
  //
  SET_STATUS = 'SET_STATUS',
  SET_USERNAME = 'SET_USERNAME',
  SET_BALANCES = 'SET_BALANCES',
  SET_CONTEXT = 'SET_CONTEXT',
  SET_PIONEER = 'SET_PIONEER',
  SET_PAIRING_CODE = 'SET_PAIRING_CODE',
  SET_INVOCATION_CONTEXT = 'SET_INVOCATION_CONTEXT',
  SET_INVOCATION_TXID = 'SET_INVOCATION_TXID',
  INIT_PIONEER = 'INIT_PIONEER',
  SET_ASSET_CONTEXT = 'SET_ASSET_CONTEXT',
  SET_TRADE_INPUT = 'SET_TRADE_INPUT',
  SET_TRADE_OUTPUT = 'SET_TRADE_OUTPUT',
  SET_TRADE_STATUS = 'SET_TRADE_STATUS',
  SET_TRADE_FULLFILLMENT_TXID = 'SET_TRADE_FULLFILLMENT_TXID',
  SET_EXCHANGE_CONTEXT = 'SET_EXCHANGE_CONTEXT',
  RESET_STATE = 'RESET_STATE'
}

type GenericAdapter = {
  initialize: (...args: any[]) => Promise<any>
  pairDevice: (...args: any[]) => Promise<HDWallet>
}

type Adapters = Map<KeyManager, GenericAdapter>
export interface InitialState {
  keyring: Keyring
  adapters: Adapters | null
  wallet: HDWallet | null
  type: KeyManager | null
  initialRoute: string | null
  walletInfo: { name: string; icon: ComponentWithAs<'svg', IconProps>; deviceId: string } | null
  isConnected: boolean
  modal: boolean
  //
  keepkeyStatus: string | null
  keepkeyState: number
  //
  username: any
  context: any
  balances: any | null
  pioneer: any
  code: any
  status: string | null
}

const initialState: InitialState = {
  keyring: new Keyring(),
  adapters: null,
  wallet: null,
  type: null,
  initialRoute: null,
  walletInfo: null,
  isConnected: false,
  modal: false,
  //
  keepkeyStatus: null,
  keepkeyState: 0,
  //
  username: null,
  pioneer: null,
  balances: null,
  context: null,
  code: null,
  status: null
}

export interface IWalletContext {
  state: InitialState
  dispatch: React.Dispatch<ActionTypes>
  connect: (adapter: KeyManager) => Promise<void>
  disconnect: () => void
  pioneer: any
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
    const audio = new Audio(require('../../assets/sounds/fail.mp3'))
    audio.play()
  }
}

export type ActionTypes =
  | { type: WalletActions.SET_ADAPTERS; payload: Adapters }
  | {
      type: WalletActions.SET_WALLET
      payload: {
        wallet: HDWallet | null
        name: string
        icon: ComponentWithAs<'svg', IconProps>
        deviceId: string
      }
    }
  | { type: WalletActions.SET_IS_CONNECTED; payload: boolean }
  | { type: WalletActions.SET_CONNECTOR_TYPE; payload: KeyManager }
  | { type: WalletActions.SET_INITIAL_ROUTE; payload: string }
  | { type: WalletActions.SET_WALLET_MODAL; payload: boolean }
  | { type: WalletActions.SET_KEEPKEY_STATE; payload: string }
  | { type: WalletActions.SET_KEEPKEY_STATUS; payload: string }
  | { type: WalletActions.SET_BALANCES; payload: any }
  | { type: WalletActions.SET_PIONEER; payload: any | null }
  | { type: WalletActions.SET_USERNAME; payload: String | null }
  | { type: WalletActions.SET_CONTEXT; payload: string }
  | { type: WalletActions.SET_PAIRING_CODE; payload: String | null }
  | { type: WalletActions.SET_STATUS; payload: any }
  | { type: WalletActions.RESET_STATE }

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case WalletActions.SET_ADAPTERS:
      return { ...state, adapters: action.payload }
    case WalletActions.SET_WALLET:
      pioneer.pairWallet('keepkey', action.payload.wallet)
      return {
        ...state,
        wallet: action.payload.wallet,
        walletInfo: {
          name: action?.payload?.name,
          icon: action?.payload?.icon,
          deviceId: action?.payload?.deviceId
        }
      }
    case WalletActions.SET_IS_CONNECTED:
      return { ...state, isConnected: action.payload }
    case WalletActions.SET_CONNECTOR_TYPE:
      return { ...state, type: action.payload }
    case WalletActions.SET_INITIAL_ROUTE:
      return { ...state, initialRoute: action.payload }
    case WalletActions.SET_WALLET_MODAL:
      const newState = { ...state, modal: action.payload }
      // If we're closing the modal, then we need to forget the route we were on
      // Otherwise the connect button for last wallet we clicked on won't work
      if (action.payload !== state.modal) {
        newState.initialRoute = '/'
      }
      return newState
    case WalletActions.SET_USERNAME:
      return { ...state, username: action.payload }
    case WalletActions.SET_PIONEER:
      return { ...state, pioneer: action.payload }
    case WalletActions.SET_BALANCES:
      return { ...state, balances: action.payload }
    case WalletActions.SET_CONTEXT:
      return { ...state, context: action.payload }
    case WalletActions.SET_PAIRING_CODE:
      return { ...state, code: action.payload }
    case WalletActions.SET_STATUS:
      return { ...state, status: action.payload }
    case WalletActions.RESET_STATE:
      return {
        ...state,
        wallet: null,
        walletInfo: null,
        isConnected: false,
        type: null,
        initialRoute: null
      }
    default:
      return state
  }
}

const WalletContext = createContext<IWalletContext | null>(null)

export const WalletProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const { sign } = useModal()
  const [state, dispatch] = useReducer(reducer, initialState)
  useKeyringEventHandler(state)
  useKeepKeyEventHandler(state, dispatch)
  useNativeEventHandler(state, dispatch)

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

  //onStart()
  useEffect(() => {
    console.log('onStartApp: CHECKPOINT')
    console.log('username: ', pioneer.username)
    if(!state.wallet){
      ipcRenderer.send('onStartApp', {
        username: pioneer.username,
        queryKey: pioneer.queryKey,
        spec: process.env.REACT_APP_URL_PIONEER_SPEC
      })
    }


    //listen to events on main
    ipcRenderer.on('hardware', (event, data) => {
      switch (data.event.event) {
        case 'connect':
          console.log('connect')
          playSound('success')
          break
        case 'disconnect':
          console.log('disconnect')
          playSound('fail')
          break
        default:
        //Spammy
        //console.log("unhandled event! ",data.event)
      }
    })

    ipcRenderer.on('playSound', (event:any, data:any) => {
      console.log('sound: ', data)
      // playSound(data.sound)
    })

    ipcRenderer.on('attach', (event:any, data:any) => {
      console.log('attach', data)
      // playSound('success')
      dispatch({ type: WalletActions.SET_KEEPKEY_STATE, payload: data.state })
      dispatch({ type: WalletActions.SET_KEEPKEY_STATUS, payload: data.status })
    })

    ipcRenderer.on('detach', (event:any, data:any) => {
      console.log('detach', data)
      playSound('fail')
      dispatch({ type: WalletActions.SET_KEEPKEY_STATE, payload: data.state })
      dispatch({ type: WalletActions.SET_KEEPKEY_STATUS, payload: data.status })
    })

    ipcRenderer.on('setKeepKeyState', (event:any, data:any) => {
      dispatch({ type: WalletActions.SET_KEEPKEY_STATE, payload: data.state })
      dispatch({ type: WalletActions.SET_KEEPKEY_STATUS, payload: data.status })
    })

    ipcRenderer.on('setKeepKeyStatus', (event:any, data:any) => {
      dispatch({ type: WalletActions.SET_KEEPKEY_STATE, payload: data.state })
      dispatch({ type: WalletActions.SET_KEEPKEY_STATUS, payload: data.status })
    })

    ipcRenderer.on('setDevice', (event:any, data:any) => {
      console.log('setDevice', data)
    })

    ipcRenderer.on('getPubkeys', (event:any, data:any) => {
      console.log('getPubkeys', data)
    })

    ipcRenderer.on('signTx', async (event:any, data:any) => {
      console.log('signTransaction', data.payload.data.HDwalletPayload)
      let unsignedTx = data.payload.data
      //open signTx
      sign.open(data.payload.data)
    })

    //start pioneer
    async function startPioneer() {
      try {
        console.log('onStartPioneer')
        //pioneer
        let initResult = await pioneer.init()
        console.log('initResult: ', initResult)
        if (pioneer.App.isPaired) {
          //set context
          if (initResult.balances)
            dispatch({ type: WalletActions.SET_BALANCES, payload: initResult.balances })
          if (initResult.context)
            dispatch({ type: WalletActions.SET_CONTEXT, payload: initResult.context })
          if (initResult.username)
            dispatch({ type: WalletActions.SET_USERNAME, payload: initResult.username })
          if (pioneer) dispatch({ type: WalletActions.SET_PIONEER, payload: pioneer })
        } else {
          console.log('app is not paired! can not start. please connect a wallet')
        }
        console.log('initResult: ', initResult)

        if (initResult.code)
          dispatch({ type: WalletActions.SET_PAIRING_CODE, payload: initResult.code })
        //pioneer status
        let status = await pioneer.getStatus()
        if (status) dispatch({ type: WalletActions.SET_STATUS, payload: status })

        pioneer.events.on('invocations', async (event: any) => {
          console.log('pioneer event: ', event)
          switch (event.type) {
            case 'context':
              console.log('context event! event: ', event)
              break
            case 'pairing':
              console.log('Paired!', event)
              break
            case 'signRequest':
              console.log('unsignedTx!', event)
              sign.open(event)
              break
            default:
              console.error(' message unknown type:', event)
          }
        })

        // pioneer.events.on('invocations', async (event: any) => {
        //   console.log('invocations event: ', event)
        //   ipcRenderer.send('showWindow')
        //   let invocationInfo = await pioneer.App.getInvocation(event.invocationId)
        //   sign.open(invocationInfo)
        // })

      } catch (e) {
        console.error(e)
      }
    }
    startPioneer()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.wallet]) // we explicitly only want this to happen once

  //connect()
  const connect = useCallback(
    async (type: KeyManager) => {
      console.log('WalletProvider Connect: ', type)
      if (type === 'keepkey') {
        const adapter = SUPPORTED_WALLETS['keepkey'].adapter.useKeyring(state.keyring)
        try {
          let HDWallet = await adapter.pairDevice('http://localhost:1646')
          let isInitialized = await HDWallet.isInitialized()
          if (HDWallet && pioneer.username && isInitialized && state.keyring) {
            // let resultPair = await pioneer.pairWallet('keepkey', HDWallet)
            // console.log('resultPair: ', resultPair)
            const adapters: Adapters = new Map()
            adapters.set('keepkey' as KeyManager, adapter)
            dispatch({ type: WalletActions.SET_ADAPTERS, payload: adapters })
          } else {
            console.error('Failed to start wallet!')
          }
        } catch (e) {
          dispatch({ type: WalletActions.SET_KEEPKEY_STATE, payload: '-1' })
          dispatch({
            type: WalletActions.SET_KEEPKEY_STATUS,
            payload: 'error: failed to connect to bridge'
          })
        }
      }
      dispatch({ type: WalletActions.SET_CONNECTOR_TYPE, payload: type })
      if (SUPPORTED_WALLETS[type]?.routes[0]?.path) {
        dispatch({
          type: WalletActions.SET_INITIAL_ROUTE,
          payload: SUPPORTED_WALLETS[type].routes[0].path as string
        })
      }
    },
    [state.keyring]
  )

  const disconnect = useCallback(() => {
    state.wallet?.disconnect()
    dispatch({ type: WalletActions.RESET_STATE })
  }, [state.wallet])

  const value: IWalletContext = useMemo(
    () => ({ state, dispatch, connect, disconnect, pioneer }),
    [state, connect, disconnect, pioneer]
  )

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletViewsRouter />
    </WalletContext.Provider>
  )
}

export const useWallet = (): IWalletContext =>
  useContext(WalletContext as React.Context<IWalletContext>)
