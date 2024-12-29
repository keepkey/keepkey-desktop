import * as Messages from '@keepkey/device-protocol/lib/messages_pb'
import * as Types from '@keepkey/device-protocol/lib/types_pb'
import type * as core from '@keepkey/hdwallet-core'
import { ActionCancelled, HDWalletError } from '@keepkey/hdwallet-core'
import { ValidateError } from '@tsoa/runtime'
import { assume } from 'common-utils'
import type * as express from 'express'
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
    if (err instanceof HDWalletError) {
      // @ts-ignore
      console.log("ActionCancelled: ",ActionCancelled)
      // @ts-ignore
      console.log("Types: ",Types)
      //NERFED debugging node.js ActionCancelled error
      // if (err instanceof ActionCancelled) {
      //   return res.status(500).json({
      //     message: err.message,
      //     name: err.name,
      //     type: err.type,
      //     failure_type: Types.FailureType.FAILURE_ACTIONCANCELLED,
      //   })
      // } else {
      //   return res.status(500).json({ message: err.message, name: err.name, type: err.type })
      // }
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
    } else if (err instanceof Error) {
      return res.status(500).json({ message: err.message })
    } else {
      return res.status(500).json({})
    }
  })
}
