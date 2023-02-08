import { CloseIcon } from '@chakra-ui/icons'
import type { FlexProps } from '@chakra-ui/react'
import { Box, Flex, IconButton, useMediaQuery } from '@chakra-ui/react'
import { breakpoints } from 'theme/theme'

import { AutoCompleteSearch } from './AutoCompleteSearch/AutoCompleteSearch'
import { ChainMenu } from './NavBar/ChainMenu'
import { NavBar } from './NavBar/NavBar'

type HeaderContentProps = {
  isCompact?: boolean
  onClose?: () => void
} & FlexProps

export const SideNavContent = ({ onClose }: HeaderContentProps) => {
  const [isLargerThanMd] = useMediaQuery(`(min-width: ${breakpoints['md']})`, { ssr: false })

  const handleClick = (onClick?: () => void) => {
    onClose && onClose()
    onClick && onClick()
  }

  return (
    <Flex
      width='full'
      height='auto'
      flex={1}
      alignItems='flex-start'
      justifyContent='flex-start'
      data-test='full-width-header'
      flexDir='row'
      overflowY='auto'
      p={4}
      maxWidth='1000px'
      margin='auto'
    >
      {!isLargerThanMd && (
        <Flex direction='column' rowGap={2} columnGap={2} width='full'>
          <IconButton
            ml='auto'
            aria-label='Close Nav'
            variant='ghost'
            icon={<CloseIcon boxSize={3} />}
            onClick={() => handleClick()}
          />
          <Flex gap={2}>
            <ChainMenu />
          </Flex>
          <Box width='full'>
            <AutoCompleteSearch />
          </Box>
        </Flex>
      )}

      <NavBar isCompact={true} onClick={() => handleClick()} />
    </Flex>
  )
}
