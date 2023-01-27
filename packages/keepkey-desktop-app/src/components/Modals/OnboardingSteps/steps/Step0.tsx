import { Box, Button, Center, Flex, ModalBody, Stack, VStack } from '@chakra-ui/react'
import { locales } from 'assets/translations/constants'
import { RawText } from 'components/Text'
import { useCallback } from 'react'
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

  const onLanguageSelect = useCallback(
    (locale: any) => {
      dispatch(preferences.actions.setSelectedLocale({ locale }))
      window.localStorage.setItem('languageSelected', 'true')
      doNextStep()
    },
    [dispatch, doNextStep],
  )
  return (
    <ModalBody alignItems='center' justifyContent='center' textAlign='center'>
      <Flex alignItems='center' justifyContent='center' flexDir='column'>
        <Box boxSize='md'>
          {locales.map((locale: any) => (
            <Button
              width='full'
              justifyContent='center'
              pl={12}
              key={locale.key}
              variant='ghost'
              onClick={() => onLanguageSelect(locale.key)}
            >
              <RawText>{locale.label}</RawText>
            </Button>
          ))}
        </Box>
        <Stack>
          <Button m='10px' p='10px' colorScheme='green' onClick={doPreviousStep}>
            Previous
          </Button>
          <Button m='10px' p='10px' colorScheme='green' onClick={doNextStep}>
            Next
          </Button>
        </Stack>
      </Flex>
    </ModalBody>
  )
}
