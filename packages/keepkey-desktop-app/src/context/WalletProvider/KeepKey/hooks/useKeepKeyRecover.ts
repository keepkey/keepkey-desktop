import type { RecoverDevice } from '@shapeshiftoss/hdwallet-core'
import { parseIntToEntropy } from 'context/WalletProvider/KeepKey/helpers'
import { useWallet } from 'hooks/useWallet/useWallet'

export const useKeepKeyRecover = () => {
  const {
    setDeviceState,
    state: { wallet },
  } = useWallet()

  const recoverKeepKey = async (opts: {
    label: string
    recoverWithPassphrase: boolean
    recoveryEntropy: string
  }) => {
    setDeviceState({ awaitingDeviceInteraction: true })
    const recoverParams: RecoverDevice = {
      entropy: parseIntToEntropy(opts.recoveryEntropy),
      label: opts.label,
      passphrase: opts.recoverWithPassphrase,
      pin: true,
      autoLockDelayMs: 600000, // Ten minutes
    }
    try {
      await wallet!.recover(recoverParams)
    } finally {
      setDeviceState({ awaitingDeviceInteraction: false })
    }
  }

  return recoverKeepKey
}
