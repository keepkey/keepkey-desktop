import {
    Body,
    Middlewares,
    OperationId,
    Post,
    Get,
    Request,
    Response,
    Route,
    Security,
    Tags
} from '@tsoa/runtime';

import axios from 'axios';
import { ApiController } from '../auth';
import { extra } from '../middlewares';
import { Request as ExpressRequest } from 'express';

const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';

// interface OllamaRequestBody {
//     model: string;
//     messages: Array<{
//         role: 'system' | 'user' | 'assistant';
//         content: string;
//     }>;
//     tools: Array<{
//         type: 'function';
//         function: any;
//     }>;
//     stream: boolean;
// }

@Route('/ollama')
@Tags('Ollama')
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class OllamaController extends ApiController {
    /**
     * @summary Proxy POST Ollama calls
     */
    @Post('api/*')
    @OperationId('ollama-post-request')
    public async ollamaPost(
        @Request() req: ExpressRequest,
        @Body() body: any
    ): Promise<any> {
        try {
            // Extract the wildcard part from the request URL
            const path = req.originalUrl.replace('/ollama/', '');

            // Construct the target URL
            const targetUrl = `${DEFAULT_OLLAMA_URL}/${path}`;

            // Log the request body
            console.log('body: ', body);

            // Make the request to the Ollama server
            const response = await axios.post(targetUrl, body, {
                headers: {
                    'Content-Type': 'application/json',
                    // Forward any additional headers if necessary
                    // ...req.headers,
                }
            });

            // Return the response from Ollama to the client
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama POST request:', error);
            throw new Error('Error processing Ollama POST request');
        }
    }

    /**
     * @summary Proxy GET Ollama calls
     */
    @Get('api/*')
    @OperationId('ollama-get-request')
    public async ollamaGet(
        @Request() req: ExpressRequest
    ): Promise<any> {
        try {
            // Extract the wildcard part from the request URL
            const path = req.originalUrl.replace('/ollama/', '');

            // Construct the target URL
            const targetUrl = `${DEFAULT_OLLAMA_URL}/${path}`;

            // Make the GET request to the Ollama server
            const response = await axios.get(targetUrl, {
                headers: {
                    // Forward any additional headers if necessary
                    // ...req.headers,
                }
            });

            // Return the response from Ollama to the client
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama GET request:', error);
            throw new Error('Error processing Ollama GET request');
        }
    }
}
