/// <reference types="node" />

import * as fs from 'fs'
import * as path from 'path'

const workspacePath = path.resolve(__dirname, '..')
const buildPath = path.join(workspacePath, 'dist')
const specPath = path.join(
  path.resolve(workspacePath, '..', 'keepkey-sdk-server'),
  'dist/swagger.json',
)

fs.mkdirSync(buildPath, { recursive: true })
fs.copyFileSync(specPath, path.join(buildPath, 'swagger.json'))
