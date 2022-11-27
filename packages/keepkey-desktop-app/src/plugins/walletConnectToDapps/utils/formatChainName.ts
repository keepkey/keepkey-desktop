import type { TCosmosChain } from '../data/COSMOSData'
import { COSMOS_MAINNET_CHAINS } from '../data/COSMOSData'
import type { TEIP155Chain } from '../data/EIP115Data'
import { EIP155_CHAINS, EIP155_MAINNET_CHAINS, EIP155_TEST_CHAINS } from '../data/EIP115Data'
import type { TElrondChain } from '../data/ElrondData'
import { ELROND_CHAINS, ELROND_MAINNET_CHAINS, ELROND_TEST_CHAINS } from '../data/ElrondData'
import type { TNearChain } from '../data/NEARData'
import { NEAR_TEST_CHAINS } from '../data/NEARData'
import type { TSolanaChain } from '../data/SolanaData'
import { SOLANA_CHAINS, SOLANA_MAINNET_CHAINS, SOLANA_TEST_CHAINS } from '../data/SolanaData'

const CHAIN_METADATA = {
  ...COSMOS_MAINNET_CHAINS,
  ...SOLANA_MAINNET_CHAINS,
  ...ELROND_MAINNET_CHAINS,
  ...EIP155_MAINNET_CHAINS,
  ...EIP155_TEST_CHAINS,
  ...SOLANA_TEST_CHAINS,
  ...NEAR_TEST_CHAINS,
  ...ELROND_TEST_CHAINS,
}

export const formatChainName = (chainId: string) => {
  return (
    EIP155_CHAINS[chainId as TEIP155Chain]?.name ??
    COSMOS_MAINNET_CHAINS[chainId as TCosmosChain]?.name ??
    SOLANA_CHAINS[chainId as TSolanaChain]?.name ??
    NEAR_TEST_CHAINS[chainId as TNearChain]?.name ??
    ELROND_CHAINS[chainId as TElrondChain]?.name ??
    chainId
  )
}

export const getChainColor = (chainId: string) => {
  return CHAIN_METADATA[chainId]?.rgb
}
