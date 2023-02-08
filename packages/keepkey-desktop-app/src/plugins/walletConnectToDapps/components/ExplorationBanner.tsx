import {
  Avatar,
  Box,
  Button,
  Flex,
  Image,
  Skeleton,
  SkeletonText,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import { WalletConnectCurrentColorIcon } from 'components/Icons/WalletConnectIcon'
import { Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import { useWallet } from 'hooks/useWallet/useWallet'
import { getPioneerClient } from 'lib/getPioneerClient'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router'

export const ExplorationBanner: FC = () => {
  const history = useHistory()
  const { dispatch } = useWallet()

  const [spotlight, setSpotlight] = useState({
    name: '',
    homepage: '',
    image: '',
    description: '',
  })
  const [isLoaded, setIsLoaded] = useState(false)

  const getSpotlight = async () => {
    try {
      setIsLoaded(false)
      const pioneer = await getPioneerClient()
      let spotlight = await pioneer.GetSpotlight()
      setSpotlight(spotlight.data)
      setIsLoaded(true)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    getSpotlight()
  }, [])

  const openDapp = (app: any) => {
    dispatch({ type: WalletActions.SET_BROWSER_URL, payload: app.homepage })
    history.push('/browser')
  }

  return (
    <Stack
      direction='row'
      spacing={4}
      borderWidth={1}
      borderColor={useColorModeValue('blackAlpha.50', 'gray.750')}
      borderRadius='lg'
    >
      <Flex flex={1}>
        <Skeleton isLoaded={isLoaded}>
          <Image rounded='lg' objectFit='cover' boxSize='100%' src={spotlight.image} />
        </Skeleton>
      </Flex>
      <SkeletonText isLoaded={isLoaded}>
        <h2>Today's Spotlight!</h2>
      </SkeletonText>
      <Stack flex={2} alignSelf='center' spacing={4} p={8}>
        <Skeleton isLoaded={isLoaded}>
          <Avatar
            bg='gray.700'
            icon={
              <WalletConnectCurrentColorIcon color={useColorModeValue('blue.500', 'blue.400')} />
            }
          />
        </Skeleton>
        <Box>
          <SkeletonText isLoaded={isLoaded}>
            <Text as='b' fontSize='lg' translation={spotlight.name} />
          </SkeletonText>
        </Box>
        <Stack direction='row'>
          <Skeleton isLoaded={isLoaded}>
            <Button colorScheme='blue' size='sm' onClick={() => openDapp(spotlight)}>
              <Text translation='plugins.walletConnectToDapps.registry.getStarted' />
            </Button>
          </Skeleton>
        </Stack>
      </Stack>
    </Stack>
  )
}
