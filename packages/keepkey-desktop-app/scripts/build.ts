import 'dotenv/config'

import * as fs from 'fs'
import * as path from 'path'
import * as esbuild from 'esbuild'
import stableStringify from 'fast-json-stable-stringify'
import * as ssri from 'ssri'
import { CID } from 'multiformats/cid'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import template from 'lodash/template'

process.env.NODE_DEBUG ??= ''
process.env.NODE_ENV ??= 'production'
process.env.LOG_LEVEL ??= ''
process.env.DEBUG ??= ''
process.env.PUBLIC_URL ??= '.'

if (process.env.REACT_APP_LOG_LEVEL && !process.env.LOG_LEVEL) {
  process.env.LOG_LEVEL = process.env.REACT_APP_LOG_LEVEL
}

const workspacePath = path.resolve(__dirname, '..')
const buildPath = path.join(workspacePath, 'build')
const rootPath = path.resolve(workspacePath, '../..')

const getSri = (target: string) => {
  const data = fs.readFileSync(path.join(buildPath, target))

  const sri = ssri
    .fromData(data, {
      strict: true,
      algorithms: ['sha256'],
    })
    .toString()

  return sri
}

const getCid = (target: string) => {
  const data = fs.readFileSync(path.join(buildPath, target))

  // The typings here are imprecise; sha256.digest() never returns a Promise.
  const digest = sha256.digest(data) as Awaited<ReturnType<typeof sha256['digest']>>
  const cid = CID.create(1, raw.code, digest).toString()

  return cid
}

const sanitizeBuildDir = async () => {
  await fs.promises.rm(buildPath, { recursive: true, force: true })
  await fs.promises.mkdir(buildPath)
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

const writeEnvJson = async () => {
  const envJson = Object.fromEntries(
    Object.entries(process.env)
      .filter(([k, v]) => k.startsWith('REACT_APP_') && v && v != '')
      .sort((a, b) => {
        // just so the printout is consistent
        if (a[0] < b[0]) return -1
        if (a[0] > b[0]) return 1
        return 0
      }),
  )
  console.log('env.json:', envJson)
  await fs.promises.writeFile(path.join(buildPath, '/env.json'), stableStringify(envJson), {
    encoding: 'utf8',
  })
}

const copyPublicDir = async () => {
  await fs.promises.cp(path.join(workspacePath, '/public'), buildPath, {
    dereference: true,
    recursive: true,
    filter: file => file != path.join(workspacePath, '/public/index.html'),
  })
}

const writeHeaders = async (headers: Record<string, string>) => {
  console.info('Headers:', headers)
  await fs.promises.writeFile(
    path.join(buildPath, '/_headers'),
    `/*\n${Object.entries(headers)
      .map(([k, v]) => `  ${k}: ${v}\n`)
      .join('')}`,
  )
}

const writeHtmlTemplate = async (cspMetaSerialized: string) => {
  await fs.promises.writeFile(
    path.join(buildPath, '/index.html'),
    template(
      await fs.promises.readFile(path.join(workspacePath, '/public/index.html'), {
        encoding: 'utf8',
      }),
    )({
      cspMeta: cspMetaSerialized,
      getSri,
      getCid,
      publicUrl: process.env.PUBLIC_URL ?? '',
      referrer: process.env.REACT_APP_REFERRER ?? 'no-referrer',
    }),
    { encoding: 'utf8' },
  )
}

const nodePolyfillPlugin = async (): Promise<esbuild.Plugin> => ({
  name: 'custom-node-polyfills',
  setup: async build => {
    build.onResolve({ filter: /^crypto$/ }, async () => ({
      path: require.resolve('crypto-browserify'),
    }))
    build.onResolve({ filter: /^stream$/ }, async () => ({
      path: require.resolve('stream-browserify'),
    }))
    build.onResolve({ filter: /^http$/ }, async () => ({
      path: require.resolve('stream-http'),
    }))
    build.onResolve({ filter: /^https$/ }, async () => ({
      path: require.resolve('https-browserify'),
    }))
    build.onResolve({ filter: /^path$/ }, async () => ({
      path: require.resolve('path-browserify'),
    }))
    build.onResolve({ filter: /^zlib$/ }, async () => ({
      path: require.resolve('browserify-zlib'),
    }))
  },
})

const assetResolverPlugin = async (): Promise<esbuild.Plugin> => {
  const filter = /\.(png|svg|jpg)$/g
  const name = 'asset-resolver-plugin'
  const namespace = `${name}-namespace`
  const bypass = `bypass-${name}`

  const cache: Record<string, any> = {}
  return {
    name,
    setup: async build => {
      build.onResolve({ filter }, async args => {
        if (args.pluginData?.namespace === namespace || args.pluginData?.[bypass] === true) {
          return
        }
        cache[args.path] ??= build.resolve(args.path, {
          resolveDir: args.resolveDir,
          namespace: 'file',
          kind: 'import-statement',
          pluginData: {
            [bypass]: true,
          },
        })
        const result = await cache[args.path]
        if (result.errors.length > 0) {
          return { errors: result.errors }
        }
        return {
          path: path.relative(workspacePath, result.path),
          namespace,
          pluginData: {
            resolveDir: args.resolveDir,
          },
        }
      })
      build.onLoad({ filter }, async (args: any) => {
        if (args.namespace === namespace) {
          return {
            contents: `
import relativeAssetUrl from "${path.resolve(workspacePath, args.path)}";
const out = new URL(relativeAssetUrl, import.meta.url).toString();
export default out;
            `,
            resolveDir: args.pluginData.resolveDir,
            pluginData: { [bypass]: true },
          }
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
    external: ['/public/*', 'electron', 'pnpapi'],
    loader: {
      '.png': 'file',
      '.svg': 'file',
      '.jpg': 'file',
      '.mp3': 'file',
      '.wav': 'file',
    },
    entryPoints: [path.join(workspacePath, '/src/loader.ts')],
    plugins: await Promise.all([nodePolyfillPlugin(), assetResolverPlugin()]),
    sourcemap: process.env.NODE_ENV === 'production' ? undefined : 'linked',
    legalComments: process.env.NODE_ENV === 'production' ? undefined : 'linked',
    minify: process.env.NODE_ENV === 'production',
    format: 'esm',
    splitting: true,
    assetNames: 'static/media/[name].[hash]',
    charset: 'utf8',
    jsx: 'automatic',
    metafile: true,
    chunkNames: 'static/js/[hash].chunk',
    define: defines,
    target: 'es2020',
    treeShaking: true,
  })
}

;(async () => {
  const headersImport = import('../headers')

  const cspMeta = headersImport.then(({ getCspMeta }) => getCspMeta())
  const cspMetaSerialized = Promise.all([headersImport, cspMeta]).then(
    ([{ serializeCsp }, cspMeta]) => {
      console.info('Meta CSP:', cspMeta)
      return serializeCsp(cspMeta)
    },
  )

  await sanitizeBuildDir()

  const esbuild = Promise.all([collectDefines()]).then(([defines]) => runEsbuild(defines))

  await Promise.all([
    cspMetaSerialized,
    esbuild,
    copyPublicDir(),
    writeEnvJson(),
    headersImport.then(({ headers }) => writeHeaders(headers)),
  ]).then(([cspMetaSerialized]) => writeHtmlTemplate(cspMetaSerialized))

  await fs.promises.writeFile(
    path.join(buildPath, 'metafile.json'),
    JSON.stringify((await esbuild).metafile, null, 2),
  )
})().catch(err => console.error(err))
