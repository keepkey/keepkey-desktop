import * as Comlink from 'comlink'
import { assertNever, deferred } from 'common-utils'
import type { PairingProps } from 'components/Modals/Pair/types'
import { WalletActions } from 'context/WalletProvider/actions'
import { PinMatrixRequestType } from 'context/WalletProvider/KeepKey/KeepKeyTypes'
import { ipcListeners, ipcRenderer } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useEffect, useState } from 'react'
import { Routes } from 'Routes/Routes'

import type { KKStateData } from '../../keepkey-desktop/src/helpers/kk-state-controller/types'
import { KKState } from '../../keepkey-desktop/src/helpers/kk-state-controller/types'
import type { RendererIpc } from '../../keepkey-desktop/src/types'

export const App = () => {
  const {
    state: { deviceId },
    dispatch,
    pairAndConnect,
  } = useWallet()
  const { setIsUpdatingKeepkey, state, disconnect } = useWallet()

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

  const [connected, setConnected] = useState(false)

  // open hardwareError modal on app start unless already connected
  useEffect(() => {
    if (connected !== null) {
      if (!hardwareError.isOpen && !connected) {
        hardwareError.open({})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected])

  // get whether or not bridge is connected for hardwareError modal
  useEffect(() => {
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
            dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
            disconnect()
            loading.close()
            break
          case KKState.HardwareError:
            dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
            loading.close()
            hardwareError.open({})
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
            loading.close()
            hardwareError.open({ needsReconnect: true })
            break
          default:
            assertNever(state)
        }
      },

      async appClosing() {
        loading.open({ closing: true })
        await state.wallet?.clearSession()
      },

      async modalPair(data: PairingProps) {
        const out = deferred<undefined | string[]>()
        pair.open({ deferred: out, data })
        return await out
      },

      async modalPin(): Promise<string> {
        const out = deferred<string>()
        if (window.localStorage.getItem('onboarded') === 'true') {
          dispatch({
            type: WalletActions.OPEN_KEEPKEY_PIN,
            payload: {
              deviceId,
              pinRequestType: PinMatrixRequestType.CURRENT,
              showBackButton: true,
              deferred: out,
            },
          })
        } else {
          await new Promise(resolve => {
            const interval = setInterval(() => {
              if (window.localStorage.getItem('onboarded') === 'true') {
                resolve(true)
                clearInterval(interval)
              }
            }, 500)
          })
          hardwareError.close()
          dispatch({
            type: WalletActions.OPEN_KEEPKEY_PIN,
            payload: {
              deviceId,
              pinRequestType: PinMatrixRequestType.CURRENT,
              showBackButton: true,
              deferred: out,
            },
          })
        }
        return await out
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
    ipcRenderer.postMessage('@app/register-render-listeners', undefined, [port2])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Routes />
}
