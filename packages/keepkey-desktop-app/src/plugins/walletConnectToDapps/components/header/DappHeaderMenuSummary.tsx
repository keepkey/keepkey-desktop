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
    console.log(walletConnect)
    console.log('dapp: ', walletConnect.dapp)
    console.log('icons: ', walletConnect.dapp?.icons)
    console.log('walletconnect: ', walletConnect.dapp?.icons.toString())

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
                'data:image/png;base64,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'
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
