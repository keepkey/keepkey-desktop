import type { RecoverDevice } from '@shapeshiftoss/hdwallet-core'
import { parseIntToEntropy } from 'context/WalletProvider/KeepKey/helpers'
import { useWallet } from 'hooks/useWallet/useWallet'
import { logger } from 'lib/logger'
const moduleLogger = logger.child({ namespace: ['useKeepKeyRecover'] })

export const useKeepKeyRecover = () => {
  const {
    setDeviceState,
    state: {
      deviceState: { recoverWithPassphrase, recoveryEntropy },
      wallet,
    },
  } = useWallet()

  const recoverKeepKey = async (label: string | undefined) => {
    setDeviceState({ awaitingDeviceInteraction: true })
    const recoverParams: RecoverDevice = {
      entropy: parseIntToEntropy(recoveryEntropy),
      label: label ?? '',
      passphrase: recoverWithPassphrase || false,
      pin: true,
      autoLockDelayMs: 600000, // Ten minutes
    }
    await wallet?.recover(recoverParams).catch(e => {
      moduleLogger.error(' Recover Failed! ', e)
    })
  }

  return recoverKeepKey
}
