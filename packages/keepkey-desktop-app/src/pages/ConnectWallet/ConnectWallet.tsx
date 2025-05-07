import { DarkMode } from '@chakra-ui/color-mode'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Flex, Link } from '@chakra-ui/layout'
import { 
  Button, 
  Image, 
  Box, 
  Code, 
  Text as ChakraText, 
  useClipboard, 
  HStack, 
  VStack, 
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
  Progress,
  Badge,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react'
import { FaUsb, FaCheck, FaTerminal, FaExclamationTriangle } from 'react-icons/fa'
import logo from 'assets/kk-icon-gold.png'
import heroBgImage from 'assets/splash-bg.png'
import { Page } from 'components/Layout/Page'
import { RawText, Text } from 'components/Text'
import { ipcListeners } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import { useQuery } from 'hooks/useQuery/useQuery'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useTranslate } from 'react-polyglot'
import { generatePath, matchPath, useHistory } from 'react-router'

export const ConnectWallet = () => {
  const { state, dispatch } = useWallet()
  const hasWallet = Boolean(state.walletInfo?.deviceId) && state.isConnected
  const history = useHistory()
  const translate = useTranslate()
  const query = useQuery<{ returnUrl: string }>()
  const [serviceKey, setServiceKey] = useState<string>('')
  const [copiedText, setCopiedText] = useState(false)
  
  const { onboardingSteps, keepKeyWipe, troubleshootConnection } = useModal()

  const debugDevice = async function () {
    await ipcListeners.appRestart()
  }

  const openApiDocs = () => {
    window.open('http://localhost:1646/docs/#/', '_blank')
  }

  // Manual copy implementation to ensure the correct value is copied
  const copyServiceKey = useCallback(() => {
    if (serviceKey) {
      navigator.clipboard.writeText(serviceKey)
        .then(() => {
          setCopiedText(true)
          setTimeout(() => setCopiedText(false), 2000) // Reset after 2 seconds
        })
        .catch(err => {
          console.error('Failed to copy: ', err)
        })
    }
  }, [serviceKey])

  useEffect(() => {
    // Load service key from localStorage
    const key = window.localStorage.getItem('@app/serviceKey')
    if (key) {
      setServiceKey(key)
    }
  }, [])

  useEffect(() => {
    // This handles reloading an asset's account page on Native/KeepKey. Without this, routing will break.
    // /:accountId/:assetId really is /:accountId/:chainId/:assetSubId e.g /accounts/eip155:1:0xmyPubKey/eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
    // The (/:chainId/:assetSubId) part is URI encoded as one entity in the regular app flow in <AssetAccountRow />, using generatePath()
    // This applies a similar logic here, that works with history.push()
    const match = matchPath<{ accountId?: string; chainId?: string; assetSubId?: string }>(
      query.returnUrl,
      {
        path: '/accounts/:accountId/:chainId/:assetSubId',
      },
    )
    const path = match
      ? generatePath('/accounts/:accountId/:assetId', {
          accountId: match?.params?.accountId ?? '',
          assetId: `${match?.params?.chainId ?? ''}/${match?.params?.assetSubId ?? ''}`,
        })
      : query?.returnUrl
    hasWallet && history.push(path ?? '/dashboard')
  }, [history, hasWallet, query, state, dispatch])

  useEffect(() => {
    if (window.localStorage.getItem('onboarded') !== 'true') onboardingSteps.open({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Page>
      <DarkMode>
        <Flex
          backgroundImage={heroBgImage}
          backgroundSize='cover'
          backgroundPosition='bottom center'
          width='100%'
          height='100%'
          alignItems='center'
          justifyContent='center'
          position="relative"
        >
          {/* API Key Display Box - Bottom Right */}
          {serviceKey && (
            <Box 
              position="absolute"
              bottom="8"
              right="8"
              zIndex="10"
              borderRadius="md" 
              border="1px solid" 
              borderColor="gray.600" 
              p={4}
              bg="gray.800"
              width="300px"
              boxShadow="xl"
            >
              <VStack spacing={3} align="stretch">
                <ChakraText color="white" fontWeight="bold">
                  API Service Key:
                </ChakraText>
                <Code 
                  width="100%" 
                  bg="gray.700" 
                  color="green.300" 
                  fontSize="sm" 
                  p={2} 
                  borderRadius="md"
                  overflowX="auto"
                >
                  {serviceKey}
                </Code>
                
                <HStack spacing={2} mt={2}>
                  <Button size="sm" flex={1} onClick={copyServiceKey} colorScheme="blue">
                    {copiedText ? "Copied!" : "Copy Key"}
                  </Button>
                  <Button size="sm" flex={1} onClick={openApiDocs} colorScheme="teal">
                    View API Docs
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}
          
          <Flex
            flexDir='column'
            alignItems='center'
            justifyContent='center'
            zIndex={4}
            width='100vw'
            height='100vh'
          >
            <Flex
              flex={1}
              flexDir='column'
              justifyContent='center'
              alignItems='center'
              height='100vh'
              width='100%'
              px={6}
            >
              <Flex 
                direction="column" 
                maxWidth="600px"
                width="100%"
              >
                <Image objectFit='cover' width='70px' src={logo} />
                <Flex flexDir='row' letterSpacing='-2px' my={6}>
                  <RawText
                    textAlign='left'
                    color='white'
                    width='80%'
                    fontWeight='light'
                    lineHeight={1}
                    fontSize='6xl'
                    userSelect={'none'}
                  >
                    {translate('connectWalletPage.nextFrontier')}
                  </RawText>
                </Flex>
              </Flex>
              
              {/* Main Action Buttons - Centered */}
              <Flex
                direction='column'
                gap={4}
                width='100%'
                maxWidth="400px"
                zIndex={3}
                mt={10}
                alignItems='center'
              >
                <Button
                  as={Link}
                  isExternal
                  width='100%'
                  height="50px"
                  href='https://keepkey.myshopify.com/'
                  rightIcon={<ExternalLinkIcon />}
                  colorScheme='green'
                  fontSize="md"
                  fontWeight="semibold"
                  boxShadow="md"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  No device? Buy a KeepKey
                </Button>
                <Button
                  width='100%'
                  height="50px"
                  rightIcon={<ExternalLinkIcon />}
                  colorScheme='green'
                  onClick={() => troubleshootConnection.open({})}
                  fontSize="md"
                  fontWeight="semibold"
                  boxShadow="md"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Troubleshoot Connection
                </Button>
                <Button
                  width='100%'
                  height="50px"
                  rightIcon={<ExternalLinkIcon />}
                  colorScheme='green'
                  onClick={() => keepKeyWipe.open({})}
                  fontSize="md"
                  fontWeight="semibold"
                  boxShadow="md"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Wipe KeepKey
                </Button>
                <Button
                  as={Link}
                  isExternal
                  href='https://support.keepkey.com'
                  width='100%'
                  height="50px"
                  rightIcon={<ExternalLinkIcon />}
                  colorScheme='green'
                  fontSize="md"
                  fontWeight="semibold"
                  boxShadow="md"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Need More help? Get Live Support
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </DarkMode>
    </Page>
  )
}
