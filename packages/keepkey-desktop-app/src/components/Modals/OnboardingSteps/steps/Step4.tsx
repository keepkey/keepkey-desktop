import { Box, Button, Card, CardBody, CardHeader, Flex, Icon, Image, ModalBody, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import bex from 'assets/bex-pages.png'
import { FaChrome } from 'react-icons/fa'

export const Step4 = ({
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
                        Finish
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
                        <Icon as={FaChrome} color={iconColor} boxSize={6} mr={3} />
                        <Text fontSize="xl" fontWeight="bold">What is a DApp?</Text>
                    </Flex>
                </CardHeader>
                <CardBody p={6}>

                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        align="center"
                        justify="space-between"
                        bg={useColorModeValue('gray.50', 'gray.800')}
                        p={4}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={borderColor}
                    >
                        <Box maxW={{ base: '100%', md: '45%' }} mb={{ base: 6, md: 0 }}>
                            <Image
                                src={bex}
                                borderRadius="md"
                                boxShadow="md"
                                objectFit="contain"
                            />
                        </Box>

                        <Box flex="1" ml={{ md: 6 }}>
                            <Text mb={4} fontSize="md">
                                Try the KeepKey Browser Extension to manage your crypto securely within your browser.
                                Connect to dApps and enjoy hardware-level protection—all in one place.
                            </Text>
                            <Text mb={4} fontSize="md">
                                Take control of your crypto experience with KeepKey's Browser Extension. Seamlessly interact
                                with dApps, safeguard your assets, and stay updated on market movements, right from your browser.
                            </Text>
                            <Text fontSize="md">
                                Upgrade your crypto management! The KeepKey Browser Extension offers simple, secure, and real-time
                                access to your assets. Download now to experience the future of crypto management.
                            </Text>
                        </Box>
                    </Flex>
                </CardBody>
            </Card>
        </ModalBody>
    )
}
