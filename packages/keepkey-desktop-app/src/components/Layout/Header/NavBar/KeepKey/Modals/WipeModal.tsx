import { Modal } from '@chakra-ui/modal'
import { useModal } from 'hooks/useModal/useModal'
import { useRef } from 'react'

import { KeepKeyWipe } from './KeepKeyWipe'

export const WipeModal = () => {
  const initRef = useRef<HTMLInputElement | null>(null)
  const finalRef = useRef<HTMLDivElement | null>(null)
  const {
    keepKeyWipe: { close, isOpen, zIndex },
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
      <div style={{ '--chakra-zIndices-modal': zIndex }}>
        <KeepKeyWipe />
      </div>
    </Modal>
  )
}
