import { CHAIN_REFERENCE, fromChainId, toAccountId } from '@keepkey/caip'
import type { CosmosSdkChainId } from '@keepkey/chain-adapters'
import { cosmosSdkChainIds } from '@keepkey/chain-adapters'
import { supportsCosmos, supportsOsmosis, supportsThorchain } from '@keepkey/hdwallet-core'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import type { AccountMetadataById } from 'state/slices/portfolioSlice/portfolioSliceCommon'

import type { DeriveAccountIdsAndMetadata } from './account'

export const deriveCosmosSdkAccountIdsAndMetadata: DeriveAccountIdsAndMetadata = async args => {
  const { accountNumber, chainIds, wallet } = args
  const result = await (async () => {
    let acc: AccountMetadataById = {}
    for (const chainId of chainIds) {
      if (!cosmosSdkChainIds.includes(chainId as CosmosSdkChainId))
        throw new Error(`${chainId} does not exist in ${cosmosSdkChainIds}`)
      const { chainReference } = fromChainId(chainId)
      const adapter = getChainAdapterManager().get(chainId)!
      if (chainReference === CHAIN_REFERENCE.CosmosHubMainnet) {
        if (!supportsCosmos(wallet)) continue
      }
      if (chainReference === CHAIN_REFERENCE.OsmosisMainnet) {
        if (!supportsOsmosis(wallet)) continue
      }
      if (chainReference === CHAIN_REFERENCE.ThorchainMainnet) {
        if (!supportsThorchain(wallet)) continue
      }

      const bip44Params = adapter.getBIP44Params({ accountNumber })
      const pubkey = await adapter.getAddress({ bip44Params, wallet })
      if (!pubkey) continue
      const accountId = toAccountId({ chainId, account: pubkey })
      acc[accountId] = { bip44Params }
    }
    return acc
  })()
  return result
}
