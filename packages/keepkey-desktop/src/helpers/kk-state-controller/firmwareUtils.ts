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

export const getAllFirmwareData = () =>
  new Promise<AllFirmwareAndBootloaderData>((resolve, reject) => {
    request(`${FIRMWARE_BASE_URL}releases.json`, (err: any, _response: unknown, body: any) => {
      if (err) return reject(err)
      resolve(JSON.parse(body))
    })
  })

export const getAllBetaFirmwareData = () =>
  new Promise<AllFirmwareAndBootloaderData>((resolve, reject) => {
    request(`${FIRMWARE_BASE_URL_BETA}releases.json`, (err: any, _response: unknown, body: any) => {
      if (err) return reject(err)
      resolve(JSON.parse(body))
    })
  })

export const getLatestFirmwareData = () =>
  new Promise<FirmwareAndBootloaderData>(async resolve => {
    const allFirmwareData = await getAllFirmwareData()
    resolve(allFirmwareData.latest)
  })

export const getBetaFirmwareData = () =>
  new Promise<FirmwareAndBootloaderData>(async resolve => {
    const allFirmwareData = await getAllBetaFirmwareData()
    resolve(allFirmwareData.beta)
  })
