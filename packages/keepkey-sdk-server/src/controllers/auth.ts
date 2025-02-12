import {
  Body,
  Controller,
  Get,
  Middlewares,
  OperationId,
  Post,
  Request,
  Response,
  Route,
  Security,
  Tags,
} from '@tsoa/runtime'
import type * as express from 'express'

import type { PairingInfo } from '../auth/sdkClient'
import { getSdkPairingHandler } from '../auth/sdkClient'
import { extra } from '../middlewares'

@Route('/auth')
@Tags('Auth')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class AuthController extends Controller {
  /**
   * @summary Verify new SDK client
   */
  @Get('/pair')
  @Security('apiKey')
  @OperationId('Verify')
  @Response(403, 'Invalid API key')
  public async verify(@Request() req: express.Request): Promise<PairingInfo> {
    if (!req.user) {
      this.setStatus(403)
      throw {}
    }

    return req.user.info
  }

  /**
   * @summary Pair new SDK client
   */
  @Post('/pair')
  @OperationId('Pair')
  @Response(403, 'Pairing request rejected')
  public async pair(
      @Body() body: PairingInfo,
      @Request() req: any,  // Use @Request() instead of @Req()
  ): Promise<{ apiKey: string }> {
    console.log('pair body', body);
    console.log('pair req', req);

    // Pass both body (PairingInfo) and req to the pairing handler
    const apiKey = await (await getSdkPairingHandler)(body, req);

    if (!apiKey) {
      this.setStatus(403);
      throw new Error('Pairing request rejected');
    }

    return {
      apiKey,
    };
  }
}
