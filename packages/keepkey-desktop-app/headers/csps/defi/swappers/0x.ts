import type { Csp } from '../../../types'

export const csp: Csp = {
  'connect-src': [
    // @keepkey/chain-adapters@1.22.1: https://github.com/shapeshift/lib/blob/476550629be9485bfc089decc4df85456968464a/packages/chain-adapters/src/ethereum/EthereumChainAdapter.ts#L226
    'https://gas.api.0x.org',
  ],
}
