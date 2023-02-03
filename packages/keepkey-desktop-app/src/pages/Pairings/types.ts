export type PairedAppProps = {
  apiKey: string
  info: {
    name: string
    url?: string
    imageUrl: string
    addedOn: number
    isKeepKeyDesktop: boolean
  }
}

export type PairingProps = {
  addedOn: number
  serviceName: string
  serviceImageUrl: string
  serviceHomePage?: string
  pairingType: 'walletconnect' | 'sdk'
}
