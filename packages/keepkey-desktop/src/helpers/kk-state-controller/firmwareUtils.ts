import type { KeepKeyHDWallet } from '@shapeshiftoss/hdwallet-keepkey'
import request from 'request-promise'

import type { AllFirmwareAndBootloaderData, FirmwareAndBootloaderData } from './types'

const FIRMWARE_BASE_URL =
  'https://raw.githubusercontent.com/keepkey/keepkey-desktop/master/firmware/'

const FIRMWARE_BASE_URL_BETA =
  'https://raw.githubusercontent.com/keepkey/keepkey-desktop/develop/firmware/'

export const downloadFirmware = async (path: string) => {
  try {
    let firmware = await request({
      url: FIRMWARE_BASE_URL + path,
      headers: {
        accept: 'application/octet-stream',
      },
      encoding: null,
    })

    //TODO validate
    //     const firmwareIsValid = !!body
    //         && body.slice(0x0000, 0x0004).toString() === 'KPKY' // check for 'magic' bytes
    //         && body.slice(0x0004, 0x0008).readUInt32LE() === body.length - 256 // check firmware length - metadata
    //         && body.slice(0x000B, 0x000C).readUInt8() & 0x01 // check that flag is not set to wipe device
    //     if(!firmwareIsValid) throw Error('Fetched data is not valid firmware')

    return firmware
  } catch (e) {
    console.error(e)
  }
}
export const loadFirmware = async (wallet: KeepKeyHDWallet, firmware: Buffer) => {
  if (!wallet) return
  await wallet.firmwareErase()
  const uploadResult = await wallet.firmwareUpload(firmware)
  return uploadResult
}

export const getAllFirmwareData = async () => {
  return (await (
    await fetch(new URL('releases.json', FIRMWARE_BASE_URL))
  ).json()) as AllFirmwareAndBootloaderData
}

export const getAllBetaFirmwareData = async () => {
  return (await (
    await fetch(new URL('releases.json', FIRMWARE_BASE_URL_BETA))
  ).json()) as AllFirmwareAndBootloaderData
}

export const getLatestFirmwareData = async () => {
  const allFirmwareData = await getAllFirmwareData()
  return { baseUrl: FIRMWARE_BASE_URL, result: allFirmwareData.latest as FirmwareAndBootloaderData }
}

export const getBetaFirmwareData = async () => {
  const allFirmwareData = await getAllBetaFirmwareData()
  return { baseUrl: FIRMWARE_BASE_URL, result: allFirmwareData.latest as FirmwareAndBootloaderData }
}
