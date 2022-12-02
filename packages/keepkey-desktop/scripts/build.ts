import 'dotenv/config'

import * as fs from 'fs'
import * as path from 'path'
import * as esbuild from 'esbuild'
import * as pnpapi from 'pnpapi'
import { generateSpecAndRoutes } from '@tsoa/cli'

process.env.NODE_ENV ??= 'production'

const workspacePath = path.resolve(__dirname, '..')
const buildPath = path.join(workspacePath, 'build')
const tsoaPath = path.join(buildPath, 'api')
const appPath = path.join(buildPath, 'app')
const assetsPath = path.join(buildPath, 'assets')
const prebuildsPath = path.join(buildPath, 'prebuilds')
const rootPath = path.resolve(workspacePath, '../..')
const appSource = path.join(
  pnpapi.resolveToUnqualified('keepkey-desktop-app', workspacePath),
  'build',
)
const assetsSource = path.join(workspacePath, 'assets')

const sanitizeBuildDir = async () => {
  await fs.promises.rm(buildPath, { recursive: true, force: true })
  await fs.promises.mkdir(buildPath, { recursive: true })
}

const buildApi = async () => {
  await fs.promises.rm(tsoaPath, { recursive: true, force: true })
  await fs.promises.mkdir(tsoaPath, { recursive: true })

  await generateSpecAndRoutes({ json: true })
}

const collectDefines = async () => {
  const defines = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k, _]) =>
        ['NODE_DEBUG', 'NODE_ENV', 'LOG_LEVEL', 'DEBUG', 'PUBLIC_URL'].includes(k),
      )
      .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]),
  ) as Record<string, string>
  console.info('Embedded environment vars:', defines)
  return defines
}

const copyAppDir = async () => {
  await fs.promises.rm(appPath, { recursive: true, force: true })
  await fs.promises.mkdir(appPath, { recursive: true })

  await fs.promises.cp(appSource, appPath, {
    dereference: true,
    recursive: true,
  })
}

const copyAssetsDir = async () => {
  await fs.promises.rm(assetsPath, { recursive: true, force: true })
  await fs.promises.mkdir(assetsPath, { recursive: true })

  await fs.promises.cp(assetsSource, assetsPath, {
    dereference: true,
    recursive: true,
  })
}

const copyPrebuilds = async (packages: string[]) => {
  await fs.promises.rm(prebuildsPath, { recursive: true, force: true })
  await fs.promises.mkdir(prebuildsPath, { recursive: true })

  await Promise.all(
    packages.map(async x => {
      const prebuildsSource = pnpapi.resolveToUnqualified(`${x}/prebuilds`, workspacePath)
      const targetPath = path.join(prebuildsPath, x, 'prebuilds')
      await fs.promises.mkdir(targetPath, { recursive: true })
      await fs.promises.cp(prebuildsSource, targetPath, {
        dereference: true,
        recursive: true,
      })
    }),
  )
}

const usbPrebuildPlugin = async (): Promise<esbuild.Plugin> => {
  return {
    name: 'usb-prebuild-plugin',
    setup: async build => {
      build.onLoad({ filter: /usb[\\\/]dist[\\\/]usb[\\\/]bindings\.js$/ }, async args => {
        if (args.namespace !== 'file') return
        return {
          contents: `((__dirname)=>{\n${await fs.promises.readFile(args.path, {
            encoding: 'utf8',
          })}\n})(require('path').join(__dirname, 'prebuilds/usb/foo/bar'))`,
        }
      })
    },
  }
}

const runEsbuild = async (defines: Record<string, string>) => {
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
    plugins: await Promise.all([usbPrebuildPlugin()]),
    sourcemap: process.env.NODE_ENV === 'production' ? undefined : 'linked',
    legalComments: process.env.NODE_ENV === 'production' ? undefined : 'linked',
    minify: process.env.NODE_ENV === 'production',
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
    ),
  )

  await Promise.all([
    esbuild,
    copyPrebuilds(['usb']),
    copyAppDir(),
    copyAssetsDir(),
    esbuild.then(async x => {
      if (process.env.NODE_ENV !== 'production') {
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
