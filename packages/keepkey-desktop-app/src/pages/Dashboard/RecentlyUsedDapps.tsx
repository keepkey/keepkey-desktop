import { Box, Grid, Image, Link, Stack } from '@chakra-ui/react'
import { Card } from 'components/Card/Card'
import { RawText, Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import { ipcRenderer } from 'electron-shim'
import { useWallet } from 'hooks/useWallet/useWallet'
import type { PairingProps } from 'pages/Pairings/Pairings'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'

export const RecentlyUsedDapps: FC = () => {
  const [pairings, setPairings] = useState<PairingProps[]>([])
  const { dispatch } = useWallet()
  const history = useHistory()

  useEffect(() => {
    ipcRenderer.send('@app/pairings')
    ipcRenderer.on('@app/pairings', (_event: any, data: PairingProps[]) => {
      setPairings(
        data
          .filter(p => p.pairingType === 'walletconnect')
          .sort((a, b) => b.addedOn - a.addedOn)
          .slice(0, 5),
      )
    })
  }, [])

  const openDapp = (app: PairingProps) => {
    if (!app.serviceHomePage) return
    dispatch({ type: WalletActions.SET_BROWSER_URL, payload: app.serviceHomePage })
    history.push('/browser')
  }

  if (pairings.length === 0) return null
  return (
    <Card>
      <Card.Header>
        <Card.Heading>
          <Text translation='dashboard.portfolio.recentDapps' />
        </Card.Heading>
      </Card.Header>
      <Card.Body>
        <Grid templateColumns='repeat(5, 1fr)' gap={4}>
          {pairings &&
            pairings.map((pairing, idx) => (
              <Link key={idx} onClick={() => openDapp(pairing)}>
                <Box
                  borderRadius='lg'
                  p={2}
                  position='relative'
                  overflow='hidden'
                  opacity={0.99}
                  _hover={{ opacity: 0.8, transition: 'opacity 0.2s ease-in-out' }}
                >
                  <Image
                    src={pairing.serviceImageUrl}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      filter: 'blur(20px)',
                      opacity: 0.3,
                      zIndex: -1,
                    }}
                  />
                  <Stack direction='row' alignItems='center'>
                    <Image borderRadius='full' boxSize='48px' m={2} src={pairing.serviceImageUrl} />
                    <RawText fontWeight='semibold'>{pairing.serviceName}</RawText>
                  </Stack>
                </Box>
              </Link>
            ))}
        </Grid>
      </Card.Body>
    </Card>
  )
}
