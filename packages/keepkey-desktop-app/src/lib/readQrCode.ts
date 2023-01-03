import { ipcRenderer } from 'electron-shim'
import { v4 as uuidv4 } from 'uuid'

export const readQrCode = () =>
  new Promise<string>((resolve, reject) => {
    const nonce = uuidv4()
    ipcRenderer.send(`@app/read-qr`, { nonce })
    ipcRenderer.once(`@app/read-qr-${nonce}`, (_e: any, data: any) => {
      if (data.nonce !== nonce) return reject('Lost')
      if (!data.success) return reject(data.reason)
      resolve(data.result)
    })
  })
