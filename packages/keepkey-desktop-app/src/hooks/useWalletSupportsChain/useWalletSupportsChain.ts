import type { ChainId } from '@keepkey/caip'
import {
  avalancheChainId,
  bchChainId,
  btcChainId,
  cosmosChainId,
  dogeChainId,
  ethChainId,
  ltcChainId,
  osmosisChainId,
  thorchainChainId,
} from '@keepkey/caip'
import type { HDWallet } from '@shapeshiftoss/hdwallet-core'
import {
  supportsBTC,
  supportsCosmos,
  supportsETH,
  supportsEthSwitchChain,
  supportsOsmosis,
  supportsThorchain,
} from '@shapeshiftoss/hdwallet-core'
import { logger } from 'lib/logger'
const moduleLogger = logger.child({ namespace: ['useWalletSupportsChain'] })

type UseWalletSupportsChainArgs = { chainId: ChainId; wallet: HDWallet | null }
type UseWalletSupportsChain = (args: UseWalletSupportsChainArgs) => boolean

// use outside react
export const walletSupportsChain: UseWalletSupportsChain = ({ chainId, wallet }) => {
  if (!wallet) return false
  switch (chainId) {
    case btcChainId:
    case bchChainId:
    case dogeChainId:
    case ltcChainId:
      return supportsBTC(wallet)
    case ethChainId:
      return supportsETH(wallet)
    case avalancheChainId:
      return supportsEthSwitchChain(wallet)
    case cosmosChainId:
      return supportsCosmos(wallet)
    case osmosisChainId:
      return supportsOsmosis(wallet)
    case thorchainChainId:
      return supportsThorchain(wallet)
    default: {
      moduleLogger.error(`useWalletSupportsChain: unknown chain id ${chainId}`)
      return false
    }
  }
}

// TODO(0xdef1cafe): this whole thing should belong in chain adapters
export const useWalletSupportsChain: UseWalletSupportsChain = args => walletSupportsChain(args)
