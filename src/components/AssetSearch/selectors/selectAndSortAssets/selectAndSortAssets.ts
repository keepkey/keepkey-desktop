import { MarketCapResult } from '@shapeshiftoss/types'
import { Asset } from '@shapeshiftoss/types'
import sortBy from 'lodash/sortBy'
import { createSelector } from 'reselect'
import { ReduxState } from 'state/reducer'

export const selectAndSortAssets = createSelector(
  (state: ReduxState) => state.assets.byId,
  (state: ReduxState) => state.marketData.marketCap,
  (assetsById, marketCap?: MarketCapResult) => {
    let sortedAssets: Asset[] = []
    const assetsEntries = Object.entries(assetsById)
    if (marketCap) {
      // we only fetch market data for the top 250 assets
      // and want this to be fairly performant so do some mutatey things
      const assetsByCAIP19 = assetsEntries.reduce<Record<string, Asset>>((acc, [, cur]) => {
        acc[cur.caip19] = cur
        return acc
      }, {})
      const caip19ByMarketCap = Object.keys(marketCap)
      const sortedWithMarketCap = caip19ByMarketCap.reduce<Asset[]>((acc, cur) => {
        const asset = assetsByCAIP19[cur]
        if (!asset) return acc
        acc.push(asset)
        delete assetsByCAIP19[cur]
        return acc
      }, [])
      const remainingSortedNoMarketCap = sortBy(Object.values(assetsByCAIP19), ['name', 'symbol'])
      sortedAssets = [...sortedWithMarketCap, ...remainingSortedNoMarketCap]
    } else {
      if (assetsEntries.length > 0) {
        const data = assetsEntries.map(([, val]) => {
          return val
        })
        sortedAssets = sortBy(data, ['name', 'symbol'])
      }
    }
    return sortedAssets
  }
)
