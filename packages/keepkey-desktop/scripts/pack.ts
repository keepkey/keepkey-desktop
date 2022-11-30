import * as electronBuilder from 'electron-builder'

import { build } from './build'

export const pack = async () => {
  await build()

  await electronBuilder.build(
    (() => {
      switch (process.platform) {
        case 'linux':
          return {
            linux: [],
          }
        case 'darwin':
          return {
            mac: ['universal'],
          }
        case 'win32':
          return {
            win: [],
          }
        default:
          throw new Error(`unsupported platform '${process.platform}'`)
      }
    })(),
  )
}

if (require.main === module) {
  pack().catch(err => console.error(err))
}
