import type { AssetId, ChainNamespace, ChainReference } from '@shapeshiftoss/caip'
import { toChainId } from '@shapeshiftoss/caip'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { useEffect, useState } from 'react'
import { matchPath, useLocation } from 'react-router'

const getRouteAssetId = (pathname: string) => {
  // Extract the chainId and assetSubId parts from an /assets route, see src/Routes/RoutesCommon.tsx
  const assetIdAssetsPathMatch = matchPath<{ chainId: string; assetSubId: string }>(pathname, {
    path: '/assets/:chainId/:assetSubId',
  })

  const assetIdAccountsPathMatch = matchPath<{
    accountSpecifier?: string
    assetId?: AssetId
    chainNamespace?: ChainNamespace
    chainReference?: ChainReference
  }>(pathname, {
    path: [
      '/accounts/:accountSpecifier/:assetId',
      '/accounts/:chainNamespace\\::chainReference\\:(.+)',
    ],
  })

  if (assetIdAssetsPathMatch?.params) {
    const { chainId, assetSubId } = assetIdAssetsPathMatch.params

    // Reconstitutes the assetId from valid matched params
    const assetId = `${chainId}/${assetSubId}`
    return assetId
  }

  if (assetIdAccountsPathMatch?.params) {
    const { assetId, chainNamespace, chainReference } = assetIdAccountsPathMatch.params

    if (assetId) return assetId

    if (chainNamespace && chainReference) {
      const chainId = toChainId({ chainNamespace, chainReference })
      return getChainAdapterManager().get(chainId)?.getFeeAssetId()
    }

    return ''
  }
}

export const useRouteAssetId = () => {
  const location = useLocation()
  const [assetId, setAssetId] = useState<AssetId>('')

  useEffect(() => {
    const routeAssetId = getRouteAssetId(location.pathname)

    if (routeAssetId) {
      setAssetId(routeAssetId ?? '')
    }
  }, [location.pathname])

  return assetId
}
