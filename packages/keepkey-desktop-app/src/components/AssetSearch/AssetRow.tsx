import { Box, Button, Text, useColorModeValue } from '@chakra-ui/react'
import type { Asset } from '@shapeshiftoss/asset-service'
import { AssetIcon } from 'components/AssetIcon'
import { useRouteAssetId } from 'hooks/useRouteAssetId/useRouteAssetId'
import { useMemo } from 'react'
import type { ListChildComponentProps } from 'react-window'

export const AssetRow: React.FC<ListChildComponentProps> = ({ data, index, style }) => {
  const assetId = useRouteAssetId()
  const parsedAssetId = useMemo(
    () => (assetId ? decodeURIComponent(assetId) : undefined),
    [assetId],
  )
  const color = useColorModeValue('gray.500', 'whiteAlpha.500')
  const asset: Asset = data.items[index]
  if (!asset) return null

  const { handleClick } = data
  const isActive = asset.assetId === parsedAssetId

  return (
    <Button
      variant='ghost'
      onClick={() => handleClick(asset)}
      isActive={isActive}
      justifyContent='flex-start'
      style={style}
      _focus={{
        shadow: 'outline-inset',
      }}
    >
      <AssetIcon assetId={asset.assetId} size='sm' mr={4} />
      <Box textAlign='left'>
        <Text lineHeight={1}>{asset.name}</Text>
        <Text fontWeight='normal' fontSize='sm' color={color}>
          {asset.symbol}
        </Text>
      </Box>
    </Button>
  )
}
