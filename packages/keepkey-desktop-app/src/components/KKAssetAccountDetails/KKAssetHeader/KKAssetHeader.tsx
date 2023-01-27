import { Box, Flex, Heading, Link } from '@chakra-ui/react'
import type { Asset } from '@keepkey/asset-service'
import { assume } from 'common-utils'

import { AssetIcon } from './AssetIcon'

type AssetHeaderProps = {
  asset: Asset
  onVoteClick: any
}

export const KKAssetHeader: React.FC<AssetHeaderProps> = ({ asset }) => {
  const chainId = asset.chainId
  const { name, symbol } = asset || {}

  if (!chainId) return null

  assume<{ rank: unknown; link: string }>(asset)
  return (
    <Flex alignItems='center' flexDir={{ base: 'column', lg: 'row' }} flex={1} py={4}>
      <Flex alignItems='left' flexDir={{ base: 'row', lg: 'column' }}>
        <Flex alignItems='center' mr='auto'>
          <AssetIcon asset={asset} boxSize='40px' />
          <Box ml={3} textAlign='left'>
            <Heading fontSize='2xl' lineHeight='shorter'>
              {name} {`(${symbol})`}
            </Heading>
            <br />
            <Link pb={6} fontWeight='bold' color='blue.500' isExternal href={asset?.link}>
              explore
            </Link>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}
