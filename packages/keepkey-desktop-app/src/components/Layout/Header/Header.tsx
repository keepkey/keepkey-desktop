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
  Avatar,
  useToast,
  useMediaQuery
} from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import KeepKeyIconBlack from 'assets/kk-icon-black.png';
import { useCallback, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { WalletActions } from 'context/WalletProvider/actions'
// import { ChainMenu } from './NavBar/ChainMenu';
import { SideNavContent } from './SideNavContent';
import { NavBar } from './NavBar/NavBar';
import { useWallet } from 'hooks/useWallet/useWallet';
import { breakpoints } from 'theme/theme';

export const Header = () => {
  const { onToggle, isOpen, onClose } = useDisclosure();
  const [browserUrl, setBrowserUrl] = useState('');
  const [walletConnectOpen, setWalletConnectOpen] = useState(false);
  const history = useHistory();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.750');
  const { dispatch } = useWallet();
  const toast = useToast();
  const [isLargerThanMd] = useMediaQuery(`(min-width: ${breakpoints['md']})`, { ssr: false });

  const handleKeyPress = useCallback((event) => {
    if (event.altKey && event.shiftKey && event.keyCode === 70) {
      history.push('/flags');
    }
  }, [history]);

  const openWalletConnect = async function() {
    try {
      history.push('/browser');
      //dispatch
      dispatch({ type: WalletActions.SET_WALLET_CONNECT_OPEN, payload: !walletConnectOpen });
      setWalletConnectOpen(!walletConnectOpen);
      // history.push('/browser?walletconnect=true');
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to open the wallet connect",
        status: "error",
        duration: 9000,
        isClosable: true
      });
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
      <>
        <Flex
            direction='column'
            bg={bg}
            width='full'
            paddingTop={{ base: 'env(safe-area-inset-top)', md: 0 }}
        >
          {/* Top Header Bar */}
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
                <Link to='/'>
                  <Image boxSize='33px' src={KeepKeyIconBlack} alt='Go to Dashboard' />
                </Link>
              </Flex>
              <Flex justifyContent='flex-end' flex={1} rowGap={4} columnGap={2}>
                <Avatar onClick={openWalletConnect} size="xs" src="https://i.imgur.com/ZCBkgPX.png" />
              </Flex>
            </HStack>
          </HStack>

          {/* Navigation Bar - Now at the top */}
          {isLargerThanMd && (
            <Flex
              width='full'
              borderBottomWidth={1}
              borderColor={borderColor}
              bg={bg}
              px={4}
              py={2}
              justifyContent='center'
              alignItems='center'
            >
              <HStack
                maxWidth='1200px'
                spacing={4}
              >
                <NavBar isCompact={false} />
              </HStack>
            </Flex>
          )}
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
  );
};
