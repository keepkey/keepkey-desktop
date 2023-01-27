import { PinMatrixRequestType as PinMatrixRequestTypeDeviceProto } from '@keepkey/device-protocol/lib/types_pb'
import * as Comlink from 'comlink'
import { assertNever, deferred } from 'common-utils'
import type { PairingProps } from 'components/Modals/Pair/types'
import { WalletActions } from 'context/WalletProvider/actions'
import { PinMatrixRequestType } from 'context/WalletProvider/KeepKey/KeepKeyTypes'
import { useKeepKey } from 'context/WalletProvider/KeepKeyProvider'
import { ipcListeners } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { Routes } from 'Routes/Routes'

import type { KKStateData } from '../../keepkey-desktop/src/helpers/kk-state-controller/types'
import { KKState } from '../../keepkey-desktop/src/helpers/kk-state-controller/types'
import type { RendererIpc } from '../../keepkey-desktop/src/types'
import type { PinMatrixRequestType2 } from '../../keepkey-desktop/src/types'

const mapPinRequestType = (pinRequestType: PinMatrixRequestType2) => {
  switch (pinRequestType) {
    case PinMatrixRequestTypeDeviceProto.PINMATRIXREQUESTTYPE_CURRENT:
      return PinMatrixRequestType.CURRENT
    case PinMatrixRequestTypeDeviceProto.PINMATRIXREQUESTTYPE_NEWFIRST:
      return PinMatrixRequestType.NEWFIRST
    case PinMatrixRequestTypeDeviceProto.PINMATRIXREQUESTTYPE_NEWSECOND:
      return PinMatrixRequestType.NEWSECOND
    default:
      assertNever(pinRequestType)
  }
}

export const App = () => {
  const { dispatch, pairAndConnect, setDeviceState } = useWallet()
  const { setIsUpdatingKeepkey, state, disconnect } = useWallet()
  const { legacyBridge, isLegacy, isConnected } = useWalletConnect()
  const { updateFeatures } = useKeepKey()
  const history = useHistory()

  const { pair, sign, hardwareError, updateKeepKey, requestBootloaderMode, loading } = useModal()

  const openKeepKeyUpdater = (data: KKStateData) => {
    setIsUpdatingKeepkey(true)
    requestBootloaderMode?.close()
    updateKeepKey.open(data)
  }

  const closeAllModals = useCallback(() => {
    updateKeepKey.close()
    loading.close()
    requestBootloaderMode.close()
    hardwareError.close()
    pair.close()
    sign.close()
  }, [hardwareError, loading, pair, requestBootloaderMode, sign, updateKeepKey])

  const openDapp = (url: string) => {
    dispatch({ type: WalletActions.SET_BROWSER_URL, payload: url })
    history.push('/browser')
  }

  const [connected, setConnected] = useState(false)

  // open hardwareError modal on app start unless already connected
  useEffect(() => {
    if (connected !== null) {
      if (!hardwareError.isOpen && !connected) {
        hardwareError.open({})
      }
      if (connected) {
        const defaultDapp = localStorage.getItem('@app/defaultDapp')
        if (!defaultDapp || defaultDapp === '') return
        try {
          const app = JSON.parse(defaultDapp)
          if (!app.url) return
          openDapp(app.url)
        } catch (error) {
          return
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected])

  // get whether or not bridge is connected for hardwareError modal
  useEffect(() => {
    ipcListeners.clearBrowserSession()
    if (connected === null) {
      ipcListeners.bridgeConnected().then(x => {
        setConnected(x)
        setIsUpdatingKeepkey(false)
      })
    }
  }, [hardwareError, connected, setConnected, setIsUpdatingKeepkey])

  useEffect(() => {
    // This is necessary so when it re-opens the tcp connection everything is good
    state.wallet?.disconnect()

    // This hack avoids the dreaded "unknown" firmware version after replugging the
    // device in bootloader mode. Note that if a user unplugs one device and plugs
    // in a different one with different firmware in bootloader mode, this will lie
    // to the user and pretend the previous device's firmware is installed.
    let lastFirmware: string | undefined = undefined

    const rendererIpc: RendererIpc = {
      async updateState(data: KKStateData) {
        console.log('updateState', data)
        const state = data.state
        if (
          ![
            KKState.Plugin,
            KKState.Disconnected,
            KKState.UpdateBootloader,
            KKState.UpdateFirmware,
          ].includes(state)
        ) {
          lastFirmware = undefined
        }
        switch (state) {
          case KKState.Plugin:
            loading.open({ closing: false })
            setConnected(true)
            hardwareError.close()
            break
          case KKState.Disconnected:
            hardwareError.close()
            hardwareError.open({})
            dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
            disconnect()
            loading.close()
            break
          case KKState.HardwareError:
            dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
            loading.close()
            hardwareError.open(data)
            break
          case KKState.UpdateBootloader:
          case KKState.UpdateFirmware:
            closeAllModals()
            if (!data.bootloaderMode) {
              if (data.firmware && data.firmware !== 'unknown') lastFirmware = data.firmware
              setIsUpdatingKeepkey(true)
              setConnected(true)
              const skipUpdate = deferred()
              skipUpdate.then(async () => {
                await ipcListeners.keepkeySkipUpdate()
                setIsUpdatingKeepkey(false)
                updateKeepKey.close()
                requestBootloaderMode.close()
              })
              requestBootloaderMode.open({
                skipUpdate,
                recommendedFirmware: data.recommendedFirmware,
                firmware: data.firmware,
                bootloaderUpdateNeeded: state === KKState.UpdateBootloader,
              })
            } else {
              openKeepKeyUpdater({
                ...data,
                firmware:
                  (!data.firmware || data.firmware === 'unknown') && lastFirmware
                    ? lastFirmware
                    : data.firmware,
              })
            }
            break
          case KKState.NeedsInitialize:
          case KKState.Connected:
            closeAllModals()
            setIsUpdatingKeepkey(false)
            if (state === KKState.NeedsInitialize) {
              openKeepKeyUpdater(data)
            }
            setConnected(true)
            // if needs initialize we do the normal pair process and then web detects that it needs initialize
            pairAndConnect.current()
            break
          case KKState.NeedsReconnect:
            dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
            setIsUpdatingKeepkey(false)
            loading.close()
            hardwareError.open({ needsReconnect: true })
            break
          default:
            assertNever(state)
        }
      },

      async appClosing() {
        loading.open({ closing: true })
        if (isLegacy && isConnected && legacyBridge) legacyBridge.disconnect()
        await state.wallet?.clearSession()
      },

      async modalPair(data: PairingProps) {
        const out = deferred<boolean>()
        pair.open({ deferred: out, input: data })
        return await out
      },

      async modalPin(pinRequestType2: PinMatrixRequestType2): Promise<string> {
        const pinRequestType: PinMatrixRequestType = mapPinRequestType(pinRequestType2)
        if (window.localStorage.getItem('onboarded') !== 'true') {
          await new Promise(resolve => {
            const interval = setInterval(() => {
              if (window.localStorage.getItem('onboarded') === 'true') {
                resolve(true)
                clearInterval(interval)
              }
            }, 500)
          })
          hardwareError.close()
        }
        const out = deferred<string>()
        dispatch({
          type: WalletActions.OPEN_KEEPKEY_PIN,
          payload: {
            pinRequestType,
            showBackButton: state.deviceState.disposition === 'initialized',
            deferred: out,
          },
        })
        return await out
      },

      async modalPassphrase(): Promise<string> {
        const out = deferred<string>()
        dispatch({
          type: WalletActions.OPEN_KEEPKEY_PASSPHRASE,
          payload: {
            deferred: out,
          },
        })
        return await out
      },

      async modalRecovery(characterPos?: number, wordPos?: number): Promise<string | boolean> {
        if (characterPos === undefined && wordPos === undefined) {
          setDeviceState({ awaitingDeviceInteraction: true })
          dispatch({
            type: WalletActions.OPEN_KEEPKEY_CHARACTER_REQUEST,
            payload: {
              characterPos: undefined,
              wordPos: undefined,
            },
          })
          return false
        } else {
          setDeviceState({ awaitingDeviceInteraction: false })
          const out = deferred<string | boolean>()
          dispatch({
            type: WalletActions.OPEN_KEEPKEY_CHARACTER_REQUEST,
            payload: {
              characterPos,
              wordPos,
              deferred: out,
            },
          })
          return await out
        }
      },

      async modalCloseAll(): Promise<void> {
        dispatch({
          type: WalletActions.SET_WALLET_MODAL,
          payload: false,
        })
        state.passphraseDeferred?.reject()
        state.pinDeferred?.reject()
      },

      async updateFeatures(): Promise<void> {
        updateFeatures()
      },

      async accountSignTx(data: {
        invocation: {
          unsignedTx: {
            type: string
            network: string
            verbal: string
            transaction: {
              addressFrom: string
              protocol: string
              router: string
              memo: string
              recipient: string
              amount: string
              asset: string
            }
            HDwalletPayload: {
              nonce: string
              gasLimit: string
              gasPrice: string
            }
          }
        }
      }) {
        const out = deferred<{}>()
        sign.open({ unsignedTx: data, deferred: out })
        return await out
      },
    }

    // inform the electron process we are ready to receive ipc messages
    const { port1, port2 } = new MessageChannel()
    Comlink.expose(rendererIpc, port1)
    window.postMessage({ type: '@app/register-render-listeners', payload: port2 }, '*', [port2])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Routes />
}
