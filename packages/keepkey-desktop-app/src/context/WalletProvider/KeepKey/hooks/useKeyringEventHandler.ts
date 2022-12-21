import type { Keyring } from '@shapeshiftoss/hdwallet-core'
import { logger } from 'lib/logger'
import isArray from 'lodash/isArray'
import join from 'lodash/join'
import { useEffect } from 'react'

interface KeyringState {
  keyring: Keyring
}

const moduleLogger = logger.child({ namespace: ['useKeyringEventHandler'] })
export const useKeyringEventHandler = (
  state: KeyringState /*, dispatch: Dispatch<ActionTypes>*/,
) => {
  const { keyring } = state

  useEffect(() => {
    const handleEvent = (event: string | string[], ...values: any[]) => {
      /*
       Log out all events, so we can use the logs for reference for handling other Keyring events
       */
      moduleLogger.trace(
        { event, values },
        `HDWallet Event Handler: ${isArray(event) ? join(event, ', ') : event}`,
      )
    }

    // Handle all KeepKey events
    keyring.onAny(handleEvent)

    return () => {
      keyring.offAny(handleEvent)
    }
  }, [keyring])
}
