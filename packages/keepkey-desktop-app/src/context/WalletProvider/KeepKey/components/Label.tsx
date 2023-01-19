import { Button, Input, ModalBody, ModalHeader } from '@chakra-ui/react'
import { Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useState } from 'react'
import { useTranslate } from 'react-polyglot'

const sanitizeLabel = (desiredLabel: string) => {
  // We prevent all special chars and any length > 12.
  // eslint-disable-next-line no-control-regex
  return desiredLabel.replace(/[^\x20-\x7E]+/g, '').substring(0, 12)
}

export const KeepKeyLabel = () => {
  const [loading, setLoading] = useState(false)
  const {
    state: { labelDeferred },
  } = useWallet()
  const [desiredLabel, setDesiredLabel] = useState('')
  const translate = useTranslate()

  const handleSetDesiredLabel = useCallback(
    (x: string) => setDesiredLabel(sanitizeLabel(x)),
    [setDesiredLabel],
  )

  const handleSubmit = useCallback(async () => {
    setLoading(true)
    labelDeferred?.resolve(desiredLabel)
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
            onChange={e => handleSetDesiredLabel(e.target.value)}
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
