import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'

declare module 'express' {
  interface Request {
    user?: SdkClient
  }
}

export type SdkClient = {
  apiKey: string
  wallet: KeepKeyHDWallet
}

export type SdkClientFactory = (apiKey: string) => Promise<SdkClient | undefined>

export const [getSdkClientFactory, setSdkClientFactory] = (() => {
  let resolver: (_: SdkClientFactory) => void
  const promise = new Promise<SdkClientFactory>(resolve => (resolver = resolve))
  return [promise, resolver!]
})()
