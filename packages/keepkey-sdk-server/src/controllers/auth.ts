import type * as express from 'express'
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
} from 'tsoa'

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
    @Body()
    body: PairingInfo,
  ): Promise<{ apiKey: string }> {
    const apiKey = await (await getSdkPairingHandler)(body)
    if (!apiKey) {
      this.setStatus(403)
      throw {}
    }

    return {
      apiKey,
    }
  }
}
