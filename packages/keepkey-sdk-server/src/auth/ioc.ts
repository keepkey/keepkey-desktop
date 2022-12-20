import type * as express from 'express'

import { ApiController } from './apiController'
import type { Controller, IocContainer, IocContainerFactory } from 'tsoa'
import { ApiContext } from './apiContext'

// This is a magic tsoa export name, don't change
export const iocContainer: IocContainerFactory = function (request: express.Request): IocContainer {
  return {
    async get<T extends new (...args: unknown[]) => Controller>(x: new () => T & { prototype: T }) {
      if (x.prototype instanceof ApiController) {
        const sdkClient = request.user
        if (!sdkClient) {
          throw new Error('expected request.user to be provided by expressAuthentication()')
        }

        const context = await ApiContext.create(sdkClient)

        return new (x as new (context: ApiContext) => T)(context)
      } else {
        return new x()
      }
    },
  }
}
