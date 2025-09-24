import { Box, Button, Card, CardBody, CardHeader, Flex, Grid, GridItem, Icon, Image, ModalBody, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import recovery from 'assets/kk-recovery.png'
import recoveryCipher from 'assets/kk-recovery-cipher.png'
import { FaKey } from 'react-icons/fa'

export const Step3 = ({
                          doNextStep,
                          doPreviousStep,
                      }: {
    doNextStep: () => any
    doPreviousStep: () => any
}) => {
    // Define colors for better visual hierarchy
    const cardBgColor = useColorModeValue('white', 'gray.700')
    const borderColor = useColorModeValue('gray.200', 'gray.600')
    const iconColor = useColorModeValue('green.500', 'green.300')
    const textColor = useColorModeValue('gray.600', 'gray.300')
    const headerBg = useColorModeValue('gray.50', 'gray.800')
    
    return (
        <ModalBody p='6'>
            <Flex justify="center" mb={6}>
                <Stack direction="row" spacing={4} width="full" maxWidth="md">
                    <Button
                        width="full"
                        maxWidth="150px"
                        colorScheme="gray"
                        onClick={doPreviousStep}
                        borderRadius="md"
                        boxShadow="sm"
                    >
                        Previous
                    </Button>
                    <Button
                        width="full"
                        maxWidth="150px"
                        colorScheme="green"
                        onClick={doNextStep}
                        borderRadius="md"
                        boxShadow="sm"
                        _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                        transition="all 0.2s"
                    >
                        Next
                    </Button>
                </Stack>
            </Flex>

            <Card
                width="full"
                bg={cardBgColor}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                boxShadow="md"
                overflow="hidden"
                mb={6}
            >
                <CardHeader bg={headerBg} borderBottomWidth="1px" borderColor={borderColor}>
                    <Flex align="center" justify="center">
                        <Icon as={FaKey} color={iconColor} boxSize={6} mr={3} />
                        <Text fontSize="xl" fontWeight="bold">What is a Mnemonic?</Text>
                    </Flex>
                </CardHeader>
                <CardBody p={6}>
                    <Grid templateColumns={{ base: "1fr", md: "auto 1fr auto" }} gap={6} alignItems="center">
                        <GridItem>
                            <Image src={recovery} maxH="180px" objectFit="contain" borderRadius="md" />
                        </GridItem>

                        <GridItem>
                            <Text mb={4} fontSize="md">
                                BIP39 is an implementation that standardizes how wallets handle mnemonic phrases and seed phrases,
                                which allow for account recovery in case you lose your device.
                            </Text>
                            <Text mb={4} fontSize="md">
                                A BIP39 recovery phrase is universal, meaning it can be imported into any wallet in the cryptocurrency ecosystem.
                            </Text>
                            <Text mb={4} fontSize="md" fontWeight="bold" color={iconColor}>
                                Never share your recovery phrase with anyone. If you lose your recovery phrase, you will lose access to your funds.
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Image src={recoveryCipher} maxH="180px" objectFit="contain" borderRadius="md" />
                        </GridItem>
                    </Grid>

                    <Box mt={6} p={4} bg={headerBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                        <Text fontWeight="bold" fontSize="sm" color={iconColor}>Security Warning:</Text>
                        <Text fontSize="sm" color={textColor}>
                            Write down your recovery phrase on paper and store it in a secure location. Never store it digitally or take photos of it.
                        </Text>
                    </Box>
                </CardBody>
            </Card>
        </ModalBody>
    )
}
