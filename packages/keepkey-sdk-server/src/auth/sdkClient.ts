import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'

declare module 'express' {
  interface Request {
    user?: SdkClient
  }
}

export type PairingInfo = {
  /** @minLength 1 */
  name: string
  /** @format url */
  url?: string
  /** @format url */
  imageUrl: string
}

export type SdkClient = {
  apiKey: string
  wallet: KeepKeyHDWallet
  info: PairingInfo
}

export type SdkClientFactory = (apiKey: string) => Promise<SdkClient | undefined>

export const [getSdkClientFactory, setSdkClientFactory] = (() => {
  let resolver: (_: SdkClientFactory) => void
  const promise = new Promise<SdkClientFactory>(resolve => (resolver = resolve))
  return [promise, resolver!]
})()

export type SdkPairingHandler = (info: PairingInfo) => Promise<string | undefined>

export const [getSdkPairingHandler, setSdkPairingHandler] = (() => {
  let resolver: (_: SdkPairingHandler) => void
  const promise = new Promise<SdkPairingHandler>(resolve => (resolver = resolve))
  return [promise, resolver!]
})()
