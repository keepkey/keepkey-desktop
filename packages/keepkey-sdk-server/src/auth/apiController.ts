import { Controller } from '@tsoa/runtime'

import type { ApiContext } from './apiContext'

export abstract class ApiController extends Controller {
  protected readonly context: ApiContext
  constructor(context: ApiContext) {
    super()
    this.context = context
  }
  log(...args: unknown[]) {
    this.context.sdkClient.logger(this.context.path, ...args)
  }
}
