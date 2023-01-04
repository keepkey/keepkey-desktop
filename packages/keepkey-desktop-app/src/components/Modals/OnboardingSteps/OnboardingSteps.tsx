import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { useModal } from 'hooks/useModal/useModal'
import { useCallback } from 'react'

import { Step0 } from './steps/Step0'

export const OnboardingSteps = () => {
  const { onboardingSteps } = useModal()
  const { close, isOpen } = onboardingSteps
  const { setStep, activeStep } = useSteps({
    initialStep: 0,
  })

  const { hardwareError } = useModal()

  const doNextStep = useCallback(() => {
    if (activeStep === 2) {
      close()
      hardwareError.open({})
      window.localStorage.setItem('onboarded', 'true')
    } else {
      setStep(activeStep + 1)
    }
  }, [activeStep, close, hardwareError, setStep])

  const doPreviousStep = useCallback(() => {
    if (activeStep === 0) {
    } else {
      setStep(activeStep - 1)
    }
  }, [activeStep, setStep])

  const steps = [
    {
      label: 'Mnemonics',
      content: <Step0 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
    },
    { label: 'Pin', content: <Step0 doNextStep={doNextStep} doPreviousStep={doPreviousStep} /> },
    {
      label: 'Restore',
      content: <Step0 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
    },
  ]

  return (
    <Modal
      size='full'
      isOpen={isOpen}
      onClose={() => {
        close()
      }}
      isCentered
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent justifyContent='center' p={3}>
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
