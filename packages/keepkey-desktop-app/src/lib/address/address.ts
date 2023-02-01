import type { ChainId } from '@shapeshiftoss/caip'
import { ethChainId } from '@shapeshiftoss/caip'
import { getChainAdapterManager } from 'context/PluginProvider/chainAdapterSingleton'
import { parse } from 'eth-url-parser'
import { logger } from 'lib/logger'
import type { Identity } from 'types/common'

const moduleLogger = logger.child({ namespace: ['lib', 'address'] })

// @TODO: Implement BIP21
const parseMaybeUrlByChainId: Identity<ParseAddressInputArgs> = ({ chainId, value }) => {
  switch (chainId) {
    case ethChainId:
      try {
        const parsedUrl = parse(value)

        return {
          value: !parsedUrl.parameters ? parsedUrl.target_address : value,
          chainId,
        }
      } catch (error) {
        moduleLogger.trace(error, 'cannot parse eip681 address')
      }
      break
    default:
      return { chainId, value }
  }

  return { chainId, value }
}

// validate a given address
type ValidateAddressArgs = {
  chainId: ChainId
  value: string
}
type ValidateAddressReturn = boolean
export type ValidateAddress = (args: ValidateAddressArgs) => Promise<ValidateAddressReturn>

export const validateAddress: ValidateAddress = async ({ chainId, value }) => {
  try {
    const adapter = getChainAdapterManager().get(chainId)
    if (!adapter) return false
    return (await adapter.validateAddress(value)).valid
  } catch (e) {
    return false
  }
}

/**
 * given a value, which may be invalid input or a valid address
 * and a chainId, return an object containing an address
 * which may be an empty string
 */
type ParseAddressInputArgs = {
  chainId: ChainId
  value: string
}
export type ParseAddressInputReturn = {
  address: string
}
export type ParseAddressInput = (args: ParseAddressInputArgs) => Promise<ParseAddressInputReturn>

export const parseAddressInput: ParseAddressInput = async args => {
  const parsedArgs = parseMaybeUrlByChainId(args)

  const isValidAddress = await validateAddress(parsedArgs)
  return { address: isValidAddress ? parsedArgs.value : '' }
}
