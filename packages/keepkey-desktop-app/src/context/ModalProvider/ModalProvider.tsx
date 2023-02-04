import { WipeModal } from 'components/Layout/Header/NavBar/KeepKey/Modals/WipeModal'
import { AddAuthenticatorAccountModal } from 'components/Modals/AddAuthenticatorAccount/AddAuthenticatorAccount'
import { AssetSearchModal } from 'components/Modals/AssetSearch/AssetSearch'
import { ChainSelectorModal } from 'components/Modals/ChainSelector/ChainSelector'
import { DappClickModal } from 'components/Modals/DappClick/DappClick'
import { KKVote } from 'components/Modals/kkVote/KKVote'
import { LoadingModal } from 'components/Modals/Loading/Loading'
import { Languages } from 'components/Modals/OnboardingSteps/Languages'
import { OnboardingSteps } from 'components/Modals/OnboardingSteps/OnboardingSteps'
import { PairModal } from 'components/Modals/Pair/Pair'
import { ReceiveModal } from 'components/Modals/Receive/Receive'
import { SendModal } from 'components/Modals/Send/Send'
import { SettingsModal } from 'components/Modals/Settings/Settings'
import { SignModal } from 'components/Modals/Sign/Sign'
import { HardwareErrorModal } from 'components/Modals/UpdateKeepKey/HardwareError/HardwareError'
import { RequestBootloaderMode } from 'components/Modals/UpdateKeepKey/RequestBootloaderMode/RequestBootloaderMode'
import { UpdateKeepKey } from 'components/Modals/UpdateKeepKey/UpdateKeepKey'
import merge from 'lodash/merge'
import noop from 'lodash/noop'
import { AddAccountModal } from 'pages/Accounts/AddAccountModal'
import React, { useMemo, useReducer } from 'react'

import { ModalContext } from './ModalContext'

declare module 'csstype' {
  interface Properties {
    '--chakra-zIndices-modal'?: number
  }
}

// to add new modals, add a new key: value pair below
// the key is the name returned by the hook and the
// component is the modal to be rendered
const MODALS = {
  receive: ReceiveModal,
  send: SendModal,
  sign: SignModal,
  pair: PairModal,
  settings: SettingsModal,
  keepKeyWipe: WipeModal,
  addAccount: AddAccountModal,
  assetSearch: AssetSearchModal,
  addAuthenticatorAccount: AddAuthenticatorAccountModal,
  requestBootloaderMode: RequestBootloaderMode,
  updateKeepKey: UpdateKeepKey,
  kkVote: KKVote,
  loading: LoadingModal,
  chainSelector: ChainSelectorModal,
  dappClick: DappClickModal,
  languages: Languages,
  hardwareError: HardwareErrorModal,
  onboardingSteps: OnboardingSteps,
}

// Extra z-index to apply to various modals -- used to make things appear on top of WalletProvider modals, which show up at 9500.
const extraSpecialModals: Record<string, number> = {
  onboardingSteps: 500,
} satisfies Partial<Record<keyof typeof MODALS, number>>

// state
export type ModalState<M> = {
  [K in keyof M]: {
    Component: ModalComponents<M>[K]
    props: ModalProps<M>[K]
    open: (props: ModalProps<M>[K]) => void
    close: () => void
    isOpen: boolean
    zIndex: number
  }
}

// helpers for state type
type ModalComponents<M> = {
  [k in keyof M]: M[k]
}
type ModalProps<M extends ModalSetup<M>> = {
  [k in keyof M]: React.ComponentProps<M[k]>
}

// action types
type ModalActions<M extends ModalSetup<M>> = OpenModalType<M> | CloseModalType<M>

const OPEN_MODAL = 'OPEN_MODAL'
const CLOSE_MODAL = 'CLOSE_MODAL'

type OpenModalType<M extends ModalState<M>> = {
  type: typeof OPEN_MODAL
  name: keyof M
  props: ModalProps<M>
}

type CloseModalType<M> = {
  type: typeof CLOSE_MODAL
  name: keyof M
}

type ModalSetup<S extends ModalSetup<S>> = {
  [k in keyof S]: ModalState<S>[k]['Component']
}

export function createInitialState<S extends {}>(modalSetup: S): ModalState<S> {
  const modalMethods = { isOpen: false, open: noop, close: noop }
  const modalNames = Object.keys(modalSetup) as (keyof S)[]
  const result = modalNames.reduce(
    (acc, modalName, i) => ({
      ...acc,
      [modalName]: {
        ...modalMethods,
        Component: modalSetup[modalName],
        zIndex: 9000 + i + (extraSpecialModals[String(modalName)] ?? 0),
      },
    }),
    {} as ModalState<S>,
  )
  return result
}

// state
const initialState = createInitialState(MODALS)

// reducer
export function modalReducer<S extends ModalState<any>>(state: S, action: ModalActions<S>): S {
  switch (action.type) {
    case OPEN_MODAL:
      return {
        ...state,
        [action.name]: { ...state[action.name], isOpen: true, props: action.props },
      }
    case CLOSE_MODAL:
      return { ...state, [action.name]: { ...state[action.name], isOpen: false } }
    default:
      return state
  }
}

type ModalProviderProps = {
  children: React.ReactNode
}

type CreateModalProviderProps<M> = {
  instanceInitialState: M
  instanceReducer: (state: M, action: ModalActions<M>) => M
  InstanceModalContext: React.Context<M>
}
export type ModalStateType = typeof initialState
// provider
export function createModalProvider<M extends ModalState<any>>({
  instanceInitialState,
  instanceReducer,
  InstanceModalContext,
}: CreateModalProviderProps<M>) {
  return ({ children }: ModalProviderProps) => {
    const [state, dispatch] = useReducer(instanceReducer, instanceInitialState)

    const openFactory = useMemo(
      () => (name: keyof M) => (props: ModalProps<M>) =>
        dispatch({ type: OPEN_MODAL, name, props }),
      [],
    )

    const closeFactory = useMemo(
      () => (name: keyof M) => () => dispatch({ type: CLOSE_MODAL, name }),
      [],
    )

    const value = useMemo(() => {
      const modalKeys = Object.keys(instanceInitialState) as (keyof M)[]
      const fns = modalKeys.reduce((acc, cur) => {
        const open = openFactory(cur)
        const close = closeFactory(cur)
        return { ...acc, [cur]: { open, close } }
      }, state)
      const result = merge(state, fns)
      return result
    }, [state, openFactory, closeFactory])

    return (
      <InstanceModalContext.Provider value={value}>
        {children}
        {Object.entries(value).map(([key, Modal]) => (
          <Modal.Component key={key} {...Modal.props} />
        ))}
      </InstanceModalContext.Provider>
    )
  }
}

export const ModalProvider = createModalProvider({
  instanceInitialState: initialState,
  instanceReducer: modalReducer,
  InstanceModalContext: ModalContext,
})
