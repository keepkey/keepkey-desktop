import type { Asset } from '@shapeshiftoss/asset-service'
import { filterAssetsBySearchTerm } from 'components/AssetSearch/helpers/filterAssetsBySearchTerm/filterAssetsBySearchTerm'
import debounce from 'lodash/debounce'
import { useCallback, useState } from 'react'
import { selectAssetsByMarketCap } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

export const useSearch = () => {
  const assets = useAppSelector(selectAssetsByMarketCap)
  const [searchTerm, setSearchTerm] = useState('')
  const [matchingAssets, setMatchingAssets] = useState<Asset[] | null>(null)
  const handleInputChange = useCallback(
    (inputValue: string) => {
      setSearchTerm(inputValue)
      if (inputValue === '') {
        setMatchingAssets(null)
      } else {
        debounce(
          () => {
            setMatchingAssets(filterAssetsBySearchTerm(inputValue, assets))
          },
          500,
          {
            leading: true,
          },
        )()
      }
    },
    [assets],
  )
  return {
    searchTerm,
    matchingAssets,
    handleInputChange,
  }
}
