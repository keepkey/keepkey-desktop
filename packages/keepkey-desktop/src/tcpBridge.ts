import bodyParser from 'body-parser'
import cors from 'cors'
import log from 'electron-log'
import express from 'express'
import type { PairingProps } from 'keepkey-desktop-app/src/components/Modals/Pair/types'
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

// Function to start TCP bridge
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

  // Set up pairing handler
  setSdkPairingHandler(async (info: PairingInfo, req: express.Request) => {
    const apiKey = uuid.v4(); // Generate a new API key
    console.log('req: ',req)
    // Ensure the request object is available
    if (!req || !req.headers) {
      console.error('Request object or headers are missing');
      throw new Error('Request object or headers are missing');
    }

    // Get the request origin or referer to check where the request is coming from
    const autoApproveOrigins = [
        'https://private.shapeshift.com',
        'https://app.keepkey.com', 
        'https://app.keepkey.info',
        'http://localhost:3000',
        'chrome-extension://dajbdedapcflmaaojleehmafomgjcdoh',
        'chrome-extension://pnfinogeoemeiphgkpgnpnpchleifmcf'
    ];

    // Get the request origin or referer to check where the request is coming from
    const origin = req.headers.origin || req.headers.referer;
    console.log('origin: ',origin)
    // Check if the origin is in the auto-approve list
    if (autoApproveOrigins.includes(origin)) {
      console.log('Auto-approving pairing request from trusted origin:', origin, info, apiKey);

      // Automatically approve the pairing and save to the database
      info.addedOn = Date.now();
      await db.insertOne<{ type: 'sdk-pairing'; apiKey: string; info: PairingInfo }>({
        type: 'sdk-pairing',
        apiKey,
        info,
      });

      // Return the generated API key without user prompt
      return apiKey;
    }

    // If the request is not from "https://keepkey.info", proceed with the normal pairing flow
    console.log('Prompting user for pairing approval', info, apiKey);
    let input = {
      type: 'native',
      data: info,
    } satisfies PairingProps;

    // Show the modal to prompt the user
    let result = await (await rendererIpc).modalPair(input);
    console.log('PAIR RESULT: ', result);

    if (result) {
      console.log('USER APPROVED!');
      info.addedOn = Date.now();
      await db.insertOne<{ type: 'sdk-pairing'; apiKey: string; info: PairingInfo }>({
        type: 'sdk-pairing',
        apiKey,
        info,
      });
      return apiKey;
    } else {
      return 'rejected';
    }
  });

  // Set up client factory
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
      db,
      info: doc.info,
      logger: console.log.bind(console),
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
