import { Button, Center, Flex, ModalBody, ModalHeader, Stack, Tag } from '@chakra-ui/react'
import { useTranslate } from 'react-polyglot'
import { RawText, Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'

import { SUPPORTED_WALLETS } from './config'
import { KeyManager } from './KeyManager'

export const SelectModal = () => {
  const {
    state: { adapters, walletInfo },
    connect,
    create
  } = useWallet()
  const translate = useTranslate()

  return (
    <>
      <ModalHeader>
        <Text translation={'walletProvider.selectModal.header'} />
      </ModalHeader>
      <ModalBody>
        <Text mb={6} color='gray.500' translation={'walletProvider.selectModal.body'} />
        <Stack mb={6}>
          <div>
            {adapters &&
              // TODO: KeepKey adapter may fail due to the USB interface being in use by another tab
              // So not all of the supported wallets will have an initialized adapter
              // TODO: hacky shortlist, fixme (why is so fricken hard to disable a wallet), TODO feature flag new wallets?)
              Object.values({
                KeepKey: 'keepkey'
              }).map(key => {
                // @ts-ignore
                const option = SUPPORTED_WALLETS[key]
                const Icon = option.icon
                return (
                  <Button
                    key={key}
                    w='full'
                    size='lg'
                    py={8}
                    justifyContent='space-between'
                    // @ts-ignore
                    onClick={() => connect(key)}
                  >
                    <Flex alignItems='center'>
                      <RawText fontWeight='semibold'>{option.name}</RawText>
                      {walletInfo?.name === option.name && (
                        <Tag colorScheme='green' ml={2}>
                          <Text translation='common.connected' />
                        </Tag>
                      )}
                    </Flex>
                    <Center>
                      <Icon height='30px' w='auto' />
                    </Center>
                  </Button>
                )
              })}
          </div>
          {/*<div>*/}
          {/*  <br />*/}
          {/*  <Text mb={6} translation={'walletProvider.selectModal.cta'} />*/}
          {/*  <Text mb={6} color='gray.500' translation={'walletProvider.selectModal.demo'} />*/}
          {/*  {adapters &&*/}
          {/*    // TODO: KeepKey adapter may fail due to the USB interface being in use by another tab*/}
          {/*    // So not all of the supported wallets will have an initialized adapter*/}
          {/*    // TODO: hacky shortlist, fixme (why is so fricken hard to disable a wallet), TODO feature flag new wallets?)*/}
          {/*    Object.values({*/}
          {/*      Native: 'native'*/}
          {/*    }).map(key => {*/}
          {/*      // @ts-ignore*/}
          {/*      const option = SUPPORTED_WALLETS[key]*/}
          {/*      const Icon = option.icon*/}
          {/*      return (*/}
          {/*        <Button*/}
          {/*          key={key}*/}
          {/*          w='full'*/}
          {/*          size='lg'*/}
          {/*          py={8}*/}
          {/*          justifyContent='space-between'*/}
          {/*          // @ts-ignore*/}
          {/*          onClick={() => connect(key)}*/}
          {/*        >*/}
          {/*          <Flex alignItems='center'>*/}
          {/*            <RawText fontWeight='semibold'>Load a Mnemonic</RawText>*/}
          {/*            {walletInfo?.name === option.name && (*/}
          {/*              <Tag colorScheme='green' ml={2}>*/}
          {/*                <Text translation='common.connected' />*/}
          {/*              </Tag>*/}
          {/*            )}*/}
          {/*          </Flex>*/}
          {/*          <Center>*/}
          {/*            <Icon height='30px' w='auto' />*/}
          {/*          </Center>*/}
          {/*        </Button>*/}
          {/*      )*/}
          {/*    })}*/}
          {/*</div>*/}
        </Stack>
        <Flex direction={['column', 'row']} mt={2} justifyContent='center' alignItems='center'>
          <Text
            mb={[3]}
            color='gray.500'
            translation={walletInfo?.name ? 'common.or' : 'walletProvider.selectModal.footer'}
          />
          <Button
            variant='link'
            mb={[3]}
            ml={[0, 1.5]}
            borderTopRadius='none'
            colorScheme='blue'
            onClick={() => create(KeyManager.Native)}
          >
            {translate('walletProvider.selectModal.create')}
          </Button>
        </Flex>
      </ModalBody>
    </>
  )
}
