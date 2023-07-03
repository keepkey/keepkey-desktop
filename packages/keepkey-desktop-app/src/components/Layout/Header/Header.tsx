import { ChevronDownIcon, HamburgerIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Image,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import KeepKeyIconBlack from 'assets/kk-icon-black.png'
import { useModal } from 'hooks/useModal/useModal'
import { WalletConnectToDappsHeaderButton } from 'plugins/walletConnectToDapps/components/header/WalletConnectToDappsHeaderButton'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useCallback, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'

import { AutoCompleteSearch } from './AutoCompleteSearch/AutoCompleteSearch'
import { ChainMenu } from './NavBar/ChainMenu'
import { SideNavContent } from './SideNavContent'

export const Header = () => {
  const { onToggle, isOpen, onClose } = useDisclosure()
  const history = useHistory()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const { chainSelector } = useModal()
  const { isConnected, legacyWeb3 } = useWalletConnect()

  /**
   * FOR DEVELOPERS:
   * Open the hidden flags menu via keypress
   */
  const handleKeyPress = useCallback(
    (event: { altKey: unknown; shiftKey: unknown; keyCode: number }) => {
      if (event.altKey && event.shiftKey && event.keyCode === 70) {
        history.push('/flags')
      }
    },
    [history],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return (
    <>
      <Flex
        direction='column'
        bg={bg}
        width='full'
        // position='sticky'
        // zIndex='banner'
        // top={0}
        paddingTop={{ base: 'env(safe-area-inset-top)', md: 0 }}
      >
        <HStack height='4.5rem' width='full' borderBottomWidth={1} borderColor={borderColor}>
          <HStack width='full' margin='0 auto' px={{ base: 0, md: 4 }} spacing={0} columnGap={4}>
            <Box flex={1} display={{ base: 'block', md: 'none' }}>
              <IconButton
                aria-label='Open menu'
                variant='ghost'
                onClick={onToggle}
                icon={<HamburgerIcon />}
              />
            </Box>
            <Flex justifyContent={{ base: 'center', md: 'flex-start' }}>
              <Link to='/'>
                <Image boxSize='48px' src={KeepKeyIconBlack} alt='Go to Dashboard' />
              </Link>
            </Flex>
            <HStack
              width='100%'
              flex={1}
              justifyContent='center'
              display={{ base: 'none', md: 'block' }}
            >
              <AutoCompleteSearch />
            </HStack>
            <Flex justifyContent='flex-end' flex={1} rowGap={4} columnGap={2}>
              <Box display={{ base: 'none', md: 'block' }}>
                <WalletConnectToDappsHeaderButton />
              </Box>
              {/*{isConnected && (*/}
              {/*  <Box display={{ base: 'none', md: 'block' }}>*/}
              {/*    <Button rightIcon={<ChevronDownIcon />} onClick={() => chainSelector.open({})}>*/}
              {/*      <Image*/}
              {/*        boxSize={6}*/}
              {/*        src={*/}
              {/*          legacyWeb3?.image*/}
              {/*            ? legacyWeb3.image*/}
              {/*            : `https://pioneers.dev/coins/${legacyWeb3?.name*/}
              {/*                .toLowerCase()*/}
              {/*                .replaceAll('mainnet', '')*/}
              {/*                .replaceAll(' ', '')}.png`*/}
              {/*        }*/}
              {/*      />*/}
              {/*      {legacyWeb3?.chainId}*/}
              {/*    </Button>*/}
              {/*  </Box>*/}
              {/*)}*/}
              <ChainMenu display={{ base: 'none', md: 'block' }} />
            </Flex>
          </HStack>
        </HStack>
      </Flex>
      <Drawer isOpen={isOpen} onClose={onClose} placement='left'>
        <DrawerOverlay />
        <DrawerContent
          paddingTop='env(safe-area-inset-top)'
          paddingBottom='max(1rem, env(safe-area-inset-top))'
          overflowY='auto'
        >
          <SideNavContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
    </>
  )
}
