import { Body, Post, Security, Route, Response, Middlewares, OperationId, Tags } from 'tsoa'

import type * as types from '../types'

import { ApiController } from '../auth'
import { extra } from '../middlewares'

@Route('/cosmos')
@Tags('Cosmos')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class CosmosController extends ApiController {
  /**
   * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
   */
  @Post('sign-amino')
  @OperationId('cosmos_signAmino')
  public async signAmino(
    @Body()
    body: {
      signerAddress: types.cosmos.Address
      signDoc: types.cosmos.amino.SignDoc
    },
  ): Promise<{
    signature: types.hex.secp256k1.Signature
    signed: types.cosmos.amino.SignDoc
  }> {
    const response = await this.context.wallet.cosmosSignTx({
      addressNList: (await this.context.getAccount(body.signerAddress)).addressNList,
      tx: {
        msg: body.signDoc.msgs,
        fee: body.signDoc.fee,
        signatures: [],
        memo: body.signDoc.memo,
      },
      chain_id: body.signDoc.chain_id,
      account_number: body.signDoc.account_number,
      sequence: body.signDoc.sequence,
    })

    return {
      signature: response.signatures[0],
      signed: body.signDoc,
    }
  }
}
