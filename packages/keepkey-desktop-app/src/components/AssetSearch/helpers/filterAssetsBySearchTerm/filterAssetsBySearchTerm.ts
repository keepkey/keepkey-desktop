import type { Asset } from '@keepkey/asset-service'
import { fromAssetId } from '@keepkey/caip'
import { isEthAddress } from 'lib/address/utils'
import { matchSorter } from 'match-sorter'

export const filterAssetsBySearchTerm = (search: string, assets: Asset[]) => {
  if (!assets) return []

  const searchLower = search.toLowerCase()

  if (isEthAddress(search)) {
    return assets.filter(
      asset => fromAssetId(asset?.assetId).assetReference.toLowerCase() === searchLower,
    )
  }

  return matchSorter(assets, search, { keys: ['name', 'symbol'] })
}
