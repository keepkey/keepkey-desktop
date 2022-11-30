import type * as express from 'express'
import { db } from '../globalState'

export function expressAuthentication(
  request: express.Request,
  securityName: string,
  _scopes?: string[],
) {
  if (securityName === 'api_key') {
    let serviceKey
    if (request.headers && request.headers.authorization) {
      serviceKey = request.headers.authorization
    }
    if (!serviceKey) {
      return Promise.reject({ success: false, reason: 'Please provide a valid serviceKey' })
    }
    return Promise.resolve(
      new Promise((resolve, reject) => {
        db.findOne({ type: 'service', serviceKey }, (_err, doc) => {
          if (!doc) {
            return reject({ success: false, reason: 'Please provide a valid serviceKey' })
          } else {
            return resolve({})
          }
        })
      }),
    )
  }
  return Promise.reject({ success: false, reason: 'Please provide a valid serviceKey' })
}
