import * as Sentry from '@sentry/electron'
import { config as dotenvConfig } from 'dotenv'
import { app, nativeTheme } from 'electron'
import isDev from 'electron-is-dev'
import log from 'electron-log'
import fs from 'fs'
import * as foo from 'screenshot-desktop'

import { startAppListeners } from './appListeners'
import { isWin, kkAutoLauncher, settings } from './globalState'
import { startIpcListeners } from './ipcListeners'
import { startUpdaterListeners } from './updaterListeners'

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
} catch {}

if (process.defaultApp) {
  app.setAsDefaultProtocolClient('keepkey')
}

foo.listDisplays()
