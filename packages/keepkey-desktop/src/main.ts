import 'dotenv/config'

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

log.transports.file.level = 'debug'

Sentry.init({ dsn: process.env.SENTRY_DSN })

startAppListeners()
startUpdaterListeners()
startTcpBridge().catch(e => log.error('startTcpBridge error:', e))

// Auto launch on startup
if (!isDev && settings.shouldAutoLaunch) {
  kkAutoLauncher.enable()
  kkAutoLauncher.isEnabled().then(function (isEnabled) {
    if (isEnabled) {
      return
    }
    kkAutoLauncher.enable()
  })
}

try {
  if (isWin && nativeTheme.shouldUseDarkColors === true) {
    fs.unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch {}

if (process.defaultApp) {
  app.setAsDefaultProtocolClient('keepkey')
}
