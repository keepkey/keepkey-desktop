import { WarningTwoIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  ChakraText,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'
// import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import type { Deferred } from 'common-utils'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
// import { WalletActions } from 'context/WalletProvider/actions'
// import { SessionTypes } from '@walletconnect/types'
import { useModal } from 'hooks/useModal/useModal'
import { getPioneerClient } from 'lib/getPioneerCleint'
import { useEffect, useState } from 'react'

import type { PairingProps } from './types'

export const PairModal = (input: { deferred?: Deferred<boolean>; data?: PairingProps }) => {
  const [error] = useState<string | null>(null)
  const [loading] = useState(false)
  const [isFound, setIsFound] = useState(false)
  const { pair } = useModal()
  const { close, isOpen } = pair

  let onStart = async function () {
    try {
      const pioneer = await getPioneerClient()

      let globals = await pioneer.Globals()
      console.log('globals: ', globals)
      console.log('input.data: ', input.data)
      console.log('input.data: ', input.data.name)

      //find EVP by name
      let evpData = await pioneer.ListAppsByName({ name: input.data.name })
      console.log('evpData: ', evpData)
      //if found EVP, send to device

      if (evpData[0]) {
        //send to device
      } else {
        //show Warning
        setIsFound(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    onStart()
  }, [input, input.data, input.data?.type])

  const HandleSubmit = async () => {
    console.log('Approving!')
    input.deferred?.resolve(true)
    close()
  }

  const HandleReject = async () => {
    console.log('Rejecting!')
    console.log('input: !', input)
    input.deferred?.resolve(false)
    close()
  }

  return (
    <SlideTransition>
      <Modal
        isOpen={isOpen}
        onClose={async () => {
          close()
          // input.deferred?.reject()
        }}
        isCentered
        closeOnOverlayClick={false}
        closeOnEsc={false}
      >
        <ModalOverlay />
        <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
          <ModalCloseButton ml='auto' borderRadius='full' position='static' />
          <ModalHeader>
            <Text
              translation={
                input.data?.type === 'native'
                  ? 'modals.pair.native.header'
                  : 'modals.pair.walletconnect.header'
              }
            />
          </ModalHeader>
          <ModalBody>
            <Stack spacing={4} mb={4}>
              <Box display='flex' flexDirection='row' justifyContent='center' alignItems='center'>
                <Box display='flex' flexDirection='column'>
                  <Text
                    translation={[
                      'modals.pair.native.body',
                      {
                        serviceName:
                          input.data?.type === 'native'
                            ? input.data.name
                            : input?.data?.data.params[0]?.peerMeta.name,
                      },
                    ]}
                    pl='2'
                  />
                  {isFound ? (
                    <div>
                      <Image
                        src={
                          input.data?.type === 'native'
                            ? input.data?.ImageUrl
                            : input?.data?.data.params[0]?.peerMeta?.icons[0]
                        }
                        borderRadius='full'
                        height='10'
                        width='10'
                      />
                    </div>
                  ) : (
                    <div>
                      <WarningTwoIcon boxSize={12} color='yellow.500' />
                      <h4>This Dapp is not recognized, use at your own risk!</h4>
                    </div>
                  )}

                  {/*{input.data?.type === 'walletconnect' ? (*/}
                  {/*  <ChakraText pl={2} color='gray.500' fontSize='sm'>*/}
                  {/*    {input?.data?.data.params[0]?.peerMeta.description}*/}
                  {/*  </ChakraText>*/}
                  {/*) : null}*/}
                </Box>
              </Box>
              {/*{input.data?.type === 'walletconnect' && (*/}
              {/*  <Box display='flex' flexDirection='column' gap={1}>*/}
              {/*  </Box>*/}
              {/*)}*/}
              {error && (
                <Alert status='error'>
                  <AlertIcon />
                  <AlertDescription>
                    <Text translation={error} />
                  </AlertDescription>
                </Alert>
              )}
              <Button
                width='full'
                size='lg'
                colorScheme='blue'
                onClick={HandleSubmit}
                disabled={loading}
              >
                <Text translation={'modals.pair.cta.pair'} />
              </Button>
              <Button
                width='full'
                size='lg'
                colorScheme='red'
                onClick={HandleReject}
                disabled={loading}
              >
                <Text translation={'modals.pair.cta.reject'} />
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SlideTransition>
  )
}
