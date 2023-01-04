import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Menu, MenuButton, MenuList } from '@chakra-ui/menu'
import { Button } from '@chakra-ui/react'
import { WalletConnectIcon } from 'components/Icons/WalletConnectIcon'
import { RawText } from 'components/Text'
import { ipcListeners } from 'electron-shim'
import { useWalletConnect } from 'plugins/walletConnectToDapps/WalletConnectBridgeContext'
import { useState } from 'react'
import { useTranslate } from 'react-polyglot'

import { ConnectModal } from '../modal/connectModal'
import { DappAvatar } from './DappAvatar'
import { DappHeaderMenuSummary } from './DappHeaderMenuSummary'

export const WalletConnectToDappsHeaderButton = () => {
  const [isOpen, setOpen] = useState(false)
  const translate = useTranslate()
  const walletConnect = useWalletConnect()
  const [scannedQr, setScannedQr] = useState<string>()

  const scanQrAndOpen = () => {
    ipcListeners
      .appReadQr()
      .then(v => {
        setScannedQr(v)
        setOpen(true)
      })
      .catch(e => {
        console.error(e)
        setOpen(true)
      })
  }

  if (!walletConnect || !walletConnect.isConnected || !walletConnect.dapp) {
    return (
      <>
        <Button
          leftIcon={<WalletConnectIcon />}
          rightIcon={<ChevronRightIcon />}
          onClick={scanQrAndOpen}
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
            image={walletConnect.dapp.icons[0]}
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
