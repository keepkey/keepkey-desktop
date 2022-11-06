import type { ETHWallet, HDWallet } from '@shapeshiftoss/hdwallet-core'
import type { IClientMeta } from '@walletconnect/types'

import { WCService } from './service'
import type { WalletConnectCallRequest } from './types'

export interface WCSession {
  connected: boolean
  accounts: string[]
  chainId: number
  bridge: string
  key: string
  clientId: string
  clientMeta: IClientMeta | null
  peerId: string
  peerMeta: IClientMeta | null
  handshakeId: number
  handshakeTopic: string
  service?: WCService
}

export interface SessionManagerOptions {
  onCallRequest: (request: WalletConnectCallRequest) => void
  rerender: () => void
  disconnect: () => Promise<void>
}

export class WCSessionManager {
  public readonly sessions: WCSession[]
  public currentSessionKey: string | undefined
  public readonly wallet: HDWallet
  public readonly options: SessionManagerOptions

  constructor(wallet: HDWallet, options: SessionManagerOptions) {
    this.wallet = wallet
    this.options = options
    const savedSessions = localStorage.getItem('@walletconnect/sessions')
    if (!savedSessions) this.sessions = new Array<WCSession>()
    else {
      this.sessions = JSON.parse(savedSessions)
      this.sessions.forEach(async (session, idx) => {
        if (!('_supportsETH' in wallet)) {
          alert('TODO: No ETH HDWallet connected')
          return
        }
        const existingBridge = WCService.fromSession(session, this.wallet as ETHWallet, {
          onCallRequest: req => {
            this.currentSessionKey = session.key
            this.options.onCallRequest(req)
          },
        })

        existingBridge.setSessionKey(session.key)
        existingBridge.connector.on('connect', this.options.rerender)
        existingBridge.connector.on('disconnect', this.options.disconnect)

        await existingBridge.connect()
        this.sessions[idx].service = existingBridge
        this.currentSessionKey = session.key
      })
    }
  }

  public addSession(session: WCSession, service?: WCService) {
    if (service) {
      service.setSessionKey(session.key)
      session.service = service
    }
    if (this.sessions.find(s => s.key === session.key)) return
    this.sessions.push(session)
    this.currentSessionKey = session.key
    localStorage.setItem('@walletconnect/sessions', JSON.stringify(this.sessions))
  }

  public removeSession(key: string) {
    const idx = this.sessions.findIndex(s => s.key === key)
    if (idx > -1) {
      this.sessions.splice(idx, 1)
    }
    this.currentSessionKey = this.sessions[this.sessions.length - 1].key
    localStorage.setItem('@walletconnect/sessions', JSON.stringify(this.sessions))
  }

  setCurrentSessionKey(key: string) {
    if (!key) return
    this.currentSessionKey = key
  }
}
