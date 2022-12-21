import { Readable } from 'stream'
import { Body, Consumes, Post, Produces, Response, Route, Security, Tags } from 'tsoa'

import { ApiController } from '../auth'

export * from './addresses'
// export * from './auth'
export * from './bnb'
export * from './cosmos'
export * from './ethereum'
export * from './system'
export * from './xrp'

@Tags('Raw')
@Route('')
export class RawController extends ApiController {
  /**
   * @summary Raw KeepKey Device I/0
   */
  @Post('raw')
  @Security('apiKey')
  @Consumes('application/octet-stream')
  @Produces('application/octet-stream')
  @Response(500, 'Unable to communicate with device')
  public async raw(@Body() body: Buffer): Promise<Readable> {
    // These methods are private; override and use anyway
    const transport = this.context.wallet.transport as unknown as {
      write(data: Uint8Array, debugLink?: boolean): Promise<void>
      read(debugLink?: boolean): Promise<Uint8Array>
    }
    if (!transport) throw undefined

    await transport.write(body)
    const out = await transport.read()

    this.setHeader('Content-Type', 'application/octet-stream')
    return Readable.from(Buffer.from(out))
  }
}
