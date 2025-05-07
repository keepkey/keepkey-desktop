import { WarningTwoIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  StackDivider,
  useColorMode,
} from '@chakra-ui/react'
import KeepKeyConnect from 'assets/connect-keepkey.svg'
import { Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useTranslate } from 'react-polyglot'
import { useHistory } from 'react-router'

export const HardwareErrorModal = (error: {
  errorCode?: number
  needsReconnect?: boolean
  error?: string
}) => {
  const { hardwareError, troubleshootConnection } = useModal()
  const { isUpdatingKeepkey } = useWallet()
  const translate = useTranslate()
  const { close, isOpen } = hardwareError
  const { colorMode } = useColorMode()

  const history = useHistory()

  useEffect(() => {
    if (
      history.location.pathname === '/onboarding' ||
      history.location.pathname === '/#/onboarding'
    )
      close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.location.pathname])

  return (
    <Modal
      isOpen={isOpen && !isUpdatingKeepkey}
      onClose={() => {
        close()
      }}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <div style={{ '--chakra-zIndices-modal': hardwareError.zIndex }}>
        <ModalOverlay />
        <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
          {!error.needsReconnect && (
            <ModalCloseButton ml='auto' borderRadius='full' position='static' />
          )}
          <ModalBody>
            <Box width="100%" maxW="420px" mx="auto">
              {/* Bold Welcome */}
              <Box mb={4}>
                <Heading fontSize="2xl" fontWeight="extrabold" color="yellow.400" textAlign="left" letterSpacing="tight" lineHeight={1.1}>
                  Welcome to KeepKey Desktop!
                </Heading>
              </Box>

              {/* Card 1: Device Animation + No Device Detected */}
              <Box
                borderWidth="2px"
                borderRadius="xl"
                borderColor="yellow.400"
                bg={colorMode === 'light' ? 'white' : 'gray.900'}
                boxShadow="lg"
                p={6}
                mb={4}
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Heading fontSize="lg" fontWeight="bold" color="red.400" mb={2} textAlign="left" width="100%">
                  No device detected
                </Heading>
                <Box width="120px" height="80px" mb={2} display="flex" alignItems="center" justifyContent="center">
                  <Image src={KeepKeyConnect} alt="KeepKey Device" width="100%" height="auto" />
                </Box>
              </Box>

              {/* Card 2: Instructions */}
              <Box
                borderWidth="1px"
                borderRadius="lg"
                bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
                boxShadow="md"
                p={5}
                mb={4}
                textAlign="left"
              >
                <Heading fontSize="md" fontWeight="semibold" mb={2} color={colorMode === 'light' ? 'gray.700' : 'gray.100'}>
                  Please follow these steps:
                </Heading>
                <Box as="ol" pl={5} fontSize="md" color={colorMode === 'light' ? 'gray.700' : 'gray.200'}>
                  <li>Connect your KeepKey device to continue.</li>
                  <li>If your device is already connected, disconnect and reconnect to reset your device state.</li>
                </Box>
              </Box>

              {/* Card 3: Troubleshoot Connection */}
              <Box
                borderWidth="2px"
                borderRadius="lg"
                borderColor="blue.400"
                bg={colorMode === 'light' ? 'blue.50' : 'blue.900'}
                boxShadow="md"
                p={5}
                textAlign="center"
              >
                <Heading fontWeight="bold" color="blue.700" mb={2} fontSize="md">
                  TROUBLESHOOTING GUIDE
                </Heading>
                <Button
                  colorScheme='yellow'
                  size='lg'
                  fontWeight='bold'
                  width='100%'
                  onClick={() => troubleshootConnection.open({})}
                >
                  Troubleshoot Connection
                </Button>
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
