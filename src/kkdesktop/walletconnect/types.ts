import type { ETHSignMessage, ETHSignTx } from '@shapeshiftoss/hdwallet-core'

export interface WalletConnectSessionRequestPayload {
  params: {
    chainId: number | null
  }[]
}

export interface WalletConnectEthSignCallRequest {
  id: number
  method: 'eth_sign'
  payload: unknown
}

export interface WalletConnectEthSignTypedDataCallRequest {
  id: number
  method: 'eth_signTypedData'
  payload: unknown
}

export interface WalletConnectPersonalSignCallRequest {
  id: number
  method: 'personal_sign'
  params: [string, string]
}

export interface WalletConnectEthSendTransactionCallRequest {
  id: number
  method: 'eth_sendTransaction'
  params: {
    chainId: number
    data: string
    gas: string
    gasPrice: string
    nonce: string
    to: string
    value: string
    from: string
  }[]
}

export interface WalletConnectEthSignTransactionCallRequest {
  id: number
  method: 'eth_signTransaction'
  params: {
    chainId: number
    data: string
    gas: string
    gasPrice: string
    nonce: string
    to: string
    value: string
    from: string
  }[]
}

export type WalletConnectCallRequest =
  | WalletConnectEthSignCallRequest
  | WalletConnectEthSignTypedDataCallRequest
  | WalletConnectPersonalSignCallRequest
  | WalletConnectEthSendTransactionCallRequest
  | WalletConnectEthSignTransactionCallRequest

export type WalletConnectCallRequestResponseMap = {
  personal_sign: ETHSignMessage
  eth_sendTransaction: ETHSignTx
  eth_signTransaction: ETHSignTx
}