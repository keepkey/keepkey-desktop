import { Stack } from '@chakra-ui/react'
import { Main } from 'components/Layout/Main'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useEffect } from 'react'
import { useHistory } from 'react-router'

import { DashboardSidebar } from './DashboardSidebar'
import { Portfolio } from './Portfolio'

export type MatchParams = {
  assetId: string
}

export const Dashboard = () => {
  const history = useHistory()
  const { state } = useWallet()

  useEffect(() => {
    if (state.keepkeyState <= 0) history.push('/connect-wallet')
  }, [state.keepkeyState])

  return (
    <Main>
      <Stack
        alignItems='flex-start'
        spacing={4}
        mx='auto'
        direction={{ base: 'column', xl: 'row' }}
      >
        <Stack spacing={4} flex='1 1 0%' width='full'>
          <Portfolio />
        </Stack>
        <Stack flex='1 1 0%' width='full' maxWidth={{ base: 'full', xl: 'sm' }} spacing={4}>
          <DashboardSidebar />
        </Stack>
      </Stack>
    </Main>
  )
}
