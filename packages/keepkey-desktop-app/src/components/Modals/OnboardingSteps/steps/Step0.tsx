import { Box, Button, Center, Image, ModalBody, Stack } from '@chakra-ui/react'
import cipher from 'assets/cipher.png'
import pin from 'assets/KKpin.png'
import { Text } from 'components/Text'

export const Step0 = ({
  doNextStep,
  doPreviousStep,
}: {
  doNextStep: () => any
  doPreviousStep: () => any
}) => {
  return (
    <ModalBody p='20px'>
      <Text p='20px' fontWeight='bold' size='xl' translation='modals.onboarding.pinTitle' />
      <Box
        p='1rem'
        border='1px'
        borderColor='gray.300'
        display='flex'
        justifyContent='space-between'
      >
        <Image src={cipher} style={{ width: '40%', height: '60%' }} />
        <Box>
          <p>
            <Text p='20px' fontSize='2rem' translation='modals.onboarding.pinText1' />
            <Text p='20px' fontSize='1rem' translation='modals.onboarding.pinText2' />
          </p>
          <div justifyContent='flex-end'>
            <Image src={pin} style={{ width: '40%', height: '60%' }} />
          </div>
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
