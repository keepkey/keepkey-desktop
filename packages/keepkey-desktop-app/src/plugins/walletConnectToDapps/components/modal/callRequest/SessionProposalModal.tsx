import { ModalContent } from '@chakra-ui/modal'
import {
  Box,
  Button,
  Divider,
  HStack,
  Image,
  Link,
  Modal,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react'
import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import type { ProposalTypes, SessionTypes, SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { Card } from 'components/Card/Card'
import { WalletConnectIcon } from 'components/Icons/WalletConnectIcon'
import { RawText, Text } from 'components/Text'
import { useWallet } from 'hooks/useWallet/useWallet'
import { WalletConnectSignClient } from 'kkdesktop/walletconnect/utils'
import { formatChainName } from 'plugins/walletConnectToDapps/utils/utils'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useState } from 'react'

export const SessionProposalModal = () => {
  const { proposals, removeProposal, setPairingMeta, setCurrentSessionTopic } = useWalletConnect()

  const currentProposal = proposals[0] as SignClientTypes.EventArguments['session_proposal']

  const { id, params } = currentProposal
  const { proposer, requiredNamespaces, relays } = params

  const {
    state: { wallet },
  } = useWallet()

  const [loading, setLoading] = useState(false)

  const onApprove = async () => {
    console.log("proposer: ",proposer)
    setLoading(true)
    if (currentProposal) {
      const namespaces: SessionTypes.Namespaces = {}
      let w = wallet as KeepKeyHDWallet

      await Promise.all(
        Object.keys(requiredNamespaces).map(async key => {
          const accounts: string[] = (
            await Promise.all(
              requiredNamespaces[key].chains.map(async chain => {
                console.log(chain)
                let address

                if (key === 'eip155') {
                  const accountPath = w.ethGetAccountPaths({ coin: 'Ethereum', accountIdx: 0 })
                  address = await w.ethGetAddress({
                    addressNList: accountPath[0].addressNList,
                    showDisplay: false,
                  })
                } else if (key === 'cosmos') {
                  const accountPath = w.cosmosGetAccountPaths({ accountIdx: 0 })
                  address = await w.cosmosGetAddress({
                    addressNList: accountPath[0].addressNList,
                    showDisplay: false,
                  })
                }

                if (!address) return `${chain}:DOES_NOT_SUPPORT`

                return `${chain}:${address}`
              }),
            )
          ).filter(s => s !== '')
          namespaces[key] = {
            accounts,
            methods: requiredNamespaces[key].methods,
            events: requiredNamespaces[key].events,
          }
        }),
      )

      const approveData = {
        id,
        relayProtocol: relays[0].protocol,
        namespaces,
      }

      const { acknowledged } = await WalletConnectSignClient.approve(approveData)
      const {
        peer: { metadata },
        topic,
      } = await acknowledged()
      setPairingMeta(metadata)
      setCurrentSessionTopic(topic)
    }
    removeProposal(id)
  }

  // Hanlde reject action
  const onReject = async () => {
    setLoading(true)
    if (currentProposal) {
      await WalletConnectSignClient.reject({
        id,
        reason: getSdkError('USER_REJECTED_METHODS'),
      })
    }
    removeProposal(id)
  }

  return (
    <Modal
      isOpen={!!currentProposal}
      onClose={() => {
        removeProposal(id)
        WalletConnectSignClient.reject({
          id,
          reason: getSdkError('USER_REJECTED_METHODS'),
        })
      }}
      variant='header-nav'
    >
      <ModalOverlay />
      <ModalContent
        width='full'
        borderRadius={{ base: 0, md: 'xl' }}
        minWidth={{ base: '100%', md: '500px' }}
        maxWidth={{ base: 'full', md: '500px' }}
      >
        <ModalHeader py={2}>
          <HStack alignItems='center' spacing={2}>
            <WalletConnectIcon />
            <Text
              fontSize='md'
              translation='plugins.walletConnectToDapps.modal.sessionProposal.title'
              flex={1}
            />
            {Object.keys(requiredNamespaces).map(chain => (
              <RawText rounded='lg' fontSize='sm' px='2' bgColor='purple.600'>
                {chain}
              </RawText>
            ))}

            <ModalCloseButton position='static' />
          </HStack>
        </ModalHeader>
        <Stack spacing={4} mb={4} p={4}>
          <Box display='flex' flexDirection='row' justifyContent='center' alignItems='center'>
            <Image src={'wc:83661bcd37dd021f618558af06c80439f1eab2675f3fd26609ef16900a44ebef@2?relay-protocol=irn&symKey=afb64d04c127b73210a26c0125921848806e514b37cb3db22a049e2278b109d9'} borderRadius='full' height='10' width='10' />
            <Box display='flex' flexDirection='column'>
              <Link href={proposer.metadata.url} pl='2'>
                {proposer.metadata.name}
              </Link>
              <RawText pl={2} color='gray.500' fontSize='sm'>
                {proposer.metadata.description}
              </RawText>
            </Box>
          </Box>
          <Divider />
          {Object.keys(requiredNamespaces).map(chain => {
            return (
              <Stack>
                <RawText mb={5}>{`Review ${chain} permissions`}</RawText>
                {requiredNamespaces[chain].chains.map(chainId => {
                  const extensionMethods: ProposalTypes.RequiredNamespace['methods'] = []
                  const extensionEvents: ProposalTypes.RequiredNamespace['events'] = []

                  requiredNamespaces[chain].extension?.forEach(({ chains, methods, events }) => {
                    if (chains.includes(chainId)) {
                      extensionMethods.push(...methods)
                      extensionEvents.push(...events)
                    }
                  })

                  const allMethods = [...requiredNamespaces[chain].methods, ...extensionMethods]
                  const allEvents = [...requiredNamespaces[chain].events, ...extensionEvents]
                  return (
                    <Card rounded='lg'>
                      <Card.Header>
                        <Card.Heading>{formatChainName(chainId)}</Card.Heading>
                      </Card.Header>
                      <Card.Body>
                        <Card.Heading>
                          <Text translation='plugins.walletConnectToDapps.modal.sessionProposal.methods' />
                        </Card.Heading>
                        <RawText color='gray.500'>
                          {allMethods.length ? allMethods.join(', ') : '-'}
                        </RawText>
                        <Divider mt={2} mb={2} />
                        <Card.Heading>
                          <Text translation='plugins.walletConnectToDapps.modal.sessionProposal.events' />
                        </Card.Heading>
                        <RawText color='gray.500'>
                          {allEvents.length ? allEvents.join(', ') : '-'}
                        </RawText>
                      </Card.Body>
                    </Card>
                  )
                })}
                {/* <SessionProposalChainCard requiredNamespace={requiredNamespaces[chain]} />
                                {renderAccountSelection(chain)} */}
                <Divider />
              </Stack>
            )
          })}
          <Button width='full' size='lg' colorScheme='blue' onClick={onApprove} isLoading={loading}>
            <Text translation={'plugins.walletConnectToDapps.modal.sessionProposal.approve'} />
          </Button>
          <Button width='full' size='lg' colorScheme='red' onClick={onReject} isLoading={loading}>
            <Text translation={'plugins.walletConnectToDapps.modal.sessionProposal.reject'} />
          </Button>
        </Stack>
      </ModalContent>
    </Modal>
  )
}
