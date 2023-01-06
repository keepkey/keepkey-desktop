import 'lib/polyfills'
import '../../keepkey-desktop/src/comlinkTransferHandlers'

import { App } from 'App'
import { AppProviders } from 'AppProviders'
import { ipcListeners } from 'electron-shim'
import unhandled from 'electron-unhandled'
import { renderConsoleArt } from 'lib/consoleArt'
import { logger } from 'lib/logger'
import { reportWebVitals } from 'lib/reportWebVitals'
import React from 'react'
import { createRoot } from 'react-dom/client'

unhandled()

ipcListeners.appVersion().then(version => (document.title = `KeepKey Desktop (v${version})`))

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(vitals => logger.debug({ vitals }, 'Web Vitals'))

// Because ASCII Art
renderConsoleArt()
