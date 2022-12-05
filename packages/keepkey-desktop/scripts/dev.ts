/// <reference types="node" />

import * as path from 'path'
import * as electronBuilder from 'electron-builder'
import * as childProcess from 'child_process'

import { build } from './build'

const workspacePath = path.resolve(__dirname, '..')
const distPath = path.join(workspacePath, 'dist')

export const dev = async () => {
  process.env.NODE_ENV ??= 'development'

  await build()

  await electronBuilder.build({
    dir: true,
  })

  console.log('Launching unpacked app...')

  const child = (() => {
    switch (process.platform) {
      case 'linux':
        return childProcess.spawn(path.join(distPath, 'linux-unpacked/keepkey-desktop'))
      case 'darwin':
        return childProcess.spawn(
          path.join(distPath, 'mac-arm64/KeepKey Desktop.app/Contents/MacOS/KeepKey Desktop'),
        )
      case 'win32':
        return childProcess.spawn(path.join(distPath, 'win-unpacked/KeepKey Desktop.exe'))
      default:
        throw new Error(`unsupported platform '${process.platform}'`)
    }
  })()

  child.stdout.on('data', (data) => {
    console.log(`stdout [electron main] : ${data}`);
  })

  child.stderr.on('data', (data) => {
    console.error(`stderr [electron main] : ${data}`);
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

