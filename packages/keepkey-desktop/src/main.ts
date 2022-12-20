import isDev from 'electron-is-dev'
import log from 'electron-log'
import unhandled from 'electron-unhandled'
import { app, nativeTheme } from 'electron'
import * as Sentry from '@sentry/electron'
import { config as dotenvConfig } from 'dotenv'
import { startUpdaterListeners } from './updaterListeners'
import fs from 'fs'
import { isWin, kkAutoLauncher, settings } from './globalState'
import { startIpcListeners } from './ipcListeners'
import { startAppListeners } from './appListeners'

// unhandled()

if (!app.requestSingleInstanceLock()) app.exit()

log.transports.file.level = 'debug'

Sentry.init({ dsn: process.env.SENTRY_DSN })

dotenvConfig()

startAppListeners()
startIpcListeners()
startUpdaterListeners()

//Auto launch on startup
if (!isDev && settings.shouldAutoLunch) {
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
} catch (_) {}

if (process.defaultApp) {
  app.setAsDefaultProtocolClient('keepkey')
}
