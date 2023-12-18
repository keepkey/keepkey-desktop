/// <reference types="electron" />

const electron = require('electron')
// const unhandled = require('electron-unhandled')

window.addEventListener('message', ev => {
  /** @type unknown */
  const data = ev.data
  if (
    data &&
    typeof data === 'object' &&
    'type' in data &&
    typeof data.type === 'string' &&
    'payload' in data
  ) {
    if (data.type === '@app/get-ipc-listeners' && data.payload instanceof MessagePort) {
      console.info('preload: forwarding @app/get-ipc-listeners', data)
      electron.ipcRenderer.postMessage('@app/get-ipc-listeners', undefined, [data.payload])
    } else if (
      data.type === '@app/register-render-listeners' &&
      data.payload instanceof MessagePort
    ) {
      console.info('preload: forwarding @app/register-render-listeners', data)
      electron.ipcRenderer.postMessage('@app/register-render-listeners', undefined, [data.payload])
    }
  }
})

contextBridge.exposeInMainWorld('keepkey', {
  shapeshiftlogin: () => ipcRenderer.invoke('@app/shapeshift-login'),
})

// unhandled()
