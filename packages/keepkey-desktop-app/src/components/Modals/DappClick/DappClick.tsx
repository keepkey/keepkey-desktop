import {
  Button,
  Center,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import { Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import { useCallback } from 'react'

export const DappClickModal = ({ onContinue }: { onContinue: any }) => {
  const { dappClick } = useModal()
  const { close, isOpen } = dappClick

  const verifyClicked = useCallback(() => {
    console.log('verifyClicked')
  }, [])

  const continueClicked = useCallback(() => {
    console.log('continueClicked')
    onContinue()
    close()
  }, [close, onContinue])

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
      <div style={{ '--chakra-zIndices-modal': dappClick.zIndex }}>
        <ModalOverlay />
        <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
          <ModalCloseButton ml='auto' borderRadius='full' position='static' />
          <ModalBody>
            <div>
              <ModalHeader>
                <Text translation={'modals.clickDapp.header'} />
              </ModalHeader>
              <Text m='20px' translation={'modals.clickDapp.content'} />
              <Center>
                <Button m='20px' onClick={verifyClicked}>
                  <Text translation={'modals.clickDapp.verify'} />
                </Button>
                <Button m='20px' onClick={continueClicked}>
                  <Text translation={'modals.clickDapp.continue'} />
                </Button>
              </Center>
            </div>
          </ModalBody>
        </ModalContent>
      </div>
    </Modal>
  )
}
