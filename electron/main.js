/**
 *
 * =====================================================================================
 *  =  ====  ===================  ====  ===================     ==  =====================
 *  =  ===  ====================  ===  ===================  ===  =  =====================
 *  =  ==  =====================  ==  ===================  =======  =================  ==
 *  =  =  =====   ===   ==    ==  =  =====   ==  =  =====  =======  =  ==   ==  = ==    =
 *  =     ====  =  =  =  =  =  =     ====  =  =  =  =====  =======  ====  =  =     ==  ==
 *  =  ==  ===     =     =  =  =  ==  ===     ==    =====  =======  =  =     =  =  ==  ==
 *  =  ===  ==  ====  ====    ==  ===  ==  =======  =====  =======  =  =  ====  =  ==  ==
 *  =  ====  =  =  =  =  =  ====  ====  =  =  =  =  ======  ===  =  =  =  =  =  =  ==  ==
 *  =  ====  ==   ===   ==  ====  ====  ==   ===   ========     ==  =  ==   ==  =  ==   =
 *  =====================================================================================
 *  KeepKey client
 *    - A companion application for the keepkey device
 *
 *  Features:
 *    * KeepKey bridge (express server on port: localhost:1646
 *    * invocation support (web app pairing similar UX to BEX embedding like Metamask)
 *
 *  Pioneer Invocation API
 *    docs: https://ahead-respect-850.notion.site/Invocation-Protocol-3cb988fa2c3747d4a4a63016271cb3f4
 *
 *  Notes:
 *    This will "pair" a users wallet with the pioneer api.
 *      Note: This is exporting a pubkey wallet of the users connected wallet and storing it service side
 *
 *    This pubkey wallet is also available to be read by any paired apikey
 *              (generally stored in an Web Applications local storage).
 *
 *    paired API keys allow any application to request payments from the users wallet
 *      * all payment requests are queued in this main process
 *          and must receive manual user approval before signing
 *
 *    P.S. use a keepkey!
 *                                                -Highlander
 */

const core = require('@shapeshiftoss/hdwallet-core')
const KK = require('@shapeshiftoss/hdwallet-keepkey-nodewebusb')

const TAG = ' | KK-MAIN | '
const log = require('electron-log')
const { app, Menu, Tray, BrowserWindow, nativeTheme, ipcMain, nativeImage } = require('electron')
const usb = require('usb')
const AutoLaunch = require('auto-launch')
// eslint-disable-next-line react-hooks/rules-of-hooks
const adapter = KK.NodeWebUSBKeepKeyAdapter.useKeyring(new core.Keyring())
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const appExpress = express()
appExpress.use(cors())
appExpress.use(bodyParser.urlencoded({ extended: false }))
appExpress.use(bodyParser.json())
const path = require('path')
const isDev = require('electron-is-dev')
let wait = require('wait-promise');
let sleep = wait.sleep;
let server = {}
let tray = {}
let STATE = 0
let USERNAME
let PIONEER_API
let isQuitting = false
let eventIPC = {}

const assetsDirectory = path.join(__dirname, 'assets')
const EVENT_LOG = []
let SIGNED_TX = null
/*
    Electron Settings
 */

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) {}

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow
const lightDark = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'

const menuTemplate = [
  {
    label: 'Bridge Not Running',
    enabled: false,
    type: 'normal',
    icon: path.join(assetsDirectory, 'status/unknown.png')
  },
  { label: '', type: 'separator' },
  {
    label: 'Start Bridge',
    click: function () {
      start_bridge(eventIPC)
      log.info('start bridge!!')
    },
    enabled: true
  },
  {
    label: 'Stop Bridge',
    enabled: false,
    click: function () {
      log.info('stop bridge')
      stop_bridge(eventIPC)
    }
  },
  //
  { label: '', type: 'separator' },
  {
    label: 'Toggle App',
    click: function () {
      log.info('show App')
      if (mainWindow.isVisible()) {
        mainWindow.hide()
        app.dock.hide()
      } else {
        mainWindow.show()
        app.dock.hide()
      }
    }
  },
  {
    label: 'Disable Auto Launch',
    click: function () {
      log.info('show App')
      //kkAutoLauncher.disable()
    }
  },
  {
    label: 'Quit KeepKey Bridge',
    type: 'normal',
    click: function () {
      log.info('quit bridge')
      app.quit()
      process.exit(0)
    }
  }
]

const createTray = eventIpc => {
  eventIPC = eventIpc
  const trayIcon = `${lightDark}/keepKey/unknown.png`
  tray = new Tray(nativeImage.createFromPath(path.join(assetsDirectory, trayIcon)))
  const contextMenu = Menu.buildFromTemplate(menuTemplate)
  tray.setContextMenu(contextMenu)
}

const updateMenu = status => {
  let icon = 'unknown'
  // eslint-disable-next-line default-case
  switch (status) {
    case -1:
      menuTemplate[0].label = 'Error'
      menuTemplate[0].icon = path.join(assetsDirectory, 'status/error.png')
      icon = 'error'
      break
    case 0:
      menuTemplate[0].label = 'Initializing'
      menuTemplate[0].icon = path.join(assetsDirectory, 'status/unknown.png')
      icon = 'unknown'
      break
    case 1:
      menuTemplate[0].label = 'No Devices'
      menuTemplate[0].icon = path.join(assetsDirectory, 'status/unknown.png')
      icon = 'unknown'
      break
    case 2:
      menuTemplate[0].label = 'Bridge Not Running'
      menuTemplate[0].icon = path.join(assetsDirectory, 'status/unknown.png')
      icon = 'unknown'
      break
    case 3:
      menuTemplate[0].label = 'Bridge Running'
      menuTemplate[0].icon = path.join(assetsDirectory, 'status/success.png')
      menuTemplate[2].enabled = false
      menuTemplate[3].enabled = true
      icon = 'success'
      break
  }
  if (icon) {
    const updatedMenu = Menu.buildFromTemplate(menuTemplate)
    tray.setContextMenu(updatedMenu)
    tray.setImage(
      nativeImage.createFromPath(path.join(assetsDirectory, `${lightDark}/keepKey/${icon}.png`))
    )
  }
}

function createWindow() {
  /**
   * Menu Bar
   */
  log.info('Creating window!')

  //Auto launch on startup
  let kkAutoLauncher = new AutoLaunch({
    name: 'keepkey-client',
    path: '/Applications/kkAutoLauncher.app'
  })
  kkAutoLauncher.enable()
  kkAutoLauncher
    .isEnabled()
    .then(function (isEnabled) {
      if (isEnabled) {
        return
      }
      kkAutoLauncher.enable()
    })
    .catch(function () {
      log.error('failed to enable auto launch: ', kkAutoLauncher)
    })

  /**
   * Initial window options
   *
   * more options: https://www.electronjs.org/docs/api/browser-window
   */
  let mainWindow = new BrowserWindow({
    width: 460,
    height: 780,
    show: false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true
    }
  })
  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`
  log.info('startURL: ', startURL)

  mainWindow.loadURL(startURL)

  mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.on('closed', () => {
    mainWindow = null
    stop_bridge()
  })

  // mainWindow.on("closed", () => {

  // });
}

app.setAsDefaultProtocolClient('keepkey')
// Export so you can access it from the renderer thread

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('before-quit', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isQuitting = true
})

/*

  KeepKey Status codes

  state : status
  ---------------
     -1 : error
      0 : preInit
      1 : no devices
      2 : device connected
      3 : bridge online


 */

let STATUS = 'preInit'

const start_bridge = async function (event) {
  try {
    let device
    try {
      device = await adapter.getDevice()
    } catch (e) {
      STATE = 1
      STATUS = `no devices`
      event.sender.send('setKeepKeyState', { state: STATE })
      event.sender.send('setKeepKeyStatus', { status: STATUS })
      log.info(tray)
    }

    if (device) {
      let transport = await adapter.getTransportDelegate(device)
      await transport.connect?.()
      STATE = 2
      STATUS = 'keepkey connected'
      event.sender.send('setKeepKeyState', { state: STATE })
      event.sender.send('setKeepKeyStatus', { status: STATUS })

      let API_PORT = process.env['API_PORT_BRIDGE'] || '1646'

      /*
          KeepKey bridge

          TODO: swagger spec
            host swaggerUI for devs

          endpoints:
            raw i/o keepkey bridge:
            status:
            pubkeys:
            sign:


       */
      appExpress.all('/exchange/device', async function (req, res, next) {
        try {
          if (req.method === 'GET') {
            let resp = await transport.readChunk()
            let output = {
              data: Buffer.from(resp).toString('hex')
            }
            log.info('output: ', output)
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

      //status
      appExpress.all('/status', async function (req, res, next) {
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

      //TODO pubkeys

      //pair pioneer app
      appExpress.all('/pair/:code', async function (req, res, next) {
        try {
          if (req.method === 'GET') {
            let code = req.params.code
            // let host = req.headers.host
            if (!mainWindow.isVisible()) {
              mainWindow.show()
              app.dock.hide()
            }
            //mainWindow.setAlwaysOnTop(true)
            //event.sender.send('pairingCode', { payload: { code, host } })
            //TODO hold till approval
            let respPair = await PIONEER_API.instance.Pair(null, { code })
            log.info('respPair: ', respPair)
            if (res.status)
              res.status(200).json({
                success: true,
                username: USERNAME,
                code
              })
          }
          next()
        } catch (e) {
          throw e
        }
      })

      //userInfo
      appExpress.all('/user', async function (req, res, next) {
        try {
          if (req.method === 'GET') {
            let userInfo = await PIONEER_API.instance.User()
            res.status(200).json(userInfo.data)
          }
          next()
        } catch (e) {
          throw e
        }
      })

      //sign
      appExpress.all('/sign', async function (req, res, next) {
        try {
          console.log("checkpoint1: ")
          if (req.method === 'POST') {
            let body = req.body
            console.log("body: ",body)
            event.sender.send('signTx', { payload: body })
            //hold till signed
            while(!SIGNED_TX){
              await sleep(300)
            }
            res.status(200).json({ success: true, status: 'signed', signedTx:SIGNED_TX })
            SIGNED_TX = null
          }
          next()
        } catch (e) {
          throw e
        }
      })

      //catchall
      appExpress.use((err, req, res) => {
        const { status = 500, message = 'something went wrong. ', data = {} } = err
        //log.info(req.body, { status: status, message: message, data: data })
        try {
          res.status(status).json({ message, data })
        } catch (e) {}
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
    } else {
      log.info('Can not start! waiting for device connect')
    }
  } catch (e) {
    log.error(e)
  }
}

const stop_bridge = async function (event) {
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
  } catch (e) {
    log.error(e)
  }
}

ipcMain.on('onStopBridge', async event => {
  const tag = TAG + ' | onStartBridge | '
  try {
    stop_bridge(event)
  } catch (e) {
    log.error(tag, e)
  }
})

ipcMain.on('onStartBridge', async event => {
  const tag = TAG + ' | onStartBridge | '
  try {
    start_bridge(event)
  } catch (e) {
    log.error(tag, e)
  }
})

// const start_pioneer = async function (event) {
//   const tag = TAG + ' | start_pioneer | '
//   try {
//     let config = Config.getConfig()
//     if(!config) config = await Config.innitConfig('english')
//     config.spec = process.env['REACT_APP_URL_PIONEER_SPEC']
//     if (!config.username) throw Error('Failed to init username!')
//     if (!config.queryKey) throw Error('Failed to init querKey!')
//     if (!config.spec) throw Error('Failed to init spec!')
//
//     let app = new SDK.SDK(spec,config,true)
//     let events = await app.startSocket()
//     let seedChains = ['bitcoin','ethereum','thorchain','litecoin','bitcoincash','osmosis']
//     PIONEER_API = await app.init(seedChains)
//     //get user
//
//     //if no user, register
//     //get paths
//     let paths = await app.getPaths()
//     console.log('paths: ',paths)
//     //get pubkeys
//     event.sender.send('getPubkeys', { paths })
//   } catch (e) {
//     log.error(e)
//   }
// }

ipcMain.on('onStartApp', async event => {
  const tag = TAG + ' | onStartApp | '
  try {
    //log.info(tag, 'event: onStartApp: ', event)

    // try {
    //   start_pioneer()
    // } catch (e) {
    //   log.error('failed to connect to pioneer server e: ', e)
    // }

    try {
      createTray(event)
    } catch (e) {
      log.error('Failed to create tray! e: ', e)
    }
    try {
      start_bridge(event)
    } catch (e) {
      log.error('Failed to start_bridge! e: ', e)
    }

    usb.on('attach', function (device) {
      log.info('attach device: ', device)
      event.sender.send('attach', { device })
      start_bridge(event)
    })

    usb.on('detach', function (device) {
      log.info('detach device: ', device)
      event.sender.send('detach', { device })
      stop_bridge(event)
    })
  } catch (e) {
    log.error('e: ', e)
    log.error(tag, e)
  }
})
