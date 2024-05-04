import type { Csp } from '../../types'

export const csp: Csp = {
  'connect-src': [
    'http://localhost:1646',
    'https://wallet-connect-dapp-ochre.vercel.app',
    'https://wallet-connect-dapp-ochre.vercel.app/*'  // This allows all subpaths
  ]
}
