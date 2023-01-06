import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Box, Button, Heading, HStack, Image, Stack, StackDivider } from '@chakra-ui/react'
import { Card } from 'components/Card/Card'
import { Main } from 'components/Layout/Main'
import { RawText, Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import dayjs from 'dayjs'
import { ipcListeners } from 'electron-shim'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'

import type { PairedAppProps, PairingProps } from './types'

const PairingsHeader = () => {
  return (
    <Stack pb={4}>
      <Heading>Pairings</Heading>
    </Stack>
  )
}

export const Pairings = () => {
  const [apps, setApps] = useState<PairedAppProps[]>([])
  const [pairings, setPairings] = useState<PairingProps[]>([])

  const { dispatch } = useWallet()
  const history = useHistory()

  useEffect(() => {
    ipcListeners.bridgePairedApps().then((data: PairedAppProps[]) => {
      setApps(data)
    })
    ipcListeners.appPairings().then((data: PairingProps[]) => {
      setPairings(data)
    })
  }, [])

  const unpair = async (app: PairedAppProps) => {
    if (app.isKeepKeyDesktop) return
    await ipcListeners.bridgeRemoveService(app)
    setApps(await ipcListeners.bridgePairedApps())
  }

  const unpairAll = useCallback(async () => {
    if (!apps) return
    await Promise.all(apps.map(unpair))
  }, [apps])

  return (
    <Main titleComponent={<PairingsHeader />}>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={6}>
        <Card flex={1}>
          <Card.Header>
            <Stack pb={4}>
              <Heading>
                <Text translation={'pairedApps.header'} />
              </Heading>
              <Text translation={'pairedApps.body'} color='gray.500' />
            </Stack>
          </Card.Header>
          <Card.Body>
            <Stack divider={<StackDivider />}>
              {apps &&
                apps.map(app => (
                  <Box
                    display='flex'
                    flexDirection='row'
                    alignItems='center'
                    gap='10px'
                    key={app.serviceKey}
                  >
                    <Image src={app.serviceImageUrl} borderRadius='full' height='10' width='10' />
                    <Box display='flex' flexDirection='row' flexGrow={1} alignItems='center'>
                      <p>{app.serviceName}</p>
                    </Box>
                    <Box>
                      <RawText color='gray.500' fontSize='xs'>
                        {dayjs(app.addedOn).format('DD/MM/YYYY - HH:mm')}
                      </RawText>
                    </Box>
                    <Box>
                      <Button
                        colorScheme='blue'
                        onClick={() => {
                          history.push(`/pairings/${app.serviceKey}`)
                        }}
                      >
                        <Text translation={'pairedApps.cta.openLogs'} />
                      </Button>
                    </Box>
                    <Box>
                      <Button
                        colorScheme='red'
                        onClick={() => {
                          unpair(app)
                        }}
                        disabled={app.isKeepKeyDesktop}
                      >
                        <Text translation={'pairedApps.cta.unpair'} />
                      </Button>
                    </Box>
                  </Box>
                ))}
              {(!apps || apps.length === 0) && <Text translation={'pairedApps.noApps'} />}
            </Stack>
          </Card.Body>
          {apps && apps.length !== 0 && (
            <Card.Footer>
              <HStack my={4} width='full'>
                <Button onClick={unpairAll}>Unpair all apps</Button>
              </HStack>
            </Card.Footer>
          )}
        </Card>
        <Card flex={1}>
          <Card.Header>
            <Stack pb={4}>
              <Heading>
                <Text translation={'pairedApps.history.header'} />
              </Heading>
              <Text translation={'pairedApps.history.body'} color='gray.500' />
            </Stack>
          </Card.Header>
          <Card.Body>
            <Stack divider={<StackDivider />}>
              <Heading fontSize={'xl'}>
                <Text translation={'pairedApps.history.sdk'} />
              </Heading>
              {pairings &&
                pairings
                  .filter(app => app.pairingType === 'sdk')
                  .map(app => (
                    <Box
                      display='flex'
                      flexDirection='row'
                      alignItems='center'
                      gap='10px'
                      key={`sdk_${app.serviceName}_${app.addedOn}`}
                    >
                      <Image src={app.serviceImageUrl} borderRadius='full' height='10' width='10' />
                      <Box display='flex' flexDirection='row' flexGrow={1} alignItems='center'>
                        <p>{app.serviceName}</p>
                      </Box>
                      <Box>
                        <RawText color='gray.500' fontSize='xs'>
                          {dayjs(app.addedOn).format('DD/MM/YYYY - HH:mm')}
                        </RawText>
                      </Box>
                      <Box>
                        {app.pairingType === 'walletconnect' && (
                          <Button
                            colorScheme='blue'
                            leftIcon={<ExternalLinkIcon />}
                            onClick={() => {
                              if (!app.serviceHomePage) return
                              dispatch({
                                type: WalletActions.SET_BROWSER_URL,
                                payload: app.serviceHomePage,
                              })
                              history.push('/browser')
                            }}
                          >
                            <Text translation={'pairedApps.cta.launchDapp'} />
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
              {pairings && pairings.filter(app => app.pairingType === 'sdk').length === 0 && (
                <Text
                  translation={['pairedApps.history.notPairedWith', { name: 'KeepKey SDK' }]}
                  color='gray.500'
                />
              )}
              <Heading fontSize={'xl'}>
                <Text translation={'pairedApps.history.wc'} />
              </Heading>
              {pairings &&
                pairings
                  .filter(app => app.pairingType === 'walletconnect')
                  .map(app => (
                    <Box
                      display='flex'
                      flexDirection='row'
                      alignItems='center'
                      gap='10px'
                      key={`history_${app.serviceName}_${app.addedOn}`}
                    >
                      <Image src={app.serviceImageUrl} borderRadius='full' height='10' width='10' />
                      <Box display='flex' flexDirection='row' flexGrow={1} alignItems='center'>
                        <p>{app.serviceName}</p>
                      </Box>
                      <Box>
                        <RawText color='gray.500' fontSize='xs'>
                          {dayjs(app.addedOn).format('DD/MM/YYYY - HH:mm')}
                        </RawText>
                      </Box>
                      <Box>
                        {app.pairingType === 'walletconnect' && (
                          <Button
                            colorScheme='blue'
                            leftIcon={<ExternalLinkIcon />}
                            onClick={() => {
                              if (!app.serviceHomePage) return
                              dispatch({
                                type: WalletActions.SET_BROWSER_URL,
                                payload: app.serviceHomePage,
                              })
                              history.push('/browser')
                            }}
                          >
                            <Text translation={'pairedApps.cta.launchDapp'} />
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
              {pairings &&
                pairings.filter(app => app.pairingType === 'walletconnect').length === 0 && (
                  <Text
                    translation={['pairedApps.history.notPairedWith', { name: 'Wallet Connect' }]}
                    color='gray.500'
                  />
                )}
            </Stack>
          </Card.Body>
        </Card>
      </Stack>
    </Main>
  )
}
