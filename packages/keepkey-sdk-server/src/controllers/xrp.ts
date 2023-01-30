import {
  Body,
  Middlewares,
  OperationId,
  Post,
  Response,
  Route,
  Security,
  Tags,
} from '@tsoa/runtime'

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
    body: {
      addressNList: any
      tx: any
      flags: undefined
      sequence: string
      lastLedgerSequence: string
      payment: {
        amount: string
        destination: string
        destinationTag: string
      }
    },
  ): Promise<any> {
    //santize? validate?
    let input: any = body
    return await this.context.wallet.rippleSignTx(input)
  }
}
