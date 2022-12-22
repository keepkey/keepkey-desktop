import { app } from 'electron'
import * as fs from 'fs'
import path from 'path'

import type { BridgeLog } from './types'

export class BridgeLogger {
  private logs: BridgeLog[] = new Array<BridgeLog>()
  public logPath = path.join(app.getPath('logs'), './bridge.json')

  constructor() {
    try {
      if (fs.existsSync(this.logPath)) {
        let data: string | BridgeLog[] = fs.readFileSync(this.logPath).toString()
        if (!data || data === '' || data === ' ' || data.length === 0) {
          this.logs = new Array<BridgeLog>()
        } else {
          data = JSON.parse(data)
          if (!data) this.logs = new Array<BridgeLog>()
          this.logs = data as BridgeLog[]
        }
      }
    } catch (e) {
      console.error('Error Setting Up BridgeLogger:', e)
    }
  }

  log(data: BridgeLog) {
    this.logs.push(data)
  }

  async saveLogs(): Promise<void> {
    const stringifiedLogs = JSON.stringify(this.logs)
    if (!stringifiedLogs) return
    await fs.promises.writeFile(this.logPath, stringifiedLogs)
  }

  fetchLogs(serviceKey: string) {
    const logs = this.logs.filter(log => log.serviceKey === serviceKey)
    return logs
  }
}
