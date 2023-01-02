import { Heading, Stack } from '@chakra-ui/layout'
import type { Asset } from '@keepkey/asset-service'
import { AssetSearchKK } from 'components/AssetSearchKK/AssetSearchKK'
import { Main } from 'components/Layout/Main'
import { Text } from 'components/Text'
import { useHistory } from 'react-router-dom'

export const Assets = () => {
  const history = useHistory()
  const onClick = (asset: Asset) => {
    const isKeepkeyAsset = asset.assetId.startsWith('keepkey')

    const routeAssetId = isKeepkeyAsset ? `${asset.chainId}/${asset.assetId}` : asset.assetId

    // AssetId has a `/` separator so the router will have to parse 2 variables
    // e.g., /assets/:chainId/:assetSubId
    const url = !isKeepkeyAsset ? `/assets/${routeAssetId}` : `/assets/keepkey/${routeAssetId}`
    history.push({ pathname: url })
  }
  return (
    <Main
      display='flex'
      flexDir='column'
      height='calc(100vh - 72px)'
      titleComponent={
        <Stack pb={4}>
          <Heading>
            <Text translation='navBar.assets' />
          </Heading>
        </Stack>
      }
    >
      <AssetSearchKK onClick={onClick} />
    </Main>
  )
}
