import { Alert, AlertIcon } from '@chakra-ui/react'
import type { AssetId } from '@shapeshiftoss/caip'
import { useUnavailableBalanceChartDataAssetNames } from 'hooks/useBalanceChartData/utils'
import { useTranslate } from 'react-polyglot'

type MaybeChartUnavailableProps = {
  assetIds: AssetId[]
}
export const MaybeChartUnavailable: React.FC<MaybeChartUnavailableProps> = ({ assetIds }) => {
  const translate = useTranslate()
  const unavailableAssetNames = useUnavailableBalanceChartDataAssetNames(assetIds)
  if (!unavailableAssetNames) return null
  return (
    <Alert status='warning'>
      <AlertIcon />
      {translate('common.chartUnavailable', { unavailableAssetNames })}
    </Alert>
  )
}
