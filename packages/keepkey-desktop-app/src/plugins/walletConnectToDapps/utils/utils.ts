import { SignClientTypes } from "@walletconnect/types"
import { getSdkError } from "@walletconnect/utils"
import { COSMOS_MAINNET_CHAINS, TCosmosChain } from "../data/COSMOSData"
import { EIP155_CHAINS, EIP155_MAINNET_CHAINS, EIP155_SIGNING_METHODS, EIP155_TEST_CHAINS, TEIP155Chain } from "../data/EIP115Data"
import { ELROND_CHAINS, ELROND_MAINNET_CHAINS, ELROND_TEST_CHAINS, TElrondChain } from "../data/ElrondData"
import { NEAR_TEST_CHAINS, TNearChain } from "../data/NEARData"
import { SOLANA_CHAINS, SOLANA_MAINNET_CHAINS, SOLANA_TEST_CHAINS, TSolanaChain } from "../data/SolanaData"
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { utils } from 'ethers'

const CHAIN_METADATA = {
    ...COSMOS_MAINNET_CHAINS,
    ...SOLANA_MAINNET_CHAINS,
    ...ELROND_MAINNET_CHAINS,
    ...EIP155_MAINNET_CHAINS,
    ...EIP155_TEST_CHAINS,
    ...SOLANA_TEST_CHAINS,
    ...NEAR_TEST_CHAINS,
    ...ELROND_TEST_CHAINS
}

export const formatChainName = (chainId: string) => {
    return (
        EIP155_CHAINS[chainId as TEIP155Chain]?.name ??
        COSMOS_MAINNET_CHAINS[chainId as TCosmosChain]?.name ??
        SOLANA_CHAINS[chainId as TSolanaChain]?.name ??
        NEAR_TEST_CHAINS[chainId as TNearChain]?.name ??
        ELROND_CHAINS[chainId as TElrondChain]?.name ??
        chainId
    )
}

export const getChainColor = (chainId: string) => {
    // @ts-ignore
    return CHAIN_METADATA[chainId]?.rgb
}


export function convertHexToUtf8(value: string) {
    if (utils.isHexString(value)) {
        return utils.toUtf8String(value)
    }

    return value
}

export function getSignParamsMessage(params: string[]) {
    const message = params.filter(p => !utils.isAddress(p))[0]

    return convertHexToUtf8(message)
}



export function rejectEIP155Request(request: SignClientTypes.EventArguments['session_request']) {
    const { id } = request

    return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message)
}

export function rejectRequestAsUnsupported(request: SignClientTypes.EventArguments['session_request']) {
    const { id } = request

    return formatJsonRpcError(id, getSdkError('UNSUPPORTED_METHODS').message)
}
