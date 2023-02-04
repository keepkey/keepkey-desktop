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
import { Buffer } from 'buffer'
import { Card } from 'components/Card/Card'
import { KeepKeyIcon } from 'components/Icons/KeepKeyIcon'
import { RawText, Text } from 'components/Text'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useCallback, useEffect, useState } from 'react'
import { useTranslate } from 'react-polyglot'

import { AddressSummaryCard } from './AddressSummaryCard'

const strip0x = (inputHexString: string) =>
  inputHexString.startsWith('0x') ? inputHexString.slice(2, inputHexString.length) : inputHexString

export const SignMessageConfirmation = () => {
  const translate = useTranslate()
  const cardBg = useColorModeValue('white', 'gray.850')

  const walletConnect = useWalletConnect()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const { legacyBridge, requests, removeRequest, legacyWeb3 } = useWalletConnect()
  const toast = useToast()

  const currentRequest = requests[0]

  useEffect(() => {
    if (!currentRequest) return
    if (currentRequest.payload && currentRequest.payload.params[0])
      setMessage(Buffer.from(strip0x(currentRequest.payload.params[0]), 'hex').toString('utf8'))
    if (currentRequest.params && currentRequest.params[0])
      setMessage(Buffer.from(strip0x(currentRequest.params[0]), 'hex').toString('utf8'))
  }, [currentRequest])

  const onConfirm = useCallback(
    async (txData: any) => {
      if (!legacyWeb3) return
      try {
        setLoading(true)
        await legacyBridge
          ?.approve(requests[0], txData, legacyWeb3)
          .then(() => removeRequest(currentRequest.id))
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
    [legacyBridge, currentRequest.id, removeRequest, requests, toast, legacyWeb3],
  )

  const onReject = useCallback(async () => {
    await legacyBridge?.connector.rejectRequest({
      id: currentRequest.id,
      error: { message: 'Rejected by user' },
    })
    removeRequest(currentRequest.id)
    setLoading(false)
  }, [legacyBridge, currentRequest, removeRequest])

  if (!walletConnect.legacyBridge || !walletConnect.dapp) return null

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
