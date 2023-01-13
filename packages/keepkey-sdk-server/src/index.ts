import * as Messages from '@keepkey/device-protocol/lib/messages_pb'
import type * as core from '@shapeshiftoss/hdwallet-core'
import { assume } from 'common-utils'
import type * as express from 'express'
import { ValidateError } from 'tsoa'
export * from './auth'
import { RegisterRoutes as RegisterRoutesInternal } from './generated/routes'
export { addMiddleware } from './middlewares'

export function RegisterRoutes(app: express.Router) {
  RegisterRoutesInternal(app)
  app.use(function errorHandler(
    err: unknown,
    req: express.Request,
    res: express.Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: express.NextFunction,
  ): express.Response | void {
    if (err instanceof ValidateError) {
      console.warn(`Caught Validation Error for ${req.path}:`, err.fields)
      return res.status(422).json({
        message: 'Validation Failed',
        details: err?.fields,
      })
    }
    if (err instanceof Error) {
      return res.status(500).json({
        message: err.message,
      })
    } else if (err && typeof err === 'object' && 'from_wallet' in err) {
      assume<core.Event>(err)
      switch (err.message_enum) {
        case Messages.MessageType.MESSAGETYPE_FAILURE:
          assume<Messages.Failure.AsObject>(err.message)
          return res.status(500).json({
            message: err.message.message,
            failure_type: err.message.code,
          })
        default:
          return res.status(500).json({})
      }
    } else {
      return res.status(500).json({})
    }
  })
}
