import 'source-map-support/register'

import { Buffer } from 'buffer'
// @ts-expect-error
import * as process from 'process/browser'

import { logger } from './lib/logger'
;(async () => {
  globalThis.__dirname = '/'
  globalThis.global = globalThis
  globalThis.Buffer = Buffer
  globalThis.process = process
  // @ts-expect-error
  globalThis.app_env = await (await fetch('./env.json')).json()
  await import('./index')
})().catch(e => logger.error(e, 'loader error'))
