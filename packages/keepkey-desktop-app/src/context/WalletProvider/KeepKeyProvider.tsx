import type { ToastId } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import type { Asset } from '@keepkey/asset-service'
import type { Features } from '@keepkey/device-protocol/lib/messages_pb'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { isKeepKey } from '@shapeshiftoss/hdwallet-keepkey'
import axios from 'axios'
import { assertNever } from 'common-utils'
import type { RadioOption } from 'components/Radio/Radio'
import { getConfig } from 'config'
import { useWallet } from 'hooks/useWallet/useWallet'
import { erc20Abi } from 'pages/Leaderboard/helpers/erc20Abi'
import { nftAbi } from 'pages/Leaderboard/helpers/nftAbi'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import { useTranslate } from 'react-polyglot'
import Web3 from 'web3'
import { getPioneerClient } from 'lib/getPioneerCleint'
import { useKeepKeyVersions } from './KeepKey/hooks/useKeepKeyVersions'

export enum DeviceTimeout {
  TenMinutes = '600000',
  FifteenMinutes = '900000',
  TwentyMinutes = '1200000',
  ThirtyMinutes = '1800000',
  FortyFiveMinutes = '2700000',
  SixtyMinutes = '3600000',
}

export const timeoutOptions: readonly RadioOption<DeviceTimeout>[] = Object.freeze([
  {
    value: DeviceTimeout.TenMinutes,
    label: ['walletProvider.keepKey.settings.descriptions.timeoutDuration', { minutes: '10' }],
  },
  {
    value: DeviceTimeout.FifteenMinutes,
    label: ['walletProvider.keepKey.settings.descriptions.timeoutDuration', { minutes: '15' }],
  },
  {
    value: DeviceTimeout.TwentyMinutes,
    label: ['walletProvider.keepKey.settings.descriptions.timeoutDuration', { minutes: '20' }],
  },
  {
    value: DeviceTimeout.ThirtyMinutes,
    label: ['walletProvider.keepKey.settings.descriptions.timeoutDuration', { minutes: '30' }],
  },
  {
    value: DeviceTimeout.FortyFiveMinutes,
    label: ['walletProvider.keepKey.settings.descriptions.timeoutDuration', { minutes: '45' }],
  },
  {
    value: DeviceTimeout.SixtyMinutes,
    label: ['walletProvider.keepKey.settings.descriptions.timeoutDuration', { minutes: '60' }],
  },
])

export enum KeepKeyActions {
  SET_HAS_PASSPHRASE = 'SET_HAS_PASSPHRASE',
  SET_DEVICE_TIMEOUT = 'SET_DEVICE_TIMEOUT',
  SET_FEATURES = 'SET_FEATURES',
  RESET_STATE = 'RESET_STATE',
}

export interface InitialState {
  hasPassphrase: boolean | undefined
  features: Features.AsObject | undefined
  keepKeyWallet: KeepKeyHDWallet | undefined
  deviceTimeout: RadioOption<DeviceTimeout> | undefined
}

const initialState: InitialState = {
  hasPassphrase: undefined,
  features: undefined,
  keepKeyWallet: undefined,
  deviceTimeout: timeoutOptions[0],
}

export interface IKeepKeyContext {
  state: InitialState
  setHasPassphrase: (enabled: boolean) => void
  keepKeyWallet: KeepKeyHDWallet | undefined
  getKeepkeyAssets: () => KKAsset[]
  getKeepkeyAsset: (geckoId: string) => KKAsset | undefined
  updateFeatures: () => void
  kkWeb3: Web3 | undefined
  kkNftContract: any
  kkErc20Contract: any
}

export type KeepKeyActionTypes =
  | { type: KeepKeyActions.SET_HAS_PASSPHRASE; payload: boolean | undefined }
  | { type: KeepKeyActions.SET_FEATURES; payload: Features.AsObject | undefined }
  | { type: KeepKeyActions.SET_DEVICE_TIMEOUT; payload: RadioOption<DeviceTimeout> | undefined }
  | { type: KeepKeyActions.RESET_STATE }

const reducer = (state: InitialState, action: KeepKeyActionTypes) => {
  switch (action.type) {
    case KeepKeyActions.SET_HAS_PASSPHRASE:
      return { ...state, hasPassphrase: action.payload }
    case KeepKeyActions.SET_FEATURES:
      const deviceTimeout = Object.values(timeoutOptions).find(
        t => Number(t.value) === action.payload?.autoLockDelayMs,
      )
      return {
        ...state,
        features: action.payload,
        hasPassphrase: !!action.payload?.passphraseProtection,
        deviceTimeout,
      }
    case KeepKeyActions.SET_DEVICE_TIMEOUT:
      return { ...state, deviceTimeout: action.payload }
    case KeepKeyActions.RESET_STATE:
      return initialState
    default:
      assertNever(action)
  }
}

const overrideGeckoName = (name: string) => {
  if (name.toUpperCase() === 'XRP') return 'Ripple'
  if (name.toUpperCase() === 'BNB') return 'Binance'
  else return name
}

export type KKAsset = Asset & { rank: number; marketCap: number; link: string; geckoId: string }

const KeepKeyContext = createContext<IKeepKeyContext | null>(null)

export const KeepKeyProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const {
    state: { wallet },
  } = useWallet()
  const { versions, updaterUrl, isLTCSupportedFirmwareVersion } = useKeepKeyVersions()
  const translate = useTranslate()
  const toast = useToast()
  const keepKeyWallet = useMemo(() => (wallet && isKeepKey(wallet) ? wallet : undefined), [wallet])
  const [state, dispatch] = useReducer(reducer, initialState)
  const toastRef = useRef<ToastId | undefined>()

  const [keepkeyAssets, setKeepkeyAssets] = useState<KKAsset[]>([])

  const [kkWeb3, setkkWeb3] = useState<Web3>()
  const [kkNftContract, setkkNftContract] = useState<any>()
  const [kkErc20Contract, setkkErc20Contract] = useState<any>()

  const loadKeepkeyAssets = useCallback(async () => {
    const pioneer = await getPioneerClient()
    const { data } = await pioneer.SearchAssetsList({ limit: 1000, skip: 0 })

    // const { data } = await axios.get(
    //   'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false',
    // )

    const kkAssets = data.map((asset: any) => {
      const kkAsset: any = {
        assetId: `keepkey_${asset.symbol.toUpperCase()}`,
        chainId: `keepkey_${asset.symbol.toUpperCase()}`,
        // assetId: asset.caip,
        // chainId: asset.caip.split(':')[1],
        color: '',
        explorer: asset.explorer,
        explorerAddressLink: asset.explorerAddressLink,
        explorerTxLink: asset.explorerTxLink,
        icon: asset.image,
        name: asset.name,
        precision: asset.decimals, // This is wrong but needs to exist (find out why)
        symbol: asset.symbol.toUpperCase(),
        // kk specific
        rank: '',
        marketCap: '',
        geckoId: asset.name,
        link: asset.explorer,
      }
      return kkAsset
    })
    setKeepkeyAssets(kkAssets)
  }, [setKeepkeyAssets])

  useEffect(() => {
    loadKeepkeyAssets()
  }, [loadKeepkeyAssets])

  const loadWeb3 = useCallback(() => {
    const web3 = new Web3(
      new Web3.providers.HttpProvider(getConfig().REACT_APP_ETHEREUM_INFURA_URL2),
    )

    const erc20Address = '0xcc5a5975E8f6dF4dDD9Ff4Eb57471a3Ff32526a3'
    const nftAddress = '0xa869a28a7185df50e4abdba376284c44497c4753'
    const nftContract = new web3.eth.Contract(nftAbi as any, nftAddress)
    const erc20Contract = new web3.eth.Contract(erc20Abi as any, erc20Address)

    setkkWeb3(web3)
    setkkNftContract(nftContract)
    setkkErc20Contract(erc20Contract)
  }, [])

  useEffect(() => {
    loadWeb3()
  }, [loadWeb3])

  const getKeepkeyAssets = useMemo(() => () => keepkeyAssets, [keepkeyAssets])

  const getKeepkeyAsset = useCallback(
    (geckoId: string) => {
      return keepkeyAssets.find(kkAsset => kkAsset.geckoId === geckoId)
    },
    [keepkeyAssets],
  )

  const onClose = useCallback(() => {
    if (toastRef.current) {
      toast.close(toastRef.current)
    }
  }, [toast, toastRef])

  const setHasPassphrase = useCallback((payload: boolean | undefined) => {
    dispatch({
      type: KeepKeyActions.SET_HAS_PASSPHRASE,
      payload,
    })
  }, [])

  const updateFeatures = useCallback(() => {
    if (!keepKeyWallet) return
    keepKeyWallet
      .getFeatures(false)
      .then(payload => dispatch({ type: KeepKeyActions.SET_FEATURES, payload }))
      .catch(e => console.error('updateFeatures error:', e))
  }, [keepKeyWallet])

  useEffect(() => {
    updateFeatures()
  }, [updateFeatures])

  useEffect(() => {
    if (!keepKeyWallet) return
    ;(async () => {
      if (!versions || !updaterUrl) return
    })()
  }, [
    isLTCSupportedFirmwareVersion,
    keepKeyWallet,
    toast,
    translate,
    versions,
    onClose,
    updaterUrl,
    getKeepkeyAsset,
  ])

  const value: IKeepKeyContext = useMemo(
    () => ({
      state,
      keepKeyWallet,
      setHasPassphrase,
      getKeepkeyAssets,
      getKeepkeyAsset,
      updateFeatures,
      kkWeb3,
      kkNftContract,
      kkErc20Contract,
    }),
    [
      state,
      keepKeyWallet,
      setHasPassphrase,
      getKeepkeyAssets,
      getKeepkeyAsset,
      updateFeatures,
      kkWeb3,
      kkNftContract,
      kkErc20Contract,
    ],
  )

  return <KeepKeyContext.Provider value={value}>{children}</KeepKeyContext.Provider>
}

export const useKeepKey = (): IKeepKeyContext =>
  useContext(KeepKeyContext as React.Context<IKeepKeyContext>)
