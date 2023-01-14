import { Modal } from '@chakra-ui/modal'
import { useModal } from 'hooks/useModal/useModal'
import { useRef } from 'react'

import { KeepKeyWipe } from './Wipe'

export const WipeModal = () => {
  const initRef = useRef<HTMLInputElement | null>(null)
  const finalRef = useRef<HTMLDivElement | null>(null)
  const {
    keepKeyWipe: { close, isOpen },
  } = useModal()

  return (
    <Modal
      initialFocusRef={initRef}
      finalFocusRef={finalRef}
      isCentered
      closeOnOverlayClick
      closeOnEsc
      isOpen={isOpen}
      onClose={close}
    >
      <KeepKeyWipe closeModal={close} />
    </Modal>
  )
}
