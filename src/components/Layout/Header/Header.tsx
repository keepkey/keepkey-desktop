import { HamburgerIcon } from '@chakra-ui/icons'
import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useCallback, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
<<<<<<< HEAD
import { Route } from 'Routes/helpers'
import { KeepKeyIcon } from 'components/Icons/KeepKeyIcon'
// import { FoxIcon } from 'components/Icons/FoxIcon'
import { ReduxState } from 'state/reducer'
import { selectFeatureFlag } from 'state/slices/preferencesSlice/selectors'
=======
import { FoxIcon } from 'components/Icons/FoxIcon'
>>>>>>> 476edb7ad399f9bf9a2142647d01921edb54be25

// import { useWallet } from '../../../context/WalletProvider/WalletProvider'
import { AutoCompleteSearch } from './AutoCompleteSearch/AutoCompleteSearch'
import { FiatRamps } from './NavBar/FiatRamps'
import { UserMenu } from './NavBar/UserMenu'
import { WalletConnectMenu } from './NavBar/WalletConnectMenu'
import { SideNavContent } from './SideNavContent'

export const Header = () => {
  const { onToggle, isOpen, onClose } = useDisclosure()
  const history = useHistory()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.750')
  // const { state, dispatch } = useWallet()

  /**
   * FOR DEVELOPERS:
   * Open the hidden flags menu via keypress
   */
  const handleKeyPress = useCallback(
    event => {
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

<<<<<<< HEAD
  // TODO(gomes): There's currently a runtime error when using the typed useAppSelector here.
  // Find out the root cause and use it instead
  const gemRampFlag = useSelector((state: ReduxState) => selectFeatureFlag(state, 'GemRamp'))

  // @ts-ignore
=======
>>>>>>> 476edb7ad399f9bf9a2142647d01921edb54be25
  return (
    <>
      <Flex
        height='4.5rem'
        bg={bg}
        borderBottomWidth={1}
        borderColor={borderColor}
        width='full'
        position='sticky'
        zIndex='banner'
        top={0}
      >
        <HStack width='full' px={4}>
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
              <KeepKeyIcon boxSize='7' />
            </Link>
            {/*<small>{state.keepkeyState}: {state.keepkeyStatus}</small>*/}
          </Flex>
          <HStack
            width='100%'
            flex={1}
            justifyContent='center'
            display={{ base: 'none', md: 'block' }}
          >
            <AutoCompleteSearch />
          </HStack>
          <Flex justifyContent='flex-end' flex={1}>
<<<<<<< HEAD
            {gemRampFlag && (
              <Box
                display={{ base: 'none', md: 'block' }}
                mr={{ base: 0, md: 4 }}
                mb={{ base: 4, md: 0 }}
              >
                <FiatRamps />
              </Box>
            )}
            <Box display={{ base: 'none', md: 'block' }} mr={{ base: 0, md: 4 }}>
              <WalletConnectMenu />
=======
            <Box
              display={{ base: 'none', md: 'block' }}
              mr={{ base: 0, md: 4 }}
              mb={{ base: 4, md: 0 }}
            >
              <FiatRamps />
>>>>>>> 476edb7ad399f9bf9a2142647d01921edb54be25
            </Box>
            <Box display={{ base: 'none', md: 'block' }}>
              <UserMenu />
            </Box>
          </Flex>
        </HStack>
      </Flex>
      <Drawer isOpen={isOpen} onClose={onClose} placement='left'>
        <DrawerOverlay />
        <DrawerContent>
          <SideNavContent />
        </DrawerContent>
      </Drawer>
    </>
  )
}
