/// <reference types="node" />

import * as fs from 'fs'
import * as path from 'path'
import * as pnpapi from 'pnpapi'

const workspacePath = path.resolve(__dirname, '..')
const buildPath = path.join(workspacePath, 'dist')
const specPath = path.join(
  pnpapi.resolveToUnqualified('keepkey-sdk-server', workspacePath)!,
  'dist/swagger.json',
)

fs.mkdirSync(buildPath, { recursive: true })
fs.copyFileSync(specPath, path.join(buildPath, 'swagger.json'))
