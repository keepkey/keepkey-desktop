import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { Step, Steps, useSteps } from 'chakra-ui-steps'
import { useModal } from 'hooks/useModal/useModal'
import { useCallback } from 'react'

import { Step0 } from './steps/Step0'
import { Step1 } from './steps/Step1'
import { Step2 } from './steps/Step2'
import { Step3 } from './steps/Step3'
import { Step4 } from './steps/Step4'

export const OnboardingSteps = () => {
  const { onboardingSteps } = useModal()
  const { close, isOpen } = onboardingSteps
  const { setStep, activeStep } = useSteps({
    initialStep: 0,
  })

  const doNextStep = useCallback(() => {
    if (activeStep === 4) {
      close()
      window.localStorage.setItem('onboarded', 'true')
    } else {
      setStep(activeStep + 1)
    }
  }, [activeStep, close, setStep])

  const doPreviousStep = useCallback(() => {
    if (activeStep === 0) return
    setStep(activeStep - 1)
  }, [activeStep, setStep])

  const steps = [
    {
      label: 'Language',
      content: <Step0 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
    },
    {
      label: 'App Settings',
      content: <Step1 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
    },
    {
      label: 'Pin',
      content: <Step2 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
    },
    {
      label: 'Mnemonics',
      content: <Step3 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
    },
    {
      label: 'Dapps',
      content: <Step4 doNextStep={doNextStep} doPreviousStep={doPreviousStep} />,
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
              {content}
            </Step>
          ))}
        </Steps>
      </ModalContent>
    </Modal>
  )
}
