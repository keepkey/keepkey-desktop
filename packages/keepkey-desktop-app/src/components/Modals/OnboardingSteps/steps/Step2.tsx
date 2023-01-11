import { Box, Button, Center, Image, ModalBody, Stack } from '@chakra-ui/react'
import { Text } from 'components/Text'
import dapps from 'assets/dapps-banner.png'

export const Step2 = ({
  doNextStep,
  doPreviousStep,
}: {
  doNextStep: () => any
  doPreviousStep: () => any
}) => {
  return (
    <ModalBody p='20px'>
      <Text p='20px' fontWeight='bold' size='xl' translation='modals.onboarding.dappsTitle' />
      <Box
        p='1rem'
        border='1px'
        borderColor='gray.300'
        display='flex'
        justifyContent='space-between'
      >
        <Image src={dapps} style={{ width: '60%', height: '1200%' }} />
        <Box>
          <Text p='20px' fontSize='1.2rem' translation='modals.onboarding.dappsText1' />
          <Text p='20px' fontSize='1.2rem' translation='modals.onboarding.dappsText2' />
          <Text p='20px' fontSize='1.2rem' translation='modals.onboarding.dappsText3' />
        </Box>
      </Box>

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
