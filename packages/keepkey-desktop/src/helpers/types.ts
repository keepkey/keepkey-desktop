export type Settings = {
  // don't allow user to change these two settings
  shouldAutoStartBridge: boolean
  bridgeApiPort: number

  shouldAutoLaunch: boolean
  shouldMinimizeToTray: boolean
  shouldAutoUpdate: boolean
  allowPreRelease: boolean
  allowBetaFirmware: boolean
  runBetaFirmware: boolean
  autoScanQr: boolean
}

export interface BridgeLog {
  serviceKey: string
  body?: any
  route: string
  method: string
  time: number
}
