import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
  VStack,
} from '@chakra-ui/react'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { SlideTransition } from 'components/SlideTransition'
import { RawText, Text } from 'components/Text'
// import { SessionTypes } from '@walletconnect/types'
import { ipcListeners, ipcRenderer } from 'electron-shim'
import { AnimatePresence } from 'framer-motion'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import type { FC } from 'react'
import { useEffect } from 'react'
import { useCallback, useState } from 'react'
import { MemoryRouter } from 'react-router'
import { Route } from 'react-router'
import { useHistory } from 'react-router'
import { Switch } from 'react-router'

function assume<T>(x: unknown): asserts x is T {}

export type ModalProps = {
  fetchAccs: () => void
}

export const AddAuthenticatorAccountModal = ({ fetchAccs }: ModalProps) => {
  const { addAuthenticatorAccount } = useModal()
  const { close, isOpen } = addAuthenticatorAccount

  const {
    state: { wallet },
  } = useWallet()
  const toast = useToast()

  const addAcc = useCallback(
    async (acc: { domain: string; account: string; secret: string }) => {
      if (!wallet) return

      assume<KeepKeyHDWallet>(wallet)

      toast({
        status: 'info',
        title: 'Account initialized',
        description: `Please complete the process on your KeepKey`,
      })
      const msg = `\x15initializeAuth:${acc.domain}:${acc.account}:${acc.secret}`
      console.log('addAcc msg: ', msg)
      const pong = await wallet
        .ping({
          msg,
        })
        .catch(console.error)
      console.log('add acc resp', pong)
      close()
      setTimeout(fetchAccs, 2000)
    },
    [wallet, toast, close, fetchAccs],
  )

  return (
    <SlideTransition>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          ipcRenderer.send('unlockWindow', {})
          close()
        }}
        isCentered
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
          <ModalCloseButton ml='auto' borderRadius='full' position='static' />
          <ModalHeader>
            <Text translation={'authenticator.modal.header'} />
          </ModalHeader>
          <ModalBody>
            <AnimatePresence exitBeforeEnter>
              <MemoryRouter>
                <Switch>
                  <Route exact path='/'>
                    <ChooseMethod />
                  </Route>
                  <Route exact path='/manual'>
                    <AddManually addAcc={addAcc} />
                  </Route>
                  <Route exact path='/scan'>
                    <AddByScanning addAcc={addAcc} />
                  </Route>
                </Switch>
              </MemoryRouter>
            </AnimatePresence>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SlideTransition>
  )
}

const ChooseMethod = () => {
  const { push } = useHistory()
  return (
    <VStack gap={4}>
      <Button onClick={() => push('/manual')}>
        <Text translation={'authenticator.modal.cta.manual'} />
      </Button>
      <Button onClick={() => push('/scan')}>
        <Text translation={'authenticator.modal.cta.scan'} />
      </Button>
    </VStack>
  )
}

const AddManually: FC<{ addAcc: any }> = ({ addAcc }) => {
  const { goBack } = useHistory()
  const [domain, setDomain] = useState('')
  const [account, setAccount] = useState('')
  const [secret, setSecret] = useState('')
  return (
    <VStack>
      <Input value={domain} onChange={e => setDomain(e.target.value)} placeholder='Issuer' />
      <Input
        value={account}
        onChange={e => setAccount(e.target.value)}
        placeholder='Acccount Name'
      />
      <Input value={secret} onChange={e => setSecret(e.target.value)} placeholder='Secret key' />
      <Button colorScheme={'blue'} onClick={() => addAcc({ domain, account, secret })}>
        <Text translation={'authenticator.modal.header'} />
      </Button>
      <Button onClick={() => goBack()}>Back</Button>
    </VStack>
  )
}

const AddByScanning: FC<{ addAcc: any }> = ({ addAcc }) => {
  const { goBack } = useHistory()

  const [scannedQr, setScannedQr] = useState('')
  const [error, setError] = useState('')

  const scan = () => {
    ipcListeners
      .appReadQr()
      .then(scanned => setScannedQr(scanned ?? ''))
      .catch(setError)
  }

  useEffect(() => {
    setError('')
    if (!scannedQr) return setError('Unable to scan QR')

    if (!/^otpauth:/.test(scannedQr)) return setError('Invalid QR')
    const url = new URL(scannedQr.replace(/^otpauth:/, 'http:'))
    if (url.hostname !== 'totp') return setError('Invalid QR')
    const parsed = /^\/(?<domain>[^/]*?):(?<account>[^/]*)$/.exec(url.pathname)?.groups

    if (!parsed) return setError('Insufficient data in QR')

    const domain = decodeURI(parsed.domain)
    const account = decodeURI(parsed.account)
    const secret = url.searchParams.get('secret')
    if (!domain || !account || !secret) return setError('Insufficient data in QR')

    addAcc({
      domain,
      account,
      secret,
    })
  }, [addAcc, scannedQr])

  return (
    <VStack>
      <Text translation={'authenticator.modal.scan'} />
      {error && <RawText textColor='red.400'>{error}</RawText>}
      <Button colorScheme={'blue'} onClick={() => scan()}>
        <Text translation={'authenticator.modal.cta.scan'} />
      </Button>
      <Button onClick={() => goBack()}>Back</Button>
    </VStack>
  )
}
