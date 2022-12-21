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
// import { SessionTypes } from '@walletconnect/types'
import { ipcRenderer } from 'electron-shim'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { MemoryRouter } from 'react-router'
import { Route } from 'react-router'
import { useHistory } from 'react-router'
import { Switch } from 'react-router'
// import screenshot from 'screenshot-desktop'
// import QrScanner from 'qr-scanner'

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
      await wallet
        .ping({
          msg,
        })
        .catch(console.error)
      close()
      fetchAccs()
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
            <SlideTransition>
              <MemoryRouter>
                <Switch>
                  <Route exact path='/'>
                    <ChooseMethod />
                  </Route>
                  <Route exact path='/manual'>
                    <AddManually addAcc={addAcc} />
                  </Route>
                  <Route exact path='/scan'>
                    <AddByScanning />
                  </Route>
                </Switch>
              </MemoryRouter>
            </SlideTransition>
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

const AddByScanning = () => {
  const { goBack } = useHistory()
  const scan = () => {
    // screenshot().then(img => {
    //   QrScanner.scanImage(new Blob([img])).then(console.log)
    // })
  }
  return (
    <VStack>
      <Text translation={'authenticator.modal.scan'} />
      <Button colorScheme={'blue'} onClick={() => scan}>
        <Text translation={'authenticator.modal.cta.scan'} />
      </Button>
      <Button onClick={() => goBack()}>Back</Button>
    </VStack>
  )
}
