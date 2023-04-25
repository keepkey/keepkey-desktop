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

@Route('/osmosis')
@Tags('Osmosis')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class OsmosisController extends ApiController {
    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino')
    @OperationId('osmosis_signAmino')
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
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        //default fee
        if(!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0){
            body.signDoc.fee = {
                amount: [{
                    denom: "uosmo",
                    amount: "800"
                }],
                gas: "290000"
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
        const response = await this.context.wallet.osmosisSignTx(input)
        console.log('osmosis MSG SignDoc: ', JSON.stringify(body))
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
            signed: body.signDoc,
        }
    }

    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-delegate')
    @OperationId('osmo_signAmino_delegate')
    public async signAminoDelegate(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.cosmos.amino.SignDocDelegate
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
        signed: types.cosmos.amino.SignDocDelegate
    }> {
        console.log('osmosis MSG SignDocDelegate: ', JSON.stringify(body))
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.amount) throw new Error('Missing msg amount')
        if (!body.signDoc.msgs[0].value.delegator_address) throw new Error('Missing msg delegator_address')
        if (!body.signDoc.msgs[0].value.validator_address) throw new Error('Missing msg validator_address')
        //default fee
        if(!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0){
            body.signDoc.fee = {
                amount: [{
                    denom: "uosmo",
                    amount: "800"
                }],
                gas: "290000"
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo || '',
            msg: body.signDoc.msgs,
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
        const response = await this.context.wallet.osmosisSignTx(input)
        console.log('osmosis MSG SignDocDelegate: ', JSON.stringify(body))
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
            signed: body.signDoc,
        }
    }

    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-undelegate')
    @OperationId('osmo_signAmino_undelegate')
    public async signAminoUnDelegate(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.cosmos.amino.SignDocUnDelegate
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
        signed: types.cosmos.amino.SignDocUnDelegate
    }> {
        console.log('osmosis MSG SignDocUnDelegate: ', JSON.stringify(body))
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.amount) throw new Error('Missing msg amount')
        if (!body.signDoc.msgs[0].value.delegator_address) throw new Error('Missing msg delegator_address')
        if (!body.signDoc.msgs[0].value.validator_address) throw new Error('Missing msg validator_address')
        //default fee
        if(!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0){
            body.signDoc.fee = {
                amount: [{
                    denom: "uosmo",
                    amount: "800"
                }],
                gas: "290000"
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo || '',
            msg: body.signDoc.msgs,
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
        const response = await this.context.wallet.osmosisSignTx(input)
        console.log('osmosis MSG SignDocUnDelegate: ', JSON.stringify(body))
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
            signed: body.signDoc,
        }
    }

    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-redelegate')
    @OperationId('osmo_signAmino_redelegate')
    public async signAminoBeginReDelegate(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.cosmos.amino.SignDocBeginReDelegate
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
        signed: types.cosmos.amino.SignDocBeginReDelegate
    }> {
        console.log('osmosis MSG SignDocBeginReDelegate: ', JSON.stringify(body))
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.amount) throw new Error('Missing msg amount')
        if (!body.signDoc.msgs[0].value.delegator_address) throw new Error('Missing msg delegator_address')
        if (!body.signDoc.msgs[0].value.validator_src_address) throw new Error('Missing msg validator_src_address')
        if (!body.signDoc.msgs[0].value.validator_dst_address) throw new Error('Missing msg validator_src_address')
        //default fee
        if(!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0){
            body.signDoc.fee = {
                amount: [{
                    denom: "uosmo",
                    amount: "800"
                }],
                gas: "290000"
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo || '',
            msg: body.signDoc.msgs,
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
        const response = await this.context.wallet.osmosisSignTx(input)
        console.log('osmosis MSG SignDocBeginReDelegate: ', JSON.stringify(body))
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
            signed: body.signDoc,
        }
    }

    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-withdraw-delegator-rewards-all')
    @OperationId('osmo_signAmino_withdraw_delegator_rewards_all')
    public async signAminoWithdrawDelegationReward(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.cosmos.amino.SignDocWithdrawDelegationReward
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
        signed: types.cosmos.amino.SignDocWithdrawDelegationReward
    }> {
        console.log('cosmos MSG signAminoWithdrawDelegationReward: ', JSON.stringify(body))
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.delegator_address) throw new Error('Missing msg delegator_address')
        if (!body.signDoc.msgs[0].value.validator_address) throw new Error('Missing msg validator_src_address')
        //default fee
        if(!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0){
            body.signDoc.fee = {
                amount: [{
                    denom: "uosmo",
                    amount: "800"
                }],
                gas: "290000"
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo,
            msg: body.signDoc.msgs,
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
        const response = await this.context.wallet.osmosisSignTx(input)
        console.log("SignDocSwap signAminoWithdrawDelegationReward: ",response)
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
            signed: body.signDoc,
        }
    }

    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-ibc-transfer')
    @OperationId('osmo_signAmino_ibc_transfer')
    public async signAminoMsgTransfer(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.cosmos.amino.SignDocIbcGoTransfer
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
        signed: types.cosmos.amino.SignDocIbcGoTransfer
    }> {
        console.log('osmosis MSG SignDocIbcGoTransfer: ', JSON.stringify(body))
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.source_port) throw new Error('Missing msg source_port')
        if (!body.signDoc.msgs[0].value.source_channel) throw new Error('Missing msg source_channel')
        if (!body.signDoc.msgs[0].value.token) throw new Error('Missing msg token')
        if (!body.signDoc.msgs[0].value.sender) throw new Error('Missing msg sender')
        if (!body.signDoc.msgs[0].value.receiver) throw new Error('Missing msg receiver')
        if (!body.signDoc.msgs[0].value.timeout_height) throw new Error('Missing msg timeout_height')
        //default fee
        if(!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0){
            body.signDoc.fee = {
                amount: [{
                    denom: "uosmo",
                    amount: "800"
                }],
                gas: "290000"
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo || '',
            msg: body.signDoc.msgs,
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
        const response = await this.context.wallet.osmosisSignTx(input)
        console.log("SignDocSwap SignDocIbcGoTransfer: ",response)
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
            signed: body.signDoc,
        }
    }

    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-lp-remove')
    @OperationId('osmo_signAmino_lp_remove')
    public async signAminoMsgLPRemove(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.osmosis.SignDocLPRemove
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
        signed: types.osmosis.SignDocLPRemove
    }> {
        console.log('osmosis MSG SignDocLPRemove: ', JSON.stringify(body))
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.pool_id) throw new Error('Missing msg pool_id')
        if (!body.signDoc.msgs[0].value.share_in_amount) throw new Error('Missing msg share_in_amount')
        if (!body.signDoc.msgs[0].value.token_out_mins) throw new Error('Missing msg token_out_mins')
        //default fee
        if(!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0){
            body.signDoc.fee = {
                amount: [{
                    denom: "uosmo",
                    amount: "800"
                }],
                gas: "290000"
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo || '',
            msg: body.signDoc.msgs,
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
        const response = await this.context.wallet.osmosisSignTx(input)
        console.log("SignDocSwap SignDocLPRemove: ",response)
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
            signed: body.signDoc,
        }
    }

    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-lp-add')
    @OperationId('osmo_signAmino_lp_add')
    public async signAminoMsgLPAdd(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.osmosis.SignDocLPAdd
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
        signed: types.osmosis.SignDocLPAdd
    }> {
        console.log('osmosis MSG signAminoMsgLPAdd: ', JSON.stringify(body))
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.pool_id) throw new Error('Missing msg pool_id')
        if (!body.signDoc.msgs[0].value.sender) throw new Error('Missing msg sender')
        if (!body.signDoc.msgs[0].value.share_out_amount) throw new Error('Missing msg share_out_amount')
        //default fee
        if(!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0){
            body.signDoc.fee = {
                amount: [{
                    denom: "uosmo",
                    amount: "800"
                }],
                gas: "290000"
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo || '',
            msg: body.signDoc.msgs,
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
        const response = await this.context.wallet.osmosisSignTx(input)
        console.log("osmosis SignDocSwap signAminoMsgLPAdd: ",response)
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
            signed: body.signDoc,
        }
    }

    /**
     * @summary Sign a Cosmos SDK transaction using SIGN_MODE_AMINO_JSON
     */
    @Post('sign-amino-swap')
    @OperationId('osmo_signAmino_swap')
    public async signAminoMsgSwap(
        @Body()
            body: {
            signerAddress: types.cosmos.Address
            signDoc: types.osmosis.SignDocSwap
        },
    ): Promise<{
        signature: types.hex.secp256k1.Signature
        serialized: string
        signed: types.osmosis.SignDocSwap
    }> {
        console.log('osmosis MSG SignDocSwap: ', JSON.stringify(body))
        if (!body.signDoc.account_number) throw new Error('Missing account_number')
        if (!body.signDoc.chain_id) throw new Error('Missing chain_id')
        if (!body.signDoc.msgs[0].value.routes) throw new Error('Missing msg routes')
        if (!body.signDoc.msgs[0].value.sender) throw new Error('Missing msg sender')
        if (!body.signDoc.msgs[0].value.token_in) throw new Error('Missing msg token_in')
        //default fee
        if(!body.signDoc.fee || !body.signDoc.fee.amount || body.signDoc.fee.amount.length == 0){
            body.signDoc.fee = {
                amount: [{
                    denom: "uosmo",
                    amount: "800"
                }],
                gas: "290000"
            }
        }
        let tx = {
            account_number: String(body.signDoc.account_number),
            chain_id: body.signDoc.chain_id,
            fee: body.signDoc.fee,
            memo: body.signDoc.memo,
            msg: body.signDoc.msgs,
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
        const response = await this.context.wallet.osmosisSignTx(input)
        console.log("osmosis SignDocSwap SignedTx: ",response)
        return {
            signature: response.signatures[0],
            serialized: response.serialized,
            signed: body.signDoc,
        }
    }
    
}
