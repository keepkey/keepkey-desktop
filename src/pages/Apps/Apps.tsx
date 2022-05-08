import { Stack } from '@chakra-ui/react'
import { Main } from 'components/Layout/Main'
import { Text } from 'components/Text'

import { AppsList } from './components/AppsList'

export const Apps = () => {
  return (
    <Main>
      <Stack alignItems='flex-start' spacing={4} mx='auto' direction={{ base: 'column' }}>
        <Text fontSize='2xl' fontWeight='bold' translation='apps.header' />
        <AppsList />
      </Stack>
    </Main>
  )
}
