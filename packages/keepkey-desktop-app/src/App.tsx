import type { PairingProps } from 'components/Modals/Pair/Pair'
import { WalletActions } from 'context/WalletProvider/actions'
import { PinMatrixRequestType } from 'context/WalletProvider/KeepKey/KeepKeyTypes'
import { ipcRenderer } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useEffect, useState } from 'react'
import { Routes } from 'Routes/Routes'

export const App = () => {
  const {
    state: { deviceId },
    dispatch,
  } = useWallet()
  const { setIsUpdatingKeepkey, state, disconnect } = useWallet()

  const { pair, sign, hardwareError, updateKeepKey, requestBootloaderMode, loading } = useModal()

  const openKeepKeyUpdater = (data: any) => {
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

  const [connected, setConnected] = useState<any>(null)

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
    ipcRenderer.on('plugin', () => {
      loading.open({ closing: false })
      setConnected(true)
      hardwareError.close()
    })

    ipcRenderer.on('connected', async () => {
      setConnected(true)
      hardwareError.close()
    })

    ipcRenderer.on('appClosing', async () => {
      loading.open({ closing: true })
      await state.wallet?.clearSession()
    })

    ipcRenderer.on('hardwareError', () => {
      console.log('HARDWARE ERROR')
      dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
      loading.close()
      hardwareError.open({})
    })

    ipcRenderer.on('needsReconnect', () => {
      console.log('NEEDS RECONNECT')
      dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
      loading.close()
      hardwareError.open({ needsReconnect: true })
    })

    ipcRenderer.on('disconnected', () => {
      console.log('DISCONNECTED')
      dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
      disconnect()
      loading.close()
    })

    ipcRenderer.on('@modal/pair', (_event: unknown, data: PairingProps) => {
      pair.open(data)
    })

    ipcRenderer.on('needsInitialize', (_event: unknown, data: any) => {
      console.log('NEEDS INITIALIZE')

      closeAllModals()
      openKeepKeyUpdater(data)
      setConnected(true)
    })

    ipcRenderer.on('updateBootloader', (_event: unknown, data: any) => {
      console.log('UPDATE BOOTLOADER', data)
      if (!data.event?.bootloaderMode) {
        closeAllModals()
        setIsUpdatingKeepkey(true)
        setConnected(true)
        requestBootloaderMode.open({ ...data.event })
      } else {
        closeAllModals()
        openKeepKeyUpdater(data)
      }
    })

    ipcRenderer.on('@keepkey/update-skipped', () => {
      setIsUpdatingKeepkey(false)
      updateKeepKey.close()
      requestBootloaderMode.close()
    })

    ipcRenderer.on('updateFirmware', (_event: unknown, data: any) => {
      console.log('UPDATE FIRMWARE')

      closeAllModals()
      openKeepKeyUpdater(data)
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
