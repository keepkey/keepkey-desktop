import { Button, Center, ModalBody, Stack } from '@chakra-ui/react'
import { Text } from 'components/Text'

export const Step1 = ({
  doNextStep,
  doPreviousStep,
}: {
  doNextStep: () => any
  doPreviousStep: () => any
}) => {
  return (
    <ModalBody p='20px'>
      <Text p='20px' fontWeight='bold' size='xl' translation='modals.onboarding.pinTitle' />
      <Text p='20px' translation='modals.onboarding.pinText1' />
      <Text p='20px' translation='modals.onboarding.pinText2' />

      <Center>
        <Stack>
          <Button m='10px' p='10px' colorScheme='green' onClick={doPreviousStep}>
            Previous
          </Button>
          <Button m='10px' p='10px' colorScheme='green' onClick={doNextStep}>
            Next
          </Button>
        </Stack>
      </Center>
    </ModalBody>
  )
}
