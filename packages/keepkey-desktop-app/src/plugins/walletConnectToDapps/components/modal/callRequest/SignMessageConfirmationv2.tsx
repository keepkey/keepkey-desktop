import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Divider,
  HStack,
  IconButton,
  Image,
  Link,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useCallback, useState } from 'react'
import { useTranslate } from 'react-polyglot'
import { Card } from 'components/Card/Card'
import { KeepKeyIcon } from 'components/Icons/KeepKeyIcon'
import { RawText, Text } from 'components/Text'

import { AddressSummaryCard } from './AddressSummaryCard'
import type { SignClientTypes } from '@walletconnect/types'
import { getSignParamsMessage, rejectEIP155Request } from 'plugins/walletConnectToDapps/utils/utils'
import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import { WalletConnectSignClient } from 'kkdesktop/walletconnect/utils'
import { useWallet } from 'hooks/useWallet/useWallet'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'

export const SignMessageConfirmationV2 = () => {
  const translate = useTranslate()
  const cardBg = useColorModeValue('white', 'gray.850')
  const {
    state: { wallet },
  } = useWallet()
  const walletConnect = useWalletConnect()

  const [loading, setLoading] = useState(false)

  const { requests, removeRequest } = useWalletConnect()
  const toast = useToast()

  const currentRequest = requests[0] as SignClientTypes.EventArguments['session_request']
  const { topic, params, id } = currentRequest
  const { request, chainId } = params
  const message = getSignParamsMessage(request.params)

  const onConfirm = useCallback(
    async (txData: any) => {
      try {
        if (!wallet) return
        setLoading(true)

        const message = getSignParamsMessage(request.params)
        const accountPath = (wallet as KeepKeyHDWallet).ethGetAccountPaths({
          coin: 'Ethereum',
          accountIdx: 0,
        })
        const signedMessage = await (wallet as KeepKeyHDWallet).ethSignMessage({
          ...txData,
          addressNList: accountPath[0].addressNList,
          message,
        })
        console.log(signedMessage)
        const response = formatJsonRpcResult(id, signedMessage)

        console.log(response)

        await WalletConnectSignClient.respond({
          topic,
          response,
        })

        removeRequest(currentRequest.id)
      } catch (e) {
        toast({
          title: 'Error',
          description: `Transaction error ${e}`,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    },
    [currentRequest.id, removeRequest, requests, toast, wallet],
  )

  const onReject = useCallback(async () => {
    const response = rejectEIP155Request(currentRequest)
    WalletConnectSignClient.respond({
      topic: currentRequest.topic,
      response,
    })
    removeRequest(currentRequest.id)
    setLoading(false)
  }, [currentRequest, removeRequest])

  if (!walletConnect.isConnected || !walletConnect.dapp || walletConnect.isLegacy) return null

  return (
    <VStack p={6} spacing={6} alignItems='stretch'>
      <Box>
        <Text
          fontWeight='medium'
          translation='plugins.walletConnectToDapps.modal.signMessage.signingFrom'
          mb={4}
        />
        <AddressSummaryCard
          address={walletConnect.legacyBridge?.connector.accounts[0]}
          name='My Wallet' // TODO: what string do we put here?
          icon={<KeepKeyIcon color='gray.500' w='full' h='full' />}
        />
      </Box>

      <Box>
        <Text
          fontWeight='medium'
          translation='plugins.walletConnectToDapps.modal.signMessage.requestFrom'
          mb={4}
        />
        <Card bg={cardBg} borderRadius='md'>
          <HStack align='center' pl={4}>
            <Image borderRadius='full' boxSize='24px' src={walletConnect.dapp.icons[0]} />
            <RawText fontWeight='semibold' flex={1}>
              {walletConnect.dapp.name}
            </RawText>
            <Link href={walletConnect.dapp.url.replace(/^https?:\/\//, '')} isExternal>
              <IconButton
                icon={<ExternalLinkIcon />}
                variant='ghost'
                aria-label={walletConnect.dapp.name}
                colorScheme='gray'
              />
            </Link>
          </HStack>
          <Divider />
          <Box p={4}>
            <Text
              translation='plugins.walletConnectToDapps.modal.signMessage.message'
              fontWeight='medium'
              mb={1}
            />
            <RawText fontWeight='medium' color='gray.500'>
              {message}
            </RawText>
          </Box>
        </Card>
      </Box>

      <Text
        fontWeight='medium'
        color='gray.500'
        translation='plugins.walletConnectToDapps.modal.signMessage.description'
      />

      <VStack spacing={4}>
        <Button
          isLoading={loading}
          size='lg'
          width='full'
          colorScheme='blue'
          type='submit'
          onClick={onConfirm}
        >
          {translate('plugins.walletConnectToDapps.modal.signMessage.confirm')}
        </Button>
        <Button size='lg' width='full' onClick={onReject}>
          {translate('plugins.walletConnectToDapps.modal.signMessage.reject')}
        </Button>
      </VStack>
    </VStack>
  )
}
