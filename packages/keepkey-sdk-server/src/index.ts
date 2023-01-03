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
    next: express.NextFunction,
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
    }

    next()
  })
}
