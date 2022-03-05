import swaggerUi from 'swagger-ui-express'
import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import log from 'electron-log'
import { NodeWebUSBKeepKeyAdapter } from '@shapeshiftoss/hdwallet-keepkey-nodewebusb'
import { Keyring } from '@shapeshiftoss/hdwallet-core'
import { Server } from 'http'
import { windows } from './main'
import { app, ipcMain } from 'electron'
import wait from 'wait-promise'
import { shared } from './shared'
import { updateMenu } from './tray'
import { uniqueId } from 'lodash'
import { db } from './db'

const appExpress = express()
appExpress.use(cors())
appExpress.use(bodyParser.urlencoded({ extended: false }))
appExpress.use(bodyParser.json())

//OpenApi spec generated from template project https://github.com/BitHighlander/keepkey-bridge
const swaggerDocument = require(path.join(__dirname, '../api/dist/swagger.json'))
if (!swaggerDocument) throw Error("Failed to load API SPEC!")
const adapter = NodeWebUSBKeepKeyAdapter.useKeyring(new Keyring())


let USERNAME
let server: Server

const EVENT_LOG: Array<{ read: { data: string } }> = []
let sleep = wait.sleep;

export let bridgeRunning = false

/*
 
  KeepKey Status codes
 
  state : status
  ---------------
     -1 : error
      0 : preInit
      1 : no devices
      2 : device connected
      3 : bridge online
      4 : bootloader out of date
      5 : firmware out of date
 */


let STATE = 0
let STATUS = 'preInit'

export const start_bridge = async function (event) {
    let tag = " | start_bridge | "
    try {
        let device
        try {
            device = await adapter.getDevice()
            log.info(tag, "device: ", device)
        } catch (e) {
            STATE = 1
            STATUS = `no devices`
            event.sender.send('setKeepKeyState', { state: STATE })
            event.sender.send('setKeepKeyStatus', { status: STATUS })
        }

        let transport
        if (device) {
            transport = await adapter.getTransportDelegate(device)
            await transport.connect?.()
            log.info(tag, "transport: ", transport)

            STATE = 2
            STATUS = 'keepkey connected'
            event.sender.send('setKeepKeyState', { state: STATE })
            event.sender.send('setKeepKeyStatus', { status: STATUS })
        } else {
            log.info('Can not start! waiting for device connect')
        }

        let API_PORT = process.env['API_PORT_BRIDGE'] || '1646'

        // send paired apps when requested
        ipcMain.on('@bridge/paired-apps', (event) => {
            db.find({ type: 'service' }, (err, docs) => {
                event.sender.send('@bridge/paired-apps', docs)
            })
        })

        // used only for implicitly pairing the KeepKey web app
        ipcMain.on(`@bridge/add-service`, (event, data) => {
            db.insert({
                type: 'service',
                addedOn: Date.now(),
                ...data
            })
        })

        // used for unpairing apps
        ipcMain.on(`@bridge/remove-service`, (event, data) => {
            db.remove({ ...data })
        })

        /*
            KeepKey bridge
    
            endpoints:
              raw i/o keepkey bridge:
              status:
              payload:
              sign:
    
    
         */

        //docs
        appExpress.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        //swagger.json
        appExpress.use('/spec', express.static(path.join(__dirname, '../api/dist')));

        //status
        appExpress.all('/status', async (req, res, next) => {
            try {
                if (req.method === 'GET') {
                    res.status(200).json({
                        success: true,
                        username: USERNAME,
                        status: STATUS,
                        state: STATE
                    })
                }
                next()
            } catch (e) {
                throw e
            }
        })

        appExpress.all('/device', async (req, res, next) => {
            try {
                if (req.method === 'GET') {
                    res.status(200).json(shared.KEEPKEY_FEATURES)
                }
                next()
            } catch (e) {
                throw e
            }
        })


        appExpress.post('/pair', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)

            const nonce = uniqueId()

            const serviceName = req.body.serviceName
            const serviceImageUrl = req.body.serviceImageUrl
            const serviceKey = req.headers.authorization

            windows.mainWindow.webContents.send('@modal/pair', { serviceName, serviceImageUrl, nonce })
            if (windows.mainWindow.focusable) windows.mainWindow.focus()

            ipcMain.once(`@bridge/approve-service-${nonce}`, (event, data) => {
                if (data.nonce = nonce) {
                    ipcMain.removeAllListeners(`@bridge/approve-service-${nonce}`)
                    db.insert({
                        type: 'service',
                        addedOn: Date.now(),
                        serviceName,
                        serviceImageUrl,
                        serviceKey
                    })
                    res.statusCode = 200
                    res.send({ success: true, reason: '' })
                }
            })

            ipcMain.once(`@bridge/reject-service-${nonce}`, (event, data) => {
                if (data.nonce = nonce) {
                    ipcMain.removeAllListeners(`@bridge/reject-service-${nonce}`)
                    res.statusCode = 401
                    res.send({ success: false, reason: 'Pairing was rejected by user' })
                }
            })

            return res
        })

        //HDwallet API
        //TODO moveme?
        appExpress.post('/getPublicKeys', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)

            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/getPublicKeys', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/getPublicKeys`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/btcGetAddress', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/btcGetAddress', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/btcGetAddress`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/ethGetAddress', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/ethGetAddress', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/ethGetAddress`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/btcGetAddress', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/btcGetAddress', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/btcGetAddress`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/thorchainGetAddress', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/thorchainGetAddress', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/thorchainGetAddress`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/osmosisGetAddress', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/osmosisGetAddress', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/osmosisGetAddress`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/binanceGetAddress', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/binanceGetAddress', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/binanceGetAddress`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/cosmosGetAddress', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/cosmosGetAddress', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/cosmosGetAddress`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/btcSignTx', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/btcSignTx', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/btcSignTx`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/thorchainSignTx', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/thorchainSignTx', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/thorchainSignTx`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/cosmosSignTx', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/cosmosSignTx', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/cosmosSignTx`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/osmosisSignTx', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/osmosisSignTx', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/osmosisSignTx`, (event, data) => {
                res.send(data)
            })
        })

        appExpress.post('/ethSignTx', async (req, res, next) => {
            if (!windows.mainWindow || windows.mainWindow.isDestroyed()) return res.status(500)
            //send
            let payload = req.body
            console.log("payload: ", payload)
            windows.mainWindow.webContents.send('@hdwallet/ethSignTx', { payload })
            //paths in
            ipcMain.once(`@hdwallet/response/ethSignTx`, (event, data) => {
                res.send(data)
            })
        })

        /*
            Protected endpoint middleware
            Only allow approved applications collect data
    
            all routes below are protected
        */
        //TODO fix auth key adder in swagger tools
        const checkAuth = (req: Request, res: Response, next: NextFunction) => {
            console.log('Auth checked on: ', req.url)
            const serviceKey = req.headers.authorization

            if (!serviceKey) {
                res.statusCode = 401
                return res.send({ success: false, reason: 'Please provice a valid serviceKey' })
            }

            db.findOne({ type: 'service', serviceKey }, (err, doc) => {
                if (!doc) {
                    res.statusCode = 401
                    return res.send({ success: false, reason: 'Please provice a valid serviceKey' })
                } else {
                    next()
                }
            })
            // next()
        };

        if (device) {
            appExpress.all('/exchange/device', async (req, res, next) => {
                try {
                    if (req.method === 'GET') {
                        let resp = await transport.readChunk()
                        let output = {
                            data: Buffer.from(resp).toString('hex')
                        }
                        // log.info('output: ', output)
                        EVENT_LOG.push({ read: output })
                        event.sender.send('dataSent', { output })
                        if (res.status) res.status(200).json(output)
                    } else if (req.method === 'POST') {
                        let body = req.body
                        let msg = Buffer.from(body.data, 'hex')
                        transport.writeChunk(msg)
                        log.info('input: ', msg.toString('hex'))
                        // EVENT_LOG.push({ write: output })
                        event.sender.send('dataReceive', { output: msg })
                        res.status(200).json({})
                    } else {
                        throw Error('unhandled')
                    }
                    next()
                } catch (e) {
                    throw e
                }
            })
        } else {
            appExpress.all('/exchange/device', async (req, res, next) => {
                try {
                    res.status(200).json({
                        success: false,
                        msg: "Device not connected!"
                    })
                    next()
                } catch (e) {
                    throw e
                }
            })
        }


        appExpress.all('/auth/verify', checkAuth, (req, res, next) => {
            res.statusCode = 200
            res.send({ success: true })
        })


        //userInfo
        appExpress.all('/user', checkAuth, async (req, res, next) => {
            try {
                if (req.method === 'GET') {
                    res.status(200).json(shared.USER)
                }
                next()
            } catch (e) {
                throw e
            }
        })

        //sign
        appExpress.all('/sign', checkAuth, async (req, res, next) => {

            try {
                console.log("checkpoint1: ")
                if (req.method === 'POST') {
                    let body = req.body
                    console.log("body: ", body)
                    if (!windows.mainWindow) return res.status(500)
                    windows.mainWindow.setAlwaysOnTop(true)
                    if (!windows.mainWindow.isVisible()) {
                        windows.mainWindow.show()
                        app.dock.show()
                    }
                    event.sender.send('signTx', { payload: body })
                    //hold till signed
                    while (!shared.SIGNED_TX) {
                        console.log("waiting!")
                        await sleep(300)
                    }
                    res.status(200).json({ success: true, status: 'signed', signedTx: shared.SIGNED_TX })
                    shared.SIGNED_TX = null
                }
                next()
            } catch (e) {
                throw e
            }
        })


        //catchall
        appExpress.use((req, res, next) => {
            const status = 500, message = 'something went wrong. ', data = {}
            //log.info(req.body, { status: status, message: message, data: data })
            try {
                res.status(status).json({ message, data })
            } catch (e) { }
        })


        //port
        try {
            server = appExpress.listen(API_PORT, () => {
                event.sender.send('playSound', { sound: 'success' })
                log.info(`server started at http://localhost:${API_PORT}`)
                STATE = 3
                STATUS = 'bridge online'
                event.sender.send('setKeepKeyState', { state: STATE })
                event.sender.send('setKeepKeyStatus', { status: STATUS })
                updateMenu(STATE)
            })
        } catch (e) {
            event.sender.send('playSound', { sound: 'fail' })
            STATE = -1
            STATUS = 'bridge error'
            event.sender.send('setKeepKeyState', { state: STATE })
            event.sender.send('setKeepKeyStatus', { status: STATUS })
            updateMenu(STATE)
            log.info('e: ', e)
        }

        bridgeRunning = true

    } catch (e) {
        log.error(e)
    }
}

export const stop_bridge = async (event) => {
    try {
        event.sender.send('playSound', { sound: 'fail' })
        log.info('server: ', server)
        server.close(() => {
            log.info('Closed out remaining connections')
            STATE = 2
            STATUS = 'device connected'
            event.sender.send('setKeepKeyState', { state: STATE })
            event.sender.send('setKeepKeyStatus', { status: STATUS })
            updateMenu(STATE)
        })
        bridgeRunning = false
    } catch (e) {
        log.error(e)
    }
}
