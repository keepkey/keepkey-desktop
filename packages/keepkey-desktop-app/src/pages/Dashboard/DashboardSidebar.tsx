import { Flex } from '@chakra-ui/react'

import { RecentTransactions } from './RecentTransactions'

export const DashboardSidebar = () => {
  return (
    <Flex width='full' flexDir='column' gap={6}>
      <RecentTransactions />
    </Flex>
  )
}
