import { Button, Input, ModalBody, ModalHeader } from '@chakra-ui/react'
import { AwaitKeepKey } from 'components/Layout/Header/NavBar/KeepKey/AwaitKeepKey'
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
        <form onSubmit={handleSubmit}>
          <Input
            type='password'
            ref={inputRef}
            size='lg'
            variant='filled'
            mt={3}
            mb={6}
            autoFocus={true}
            autoComplete='current-password'
            disabled={loading}
          />
          <Button width='full' size='lg' colorScheme='blue' type='submit' disabled={loading}>
            <Text translation={'modals.keepKey.passphrase.button'} />
          </Button>
        </form>
        <AwaitKeepKey
          translation={'modals.keepKey.passphrase.bodyConfirm'}
          noCancel={true}
          awaitingDeviceInteraction={loading}
        />
      </ModalBody>
    </>
  )
}
