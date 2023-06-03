import { CloseIcon } from '@chakra-ui/icons'
import { MenuGroup } from '@chakra-ui/menu'
import { Box, Button, HStack, MenuDivider, MenuItem, VStack } from '@chakra-ui/react'
import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis'
import { RawText, Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import type { FC } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { HiSwitchVertical } from 'react-icons/hi'
import { useTranslate } from 'react-polyglot'

import { DappAvatar } from './DappAvatar'

export const DappHeaderMenuSummary: FC = () => {
  const translate = useTranslate()
  const { chainSelector } = useModal()

  const walletConnect = useWalletConnect()

  const [chainName, setChainName] = useState<string>()

  useEffect(() => {
    console.log(walletConnect.dapp?.icons)
    console.log(walletConnect.dapp?.icons.toString())
    if (!walletConnect.legacyWeb3) return
    if (walletConnect.legacyWeb3.service) setChainName(walletConnect.legacyWeb3.service.name)
  }, [walletConnect.dapp?.icons, walletConnect.legacyWeb3])

  if (!walletConnect || !walletConnect.dapp) return null

  return (
    <>
      <Box p={2}>
        <MenuGroup
          title={translate('plugins.walletConnectToDapps.header.connectedDapp')}
          ml={3}
          color='gray.500'
        >
          <HStack spacing={4} px={3} py={1}>
            <DappAvatar
              name={walletConnect.dapp.name}
              image={
                walletConnect.dapp.icons[0] ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM8U_ylSIt18n6kEAa0oM2_Ta5o02gBtrMNZdpHAYjmJF7hLyH7IpBZ0WoTRPQcK0QQdk&usqp=CAU'
              }
              connected={walletConnect.isConnected}
            />
            <Box fontWeight='medium'>
              <RawText>{walletConnect.dapp.name}</RawText>
              <RawText fontSize='sm' color='gray.500'>
                {walletConnect.dapp.url.replace(/^https?:\/\//, '')}
              </RawText>
            </Box>
            <Box fontWeight='medium'>
              <RawText>{walletConnect.dapp.network}</RawText>
              <RawText fontSize='sm' color='gray.500'>
                {walletConnect.dapp.service}
              </RawText>
            </Box>
          </HStack>
        </MenuGroup>
        <MenuDivider />

        <VStack px={3} py={1} fontWeight='medium' spacing={1} alignItems='stretch'>
          <HStack justifyContent='space-between' spacing={4}>
            <Text
              translation='plugins.walletConnectToDapps.header.menu.connected'
              color='gray.500'
            />
            <RawText>
              {/* {dayjs((walletConnect.legacyBridge?.connector?.handshakeId ?
              walletConnect.legacyBridge?.connector?.handshakeId :
              walletConnect.currentSessionId) / 1000).format(
                'MMM DD, YYYY, HH:mm A',
              )} */}
            </RawText>
          </HStack>
          <HStack justifyContent='space-between' spacing={4}>
            <Text translation='plugins.walletConnectToDapps.header.menu.address' color='gray.500' />
            {!!walletConnect?.legacyBridge?.connector?.accounts && (
              <MiddleEllipsis
                value={walletConnect?.legacyBridge?.connector?.accounts[0]}
                color='blue.200'
              />
            )}
          </HStack>
          {walletConnect?.legacyBridge?.connector?.connected && (
            <HStack justifyContent='space-between' spacing={4}>
              <Text
                translation='plugins.walletConnectToDapps.header.menu.network'
                color='gray.500'
              />
              <RawText>{chainName}</RawText>
            </HStack>
          )}
        </VStack>
        <MenuDivider />
        {walletConnect.isLegacy && (
          <Button leftIcon={<HiSwitchVertical />} onClick={() => chainSelector.open({})}>
            Change Network
          </Button>
        )}
        <MenuDivider />
        <MenuItem
          fontWeight='medium'
          icon={<CloseIcon />}
          onClick={() => {
            walletConnect.onDisconnect()
          }}
          color='red.500'
        >
          Disconnect
        </MenuItem>
      </Box>
    </>
  )
}
