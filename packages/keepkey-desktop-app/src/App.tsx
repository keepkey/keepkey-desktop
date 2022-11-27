import { ipcRenderer } from 'electron-shim'
import { useEffect, useState } from 'react'
import { Routes } from 'Routes/Routes'
import type { PairingProps } from 'components/Modals/Pair/Pair'
import { WalletActions } from 'context/WalletProvider/actions'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'

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

  const closeAllModals = () => {
    updateKeepKey.close()
    loading.close()
    requestBootloaderMode.close()
    hardwareError.close()
    pair.close()
    sign.close()
  }

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
      ipcRenderer.on('@bridge/connected', (_event, _connected: boolean) => {
        setConnected(_connected)
      })
      ipcRenderer.send('@bridge/connected')
    }
  }, [hardwareError, connected, setConnected])

  useEffect(() => {
    // This is necessary so when it re-opens the tcp connection everything is good
    state.wallet?.disconnect()

    ipcRenderer.on('plugin', () => {
      loading.open({ closing: false })
      setConnected(true)
      hardwareError.close()
    })

    ipcRenderer.on('connected', async (_event, _data) => {
      setConnected(true)
      hardwareError.close()
    })

    ipcRenderer.on('appClosing', async () => {
      loading.open({ closing: true })
      await state.wallet?.clearSession()
    })

    ipcRenderer.on('hardwareError', () => {
      dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
      loading.close()
      hardwareError.open({})
    })

    ipcRenderer.on('disconnected', () => {
      dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: false })
      disconnect()
      loading.close()
    })

    ipcRenderer.on('@modal/pair', (_event, data: PairingProps) => {
      pair.open(data)
    })

    ipcRenderer.on('needsInitialize', (_event, data) => {
      closeAllModals()
      openKeepKeyUpdater(data)
      setConnected(null)
    })

    ipcRenderer.on('updateBootloader', (_event, data) => {
      if (!data.event?.bootloaderMode) {
        closeAllModals()
        setIsUpdatingKeepkey(true)
        setConnected(true)
        requestBootloaderMode.open({})
      } else {
        closeAllModals()
        openKeepKeyUpdater(data)
      }
    })

    ipcRenderer.on('updateFirmware', (_event, data) => {
      closeAllModals()
      openKeepKeyUpdater(data)
    })

    ipcRenderer.on('@modal/pin', (_event, _data) => {
      dispatch({
        type: WalletActions.OPEN_KEEPKEY_PIN,
        payload: {
          deviceId,
          showBackButton: false,
        },
      })
    })

    ipcRenderer.on('@account/sign-tx', async (_event: any, data: any) => {
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
        // eslint-disable-next-line @keepkey/logger/no-native-console
        console.error('INVALID SIGN PAYLOAD!', JSON.stringify(unsignedTx))
      }
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <Routes />
}
