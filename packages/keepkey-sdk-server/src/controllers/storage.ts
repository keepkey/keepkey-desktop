import {
    Body,
    Middlewares,
    OperationId,
    Post,
    Response,
    Route,
    Security,
    Tags,
} from '@tsoa/runtime';

import { ApiController } from '../auth';
import { extra } from '../middlewares';

interface Pubkey {
    id?: number;
    master?: string;
    address?: string;
    pubkey: string;
    type?: string;
    path?: string;
    pathMaster?: string;
    context?: string;
    contextType?: string;
    networks?: string[];
    networkId?: string;
}

interface Balance {
    id?: number;
    createdAt?: string;
    chain: string;
    identifier: string;
    type: string;
    networkId: string;
    caip: string;
    symbol: string;
    balance: string;
    pubkey?: string;
    context: string;
    contextType: string;
    ticker: string;
    priceUsd: number;
    valueUsd: string;
}

@Route('/storage')
@Tags('storage')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class StorageController extends ApiController {
    /**
     * @summary Retrieve all public keys
     */
    @Post('getPubkeys')
    @OperationId('getPubkeys')
    public async getPubkeys(): Promise<Pubkey[]> {
        try {
            const docs: Pubkey[] = await this.context.db.find({ type: 'pubkey' });
            return docs;
        } catch (error: any) {
            throw new Error(`Failed to retrieve pubkeys: ${error.message}`);
        }
    }

    /**
     * @summary Create or update a public key entry
     * @param pubkey - The public key details to be stored
     */
    @Post('createPubkey')
    @OperationId('createPubkey')
    public async createPubkey(
        @Body() pubkey: Pubkey
    ): Promise<Pubkey> {
        try {
            const newDoc: Pubkey = await this.context.db.update(
                { pubkey: pubkey.pubkey, type: 'pubkey' },
                { $set: { ...pubkey, type: 'pubkey' } },
                { upsert: true, returnUpdatedDocs: true }
            );
            return newDoc;
        } catch (error: any) {
            throw new Error(`Failed to create or update pubkey: ${error.message}`);
        }
    }

    /**
     * @summary Retrieve all balance entries
     */
    @Post('getBalances')
    @OperationId('getBalances')
    public async getBalances(): Promise<Balance[]> {
        try {
            const docs: Balance[] = await this.context.db.find({ type: 'balance' });
            return docs;
        } catch (error: any) {
            throw new Error(`Failed to retrieve balances: ${error.message}`);
        }
    }

    /**
     * @summary Create or update a balance entry
     * @param balance - The balance details to be stored
     */
    @Post('createBalance')
    @OperationId('createBalance')
    public async createBalance(
        @Body() balance: Balance
    ): Promise<Balance> {
        try {
            const newDoc: Balance = await this.context.db.update(
                { caip: balance.caip, context: balance.context, type: 'balance' },
                { $set: { ...balance, type: 'balance' } },
                { upsert: true, returnUpdatedDocs: true }
            );
            return newDoc;
        } catch (error: any) {
            throw new Error(`Failed to create or update balance: ${error.message}`);
        }
    }
}
