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
      <Center mb={6}>
        <Stack direction='row' spacing={4}>
          <Button colorScheme='gray' onClick={doPreviousStep} width='150px'>
            Previous
          </Button>
          <Button colorScheme='green' onClick={doNextStep} width='150px'>
            Next
          </Button>
        </Stack>
      </Center>
      <AppSettings />
    </ModalBody>
  )
}
