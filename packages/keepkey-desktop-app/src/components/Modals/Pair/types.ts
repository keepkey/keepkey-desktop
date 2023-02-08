export type PairingProps = NativePairingProps | WalletConnectPairingProps

export type NativePairingProps = {
  type: 'native'
  data: {
    imageUrl: string
    name: string
    url?: string
  }
}

export type WalletConnectPairingProps = {
  type: 'walletconnect'
  data: {
    name: string
    params: [{ peerMeta: { name: string; icons: [string] } }]
  }
}
