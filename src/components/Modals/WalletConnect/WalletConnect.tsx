import {
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useClipboard
} from '@chakra-ui/react'
import { ipcRenderer } from 'electron'
import { useEffect, useState } from 'react'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useModal } from 'context/ModalProvider/ModalProvider'

export type PairingProps = {
  serviceName: string
  serviceImageUrl: string
  nonce: string
}

export const WalletConnectModal = (input: any) => {
  const [error] = useState<string | null>(null)
  const [loading] = useState(false)
  const [uri, setUri] = useState('uri:.....')
  const { walletConnect } = useModal()
  const { close, isOpen } = walletConnect
  const { hasCopied, onCopy } = useClipboard(uri)

  const HandleSubmit = async (e: any) => {
    console.log("uri: ", uri)
    //let uri = "wc:240dd2161033bac5777092fa4d9eca9862ad2b50e85296f6e5cfa2cc14add821@2?controller=false&publicKey=1912b3c960e59faec30dd2a6776fb95503f207f1e73e0bc150d985b8d352f676&relay=%7B%22protocol%22%3A%22waku%22%7D"
    ipcRenderer.send(`@connect/pair`, uri)
  }

  const handleInputChange = (e: { target: { value: any } }) => setUri(e.target.value)

  useEffect(() => {
    // @ts-ignore
    navigator.permissions.query({ name: "clipboard-read" }).then(async (result) => {
      // If permission to read the clipboard is granted or if the user will
      // be prompted to allow it, we proceed.

      if (result.state == "granted" || result.state == "prompt") {
        navigator.clipboard.read().then(async (data) => {
          const link = await data[0].getType("text/plain")
          link.text().then(setUri)
        });
      }
    });
  }, [navigator.permissions])

  // const HandleReject = async () => {
  //   ipcRenderer.send(`@bridge/reject-service-${input.nonce}`, input)
  //   close()
  // }

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
            <Text translation={'modals.pair.header'} />
          </ModalHeader>
          <ModalBody>
            <Stack spacing={4} mb={4}>
              <Box display='inline-flex' justifyContent='center' alignItems='center'>

              </Box>
              {error && (
                <Alert status='error'>
                  <AlertIcon />
                  <AlertDescription>
                    <Text translation={error} />
                  </AlertDescription>
                </Alert>
              )}
              <FormControl>
                <FormLabel htmlFor='uri'>URI</FormLabel>
                <Input
                  id='uri'
                  value={uri}
                  onChange={handleInputChange}
                />
                <FormHelperText>Enter Wallet Connect URI</FormHelperText>
                <Button
                  mt={4}
                  colorScheme='teal'
                  type='submit'
                  onClick={HandleSubmit}
                >
                  Submit
                </Button>
              </FormControl>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SlideTransition>
  )
}
