import {
    // Body,
    Middlewares,
    OperationId,
    Post,
    Response,
    Route,
    Security,
    Tags,
    // @ts-ignore
} from '@tsoa/runtime';

import { ApiController } from '../auth';
import { extra } from '../middlewares';

interface Pubkey {
    id?: number;
    master?: string;
    address?: string;
    pubkey: string;
    scriptType: string;
    type?: string;
    path?: string;
    icon?: string;
    pathMaster?: string;
    context?: string;
    contextType?: string;
    networks?: string[];
}

@Route('/vault')
@Tags('vault')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class VaultController extends ApiController {

    /**
     * @summary Retrieve all public keys
     */
    @Post('getVaults')
    @OperationId('getVaults')
    public async getVaults(): Promise<Pubkey[]> {
        try {
            
            return [];
        } catch (error: any) {
            throw new Error(`Failed to retrieve pubkeys: ${error.message}`);
        }
    }
}
