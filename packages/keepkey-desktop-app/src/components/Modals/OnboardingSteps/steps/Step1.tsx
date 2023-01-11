import { Box, Button, Center, Image, ModalBody, Stack } from '@chakra-ui/react'
import recovery from 'assets/kk-recovery.png'
import recoveryCipher from 'assets/kk-recovery-cipher.png'

import { Text } from '../../../Text'

export const Step1 = ({
  doNextStep,
  doPreviousStep,
}: {
  doNextStep: () => any
  doPreviousStep: () => any
}) => {
  return (
    <ModalBody p='20px'>
      <Text p='20px' fontWeight='bold' size='xl' translation='modals.onboarding.restoreTitle' />
      <Box
        p='1rem'
        border='1px'
        borderColor='gray.300'
        display='flex'
        justifyContent='space-between'
      >
        <Image src={recovery} style={{ width: '20%', height: '30%' }} />
        <Box>
          <Text p='20px' fontSize='1.4rem' translation='modals.onboarding.restoreText1' />
          <Text p='20px' fontSize='1.4rem' translation='modals.onboarding.restoreText2' />
          <Text p='20px' fontSize='1.4rem' translation='modals.onboarding.restoreText3' />
        </Box>
        <Box>
          <Image src={recoveryCipher} />
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
