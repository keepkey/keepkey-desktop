import type { ETHWallet } from '@shapeshiftoss/hdwallet-core'
import LegacyWalletConnect from '@walletconnect/client'
import SignClient from '@walletconnect/sign-client'
import { parseUri } from '@walletconnect/utils'
import kkIconBlack from 'assets/kk-icon-black.png'
import { getConfig } from 'config'

import { LegacyWCService } from './service'

export let WalletConnectSignClient: SignClient

export const getWalletConnect = async (wallet: ETHWallet, uri: string) => {
  const { version } = parseUri(uri)
  if (version === 1) {
    return new LegacyWCService(wallet, new LegacyWalletConnect({ uri }))
  } else {
    await WalletConnectSignClient.pair({ uri })
    return WalletConnectSignClient
  }
}

export async function createSignClient() {
  WalletConnectSignClient = await SignClient.init({
    logger: 'debug',
    projectId: getConfig().REACT_APP_WALLET_CONNECT_PROJECT_ID,
    metadata: {
      name: 'KeepKey Desktop',
      description: 'KeepKey Desktop Application',
      url: 'https://keepkey.com/',
      icons: [kkIconBlack],
    },
  })

  return WalletConnectSignClient
}
