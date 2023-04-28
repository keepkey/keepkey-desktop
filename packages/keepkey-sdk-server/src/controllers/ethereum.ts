import {
  Body,
  Middlewares,
  OperationId,
  Post,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from '@tsoa/runtime'
import { assume } from 'common-utils'

import { ApiController } from '../auth'
import { extra } from '../middlewares'
import type * as types from '../types'

@Route('/eth')
@Tags('ETH')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class EthereumController extends ApiController {
  /**
   * @summary Sign an Ethereum transaction
   */
  @Post('sign-transaction')
  @OperationId('eth_signTransaction')
  public async signTransaction(
    @Body()
    body: {
      from: types.eth.Address
      to: types.eth.Address
      data: types.eth.HexData
      gas: types.eth.HexQuantity
      value: types.eth.HexQuantity
      nonce: types.eth.HexQuantity
      /** @minValue 1 */
      chainId: number
    } & (
      | /** @title EIP-1559 */ {
          /** Maximum total price, in wei/gas, to pay for the gas needed for this transaction */
          maxFeePerGas: types.eth.HexQuantity & unknown
          /** A premium, in wei/gas, to be paid above the applicable block BASEFEE. This fee goes to miners, incentivizing them to process this transaction quickly. */
          maxPriorityFeePerGas: types.eth.HexQuantity & unknown
          gasPrice?: null
        }
      | /** @title Legacy */ {
          /** Price, in wei/gas, at which to purchase the gas for this transaction. */
          maxFeePerGas?: null
          maxPriorityFeePerGas?: null
          gasPrice: types.eth.HexQuantity & unknown
        }
    ),
  ): Promise<{
    v: types.numeric.U32
    r: types.eth.HexData
    s: types.eth.HexData
    serialized: types.eth.HexData
  }> {
    console.log('Body: ', body)
    assume<{ maxFeePerGas?: string | null }>(body)
    assume<{ gasPrice?: string | null }>(body)

    const account = await this.context.getAccount(body.from)

    //if chainId !== 1, then force legacy fees
    let msg
    if(body.chainId !== 1){
        let gasPrice
        if(!body.gasPrice){
            // @ts-ignore
            const maxFeePerGas = parseInt(body.maxFeePerGas, 16);
            // @ts-ignore
            const maxPriorityFeePerGas = parseInt(body.maxPriorityFeePerGas, 16);
            // @ts-ignore
            gasPrice = (maxFeePerGas + maxPriorityFeePerGas);
            gasPrice = '0x' + gasPrice.toString(16);
            console.log('gasPrice final: ',gasPrice)
        }
        msg = {
            addressNList: account.addressNList,
            chainId: body.chainId,
            nonce: body.nonce,
            value: body.value ?? '0x0',
            data: body.data ?? '',
            ...(typeof body.to === 'string'
                ? {
                    to: body.to,
                }
                : {
                    to: '',
                    toAddressNList: body.to,
                }),
            gasLimit: body.gas,
            gasPrice: body.gasPrice || gasPrice,
        }
    } else {
        msg = {
            addressNList: account.addressNList,
            chainId: body.chainId,
            nonce: body.nonce,
            value: body.value ?? '0x0',
            data: body.data ?? '',
            gasLimit: body.gas,
            ...(typeof body.to === 'string'
                ? {
                    to: body.to,
                }
                : {
                    to: '',
                    toAddressNList: body.to,
                }),
            ...(body.maxFeePerGas ?? undefined !== undefined
                ? {
                    maxFeePerGas: body.maxFeePerGas!,
                    maxPriorityFeePerGas: body.maxPriorityFeePerGas!,
                }
                : {
                    gasPrice: body.gasPrice!,
                }),
        }
    }
    console.log("ethSignTx final MSG: ", msg)
    let result = await this.context.wallet.ethSignTx(msg)
    console.log("ethSignTx final result: ", result)
    return result
  }

  /**
   * @summary Sign EIP-712 typed data
   */
  @Post('sign-typed-data')
  @OperationId('eth_signTypedData')
  public async signTypedData(
    @Body()
    body: {
      address: types.eth.Address
      typedData: any
    },
  ): Promise<types.eth.Signature> {
    const account = await this.context.getAccount(body.address)
    console.log(
      'payload: ',
      JSON.stringify({
        addressNList: account.addressNList,
        typedData: body.typedData,
      }),
    )
    return (
      await this.context.wallet.ethSignTypedData({
        addressNList: account.addressNList,
        typedData: body.typedData,
      })
    ).signature
  }

  /**
   * @summary Sign an Etherum message
   */
  @Post('sign')
  @OperationId('eth_sign')
  public async sign(
    @Body()
    body: {
      message: types.eth.HexData
      address: types.eth.Address
    },
  ): Promise<types.eth.Signature> {
    const account = await this.context.getAccount(body.address)

    return (
      await this.context.wallet.ethSignMessage({
        addressNList: account.addressNList,
        message: Buffer.from(body.message.replace(/^0x/, ''), 'hex'),
      })
    ).signature
  }

  /**
   * @summary Verify an Etherum message
   */
  @Post('verify')
  @OperationId('eth_verify')
  @SuccessResponse(
    200,
    'Signature checked; see response to determine if message was verified successfully',
  )
  public async verify(
    @Body()
    body: {
      message: types.eth.HexData
      address: types.eth.Address
      signature: types.eth.Signature
    },
  ): Promise<boolean> {
    return await this.context.wallet.ethVerifyMessage({
      message: Buffer.from(body.message.replace(/^0x/, ''), 'hex'),
      address: body.address,
      signature: body.signature,
    })
  }
}
