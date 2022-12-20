import type * as express from 'express'

const middlewares: express.Handler[] = []

export function addMiddleware(x: express.Handler) {
  middlewares.push(x)
}

export const extra: express.Handler = (req, res, next) => {
  const combined = middlewares.reduce((a, b) => (req, res, next) => {
    a(req, res, err => (err ? next(err) : b(req, res, next)))
  })

  return combined(req, res, next)
}
