import { Box, Button, Flex, ModalBody, Select, Stack } from '@chakra-ui/react'
import { locales } from 'assets/translations/constants'
import { useCallback, useState, useEffect } from 'react'
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

    return (
        <ModalBody>
            <Flex alignItems="center" justifyContent="center" flexDirection="column" textAlign="center">
                <Box width="full" maxWidth="md" mb={4}>
                    <Select
                        placeholder="Select Language"
                        value={selectedLanguage}
                        onChange={handleSelectChange}
                        size="lg"
                        variant="outline"
                        textAlign="center"
                    >
                        {locales.map((locale: any) => (
                            <option key={locale.key} value={locale.key}>
                                {locale.label}
                            </option>
                        ))}
                    </Select>
                </Box>
                <Stack direction="row" spacing={4} justify="center" width="full" maxWidth="md">
                    <Button width="full" maxWidth="150px" colorScheme="green" onClick={doPreviousStep}>
                        Previous
                    </Button>
                    <Button width="full" maxWidth="150px" colorScheme="green" onClick={doNextStep}>
                        Next
                    </Button>
                </Stack>
            </Flex>
        </ModalBody>
    )
}
