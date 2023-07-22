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
import { WalletConnectWeb3Wallet } from 'kkdesktop/walletconnect/utils'
import { formatChainName } from 'plugins/walletConnectToDapps/utils/utils'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useEffect, useState } from 'react'

export const SessionProposalModal = () => {
  const { proposals, removeProposal, setPairingMeta, setCurrentSessionTopic, setIsConnected } =
    useWalletConnect()

  const currentProposal = proposals[0] as SignClientTypes.EventArguments['session_proposal']

  const { id, params } = currentProposal
  const { proposer, requiredNamespaces, optionalNamespaces } = params

  const {
    state: { wallet },
  } = useWallet()

  useEffect(() => {
    const combinedNamespaces: any = {
      eip155: {
        chains: [],
        methods: [],
        events: [],
        rpcMap: [],
      },
    }

    // const mergeArrays = (arr1: any, arr2: any) => [...new Set([...arr1, ...arr2])]

    // const mergeObjects = (
    //   obj1: { [x: string]: any },
    //   obj2: { [x: string]: any; hasOwnProperty: (arg0: string) => any },
    // ) => {
    //   const mergedObj = { ...obj1 }

    //   for (const key in obj2) {
    //     if (obj2.hasOwnProperty(key)) {
    //       if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
    //         mergedObj[key] = mergeArrays(obj1[key], obj2[key])
    //       } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
    //         mergedObj[key] = mergeObjects(obj1[key], obj2[key])
    //       } else {
    //         mergedObj[key] = obj2[key]
    //       }
    //     }
    //   }

    //   return mergedObj
    // }

    combinedNamespaces.eip155.chains = requiredNamespaces.eip155?.chains?.concat(
      optionalNamespaces.eip155?.chains || [],
    )

    combinedNamespaces.eip155.methods = requiredNamespaces.eip155?.methods.concat(
      //only do required methods for now
      []
      // optionalNamespaces.eip155?.methods || [],
    )

    combinedNamespaces.eip155.events = requiredNamespaces.eip155?.events.concat(
      optionalNamespaces.eip155?.events || [],
    )

    combinedNamespaces.eip155.rpcMap = {
      // @ts-ignore
      ...requiredNamespaces.eip155?.rpcMap,
      // @ts-ignore
      ...optionalNamespaces.eip155?.rpcMap,
    }

    setSessionNamespaces(combinedNamespaces)
  }, [params, currentProposal, requiredNamespaces, optionalNamespaces])

  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sessionNamespaces, setSessionNamespaces] = useState(requiredNamespaces)

  const onApprove = async () => {
    console.log('proposer: ', proposer)
    console.log('params: ', params)
    setLoading(true)
    if (currentProposal) {
      const namespaces: SessionTypes.Namespaces = {}
      let w = wallet as KeepKeyHDWallet

      console.log('approving ', 1)
      await Promise.all(
        Object.keys(sessionNamespaces).map(async key => {
          const accounts: string[] = (
            await Promise.all(
              // @ts-ignore
              sessionNamespaces[key].chains.map(async (chain: any) => {
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
                } else {
                  const accountPath = w.ethGetAccountPaths({ coin: 'Ethereum', accountIdx: 0 })
                  address = await w.ethGetAddress({
                    addressNList: accountPath[0].addressNList,
                    showDisplay: false,
                  })
                }

                if (!address) return `${chain}:DOES_NOT_SUPPORT`

                return `${chain}:${address}`
              }),
            )
          ).filter((s: string) => s !== '')
          console.log('approving ', 2)
          namespaces[key] = {
            accounts,
            // @ts-ignore
            methods: sessionNamespaces[key].methods,
            // @ts-ignore
            events: sessionNamespaces[key].events,
          }
        }),
      )

      console.log('approving ', 3)

      const approveData = {
        id,
        namespaces,
      }

      console.log('approving ', 4, approveData)

      const {
        peer: { metadata },
        topic,
      } = await WalletConnectWeb3Wallet.approveSession(approveData)
      console.log('approving ', 6, metadata, topic)
      setPairingMeta(metadata)
      console.log('approving ', 7)
      setCurrentSessionTopic(topic)
      setIsConnected(true)
      console.log('approving ', 8)
    }
    removeProposal(id)
  }

  // Hanlde reject action
  const onReject = async () => {
    setLoading(true)
    if (currentProposal) {
      await WalletConnectWeb3Wallet.rejectSession({
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
        WalletConnectWeb3Wallet.rejectSession({
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
            <Image
              src={
                'data:image/jpeg;base64,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'
              }
              borderRadius='full'
              height='10'
              width='10'
            />
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
          {Object.keys(sessionNamespaces).map(chain => {
            return (
              <Stack>
                <RawText mb={5}>{`Review ${chain} permissions`}</RawText>

                {
                  // @ts-ignore
                  sessionNamespaces[chain].chains.map((chainId: string) => {
                    const extensionMethods: ProposalTypes.RequiredNamespace['methods'] = []
                    const extensionEvents: ProposalTypes.RequiredNamespace['events'] = []

                    // @ts-ignore
                    sessionNamespaces[chain].extension?.forEach(({ chains, methods, events }) => {
                      if (chains.includes(chainId)) {
                        extensionMethods.push(...methods)
                        extensionEvents.push(...events)
                      }
                    })

                    // @ts-ignore
                    const allMethods = [...sessionNamespaces[chain].methods, ...extensionMethods]
                    // @ts-ignore
                    const allEvents = [...sessionNamespaces[chain].events, ...extensionEvents]
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
                  })
                }
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
