export type PairingProps = NativePairingProps | WalletConnectPairingProps

export type NativePairingProps = {
  type: 'native'
  data: {
    serviceName: string
    serviceImageUrl: string
  }
  nonce: string
}

export type WalletConnectPairingProps = {
  type: 'walletconnect'
  data: any
  nonce: string
}
