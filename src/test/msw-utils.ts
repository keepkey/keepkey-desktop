
import { setupServer, SetupServerApi } from 'msw/node'

function setupMsw() {
  let server: SetupServerApi | undefined

  server = setupServer()
  return {server, worker: null }
}

export const { worker, server } = setupMsw()
export const mock = (worker || server)!.use
export { graphql, rest } from 'msw'
