import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import { promises as fs } from 'fs'
import fetch from 'node-fetch'
import path from 'path'

import { settings } from '../../globalState'
import type { AllFirmwareAndBootloaderData, FirmwareAndBootloaderData } from './types'

const FIRMWARE_BASE_URL =
  'https://raw.githubusercontent.com/keepkey/keepkey-desktop/master/firmware/'

const FIRMWARE_BASE_URL_BETA =
  'https://raw.githubusercontent.com/keepkey/keepkey-desktop/develop/firmware/'

export const getFirmwareBaseUrl = async () => {
  return (await settings.allowBetaFirmware) ? FIRMWARE_BASE_URL_BETA : FIRMWARE_BASE_URL
}

export const downloadFirmware = async (baseUrl: string, url: string): Promise<Buffer> => {
  const firmware = Buffer.from(
    await (
      await fetch(new URL(url, baseUrl).toString(), {
        headers: {
          accept: 'application/octet-stream',
        },
      })
    ).arrayBuffer(),
  )

  //TODO validate
  //     const firmwareIsValid = !!body
  //         && body.slice(0x0000, 0x0004).toString() === 'KPKY' // check for 'magic' bytes
  //         && body.slice(0x0004, 0x0008).readUInt32LE() === body.length - 256 // check firmware length - metadata
  //         && body.slice(0x000B, 0x000C).readUInt8() & 0x01 // check that flag is not set to wipe device
  //     if(!firmwareIsValid) throw Error('Fetched data is not valid firmware')

  return firmware
}

export const loadFirmware = async (wallet: KeepKeyHDWallet, firmware: Buffer) => {
  if (!wallet) return
  await wallet.firmwareErase()
  const uploadResult = await wallet.firmwareUpload(firmware)
  return uploadResult
}

export const getAllFirmwareData = async (
  baseUrl: string,
): Promise<AllFirmwareAndBootloaderData> => {
  try {
    return (await (
      await fetch(new URL('releases.json', baseUrl).toString())
    ).json()) as AllFirmwareAndBootloaderData
  } catch (e) {
    console.warn('getAllFirmwareData error, using backup built-in manifest')
    return JSON.parse(await fs.readFile(path.join(__dirname, 'firmware/releases.json'), 'utf8'))
  }
}

export const getLatestFirmwareData = async (
  allFirmwareData: AllFirmwareAndBootloaderData,
): Promise<FirmwareAndBootloaderData> => {
  return allFirmwareData[(await settings.allowBetaFirmware) ? 'beta' : 'latest']
}
