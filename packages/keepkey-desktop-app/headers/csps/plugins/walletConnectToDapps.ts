import type { Csp } from '../../types'

export const csp: Csp = {
  'connect-src': ['wss://relay.walletconnect.com'],
  'img-src': ['https://registry.walletconnect.com', 'https://explorer-api.walletconnect.com'],
}
