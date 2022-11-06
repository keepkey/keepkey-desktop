import { WCService } from 'kkdesktop/walletconnect'
import { WCSessionManager } from 'kkdesktop/walletconnect/sessionManager'
import type { WalletConnectCallRequest } from 'kkdesktop/walletconnect/types'
import type { FC, PropsWithChildren } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'hooks/useWallet/useWallet'

import { CallRequestModal } from './components/modal/callRequest/CallRequestModal'
import type { TxData } from './components/modal/callRequest/SendTransactionConfirmation'
import { WalletConnectBridgeContext } from './WalletConnectBridgeContext'

export const WalletConnectBridgeProvider: FC<PropsWithChildren> = ({ children }) => {
  const wallet = useWallet().state.wallet
  const [bridge, setBridge] = useState<WCService>()
  const [sessionManager, setSessionManager] = useState<WCSessionManager>()

  const [callRequests, setCallRequests] = useState<WalletConnectCallRequest[]>([])
  const onCallRequest = useCallback(
    (request: WalletConnectCallRequest) => setCallRequests(prev => [...prev, request]),
    [],
  )
  const approveRequest = useCallback(
    async (request: WalletConnectCallRequest, txData: TxData) => {
      await bridge?.approveRequest(request, txData)
      setCallRequests(prev => prev.filter(req => req.id !== request.id))
    },
    [bridge],
  )
  const rejectRequest = useCallback(
    async (request: WalletConnectCallRequest) => {
      await bridge?.rejectRequest(request)
      setCallRequests(prev => prev.filter(req => req.id !== request.id))
    },
    [bridge],
  )

  useEffect(() => {
    if (!sessionManager || !sessionManager.currentSessionKey) return
    const session = sessionManager.sessions.find(s => s.key === sessionManager.currentSessionKey)
    if (!session || !session.service) return
    setBridge(session.service)
  }, [sessionManager])

  const [, setTick] = useState(0)
  const rerender = useCallback(() => setTick(prev => prev + 1), [])

  const disconnect = useCallback(async () => {
    if (!bridge || !sessionManager) return
    await bridge.disconnect()
    sessionManager.removeSession(bridge.connector.session.key)
    setBridge(undefined)
  }, [bridge, sessionManager])

  useEffect(() => {
    if (!wallet) return
    const manager = new WCSessionManager(wallet, { onCallRequest, disconnect, rerender })
    setSessionManager(manager)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet])

  const connect = useCallback(
    async (uri: string) => {
      if (!wallet) {
        alert('TODO: No HDWallet connected')
        return
      }
      if (!('_supportsETH' in wallet)) {
        alert('TODO: No ETH HDWallet connected')
        return
      }

      if (!sessionManager) return

      const newBridge = WCService.fromURI(uri, wallet, {
        onCallRequest: req => {
          if (newBridge.connector.connected)
            sessionManager.setCurrentSessionKey(newBridge.connector.key)
          onCallRequest(req)
        },
      })
      newBridge.connector.on('connect', () => {
        sessionManager.addSession(newBridge.connector.session, newBridge)
        rerender()
      })
      newBridge.connector.on('disconnect', disconnect)
      await newBridge.connect()
      setBridge(newBridge)
    },
    [wallet, onCallRequest, disconnect, sessionManager, rerender],
  )

  const dapp = bridge?.connector.peerMeta ?? undefined

  return (
    <WalletConnectBridgeContext.Provider
      value={{ bridge, dapp, callRequests, connect, disconnect, approveRequest, rejectRequest }}
    >
      {children}
      <CallRequestModal callRequest={callRequests[0]} />
    </WalletConnectBridgeContext.Provider>
  )
}
