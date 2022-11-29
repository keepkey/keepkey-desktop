import { ClientEndpointsApi, RecoveryEndpointsApi, DeveloperEndpointsApi, DeviceInfoEndpointsApi, KeepKeySignTxEndpointsApi, KeepKeyWalletEndpointsApi, Configuration } from './generated'
import { KeepKeySDKConfig } from './types'

export interface KeepKeySDK {
    config: KeepKeySDKConfig,
    client: ClientEndpointsApi,
    recovery: RecoveryEndpointsApi,
    developer: DeveloperEndpointsApi,
    deviceInfo: DeviceInfoEndpointsApi,
    sign: KeepKeySignTxEndpointsApi,
    wallet: KeepKeyWalletEndpointsApi
}

export const getKeepKeySDK = async (config: KeepKeySDKConfig): Promise<KeepKeySDK> => {
    const baseConfig = new Configuration( {
        apiKey: config.serviceKey
    })

    const sdk: KeepKeySDK = {
        config,
        client: new ClientEndpointsApi(baseConfig),
        recovery: new RecoveryEndpointsApi(baseConfig),
        developer: new DeveloperEndpointsApi(baseConfig),
        deviceInfo: new DeviceInfoEndpointsApi(baseConfig),
        sign: new KeepKeySignTxEndpointsApi(baseConfig),
        wallet: new KeepKeyWalletEndpointsApi(baseConfig)
    }

    const verifyAuthResp = await sdk.client.verifyAuth().catch(async (e) => {
        await sdk.client.pair({ authorization: config.serviceKey, pairBody: { ...config } })
    })

    // @ts-ignore
    if (verifyAuthResp && verifyAuthResp.success) return sdk;

    await sdk.client.pair({ authorization: config.serviceKey, pairBody: { ...config } })

    return sdk;
}