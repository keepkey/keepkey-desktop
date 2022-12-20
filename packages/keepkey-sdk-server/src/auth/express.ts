import type * as express from 'express'
import { getSdkClientFactory } from './sdkClient'

// This is a magic tsoa export name, don't change
export async function expressAuthentication(
  request: express.Request,
  securityName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _scopes?: string[],
) {
  if (securityName === 'apiKey') {
    const apiKey = /^Bearer (?<token>.*)$/.exec(request.headers.authorization ?? '')?.groups?.token
    if (!apiKey) {
      throw new Error('API key required')
    }
    const out = await (await getSdkClientFactory)(apiKey)
    if (!out) throw new Error('invalid API key')
    return out
  }
  throw new Error('unhandled securityName')
}
