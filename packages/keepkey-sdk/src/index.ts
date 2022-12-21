import * as apis from './generated/apis'
import { Configuration } from './generated'

export * from './generated'

export class KeepKeySdk {
  readonly address: apis.AddressApi
  readonly bnb: apis.BNBApi
  readonly cosmos: apis.CosmosApi
  readonly eth: apis.ETHApi
  readonly raw: apis.RawApi
  readonly bitcoin: apis.BTCApi
  readonly system: apis.SystemApi & {
    readonly debug: apis.DebugApi
    readonly info: apis.InfoApi
    readonly initialize: apis.InitializeApi
    readonly manufacturing: apis.ManufacturingApi
  }
  readonly xrp: apis.XRPApi

  protected constructor(configuration?: Configuration) {
    this.address = new apis.AddressApi(configuration)
    this.bitcoin = new apis.BTCApi(configuration)
    this.bnb = new apis.BNBApi(configuration)
    this.cosmos = new apis.CosmosApi(configuration)
    this.eth = new apis.ETHApi(configuration)
    this.raw = new apis.RawApi(configuration)
    this.system = Object.freeze(
      Object.assign(Object.create(new apis.SystemApi(configuration), {}), {
        debug: new apis.DebugApi(configuration),
        info: new apis.InfoApi(configuration),
        initialize: new apis.InitializeApi(configuration),
        manufacturing: new apis.ManufacturingApi(configuration),
      }),
    )
    this.xrp = new apis.XRPApi(configuration)
  }

  static async create(config: { basePath?: string; apiKey: string }): Promise<KeepKeySdk> {
    return new KeepKeySdk(
      new Configuration({
        basePath: config?.basePath,
        accessToken: config.apiKey,
      }),
    )
  }
}
