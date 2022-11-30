import { CloseIcon } from '@chakra-ui/icons'
import { MenuGroup } from '@chakra-ui/menu'
import { Box, HStack, MenuDivider, MenuItem, Select, VStack } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import type { FC } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslate } from 'react-polyglot'
import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis'
import { RawText, Text } from 'components/Text'

import { DappAvatar } from './DappAvatar'
import { supportedChains } from 'context/WalletProvider/web3byChainId'

export const DappHeaderMenuSummary: FC = () => {
  const translate = useTranslate()

  const walletConnect = useWalletConnect()

  const initialChainSelection = useMemo(
    () =>
      supportedChains.findIndex(
        chain => chain?.chainId === walletConnect?.bridge?.connector?.chainId,
      ),
    [walletConnect?.bridge?.connector?.chainId],
  )

  const [chainName, setChainName] = useState(supportedChains[initialChainSelection].name)

  const onChainClick = useCallback(
    (event: any) => {
      walletConnect.bridge?.doSwitchChain({ chainId: supportedChains[event.target.value].chainId })
      setChainName(supportedChains[event.target.value].name)
    },
    [walletConnect.bridge],
  )

  if (!walletConnect || !walletConnect.bridge || !walletConnect.dapp) return null

  return (
    <>
      <MenuGroup
        title={translate('plugins.walletConnectToDapps.header.connectedDapp')}
        ml={3}
        color='gray.500'
      >
        <HStack spacing={4} px={3} py={1}>
          <DappAvatar
            name={walletConnect.dapp.name}
            image={walletConnect.dapp.icons[0]}
            connected={walletConnect.bridge.connector.connected}
          />
          <Box fontWeight='medium'>
            <RawText>{walletConnect.dapp.name}</RawText>
            <RawText fontSize='sm' color='gray.500'>
              {walletConnect.dapp.url.replace(/^https?:\/\//, '')}
            </RawText>
          </Box>
        </HStack>
      </MenuGroup>
      <MenuDivider />

      <VStack px={3} py={1} fontWeight='medium' spacing={1} alignItems='stretch'>
        <HStack justifyContent='space-between' spacing={4}>
          <Text translation='plugins.walletConnectToDapps.header.menu.connected' color='gray.500' />
          <RawText>
            {dayjs(walletConnect.bridge.connector.handshakeId / 1000).format(
              'MMM DD, YYYY, HH:mm A',
            )}
          </RawText>
        </HStack>
        <HStack justifyContent='space-between' spacing={4}>
          <Text translation='plugins.walletConnectToDapps.header.menu.address' color='gray.500' />
          {!!walletConnect?.bridge?.connector?.accounts && (
            <MiddleEllipsis
              value={walletConnect?.bridge?.connector?.accounts[0]}
              color='blue.200'
            />
          )}
        </HStack>
        {walletConnect?.bridge?.connector?.connected && (
          <HStack justifyContent='space-between' spacing={4}>
            <Text translation='plugins.walletConnectToDapps.header.menu.network' color='gray.500' />
            <RawText>{chainName}</RawText>
          </HStack>
        )}
      </VStack>
      <MenuDivider />

      <Select defaultValue={initialChainSelection} variant='outline' onChange={onChainClick}>
        {supportedChains.map((chain, index) => (
          <option value={index}>{chain.name}</option>
        ))}
      </Select>
      <MenuDivider />
      <MenuItem
        fontWeight='medium'
        icon={<CloseIcon />}
        onClick={walletConnect?.bridge?.disconnect}
        color='red.500'
      >
        {translate('plugins.walletConnectToDapps.header.menu.disconnect')}
      </MenuItem>
    </>
  )
}
