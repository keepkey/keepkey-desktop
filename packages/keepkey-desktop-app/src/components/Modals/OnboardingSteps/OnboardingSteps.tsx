import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { useModal } from 'hooks/useModal/useModal'

import { Step0 } from './Step0/Step0'

export const OnboardingSteps = () => {
  const { updateKeepKey } = useModal()
  const { close, isOpen } = updateKeepKey
  const { setStep, activeStep } = useSteps({
    initialStep: 0,
  })

  const steps = [
    { label: 'Step0', content: <Step0 /> },
    { label: 'Step1', content: <Step0 /> },
    { label: 'Step2', content: <Step0 /> },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        // disconnect()
        // close()
        // setStep(0)
      }}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent justifyContent='center' p={3}>
        {/*<ModalCloseButton ml='auto' borderRadius='full' position='static' />*/}
        <Steps activeStep={activeStep}>
          {steps.map(({ label, content }: any) => (
            <Step label={label} key={label}>
              {content}
            </Step>
          ))}
        </Steps>
      </ModalContent>
    </Modal>
  )
}
