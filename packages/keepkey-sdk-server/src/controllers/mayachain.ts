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

@Route('/mayachain')
@Tags('Mayachain')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class MayachainController extends ApiController {
    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-transfer')
    @OperationId('mayachain_signAmino_transfer')
    public async signAminoTransfer(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.mayachain.SignDocTransfer
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
    }> {
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.amount) throw new Error('Missing coins')
        if (!body.signDoc.msgs[0].value.from_address) throw new Error('Missing from_address')
        if (!body.signDoc.msgs[0].value.to_address) throw new Error('Missing to_address')

        //default fee
        if (!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0) {
            body.signDoc.fee = {
                amount: [
                    {
                        denom: 'rune',
                        amount: '0',
                    },
                ],
                gas: '500000000',
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo || '',
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
        // @ts-ignore
        console.log('thorchain MSG input: ', JSON.stringify(input))
        const response = await this.context.wallet.mayachainSignTx(input)
        // @ts-ignore
        console.log('thorchain MSG SignDoc: ', JSON.stringify(body))
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
        }
    }

    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-desposit')
    @OperationId('mayachain_signAmino_deposit')
    public async signAminoDeposit(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.mayachain.SignDocDeposit
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
    }> {
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.coins) throw new Error('Missing coins')
        if (!body.signDoc.msgs[0].value.memo) throw new Error('Missing memo')
        if (!body.signDoc.msgs[0].value.signer) throw new Error('Missing signer')

        //default fee
        if (!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0) {
            body.signDoc.fee = {
                amount: [
                    {
                        denom: 'cacao',
                        amount: '0',
                    },
                ], 
                gas: '500000000',
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo || '',
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
        // @ts-ignore
        console.log('maychainSignTx MSG input: ', JSON.stringify(input))
        const response = await this.context.wallet.mayachainSignTx(input)
        // @ts-ignore
        console.log('maychain MSG SignDoc: ', JSON.stringify(body))
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
        }
    }
}
