import type { DefiProvider } from 'features/defi/contexts/DefiManagerProvider/DefiCommon'

import type { TradeOpportunitiesBucket } from './components/TradeOpportunities'
import coinbasePng from './images/coinbase.png'
import elasticswapPng from './images/elasticswap.png'
import thorswapPng from './images/thorswap.png'
import uniswapPng from './images/uniswap.png'

export const TrimmedDescriptionLength = 191

export enum OpportunityTypes {
  LiquidityPool = 'liquidityPools',
  Farming = 'farming',
  BorrowingAndLending = 'borrowingAndLending',
}

export type ExternalOpportunity = {
  title: string
  apy?: string | null
  link?: string
  icons: string[]
  isLoaded?: boolean
  isDisabled?: boolean
  opportunityContractAddress?: string
  opportunityProvider?: DefiProvider
}

export type OpportunitiesBucket = {
  type: OpportunityTypes
  title: string
  opportunities: ExternalOpportunity[]
}

export const foxTradeOpportunitiesBuckets: TradeOpportunitiesBucket[] = [
  {
    title: 'plugins.foxPage.dex',
    opportunities: [
      {
        link: 'https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0xc770eefad204b5180df6a14ee197d99d808ee52d&chain=mainnet',
        icon: uniswapPng,
      },
      {
        link: 'https://app.thorswap.finance/swap/ETH.ETH_ETH.FOX-0XC770EEFAD204B5180DF6A14EE197D99D808EE52D',
        icon: thorswapPng,
      },
    ],
  },
  {
    title: 'plugins.foxPage.centralized',
    opportunities: [
      {
        link: 'https://www.coinbase.com/price/fox-token',
        icon: coinbasePng,
      },
    ],
  },
]

export const foxyTradeOpportunitiesBuckets: TradeOpportunitiesBucket[] = [
  {
    title: 'plugins.foxPage.dex',
    opportunities: [
      {
        link: 'https://elasticswap.org/',
        icon: elasticswapPng,
      },
    ],
  },
]
