import { Box, Button, Card, CardBody, CardHeader, Flex, Icon, ModalBody, Select, Stack, Text, useColorModeValue } from '@chakra-ui/react'
import { locales } from 'assets/translations/constants'
import { useCallback, useState, useEffect } from 'react'
import { FaGlobe } from 'react-icons/fa'
import { preferences } from 'state/slices/preferencesSlice/preferencesSlice'
import { useAppDispatch } from 'state/store'

export const Step0 = ({
                          doNextStep,
                          doPreviousStep,
                      }: {
    doNextStep: () => any
    doPreviousStep: () => any
}) => {
    const dispatch = useAppDispatch()
    const defaultLanguage = 'en'  // Set English as the default language
    const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage)

    const onLanguageSelect = useCallback(
        (locale: any) => {
            dispatch(preferences.actions.setSelectedLocale({ locale }))
            window.localStorage.setItem('languageSelected', 'true')
        },
        [dispatch]
    )

    useEffect(() => {
        // Set default language on component mount
        onLanguageSelect(defaultLanguage)
    }, [onLanguageSelect, defaultLanguage])

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLocale = event.target.value
        setSelectedLanguage(selectedLocale)
        onLanguageSelect(selectedLocale)
    }

    // Define colors for better visual hierarchy
    const cardBgColor = useColorModeValue('white', 'gray.700')
    const borderColor = useColorModeValue('gray.200', 'gray.600')
    const iconColor = useColorModeValue('green.500', 'green.300')
    
    return (
        <ModalBody>
            <Flex alignItems="center" justifyContent="center" flexDirection="column" textAlign="center">
                <Stack
                    direction="row"
                    spacing={4}
                    justify="center"
                    width="full"
                    maxWidth="md"
                    mb={6}
                >
                    <Button
                        width="full"
                        maxWidth="150px"
                        colorScheme="gray"
                        onClick={doPreviousStep}
                        borderRadius="md"
                        boxShadow="sm"
                        isDisabled={true}
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

                <Card
                    width="full"
                    maxWidth="md"
                    mb={6}
                    bg={cardBgColor}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    boxShadow="md"
                    overflow="hidden"
                >
                    <CardHeader bg={useColorModeValue('gray.50', 'gray.800')} borderBottomWidth="1px" borderColor={borderColor}>
                        <Flex align="center" justify="center">
                            <Icon as={FaGlobe} color={iconColor} boxSize={6} mr={3} />
                            <Text fontSize="xl" fontWeight="bold">Select Your Language</Text>
                        </Flex>
                    </CardHeader>
                    <CardBody p={6}>
                        <Text mb={4} color={useColorModeValue('gray.600', 'gray.400')}>
                            Choose your preferred language for the KeepKey Desktop application.
                        </Text>
                        <Box width="full" mb={4}>
                            <Select
                                placeholder="Select Language"
                                value={selectedLanguage}
                                onChange={handleSelectChange}
                                size="lg"
                                variant="filled"
                                textAlign="center"
                                borderColor={borderColor}
                                _hover={{ borderColor: 'green.400' }}
                                focusBorderColor="green.500"
                                bg={useColorModeValue('gray.50', 'gray.900')}
                            >
                                {locales.map((locale: any) => (
                                    <option key={locale.key} value={locale.key}>
                                        {locale.label}
                                    </option>
                                ))}
                            </Select>
                        </Box>
                    </CardBody>
                </Card>
            </Flex>
        </ModalBody>
    )
}
