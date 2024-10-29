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

@Route('/storage')
@Tags('storage')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class StorageController extends ApiController {
    /**
     * @summary Load Cached Data
     */
    @Post('foo')
    @OperationId('bar')
    public async getBar(
        @Body()
            body: {}
    ): Promise<any> {
        // @ts-ignore
        console.log("body: ",body)
        console.log(this.context)
        console.log(this.context.db)
        // Placeholder for potential future functionality
        return await this.returnHelloWorld();
    }

    // Helper function for modular code structure
    private async returnHelloWorld(): Promise<string> {
        return "Hello World";
    }
}
