import { getConfig } from 'config'
import Web3 from 'web3'

export type EthChainData = {
  chainId: number
  providerUrl: string
  web3: Web3
  symbol: string
  name: string
  coinGeckoId: string
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
    providerUrl: 'https://goerli.infura.io/v3/fb05c87983c4431baafd4600fd33de7e',
    web3: new Web3(
      new Web3.providers.HttpProvider(
        `https://goerli.infura.io/v3/fb05c87983c4431baafd4600fd33de7e`,
      ),
    ),
    symbol: 'ETH',
    name: 'Goerli Testnet',
    coinGeckoId: 'ethereum',
  },
  {
    chainId: 43114,
    providerUrl: 'https://avalanche-mainnet.infura.io/v3/fb05c87983c4431baafd4600fd33de7e',
    web3: new Web3(
      new Web3.providers.HttpProvider(
        `https://avalanche-mainnet.infura.io/v3/fb05c87983c4431baafd4600fd33de7e`,
      ),
    ),
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
]

export const web3ByChainId = (chainId: number) => {
  return supportedChains.find(chain => chain.chainId === chainId)
}
