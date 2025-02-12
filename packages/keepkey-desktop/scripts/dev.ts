/// <reference types="node" />

import * as childProcess from 'child_process'
import * as electronBuilder from 'electron-builder'
import * as fs from 'fs'
import * as path from 'path'

import { build } from './build'

const workspacePath = path.resolve(__dirname, '..')
const distPath = path.join(workspacePath, 'dist')

export const dev = async () => {
  process.env.NODE_ENV ??= 'development'
  process.env.ELECTRON_IS_DEV ??= '1'

  await build()

  // only build dir in dev, speeds up the process
  await electronBuilder.build({
    dir: true,
    x64: false,
    ia32: false,
    armv7l: false,
    arm64: false,
    universal: false,
  })

  console.log('Launching unpacked app...')

  const child = (() => {
    switch (process.platform) {
      case 'linux':
        return childProcess.spawn(path.join(distPath, 'linux-unpacked/keepkey-desktop'))
      case 'darwin': {
        const intelMacPath = path.join(
          distPath,
          'mac/KeepKey Desktop.app/Contents/MacOS/KeepKey Desktop',
        )
        const armMacPath = path.join(
          distPath,
          'mac-arm64/KeepKey Desktop.app/Contents/MacOS/KeepKey Desktop',
        )
        const macPath = fs.existsSync(armMacPath) ? armMacPath : intelMacPath
        return childProcess.spawn(macPath)
      }
      case 'win32':
        return childProcess.spawn(path.join(distPath, 'win-unpacked/KeepKey Desktop.exe'))
      default:
        throw new Error(`unsupported platform '${process.platform}'`)
    }
  })()

  child.stdout.on('data', data => {
    console.log(`stdout [electron main] : ${data}`)
  })

  child.stderr.on('data', data => {
    console.error(`stderr [electron main] : ${data}`)
    console.error('stderr [electron main] : ', JSON.stringify(data))
  })

  process.on('SIGINT', () => {
    if (child.exitCode !== null) return
    if (!child.killed) {
      console.log('Sending SIGTERM...')
      child.kill('SIGTERM')
    } else {
      console.log('Sending SIGKILL...')
      child.kill('SIGKILL')
    }
  })
}

if (require.main === module) {
  dev().catch(err => console.error(err))
}
