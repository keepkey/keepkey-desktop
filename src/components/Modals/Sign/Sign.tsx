import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Collapse,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Textarea
} from '@chakra-ui/react'
import { ipcRenderer } from 'electron'
import React, { useRef, useState } from 'react'
import { Text } from 'components/Text'
import { useModal } from 'context/ModalProvider/ModalProvider'
import { useWallet } from 'context/WalletProvider/WalletProvider'

export const SignModal = (input: any) => {
  const { pioneer } = useWallet()
  const [error] = useState<string | null>(null)
  const [loading] = useState(false)
  const [show, setShow] = React.useState(false)
  const { sign } = useModal()
  const { close, isOpen } = sign

  const inputRef = useRef<HTMLInputElement | null>(null)
  const HDwalletPayload = input.invocation.unsignedTx.HDwalletPayload

  const HandleSubmit = async () => {
    //show sign
    await pioneer.signTx(input.invocation.unsignedTx)
  }

  const HandleReject = async () => {
    //show sign
    ipcRenderer.send('unlockWindow', {})
    close()
  }

  const handleToggle = () => setShow(!show)

  // @ts-ignore
  return (
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
          <Text translation={'modals.sign.header'} />
        </ModalHeader>
        <ModalBody>
          {/*<div>unsignedTx: {JSON.stringify(unsignedTx)}</div>*/}
          {/*<div>HDwalletPayload: {JSON.stringify(HDwalletPayload)}</div>*/}

          {/*<div>type: {JSON.stringify(input?.invocation?.unsignedTx?.transaction?.type)}</div>*/}
          <small>
            {/*<div>invocation: {invocationId}</div>*/}
            <div>
              network: {JSON.stringify(input?.invocation?.unsignedTx?.transaction?.network)}
            </div>

            <div>
              from: {JSON.stringify(input?.invocation?.unsignedTx?.transaction?.addressFrom)}
            </div>
            <div>to: {JSON.stringify(input?.invocation?.unsignedTx?.transaction?.recipient)}</div>
            <div>amount: {JSON.stringify(input?.invocation?.unsignedTx?.transaction?.amount)}</div>
          </small>

          <Text color='gray.500' translation={'modals.sign.body'} />

          <Collapse in={show}>
            <div>
              HDwalletPayload:
              <Textarea
                value={JSON.stringify(HDwalletPayload, undefined, 4)}
                size='md'
                resize='vertical'
              />
            </div>
          </Collapse>
          <Button size='sm' onClick={handleToggle} mt='1rem'>
            {show ? 'hide' : 'Advanced'}
          </Button>

          <Input
            ref={inputRef}
            size='lg'
            variant='filled'
            mt={3}
            mb={6}
            autoComplete='current-password'
          />
          {error && (
            <Alert status='error'>
              <AlertIcon />
              <AlertDescription>
                <Text translation={error} />
              </AlertDescription>
            </Alert>
          )}
          <Button
            isFullWidth
            size='lg'
            colorScheme='blue'
            onClick={HandleSubmit}
            disabled={loading}
          >
            <Text translation={'modals.sign.sign'} />
          </Button>
          <br />
          <Button size='sm' colorScheme='red' onClick={HandleReject}>
            <Text translation={'modals.sign.reject'} />
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
