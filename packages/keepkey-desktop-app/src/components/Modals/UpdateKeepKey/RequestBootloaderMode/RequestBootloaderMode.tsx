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
import { RawText, Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'

import KeepKeyConnect from 'assets/connect-keepkey.svg'
import { ipcRenderer } from 'electron-shim'
import type { FC } from 'react'
import { useTranslate } from 'react-polyglot'

export type RequestBootloaderModeProps = {
  recommendedFirmware?: string
  firmware?: string
}

export const RequestBootloaderMode: FC<RequestBootloaderModeProps> = ({
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
            {recommendedFirmware && firmware && (
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
            <Image src={KeepKeyConnect} alt='reconnect Device!' />
            <Text align='center' translation={'modals.keepKey.requestBootloaderMode.restart'} />
          </ModalBody>
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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
