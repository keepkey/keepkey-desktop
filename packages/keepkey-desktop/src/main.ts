import 'dotenv/config'
import 'source-map-support/register'
import './comlinkTransferHandlers'

import * as Sentry from '@sentry/electron'
import { app, nativeTheme } from 'electron'
import isDev from 'electron-is-dev'
import log from 'electron-log'
import unhandled from 'electron-unhandled'
import fs from 'fs'

import { startAppListeners } from './appListeners'
import { isWin, kkAutoLauncher, settings } from './globalState'
import { startTcpBridge } from './tcpBridge'
import { startUpdaterListeners } from './updaterListeners'

unhandled()

if (!app.requestSingleInstanceLock()) app.exit()
app.disableHardwareAcceleration()

log.transports.file.level = 'debug'

Sentry.init({ dsn: process.env.SENTRY_DSN })

startAppListeners()
startUpdaterListeners()
startTcpBridge().catch(e => log.error('startTcpBridge error:', e))

// Auto launch on startup
;(async () => {
  if (!isDev && (await settings.shouldAutoLaunch)) {
    await kkAutoLauncher.enable()
    console.log('autolaunch enabled')
  } else {
    await kkAutoLauncher.disable()
    console.log('autolaunch disabled')
  }
})().catch(e => log.error('autolaunch setup error:', e))

try {
  if (isWin && nativeTheme.shouldUseDarkColors === true) {
    fs.unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch {}

if (process.defaultApp) {
  app.setAsDefaultProtocolClient('keepkey')
}
