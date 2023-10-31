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
      from?: types.eth.Address | string
      addressNList?: any
      to: string
      data: types.eth.HexData | string
      gas?: types.eth.HexQuantity | string
      value: types.eth.HexQuantity | string
      nonce: types.eth.HexQuantity | string
      chainId: string | number
      maxFeePerGas?: types.eth.HexQuantity | string
      maxPriorityFeePerGas?: types.eth.HexQuantity | string
      gasPrice?: types.eth.HexQuantity | string
    },
  ): Promise<{
    v: types.numeric.U32
    r: types.eth.HexData
    s: types.eth.HexData
    serialized: types.eth.HexData
  }> {
    console.log('Body: ', body)
    if (body.chainId === 0 || body.chainId === '0') body.chainId = '1'

    let addressFrom
    if (body?.addressNList) {
      addressFrom = await this.context.wallet.ethGetAddress({
        addressNList: body?.addressNList,
        showDisplay: false,
      })
    } else if (body?.from) {
      for (let i = 0; i < 5; i++) {
        const accountPath = this.context.wallet.ethGetAccountPaths({
          coin: 'Ethereum',
          accountIdx: i,
        })
        console.log('accountPath: ', accountPath)
        console.log('accountPath[0].addressNList: ', accountPath[0].addressNList)
        let address = await this.context.wallet.ethGetAddress({
          addressNList: accountPath[0].addressNList,
          showDisplay: false,
        })
        if (address === body?.from) {
          addressFrom = accountPath[0].addressNList
          body.addressNList = accountPath[0].addressNList
          break
        }
      }
    }

    console.log('addressFrom: ', addressFrom)
    if (!body.to) body.to = '0x'

    let chainId: number
    if (typeof body.chainId === 'string') {
      chainId = body.chainId.startsWith('0x')
        ? parseInt(body.chainId.slice(2), 16)
        : parseInt(body.chainId)
    } else {
      chainId = body.chainId
    }

    let gasPrice =
      '0x' +
      (
        parseInt(body.maxFeePerGas ?? '0x0', 16) + parseInt(body.maxPriorityFeePerGas ?? '0x0', 16)
      ).toString(16)

    let msg = {
      addressNList: body.addressNList,
      from: addressFrom,
      chainId,
      nonce: body.nonce,
      value: body.value || '0x0',
      data: body.data || '',
      gasLimit: body.gas || '0x0',
      to: body.to,
      gasPrice: body.gasPrice || gasPrice,
      maxFeePerGas: body.maxFeePerGas,
      maxPriorityFeePerGas: body.maxPriorityFeePerGas,
    }
    console.log('MSG: 0 ', msg)
    try {
      let api = await this.context.api.init()
      //get insight
      let insight = await api.SmartInsight(msg)
      insight = insight.data
      console.log('insight: ', insight)
      console.log('insight.recommended: ', insight.recommended)
      //Nerving insight (Move to pre-send)
      // if (insight.recommended.maxFeePerGas) {
      //   msg.maxFeePerGas = insight.recommended.maxFeePerGas
      // }
      // if (insight.recommended.gasPrice) {
      //   msg.gasPrice = insight.recommended.gasPrice
      // }
      // if (insight.recommended.gasLimit) {
      //   msg.gasLimit = insight.recommended.gasLimit
      // }
      // if (insight.recommended.maxPriorityFeePerGas) {
      //   msg.maxPriorityFeePerGas = insight.recommended.maxPriorityFeePerGas
      // }
    } catch (e) {
      console.error('unable to get tx insight', e)
    }
    console.log('MSG: 1 ', msg)
    if (chainId !== 1) {
      if (msg.maxPriorityFeePerGas) {
        delete msg.maxPriorityFeePerGas
      }
      if (msg.maxFeePerGas) {
        delete msg.maxFeePerGas
      }
      if (!msg.gasPrice) {
        msg.gasPrice = gasPrice
      }
    }
    console.log('MSG: (final) ', msg)
    //@ts-ignore
    let result = await this.context.wallet.ethSignTx(msg)
    console.log('ethSignTx final result: ', result)

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
    console.log(body)
    // const account = await this.context.getAccount(body.address)
    // console.log(
    //   'payload: ',
    //   JSON.stringify({
    //     addressNList: account.addressNList,
    //     typedData: body.typedData,
    //   }),
    // )

    //signt text
    let typedData:any = {
      "types": {
        "EIP712Domain": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "version",
            "type": "string"
          },
          {
            "name": "chainId",
            "type": "uint256"
          },
          {
            "name": "verifyingContract",
            "type": "address"
          }
        ],
        "OrderComponents": [
          {
            "name": "offerer",
            "type": "address"
          },
          {
            "name": "zone",
            "type": "address"
          },
          {
            "name": "offer",
            "type": "OfferItem[]"
          },
          {
            "name": "consideration",
            "type": "ConsiderationItem[]"
          },
          {
            "name": "orderType",
            "type": "uint8"
          },
          {
            "name": "startTime",
            "type": "uint256"
          },
          {
            "name": "endTime",
            "type": "uint256"
          },
          {
            "name": "zoneHash",
            "type": "bytes32"
          },
          {
            "name": "salt",
            "type": "uint256"
          },
          {
            "name": "conduitKey",
            "type": "bytes32"
          },
          {
            "name": "counter",
            "type": "uint256"
          }
        ],
        "OfferItem": [
          {
            "name": "itemType",
            "type": "uint8"
          },
          {
            "name": "token",
            "type": "address"
          },
          {
            "name": "identifierOrCriteria",
            "type": "uint256"
          },
          {
            "name": "startAmount",
            "type": "uint256"
          },
          {
            "name": "endAmount",
            "type": "uint256"
          }
        ],
        "ConsiderationItem": [
          {
            "name": "itemType",
            "type": "uint8"
          },
          {
            "name": "token",
            "type": "address"
          },
          {
            "name": "identifierOrCriteria",
            "type": "uint256"
          },
          {
            "name": "startAmount",
            "type": "uint256"
          },
          {
            "name": "endAmount",
            "type": "uint256"
          },
          {
            "name": "recipient",
            "type": "address"
          }
        ]
      },
      "primaryType": "OrderComponents",
      "domain": {
        "name": "Seaport",
        "version": "1.5",
        "chainId": 137,
        "verifyingContract": "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC"
      },
      "message": {
        "offerer": "0x8c9Ed98b7C3961D22Cc871356C7b73d194608817",
        "offer": [
          {
            "itemType": "2",
            "token": "0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f",
            "identifierOrCriteria": "64560424590441301826453812164224751707642265079650986418901366599236941237984",
            "startAmount": "1",
            "endAmount": "1"
          }
        ],
        "consideration": [
          {
            "itemType": "1",
            "token": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
            "identifierOrCriteria": "0",
            "startAmount": "194707500000000000",
            "endAmount": "194707500000000000",
            "recipient": "0x8c9Ed98b7C3961D22Cc871356C7b73d194608817"
          },
          {
            "itemType": "1",
            "token": "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
            "identifierOrCriteria": "0",
            "startAmount": "4992500000000000",
            "endAmount": "4992500000000000",
            "recipient": "0x0000a26b00c1F0DF003000390027140000fAa719"
          }
        ],
        "startTime": "1696393777",
        "endTime": "1699072168",
        "orderType": 0,
        "zone": "0x0000000000000000000000000000000000000000",
        "zoneHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "salt": "24446860302761739304752683030156737591518664810215442929815805592127532436551",
        "conduitKey": "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
        "totalOriginalConsiderationItems": "2",
        "counter": "0"
      }
    }
    console.log("this.context.wallet: ",this.context.wallet)
    return (
      await this.context.wallet.ethSignTypedData({
        addressNList:[
          2147483692,
          2147483708,
          2147483648,
          0,
          0
        ],
        typedData,
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
        message: Buffer.from(body.message.replace(/^0x/, ''), 'hex').toString(),
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
