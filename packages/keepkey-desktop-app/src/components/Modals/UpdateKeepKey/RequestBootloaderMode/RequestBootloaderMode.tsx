import {
  Alert,
  AlertIcon,
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
} from '@chakra-ui/react'
import HoldAndConnect from 'assets/hold-and-connect.svg'
import { RawText, Text } from 'components/Text'
import { ipcRenderer } from 'electron-shim'
import { useModal } from 'hooks/useModal/useModal'
import type { FC } from 'react'
import { useTranslate } from 'react-polyglot'

export type RequestBootloaderModeProps = {
  recommendedFirmware?: string
  firmware?: string
  bootloaderUpdateNeeded?: boolean
}

export const RequestBootloaderMode: FC<RequestBootloaderModeProps> = ({
  bootloaderUpdateNeeded,
  recommendedFirmware,
  firmware,
}) => {
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
            <Image src={HoldAndConnect} alt='reconnect Device!' />
            <Text align='center' translation={'modals.keepKey.requestBootloaderMode.restart'} />
          </ModalBody>
          {!bootloaderUpdateNeeded && (
            <ModalFooter textAlign='center'>
              <HStack>
                <Text translation={'modals.keepKey.requestBootloaderMode.skipUpdate.text'} />
                <Button
                  onClick={() => {
                    ipcRenderer.send('@keepkey/skip-update')
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
    </Modal>
  )
}
