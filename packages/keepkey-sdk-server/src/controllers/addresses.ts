import type { BTCInputScriptType } from '@shapeshiftoss/hdwallet-core'
import { Body, Middlewares, OperationId, Post, Response, Route, Security, Tags } from 'tsoa'

import { ApiController } from '../auth'
import { extra } from '../middlewares'
import type * as types from '../types'

@Route('/addresses')
@Tags('Address')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class AddressesController extends ApiController {
  /**
   * Get a Bitcoin/Dogecoin/Dash.... cont. (see coin-support) Chain address, loading it into the current session and optionally displaying it on-device.
   * @summary Get Binance Address
   */
  @Post('/utxo')
  @OperationId('UtxoGetAddress')
  public async utxo(
    @Body()
    body: {
      address_n: types.AddressNList
      coin: string
      script_type?: BTCInputScriptType
      show_display?: boolean
    },
  ): Promise<{ address: any }> {
    const response = await this.context.wallet.btcGetAddress({
      addressNList: body.address_n,
      coin: body.coin,
      scriptType: body.script_type,
      showDisplay: !!body.show_display,
    })
    await this.context.saveAccount(response!, body.address_n)

    return {
      address: response,
    }
  }

  /**
   * Get a Binance Chain address, loading it into the current session and optionally displaying it on-device.
   * @summary Get Binance Address
   */
  @Post('/bnb')
  @OperationId('BinanceGetAddress')
  public async bnb(
    @Body()
    body: {
      address_n: types.AddressNList
      show_display?: boolean
    },
  ): Promise<{ address: types.bnb.Address }> {
    const response = await this.context.wallet.binanceGetAddress({
      addressNList: body.address_n,
      showDisplay: !!body.show_display,
    })
    await this.context.saveAccount(response!, body.address_n)

    return {
      address: response,
    }
  }

  /**
   * Get a Cosmos address, loading it into the current session and optionally displaying it on-device.
   * @summary Get Cosmos Address
   */
  @Post('/cosmos')
  @OperationId('CosmosGetAddress')
  public async cosmos(
    @Body()
    body: {
      address_n: types.AddressNList
      show_display?: boolean
    },
  ): Promise<{ address: types.cosmos.Address }> {
    const response = await this.context.wallet.cosmosGetAddress({
      addressNList: body.address_n,
      showDisplay: !!body.show_display,
    })
    await this.context.saveAccount(response!, body.address_n)

    return {
      address: response,
    }
  }

  /**
   * Get an Ethereum address, loading it into the current session and optionally displaying it on-device.
   * @summary Get Ethereum Address
   */
  @Post('/eth')
  @OperationId('EthereumGetAddress')
  public async eth(
    @Body()
    body: {
      address_n: types.AddressNList
      show_display?: boolean
    },
  ): Promise<{ address: types.eth.Address }> {
    const response = await this.context.wallet.ethGetAddress({
      addressNList: body.address_n,
      showDisplay: !!body.show_display,
    })
    await this.context.saveAccount(response!, body.address_n)

    return {
      address: response,
    }
  }

  /**
   * Get a Tendermint address, loading it into the current session and optionally displaying it on-device.
   * @summary Get Tendermint Address
   */
  @Post('/tendermint')
  @OperationId('TendermintGetAddress')
  public async tendermint(
    @Body()
    body: {
      address_n: types.AddressNList
      show_display?: boolean
    },
  ): Promise<{ address: types.eth.Address }> {
    const response = await this.context.wallet.cosmosGetAddress({
      addressNList: body.address_n,
      showDisplay: !!body.show_display,
    })
    await this.context.saveAccount(response!, body.address_n)

    return {
      address: response,
    }
  }

  /**
   * Get a Thorchain address, loading it into the current session and optionally displaying it on-device.
   * @summary Get Thorchain Address
   */
  @Post('/thorchain')
  @OperationId('ThorchainGetAddress')
  public async thorchain(
    @Body()
    body: {
      address_n: types.AddressNList
      show_display?: boolean
    },
  ): Promise<{ address: types.cosmos.Address }> {
    const response = await this.context.wallet.thorchainGetAddress({
      addressNList: body.address_n,
      showDisplay: !!body.show_display,
    })
    await this.context.saveAccount(response!, body.address_n)

    return {
      address: response!,
    }
  }

  /**
   * Get an XRP address, loading it into the current session and optionally displaying it on-device.
   * @summary Get XRP Address
   */
  @Post('/xrp')
  @OperationId('XrpGetAddress')
  public async xrp(
    @Body()
    body: {
      address_n: types.AddressNList
      show_display?: boolean
    },
  ): Promise<{ address: types.cosmos.Address }> {
    const response = await this.context.wallet.rippleGetAddress({
      addressNList: body.address_n,
      showDisplay: !!body.show_display,
    })
    await this.context.saveAccount(response!, body.address_n)

    return {
      address: response!,
    }
  }
}
