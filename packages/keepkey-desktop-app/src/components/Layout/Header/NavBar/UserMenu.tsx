import { WarningTwoIcon } from '@chakra-ui/icons'
import { Button, ButtonGroup, Flex, HStack, useColorModeValue } from '@chakra-ui/react'
import { WalletConnectedRoutes } from 'components/Layout/Header/NavBar/hooks/useMenuRoutes'
import { WalletImage } from 'components/Layout/Header/NavBar/WalletImage'
import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis'
import { RawText, Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import type { InitialState } from 'context/WalletProvider/WalletProvider'
import { useWallet } from 'hooks/useWallet/useWallet'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { FaWallet } from 'react-icons/fa'
import { MemoryRouter, Route, Switch } from 'react-router-dom'

import { WalletConnectedMenu } from './WalletConnectedMenu'

export const entries = [WalletConnectedRoutes.Connected]

export type WalletConnectedProps = {
  onDisconnect: () => void
} & Pick<InitialState, 'walletInfo' | 'isConnected' | 'type'>

export const WalletConnected = (props: WalletConnectedProps) => {
  return (
    <MemoryRouter initialEntries={entries}>
      <Switch>
        <Route path='/'>
          <WalletConnectedMenu
            isConnected={props.isConnected}
            walletInfo={props.walletInfo}
            onDisconnect={props.onDisconnect}
            type={props.type}
          />
        </Route>
      </Switch>
    </MemoryRouter>
  )
}

type WalletButtonProps = {
  isConnected: boolean
  onConnect: () => void
} & Pick<InitialState, 'walletInfo'>

const WalletButton: FC<WalletButtonProps> = ({ isConnected, walletInfo, onConnect }) => {
  const [walletLabel, setWalletLabel] = useState('')
  const [shouldShorten, setShouldShorten] = useState(true)
  const bgColor = useColorModeValue('gray.300', 'gray.800')

  useEffect(() => {
    ;(async () => {
      setWalletLabel('')
      setShouldShorten(true)
      if (!walletInfo || !walletInfo.meta) return setWalletLabel('')
      // Wallet has a native label, we don't care about ENS name here
      if (!walletInfo?.meta?.address && walletInfo.meta.label) {
        setShouldShorten(false)
        return setWalletLabel(walletInfo.meta.label)
      }

      // No label or ENS name, set regular wallet address as label
      return setWalletLabel(walletInfo?.meta?.address ?? '')
    })()
  }, [walletInfo])

  return Boolean(walletInfo?.deviceId) ? (
    <Button
      width={{ base: '100%', lg: 'auto' }}
      justifyContent='flex-start'
      variant='outline'
      leftIcon={
        <HStack>
          {!isConnected && <WarningTwoIcon ml={2} w={3} h={3} color='yellow.500' />}
          <WalletImage walletInfo={walletInfo} />
        </HStack>
      }
    >
      <Flex>
        {walletLabel ? (
          <MiddleEllipsis
            rounded='lg'
            fontSize='sm'
            p='1'
            pl='2'
            pr='2'
            shouldShorten={shouldShorten}
            bgColor={bgColor}
            value={walletLabel}
          />
        ) : (
          <RawText>{walletInfo?.name}</RawText>
        )}
      </Flex>
    </Button>
  ) : (
    <Button onClick={onConnect} leftIcon={<FaWallet />}>
      <Text translation='common.connectWallet' />
    </Button>
  )
}

export const UserMenu: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { state, dispatch, disconnect } = useWallet()
  const { isConnected, walletInfo, isLocked } = state

  if (isLocked) disconnect()
  const handleConnect = () => {
    onClick && onClick()
    dispatch({ type: WalletActions.SET_WALLET_MODAL, payload: true })
  }
  return (
    <ButtonGroup width='full'>
      <WalletButton onConnect={handleConnect} walletInfo={walletInfo} isConnected={isConnected} />
    </ButtonGroup>
  )
}
