import { WarningTwoIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Checkbox,
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
import { useCallback, useEffect, useState } from 'react'

import type { PairingProps } from './types'

export const PairModal = ({
  deferred,
  input,
}: {
  deferred?: Deferred<boolean>
  input?: PairingProps
}) => {
  const [error] = useState<string | null>(null)
  const [loading] = useState(false)
  const [isFound, setIsFound] = useState(true)
  const [makeDefault, setMakeDefault] = useState(false)
  const { pair } = useModal()
  const { close, isOpen } = pair

  let onStart = useCallback(
    async function () {
      try {
        const pioneer = await getPioneerClient()

        let globals = await pioneer.Globals()
        console.log('globals: ', globals)
        console.log('input.data: ', input?.data)
        console.log('input.data: ', input?.data.name)

        //find EVP by name
        let evpData = await pioneer.ListAppsByName({ name: input?.data.name })
        console.log('evpData: ', evpData)
        //if found EVP, send to device

        if (evpData[0]) {
          //send to device
        } else {
          //show Warning
          // setIsFound(false)
        }
      } catch (e) {
        console.error(e)
      }
    },
    [input?.data],
  )

  useEffect(() => {
    onStart()
  }, [input, input?.data, input?.type, onStart])

  const HandleSubmit = async () => {
    if (makeDefault && input?.type === 'native' && input?.data.url)
      localStorage.setItem('@app/defaultDapp', JSON.stringify(input?.data))
    console.log('Approving!')
    deferred?.resolve(true)
    close()
  }

  const HandleReject = async () => {
    console.log('Rejecting!')
    console.log('input: !', input)
    deferred?.resolve(false)
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
                input?.type === 'native'
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
                          input?.type === 'native'
                            ? input?.data.name
                            : input?.data.params[0]?.peerMeta.name,
                      },
                    ]}
                    pl='2'
                  />
                  {isFound ? (
                    <Box
                      display='flex'
                      flexDirection='row'
                      justifyContent='center'
                      alignItems='center'
                    >
                      <Image
                        src={
                          input?.type === 'native'
                            ? input?.data?.imageUrl
                            : input?.data?.params[0]?.peerMeta?.icons[0]
                        }
                        borderRadius='full'
                        height='60'
                        width='60'
                      />
                    </Box>
                  ) : (
                    <div>
                      <WarningTwoIcon boxSize={12} color='yellow.500' />
                      <h4>
                        <Text translation={'modals.pair.notFound'} />
                      </h4>
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
              <Checkbox onChange={e => setMakeDefault(e.target.checked)}>
                <Text translation={'modals.pair.cta.makeDefault'} />
              </Checkbox>
              <Button colorScheme='blue' onClick={HandleSubmit} disabled={loading}>
                <Text translation={'modals.pair.cta.pair'} />
              </Button>
              <Button colorScheme='red' onClick={HandleReject} disabled={loading}>
                <Text translation={'modals.pair.cta.reject'} />
              </Button>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SlideTransition>
  )
}
