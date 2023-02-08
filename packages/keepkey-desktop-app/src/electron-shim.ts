import * as Comlink from 'comlink'
import { electronEndpoint } from 'comlink-electron-endpoint/renderer'

import type { IpcListeners } from '../../keepkey-desktop/src/types'

export const ipcListeners = (() => {
  const { port1, port2 } = new MessageChannel()
  window.postMessage(
    {
      type: '@app/get-ipc-listeners',
      payload: port1,
    },
    '*',
    [port1],
  )
  return Comlink.wrap<IpcListeners>(electronEndpoint(port2))
})()
