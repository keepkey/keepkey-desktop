import { Box, Button, Center, Image, ModalBody, Stack } from '@chakra-ui/react'
import bex from 'assets/bex-pages.png'
import { Text } from 'components/Text'

export const Step4 = ({
                          doNextStep,
                          doPreviousStep,
                      }: {
    doNextStep: () => any
    doPreviousStep: () => any
}) => {
    return (
        <ModalBody p='20px'>
            <Text p='20px' fontWeight='bold' size='xl' translation='modals.onboarding.dappsTitle' />

            <Center mb="20px">
                <Button
                    colorScheme='blue'
                    size='lg'
                    onClick={() => window.open('https://keepkey.com/bex', '_blank')}
                >
                    Try the KeepKey Browser Extension
                </Button>
            </Center>

            <Box
                p='1rem'
                border='1px'
                borderColor='gray.300'
                display='flex'
                flexDirection={{ base: 'column', md: 'row' }}
                alignItems="center"
                justifyContent="space-between"
            >
                <Image src={bex} maxW={{ base: '100%', md: '45%' }} mb={{ base: 4, md: 0 }} />

                <Box flex="1" ml={{ md: '1rem' }} textAlign={{ base: 'center', md: 'left' }}>
                    <Text p='10px' fontSize='1.2rem' translation='modals.onboarding.bexText1' />
                    <Text p='10px' fontSize='1.2rem' translation='modals.onboarding.bexText2' />
                    <Text p='10px' fontSize='1.2rem' translation='modals.onboarding.bexText3' />
                </Box>
            </Box>

            <Center mt="20px">
                <Stack direction="row" spacing={4}>
                    <Button colorScheme="green" onClick={doPreviousStep}>
                        Previous
                    </Button>
                    <Button colorScheme="green" onClick={doNextStep}>
                        Next
                    </Button>
                </Stack>
            </Center>
        </ModalBody>
    )
}
