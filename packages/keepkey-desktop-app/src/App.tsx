import type { PairingProps } from 'components/Modals/Pair/Pair'
import { WalletActions } from 'context/WalletProvider/actions'
import { PinMatrixRequestType } from 'context/WalletProvider/KeepKey/KeepKeyTypes'
import { ipcRenderer } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useEffect, useState } from 'react'
import { Routes } from 'Routes/Routes'

import type { KKStateData } from '../../keepkey-desktop/src/helpers/kk-state-controller/types'
import { KKState } from '../../keepkey-desktop/src/helpers/kk-state-controller/types'

export const App = () => {
  const {
    state: { deviceId },
    dispatch,
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
      ipcRenderer.on('@bridge/connected', (_event: unknown, connected: boolean) => {
        setConnected(connected)
        setIsUpdatingKeepkey(false)
      })
      ipcRenderer.send('@bridge/connected')
    }
  }, [hardwareError, connected, setConnected, setIsUpdatingKeepkey])

  useEffect(() => {
    // This is necessary so when it re-opens the tcp connection everything is good
    state.wallet?.disconnect()

    ipcRenderer.on('requestPin', () => {
      dispatch({
        type: WalletActions.OPEN_KEEPKEY_PIN,
        payload: {
          deviceId,
          pinRequestType: PinMatrixRequestType.CURRENT,
          showBackButton: true,
        },
      })
    })

    ipcRenderer.on('appClosing', async () => {
      loading.open({ closing: true })
      await state.wallet?.clearSession()
    })

    ipcRenderer.on('@modal/pair', (_event: unknown, data: PairingProps) => {
      pair.open(data)
    })

    // This hack avoids the dreaded "unknown" firmware version after replugging the
    // device in bootloader mode. Note that if a user unplugs one device and plugs
    // in a different one with different firmware in bootloader mode, this will lie
    // to the user and pretend the previous device's firmware is installed.
    let lastFirmware: string | undefined = undefined
    ipcRenderer.on('updateState', (_event: unknown, data: KKStateData) => {
      console.log('updateState', data)
      if (
        ![
          KKState.Plugin,
          KKState.Disconnected,
          KKState.UpdateBootloader,
          KKState.UpdateFirmware,
        ].includes(data.state)
      ) {
        lastFirmware = undefined
      }
      switch (data.state) {
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
            requestBootloaderMode.open({
              recommendedFirmware: data.recommendedFirmware,
              firmware: data.firmware,
              bootloaderUpdateNeeded: data.state === KKState.UpdateBootloader,
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
          if (data.state === KKState.NeedsInitialize) {
            openKeepKeyUpdater(data)
          }
          setConnected(true)
          break
        case KKState.NeedsReconnect:
          dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
          loading.close()
          hardwareError.open({ needsReconnect: true })
          break
        default:
      }
    })

    ipcRenderer.on('@keepkey/update-skipped', () => {
      setIsUpdatingKeepkey(false)
      updateKeepKey.close()
      requestBootloaderMode.close()
    })

    ipcRenderer.on('@modal/pin', () => {
      dispatch({
        type: WalletActions.OPEN_KEEPKEY_PIN,
        payload: {
          deviceId,
          showBackButton: false,
        },
      })
    })

    ipcRenderer.on('@account/sign-tx', async (_event: unknown, data: any) => {
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

    // inform the electron process we are ready to receive ipc messages
    ipcRenderer.send('renderListenersReady', {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Routes />
}
