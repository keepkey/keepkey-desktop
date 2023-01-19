import { Button, Input, ModalBody, ModalHeader } from '@chakra-ui/react'
import { Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useState } from 'react'
import { useTranslate } from 'react-polyglot'

export const KeepKeyLabel = () => {
  const [loading, setLoading] = useState(false)
  const {
    state: { labelDeferred },
  } = useWallet()
  const [desiredLabel, setDesiredLabel] = useState('')
  const translate = useTranslate()

  const handleSubmit = useCallback(async () => {
    setLoading(true)

    //We prevent all special chars and any length > 12. We just yolo trim and send it (user can change later)
    // eslint-disable-next-line no-control-regex
    let sanitizedLabel = desiredLabel.replace(/[^\x00-\x7F]+/g, '').substring(0, 12)
    labelDeferred?.resolve(sanitizedLabel ?? '')
  }, [desiredLabel, labelDeferred])

  return (
    <>
      <ModalHeader>
        <Text translation={'modals.keepKey.label.header'} />
      </ModalHeader>
      <ModalBody>
        <Text color='gray.500' translation={'modals.keepKey.label.body'} mb={4} />
        <form onSubmit={handleSubmit}>
          <Input
            type='text'
            value={desiredLabel}
            disabled={loading}
            placeholder={translate('modals.keepKey.label.placeholder')}
            onChange={e => setDesiredLabel(e.target.value)}
            size='lg'
            variant='filled'
            mt={3}
            mb={6}
            autoFocus={true}
          />
          <Button width='full' size='lg' colorScheme='blue' type='submit' disabled={loading} mb={3}>
            <Text
              translation={
                desiredLabel
                  ? 'modals.keepKey.label.setLabelButton'
                  : 'modals.keepKey.label.skipLabelButton'
              }
            />
          </Button>
        </form>
      </ModalBody>
    </>
  )
}
