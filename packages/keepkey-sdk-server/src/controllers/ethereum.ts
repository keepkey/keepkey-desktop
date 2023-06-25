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
          from?: types.eth.Address;
          addressNList?: any;
          to: string;
          data: types.eth.HexData;
          gas?: types.eth.HexQuantity;
          value: types.eth.HexQuantity;
          nonce: types.eth.HexQuantity;
          /** @minValue 1 */
          chainId: number | string;
      } & (
          | /** @title EIP-1559 */ {
          maxFeePerGas: types.eth.HexQuantity;
          maxPriorityFeePerGas: types.eth.HexQuantity;
          gasPrice?: null;
      }
          | /** @title Legacy */ {
          maxFeePerGas?: null;
          maxPriorityFeePerGas?: null;
          gasPrice: types.eth.HexQuantity;
      }
          ),
  ): Promise<{
      v: types.numeric.U32;
      r: types.eth.HexData;
      s: types.eth.HexData;
      serialized: types.eth.HexData;
  }> {
      // Log request body
      console.log('Body: ', body);

      // Ensure chainId is not 0, else set to 1
      if (body.chainId === 0) body.chainId = 1;

      // Fetch account details
      const account = await this.context.getAccount(body.addressNList || body.from);
      console.log("account: ", account);

      const fromAddress = await this.context.wallet.ethGetAddress({
          addressNList: account.addressNList,
          showDisplay: false,
      });
      console.log("fromAddress: ", fromAddress);

      // Validate nonce
      let nonce = await this.context.web3.eth.getTransactionCount(fromAddress);
      console.log("nonce: ", nonce);

      // Fix nonce if it is wrong
      if (nonce.toString() !== body.nonce) {
          body.nonce = "0x" + nonce.toString(16);  // Convert nonce to hexadecimal
          console.log("Fixed nonce: ", body.nonce);
      }

      // Validate fee

      // Validate to address, default to '0x'
      if (!body.to) body.to = '0x';

      // Parse chainId to a number, handling hexadecimal representations
      let chainId = (typeof body.chainId === 'string' && body.chainId.startsWith('0x'))
          ? parseInt(body.chainId.slice(2), 16)
          : parseInt(<string>body.chainId);

      // Prepare the transaction message
      let msg = {
          addressNList: account.addressNList,
          chainId,
          nonce: body.nonce,
          value: body.value ?? '0x0',
          data: body.data ?? '',
          gasLimit: body.gas ?? '0x0',  // default value if gasLimit is undefined
          to: body.to,
          ...(chainId !== 1
              ? {
                  gasPrice: body.gasPrice ?? ('0x' + (parseInt(body.maxFeePerGas, 16) + parseInt(body.maxPriorityFeePerGas, 16)).toString(16))
              }
              : {
                  ...(body.maxFeePerGas ?? undefined !== undefined
                      ? {
                          maxFeePerGas: body.maxFeePerGas,
                          maxPriorityFeePerGas: body.maxPriorityFeePerGas,
                      }
                      : {
                          gasPrice: body.gasPrice,
                      })
              }),
      };

      console.log('ethSignTx final MSG: ', msg);

      let result = await this.context.wallet.ethSignTx(msg as any);  // Ensure msg conforms to ETHSignTx type

      console.log('ethSignTx final result: ', result);
      //broadcast transaction

      return result;
  }
  
    // @Post('sign-transaction-legacy')
    // @OperationId('eth_signTransaction_legacy')
    // public async signTransactionLegacy(
    //     @Body()
    //         body: {
    //         from?: types.eth.Address;
    //         addressNList?: any;
    //         to: string;
    //         data: types.eth.HexData;
    //         gas?: types.eth.HexQuantity;
    //         value: types.eth.HexQuantity;
    //         nonce: types.eth.HexQuantity;
    //         /** @minValue 1 */
    //         chainId: number | string;
    //         /** @title Legacy */
    //         gasPrice: types.eth.HexQuantity & unknown;
    //     },
    // ): Promise<{
    //     v: types.numeric.U32;
    //     r: types.eth.HexData;
    //     s: types.eth.HexData;
    //     serialized: types.eth.HexData;
    // }> {
    //     console.log('Body (Legacy): ', body);
    //     assume<{ gasPrice?: string | null }>(body);
    //     if (body.chainId === 0) body.chainId = 1;
    //     const account = await this.context.getAccount(body.addressNList || body.from);
    //
    //     if (!body.to) body.to = '0x';
    //
    //     let chainId: number;
    //     if (typeof body.chainId === 'string') {
    //         if (body.chainId.startsWith('0x')) {
    //             chainId = parseInt(body.chainId.slice(2), 16);
    //         } else {
    //             chainId = parseInt(body.chainId);
    //         }
    //     } else {
    //         chainId = body.chainId;
    //     }
    //
    //     const msg: any = {
    //         addressNList: account.addressNList,
    //         chainId,
    //         nonce: body.nonce,
    //         value: body.value ?? '0x0',
    //         data: body.data ?? '',
    //         ...(typeof body.to === 'string'
    //             ? { to: body.to }
    //             : { to: '', toAddressNList: body.to }),
    //         gasLimit: body.gas || '0',
    //         gasPrice: body.gasPrice,
    //     };
    //
    //     console.log('ethSignTx final MSG (Legacy): ', msg);
    //     const result = await this.context.wallet.ethSignTx(msg);
    //     console.log('ethSignTx final result (Legacy): ', result);
    //     return result;
    // }
    //
    // @Post('sign-transaction-eip1559')
    // @OperationId('eth_signTransaction_eip1559')
    // public async signTransactionEIP1559(
    //     @Body()
    //         body: {
    //         from?: types.eth.Address;
    //         addressNList?: any;
    //         to: string;
    //         data: types.eth.HexData;
    //         gas?: types.eth.HexQuantity;
    //         value: types.eth.HexQuantity;
    //         nonce: types.eth.HexQuantity;
    //         /** @minValue 1 */
    //         chainId: number | string;
    //         /** @title EIP-1559 */
    //         maxFeePerGas: types.eth.HexQuantity & unknown;
    //         maxPriorityFeePerGas: types.eth.HexQuantity & unknown;
    //     },
    // ): Promise<{
    //     v: types.numeric.U32;
    //     r: types.eth.HexData;
    //     s: types.eth.HexData;
    //     serialized: types.eth.HexData;
    // }> {
    //     console.log('Body (EIP-1559): ', body);
    //     assume<{ maxFeePerGas?: string | null }>(body);
    //     assume<{ maxPriorityFeePerGas?: string | null }>(body);
    //     if (body.chainId === 0) body.chainId = 1;
    //     const account = await this.context.getAccount(body.addressNList || body.from);
    //
    //     if (!body.to) body.to = '0x';
    //
    //     let chainId: number;
    //     if (typeof body.chainId === 'string') {
    //         if (body.chainId.startsWith('0x')) {
    //             chainId = parseInt(body.chainId.slice(2), 16);
    //         } else {
    //             chainId = parseInt(body.chainId);
    //         }
    //     } else {
    //         chainId = body.chainId;
    //     }
    //
    //     const msg: any = {
    //         addressNList: account.addressNList,
    //         chainId,
    //         nonce: body.nonce,
    //         value: body.value ?? '0x0',
    //         data: body.data ?? '',
    //         gasLimit: body.gas || '0',
    //         ...(typeof body.to === 'string'
    //             ? { to: body.to }
    //             : { to: '', toAddressNList: body.to }),
    //         maxFeePerGas: body.maxFeePerGas!,
    //         maxPriorityFeePerGas: body.maxPriorityFeePerGas!,
    //     };
    //
    //     console.log('ethSignTx final MSG (EIP-1559): ', msg);
    //     const result = await this.context.wallet.ethSignTx(msg);
    //     console.log('ethSignTx final result (EIP-1559): ', result);
    //     return result;
    // }
  

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
