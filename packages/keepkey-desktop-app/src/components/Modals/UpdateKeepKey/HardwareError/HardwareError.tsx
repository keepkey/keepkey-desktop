import { WarningTwoIcon } from '@chakra-ui/icons'
import {
  Box,
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
        {!error.needsReconnect && (
          <ModalCloseButton ml='auto' borderRadius='full' position='static' />
        )}
        <ModalBody>
          {error && error.error && error.error.includes('claimInterface') ? (
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
          ) : (
            <div>
              <ModalHeader>
                <Text
                  translation={
                    error.needsReconnect
                      ? 'modals.keepKey.hardware.headerReconnect'
                      : 'modals.keepKey.hardware.headerConnect'
                  }
                />
              </ModalHeader>
              <Image
                filter={colorMode === 'light' ? 'invert(100%);' : ''}
                src={KeepKeyConnect}
                alt='Reconnect Device!'
              />
              <style type='text/css'>{`
                .hardwareErrorIntroText * {
                  margin: 0.5em 0;
                }

                .hardwareErrorIntroText :is(h1, h2, h3, h4, h5, h6) {
                  text-align: center;
                }
              `}</style>
              <div className='hardwareErrorIntroText'>
                <ReactMarkdown>
                  {translate(
                    error.needsReconnect
                      ? 'modals.keepKey.hardware.reconnect'
                      : 'modals.keepKey.hardware.connect',
                  )}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
