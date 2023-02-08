import { Flex, Stack } from '@chakra-ui/react'
import type { AssetId } from '@shapeshiftoss/caip'
import { AssetTransactionHistory } from 'components/TransactionHistory/AssetTransactionHistory'
import { useMemo } from 'react'
import type { Route } from 'Routes/helpers'
import type { AccountSpecifier } from 'state/slices/accountSpecifiersSlice/accountSpecifiersSlice'
import { selectMarketDataById } from 'state/slices/selectors'
import { useAppSelector } from 'state/store'

import { AccountAssets } from './AccountAssets/AccountAssets'
import { AssetAccountNft } from './AssetAccountNft'
import { AssetAccounts } from './AssetAccounts/AssetAccounts'
import { AssetChart } from './AssetHeader/AssetChart'
import { AssetDescription } from './AssetHeader/AssetDescription'
import { AssetHeader } from './AssetHeader/AssetHeader'
import { AssetMarketData } from './AssetHeader/AssetMarketData'
import { Main } from './Layout/Main'
import { MaybeChartUnavailable } from './MaybeChartUnavailable'

type AssetDetailsProps = {
  assetId: AssetId
  accountId?: AccountSpecifier
  route?: Route
}

export const AssetAccountDetails = ({ assetId, accountId }: AssetDetailsProps) => {
  const marketData = useAppSelector(state => selectMarketDataById(state, assetId))
  const assetIds = useMemo(() => [assetId], [assetId])
  return (
    <Main titleComponent={<AssetHeader assetId={assetId} accountId={accountId} />}>
      <Stack
        alignItems='flex-start'
        spacing={4}
        mx='auto'
        direction={{ base: 'column', xl: 'row' }}
      >
        <Stack spacing={4} flex='1 1 0%' width='full'>
          <AssetChart accountId={accountId} assetId={assetId} isLoaded={true} />
          <MaybeChartUnavailable assetIds={assetIds} />
          {accountId && <AccountAssets assetId={assetId} accountId={accountId} />}
          <AssetAccounts assetId={assetId} accountId={accountId} />
          <AssetAccountNft assetId={assetId} />
          <AssetTransactionHistory limit={3} assetId={assetId} accountId={accountId} />
        </Stack>
        <Flex
          flexDir='column'
          flex='1 1 0%'
          width='full'
          maxWidth={{ base: 'full', xl: 'sm' }}
          gap={4}
        >
          {marketData && <AssetMarketData assetId={assetId} />}
          <AssetDescription assetId={assetId} />
        </Flex>
      </Stack>
    </Main>
  )
}
