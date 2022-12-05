/// <reference types="electron" />

import * as Comlink from 'comlink'
import { electronEndpoint } from 'comlink-electron-endpoint/renderer'

import type { IpcListeners } from '../../keepkey-desktop/src/types'

const electron = require('electron')

// eslint-disable-next-line import/no-default-export
export default electron

export const ipcRenderer = electron.ipcRenderer

export const ipcListeners = (() => {
  const { port1, port2 } = new MessageChannel()
  electron.ipcRenderer.postMessage('@app/get-ipc-listeners', undefined, [port1])
  return Comlink.wrap<IpcListeners>(electronEndpoint(port2))
})()
