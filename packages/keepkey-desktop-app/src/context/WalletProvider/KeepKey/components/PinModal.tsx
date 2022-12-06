import {
  ModalBody,
  ModalHeader,
  Modal,
  ModalContent,
  ModalOverlay,
  ModalCloseButton,
} from '@chakra-ui/react'
import { Text } from 'components/Text'
import { PinMatrixRequestType } from 'context/WalletProvider/KeepKey/KeepKeyTypes'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'

import { KeepKeyPin } from './Pin'

export const KeepKeyPinModal = ({ foobar }: { foobar?: string }) => {
  const {
    state: { keepKeyPinRequestType },
  } = useWallet()

  const foo = useModal()
  const { kkPin } = foo
  console.log('foo', foo)
  const { close, isOpen } = kkPin

  console.log('foobar', foobar)

  // Use different translation text based on which type of PIN request we received
  const translationType = (() => {
    switch (keepKeyPinRequestType) {
      case PinMatrixRequestType.NEWFIRST:
        return 'newPin'
      case PinMatrixRequestType.NEWSECOND:
        return 'newPinConfirm'
      case PinMatrixRequestType.REMOVE:
        return 'remove'
      default:
        return 'pin'
    }
  })()

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
        <ModalHeader>
          <Text translation={`walletProvider.keepKey.${translationType}.header`} />
        </ModalHeader>
        <ModalBody>
          <ModalCloseButton ml='auto' borderRadius='full' position='static' />
          <KeepKeyPin translationType={translationType} />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
