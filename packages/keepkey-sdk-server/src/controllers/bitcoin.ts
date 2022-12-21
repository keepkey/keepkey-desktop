import { Body, Post, Security, Route, Response, Middlewares, OperationId, Tags } from 'tsoa'

import { ApiController } from '../auth'
import { extra } from '../middlewares'

@Route('/bitcoin')
@Tags('BTC')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class BitcoinController extends ApiController {
  /**
   * @summary Sign an Bitcoin transaction
   */
  @Post('sign-transaction')
  @OperationId('btc_signTransaction')
  public async signTransaction(
    @Body()
    body: {
      coin: string
      inputs: any
      outputs: any
      vaultAddress?: string
      opReturnData?: string
    },
  ): Promise<any> {
    let input: any = {
      coin: body.coin,
      inputs: body.inputs,
      outputs: body.outputs,
      version: 1,
      locktime: 0,
    }
    if (body.vaultAddress) input.vaultAddress = body.vaultAddress
    if (body.opReturnData) input.opReturnData = body.opReturnData
    return await this.context.wallet.btcSignTx(input)
  }
}
