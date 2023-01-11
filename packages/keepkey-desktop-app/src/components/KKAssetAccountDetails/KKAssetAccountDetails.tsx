import { Flex, Link, Stack } from '@chakra-ui/react'
import { RawText } from 'components/Text'
import type { KKAsset } from 'context/WalletProvider/KeepKeyProvider'
import { useModal } from 'hooks/useModal/useModal'
import { useCallback } from 'react'

import { Main } from '../Layout/Main'
import { DappGrid } from './DappGrid'
import { KKAssetHeader } from './KKAssetHeader/KKAssetHeader'
type AssetDetailsProps = {
  asset: KKAsset
}

export const KKAssetAccountDetails = ({ asset }: AssetDetailsProps) => {
  const { kkVote } = useModal()

  const onVoteClick = useCallback(() => {
    kkVote.open({ geckoId: asset.geckoId })
  }, [asset.geckoId, kkVote])

  return (
    <Main titleComponent={<KKAssetHeader asset={asset} onVoteClick={onVoteClick} />}>
      <Stack>
        <DappGrid asset={asset} />
      </Stack>
    </Main>
  )
}
