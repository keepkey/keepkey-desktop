import { Box, Modal, ModalContent, ModalOverlay, useColorModeValue } from '@chakra-ui/react'
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

  // Define colors for better visual hierarchy
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const highlightColor = 'green.500'

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
      <div style={{ '--chakra-zIndices-modal': onboardingSteps.zIndex }}>
        <ModalOverlay />
        <ModalContent 
          p={6} 
          bg={bgColor}
          maxW="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box 
            w="100%" 
            maxW="1000px" 
            bg={cardBgColor} 
            borderRadius="xl" 
            boxShadow="xl"
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
            p={6}
          >
            <Box mb={8}>
              <img 
                src="https://keepkey.com/favicon.ico" 
                alt="KeepKey Logo" 
                style={{ 
                  height: '40px', 
                  margin: '0 auto 20px auto',
                  display: 'block'
                }} 
              />
              <Box 
                fontSize="2xl" 
                fontWeight="bold" 
                textAlign="center"
                color={highlightColor}
              >
                KeepKey Desktop Setup
              </Box>
            </Box>
            
            <Steps 
              activeStep={activeStep}
              colorScheme="green"
              borderWidth="1px"
              borderRadius="lg"
              p={4}
              mb={4}
            >
              {steps.map(({ label, content }: any) => (
                <Step 
                  label={<Box fontWeight="medium">{label}</Box>} 
                  key={label}
                >
                  <Box pt={6}>
                    {content}
                  </Box>
                </Step>
              ))}
            </Steps>
          </Box>
        </ModalContent>
      </div>
    </Modal>
  )
}
