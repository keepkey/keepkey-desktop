import { Heading, Stack } from '@chakra-ui/react'
import { Main } from 'components/Layout/Main'
import { Text } from 'components/Text'

import { Portfolio } from './Portfolio'

export const Dashboard = () => {
  return (
    <Main
      titleComponent={
        <Stack pb={4}>
          <Heading>
            <Text translation='navBar.dashboard' />
          </Heading>
        </Stack>
      }
    >
      <Stack
        alignItems='flex-start'
        spacing={4}
        mx='auto'
        direction={{ base: 'column', xl: 'row' }}
      >
        <Stack spacing={4} flex='1 1 0%' width='full'>
          <Portfolio />
        </Stack>
      </Stack>
    </Main>
  )
}
