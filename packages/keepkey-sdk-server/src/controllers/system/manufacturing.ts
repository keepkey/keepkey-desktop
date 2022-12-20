import {
  Body,
  Post,
  Security,
  Route,
  Response,
  Middlewares,
  Deprecated,
  Tags,
  OperationId,
} from 'tsoa'
import type { Readable } from 'stream'

import type * as types from '../../types'

import { ApiController } from '../../auth'
import { extra } from '../../middlewares'

@Route('/system/manufacturing')
@Tags('Manufacturing')
@Deprecated()
@Security('apiKey')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class SystemManufacturingController extends ApiController {
  /**
   * On devices with manufacturing firmware, gets the Keccak-256 hash of a section of flash memory.
   * @summary Hash flash memory
   */
  @Post('/flash-hash')
  @OperationId('FlashHash')
  public async flashHash(
    @Body()
    _body: // eslint-disable-line @typescript-eslint/no-unused-vars
    {
      address: types.numeric.U32
      length: types.numeric.U32
      challenge?: types.hex.bytes.Lower
    },
  ): Promise<Readable> {
    throw new Error('flashHash not supported')
  }

  /**
   * On devices with manufacturing firmware, writes a payload to flash memory and returns the resulting Keccak-256 hash.
   * @summary Write flash memory
   */
  @Post('/flash-write')
  @OperationId('FlashWrite')
  public async flashWrite(
    @Body()
    _body: // eslint-disable-line @typescript-eslint/no-unused-vars
    {
      address: types.numeric.U32
      data?: types.hex.bytes.Lower
      erase?: boolean
    },
  ): Promise<Readable> {
    throw new Error('flashWrite not supported')
  }

  /**
   * On devices with manufacturing firmware, triggers a soft reset.
   * @summary Soft reset
   */
  @Post('/soft-reset')
  @OperationId('SoftReset')
  public async softReset(): Promise<void> {
    if (!this.context.wallet) throw undefined

    await this.context.wallet.softReset()
  }
}
