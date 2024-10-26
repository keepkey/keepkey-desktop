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
    Tags,
    Path
} from '@tsoa/runtime';

import axios from 'axios';
import { ApiController } from '../auth';
import { extra } from '../middlewares';
import { Request as ExpressRequest } from 'express';

const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';

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
            const path = req.originalUrl.replace('/ollama/', '');
            const targetUrl = `${DEFAULT_OLLAMA_URL}/${path}`;
            console.log('body: ', body);
            const response = await axios.post(targetUrl, body, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
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
            const path = req.originalUrl.replace('/ollama/', '');
            const targetUrl = `${DEFAULT_OLLAMA_URL}/${path}`;
            const response = await axios.get(targetUrl, {
                headers: {
                    // Forward any additional headers if necessary
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama GET request:', error);
            throw new Error('Error processing Ollama GET request');
        }
    }

    /**
     * @summary Proxy POST /api/pull call
     */
    @Post('api/pull')
    @OperationId('ollama-pull-request')
    public async ollamaPull(
        @Request() req: ExpressRequest,
        @Body() body: any
    ): Promise<any> {
        try {
            const targetUrl = `${DEFAULT_OLLAMA_URL}/api/pull`;
            const response = await axios.post(targetUrl, body, {
                headers: {
                    'Authorization': `Bearer ${req.headers.authorization}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama pull request:', error);
            throw new Error('Error processing Ollama pull request');
        }
    }
    
    /**
     * @summary Proxy POST /api/copy call
     */
    @Post('api/copy')
    @OperationId('ollama-copy-request')
    public async ollamaCopy(
        @Request() req: ExpressRequest,
        @Body() body: any
    ): Promise<any> {
        try {
            const targetUrl = `${DEFAULT_OLLAMA_URL}/api/copy`;
            const response = await axios.post(targetUrl, body, {
                headers: {
                    'Authorization': `Bearer ${req.headers.authorization}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama copy request:', error);
            throw new Error('Error processing Ollama copy request');
        }
    }

    /**
     * @summary Proxy DELETE /api/delete call
     */
    @Post('api/delete')
    @OperationId('ollama-delete-request')
    public async ollamaDelete(
        @Request() req: ExpressRequest,
        @Body() body: any
    ): Promise<any> {
        try {
            const targetUrl = `${DEFAULT_OLLAMA_URL}/api/delete`;
            const response = await axios.delete(targetUrl, {
                headers: {
                    'Authorization': `Bearer ${req.headers.authorization}`,
                },
                data: body,
            });
            console.log('response: ', response.data);
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama delete request:', error);
            throw new Error('Error processing Ollama delete request');
        }
    }

    /**
     * @summary Proxy GET /api/tags call
     */
    @Get('api/tags')
    @OperationId('ollama-tags-request')
    public async ollamaTags(
        @Request() req: ExpressRequest
    ): Promise<any> {
        try {
            const targetUrl = `${DEFAULT_OLLAMA_URL}/api/tags`;
            const response = await axios.get(targetUrl, {
                headers: {
                    'Authorization': `Bearer ${req.headers.authorization}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama tags request:', error);
            throw new Error('Error processing Ollama tags request');
        }
    }

    /**
     * @summary Proxy GET /api/blobs/:digest call
     */
    @Get('api/blobs/:digest')
    @OperationId('ollama-blobs-request')
    public async ollamaBlobs(
        @Path() digest: string,
        @Request() req: ExpressRequest
    ): Promise<any> {
        try {
            const targetUrl = `${DEFAULT_OLLAMA_URL}/api/blobs/${digest}`;
            const response = await axios.head(targetUrl, {
                headers: {
                    'Authorization': `Bearer ${req.headers.authorization}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama blobs request:', error);
            throw new Error('Error processing Ollama blobs request');
        }
    }

    /**
     * @summary Proxy POST /api/show call
     */
    @Post('api/show')
    @OperationId('ollama-show-request')
    public async ollamaShow(
        @Request() req: ExpressRequest,
        @Body() body: any
    ): Promise<any> {
        try {
            const targetUrl = `${DEFAULT_OLLAMA_URL}/api/show`;
            const response = await axios.post(targetUrl, body, {
                headers: {
                    'Authorization': `Bearer ${req.headers.authorization}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama show request:', error);
            throw new Error('Error processing Ollama show request');
        }
    }

    /**
     * @summary Proxy POST /api/embed call
     */
    @Post('api/embed')
    @OperationId('ollama-embed-request')
    public async ollamaEmbed(
        @Request() req: ExpressRequest,
        @Body() body: any
    ): Promise<any> {
        try {
            const targetUrl = `${DEFAULT_OLLAMA_URL}/api/embed`;
            const response = await axios.post(targetUrl, body, {
                headers: {
                    'Authorization': `Bearer ${req.headers.authorization}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama embed request:', error);
            throw new Error('Error processing Ollama embed request');
        }
    }

    /**
     * @summary Proxy POST /api/embeddings call
     */
    @Post('api/embeddings')
    @OperationId('ollama-embeddings-request')
    public async ollamaEmbeddings(
        @Request() req: ExpressRequest,
        @Body() body: any
    ): Promise<any> {
        try {
            const targetUrl = `${DEFAULT_OLLAMA_URL}/api/embeddings`;
            const response = await axios.post(targetUrl, body, {
                headers: {
                    'Authorization': `Bearer ${req.headers.authorization}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama embeddings request:', error);
            throw new Error('Error processing Ollama embeddings request');
        }
    }

    /**
     * @summary Proxy GET /api/ps call
     */
    @Get('api/ps')
    @OperationId('ollama-ps-request')
    public async ollamaPs(
        @Request() req: ExpressRequest
    ): Promise<any> {
        try {
            const targetUrl = `${DEFAULT_OLLAMA_URL}/api/ps`;
            const response = await axios.get(targetUrl, {
                headers: {
                    'Authorization': `Bearer ${req.headers.authorization}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Ollama ps request:', error);
            throw new Error('Error processing Ollama ps request');
        }
    }
}
