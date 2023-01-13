import bodyParser from 'body-parser'
import cors from 'cors'
import log from 'electron-log'
import express from 'express'
import {
  addMiddleware,
  RegisterRoutes,
  setSdkClientFactory,
  setSdkPairingHandler,
} from 'keepkey-sdk-server'
import type { PairingInfo } from 'keepkey-sdk-server/dist/auth/sdkClient'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import * as util from 'util'
import * as uuid from 'uuid'

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
import { rendererIpc } from './ipcListeners'
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
  setSdkPairingHandler(async (info: PairingInfo) => {
    const apiKey = uuid.v4()
    console.log('approving pairing request', info, apiKey)
    // await promptUser(){}
    let input: any = info
    input.type = 'native'
    let result = await (await rendererIpc).modalPair(input)
    console.log('PAIR RESULT: ', result)
    if (result) {
      console.log('USER APPROVED!')
      await db.insertOne<{ type: 'sdk-pairing'; apiKey: string; info: PairingInfo }>({
        type: 'sdk-pairing',
        apiKey,
        info,
      })
      return apiKey
    } else {
      return 'rejected'
    }
  })
  setSdkClientFactory(async (apiKey: string) => {
    const doc = await db.findOne<{ type: 'sdk-pairing'; apiKey: string; info: PairingInfo }>({
      type: 'sdk-pairing',
      apiKey,
    })
    if (!doc) return undefined

    const wallet = kkStateController.wallet
    if (!wallet) throw new Error('wallet not set')

    return {
      apiKey: doc.apiKey,
      wallet,
      info: doc.info,
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
    try {
      await util.promisify(server.close.bind(server))()
      log.info('TCP bridge stopped.')
    } catch (e) {
      log.warn('Error stopping TCP bridge:', e)
    }
  }

  setTcpBridgeRunning(false)
  setTcpBridgeClosing(false)
  createAndUpdateTray()
}
