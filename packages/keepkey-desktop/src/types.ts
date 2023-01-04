// import type { UpdateCheckResult } from 'electron-updater'

import type { PairingProps } from '../../keepkey-desktop-app/src/components/Modals/Pair/types'
import type {
  PairedAppProps,
  PairingProps as PairingProps2,
} from '../../keepkey-desktop-app/src/pages/Pairings/types'
import type { KKStateData } from './helpers/kk-state-controller/types'
import type { BridgeLog, Settings } from './helpers/types'

export type RendererIpc = {
  updateState(data: KKStateData): Promise<void>
  appClosing(): Promise<void>
  modalPair(data: PairingProps): Promise<undefined | string[]>
  modalPin(): Promise<string>
  accountSignTx(data: {
    invocation: {
      unsignedTx: {
        type: string
        network: string
        verbal: string
        transaction: {
          addressFrom: string
          protocol: string
          router: string
          memo: string
          recipient: string
          amount: string
          asset: string
        }
        HDwalletPayload: {
          nonce: string
          gasLimit: string
          gasPrice: string
        }
      }
    }
  }): Promise<{}>
}

export type IpcListeners = {
  appRestart(): Promise<void>
  appExit(): Promise<void>
  appVersion(): Promise<string>
  appUpdateSettings(data: Partial<Settings>): Promise<void>
  appSettings(): Promise<Settings>
  appPairings(): Promise<PairingProps2[]>

  bridgeServiceDetails(
    serviceKey: string,
  ): Promise<undefined | { app: PairedAppProps; logs: BridgeLog[] }>
  bridgeConnected(): Promise<boolean>
  bridgeServiceName(serviceKey: string): Promise<string | undefined>
  bridgePairedApps(): Promise<PairedAppProps[]>
  bridgeAddService(data: {
    serviceKey: string
    serviceName: string
    serviceImageUrl: string
    serviceHomePage?: string
  }): Promise<void>
  bridgeRemoveService(data: PairedAppProps): Promise<void>

  walletconnectPairing(data: {
    serviceName: string
    serviceHomePage: string
    serviceImageUrl: string
  }): Promise<void>

  keepkeyUpdateFirmware(): Promise<{
    bootloader: boolean
    success: boolean
  }>
  keepkeyUpdateBootloader(): Promise<{
    bootloader: boolean
    success: boolean
  }>
  keepkeySkipUpdate(): Promise<void>

  appReadQr(): Promise<string | undefined>

  // appUpdate(): Promise<UpdateCheckResult | { updateInfo: { version: string } } | undefined>
  // appDownloadUpdates(): Promise<void>
  // appInstallUpdates(): Promise<void>
}