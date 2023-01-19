import { app, ipcMain } from 'electron'
import {
  bridgeLogger,
  db,
  ipcQueue,
  isWalletBridgeRunning,
  kkStateController,
  setRenderListenersReady,
  settings,
  windows,
} from './globalState'
import {
  downloadFirmware,
  getBetaFirmwareData,
  getLatestFirmwareData,
  loadFirmware,
} from './helpers/kk-state-controller/firmwareUtils'
import { queueIpcEvent, scanScreenForQR } from './helpers/utils'
import log from 'electron-log'
import { sleep } from 'wait-promise'
import { UPDATE_FIRMWARE } from 'helpers/kk-state-controller'

export const startIpcListeners = () => {
  ipcMain.on('@app/restart', () => {
    app.relaunch()
    app.exit()
  })

  ipcMain.on('@app/exit', () => {
    app.exit()
  })

  ipcMain.on('@app/version', event => {
    event.sender.send('@app/version', app.getVersion())
  })

  ipcMain.on('@app/pairings', () => {
    db.find({ type: 'pairing' }, (_err, docs) => {
      if (windows.mainWindow && !windows.mainWindow.isDestroyed())
        windows.mainWindow.webContents.send('@app/pairings', docs)
    })
  })

  ipcMain.on('@walletconnect/pairing', (_event, data) => {
    db.findOne(
      {
        type: 'pairing',
        serviceName: data.serviceName,
        serviceHomePage: data.serviceHomePage,
        pairingType: 'walletconnect',
      },
      (_err, doc) => {
        if (doc) {
          db.update(
            {
              type: 'pairing',
              serviceName: data.serviceName,
              serviceHomePage: data.serviceHomePage,
              pairingType: 'walletconnect',
            },
            {
              type: 'pairing',
              addedOn: Date.now(),
              serviceName: data.serviceName,
              serviceImageUrl: data.serviceImageUrl,
              serviceHomePage: data.serviceHomePage,
              pairingType: 'walletconnect',
            },
          )
        } else {
          db.insert({
            type: 'pairing',
            addedOn: Date.now(),
            serviceName: data.serviceName,
            serviceImageUrl: data.serviceImageUrl,
            serviceHomePage: data.serviceHomePage,
            pairingType: 'walletconnect',
          })
        }
      },
    )
  })

  ipcMain.on('@bridge/service-details', (_event, serviceKey) => {
    db.findOne(
      {
        type: 'service',
        serviceKey,
      },
      (_err, doc) => {
        if (!doc) return
        const logs = bridgeLogger.fetchLogs(serviceKey)
        if (windows.mainWindow && !windows.mainWindow.isDestroyed())
          windows.mainWindow.webContents.send('@bridge/service-details', {
            app: doc,
            logs,
          })
      },
    )
  })

  ipcMain.on('@bridge/connected', () => {
    if (windows.mainWindow && !windows.mainWindow.isDestroyed())
      windows.mainWindow.webContents.send('@bridge/connected', isWalletBridgeRunning())
  })

  ipcMain.on('@bridge/service-name', (_event, serviceKey) => {
    db.findOne(
      {
        type: 'service',
        serviceKey,
      },
      (_err, doc) => {
        if (!doc) return
        if (windows.mainWindow && !windows.mainWindow.isDestroyed())
          windows.mainWindow.webContents.send('@bridge/service-name', doc.serviceName)
      },
    )
  })

  // web render thread has indicated it is ready to receive ipc messages
  // send any that have queued since then
  ipcMain.on('renderListenersReady', async () => {
    log.info('renderListenersReady')
    setRenderListenersReady(true)
    ipcQueue.forEach(item => {
      log.info('ipc event called from queue', item)
      if (windows.mainWindow && !windows.mainWindow.isDestroyed())
        windows.mainWindow.webContents.send(item.eventName, item.args)
    })
    ipcQueue.length = 0
  })

  // send paired apps when requested
  ipcMain.on('@bridge/paired-apps', () => {
    db.find({ type: 'service' }, (_err, docs) => {
      queueIpcEvent('@bridge/paired-apps', docs)
    })
  })

  // used only for implicitly pairing the KeepKey web app
  ipcMain.on(`@bridge/add-service`, (_event, data) => {
    db.insert({
      type: 'service',
      isKeepKeyDesktop: true,
      addedOn: Date.now(),
      serviceName: data.serviceName,
      serviceImageUrl: data.serviceImageUrl,
      serviceHomePage: data.serviceHomePage,
      pairingType: 'walletconnect',
    })
  })

  ipcMain.on('@bridge/service-details', (_event, serviceKey) => {
    db.findOne(
      {
        type: 'service',
        serviceKey,
      },
      (_err, doc) => {
        if (!doc) return
        const logs = bridgeLogger.fetchLogs(serviceKey)
        if (windows.mainWindow && !windows.mainWindow.isDestroyed())
          windows.mainWindow.webContents.send('@bridge/service-details', {
            app: doc,
            logs,
          })
      },
    )
  })

  ipcMain.on('@bridge/connected', () => {
    if (windows.mainWindow && !windows.mainWindow.isDestroyed())
      windows.mainWindow.webContents.send('@bridge/connected', isWalletBridgeRunning())
  })

  ipcMain.on('@bridge/service-name', (_event, serviceKey) => {
    db.findOne(
      {
        type: 'service',
        serviceKey,
      },
      (_err, doc) => {
        if (!doc) return
        if (windows.mainWindow && !windows.mainWindow.isDestroyed())
          windows.mainWindow.webContents.send('@bridge/service-name', doc.serviceName)
      },
    )
  })

  // web render thread has indicated it is ready to receive ipc messages
  // send any that have queued since then
  ipcMain.on('renderListenersReady', async () => {
    log.info('renderListenersReady')
    setRenderListenersReady(true)
    ipcQueue.forEach(item => {
      log.info('ipc event called from queue', item)
      if (windows.mainWindow && !windows.mainWindow.isDestroyed())
        windows.mainWindow.webContents.send(item.eventName, item.args)
    })
    ipcQueue.length = 0
  })

  // send paired apps when requested
  ipcMain.on('@bridge/paired-apps', () => {
    db.find({ type: 'service' }, (_err, docs) => {
      queueIpcEvent('@bridge/paired-apps', docs)
    })
  })

  // used only for implicitly pairing the KeepKey web app
  ipcMain.on(`@bridge/add-service`, (_event, data) => {
    db.insert({
      type: 'service',
      isKeepKeyDesktop: true,
      addedOn: Date.now(),
      ...data,
    })
  })

  // used for unpairing apps
  ipcMain.on(`@bridge/remove-service`, (_event, data) => {
    db.remove({ ...data })
  })

  ipcMain.on('@keepkey/update-firmware', async event => {
    let result = settings.allowBetaFirmware
      ? await getBetaFirmwareData()
      : await getLatestFirmwareData()
    let firmware = await downloadFirmware(result.firmware.url)
    if (!firmware) throw Error('Failed to load firmware from url!')
    await loadFirmware(kkStateController.wallet, firmware)
    event.sender.send('onCompleteFirmwareUpload', {
      bootloader: true,
      success: true,
    })
    app.relaunch()
    app.quit()
    await sleep(250)
    app.exit()
  })

  ipcMain.on('@keepkey/update-bootloader', async event => {
    let result = settings.allowBetaFirmware
      ? await getBetaFirmwareData()
      : await getLatestFirmwareData()
    let firmware = await downloadFirmware(result.bootloader.url)
    await loadFirmware(kkStateController.wallet, firmware)
    event.sender.send('onCompleteBootloaderUpload', {
      bootloader: true,
      success: true,
    })
  })

  ipcMain.on('@keepkey/skip-update', async event => {
    kkStateController.skipUpdate()
    event.sender.send('@keepkey/update-skipped')
  })

  ipcMain.on('@app/read-qr', async (event, data) => {
    if (!data.nonce) return

    const scanned = await scanScreenForQR()
    if (!scanned)
      return event.sender.send(`@app/read-qr-${data.nonce}`, {
        success: false,
        reason: 'Unable to scan QR',
        nonce: data.nonce,
      })

    event.sender.send(`@app/read-qr-${data.nonce}`, {
      success: true,
      result: scanned,
      nonce: data.nonce,
    })
  })
}
