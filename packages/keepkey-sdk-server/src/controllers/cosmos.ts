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
    serialized: string
    signed: types.cosmos.amino.SignDoc
  }> {
    console.log('cosmos MSG signAmino: ', JSON.stringify(body))
    if (!body.signDoc.account_number) throw new Error('Missing account_number')
    if (!body.signDoc.chain_id) throw new Error('Missing chain_id')

    let tx = {
      account_number: String(body.signDoc.account_number),
      chain_id: body.signDoc.chain_id,
      // "account_number": "16359",
      // "chain_id": "cosmoshub-4",
      fee: {
        amount: [
          {
            amount: '900',
            denom: 'uatom',
          },
        ],
        gas: '90000',
      },
      memo: body.signDoc.memo,
      msg: [body.signDoc.msgs[0]],
      signatures: [],
      sequence: body.signDoc.sequence,
    }
    const input: any = {
      tx,
      addressNList: (await this.context.getAccount(body.signerAddress)).addressNList,
      chain_id: tx.chain_id,
      account_number: tx.account_number,
      sequence: tx.sequence,
    }
    console.log('cosmos input: ', JSON.stringify(input))
    const response = await this.context.wallet.cosmosSignTx(input)
    console.log('response: ', JSON.stringify(response))

    // const response = await this.context.wallet.cosmosSignTx({
    //   addressNList: (await this.context.getAccount(body.signerAddress)).addressNList,
    //   tx: {
    //     msg: body.signDoc.msgs,
    //     fee: body.signDoc.fee,
    //     signatures: [],
    //     memo: body.signDoc.memo,
    //   },
    //   chain_id: body.signDoc.chain_id,
    //   account_number: body.signDoc.account_number,
    //   sequence: body.signDoc.sequence,
    // })

    return {
      signature: response.signatures[0],
      serialized: response.serialized,
      signed: body.signDoc,
    }
  }
}
