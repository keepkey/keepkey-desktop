import { Body, Post, Security, Route, Response, Middlewares, OperationId, Tags } from 'tsoa'

import type * as types from '../types'

import { ApiController } from '../auth'
import { extra } from '../middlewares'

@Route('/xrp')
@Tags('XRP')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class XrpController extends ApiController {
  /**
   * @summary Sign an XRP transaction
   */
  @Post('sign-transaction')
  @OperationId('xrp_signTransaction')
  public async signTransaction(
    @Body()
    _body: // eslint-disable-line @typescript-eslint/no-unused-vars
    {
      tx_json: types.xrp.Transaction
    },
  ): Promise<types.xrp.Signature> {
    throw new Error('signTransaction not implemented')
  }
}
