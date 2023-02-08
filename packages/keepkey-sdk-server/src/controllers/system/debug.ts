// import type * as express from 'express'
import {
  Body,
  Deprecated,
  Middlewares,
  OperationId,
  Post,
  Produces,
  Response,
  Route,
  Security,
  Tags,
} from '@tsoa/runtime'
import type { Readable } from 'stream'

import { ApiController } from '../../auth'
import { extra } from '../../middlewares'
import type * as types from '../../types'

@Route('/system/debug')
@Tags('Debug')
@Deprecated()
@Security('session')
@Middlewares(extra)
@Response(400, 'Bad request')
@Response(500, 'Error processing request')
export class SystemDebugController extends ApiController {
  /**
   * On a DEBUG_LINK bootloader, fills the storage sectors with a dummy data pattern.
   * @summary Fill storage with dummy data
   */
  @Post('/fill-config')
  @OperationId('DebugLinkFillConfig')
  public async fillConfig(): Promise<void> {
    throw new Error('fillConfig not supported')
  }

  /**
   * On DEBUG_LINK firmware, dumps a section of flash memory.
   * @summary Dump flash memory
   */
  @Post('/flash-dump')
  @OperationId('DebugLinkFlashDump')
  @Produces('application/octet-stream')
  public async flashDump(
    @Body()
    _body: // eslint-disable-line @typescript-eslint/no-unused-vars
    {
      address: types.numeric.U32
      length: types.numeric.U32
    },
  ): Promise<Readable> {
    throw new Error('flashDump not supported')
  }

  /**
   * On DEBUG_LINK firmware, dumps various internal sensitive paramters.
   * @summary Dump sensitive device state
   */
  @Post('/get-state')
  @OperationId('DebugLinkGetState')
  public async getState(): Promise<{
    /** raw buffer of display */
    layout?: string
    /** current PIN, blank if PIN is not set/enabled */
    pin?: string
    /** current PIN matrix */
    matrix?: string
    /** current BIP-39 mnemonic */
    mnemonic?: string
    /** current BIP-32 node */
    node?: types.HDNode & unknown
    /** is node/mnemonic encrypted using passphrase? */
    passphrase_protection?: boolean
    /** word on device display during ResetDevice workflow */
    reset_word?: string
    /** current entropy during ResetDevice workflow */
    reset_entropy?: types.hex.bytes.Lower & unknown
    /** (fake) word on display during RecoveryDevice workflow */
    recovery_fake_word?: string
    /** index of mnemonic word the device is expecting during RecoveryDevice workflow */
    recovery_word_pos?: types.numeric.U32
    /** current recovery cipher */
    recovery_cipher?: string
    /** last auto completed recovery word */
    recovery_auto_completed_word?: string
    /** hash of the application and meta header */
    firmware_hash?: types.hex.bytes.Lower & unknown
    /** hash of storage */
    storage_hash?: types.hex.bytes.Lower & unknown
  }> {
    throw new Error('getState not supported')
  }
}
