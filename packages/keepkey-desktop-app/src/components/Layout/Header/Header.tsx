import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Avatar,
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
  useToast,
} from '@chakra-ui/react'
import KeepKeyIconBlack from 'assets/kk-icon-black.png'
import { WalletActions } from 'context/WalletProvider/actions'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'

// import { ChainMenu } from './NavBar/ChainMenu';
import { SideNavContent } from './SideNavContent'

export const Header = () => {
  const { onToggle, isOpen, onClose } = useDisclosure()
  const [browserUrl, setBrowserUrl] = useState('')
  const [walletConnectOpen, setWalletConnectOpen] = useState(false)
  const history = useHistory()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  const { dispatch } = useWallet()
  const toast = useToast()

  const handleKeyPress = useCallback(
    event => {
      if (event.altKey && event.shiftKey && event.keyCode === 70) {
        history.push('/flags')
      }
    },
    [history],
  )

  const openWalletConnect = async function () {
    try {
      history.push('/browser')
      //dispatch
      dispatch({ type: WalletActions.SET_WALLET_CONNECT_OPEN, payload: !walletConnectOpen })
      setWalletConnectOpen(!walletConnectOpen)
      // history.push('/browser?walletconnect=true');
    } catch (e) {
      console.error(e)
      toast({
        title: 'Error',
        description: 'Failed to open the wallet connect',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
  }

  const goToKeepKey = async function () {
    try {
      history.push('/browser')
      dispatch({ type: WalletActions.SET_BROWSER_URL, payload: 'https://app.keepkey.info' })
      //dispatch
      // dispatch({ type: WalletActions.SET_WALLET_CONNECT_OPEN, payload: !walletConnectOpen });
      // setWalletConnectOpen(!walletConnectOpen);
      // history.push('/browser?walletconnect=true');
    } catch (e) {
      console.error(e)
      toast({
        title: 'Error',
        description: 'Failed to open the wallet connect',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    }
  }

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
        paddingTop={{ base: 'env(safe-area-inset-top)', md: 0 }}
      >
        <HStack height='2.3rem' width='full' borderBottomWidth={1} borderColor={borderColor}>
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
              <Link onClick={goToKeepKey}>
                <Image boxSize='33px' src={KeepKeyIconBlack} alt='Go to Dashboard' />
              </Link>
            </Flex>
            <Flex justifyContent='flex-end' flex={1} rowGap={4} columnGap={2}>
              <Avatar onClick={openWalletConnect} size='xs' src='https://i.imgur.com/ZCBkgPX.png' />
              {/*<Button*/}
              {/*    onClick={openWalletConnect}*/}
              {/*    size="md"           // Set the size of the button*/}
              {/*    leftIcon={<Avatar size="xs" src="https://pbs.twimg.com/profile_images/1737473466847125504/SN4QL9k3_400x400.jpg" />}  // Set the avatar as the icon of the button*/}
              {/*>*/}
              {/*</Button>*/}
              {/*<ChainMenu display={{ base: 'none', md: 'block' }} />*/}
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
