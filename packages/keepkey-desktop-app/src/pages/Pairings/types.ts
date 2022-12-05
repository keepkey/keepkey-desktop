export type PairedAppProps = {
  addedOn: number
  serviceName: string
  serviceImageUrl: string
  serviceKey: string
  isKeepKeyDesktop?: boolean
}

export type PairingProps = {
  addedOn: number
  serviceName: string
  serviceImageUrl: string
  serviceHomePage?: string
  pairingType: 'walletconnect' | 'sdk'
}
