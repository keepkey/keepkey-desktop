import type { Asset } from '@keepkey/asset-service'
import type { ChainId } from '@keepkey/caip'
import { cosmosChainId, osmosisChainId } from '@keepkey/caip'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { selectPortfolioCryptoHumanBalanceByFilter } from 'state/slices/selectors'
import { store } from 'state/store'

export const chainIdToLabel = (chainId: ChainId): string => {
  switch (chainId) {
    case cosmosChainId:
      return 'Cosmos'
    case osmosisChainId:
      return 'Osmosis'
    default: {
      return ''
    }
  }
}

export const canCoverTxFees = ({
  feeAsset,
  estimatedGasCrypto,
  accountId,
}: {
  feeAsset: Asset
  estimatedGasCrypto: string
  accountId: AccountId
}) => {
  const state = store.getState()
  const feeAssetBalance = selectPortfolioCryptoHumanBalanceByFilter(state, {
    accountId,
    assetId: feeAsset.assetId,
  })

  return bnOrZero(feeAssetBalance)
    .minus(bnOrZero(estimatedGasCrypto).div(`1e+${feeAsset.precision}`))
    .gte(0)
}
