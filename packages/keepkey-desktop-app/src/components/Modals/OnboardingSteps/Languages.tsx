import { Button, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { locales } from 'assets/translations/constants'
import { RawText } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import { useCallback } from 'react'
import { useTranslate } from 'react-polyglot'
import { preferences } from 'state/slices/preferencesSlice/preferencesSlice'
import { useAppDispatch } from 'state/store'

export const Languages = () => {
  const { languages, onboardingSteps } = useModal()
  const translate = useTranslate()
  const dispatch = useAppDispatch()
  const { close, isOpen } = languages

  const onLanguageSelect = useCallback(
    (locale: any) => {
      dispatch(preferences.actions.setSelectedLocale({ locale }))
      close()
      window.localStorage.setItem('languageSelected', 'true')
      onboardingSteps.open({})
    },
    [close, dispatch, onboardingSteps],
  )
  return (
    <Modal isOpen={isOpen} onClose={close} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign='center'>{translate('modals.settings.language')}</ModalHeader>
        <>
          <ModalBody alignItems='center' justifyContent='center' textAlign='center'>
            {locales.map((locale: any) => (
              <Button
                width='full'
                justifyContent='flexStart'
                pl={12}
                key={locale.key}
                variant='ghost'
                onClick={() => onLanguageSelect(locale.key)}
              >
                <RawText>{locale.label}</RawText>
              </Button>
            ))}
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  )
}
