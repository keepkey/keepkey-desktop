import {
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
  Text as ChakraText,
} from '@chakra-ui/react'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import type { Deferred } from 'common-utils'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
// import { SessionTypes } from '@walletconnect/types'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useEffect, useState } from 'react'

import type { PairingProps } from './types'

export const PairModal = (input: {
  deferred?: Deferred<undefined | string[]>
  data?: PairingProps
}) => {
  const [error] = useState<string | null>(null)
  const [loading] = useState(false)
  const { pair } = useModal()
  const { close, isOpen } = pair
  const [accounts, setAccounts] = useState<string[]>([])

  const { state, dispatch } = useWallet()

  useEffect(() => {
    if (input.data?.type === 'walletconnect') {
      ;(state.wallet as KeepKeyHDWallet)
        .ethGetAddress({
          addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
          showDisplay: false,
        })
        .then(address => {
          setAccounts([address])
        })
    }
  }, [state.wallet, input.data?.type])

  const HandleSubmit = async () => {
    if (input.data?.type === 'native') {
      input.deferred?.resolve(undefined)
    }
    if (input.data?.type === 'walletconnect') {
      input.deferred?.resolve(accounts)
      dispatch({
        type: WalletActions.SET_WALLET_CONNECT_APP,
        payload: input.data?.data.params[0]?.peerMeta,
      })
    }
    close()
  }

  const HandleReject = async () => {
    close()
    if (input.data?.type === 'native') {
      input.deferred?.reject()
    }
  }

  return (
    <SlideTransition>
      <Modal
        isOpen={isOpen}
        onClose={async () => {
          close()
          input.deferred?.reject()
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
                <Image
                  src={
                    input.data?.type === 'native'
                      ? input.data?.data.serviceImageUrl
                      : input?.data?.data.params[0]?.peerMeta?.icons[0]
                  }
                  borderRadius='full'
                  height='10'
                  width='10'
                />

                <Box display='flex' flexDirection='column'>
                  <Text
                    translation={[
                      'modals.pair.native.body',
                      {
                        serviceName:
                          input.data?.type === 'native'
                            ? input.data?.data.serviceName
                            : input?.data?.data.params[0]?.peerMeta.name,
                      },
                    ]}
                    pl='2'
                  />
                  {input.data?.type === 'walletconnect' ? (
                    <ChakraText pl={2} color='gray.500' fontSize='sm'>
                      {input?.data?.data.params[0]?.peerMeta.description}
                    </ChakraText>
                  ) : null}
                </Box>
              </Box>
              {input.data?.type === 'walletconnect' && (
                <Box display='flex' flexDirection='column' gap={1}>
                  {/*<Text translation={'modals.pair.walletconnect.chain'} />*/}
                  {/*{input.data.permissions.blockchain.chains &&*/}
                  {/*  input.data.permissions.blockchain.chains.map(chain => (*/}
                  {/*    <ChakraText color='gray.500'>{chain}</ChakraText>*/}
                  {/*  ))}*/}
                  {/*<Text translation={'modals.pair.walletconnect.relay'} />*/}
                  {/*<ChakraText color='gray.500'>{input.data.relay.protocol}</ChakraText>*/}
                  {/*<Text translation={'modals.pair.walletconnect.methods'} />*/}
                  {/*<ChakraText color='gray.500'>*/}
                  {/*  {input.data.permissions.jsonrpc.methods.join(', ')}*/}
                  {/*</ChakraText>*/}
                  {/*<Text translation={'accounts.accounts'} />*/}
                  {/*{accounts &&*/}
                  {/*  accounts.map(address => <ChakraText color='gray.500'>{address}</ChakraText>)}*/}
                </Box>
              )}
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
