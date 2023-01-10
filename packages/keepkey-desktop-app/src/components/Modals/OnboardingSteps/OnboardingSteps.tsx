import { Modal, ModalContent, ModalOverlay, Text } from '@chakra-ui/react'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { useModal } from 'hooks/useModal/useModal'
import { useCallback } from 'react'

import { Step0 } from './steps/Step0'
import { Step1 } from './steps/Step1'
import { Step2 } from './steps/Step2'

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
      label: 'Pin',
      content: <Step0 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
    },
    {
      label: 'Mnemonics',
      content: <Step1 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
    },
    {
      label: 'Dapps',
      content: <Step2 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
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
      <ModalContent p={3}>
        <Steps activeStep={activeStep}>
          {steps.map(({ label, content }: any) => (
            <Step label={<h1>{label}</h1>} key={label}>
              <Text>{content}</Text>
            </Step>
          ))}
        </Steps>
      </ModalContent>
    </Modal>
  )
}
