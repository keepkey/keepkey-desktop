/// <reference types="node" />

import * as fs from 'fs'
import * as path from 'path'

const workspacePath = path.resolve(__dirname, '..')
const buildPath = path.join(workspacePath, 'dist')

// Use require.resolve instead of pnpapi
const keepkeySdkServerPath = require.resolve('keepkey-sdk-server/package.json', { paths: [workspacePath] })
const specPath = path.join(
  path.dirname(keepkeySdkServerPath),
  'dist/swagger.json',
)

fs.mkdirSync(buildPath, { recursive: true })
fs.copyFileSync(specPath, path.join(buildPath, 'swagger.json'))
