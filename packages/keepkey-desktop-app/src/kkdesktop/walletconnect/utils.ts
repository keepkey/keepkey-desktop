import type { ETHWallet } from '@keepkey/hdwallet-core'
import LegacyWalletConnect from '@walletconnect/client'
import { Core } from '@walletconnect/core'
import { parseUri } from '@walletconnect/utils'
import type { IWeb3Wallet } from '@walletconnect/web3wallet'
import { Web3Wallet } from '@walletconnect/web3wallet'
import kkIconBlack from 'assets/kk-icon-black.png'
import { getConfig } from 'config'

import { LegacyWCService } from './service'

export let WalletConnectWeb3Wallet: IWeb3Wallet

const core = new Core({
  projectId: getConfig().REACT_APP_WALLET_CONNECT_PROJECT_ID,
})

export const getWalletConnect = async (wallet: ETHWallet, uri: string) => {
  const { version } = parseUri(uri)
  if (version === 1) {
    return new LegacyWCService(wallet, new LegacyWalletConnect({ uri }))
  } else {
    await WalletConnectWeb3Wallet.pair({ uri })
    return WalletConnectWeb3Wallet
  }
}

export async function createWallectConnectWeb3Wallet() {
  WalletConnectWeb3Wallet = await Web3Wallet.init({
    core, // <- pass the shared `core` instance
    metadata: {
      name: 'KeepKey Desktop',
      description: 'KeepKey Desktop Application',
      url: 'https://keepkey.com/',
      icons: [kkIconBlack],
    },
  })

  return WalletConnectWeb3Wallet
}
