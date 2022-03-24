const TAG = " | KEEPKEY_BRIDGE | "

import swaggerUi from 'swagger-ui-express'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import path from 'path'
import log from 'electron-log'
import { Device } from '@shapeshiftoss/hdwallet-keepkey-nodewebusb'
import { Keyring } from '@shapeshiftoss/hdwallet-core'
import { Server } from 'http'
import { ipcMain } from 'electron'
import { updateMenu } from '../tray'
import { db } from '../db'
import { RegisterRoutes } from './routes/routes'
import { KeepKeyHDWallet, TransportDelegate } from '@shapeshiftoss/hdwallet-keepkey'
import { windows } from '../main'
import {updateConfig} from "keepkey-config";
import {shared} from "../shared";
let Controller = require("@keepkey/keepkey-hardware-controller")

const appExpress = express()
appExpress.use(cors())
appExpress.use(bodyParser.urlencoded({ extended: true }))
appExpress.use(bodyParser.json())

//OpenApi spec generated from template project https://github.com/BitHighlander/keepkey-bridge
const swaggerDocument = require(path.join(__dirname, '../../api/dist/swagger.json'))
if (!swaggerDocument) throw Error("Failed to load API SPEC!")

export let server: Server
export let bridgeRunning = false


export const keepkey: {
    STATE: number,
    STATUS: string,
    device: Device | null,
    transport: TransportDelegate | null,
    keyring: Keyring | null,
    wallet: KeepKeyHDWallet | null
} = {
    STATE: 0,
    STATUS: 'preInit',
    device: null,
    transport: null,
    keyring: null,
    wallet: null
}

ipcMain.on('@keepkey/update-firmware', async event => {
    const tag = TAG + ' | onUpdateFirmware | '
    try {
        log.info(tag," checkpoint !!!!")
        let result = await Controller.getLatestFirmwareData()
        log.info(tag," result: ",result)

        let firmware = await Controller.downloadFirmware(result.firmware.url)
        if(!firmware) throw Error("Failed to load firmware from url!")

        const updateResponse = await Controller.loadFirmware(firmware)
        log.info(tag, "updateResponse: ", updateResponse)

        event.sender.send('onCompleteFirmwareUpload', {
            bootloader: true,
            success: true
        })
    } catch (e) {
        log.error(tag, e)
    }
})

ipcMain.on('@keepkey/update-bootloader', async event => {
    const tag = TAG + ' | onUpdateBootloader | '
    try {
        log.info(tag, "checkpoint: ")
        let result = await Controller.getLatestFirmwareData()
        let firmware = await Controller.downloadFirmware(result.bootloader.url)
        const updateResponse = await Controller.loadFirmware(firmware)
        log.info(tag, "updateResponse: ", updateResponse)
        event.sender.send('onCompleteBootloaderUpload', {
            bootloader: true,
            success: true
        })
    } catch (e) {
        log.error(tag, e)
    }
})

ipcMain.on('@keepkey/info', async (event, data) => {
    const tag = TAG + ' | onKeepKeyInfo | '
    try {
        shared.KEEPKEY_FEATURES = data
    } catch (e) {
        log.error('e: ', e)
        log.error(tag, e)
    }
})

export const start_bridge = (port?: number) => new Promise<void>(async (resolve, reject) => {
    let tag = " | start_bridge | "
    try {

        let API_PORT = port || 1646

        // send paired apps when requested
        ipcMain.on('@bridge/paired-apps', (event) => {
            db.find({ type: 'service' }, (err, docs) => {
                windows.mainWindow?.webContents.send('@bridge/paired-apps', docs)
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

        appExpress.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        //swagger.json
        appExpress.use('/spec', express.static(path.join(__dirname, '../../api/dist')));

        RegisterRoutes(appExpress);

        //port
        try {
            log.info(tag, "starting server! **** ")
            server = appExpress.listen(API_PORT, () => {
                windows.mainWindow?.webContents.send('playSound', { sound: 'success' })
                log.info(`server started at http://localhost:${API_PORT}`)
                windows?.mainWindow?.webContents.send('closeHardwareError', { })
                // keepkey.STATE = 3
                // keepkey.STATUS = 'bridge online'
                // windows.mainWindow?.webContents.send('setKeepKeyState', { state: keepkey.STATE })
                // windows.mainWindow?.webContents.send('setKeepKeyStatus', { status: keepkey.STATUS })
                updateMenu(keepkey.STATE)
            })
        } catch (e) {
            keepkey.STATE = -1
            keepkey.STATUS = 'bridge error'
            windows.mainWindow?.webContents.send('setKeepKeyState', { state: keepkey.STATE })
            windows.mainWindow?.webContents.send('setKeepKeyStatus', { status: keepkey.STATUS })
            updateMenu(keepkey.STATE)
            log.info('e: ', e)
        }

        bridgeRunning = true

        try {
            log.info("Starting Hardware Contoller")
            //start hardware controller
            //sub ALL events
            let controller = new Controller.KeepKey({})
            controller.init()

            //state
            controller.events.on('state',function(event){
                log.info("state change: ",event)
                keepkey.STATE = event.state
                keepkey.STATUS = event.status

                switch (event.state) {
                    case 4:
                        //launch init seed window
                        break;
                    case 5:
                        keepkey.device = controller.device
                        keepkey.wallet = controller.wallet
                        keepkey.transport = controller.transport
                        break;
                    default:
                        //unhandled
                }
            })

            //errors
            controller.events.on('error',function(event){
                log.info("error event: ",event)
                windows?.mainWindow?.webContents.send('openHardwareError', { error: event.error, code: event.code, event })
            })

            //logs
            controller.events.on('logs',function(event){
                log.info("logs event: ",event)
                if(event.bootloaderUpdateNeeded){
                    windows?.mainWindow?.webContents.send('openBootloaderUpdate', event)
                }

                if(event.firmwareUpdateNeeded){
                    windows?.mainWindow?.webContents.send('openFirmwareUpdate', event)
                }
            })
        } catch (e) {
            log.error(e)
        }


        resolve()

    } catch (e) {
        log.error(e)
    }
})

export const stop_bridge = () => new Promise<void>((resolve, reject) => {
    try {
        log.info('server: ', server)
        server.close(() => {
            log.info('Closed out remaining connections')
            keepkey.STATE = 2
            keepkey.STATUS = 'device connected'
            windows.mainWindow?.webContents.send('setKeepKeyState', { state: keepkey.STATE })
            windows.mainWindow?.webContents.send('setKeepKeyStatus', { status: keepkey.STATUS })
            updateMenu(keepkey.STATE)
        })
        bridgeRunning = false
        resolve()
    } catch (e) {
        log.error(e)
        reject()
    }
})
