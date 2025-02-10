import type { ToastId } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import type { Features } from '@keepkey/device-protocol/lib/messages_pb'
import type { KeepKeyHDWallet } from '@keepkey/hdwallet-keepkey'
import { isKeepKey } from '@keepkey/hdwallet-keepkey'
import { assertNever } from 'common-utils'
import type { RadioOption } from 'components/Radio/Radio'
import { useWallet } from 'hooks/useWallet/useWallet'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { useTranslate } from 'react-polyglot'

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
  updateFeatures: () => void
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
  ])

  const value: IKeepKeyContext = useMemo(
    () => ({
      state,
      keepKeyWallet,
      setHasPassphrase,
      updateFeatures,
    }),
    [state, keepKeyWallet, setHasPassphrase, updateFeatures],
  )

  return <KeepKeyContext.Provider value={value}>{children}</KeepKeyContext.Provider>
}

export const useKeepKey = (): IKeepKeyContext =>
  useContext(KeepKeyContext as React.Context<IKeepKeyContext>)
