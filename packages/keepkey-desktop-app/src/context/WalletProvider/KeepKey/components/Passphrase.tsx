import { Button, Input, ModalBody, ModalHeader } from '@chakra-ui/react'
import { Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useRef, useState } from 'react'

export const KeepKeyPassphrase = () => {
  const {
    state: { passphraseDeferred: deferred },
  } = useWallet()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(() => {
    setLoading(true)
    deferred?.resolve(inputRef.current?.value ?? '')
  }, [inputRef, deferred])

  return (
    <>
      <ModalHeader>
        <Text translation={'modals.keepKey.passphrase.header'} />
      </ModalHeader>
      <ModalBody>
        <Text color='gray.500' translation={'modals.keepKey.passphrase.body'} />
        <Input
          type='password'
          ref={inputRef}
          size='lg'
          variant='filled'
          mt={3}
          mb={6}
          autoComplete='current-password'
        />
        <Button width='full' size='lg' colorScheme='blue' onClick={handleSubmit} disabled={loading}>
          <Text translation={'modals.keepKey.passphrase.button'} />
        </Button>
      </ModalBody>
    </>
  )
}
