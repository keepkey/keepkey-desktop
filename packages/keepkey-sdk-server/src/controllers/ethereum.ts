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
// import { assume } from 'common-utils'

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
          from?: types.eth.Address | string;
          addressNList?: any;
          to: string;
          data: types.eth.HexData | string
          gas?: types.eth.HexQuantity | string;
          value: types.eth.HexQuantity | string;
          nonce: types.eth.HexQuantity | string;
          chainId: string | number;
          maxFeePerGas?: types.eth.HexQuantity | string;
          maxPriorityFeePerGas?: types.eth.HexQuantity | string;
          gasPrice?: types.eth.HexQuantity | string;
      }
  ): Promise<{
      v: types.numeric.U32;
      r: types.eth.HexData;
      s: types.eth.HexData;
      serialized: types.eth.HexData;
  }> {
      console.log('Body: ', body);
      if (body.chainId === 0 || body.chainId === '0') body.chainId = '1';

      const account = await this.context.getAccount(body.addressNList || body.from);
      console.log("account: ", account);

      const fromAddress = await this.context.wallet.ethGetAddress({
          addressNList: account.addressNList,
          showDisplay: false,
      });
      console.log("fromAddress: ", fromAddress);
      
      //TODO Network actions
      // let nonce = await this.context.web3.eth.getTransactionCount(fromAddress);
      // console.log("nonce: ", nonce);

      // if (nonce.toString() !== body.nonce) {
      //     body.nonce = "0x" + nonce.toString(16);
      //     console.log("Fixed nonce: ", body.nonce);
      // }

      if (!body.to) body.to = '0x';

      let chainId: number;
      if (typeof body.chainId === 'string') {
          chainId = body.chainId.startsWith('0x') ? parseInt(body.chainId.slice(2), 16) : parseInt(body.chainId);
      } else {
          chainId = body.chainId;
      }

      let gasPrice = '0x' + (parseInt(body.maxFeePerGas ?? '0x0', 16) + parseInt(body.maxPriorityFeePerGas ?? '0x0', 16)).toString(16);

      let msg = {
          addressNList: account.addressNList,
          chainId,
          nonce: body.nonce,
          value: body.value ?? '0x0',
          data: body.data ?? '',
          gasLimit: body.gas ?? '0x0',
          to: body.to,
          gasPrice: body.gasPrice ?? gasPrice,
          maxFeePerGas: body.maxFeePerGas,
          maxPriorityFeePerGas: body.maxPriorityFeePerGas,
      };

      console.log('ethSignTx final MSG: ', msg);

      let result = await this.context.wallet.ethSignTx(msg as any);

      console.log('ethSignTx final result: ', result);

      return result;
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
