// import type { UpdateCheckResult } from 'electron-updater'

import type { PinMatrixRequestTypeMap } from '@keepkey/device-protocol/lib/types_pb'

import type { PairingProps } from '../../keepkey-desktop-app/src/components/Modals/Pair/types'
import type {
  PairedAppProps,
  PairingProps as PairingProps2,
} from '../../keepkey-desktop-app/src/pages/Pairings/types'
import type { KKStateData } from './helpers/kk-state-controller/types'
import type { BridgeLog, Settings } from './helpers/types'

export type PinMatrixRequestType2 = PinMatrixRequestTypeMap[keyof PinMatrixRequestTypeMap]

export type RendererIpc = {
  updateState(data: KKStateData): Promise<void>
  appClosing(): Promise<void>
  modalPair(data: PairingProps): Promise<boolean>
  modalPassphrase(signal: AbortSignal): Promise<string>
  modalPin(pinRequestType: PinMatrixRequestType2): Promise<string>
  modalPassphrase(): Promise<string>
  setAuthenticatorError(error: string | null): Promise<void>
  modalRecovery(characterPos?: number, wordPos?: number): Promise<string | boolean>
  modalCloseAll(): Promise<void>
  updateFeatures(): Promise<void>
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
  bridgeCheckAppPaired(url: string): Promise<boolean>
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

  keepkeyUpdateFirmware(): Promise<void>
  keepkeyUpdateBootloader(): Promise<void>
  keepkeySkipUpdate(): Promise<void>

  appReadQr(): Promise<string>
  appPreRelease(): Promise<boolean>
  appMonitorWebContentsForQr(
    webContentsId: number,
    signal: AbortSignal,
    callback: (data: string) => Promise<void>,
  ): Promise<void>

  webviewAttachOpenHandler(
    webContentsId: number,
    loadUrl: (url: string, options?: Electron.LoadURLOptions) => Promise<void>,
  ): Promise<void>

  clearBrowserSession(): Promise<void>
  wipeKeepKey(): Promise<void>
  forceReconnect(): Promise<void>
  setAlwaysOnTop(value: boolean): Promise<void>
  clearLocalStorage(): Promise<void>

  // appUpdate(): Promise<UpdateCheckResult | { updateInfo: { version: string } } | undefined>
  // appDownloadUpdates(): Promise<void>
  // appInstallUpdates(): Promise<void>
}
