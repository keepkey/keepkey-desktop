import { Modal, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { useModal } from 'hooks/useModal/useModal'
import { MemoryRouter, Route, Switch, useHistory } from 'react-router-dom'

import { SettingsRoutes } from './SettingsCommon'
import { SettingsRouter } from './SettingsRouter'

export const entries = [
  SettingsRoutes.Index,
  SettingsRoutes.Languages,
  SettingsRoutes.FiatCurrencies,
  SettingsRoutes.CurrencyFormat,
]

const Settings = () => {
  /**
   * Since inner routes require app history to be able to navigate
   * to other pages, we need to pass outer-history down to the router
   */
  const appHistory = useHistory()
  const { settings } = useModal()
  const { close, isOpen } = settings

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered>
      <div style={{ '--chakra-zIndices-modal': settings.zIndex }}>
        <ModalOverlay />
        <ModalContent>
          <MemoryRouter initialEntries={entries}>
            <Switch>
              <Route path='/'>
                <SettingsRouter appHistory={appHistory} />
              </Route>
            </Switch>
          </MemoryRouter>
        </ModalContent>
      </div>
    </Modal>
  )
}

export const SettingsModal = Settings
