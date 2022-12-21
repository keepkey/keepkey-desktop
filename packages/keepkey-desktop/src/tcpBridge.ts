import bodyParser from 'body-parser'
import cors from 'cors'
import log from 'electron-log'
import express from 'express'
import { addMiddleware, RegisterRoutes, setSdkClientFactory } from 'keepkey-sdk-server'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import * as util from 'util'

import {
  db,
  kkStateController,
  server,
  setServer,
  setTcpBridgeClosing,
  setTcpBridgeRunning,
  setTcpBridgeStarting,
  tcpBridgeClosing,
  tcpBridgeRunning,
  tcpBridgeStarting,
} from './globalState'
import { logger } from './helpers/middlewares/logger'
import { createAndUpdateTray } from './tray'

export const startTcpBridge = async (port?: number) => {
  if (tcpBridgeRunning || tcpBridgeStarting) return
  setTcpBridgeStarting(true)
  const API_PORT = port || 1646

  const appExpress = express()
  appExpress.use(cors())
  appExpress.use(bodyParser.urlencoded({ extended: true }))
  appExpress.use(bodyParser.json())

  const swaggerDocument = require(path.join(__dirname, 'api/swagger.json'))
  if (!swaggerDocument) throw Error('Failed to load API SPEC!')

  appExpress.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  //swagger.json
  appExpress.use('/spec', express.static(path.join(__dirname, 'api')))

  addMiddleware(logger)
  setSdkClientFactory(async (apiKey: string) => {
    const doc = await db.findOne({ type: 'service', serviceKey: apiKey })
    if (!doc) return undefined

    const wallet = kkStateController.wallet
    if (!wallet) throw new Error('wallet not set')

    return {
      apiKey,
      wallet,
    }
  })
  RegisterRoutes(appExpress)

  await new Promise(resolve => setServer(appExpress.listen(API_PORT, () => resolve(true))))
  log.info(`Tcp bridge started at http://localhost:${API_PORT}`)

  setTcpBridgeStarting(false)
  setTcpBridgeRunning(true)
  createAndUpdateTray()
}

export const stopTcpBridge = async () => {
  if (tcpBridgeClosing) return false

  setTcpBridgeClosing(true)
  createAndUpdateTray()

  if (server) {
    log.info('Stopping TCP bridge...')
    await util.promisify(server.close)()
    log.info('TCP bridge stopped.')
  }

  setTcpBridgeRunning(false)
  setTcpBridgeClosing(false)
  createAndUpdateTray()
}
