/// <reference types="node" />

import 'dotenv/config'

import * as fs from 'fs'
import * as path from 'path'
import * as esbuild from 'esbuild'
import * as pnpapi from 'pnpapi'
import { generateSpecAndRoutes } from '@tsoa/cli'
import { dirnamePlugin, workspacePlugin } from '@keepkey/common-esbuild-bits'

process.env.NODE_ENV ??= 'production'
const isDev = process.env.NODE_ENV === 'production'

const workspacePath = path.resolve(__dirname, '..')
const buildPath = path.join(workspacePath, 'build')
const rootPath = path.normalize(path.join(workspacePath, '../..'))
const appSource = path.join(
  pnpapi.resolveToUnqualified('keepkey-desktop-app', workspacePath)!,
  'build',
)
const assetsSource = path.join(workspacePath, 'assets')

const tsoaPath = path.join(buildPath, 'api')
const appPath = path.join(buildPath, 'app')
const assetsPath = path.join(buildPath, 'assets')
const nativeModulesPath = path.join(buildPath, 'native_modules')

const sanitizeBuildDir = async () => {
  await fs.promises.rm(buildPath, { recursive: true, force: true })
  await fs.promises.mkdir(buildPath, { recursive: true })
  await fs.promises.mkdir(tsoaPath, { recursive: true })
  await fs.promises.mkdir(appPath, { recursive: true })
  await fs.promises.mkdir(assetsPath, { recursive: true })
  await fs.promises.mkdir(nativeModulesPath, { recursive: true })
}

const buildApi = async () => {
  await generateSpecAndRoutes({ json: true })
}

const collectDefines = async () => {
  const defines = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k]) => ['NODE_DEBUG', 'NODE_ENV', 'LOG_LEVEL', 'DEBUG', 'PUBLIC_URL'].includes(k))
      .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]),
  ) as Record<string, string>
  console.info('Embedded environment vars:', defines)
  return defines
}

const copyAppDir = async () => {
  await fs.promises.cp(appSource, appPath, {
    dereference: true,
    recursive: true,
  })
}

const copyAssetsDir = async () => {
  await fs.promises.cp(assetsSource, assetsPath, {
    dereference: true,
    recursive: true,
  })
}

const copyPrebuilds = async (packages: string[]) => {
  await Promise.all(
    packages.map(async x => {
      const prebuildsSource = pnpapi.resolveToUnqualified(`${x}/prebuilds`, workspacePath)!
      const targetPath = path.join(nativeModulesPath, x, 'prebuilds')
      await fs.promises.mkdir(targetPath, { recursive: true })
      await fs.promises.cp(prebuildsSource, targetPath, {
        dereference: true,
        recursive: true,
      })
    }),
  )
}

const copyBindings = async (items: [source: string, target: string][]) => {
  await Promise.all(
    items.map(async ([source, target]) => {
      const targetPath = pnpapi.resolveToUnqualified(source, workspacePath)!
      if (
        !(await fs.promises
          .stat(targetPath)
          .then(() => true)
          .catch(() => false))
      )
        return

      await fs.promises.mkdir(path.dirname(path.join(buildPath, target)), { recursive: true })
      await fs.promises.copyFile(targetPath, path.join(buildPath, target))
    }),
  )
}

const runEsbuild = async (
  defines: Record<string, string>,
  dirnameRules: Parameters<typeof dirnamePlugin>[0],
) => {
  return esbuild.build({
    bundle: true,
    absWorkingDir: rootPath,
    outdir: buildPath,
    external: ['/resources/*', 'electron', 'pnpapi'],
    loader: {
      '.png': 'file',
      '.svg': 'file',
      '.jpg': 'file',
      '.mp3': 'file',
      '.wav': 'file',
    },
    entryPoints: [path.join(workspacePath, '/src/main.ts')],
    plugins: await Promise.all([
      dirnamePlugin(dirnameRules),
      workspacePlugin(rootPath, workspacePath),
    ]),
    sourcemap: isDev ? 'linked' : undefined,
    legalComments: isDev ? 'linked' : undefined,
    minify: !isDev,
    format: 'cjs',
    platform: 'node',
    assetNames: 'static/media/[name].[hash]',
    charset: 'utf8',
    metafile: true,
    chunkNames: 'static/js/[hash].chunk',
    define: defines,
    target: 'es2020',
    treeShaking: true,
  })
}

export const build = async () => {
  await sanitizeBuildDir()

  await buildApi()

  const esbuild = collectDefines().then(defines =>
    runEsbuild(
      Object.assign(
        {},
        {
          window: undefined,
          self: undefined,
        },
        defines,
      ),
      [
        ['node_modules/keccak/bindings.js', 'native_modules/keccak'],
        ['node_modules/utf-8-validate/index.js', 'native_modules/utf-8-validate'],
        ['node_modules/secp256k1/bindings.js', 'native_modules/secp256k1'],
        ['node_modules/bufferutil/index.js', 'native_modules/bufferutil'],
        ['node_modules/usb/dist/usb/bindings.js', 'native_modules/usb'],
        ['node_modules/bigint-buffer/dist/node.js', 'native_modules/bigint-buffer'],
        ['node_modules/node-hid/nodehid.js', 'native_modules/node-hid'],
        ['node_modules/tiny-secp256k1/native.js', 'native_modules/tiny-secp256k1'],
        ['node_modules/fsevents/fsevents.js', 'native_modules/fsevents'],
        ['node_modules/fswin/index.js', 'native_modules/fswin'],
      ],
    ),
  )

  await Promise.all([
    esbuild,
    copyPrebuilds(['keccak', 'utf-8-validate', 'secp256k1', 'bufferutil', 'usb']),
    copyBindings([
      [
        'bigint-buffer/build/Release/bigint_buffer.node',
        'native_modules/bigint-buffer/build/Release/bigint_buffer.node',
      ],
      ['node-hid/build/Release/HID.node', 'native_modules/node-hid/build/Release/HID.node'],
      [
        'node-hid/build/Release/HID_hidraw.node',
        'native_modules/node-hid/build/Release/HID_hidraw.node',
      ],
      [
        'tiny-secp256k1/build/Release/secp256k1.node',
        'native_modules/tiny-secp256k1/build/Release/secp256k1.node',
      ],
      ['fsevents/fsevents.node', 'native_modules/fsevents/fsevents.node'],
      ['fswin/ia32/fswin.node', 'native_modules/fswin/ia32/fswin.node'],
      ['fswin/arm64/fswin.node', 'native_modules/fswin/arm64/fswin.node'],
      ['fswin/x64/fswin.node', 'native_modules/fswin/x64/fswin.node'],
    ]),
    copyAppDir(),
    copyAssetsDir(),
    esbuild.then(async x => {
      if (isDev) {
        await fs.promises.writeFile(
          path.join(buildPath, 'metafile.json'),
          JSON.stringify(x.metafile, null, 2),
        )
      }
    }),
  ])
}

if (require.main === module) {
  build().catch(err => console.error(err))
}
