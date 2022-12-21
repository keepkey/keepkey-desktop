import type { AccountId } from '@keepkey/caip'
import { SlideTransition } from 'components/SlideTransition'
import type {
  DefiParams,
  DefiQueryParams,
} from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { DefiAction } from 'features/defi/contexts/DefiManagerProvider/DefiCommon'
import { useBrowserRouter } from 'hooks/useBrowserRouter/useBrowserRouter'
import qs from 'qs'
import { MemoryRouter } from 'react-router'
import type { Nullable } from 'types/common'

import { ClaimRoutes } from './ClaimRoutes'

type ClaimProps = {
  accountId: Nullable<AccountId>
}

export const Claim: React.FC<ClaimProps> = ({ accountId }) => {
  const { query, history, location } = useBrowserRouter<DefiQueryParams, DefiParams>()

  const handleBack = () => {
    history.push({
      pathname: location.pathname,
      search: qs.stringify({
        ...query,
        modal: DefiAction.Overview,
      }),
    })
  }

  return (
    <SlideTransition>
      <MemoryRouter>
        <ClaimRoutes accountId={accountId} onBack={handleBack} />
      </MemoryRouter>
    </SlideTransition>
  )
}
