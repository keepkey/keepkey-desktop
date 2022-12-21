import type { ChainId } from '@keepkey/caip'
import { getWeb3ProviderByChainId } from 'lib/web3-provider'
import Web3 from 'web3'

const web3InstanceMap: Map<ChainId, Web3> = new Map()

export const getWeb3InstanceByChainId = (chainId: ChainId): Web3 => {
  if (!web3InstanceMap.get(chainId)) {
    const web3Provider = getWeb3ProviderByChainId(chainId)
    web3InstanceMap.set(chainId, new Web3(web3Provider))
    return web3InstanceMap.get(chainId)!
  } else {
    return web3InstanceMap.get(chainId)!
  }
}
