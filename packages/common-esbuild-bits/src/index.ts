/// <reference types="node" />

import type * as esbuild from 'esbuild'
import escapeStringRegexp from 'escape-string-regexp'
import * as fs from 'fs'
import glob from 'glob'
import * as path from 'path'
import * as pnpapi from 'pnpapi'
import { promisify } from 'util'

export async function getWorkspaces(rootPath: string): Promise<{ name: string; path: string }[]> {
  const rootPackageJson = JSON.parse(
    await fs.promises.readFile(path.join(rootPath, 'package.json'), {
      encoding: 'utf8',
    }),
  )
  const workspaceGlobs: string[] = rootPackageJson.workspaces ?? []
  return (
    await Promise.all(
      workspaceGlobs.map(async workspaceGlob => {
        return await Promise.all(
          (
            await promisify(glob)(workspaceGlob, { cwd: rootPath })
          ).map(async workspacePath => {
            const workspacePackageJson = JSON.parse(
              await fs.promises.readFile(path.resolve(rootPath, workspacePath, 'package.json'), {
                encoding: 'utf8',
              }),
            )
            const workspaceName: string = workspacePackageJson.name
            return { name: workspaceName, path: path.resolve(rootPath, workspacePath) }
          }),
        )
      }),
    )
  ).flat()
}

export async function workspacePlugin(rootPath: string): Promise<esbuild.Plugin> {
  return {
    name: 'workspace-plugin',
    setup: async build => {
      const workspaces = await getWorkspaces(rootPath)
      // console.log('workspaces', workspaces)

      for (const { name } of workspaces) {
        build.onResolve(
          { filter: new RegExp(`^${escapeStringRegexp(name)}(\/.*)?`) },
          async args => {
            if (args.namespace !== 'file') return
            const path = pnpapi.resolveRequest(args.path, rootPath)!
            // console.log(`resolving ${args.path} to ${path}`)
            return {
              path,
            }
          },
        )
      }
    },
  }
}

export async function dirnamePlugin(
  dirnameRules: [filter: string, dirnameSuffix: string][],
): Promise<esbuild.Plugin> {
  return {
    name: 'dirname-plugin',
    setup: async build => {
      await Promise.all(
        dirnameRules.map(async ([filter, dirnameSuffix]) => {
          build.onLoad(
            {
              filter: new RegExp(`${filter}$`.replace('/', '[\\\\/]').replace('.', '\\.')),
            },
            async args => {
              if (args.namespace !== 'file') return
              return {
                contents: `((__dirname)=>{\n${await fs.promises.readFile(args.path, {
                  encoding: 'utf8',
                })}\n})(require('path').join(__dirname, '${dirnameSuffix}'))`,
              }
            },
          )
        }),
      )
    },
  }
}
