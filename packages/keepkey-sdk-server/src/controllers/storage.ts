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

interface Path {
    id?: number;
    note: string;
    script_type?: string;
    available_scripts_types?: string[];
    type: string;
    path: string,
    addressNList?: string;
    addressNListMaster?: string;
    networks: string[];
}

interface Pubkey {
    id?: number;
    master?: string;
    address?: string;
    pubkey: string;
    type?: string;
    path?: string;
    icon?: string;
    pathMaster?: string;
    context?: string;
    contextType?: string;
    networks?: string[];
}

interface Balance{
    id?: number;
    createdAt?: string;
    identifier: string;
    type: string;
    networkId: string;
    caip: string;
    icon: string;
    symbol: string;
    balance: string;
    pubkey: string;
    context: string;
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
                { caip: balance.caip, context: balance.pubkey, type: 'balance' },
                { $set: { ...balance, type: 'balance' } },
                { upsert: true, returnUpdatedDocs: true }
            );
            return newDoc;
        } catch (error: any) {
            throw new Error(`Failed to create or update balance: ${error.message}`);
        }
    }

    /**
     * @summary Retrieve all path entries
     */
    @Post('getPaths')
    @OperationId('getPaths')
    public async getPaths(): Promise<Path[]> {
        try {
            const docs: Path[] = await this.context.db.find({ type: 'path' });
            return docs;
        } catch (error: any) {
            throw new Error(`Failed to retrieve paths: ${error.message}`);
        }
    }

    /**
     * @summary Create or update a path entry
     * @param path - The path details to be stored
     */
    @Post('createPath')
    @OperationId('createPath')
    public async createPath(
        @Body() path: Path
    ): Promise<Path> {
        try {
            const newDoc: Path = await this.context.db.update(
                { note: path.note, type: 'path' },
                { $set: { ...path, type: 'path' } },
                { upsert: true, returnUpdatedDocs: true }
            );
            return newDoc;
        } catch (error: any) {
            throw new Error(`Failed to create or update path: ${error.message}`);
        }
    }

    /**
     * @summary Clear specified collection (e.g., "pubkeys", "balances", "paths")
     * @param collection - The name of the collection to clear as a string
     */
    @Post('clearCollection')
    @OperationId('clearCollection')
    public async clearCollection(
        @Body() body: { collection: string }
    ): Promise<{ success: boolean; message: string }> {
        const TAG = 'clearCollection';
        try {
            //@ts-ignore
            console.log(`${TAG} - Request body:`, body);

            const collection = body?.collection;
            if (!collection) throw new Error('Collection name is required.');

            const allDocs = await this.context.db.find();
            //@ts-ignore
            console.log(`${TAG} - allDocs:`, allDocs.length);
            
            // Find matching documents first
            const matchingDocs = await this.context.db.find({ type: collection });
            //@ts-ignore
            console.log(`${TAG} - Matching documents:`, matchingDocs.length);

            if (matchingDocs.length === 0) {
                throw new Error(`No documents found for type "${collection}".`);
            }

            // Remove matching documents
            const numRemoved = await this.context.db.remove({ type: collection }, { multi: true });
            //@ts-ignore
            console.log(`${TAG} - Removed ${numRemoved} documents from collection: ${collection}`);

            return { success: true, message: `${numRemoved} ${collection} entries cleared successfully.` };
        } catch (error: any) {
            console.error(`${TAG} - Error clearing collection:`, error.message);
            throw new Error(`Failed to clear ${body.collection}: ${error.message}`);
        }
    }
}
