import { Button, Center, ModalBody, Stack } from '@chakra-ui/react'
import { AppSettings } from 'components/Modals/Settings/AppSettings'

export const Step1 = ({
  doNextStep,
  doPreviousStep,
}: {
  doNextStep: () => any
  doPreviousStep: () => any
}) => {
  return (
    <ModalBody alignItems='center' justifyContent='center' textAlign='center'>
      <AppSettings />
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
