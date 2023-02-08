import { chakra, Flex, useColorModeValue } from '@chakra-ui/react'

import { SideNavContent } from './SideNavContent'

export const BottomNav = () => {
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  return (
    <Flex position='sticky' bottom={0} zIndex={'banner'} width='full' backgroundColor={bgColor}>
      <chakra.header
        borderTopWidth={1}
        borderColor={borderColor}
        width='full'
        maxHeight='xs'
        flex={{ base: 'inherit', '2xl': '1 1 0%' }}
        display={{ base: 'none', md: 'flex' }}
      >
        <SideNavContent isCompact={true} />
      </chakra.header>
    </Flex>
  )
}
