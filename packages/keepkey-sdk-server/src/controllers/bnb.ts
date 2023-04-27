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
import type * as types from '../types'

@Route('/bnb')
@Tags('BNB')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class BnbController extends ApiController {
  /**
   * @summary Sign a Binance Chain transaction
   */
  @Post('/sign-transaction')
  @OperationId('bnb_signTransaction')
  public async signAmino(
    @Body()
    body: {
      signerAddress: types.bnb.Address
      signDoc: types.bnb.SignDoc
    },
  ): Promise<{
    signature: types.hex.secp256k1.Signature
    serialized: string
    txid: string
    signed: types.bnb.SignDoc
  }> {
    console.log('bnb_signTransaction', JSON.stringify(body))
    const response = await this.context.wallet.binanceSignTx({
      addressNList: (await this.context.getAccount(body.signerAddress)).addressNList,
      tx: {
        msgs: [
          {
            inputs: body.signDoc.msgs[0].inputs,
            outputs: body.signDoc.msgs[0].outputs,
          },
        ],
        memo: body.signDoc.memo,
        chain_id: body.signDoc.chain_id,
        account_number: body.signDoc.account_number,
        sequence: body.signDoc.sequence,
      },
    })
    console.log('bnb_signTransaction response', JSON.stringify(response))
    return {
      signature: response.signatures.signature,
      serialized: response.serialized,
      txid: response.txid,
      signed: body.signDoc,
    }
  }
}
