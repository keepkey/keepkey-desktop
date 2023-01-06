import type { MergedServiceType } from 'components/Modals/ChainSelector/mergeServices'
import { mergeServices } from 'components/Modals/ChainSelector/mergeServices'
import { getConfig } from 'config'
import { getPioneerClient } from 'lib/getPioneerCleint'
import Web3 from 'web3'

export type EthChainData = {
  chainId: number
  providerUrl: string
  web3: Web3
  symbol: string
  name: string
  coinGeckoId: string
  service?: MergedServiceType
  serviceIdx?: number
  image?: string
}

export const supportedChains: EthChainData[] = [
  {
    chainId: 1,
    providerUrl: getConfig().REACT_APP_ETHEREUM_INFURA_URL,
    web3: new Web3(new Web3.providers.HttpProvider(getConfig().REACT_APP_ETHEREUM_INFURA_URL)),
    symbol: 'ETH',
    name: 'Ethereum',
    coinGeckoId: 'ethereum',
  },
  {
    chainId: 5,
    providerUrl: getConfig().REACT_APP_ETHEREUM_INFURA_URL2,
    web3: new Web3(new Web3.providers.HttpProvider(getConfig().REACT_APP_ETHEREUM_INFURA_URL2)),
    symbol: 'ETH',
    name: 'Goerli Testnet',
    coinGeckoId: 'ethereum',
  },
  {
    chainId: 43114,
    providerUrl: getConfig().REACT_APP_ETHEREUM_INFURA_URL3,
    web3: new Web3(new Web3.providers.HttpProvider(getConfig().REACT_APP_ETHEREUM_INFURA_URL3)),
    symbol: 'AVAX',
    name: 'Avalanche',
    coinGeckoId: 'avalanche-2',
  },
  {
    chainId: 137,
    providerUrl: 'https://rpc-mainnet.matic.quiknode.pro',
    web3: new Web3(new Web3.providers.HttpProvider(`https://rpc-mainnet.matic.quiknode.pro`)),
    symbol: 'MATIC',
    name: 'Polygon',
    coinGeckoId: 'matic-network',
  },
  {
    chainId: 100,
    providerUrl: `https://rpc.ankr.com/gnosis`,
    web3: new Web3(new Web3.providers.HttpProvider(`https://rpc.ankr.com/gnosis`)),
    symbol: 'XDAI',
    name: 'Gnosis',
    coinGeckoId: 'xdai',
  },
  {
    chainId: 56,
    providerUrl: `https://bsc-dataseed.binance.org`,
    web3: new Web3(new Web3.providers.HttpProvider(`https://bsc-dataseed.binance.org`)),
    symbol: 'BNB',
    name: 'Binance Smart Chain Mainnet',
    coinGeckoId: 'bnb',
  },
]

export const web3ByChainId = async (chainId: number): Promise<EthChainData | undefined> => {
  const pioneer = await getPioneerClient()
  let chains = await pioneer.SearchByNetworkId({ chainId })
  const services = mergeServices(chains.data)
  if (services.length === 0) return
  return {
    ...services[0],
    providerUrl: services[0].services[0].url,
    web3: new Web3(new Web3.providers.HttpProvider(services[0].services[0].url)),
    serviceIdx: 0,
    coinGeckoId: services[0].name.toLowerCase(),
  }
}

export const web3ByServiceType = (service: MergedServiceType, serviceIdx = 0) => {
  return {
    ...service,
    providerUrl: service.services[serviceIdx].url,
    web3: new Web3(new Web3.providers.HttpProvider(service.services[serviceIdx].url)),
    coinGeckoId: service.name.toLowerCase(),
    serviceIdx,
    service,
  }
}
