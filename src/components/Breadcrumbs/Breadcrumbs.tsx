import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { useMemo } from 'react'
import type { BreadcrumbsRoute } from 'react-router-breadcrumbs-hoc'
import withBreadcrumbs from 'react-router-breadcrumbs-hoc'
import type { RouteComponentProps } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { AccountLabel } from 'components/AssetHeader/AccountLabel'
import { Text } from 'components/Text/Text'
import { useKeepKey } from 'context/WalletProvider/KeepKeyProvider'
import { selectAssetById } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

const GetTranslatedPathPart = ({ match }: { match: RouteComponentProps['match'] }) => {
  // a hack to gain the ability to translate the breadcrumbs
  // takes out the path part from the url
  // and uses navbar.[pathPart] for the translation
  const pathFragments = useMemo(() => match.url.split('/'), [match.url])
  // getting the last part from the url, since this works recursively
  const pathPart = pathFragments[pathFragments.length - 1]
  // translates `/` to home
  return <Text translation={`navBar.${pathPart ? pathPart : 'home'}`} />
}

const GetAccountName = (props: any) => {
  const {
    match: {
      params: { accountId },
    },
  } = props

  return <AccountLabel accountId={accountId} />
}

const GetAssetName = (props: any) => {
  const {
    match: {
      params: { chainId, assetSubId, assetId: assetIdParam },
    },
  } = props

  const assetId = assetIdParam ? decodeURIComponent(assetIdParam) : `${chainId}/${assetSubId}`
  const asset = useAppSelector(state => selectAssetById(state, assetId))
  return <>{asset?.name}</>
}

const GetAssetName2 = (props: any) => {
  const { getKeepkeyAssets } = useKeepKey()
  const {
    match: {
      params: { assetSubId },
    },
  } = props
  const assets = getKeepkeyAssets()
  const asset = assets.find(asset => asset.assetId === assetSubId)
  return <>{asset?.name}</>
}

const routes: BreadcrumbsRoute[] = [
  {
    path: '/accounts/:accountId',
    breadcrumb: GetAccountName,
    routes: [
      { path: '/accounts/:accountId/transactions' },
      { path: '/accounts/:accountId/:assetId', breadcrumb: GetAssetName },
    ],
  },
  { path: '/assets/:chainId/:assetSubId', breadcrumb: GetAssetName },
  { path: '/assets/keepkey/:chainId/:assetSubId', breadcrumb: GetAssetName2 },
  { path: '*', breadcrumb: GetTranslatedPathPart },
]

const options = {
  excludePaths: ['/assets/:chainId', '/assets/keepkey/:chainId'],
}

export const Breadcrumbs = withBreadcrumbs(
  routes,
  options,
)(({ breadcrumbs }: { breadcrumbs: any }) => {
  return (
    <Breadcrumb fontWeight='medium' fontSize='sm' color='gray.500'>
      {breadcrumbs.map(({ breadcrumb, match }: { breadcrumb: any; match: any }) => {
        return (
          <BreadcrumbItem key={match.url}>
            <BreadcrumbLink as={Link} to={match.url}>
              {breadcrumb}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )
      })}
    </Breadcrumb>
  )
})
