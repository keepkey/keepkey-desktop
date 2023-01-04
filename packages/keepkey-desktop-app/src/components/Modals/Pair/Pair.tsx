import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
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
import { useState } from 'react'

import type { PairingProps } from './types'

export const PairModal = (input: {
  deferred?: Deferred<undefined | string[]>
  data?: PairingProps
}) => {
  const [error] = useState<string | null>(null)
  const [loading] = useState(false)
  const { pair } = useModal()
  const { close, isOpen } = pair

  // const [accounts, setAccounts] = useState<string[]>([])
  //
  // const { state, dispatch } = useWallet()

  // useEffect(() => {
  //   if (input.data?.type === 'walletconnect') {
  //     ;(state.wallet as KeepKeyHDWallet)
  //       .ethGetAddress({
  //         addressNList: [2147483692, 2147483708, 2147483648, 0, 0],
  //         showDisplay: false,
  //       })
  //       .then(address => {
  //         setAccounts([address])
  //       })
  //   }
  // }, [state.wallet, input.data?.type])

  const HandleSubmit = async () => {
    // if (input.data?.type === 'native') {
    //   input.deferred?.resolve(undefined)
    // }
    // if (input.data?.type === 'walletconnect') {
    //   input.deferred?.resolve(accounts)
    //   dispatch({
    //     type: WalletActions.SET_WALLET_CONNECT_APP,
    //     payload: input.data?.data.params[0]?.peerMeta,
    //   })
    // }
    close()
  }

  const HandleReject = async () => {
    close()
    // if (input.data?.type === 'native') {
    //   input.deferred?.reject()
    // }
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
            {/*<Text*/}
            {/*  translation={*/}
            {/*    input.data?.type === 'native'*/}
            {/*      ? 'modals.pair.native.header'*/}
            {/*      : 'modals.pair.walletconnect.header'*/}
            {/*  }*/}
            {/*/>*/}
          </ModalHeader>
          <ModalBody>
            <Stack spacing={4} mb={4}>
              <Box display='flex' flexDirection='row' justifyContent='center' alignItems='center'>
                {/*<Image*/}
                {/*  src={*/}
                {/*    input.data?.type === 'native'*/}
                {/*      ? input.data?.data.serviceImageUrl*/}
                {/*      : input?.data?.data.params[0]?.peerMeta?.icons[0]*/}
                {/*  }*/}
                {/*  borderRadius='full'*/}
                {/*  height='10'*/}
                {/*  width='10'*/}
                {/*/>*/}

                <Box display='flex' flexDirection='column'>
                  {/*<Text*/}
                  {/*  translation={[*/}
                  {/*    'modals.pair.native.body',*/}
                  {/*    {*/}
                  {/*      serviceName:*/}
                  {/*        input.data?.type === 'native'*/}
                  {/*          ? input.data?.data.serviceName*/}
                  {/*          : input?.data?.data.params[0]?.peerMeta.name,*/}
                  {/*    },*/}
                  {/*  ]}*/}
                  {/*  pl='2'*/}
                  {/*/>*/}
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
