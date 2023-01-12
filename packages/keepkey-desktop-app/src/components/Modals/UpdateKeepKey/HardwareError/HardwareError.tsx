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
  useColorMode
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
  const { hardwareError } = useModal()
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

  const retryPair = async () => {
    console.log('retryPair: ')
  }

  const HandleTroubleShoot = async () => {
    //
    close()
  }

  return (
    <Modal
      isOpen={isOpen && !isUpdatingKeepkey && window.localStorage.getItem('onboarded') === 'true'}
      onClose={() => {
        close()
      }}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
        <ModalCloseButton ml='auto' borderRadius='full' position='static' />
        <ModalBody>
          {error.error === 'claimInterface error: Error: LIBUSB_ERROR_ACCESS' ? (
            <div>
              <ModalHeader>
                <Text translation='modals.keepKey.hardware.headerConnect' />
              </ModalHeader>
              <Image src={KeepKeyConnect} alt='Reconnect Device!' />
              <Text translation={'modals.keepKey.hardware.reconnect'} />
              <Button size='lg' colorScheme='blue' onClick={HandleTroubleShoot}>
                <Text translation={'modals.keepKey.hardware.troubleshoot'} />
              </Button>
              <Button size='lg' colorScheme='blue' ref='https://discord.gg/stfRnW3Jys'>
                <Text translation={'modals.common.getSupport'} />
              </Button>
            </div>
          ) : (
            <div>
              <Card>
                <CardHeader>
                  <Heading size='md'>
                    <Text translation='modals.keepKey.hardware.claimTitle' />
                  </Heading>
                </CardHeader>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <WarningTwoIcon boxSize={48} color='red.500' />
                </div>
                <CardBody>
                  <Stack divider={<StackDivider />} spacing='4'>
                    <Box>
                      <Heading size='xs' textTransform='uppercase'>
                        Summary
                      </Heading>
                      <ReactMarkdown>
                        {translate('modals.keepKey.hardware.claimInterface')}
                      </ReactMarkdown>
                    </Box>
                    <Box>
                      <Heading size='xs' textTransform='uppercase'>
                        1. {translate('modals.keepKey.hardware.claimInterface2')}
                      </Heading>
                      <Heading size='xs' textTransform='uppercase'>
                        2. {translate('modals.keepKey.hardware.claimInterface3')}
                      </Heading>
                    </Box>
                  </Stack>
                </CardBody>
              </Card>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
