import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Code,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  VStack,
} from '@chakra-ui/react'
import HoldAndConnect from 'assets/hold-and-connect.svg'
import type { Deferred } from 'common-utils'
import { RawText, Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import type { FC } from 'react'
import { useTranslate } from 'react-polyglot'

export type RequestBootloaderModeProps = {
  skipUpdate: Deferred<void>
  recommendedFirmware?: string
  firmware?: string
  bootloaderUpdateNeeded?: boolean
}

export const RequestBootloaderMode: FC<RequestBootloaderModeProps> = ({
  skipUpdate,
  bootloaderUpdateNeeded,
  recommendedFirmware,
  firmware,
}) => {
  const { colorMode } = useColorMode()
  const { requestBootloaderMode } = useModal()
  const { close, isOpen } = requestBootloaderMode
  const translate = useTranslate()
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        close()
      }}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <div style={{ '--chakra-zIndices-modal': requestBootloaderMode.zIndex }}>
        <ModalOverlay />
        <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
          <ModalCloseButton ml='auto' borderRadius='full' position='static' />
          <ModalBody>
            <div>
              <ModalHeader>
                <Text translation='modals.keepKey.requestBootloaderMode.title' />
              </ModalHeader>
            </div>
            <ModalBody>
              {!bootloaderUpdateNeeded && recommendedFirmware && firmware && (
                <Alert status='warning'>
                  <AlertIcon />
                  <RawText>
                    {translate('modals.keepKey.requestBootloaderMode.versionAlert1')}
                    <Code>{firmware}</Code>
                    {translate('modals.keepKey.requestBootloaderMode.versionAlert2')}
                    <Code>{recommendedFirmware}</Code>
                    {translate('modals.keepKey.requestBootloaderMode.versionAlert3')}
                  </RawText>
                </Alert>
              )}
              <Image
                src={HoldAndConnect}
                filter={colorMode === 'light' ? 'invert(100%);' : ''}
                alt='reconnect Device!'
              />
              <VStack p={6} spacing={6} alignItems='stretch'>
                <small>
                  <Text
                    align='left'
                    translation={'modals.keepKey.requestBootloaderMode.requestUpdaterMode'}
                  />
                </small>
                <br />
                <Box pt={2}>
                  <Text align='left' translation={'modals.keepKey.requestBootloaderMode.restart'} />
                  <Text
                    align='left'
                    translation={'modals.keepKey.requestBootloaderMode.restart1'}
                  />
                  <Text
                    align='left'
                    translation={'modals.keepKey.requestBootloaderMode.restart2'}
                  />
                </Box>
              </VStack>
            </ModalBody>
            {!bootloaderUpdateNeeded && (
              <ModalFooter textAlign='center'>
                <HStack>
                  <Text translation={'modals.keepKey.requestBootloaderMode.skipUpdate.text'} />
                  <Button
                    onClick={() => {
                      skipUpdate.resolve()
                    }}
                    colorScheme='yellow'
                    size='sm'
                  >
                    <Text translation={'modals.keepKey.requestBootloaderMode.skipUpdate.cta'} />
                  </Button>
                </HStack>
              </ModalFooter>
            )}
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
