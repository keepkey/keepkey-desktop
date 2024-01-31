import { WebUSBKeepKeyAdapter } from '@keepkey/hdwallet-keepkey-webusb'
import { KeepKeyIcon } from 'components/Icons/KeepKeyIcon'
import type { SupportedWalletInfo } from 'context/WalletProvider/config'

export const KeepKeyConfig: Omit<SupportedWalletInfo, 'routes'> = {
  adapter: WebUSBKeepKeyAdapter,
  icon: KeepKeyIcon,
  name: 'KeepKey',
}
