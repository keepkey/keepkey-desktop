import { Flex, Modal, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/toast'
import { SlideTransition } from 'components/SlideTransition'
import { WalletActions } from 'context/WalletProvider/actions'
import { AnimatePresence } from 'framer-motion'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslate } from 'react-polyglot'
import { Route, Switch, useHistory, useLocation } from 'react-router-dom'

import { SUPPORTED_WALLETS } from './config'

const moduleLogger = logger.child({ namespace: ['WalletViewsSwitch'] })

export const WalletViewsSwitch = () => {
  const history = useHistory()
  const location = useLocation()
  const toast = useToast()
  const translate = useTranslate()
  const {
    state: { wallet, modal, initialRoute, type, disconnectOnCloseModal, showBackButton },
    dispatch,
    disconnect,
  } = useWallet()

  const cancelWalletRequests = useCallback(async () => {
    await wallet?.cancel().catch(e => {
      moduleLogger.error(e)
      toast({
        title: translate('common.error'),
        description: e?.message ?? translate('common.somethingWentWrong'),
        status: 'error',
        isClosable: true,
      })
    })
  }, [toast, translate, wallet])

  const onClose = async () => {
    if (disconnectOnCloseModal) {
      disconnect()
    }
    dispatch({ type: WalletActions.SET_WALLET_MODAL, payload: false })
    await cancelWalletRequests()
  }

  useEffect(() => {
    if (initialRoute) {
      history.push(initialRoute)
    }
  }, [history, initialRoute])

  /**
   * Memoize the routes list to avoid unnecessary re-renders unless the wallet changes
   */
  const walletRoutesList = useMemo(
    () =>
      type
        ? SUPPORTED_WALLETS[type].routes.map(route => {
            const Component = route.component
            return !Component ? null : (
              <Route
                exact
                key={'route'}
                path={route.path}
                render={routeProps => <Component {...routeProps} />}
              />
            )
          })
        : [],
    [type],
  )

  return (
    <>
      <Modal
        isOpen={modal}
        onClose={onClose}
        isCentered
        trapFocus={false}
        closeOnOverlayClick={false}
      >
        <div style={{ '--chakra-zIndices-modal': 9500 }}>
          <ModalOverlay />
          <ModalContent justifyContent='center' px={3} pt={3} pb={6}>
            <Flex justifyContent='space-between' alignItems='center' position='relative'>
              {showBackButton && (
                <ModalCloseButton ml='auto' borderRadius='full' position='static' />
              )}
            </Flex>
            <AnimatePresence exitBeforeEnter initial={false}>
              <SlideTransition key={location.key}>
                <Switch key={location.pathname} location={location}>
                  {walletRoutesList}
                </Switch>
              </SlideTransition>
            </AnimatePresence>
          </ModalContent>
        </div>
      </Modal>
    </>
  )
}
