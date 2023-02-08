import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Menu, MenuButton, MenuList } from '@chakra-ui/menu'
import { Button } from '@chakra-ui/react'
import { WalletConnectIcon } from 'components/Icons/WalletConnectIcon'
import { RawText } from 'components/Text'
import { ipcListeners } from 'electron-shim'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useEffect, useState } from 'react'
import { useTranslate } from 'react-polyglot'

import type { Settings } from '../../../../../../keepkey-desktop/src/helpers/types'
import { ConnectModal } from '../modal/connectModal'
import { DappAvatar } from './DappAvatar'
import { DappHeaderMenuSummary } from './DappHeaderMenuSummary'

export const WalletConnectToDappsHeaderButton = () => {
  const [isOpen, setOpen] = useState(false)
  const translate = useTranslate()
  const walletConnect = useWalletConnect()
  const [scannedQr, setScannedQr] = useState<string>()

  const [{ autoScanQr }, setAppSettings] = useState<Partial<Settings>>({
    autoScanQr: false,
  })

  const scanOrReadQrAndOpen = async () => {
    try {
      const clipboardData = await navigator.clipboard.read()
      const link = await clipboardData[0].getType('text/plain')
      const clipboardUri = await link.text()
      if (clipboardUri.startsWith('wc:')) {
        setScannedQr(clipboardUri)
      }

      if (autoScanQr) {
        const readQr = await ipcListeners.appReadQr().catch(console.error)
        if (readQr) setScannedQr(readQr)
      }
    } catch (error) {
      console.error(error)
    }

    setOpen(true)
  }

  useEffect(() => {
    ipcListeners.appSettings().then(setAppSettings)
  }, [])

  if (!walletConnect || !walletConnect.isConnected || !walletConnect.dapp) {
    return (
      <>
        <Button
          leftIcon={<WalletConnectIcon />}
          rightIcon={<ChevronRightIcon />}
          onClick={scanOrReadQrAndOpen}
        >
          {translate('plugins.walletConnectToDapps.header.connectDapp')}
        </Button>
        <ConnectModal isOpen={isOpen} onClose={() => setOpen(false)} scannedQr={scannedQr} />
      </>
    )
  }

  return (
    <Menu autoSelect={false}>
      <MenuButton
        as={Button}
        leftIcon={
          <DappAvatar
            name={walletConnect.dapp.name}
            image={
              walletConnect.dapp.icons[0] ||
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM8U_ylSIt18n6kEAa0oM2_Ta5o02gBtrMNZdpHAYjmJF7hLyH7IpBZ0WoTRPQcK0QQdk&usqp=CAU'
            }
            connected={walletConnect.isConnected}
            size={6}
            connectedDotSize={2}
            borderWidth={1}
          />
        }
        rightIcon={<ChevronDownIcon />}
        width={{ base: 'full', md: 'auto' }}
        textAlign='left'
      >
        {/* TODO: when setting "flex: unset" or "flex-shrink: none" to the Button content parent, overflow isn't a problem */}
        <RawText fontSize='sm'>{walletConnect.dapp.name}</RawText>
        <RawText fontSize='xs' color='gray.500'>
          {walletConnect.dapp.url.replace(/^https?:\/\//, '')}
        </RawText>
      </MenuButton>
      <MenuList>
        <DappHeaderMenuSummary />
      </MenuList>
    </Menu>
  )
}
