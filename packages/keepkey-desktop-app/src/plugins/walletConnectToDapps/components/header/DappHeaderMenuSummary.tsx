import { CloseIcon } from '@chakra-ui/icons'
import { MenuGroup } from '@chakra-ui/menu'
import { Box, Button, HStack, MenuDivider, MenuItem, VStack } from '@chakra-ui/react'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import type { FC } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { useTranslate } from 'react-polyglot'
import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis'
import { RawText, Text } from 'components/Text'

import { DappAvatar } from './DappAvatar'
import { web3ByChainId } from 'context/WalletProvider/web3byChainId'
import { WalletConnectSignClient } from 'kkdesktop/walletconnect/utils'
import { getSdkError } from '@walletconnect/utils'
import { useModal } from 'hooks/useModal/useModal'
import { HiSwitchVertical } from 'react-icons/hi'

export const DappHeaderMenuSummary: FC = () => {
  const translate = useTranslate()
  const { chainSelector } = useModal()

  const walletConnect = useWalletConnect()

  const [chainName, setChainName] = useState<string>()

  useEffect(() => {
    if (!walletConnect?.legacyBridge?.connector?.chainId) return
    web3ByChainId(walletConnect?.legacyBridge?.connector?.chainId as number).then(chain => {
      if (chain) setChainName(chain.name)
    })
  }, [walletConnect?.legacyBridge?.connector?.chainId])

  if (!walletConnect || !walletConnect.dapp) return null

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
            connected={walletConnect.isConnected}
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
            <Text translation='plugins.walletConnectToDapps.header.menu.network' color='gray.500' />
            <RawText>{chainName}</RawText>
          </HStack>
        )}
      </VStack>
      <MenuDivider />
      {walletConnect.isLegacy && (
        <Button leftIcon={<HiSwitchVertical />} onClick={() => chainSelector.open({})}>
          {chainName}
        </Button>
      )}
      <MenuDivider />
      <MenuItem
        fontWeight='medium'
        icon={<CloseIcon />}
        onClick={() => {
          walletConnect.onDisconnect()
          if (walletConnect.isLegacy) {
            walletConnect?.legacyBridge?.disconnect()
          } else {
            WalletConnectSignClient.disconnect({
              topic: walletConnect.currentSessionTopic ?? '',
              reason: getSdkError('USER_DISCONNECTED'),
            })
          }
        }}
        color='red.500'
      >
        {translate('plugins.walletConnectToDapps.header.menu.disconnect')}
      </MenuItem>
    </>
  )
}
