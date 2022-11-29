import { CoreTypes } from '@walletconnect/types'
import type { LegacyWCService } from 'kkdesktop/walletconnect'
import { createContext, useContext } from 'react'

type WalletConnectBridgeContextValue = {
  legacyBridge: LegacyWCService | undefined
  dapp: CoreTypes.Metadata | undefined
  connect(uri: string): Promise<void>
  removeRequest: (id: number) => void
  removeProposal: (id: number) => void
  addRequest: (payload: any) => void
  addProposal: (payload: any) => void
  setPairingMeta: (payload: any) => void
  setCurrentSessionTopic: (topic: string) => void
  onDisconnect: () => void
  requests: any[]
  proposals: any[]
  isLegacy: boolean
  currentSessionTopic: string | undefined
  isConnected: boolean
}

export const WalletConnectBridgeContext = createContext<WalletConnectBridgeContextValue>({
  legacyBridge: undefined,
  dapp: undefined,
  connect: Promise.resolve,
  removeRequest: () => 0,
  removeProposal: () => 0,
  addRequest: () => 0,
  addProposal: () => 0,
  setPairingMeta: () => 0,
  setCurrentSessionTopic: () => 0,
  onDisconnect: () => 0,
  requests: [],
  proposals: [],
  isLegacy: false,
  currentSessionTopic: undefined,
  isConnected: false
})

export function useWalletConnect() {
  return useContext(WalletConnectBridgeContext)
}
