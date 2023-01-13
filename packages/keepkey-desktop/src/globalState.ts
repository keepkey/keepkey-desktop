import type * as core from '@shapeshiftoss/hdwallet-core'
import AutoLaunch from 'auto-launch'
import * as Comlink from 'comlink'
import type { BrowserWindow } from 'electron'
import { app } from 'electron'
import fs from 'fs'
import * as hidefile from 'hidefile'
import type { Server } from 'http'
import NedbPromises from 'nedb-promises'
import path from 'path'
import type { PinMatrixRequestType2 } from 'types'

import { BridgeLogger } from './helpers/bridgeLogger'
import { KKStateController } from './helpers/kk-state-controller'
import type { KKStateData } from './helpers/kk-state-controller/types'
import { KKState } from './helpers/kk-state-controller/types'
import { SettingsInstance } from './helpers/settings'
import { rendererIpc } from './ipcListeners'
import { createAndUpdateTray } from './tray'

export const assetsDirectory = path.join(__dirname, 'assets')
export const isMac = process.platform === 'darwin'
export const isWin = process.platform === 'win32'
export const isLinux = process.platform !== 'darwin' && process.platform !== 'win32'
export const ALLOWED_HOSTS = ['localhost']

const homedir = require('os').homedir()
const dbDirPath = path.join(homedir, '.keepkey')
const dbPath = path.join(dbDirPath, './db')
if (!fs.existsSync(dbDirPath)) {
  fs.mkdirSync(dbDirPath)
  fs.closeSync(fs.openSync(dbPath, 'w'))
}
hidefile.hideSync(dbDirPath)

export const db = NedbPromises.create({ filename: dbPath, autoload: true })

export let server: Server
export let setServer = (value: Server) => (server = value)

export let tcpBridgeRunning = false
export let setTcpBridgeRunning = (value: boolean) => (tcpBridgeRunning = value)

export let tcpBridgeStarting = false
export let setTcpBridgeStarting = (value: boolean) => (tcpBridgeStarting = value)

export let tcpBridgeClosing = false
export let setTcpBridgeClosing = (value: boolean) => (tcpBridgeClosing = value)

export let renderListenersReady = false
export let setRenderListenersReady = (value: boolean) => (renderListenersReady = value)

export const [shouldShowWindow, setShouldShowWindow] = (() => {
  let out: () => void
  return [new Promise<boolean>(resolve => (out = () => resolve(true))), out!]
})()

export const windows: {
  mainWindow: undefined | BrowserWindow
  splash: undefined | BrowserWindow
} = {
  mainWindow: undefined,
  splash: undefined,
}

export const isWalletBridgeRunning = () =>
  kkStateController.data.state === KKState.Connected && tcpBridgeRunning

export const settings = new SettingsInstance()
export const bridgeLogger = new BridgeLogger()

export const kkAutoLauncher = new AutoLaunch({
  name: 'KeepKey Desktop',
})

const redacted = Symbol.for('redacted')
export const kkStateController = new KKStateController(
  async function (this: KKStateController, data: KKStateData) {
    console.log('KK STATE', data)
    createAndUpdateTray()
    await (await rendererIpc).updateState(data)
    if (data.state === 'disconnected') {
      await (await rendererIpc).modalCloseAll()
    }
  },
  async function (this: KKStateController, vendor: string, deviceId: string, e: string) {
    console.log('KEYRING EVENT', vendor, deviceId, e)
  },
  async function (this: KKStateController, e: core.Event) {
    console.log('TRANSPORT EVENT', {
      ...{
        ...e,
        date: undefined,
        ...(e.message_type !== 'PASSPHRASEACK'
          ? {
              proto: e.proto?.toObject(),
            }
          : {
              message: redacted,
              proto: redacted,
            }),
      },
    })
    if (e.message_type === 'PINMATRIXREQUEST') {
      const pinRequestType: PinMatrixRequestType2 = e.message.type
      const pin = await (await rendererIpc).modalPin(pinRequestType).catch(e => {
        console.error('modalPin error:', e)
        return undefined
      })
      await (await rendererIpc).modalCloseAll()
      if (pin !== undefined) {
        await this.wallet!.sendPin(pin)
      } else {
        await this.wallet!.cancel()
      }
    }
    if (e.message_type === 'SUCCESS') {
      if (e.message.message === 'PIN removed' || e.message.message === 'PIN changed') {
        //restart app
        console.log('restarting app')
        app.relaunch()
        app.exit()
      }
    } else if (e.message_type === 'PASSPHRASEREQUEST') {
      const passphrase = await (await rendererIpc).modalPassphrase().catch(e => {
        console.error('modalPassphrase error:', e)
        return undefined
      })
      try {
        if (passphrase !== undefined) {
          await this.wallet!.sendPassphrase(passphrase)
        } else {
          await this.wallet!.cancel()
        }
      } finally {
        await (await rendererIpc).modalCloseAll()
      }
    }
  },
)
