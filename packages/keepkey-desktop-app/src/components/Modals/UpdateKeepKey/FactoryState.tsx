import { Button, ModalBody } from '@chakra-ui/react'
import type { ResetDevice } from '@shapeshiftoss/hdwallet-core'
import { deferred } from 'common-utils'
import { AwaitKeepKey } from 'components/Layout/Header/NavBar/KeepKey/AwaitKeepKey'
import { Text } from 'components/Text'
import { WalletActions } from 'context/WalletProvider/actions'
import { useModal } from 'hooks/useModal/useModal'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
import { useCallback, useEffect, useState } from 'react'

import { FailureType, isKKFailureType } from '../../../util'

const moduleLogger = logger.child({ namespace: ['KeepKeyFactoryState'] })

export const KeepKeyFactoryState = () => {
  const [loading, setLoading] = useState(false)
  const {
    state: { wallet },
    dispatch,
    setDeviceState,
  } = useWallet()
  const { updateKeepKey } = useModal()

  useEffect(() => {
    setDeviceState({ disposition: undefined })
  }, [setDeviceState])

  const handleCreateWalletPress = useCallback(async () => {
    setLoading(true)
    setDeviceState({ disposition: 'initializing' })
    const labelDeferred = deferred<string>()
    dispatch({
      type: WalletActions.OPEN_KEEPKEY_LABEL,
      payload: {
        deferred: labelDeferred,
      },
    })
    updateKeepKey.close()

    const label = await labelDeferred

    const resetMessage: ResetDevice = { label, pin: true }

    try {
      setDeviceState({ awaitingDeviceInteraction: true, disposition: 'initializing' })
      try {
        while (true) {
          try {
            await wallet!.reset(resetMessage)
          } catch (e) {
            if (
              isKKFailureType(
                e,
                FailureType.FAILURE_PINMISMATCH,
                FailureType.FAILURE_SYNTAXERROR,
                FailureType.FAILURE_ACTIONCANCELLED,
              )
            )
              continue
            throw e
          }
          break
        }
      } finally {
        setDeviceState({ awaitingDeviceInteraction: false, disposition: 'initializing' })
      }
      dispatch({ type: WalletActions.SET_IS_CONNECTED, payload: true })
    } catch (e: any) {
      setLoading(false)
      moduleLogger.error(e, 'reset failed')
    }
  }, [dispatch, setDeviceState, updateKeepKey, wallet])

  const handleRecoverWalletPress = async () => {
    setLoading(true)
    setDeviceState({ disposition: 'recovering' })
    dispatch({
      type: WalletActions.OPEN_KEEPKEY_RECOVERY_SETTINGS,
    })
    updateKeepKey.close()
  }

  return (
    <>
      <ModalBody pt={5}>
        <Text color='gray.500' translation={'modals.keepKey.factoryState.body'} mb={4} />
        <Button
          width='full'
          size='lg'
          colorScheme='blue'
          onClick={handleCreateWalletPress}
          disabled={loading}
          mb={3}
        >
          <Text translation={'modals.keepKey.factoryState.createButton'} />
        </Button>
        <Button
          width='full'
          size='lg'
          onClick={handleRecoverWalletPress}
          disabled={loading}
          variant='outline'
          border='none'
        >
          <Text translation={'modals.keepKey.factoryState.recoverButton'} />
        </Button>
        <AwaitKeepKey translation='modals.keepKey.recoverySentence.awaitingButtonPress' />
      </ModalBody>
    </>
  )
}
