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
import { formatJsonRpcResult } from '@json-rpc-tools/utils'
import type { BIP32Path } from '@shapeshiftoss/hdwallet-core'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import type { SignClientTypes } from '@walletconnect/types'
import { Card } from 'components/Card/Card'
import { KeepKeyIcon } from 'components/Icons/KeepKeyIcon'
import { RawText, Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import { WalletConnectSignClient } from 'kkdesktop/walletconnect/utils'
import { getSignParamsMessage, rejectEIP155Request } from 'plugins/walletConnectToDapps/utils/utils'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useCallback, useEffect, useState } from 'react'
import { useTranslate } from 'react-polyglot'

import { AddressSummaryCard } from './AddressSummaryCard'

export const EIP155SignMessageConfirmation = () => {
  const translate = useTranslate()
  const cardBg = useColorModeValue('white', 'gray.850')
  const {
    state: { wallet },
  } = useWallet()
  const walletConnect = useWalletConnect()

  const [loading, setLoading] = useState(false)

  const { requests, removeRequest } = useWalletConnect()
  const toast = useToast()

  const [address, setAddress] = useState<string>()
  const [accountPath, setAccountPath] = useState<BIP32Path>()

  const currentRequest = requests[0] as SignClientTypes.EventArguments['session_request']
  const { topic, params, id } = currentRequest
  const { request } = params
  const message = getSignParamsMessage(request.params)

  useEffect(() => {
    if (!wallet) return
    const accounts = (wallet as KeepKeyHDWallet).ethGetAccountPaths({
      coin: 'Ethereum',
      accountIdx: 0,
    })
    setAccountPath(accounts[0].addressNList)
    ;(wallet as KeepKeyHDWallet)
      .ethGetAddress({ addressNList: accounts[0].addressNList, showDisplay: false })
      .then(setAddress)
  }, [wallet])

  const onConfirm = useCallback(
    async (txData: any) => {
      try {
        if (!accountPath || !wallet) return
        setLoading(true)
        
        // const message = getSignParamsMessage(request.params)
        console.log("request: ",request)
        console.log("request.params: ",request.params)
        console.log("request.params[1]: ",request.params[1])
        let signedMessage
        if(request.method === "eth_signTypedData"){
          signedMessage = await (wallet as KeepKeyHDWallet).ethSignTypedData({
            addressNList: accountPath,
            typedData:JSON.parse(request.params[1]),
          })
        } else if(request.method === "eth_sign" || request.method === "personal_sign"){
          signedMessage = await (wallet as KeepKeyHDWallet).ethSignMessage({
            ...txData,
            addressNList: accountPath,
            message,
          })
        } else {
          signedMessage = await (wallet as KeepKeyHDWallet).ethSignMessage({
            ...txData,
            addressNList: accountPath,
            message,
          })
        }

        const response = formatJsonRpcResult(id, signedMessage.signature)
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
    [accountPath, wallet, request.params, id, topic, removeRequest, currentRequest.id, toast],
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

  if (!currentRequest) return <></>

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
          address={address ?? ''}
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
            <Image
              borderRadius='full'
              boxSize='24px'
              src={
                walletConnect.dapp.icons[0] ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM8U_ylSIt18n6kEAa0oM2_Ta5o02gBtrMNZdpHAYjmJF7hLyH7IpBZ0WoTRPQcK0QQdk&usqp=CAU'
              }
            />
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
