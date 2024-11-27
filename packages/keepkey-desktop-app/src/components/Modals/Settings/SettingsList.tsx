import {
  Menu,
  ModalBody,
  ModalCloseButton,
  ModalHeader,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react'
import { WalletConnected } from 'components/Layout/Header/NavBar/UserMenu'
import { SlideTransition } from 'components/SlideTransition'
import { Text } from 'components/Text'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { useCallback, useState } from 'react'
import { useTranslate } from 'react-polyglot'
import type { RouteComponentProps } from 'react-router-dom'

import { AppSettings } from './AppSettings'
import { GeneralSettings } from './GeneralSettings'
import { OllamaSettings } from './OllamaSettings'

export type SettingsListProps = {
  appHistory: RouteComponentProps['history']
} & RouteComponentProps

export const SettingsList = ({ appHistory, ...routeProps }: SettingsListProps) => {
  const translate = useTranslate()
  const { settings } = useModal()
  const [clickCount, setClickCount] = useState<number>(0)

  /**
   * tapping 5 times on the settings header will close this modal and take you to the flags page
   * useful for QA team and unlikely to be triggered by a regular user
   */
  const handleHeaderClick = useCallback(() => {
    if (clickCount === 4) {
      setClickCount(0)
      settings.close()
      appHistory.push('/flags')
    } else {
      setClickCount(clickCount + 1)
    }
  }, [appHistory, clickCount, setClickCount, settings])

  const { state, disconnect } = useWallet()
  const { isConnected, walletInfo, type } = state

  return (
      <SlideTransition>
        <ModalHeader textAlign='center' userSelect='none' onClick={handleHeaderClick}>
          {translate('modals.settings.settings')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody alignItems='center' justifyContent='center' textAlign='center' pt={0} px={0}>
          <Tabs>
            <TabList justifyContent="center">
              <Tab>
                <Text translation='modals.settings.tabs.general' />
              </Tab>
              <Tab>
                <Text translation='modals.settings.tabs.app' />
              </Tab>
              <Tab>
                <Text translation='modals.settings.tabs.keepkey' />
              </Tab>
              <Tab>
                <Text translation='modals.settings.tabs.ollama' />
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <GeneralSettings appHistory={appHistory} {...routeProps} />
              </TabPanel>
              <TabPanel>
                <AppSettings />
              </TabPanel>
              <TabPanel>
                <Menu>
                  <WalletConnected
                      isConnected={isConnected}
                      walletInfo={walletInfo}
                      onDisconnect={disconnect}
                      type={type}
                  />
                </Menu>
              </TabPanel>
              <TabPanel>
                <Menu>
                  <OllamaSettings></OllamaSettings>
                </Menu>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </SlideTransition>
  )
}
