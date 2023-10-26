import { useToast } from '@chakra-ui/react'
import type { ETHWallet } from '@shapeshiftoss/hdwallet-core'
import LegacyWalletConnect from '@walletconnect/client'
import type { CoreTypes, SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import * as Comlink from 'comlink'
import type { EthChainData } from 'context/WalletProvider/web3byChainId'
import { web3ByServiceType } from 'context/WalletProvider/web3byChainId'
import { web3ByChainId } from 'context/WalletProvider/web3byChainId'
import { ipcListeners } from 'electron-shim'
import { useWallet } from 'hooks/useWallet/useWallet'
import { LegacyWCService } from 'kkdesktop/walletconnect'
import { getWalletConnect, WalletConnectWeb3Wallet } from 'kkdesktop/walletconnect/utils'
import type { FC, PropsWithChildren } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { WalletConnectLogic } from 'walletconnect/WalletConnectLogic'

import { CallRequestModal } from './components/modal/callRequest/CallRequestModal'
import { SessionProposalModal } from './components/modal/callRequest/SessionProposalModal'
import { WalletConnectBridgeContext } from './WalletConnectBridgeContext'

export const WalletConnectBridgeProvider: FC<PropsWithChildren> = ({ children }) => {
  const wallet = useWallet().state.wallet
  const [legacyBridge, setLegacyBridge] = useState<LegacyWCService>()
  const [pairingMeta, setPairingMeta] = useState<
    CoreTypes.Metadata & { chainId: string | number }
  >()
  const [currentSessionTopic, setCurrentSessionTopic] = useState<string>()
  const [isLegacy, setIsLegacy] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [legacyWeb3, setLegacyWeb3] = useState<EthChainData>()

  const [requests, setRequests] = useState<any[]>([])
  const [proposals, setProposals] = useState<SignClientTypes.EventArguments['session_proposal'][]>(
    [],
  )

  const addRequest = useCallback((req: any) => setRequests(requests.concat(req)), [requests])
  const addProposal = useCallback((req: any) => setProposals(proposals.concat(req)), [proposals])

  const removeRequest = useCallback(
    (id: number) => {
      const newRequests = requests.filter((request: { id: number }) => request.id !== id)
      delete newRequests[id]
      setRequests(newRequests)
    },
    [requests],
  )

  const removeProposal = useCallback(
    (id: number) => {
      const newProposals = proposals.filter((proposal: { id: number }) => proposal.id !== id)
      delete newProposals[id]
      setProposals(newProposals)
    },
    [proposals],
  )

  useEffect(() => {
    if (!requests) return
    console.log("requests: ",requests)
    if (requests.length <= 0) ipcListeners.setAlwaysOnTop(false)
    else if (requests.length >= 1) ipcListeners.setAlwaysOnTop(true)
  }, [requests])

  useEffect(() => {
    if (!proposals) return
    console.log("proposals: ",proposals)
    if (proposals.length <= 0) ipcListeners.setAlwaysOnTop(false)
    else if (proposals.length >= 1) ipcListeners.setAlwaysOnTop(true)
  }, [proposals])

  const [, setTick] = useState(0)
  const rerender = useCallback(() => setTick(prev => prev + 1), [])

  const toast = useToast()

  const onDisconnect = useCallback(async () => {
    if (isLegacy) {
      if (legacyBridge) await legacyBridge.disconnect()
    } else {
      console.log("currentSessionTopic: ",currentSessionTopic)
      WalletConnectWeb3Wallet.disconnectSession({
        topic: currentSessionTopic ?? '',
        reason: getSdkError('USER_DISCONNECTED'),
      })
    }
    setIsConnected(false)
    setIsLegacy(false)
    setLegacyBridge(undefined)
    setCurrentSessionTopic(undefined)
    setPairingMeta(undefined)
    setLegacyWeb3(undefined)
    rerender()
  }, [currentSessionTopic, isLegacy, legacyBridge, rerender])

  const setLegacyEvents = useCallback(
    (wc: LegacyWCService) => {
      wc.connector.on('call_request', (_e, payload) => {
        console.log('call request', payload)
        addRequest(payload)
      })

      wc.connector.off('connect')
      wc.connector.off('disconnect')
      wc.connector.off('wallet_switchEthereumChain')
      wc.connector.on('connect', () => {
        setIsLegacy(true)
        setIsConnected(true)
        if (wc.connector.peerMeta)
          setPairingMeta({ ...wc.connector.peerMeta, chainId: wc.connector.chainId })
        if (wc.connector.chainId) web3ByChainId(Number(wc.connector.chainId)).then(setLegacyWeb3)

        rerender()
      })
      wc.connector.on('disconnect', () => {
        setIsLegacy(false)
        setIsConnected(false)
        setLegacyBridge(undefined)
        setPairingMeta(undefined)
        rerender()
      })
      wc.connector.on('wallet_switchEthereumChain', (_, e) => {
        const chainId = parseInt(e.params[0].chainId, 16)
        toast({
          title: 'Wallet Connect',
          description: `Switched to chainId ${chainId}`,
          isClosable: true,
        })
        web3ByChainId(chainId).then(web3 => {
          if (!web3) return
          if (legacyWeb3 === undefined || legacyWeb3.chainId !== chainId) return setLegacyWeb3(web3)
          if (legacyWeb3.chainId === chainId && web3.service)
            return setLegacyWeb3(web3ByServiceType(web3.service))
        })
        rerender()
      })
    },
    [addRequest, rerender, toast, legacyWeb3],
  )

  const connectWithUri = useCallback(
    async (uri: string) => {
      if (isLegacy && isConnected) await legacyBridge?.disconnect()
      const wc = await getWalletConnect(wallet as ETHWallet, uri)
      if (wc instanceof LegacyWCService) {
        setIsLegacy(true)
        setLegacyEvents(wc)
        await wc.connect()
        setLegacyBridge(wc)
      } else {
        setIsLegacy(false)
        setLegacyBridge(undefined)
      }
    },
    [isConnected, isLegacy, legacyBridge, setLegacyEvents, wallet],
  )
  // connects to given URI or attempts previous connection
  const connect = useCallback(
    async (uri?: string) => {
      if (uri) {
        connectWithUri(uri)
      } else {
        let protocolUrl = await ipcListeners.getProtocolLaunchUrl()
        if (protocolUrl) {
          if (protocolUrl.includes('wc')) {
            connectWithUri(protocolUrl)
          }
        }
        const wcSessionJsonString = localStorage.getItem('walletconnect')
        if (!wcSessionJsonString) return
        const session = JSON.parse(wcSessionJsonString)
        const bridgeFromSession = new LegacyWCService(
          wallet as ETHWallet,
          new LegacyWalletConnect({ session }),
        )
        setIsLegacy(true)
        setLegacyEvents(bridgeFromSession)
        await bridgeFromSession.connect()
        setIsConnected(bridgeFromSession.connector.connected)
        web3ByChainId(Number(bridgeFromSession.connector.chainId)).then(setLegacyWeb3)
        if (bridgeFromSession.connector.peerMeta)
          setPairingMeta({
            ...bridgeFromSession.connector.peerMeta,
            chainId: bridgeFromSession.connector.chainId,
          })

        setLegacyBridge(bridgeFromSession)

        onDisconnect()
        localStorage.removeItem('walletconnect')
      }
    },
    [connectWithUri, onDisconnect, setLegacyEvents, wallet],
  )

  useEffect(() => {
    ipcListeners.handleWalletConnectUrlInProtocol(Comlink.proxy(connect))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!wallet) return
    connect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet])

  const dapp = pairingMeta

  console.log(legacyBridge)

  return (
    <WalletConnectBridgeContext.Provider
      value={{
        setCurrentSessionTopic: topic => {
          setCurrentSessionTopic(topic)
          setIsConnected(true)
        },
        onDisconnect,
        isConnected,
        currentSessionTopic,
        proposals,
        addProposal,
        removeProposal,
        isLegacy,
        legacyBridge,
        dapp,
        connect,
        removeRequest,
        requests,
        addRequest,
        setPairingMeta,
        legacyWeb3,
        setLegacyWeb3,
        setIsConnected,
      }}
    >
      <WalletConnectLogic />
      {children}
      {requests.length > 0 && <CallRequestModal />}
      {proposals.length > 0 && <SessionProposalModal />}
    </WalletConnectBridgeContext.Provider>
  )
}
